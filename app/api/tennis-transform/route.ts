import { NextRequest, NextResponse } from 'next/server';
import { openai, getRandomTennisAction, type PersonAnalysis } from '@/lib/openai';
import { toFile } from 'openai';

export const maxDuration = 180; // 3 minutes

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
          content: "You are an expert at analyzing people in photos. Provide detailed physical descriptions in Spanish."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analiza detalladamente a la persona en esta foto y proporciona una descripción en formato JSON con los siguientes campos:
              - age: edad aproximada (ej: "25-30 años")
              - gender: género ("masculino" o "femenino")
              - skinTone: tono de piel detallado
              - hairColor: color de cabello
              - hairStyle: estilo de cabello
              - facialFeatures: rasgos faciales distintivos
              - bodyType: complexión física
              - height: altura aproximada ("alto", "medio", "bajo")
              - distinctiveFeatures: características distintivas únicas`
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
    
    // Create a more specific prompt that emphasizes using the original person's face
    const imagePrompt = `Transform this exact person into a professional tennis player. CRITICAL: Keep the EXACT same face, facial features, and identity of the original person. 

Original person details:
- ${personAnalysis.gender === 'femenino' ? 'Female' : 'Male'}, ${personAnalysis.age}
- Skin tone: ${personAnalysis.skinTone}
- Hair: ${personAnalysis.hairColor}, ${personAnalysis.hairStyle}
- Face: ${personAnalysis.facialFeatures}
- Body type: ${personAnalysis.bodyType}
- Distinctive features: ${personAnalysis.distinctiveFeatures}

TRANSFORM TO:
- Action: ${action}
- Outfit: Professional tennis attire (${personAnalysis.gender === 'femenino' ? 'tennis dress or skirt' : 'tennis shorts'} with athletic top, vibrant professional colors)
- Location: Professional tennis court with blue hard court surface, stadium lighting
- Style: High-quality sports photography, sharp focus on athlete

CRITICAL REQUIREMENTS:
1. Use the EXACT SAME FACE from the original photo - no changes to facial features
2. Maintain all facial characteristics, skin tone, and distinctive features
3. Only change: clothing, background, pose, and add tennis equipment
4. The person must be 100% recognizable as the same individual
5. Photo-realistic quality matching professional tennis photography`;

    console.log('Generating tennis image with identity preservation...');

    // First, we need to convert the base64 image to a Buffer
    const base64Data = image.split(',')[1];
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Try using the edit endpoint with the original image
    try {
      
      // Use OpenAI's toFile helper to create a File-like object
      const imageFile = await toFile(imageBuffer, 'original.png', { type: 'image/png' });
      
      // Use the edit endpoint which better preserves the original image
      const imageResponse = await openai.images.edit({
        model: "gpt-image-1",
        image: imageFile,
        prompt: imagePrompt,
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
      
      // Last resort: Use generation with a very specific prompt
      const imageResponse = await openai.images.generate({
        model: "gpt-image-1",
        prompt: `${imagePrompt}\n\nCRITICAL: Base this on a ${personAnalysis.age} ${personAnalysis.gender} with ${personAnalysis.skinTone} skin, ${personAnalysis.hairColor} ${personAnalysis.hairStyle} hair, ${personAnalysis.facialFeatures}. ${personAnalysis.distinctiveFeatures}`,
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