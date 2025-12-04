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

async function generateTrinidadCallalooImage() {
  const timestamp = Date.now();
  const filename = `Trinidad_Callaloo_Low_GI_No_Sweet_Potato_${timestamp}.png`;
  
  console.log("🎨 Generating Trinidad Callaloo soup image...");
  
  const prompt = `Professional food photography of authentic Trinidad Callaloo soup in pristine white ceramic bowl, DENSE THICK dark forest green consistency, authentic Caribbean callaloo leaves (spinach) as dominant base ingredient creating rich dark green color, fresh okra rounds visibly floating and sliced showing white interior with green exterior, small diced bell pepper flecks in red and green colors scattered throughout, creamy coconut milk creating subtle sheen on surface, NO orange sweet potatoes NO yams NO pumpkin WHATSOEVER, thick hearty soup consistency not watery, traditional Caribbean presentation, professional food styling on clean white background, shallow depth of field, natural lighting highlighting the deep green color and texture, ultra-realistic 8K food photography, suitable for health platform, diabetes-friendly low glycemic ingredients only, authentic Trinidad style preparation, rich wooden table surface, steam rising gently from hot soup, spoon beside bowl, garnish of fresh herbs, professional culinary photography quality`;

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
    });

    const imageUrl = response.data[0].url;
    const savedPath = await downloadImage(imageUrl, filename);
    
    console.log("✅ Trinidad Callaloo image generated successfully!");
    return { filename, savedPath };
    
  } catch (error) {
    console.error("❌ Error generating Trinidad Callaloo image:", error);
    throw error;
  }
}

async function generateSorrelDrinkImage() {
  const timestamp = Date.now();
  const filename = `Caribbean_Sorrel_Mistletoe_Holiday_${timestamp}.png`;
  
  console.log("🎨 Generating Traditional Caribbean Sorrel drink image...");
  
  const prompt = `Professional food photography of traditional Caribbean sorrel drink in elegant crystal glass, rich deep burgundy red color with natural foam, beautifully garnished with cinnamon stick and fresh orange peel, featuring a delicate sprig of fresh mistletoe with vibrant green leaves and white berries hanging gracefully above the glass, surrounded by warm winter spices like star anise and whole cloves arranged artistically on rich wooden table surface, golden warm lighting creating magical celebratory atmosphere, elegant burgundy and gold silk ribbon nearby, soft sparkly fairy lights in background creating enchanting holiday ambiance, ultra-realistic 8K quality food photography, shallow depth of field, steam gently rising from the warm drink, mistletoe as prominent festive focal point, inclusive seasonal celebration mood, warm amber and gold color palette, professional culinary photography suitable for health platform, no Christmas symbols, universal holiday appeal, festive yet sophisticated presentation`;

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
    });

    const imageUrl = response.data[0].url;
    const savedPath = await downloadImage(imageUrl, filename);
    
    console.log("✅ Caribbean Sorrel drink image generated successfully!");
    return { filename, savedPath };
    
  } catch (error) {
    console.error("❌ Error generating Sorrel drink image:", error);
    throw error;
  }
}

async function main() {
  console.log("🚀 Starting image generation for GlycoGuide modified low-GI recipes...");
  
  try {
    // Generate all 4 modified recipe images
    console.log("\n📸 Generating modified recipe images with exact filenames...");
    
    const almondBitesResult = await generateAlmondEnergyBitesImage();
    const berryBlendResult = await generateAntioxidantBerryBlendImage();
    const berryMixResult = await generateAntioxidantBerryMixImage();
    const empanadasResult = await generateArgentinianEmpanadasImage();
    
    console.log("\n🎉 ALL MODIFIED RECIPE IMAGES GENERATED SUCCESSFULLY!");
    console.log("📁 Almond Energy Bites:", almondBitesResult.savedPath);
    console.log("📁 Antioxidant Berry Blend:", berryBlendResult.savedPath);
    console.log("📁 Antioxidant Berry Mix:", berryMixResult.savedPath);
    console.log("📁 Argentinian Empanadas:", empanadasResult.savedPath);
    
    return {
      almondBites: almondBitesResult,
      berryBlend: berryBlendResult,
      berryMix: berryMixResult,
      empanadas: empanadasResult
    };
    
  } catch (error) {
    console.error("❌ Generation failed:", error);
    process.exit(1);
  }
}

