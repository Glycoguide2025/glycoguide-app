import OpenAI from "openai";

/*
Mistletoe-themed Caribbean Sorrel Drink Image Generation
Creates an inclusive holiday-themed image featuring mistletoe as the main festive decoration
*/

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Image generation for mistletoe-themed holiday sorrel drink
async function generateMistletoeSorrelImage() {
  const mistletoeHolidayPrompt = `Professional food photography of traditional Caribbean sorrel drink in elegant crystal glass, rich deep burgundy red color with natural foam, beautifully garnished with cinnamon stick and fresh orange peel, featuring a delicate sprig of fresh mistletoe with vibrant green leaves and white berries hanging gracefully above the glass, surrounded by warm winter spices like star anise and whole cloves arranged artistically on rich wooden table surface, golden warm lighting creating magical celebratory atmosphere, elegant burgundy and gold silk ribbon nearby, soft sparkly fairy lights in background creating enchanting holiday ambiance, ultra-realistic 8K quality food photography, shallow depth of field, steam gently rising from the warm drink, mistletoe as prominent festive focal point, inclusive seasonal celebration mood, warm amber and gold color palette, professional culinary photography suitable for health platform, no Christmas symbols, universal holiday appeal, festive yet sophisticated presentation`;

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: mistletoeHolidayPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    console.log("Generated mistletoe sorrel image URL:", response.data[0].url);
    return { url: response.data[0].url };
  } catch (error) {
    console.error("Error generating mistletoe sorrel image:", error);
    throw error;
  }
}

// Run the image generation
generateMistletoeSorrelImage()
  .then(result => {
    console.log("Success! Mistletoe-themed Caribbean sorrel image generated at:", result.url);
    console.log("\nNext steps:");
    console.log("1. Download this image from the URL above");
    console.log("2. Save as: attached_assets/generated_images/Caribbean_Sorrel_Mistletoe_Holiday.png");
    console.log("3. Update the meal database with new image URL");
    console.log("\nImage features:");
    console.log("- Traditional Caribbean sorrel drink in elegant glass");
    console.log("- Fresh mistletoe with green leaves and white berries as main festive element");
    console.log("- Authentic Caribbean garnishes (cinnamon stick, orange peel)");
    console.log("- Warm winter spices (star anise, cloves)");
    console.log("- Inclusive holiday atmosphere with golden lighting");
    console.log("- Professional food photography quality");
  })
  .catch(error => {
    console.error("Failed to generate mistletoe sorrel image:", error);
  });