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

    // Skip analysis - we'll use the image directly
    console.log('Using image directly for transformation...');

    // Get random action
    const action = getRandomTennisAction();
    
    // Direct prompt for edit - keep everything about the person
    const editPrompt = `Keep this EXACT person with their EXACT clothes. Only add: ${action} pose, tennis racquet in hand, tennis court background. DO NOT change the person or their clothing AT ALL. The intended effect is for the person uploading the photo to think WOW, that is me!`;

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
            action: action,
            method: 'variation'
          });
        }
      } catch (varError) {
        console.log('Variation also failed');
        // No more fallbacks - we only use visual reference
        throw new Error('Could not transform image while preserving identity');
      }
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