async function generateElegantSorrelCocktailImage() {
  const timestamp = Date.now();
  const filename = `Caribbean_Sorrel_Elegant_Cocktail_Style_${timestamp}.png`;
  
  console.log("🎨 Generating Elegant Cocktail-Style Caribbean Sorrel drink image...");
  
  const prompt = `Professional bar-quality food photography of elegant Caribbean sorrel cocktail in sophisticated crystal coupe glass, rich deep burgundy red color with natural foam, beautifully spiced rim with golden cinnamon sugar coating, vibrant red hibiscus flower floating gracefully on top as primary garnish, fresh rosemary sprig and orange peel twist artfully arranged, served on polished dark marble bar surface with warm ambient golden lighting, sophisticated upscale presentation suitable for premium health platform, restaurant-quality styling, shallow depth of field with bokeh background, steam delicately rising from the warm spiced drink, traditional Caribbean sorrel essence elevated to cocktail elegance, professional culinary photography, ultra-realistic 8K quality, diabetes-friendly healthy beverage presentation, luxury bar atmosphere, sophisticated garnish arrangement with visual depth, warm color palette emphasizing deep burgundy liquid against elegant glassware`;

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
    });

    const imageUrl = response.data[0].url;
    const savedPath = await downloadImage(imageUrl, filename);
    
    console.log("✅ Elegant Cocktail-Style Sorrel image generated successfully!");
    return { filename, savedPath };
    
  } catch (error) {
    console.error("❌ Error generating Elegant Sorrel cocktail image:", error);
    throw error;
  }
}

async function generateAlmondEnergyBitesImage() {
  const filename = `Almond_energy_bites_dates_coconut_no_sugar_2f8a5c3d.png`;
  
  console.log("🎨 Generating Almond Energy Bites image...");
  
  const prompt = `Professional food photography of homemade almond energy bites arranged on elegant white ceramic plate, round bite-sized balls with visible whole almonds and almond pieces throughout, minimal dark dates showing only as small binding specks, generous coconut flakes coating the exterior creating textural contrast, natural golden-brown color from almonds, NO added sugar visible, clean minimalist presentation, shallow depth of field with soft natural lighting, ultra-realistic 8K food photography, diabetes-friendly low glycemic snack, rustic wooden table surface, some loose almonds and coconut flakes artfully scattered around plate, professional culinary styling suitable for health platform, warm ambient lighting highlighting the natural textures, emphasis on whole food ingredients, bite marks in one energy ball showing dense almond-rich interior, suitable for diabetic meal planning app`;

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
    });

    const imageUrl = response.data[0].url;
    const savedPath = await downloadImage(imageUrl, filename);
    
    console.log("✅ Almond Energy Bites image generated successfully!");
    return { filename, savedPath };
    
  } catch (error) {
    console.error("❌ Error generating Almond Energy Bites image:", error);
    throw error;
  }
}

async function generateAntioxidantBerryBlendImage() {
  const filename = `Antioxidant_berry_blend_low_gi_berries_6b4e9a1f.png`;
  
  console.log("🎨 Generating Antioxidant Berry Blend image...");
  
  const prompt = `Professional food photography of vibrant antioxidant berry blend in pristine white ceramic bowl, colorful mix of fresh blueberries, blackberries, and raspberries as dominant ingredients, tiny black chia seeds visibly scattered throughout creating textural contrast, minimal goji berries showing only as small orange-red accents, emphasis on fresh local berries, rich purple and deep blue color palette, natural morning lighting highlighting berry skins, ultra-realistic 8K food photography, diabetes-friendly low glycemic superfood blend, rustic wooden table surface, few loose berries artfully arranged around bowl, professional culinary styling suitable for health platform, shallow depth of field, steam or morning dew effect on berries, focus on fiber-rich ingredients, suitable for diabetic meal planning app, antioxidant-rich presentation`;

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
    });

    const imageUrl = response.data[0].url;
    const savedPath = await downloadImage(imageUrl, filename);
    
    console.log("✅ Antioxidant Berry Blend image generated successfully!");
    return { filename, savedPath };
    
  } catch (error) {
    console.error("❌ Error generating Antioxidant Berry Blend image:", error);
    throw error;
  }
}

async function generateAntioxidantBerryMixImage() {
  const filename = `Antioxidant_berry_mix_high_fiber_berries_9c7d2a5e.png`;
  
  console.log("🎨 Generating Antioxidant Berry Mix image...");
  
  const prompt = `Professional food photography of high-fiber antioxidant berry mix in elegant white porcelain bowl, fresh strawberries as dominant ingredient showing bright red color and natural texture, blackberries as secondary component creating rich dark purple contrast, minimal blueberries serving as accent, visible hemp hearts scattered throughout providing nutty texture and protein, emphasis on fiber-rich strawberry and blackberry combination, natural morning lighting creating beautiful berry shine, ultra-realistic 8K food photography, diabetes-friendly low glycemic superfood mix, rustic wooden table surface, few loose strawberries and hemp hearts artfully arranged around bowl, professional culinary styling suitable for health platform, shallow depth of field, fresh organic appearance, focus on high-fiber content, suitable for diabetic meal planning app`;

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
    });

    const imageUrl = response.data[0].url;
    const savedPath = await downloadImage(imageUrl, filename);
    
    console.log("✅ Antioxidant Berry Mix image generated successfully!");
    return { filename, savedPath };
    
  } catch (error) {
    console.error("❌ Error generating Antioxidant Berry Mix image:", error);
    throw error;
  }
}

async function generateArgentinianEmpanadasImage() {
  const filename = `Argentinian_empanadas_whole_grain_pastry_vegetables_2a8f4c6d.png`;
  
  console.log("🎨 Generating Argentinian Empanadas image...");
  
  const prompt = `Professional food photography of authentic Argentinian empanadas made with almond flour pastry, golden-brown crescent-shaped pastries with visible almond flour texture creating slightly rougher surface than wheat flour, traditional crimped edges, one empanada cut open revealing savory beef filling with diced onions, bell peppers, and herbs, rich brown meat filling contrasting with golden almond flour crust, NO wheat flour texture, diabetes-friendly whole grain appearance, arranged on rustic wooden board, professional food styling with warm ambient lighting, ultra-realistic 8K food photography, shallow depth of field, traditional Argentine presentation suitable for health platform, emphasis on gluten-free almond flour pastry, steam rising from fresh-baked empanadas, suitable for diabetic meal planning app, authentic South American cuisine adapted for low glycemic diet`;

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
    });

    const imageUrl = response.data[0].url;
    const savedPath = await downloadImage(imageUrl, filename);
    
    console.log("✅ Argentinian Empanadas image generated successfully!");
    return { filename, savedPath };
    
  } catch (error) {
    console.error("❌ Error generating Argentinian Empanadas image:", error);
    throw error;
  }
}

async function generateBBQRibsImage() {
  const filename = `BBQ_ribs_sugar_free_sauce_low_carb_sides_7b2e9a5f.png`;
  
  console.log("🎨 Generating BBQ Ribs with sugar-free sauce image...");
  
  const prompt = `Professional food photography of succulent BBQ pork spare ribs with glossy caramelized sugar-free barbecue sauce glaze, perfectly charred and grilled texture, rich mahogany and deep brown color from monk fruit sweetened sauce, beautifully plated on elegant white ceramic plate, accompanied by colorful low-carb roasted vegetables including asparagus spears, bell pepper strips in red and yellow, and roasted Brussels sprouts as healthy sides, NO bread NO french fries NO high-carb sides, emphasis on diabetes-friendly presentation, steam rising from hot ribs showing tender meat pulling from bone, professional food styling on rustic wooden table surface, shallow depth of field with warm ambient lighting, ultra-realistic 8K food photography, restaurant-quality plating, natural lighting highlighting the caramelized glaze and char marks, suitable for health platform, emphasizing sugar-free barbecue sauce coating, low glycemic meal presentation, garnished with fresh herbs like rosemary, professional culinary photography showcasing healthy BBQ alternative for diabetic meal planning`;

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
    });

    const imageUrl = response.data[0].url;
    const savedPath = await downloadImage(imageUrl, filename);
    
    console.log("✅ BBQ Ribs image generated successfully!");
    return { filename, savedPath };
    
  } catch (error) {
    console.error("❌ Error generating BBQ Ribs image:", error);
    throw error;
  }
}

// Export for use in other scripts
export { generateTrinidadCallalooImage, generateSorrelDrinkImage, generateElegantSorrelCocktailImage, generateAlmondEnergyBitesImage, generateAntioxidantBerryBlendImage, generateAntioxidantBerryMixImage, generateArgentinianEmpanadasImage, generateBBQRibsImage };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}