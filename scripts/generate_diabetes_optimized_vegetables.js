import OpenAI from "openai";
import fs from "fs";
import fetch from "node-fetch";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function downloadImage(url, filename) {
  const response = await fetch(url);
  const buffer = await response.buffer();
  
  if (!fs.existsSync('attached_assets/generated_images')) {
    fs.mkdirSync('attached_assets/generated_images', { recursive: true });
  }
  
  fs.writeFileSync(`attached_assets/generated_images/${filename}`, buffer);
  console.log(`✅ Image saved: attached_assets/generated_images/${filename}`);
  return `attached_assets/generated_images/${filename}`;
}

async function generateVegetableBarleySoupImage() {
  const timestamp = Date.now();
  const filename = `Diabetes_Optimized_Vegetable_Barley_Soup_${timestamp}.png`;
  
  console.log("🎨 Generating Diabetes-Optimized Vegetable Barley Soup image...");
  
  const prompt = `Professional food photography of diabetes-optimized vegetable barley soup in pristine white ceramic bowl, featuring REDUCED pearl barley portions creating lighter consistency, minimal diced carrots for lower glycemic impact, vibrant dark green chopped kale leaves prominently displayed throughout the broth, fresh spinach leaves wilted into the soup, green beans and celery visible, rich tomato-based broth with golden olive oil sheen, EMPHASIS on the abundant dark leafy greens showing diabetes-friendly modifications, steam rising gently from hot soup, wooden spoon beside bowl, garnish of fresh herbs, clean white background, shallow depth of field, natural lighting highlighting the enhanced green vegetable content, ultra-realistic 8K food photography suitable for medical diabetes platform, professional culinary presentation emphasizing nutrient-dense vegetables over grains`;

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
    
    console.log("✅ Diabetes-Optimized Vegetable Barley Soup image generated successfully!");
    return { filename, savedPath, url: imageUrl };
    
  } catch (error) {
    console.error("❌ Error generating Vegetable Barley Soup image:", error);
    throw error;
  }
}

async function generateDiabetesOptimizedBreakfastImage() {
  const timestamp = Date.now();
  const filename = `Diabetes_Optimized_Vegetable_Breakfast_${timestamp}.png`;
  
  console.log("🎨 Generating Diabetes-Optimized Vegetable Breakfast image...");
  
  const prompt = `Professional food photography of diabetes-optimized vegetable breakfast featuring cauliflower breakfast hash as centerpiece, golden sautéed cauliflower florets replacing high-carb ingredients, vibrant diced bell peppers in red and yellow colors, fresh zucchini pieces, caramelized onions, NO SWEET POTATOES visible, fresh herbs scattered throughout, two perfectly cooked eggs with runny yolks on top, served on elegant white plate, almond flour tortilla or large collard green leaves artfully arranged on side as low-carb wrap alternatives, fresh avocado slices for healthy fats, garnish of fresh parsley and thyme, clean white background, shallow depth of field, natural morning lighting, ultra-realistic 8K food photography suitable for medical diabetes platform, professional presentation emphasizing low-glycemic vegetables and alternative wraps`;

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
    
    console.log("✅ Diabetes-Optimized Vegetable Breakfast image generated successfully!");
    return { filename, savedPath, url: imageUrl };
    
  } catch (error) {
    console.error("❌ Error generating Vegetable Breakfast image:", error);
    throw error;
  }
}

async function main() {
  console.log("🚀 Starting diabetes-optimized vegetable image generation...");
  
  try {
    // Generate both images simultaneously
    const [soupResult, breakfastResult] = await Promise.all([
      generateVegetableBarleySoupImage(),
      generateDiabetesOptimizedBreakfastImage()
    ]);

    console.log("\n🎉 ALL IMAGES GENERATED SUCCESSFULLY!");
    console.log("\n📋 SUMMARY:");
    console.log("=" * 50);
    
    console.log(`\n1. VEGETABLE BARLEY SOUP (Diabetes-Optimized):`);
    console.log(`   📁 Filename: ${soupResult.filename}`);
    console.log(`   💾 Path: ${soupResult.savedPath}`);
    console.log(`   🌐 URL: ${soupResult.url}`);
    console.log(`   ✅ Features: Reduced barley, minimal carrots, prominent kale, diabetes-friendly presentation`);
    
    console.log(`\n2. VEGETABLE BREAKFAST (Diabetes-Optimized):`);
    console.log(`   📁 Filename: ${breakfastResult.filename}`);
    console.log(`   💾 Path: ${breakfastResult.savedPath}`);
    console.log(`   🌐 URL: ${breakfastResult.url}`);
    console.log(`   ✅ Features: Cauliflower hash, no sweet potatoes, low-carb wrap alternatives`);

    console.log(`\n📊 DIABETES OPTIMIZATION FEATURES:`);
    console.log(`✅ Emphasized low-glycemic vegetables (kale, cauliflower)`);
    console.log(`✅ Reduced high-carb ingredients (barley, sweet potatoes)`);
    console.log(`✅ Professional medical platform presentation`);
    console.log(`✅ Suitable for diabetes management platforms`);
    console.log(`✅ Enhanced visual focus on diabetes-friendly modifications`);
    
    console.log(`\n🔄 NEXT STEPS:`);
    console.log(`1. Update database with new image paths`);
    console.log(`2. Verify all recipe modifications are complete`);
    console.log(`3. Run final diabetes compliance verification`);
    
    return { soup: soupResult, breakfast: breakfastResult };
    
  } catch (error) {
    console.error("❌ Error in main execution:", error);
    throw error;
  }
}

// Execute the image generation
main()
  .then(results => {
    console.log("🎯 Diabetes-optimized vegetable image generation completed successfully!");
  })
  .catch(error => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });