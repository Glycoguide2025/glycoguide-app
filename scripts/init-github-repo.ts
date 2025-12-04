import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;
  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

// Files to include (essential project files only)
const essentialDirs = [
  'client',
  'server', 
  'shared',
  'ios_app',
  'android_app',
  'scripts',
  'drizzle',
];

const essentialFiles = [
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'vite.config.ts',
  'tailwind.config.ts',
  'postcss.config.js',
  'drizzle.config.ts',
  'index.html',
  '.gitignore',
  'replit.md',
];

const excludePatterns = [
  'node_modules',
  '.git',
  '.cache',
  'dist',
  '.replit',
  'replit.nix',
  '.upm',
  '.config',
  '.local',
  'attached_assets',
  '*.log',
  '.env',
  '.env.*',
  '*.zip',
  'tmp',
  '*.bin',
  '*.jks',
];

function shouldExclude(filePath: string): boolean {
  for (const pattern of excludePatterns) {
    if (pattern.startsWith('*.')) {
      const ext = pattern.slice(1);
      if (filePath.endsWith(ext)) return true;
    } else if (filePath.includes(`/${pattern}/`) || filePath.startsWith(`${pattern}/`) || filePath === pattern || filePath.includes(`${pattern}`)) {
      return true;
    }
  }
  return false;
}

function getAllFiles(dirPath: string, arrayOfFiles: string[] = [], basePath: string = ''): string[] {
  try {
    const files = fs.readdirSync(dirPath);
    files.forEach((file) => {
      const fullPath = path.join(dirPath, file);
      const relativePath = basePath ? `${basePath}/${file}` : file;
      
      if (shouldExclude(relativePath)) return;

      try {
        if (fs.statSync(fullPath).isDirectory()) {
          getAllFiles(fullPath, arrayOfFiles, relativePath);
        } else {
          arrayOfFiles.push(relativePath);
        }
      } catch (e) {
        // Skip files we can't read
      }
    });
  } catch (e) {
    // Skip directories we can't read
  }
  return arrayOfFiles;
}

async function main() {
  try {
    const octokit = await getUncachableGitHubClient();
    const { data: user } = await octokit.users.getAuthenticated();
    const owner = user.login;
    const repo = 'glycoguide-app';
    
    console.log(`Preparing files for ${owner}/${repo}...`);
    
    const projectDir = '/home/runner/workspace';
    const allFiles: string[] = [];
    
    // Get files from essential directories
    for (const dir of essentialDirs) {
      const dirPath = path.join(projectDir, dir);
      if (fs.existsSync(dirPath)) {
        getAllFiles(dirPath, allFiles, dir);
      }
    }
    
    // Add essential root files
    for (const file of essentialFiles) {
      const filePath = path.join(projectDir, file);
      if (fs.existsSync(filePath) && !shouldExclude(file)) {
        allFiles.push(file);
      }
    }
    
    console.log(`Found ${allFiles.length} files to upload`);
    
    // Create initial README to initialize repo
    console.log('Initializing repository with README...');
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: 'README.md',
      message: 'Initial commit',
      content: Buffer.from('# GlycoGuide\n\nDiabetes Management Platform\n').toString('base64'),
    });
    
    // Now upload files in batches
    const tree: { path: string; mode: '100644'; type: 'blob'; sha: string }[] = [];
    let uploaded = 0;
    
    for (const filePath of allFiles) {
      try {
        const fullPath = path.join(projectDir, filePath);
        const content = fs.readFileSync(fullPath);
        
        // Skip very large files (>5MB)
        if (content.length > 5 * 1024 * 1024) {
          console.log(`Skipping large file: ${filePath}`);
          continue;
        }
        
        const { data: blob } = await octokit.git.createBlob({
          owner,
          repo,
          content: content.toString('base64'),
          encoding: 'base64',
        });
        
        tree.push({
          path: filePath,
          mode: '100644',
          type: 'blob',
          sha: blob.sha,
        });
        
        uploaded++;
        if (uploaded % 25 === 0) {
          console.log(`Uploaded ${uploaded}/${allFiles.length} files...`);
        }
      } catch (error: any) {
        console.error(`Error uploading ${filePath}: ${error.message}`);
      }
    }
    
    console.log(`Creating commit with ${tree.length} files...`);
    
    // Get current main branch ref
    const { data: ref } = await octokit.git.getRef({
      owner,
      repo,
      ref: 'heads/main',
    });
    
    // Create new tree based on existing commit
    const { data: newTree } = await octokit.git.createTree({
      owner,
      repo,
      base_tree: ref.object.sha,
      tree,
    });
    
    // Create commit
    const { data: commit } = await octokit.git.createCommit({
      owner,
      repo,
      message: 'Add GlycoGuide source code',
      tree: newTree.sha,
      parents: [ref.object.sha],
    });
    
    // Update main branch
    await octokit.git.updateRef({
      owner,
      repo,
      ref: 'heads/main',
      sha: commit.sha,
    });
    
    console.log(`\n✓ Successfully pushed ${tree.length} files to GitHub!`);
    console.log(`Repository URL: https://github.com/${owner}/${repo}`);
    
  } catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
