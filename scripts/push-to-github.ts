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
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
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

// Files/folders to exclude from upload
const excludePatterns = [
  'node_modules',
  '.git',
  '.cache',
  'dist',
  '.replit',
  'replit.nix',
  '.upm',
  '.config',
  'attached_assets',
  '*.log',
  '.env',
  '.env.*',
  'GlycoGuide-iOS.zip',
  'tmp',
  '/tmp',
];

function shouldExclude(filePath: string): boolean {
  const normalizedPath = filePath.replace(/\\/g, '/');
  for (const pattern of excludePatterns) {
    if (pattern.startsWith('*.')) {
      const ext = pattern.slice(1);
      if (normalizedPath.endsWith(ext)) return true;
    } else if (normalizedPath.includes(`/${pattern}/`) || normalizedPath.startsWith(`${pattern}/`) || normalizedPath === pattern) {
      return true;
    }
  }
  return false;
}

function getAllFiles(dirPath: string, arrayOfFiles: string[] = [], basePath: string = ''): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const relativePath = basePath ? `${basePath}/${file}` : file;
    
    if (shouldExclude(relativePath)) {
      return;
    }

    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles, relativePath);
    } else {
      arrayOfFiles.push(relativePath);
    }
  });

  return arrayOfFiles;
}

async function main() {
  try {
    const octokit = await getUncachableGitHubClient();
    const { data: user } = await octokit.users.getAuthenticated();
    const owner = user.login;
    const repo = 'glycoguide-app';
    
    console.log(`Pushing files to ${owner}/${repo}...`);
    
    // Get all files
    const projectDir = '/home/runner/workspace';
    const allFiles = getAllFiles(projectDir);
    
    console.log(`Found ${allFiles.length} files to upload`);
    
    // Create blobs for all files
    const tree: { path: string; mode: '100644' | '100755' | '040000' | '160000' | '120000'; type: 'blob' | 'tree' | 'commit'; sha: string }[] = [];
    
    let uploadedCount = 0;
    for (const filePath of allFiles) {
      try {
        const fullPath = path.join(projectDir, filePath);
        const content = fs.readFileSync(fullPath);
        const base64Content = content.toString('base64');
        
        const { data: blob } = await octokit.git.createBlob({
          owner,
          repo,
          content: base64Content,
          encoding: 'base64',
        });
        
        tree.push({
          path: filePath,
          mode: '100644',
          type: 'blob',
          sha: blob.sha,
        });
        
        uploadedCount++;
        if (uploadedCount % 50 === 0) {
          console.log(`Uploaded ${uploadedCount}/${allFiles.length} files...`);
        }
      } catch (error: any) {
        console.error(`Error uploading ${filePath}:`, error.message);
      }
    }
    
    console.log(`Creating tree with ${tree.length} files...`);
    
    // Create tree
    const { data: newTree } = await octokit.git.createTree({
      owner,
      repo,
      tree,
    });
    
    // Create commit
    const { data: commit } = await octokit.git.createCommit({
      owner,
      repo,
      message: 'Initial commit - GlycoGuide Diabetes Management Platform',
      tree: newTree.sha,
    });
    
    // Update main branch reference
    try {
      await octokit.git.updateRef({
        owner,
        repo,
        ref: 'heads/main',
        sha: commit.sha,
        force: true,
      });
    } catch {
      // If main doesn't exist, create it
      await octokit.git.createRef({
        owner,
        repo,
        ref: 'refs/heads/main',
        sha: commit.sha,
      });
    }
    
    console.log(`\n✓ Successfully pushed ${tree.length} files to GitHub!`);
    console.log(`Repository URL: https://github.com/${owner}/${repo}`);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
