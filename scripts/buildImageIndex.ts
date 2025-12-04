// Build searchable index of all available recipe images
import { writeFileSync } from 'fs';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { ImageOntology } from './lib/imageOntology.js';

interface ImageIndexEntry {
  filename: string;
  fullPath: string;
  tokens: string[];
  categories: string[];
  size?: number;
}

export class ImageIndexBuilder {
  private imageDir: string;
  private index: ImageIndexEntry[] = [];

  constructor(imageDir: string = '../attached_assets/generated_images') {
    this.imageDir = imageDir;
  }

  async buildIndex(): Promise<ImageIndexEntry[]> {
    console.log(`🔍 Scanning images in ${this.imageDir}...`);
    
    try {
      const files = await readdir(this.imageDir);
      const imageFiles = files.filter(file => 
        file.toLowerCase().endsWith('.png') || 
        file.toLowerCase().endsWith('.jpg') || 
        file.toLowerCase().endsWith('.jpeg')
      );

      console.log(`📸 Found ${imageFiles.length} image files`);

      for (const filename of imageFiles) {
        const tokens = this.extractTokensFromFilename(filename);
        const categories = this.detectCategories(filename, tokens);
        
        this.index.push({
          filename,
          fullPath: `/${this.imageDir}/${filename}`,
          tokens,
          categories
        });
      }

      console.log(`✅ Indexed ${this.index.length} images successfully`);
      return this.index;

    } catch (error) {
      console.error(`❌ Error scanning image directory:`, error);
      throw error;
    }
  }

  private extractTokensFromFilename(filename: string): string[] {
    // Remove file extension and hash/ID suffixes
    const cleanName = filename
      .replace(/\.[^.]+$/, '') // Remove extension
      .replace(/_[a-f0-9]{8,}$/, '') // Remove hash suffix like _c703225f
      .replace(/_\d{13,}$/, ''); // Remove timestamp suffix
    
    return ImageOntology.tokenize(cleanName);
  }

  private detectCategories(filename: string, tokens: string[]): string[] {
    const categories: string[] = [];
    const lowerFilename = filename.toLowerCase();

    // Detect meal categories from filename patterns
    if (lowerFilename.includes('breakfast') || lowerFilename.includes('morning')) {
      categories.push('breakfast');
    }
    if (lowerFilename.includes('lunch') || lowerFilename.includes('salad') || lowerFilename.includes('wrap')) {
      categories.push('lunch');
    }
    if (lowerFilename.includes('dinner') || lowerFilename.includes('stir') || lowerFilename.includes('curry')) {
      categories.push('dinner');
    }
    if (lowerFilename.includes('snack') || lowerFilename.includes('bites') || lowerFilename.includes('energy')) {
      categories.push('snack');
    }
    if (lowerFilename.includes('dessert') || lowerFilename.includes('ice_cream') || lowerFilename.includes('mousse')) {
      categories.push('dessert');
    }
    if (lowerFilename.includes('smoothie') || lowerFilename.includes('juice') || lowerFilename.includes('drink')) {
      categories.push('beverage');
    }

    // Detect food types from tokens
    if (tokens.some(t => ['pizza', 'flatbread'].includes(t))) categories.push('pizza');
    if (tokens.some(t => ['bowl', 'buddha', 'grain'].includes(t))) categories.push('bowl');
    if (tokens.some(t => ['soup', 'broth', 'stew'].includes(t))) categories.push('soup');
    if (tokens.some(t => ['salad', 'greens', 'lettuce'].includes(t))) categories.push('salad');

    return categories.length > 0 ? categories : ['general'];
  }

  saveIndex(outputPath: string = './data/image-index.json'): void {
    try {
      writeFileSync(outputPath, JSON.stringify(this.index, null, 2));
      console.log(`💾 Image index saved to ${outputPath}`);
    } catch (error) {
      console.error(`❌ Error saving index:`, error);
      throw error;
    }
  }
}

// CLI runner
async function main() {
  const builder = new ImageIndexBuilder();
  
  try {
    await builder.buildIndex();
    builder.saveIndex();
    console.log(`🎉 Image indexing complete!`);
  } catch (error) {
    console.error(`💥 Indexing failed:`, error);
    process.exit(1);
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}