import OpenAI from "openai";
import fs from "fs";
import fetch from "node-fetch";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function downloadImage(url, filename) {
  const response = await fetch(url);
  const buffer = await response.buffer();
  
  // Ensure the directory exists
  if (!fs.existsSync('attached_assets/generated_images')) {
    fs.mkdirSync('attached_assets/generated_images', { recursive: true });
  }
  
  fs.writeFileSync(`attached_assets/generated_images/${filename}`, buffer);
  console.log(`✅ Image saved: attached_assets/generated_images/${filename}`);
  return `attached_assets/generated_images/${filename}`;
}

async function generateElegantSorrelImage() {
  const timestamp = Date.now();
  const filename = `Caribbean_Sorrel_Elegant_Cocktail_Style_${timestamp}.png`;
  
  console.log("🎨 Generating elegant Caribbean sorrel drink image...");
  
  const prompt = `Professional cocktail photography of elegant Caribbean sorrel drink in sophisticated crystal coupe glass, rich deep burgundy red color with natural foam, spiced rim coating with golden cinnamon sugar, beautiful red hibiscus flower floating gracefully on top as primary garnish, fresh rosemary sprig and orange peel twist artfully arranged, polished dark marble bar surface with warm ambient golden lighting, restaurant-quality styling suitable for premium health platform, shallow depth of field with bokeh background for professional presentation, ultra-realistic 8K quality with culinary photography standards, warm color palette, sophisticated upscale atmosphere, luxury bar presentation, steam delicately rising from warm spiced drink, traditional Caribbean authenticity elevated to cocktail elegance`;

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
    });

    const imageUrl = response.data[0].url;
    console.log("📥 Downloading image from:", imageUrl);
    
    const savedPath = await downloadImage(imageUrl, filename);
    
    // Verify the file was saved
    if (fs.existsSync(savedPath)) {
      console.log("✅ File verified to exist at:", savedPath);
    } else {
      throw new Error("File was not saved successfully");
    }
    
    console.log("✅ Elegant sorrel image generated successfully!");
    return { filename, savedPath };
    
  } catch (error) {
    console.error("❌ Error generating elegant sorrel image:", error);
    throw error;
  }
}

// Run the generation
generateElegantSorrelImage()
  .then(result => {
    console.log("🎉 SUCCESS! Generated:", result.filename);
    console.log("📁 Location:", result.savedPath);
  })
  .catch(error => {
    console.error("💥 FAILED:", error);
    process.exit(1);
  });