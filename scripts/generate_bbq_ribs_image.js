import { generateBBQRibsImage } from './generate_recipe_images.js';

async function main() {
  console.log("🚀 Starting BBQ Ribs image generation...");
  
  try {
    const result = await generateBBQRibsImage();
    
    console.log("\n🎉 BBQ RIBS IMAGE GENERATED SUCCESSFULLY!");
    console.log("📁 Image saved at:", result.savedPath);
    console.log("📄 Filename:", result.filename);
    
    return result;
    
  } catch (error) {
    console.error("❌ Generation failed:", error);
    process.exit(1);
  }
}

// Run the generation
main();