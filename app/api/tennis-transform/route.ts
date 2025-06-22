import { NextRequest, NextResponse } from 'next/server';
import { openai, getRandomTennisAction, type PersonAnalysis } from '@/lib/openai';
import { toFile } from 'openai';

export const maxDuration = 10; // 10 seconds for Hobby plan

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Step 1: Analyze the person using GPT-4 Vision
    console.log('Analyzing person with GPT-4V...');
    
    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at analyzing people in photos. Provide EXTREMELY detailed physical descriptions in Spanish. Capture every single detail about the person's appearance."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analiza MUY detalladamente a la persona en esta foto. Proporciona una descripción COMPLETA en formato JSON:
              - age: edad exacta aproximada (ej: "25 años")
              - gender: género ("masculino" o "femenino")
              - skinTone: tono de piel muy específico (ej: "piel clara con subtono rosado")
              - hairColor: color exacto del cabello (ej: "castaño oscuro con reflejos dorados")
              - hairStyle: estilo detallado (ej: "largo hasta los hombros, liso con flequillo lateral")
              - facialFeatures: TODOS los rasgos faciales (forma de cara, ojos, nariz, boca, cejas, pómulos, mentón)
              - bodyType: complexión específica (ej: "delgada, hombros estrechos, contextura pequeña")
              - height: altura estimada en metros (ej: "1.65m aproximadamente")
              - distinctiveFeatures: TODAS las características únicas (lunares, pecas, forma de sonrisa, etc.)`
            },
            {
              type: "image_url",
              image_url: {
                url: image,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const personAnalysis = JSON.parse(
      analysisResponse.choices[0].message.content || '{}'
    ) as PersonAnalysis;

    console.log('Person analyzed:', personAnalysis);

    // Step 2: Generate tennis image with gpt-image-1 using a more specific prompt
    const action = getRandomTennisAction();
    
    // Create an ultra-specific prompt for the edit endpoint
    const editPrompt = `Take this EXACT person and dress them as a tennis player. 

INSTRUCTIONS:
- Keep the SAME person - same face, same body, same age, same everything
- ONLY change their clothes to tennis attire
- ONLY change the background to a tennis court
- Add a tennis racquet to their hand
- Action: ${action}

DO NOT CHANGE:
- The person's face AT ALL
- Their body type or proportions
- Their hair style or color
- Their skin tone
- Their age or gender
- Any physical features

This must be the IDENTICAL person, just wearing tennis clothes on a tennis court.`;

    console.log('Generating tennis image with identity preservation...');

    // Try using the edit endpoint with the original image
    try {
      // First, we need to convert the base64 image to a Buffer
      const base64Data = image.split(',')[1];
      const imageBuffer = Buffer.from(base64Data, 'base64');
      
      // Use OpenAI's toFile helper to create a File-like object
      const imageFile = await toFile(imageBuffer, 'original.png', { type: 'image/png' });
      
      // Use the edit endpoint with a very specific prompt about preserving identity
      const imageResponse = await openai.images.edit({
        model: "gpt-image-1",
        image: imageFile,
        prompt: editPrompt,
        n: 1,
        size: "1024x1024"
      });
      
      console.log('Image edited successfully');
      
      // If edit fails, fall back to generation with enhanced prompt
      if (!imageResponse || !imageResponse.data || imageResponse.data.length === 0) {
        throw new Error('Edit failed, trying generation');
      }
      
      // Check if we have b64_json or url
      const imageData = imageResponse.data[0];
      let generatedImageUrl: string;

      if (imageData.b64_json) {
        // Convert base64 to data URL
        generatedImageUrl = `data:image/png;base64,${imageData.b64_json}`;
        console.log('Image generated as base64');
      } else if (imageData.url) {
        generatedImageUrl = imageData.url;
        console.log('Image generated with URL');
      } else {
        console.error('No image data found:', imageData);
        throw new Error('No image was generated');
      }
      
      return NextResponse.json({
        success: true,
        imageUrl: generatedImageUrl,
        analysis: personAnalysis,
        action: action
      });
      
    } catch (editError) {
      console.log('Edit endpoint failed, trying generation with reference image...');
      
      // Fallback: Try variation endpoint which might preserve more of the original
      console.log('Trying variation endpoint...');
      
      // For variations, we need the original image
      const variationFile = await toFile(imageBuffer, 'original.png', { type: 'image/png' });
      
      try {
        const variationResponse = await openai.images.createVariation({
          model: "gpt-image-1",
          image: variationFile,
          n: 1,
          size: "1024x1024"
        });
        
        if (variationResponse && variationResponse.data && variationResponse.data.length > 0) {
          const varImageData = variationResponse.data[0];
          let varImageUrl: string;
          
          if (varImageData.b64_json) {
            varImageUrl = `data:image/png;base64,${varImageData.b64_json}`;
          } else if (varImageData.url) {
            varImageUrl = varImageData.url;
          } else {
            throw new Error('No variation data');
          }
          
          return NextResponse.json({
            success: true,
            imageUrl: varImageUrl,
            analysis: personAnalysis,
            action: action,
            method: 'variation'
          });
        }
      } catch (varError) {
        console.log('Variation failed, using generation as last resort');
      }
      
      // Last resort: Use generation with ultra-detailed description
      const detailedPrompt = `Professional tennis player photo of a ${personAnalysis.gender === 'femenino' ? 'woman' : 'man'} with THESE EXACT features:

PHYSICAL DESCRIPTION (MUST MATCH EXACTLY):
- Age: ${personAnalysis.age}
- Skin: ${personAnalysis.skinTone}
- Hair: ${personAnalysis.hairColor}, ${personAnalysis.hairStyle}
- Face: ${personAnalysis.facialFeatures}
- Body: ${personAnalysis.bodyType}
- Height: ${personAnalysis.height}
- Unique features: ${personAnalysis.distinctiveFeatures}

TENNIS SCENE:
- Action: ${action}
- Wearing: Professional tennis attire
- Setting: Tennis court with blue hard court
- Style: Professional sports photography

This person must look EXACTLY like the description above. Every detail must match perfectly.`;

      const imageResponse = await openai.images.generate({
        model: "gpt-image-1",
        prompt: detailedPrompt,
        n: 1,
        size: "1024x1024",
        quality: "high"
      });

      // Log the entire response to debug
      console.log('Fallback Image API Response:', JSON.stringify(imageResponse, null, 2));

      // Validate response structure
      if (!imageResponse || !imageResponse.data || imageResponse.data.length === 0) {
        console.error('Invalid image response:', imageResponse);
        throw new Error('No image data in response');
      }

      // Check if we have b64_json or url
      const imageData = imageResponse.data[0];
      let generatedImageUrl: string;

      if (imageData.b64_json) {
        // Convert base64 to data URL
        generatedImageUrl = `data:image/png;base64,${imageData.b64_json}`;
        console.log('Image generated as base64');
      } else if (imageData.url) {
        generatedImageUrl = imageData.url;
        console.log('Image generated with URL');
      } else {
        console.error('No image data found:', imageData);
        throw new Error('No image was generated');
      }

      return NextResponse.json({
        success: true,
        imageUrl: generatedImageUrl,
        analysis: personAnalysis,
        action: action,
        method: 'generation' // Indicate which method was used
      });
    }

  } catch (error) {
    console.error('Error in tennis transform:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        error: 'Failed to transform image',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}