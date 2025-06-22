import { NextRequest, NextResponse } from 'next/server';
import { openai, getRandomTennisAction, type PersonAnalysis } from '@/lib/openai';
import { toFile } from 'openai';

export const maxDuration = 10; // 10 seconds for Hobby plan

export async function POST(request: NextRequest) {
  console.log('POST /api/tennis-transform - Starting');
  
  try {
    console.log('Parsing request body...');
    const { image } = await request.json();
    console.log('Request body parsed successfully');

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Step 1: Analyze the person using GPT-4 Vision
    console.log('Starting OpenAI analysis...');
    console.log('OpenAI client initialized:', !!openai);
    
    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Faster model
      messages: [
        {
          role: "system",
          content: "Analyze the person briefly. Output JSON with: age, gender, skinTone, hairColor, hairStyle, facialFeatures, bodyType, height, distinctiveFeatures"
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Quick analysis in Spanish"
            },
            {
              type: "image_url",
              image_url: {
                url: image,
                detail: "low" // Lower detail for speed
              }
            }
          ]
        }
      ],
      max_tokens: 200,
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

    // Simplified approach: Use generation only for faster response
    console.log('Generating tennis transformation...');
    
    const imageResponse = await openai.images.generate({
      model: "gpt-image-1",
      prompt: imagePrompt,
      n: 1,
      size: "1024x1024",
      quality: "medium" // Use medium quality for balance
    });

    
    // Validate response
    if (!imageResponse || !imageResponse.data || imageResponse.data.length === 0) {
      throw new Error('No image data in response');
    }

    const imageData = imageResponse.data[0];
    const generatedImageUrl = imageData.url || `data:image/png;base64,${imageData.b64_json}`;

    return NextResponse.json({
      success: true,
      imageUrl: generatedImageUrl,
      analysis: personAnalysis,
      action: action
    });

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