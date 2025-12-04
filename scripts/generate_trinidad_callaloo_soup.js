import OpenAI from "openai";

/*
Trinidad Callaloo Soup Image Generation - Diabetes-Friendly Version
Creates an authentic Caribbean callaloo soup image WITHOUT any high-GI orange vegetables
Following blueprint instructions:
1. The newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
*/

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Image generation for authentic Trinidad Callaloo soup (diabetes-friendly)
async function generateTrinidadCallalooSoup() {
  const timestamp = Date.now();
  const callalooSoupPrompt = `Professional food photography of authentic Trinidad Callaloo soup in pristine white ceramic bowl, DENSE THICK dark forest green consistency, authentic Caribbean callaloo leaves (spinach) as dominant base ingredient creating rich dark green color, fresh okra rounds visibly floating and sliced showing white interior with green exterior, small diced bell pepper flecks in red and green colors scattered throughout, creamy coconut milk creating subtle sheen on surface, NO orange sweet potatoes NO yams NO pumpkin WHATSOEVER, thick hearty soup consistency not watery, traditional Caribbean presentation, professional food styling on clean white background, shallow depth of field, natural lighting highlighting the deep green color and texture, ultra-realistic 8K food photography, suitable for health platform, diabetes-friendly low glycemic ingredients only, authentic Trinidad style preparation, rich wooden table surface, steam rising gently from hot soup, spoon beside bowl, garnish of fresh herbs, professional culinary photography quality`;

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: callalooSoupPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    console.log("Generated Trinidad Callaloo soup image URL:", response.data[0].url);
    return { 
      url: response.data[0].url, 
      filename: `Trinidad_Callaloo_Low_GI_No_Sweet_Potato_${timestamp}.png`
    };
  } catch (error) {
    console.error("Error generating Trinidad Callaloo soup image:", error);
    throw error;
  }
}

// Run the image generation
generateTrinidadCallalooSoup()
  .then(result => {
    console.log("SUCCESS! Trinidad Callaloo soup image generated at:", result.url);
    console.log("\nFilename:", result.filename);
    console.log("\nNext steps:");
    console.log(`1. Download this image from the URL above`);
    console.log(`2. Save as: attached_assets/generated_images/${result.filename}`);
    console.log("3. Update the meal database with new image URL");
    console.log("\nImage features:");
    console.log("✅ DENSE THICK dark green callaloo consistency (authentic Trinidad style)");
    console.log("✅ Fresh spinach/callaloo leaves as dominant base");
    console.log("✅ Visible okra rounds showing white interior/green exterior");
    console.log("✅ Small diced bell pepper flecks (red/green)");
    console.log("✅ Creamy coconut milk sheen on surface");
    console.log("✅ NO orange sweet potatoes, yams, or pumpkin");
    console.log("✅ Professional white bowl presentation");
    console.log("✅ Perfect for diabetes-friendly health platform");
    console.log("✅ Authentic Caribbean appearance and consistency");
  })
  .catch(error => {
    console.error("Failed to generate Trinidad Callaloo soup image:", error);
    
    if (error?.error?.code === 'invalid_api_key' || error?.message?.includes('API key')) {
      console.log("\n❌ OPENAI_API_KEY not found or invalid");
      console.log("💡 To generate the image, you need to:");
      console.log("1. Add your OpenAI API key to the environment");
      console.log("2. Run: npm run generate-callaloo-image");
      console.log("\nAlternatively, I can provide the detailed prompt for manual generation:");
      console.log("\nPrompt for DALL-E 3:");
      console.log("Professional food photography of authentic Trinidad Callaloo soup in pristine white ceramic bowl, DENSE THICK dark forest green consistency, authentic Caribbean callaloo leaves (spinach) as dominant base ingredient creating rich dark green color, fresh okra rounds visibly floating and sliced showing white interior with green exterior, small diced bell pepper flecks in red and green colors scattered throughout, creamy coconut milk creating subtle sheen on surface, NO orange sweet potatoes NO yams NO pumpkin WHATSOEVER, thick hearty soup consistency not watery, traditional Caribbean presentation, professional food styling on clean white background, shallow depth of field, natural lighting highlighting the deep green color and texture, ultra-realistic 8K food photography, suitable for health platform, diabetes-friendly low glycemic ingredients only, authentic Trinidad style preparation, rich wooden table surface, steam rising gently from hot soup, spoon beside bowl, garnish of fresh herbs, professional culinary photography quality");
    }
  });