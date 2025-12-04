import OpenAI from "openai";

/*
Follow these instructions when using this blueprint:
1. Note that the newest OpenAI model is "gpt-5", not "gpt-4o" or "gpt-4". gpt-5 was released August 7, 2025 after your knowledge cutoff. Always prefer using gpt-5 as it is the latest model.
2. The newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
*/

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Image generation for inclusive holiday sorrel drink
async function generateInclusiveHolidaySorrelImage() {
  const inclusiveHolidayPrompt = `Professional food photography of traditional Caribbean sorrel drink in elegant crystal glass, rich deep burgundy red color, beautifully garnished with cinnamon stick and fresh orange peel, surrounded by warm winter spices like star anise and whole cloves arranged artistically, golden warm lighting creating celebratory atmosphere, elegant burgundy and gold silk ribbon bow nearby, seasonal winter garland made of gold berries and warm amber-colored leaves, soft sparkly fairy lights in background creating magical holiday ambiance, ultra-realistic 8K quality, shallow depth of field, rich wooden table surface, inclusive holiday celebration mood, no Christmas symbols, universal festive elements, professional culinary photography suitable for health platform, warm golden hour lighting, steam gently rising from the drink, festive but not specifically Christmas-themed`;

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: inclusiveHolidayPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    console.log("Generated image URL:", response.data[0].url);
    return { url: response.data[0].url };
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

// Run the image generation
generateInclusiveHolidaySorrelImage()
  .then(result => {
    console.log("Success! Image generated at:", result.url);
    console.log("Next steps:");
    console.log("1. Download this image");
    console.log("2. Save as attached_assets/generated_images/Traditional_Caribbean_Sorrel_Inclusive_Holiday.png");
    console.log("3. Update the database with new image URL");
  })
  .catch(error => {
    console.error("Failed to generate image:", error);
  });