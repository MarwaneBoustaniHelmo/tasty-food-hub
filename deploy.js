#!/usr/bin/env node

/**
 * AUTOMATED DEPLOYMENT SCRIPT FOR TASTY FOOD HUB
 * Deploys React Vite build to Hostinger via FTP
 * 
 * Usage: node deploy.js
 * 
 * Requirements:
 * - Node.js 18+
 * - npm packages: basic-ftp, dotenv, chalk
 * - .env.deploy file with FTP credentials
 */

import { Client } from 'basic-ftp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';
import chalk from 'chalk';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.deploy
dotenv.config({ path: path.join(__dirname, '.env.deploy') });

// Configuration
const CONFIG = {
  FTP_HOST: process.env.FTP_HOST || '72.60.93.15',
  FTP_USER: process.env.FTP_USER || 'u487930812_tastyfood.me',
  FTP_PASS: process.env.FTP_PASS,
  FTP_REMOTE_PATH: process.env.FTP_REMOTE_PATH || '/public_html/dist',
  DOMAIN: process.env.DOMAIN || 'https://tastyfood.me',
  LOCAL_DIST: path.join(__dirname, 'dist'),
  MAX_RETRIES: 3,
  TIMEOUT: 30000
};

// Deployment state tracking
const deploymentLog = {
  startTime: new Date(),
  steps: [],
  errors: [],
  warnings: []
};

/**
 * Log deployment step with timestamp
 */
function logStep(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const logEntry = { timestamp, message, type };
  deploymentLog.steps.push(logEntry);
  
  const icon = {
    info: '→',
    success: '✓',
    error: '✗',
    warning: '⚠'
  }[type];
  
  const color = {
    info: chalk.blue,
    success: chalk.green,
    error: chalk.red,
    warning: chalk.yellow
  }[type];
  
  console.log(color(`${icon} [${new Date().toLocaleTimeString()}] ${message}`));
}

/**
 * Build the Vite project
 */
async function buildProject() {
  logStep('Building Vite project...', 'info');
  
  try {
    const { stdout, stderr } = await execAsync('npm run build', {
      cwd: __dirname,
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    });
    
    if (stderr && !stderr.includes('warning')) {
      deploymentLog.warnings.push(stderr);
      logStep(`Build warnings: ${stderr}`, 'warning');
    }
    
    logStep('Build completed successfully', 'success');
    return true;
  } catch (error) {
    logStep(`Build failed: ${error.message}`, 'error');
    deploymentLog.errors.push(error.message);
    throw error;
  }
}

/**
 * Verify dist folder structure
 */
async function verifyDistFolder() {
  logStep('Verifying dist/ folder structure...', 'info');
  
  try {
    const distExists = await fs.access(CONFIG.LOCAL_DIST).then(() => true).catch(() => false);
    if (!distExists) {
      throw new Error('dist/ folder not found');
    }
    
    const files = await fs.readdir(CONFIG.LOCAL_DIST);
    const requiredFiles = ['index.html', 'assets'];
    const missingFiles = requiredFiles.filter(file => !files.includes(file));
    
    if (missingFiles.length > 0) {
      throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
    }
    
    // Check for nested dist/dist/ error
    if (files.includes('dist')) {
      logStep('WARNING: Nested dist/dist/ detected - this will cause issues!', 'warning');
      deploymentLog.warnings.push('Nested dist folder detected');
    }
    
    logStep(`Found ${files.length} files/folders in dist/`, 'success');
    return true;
  } catch (error) {
    logStep(`Dist verification failed: ${error.message}`, 'error');
    deploymentLog.errors.push(error.message);
    throw error;
  }
}

/**
 * Connect to FTP server with retry logic
 */
async function connectFTP(client, attempt = 1) {
  try {
    logStep(`Connecting to FTP server (attempt ${attempt}/${CONFIG.MAX_RETRIES})...`, 'info');
    
    await client.access({
      host: CONFIG.FTP_HOST,
      user: CONFIG.FTP_USER,
      password: CONFIG.FTP_PASS,
      secure: false,
      timeout: CONFIG.TIMEOUT
    });
    
    logStep('FTP connection established', 'success');
    return true;
  } catch (error) {
    if (attempt < CONFIG.MAX_RETRIES) {
      logStep(`Connection failed, retrying in 3s...`, 'warning');
      await new Promise(resolve => setTimeout(resolve, 3000));
      return connectFTP(client, attempt + 1);
    }
    throw error;
  }
}

/**
 * Clear remote directory
 */
async function clearRemoteDirectory(client) {
  logStep('Clearing old files from remote directory...', 'info');
  
  try {
    // Try to access remote path
    try {
      await client.cd(CONFIG.FTP_REMOTE_PATH);
    } catch (error) {
      logStep('Remote dist/ folder does not exist, will be created', 'warning');
      await client.ensureDir(CONFIG.FTP_REMOTE_PATH);
      await client.cd(CONFIG.FTP_REMOTE_PATH);
      logStep('Created remote dist/ folder', 'success');
      return;
    }
    
    // List and remove files
    const list = await client.list();
    let deletedCount = 0;
    
    for (const item of list) {
      try {
        if (item.isDirectory) {
          await client.removeDir(item.name);
        } else {
          await client.remove(item.name);
        }
        deletedCount++;
      } catch (error) {
        logStep(`Failed to delete ${item.name}: ${error.message}`, 'warning');
        deploymentLog.warnings.push(`Failed to delete ${item.name}`);
      }
    }
    
    logStep(`Cleared ${deletedCount} items from remote directory`, 'success');
  } catch (error) {
    logStep(`Error clearing directory: ${error.message}`, 'error');
    deploymentLog.errors.push(error.message);
    throw error;
  }
}

/**
 * Upload directory recursively
 */
async function uploadDirectory(client, localPath, remotePath) {
  const files = await fs.readdir(localPath, { withFileTypes: true });
  let uploadedCount = 0;
  
  for (const file of files) {
    const localFilePath = path.join(localPath, file.name);
    const remoteFilePath = remotePath + '/' + file.name;
    
    if (file.isDirectory()) {
      try {
        await client.ensureDir(remoteFilePath);
        await client.cd(remoteFilePath);
        uploadedCount += await uploadDirectory(client, localFilePath, remoteFilePath);
        await client.cd('..');
      } catch (error) {
        logStep(`Failed to upload directory ${file.name}: ${error.message}`, 'warning');
        deploymentLog.warnings.push(`Failed to upload directory ${file.name}`);
      }
    } else {
      try {
        await client.uploadFrom(localFilePath, file.name);
        uploadedCount++;
        
        // Log progress for large files
        const stats = await fs.stat(localFilePath);
        if (stats.size > 1024 * 1024) { // > 1MB
          logStep(`Uploaded ${file.name} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`, 'info');
        }
      } catch (error) {
        logStep(`Failed to upload ${file.name}: ${error.message}`, 'warning');
        deploymentLog.warnings.push(`Failed to upload ${file.name}`);
      }
    }
  }
  
  return uploadedCount;
}

/**
 * Upload all files to remote server
 */
async function uploadFiles(client) {
  logStep('Uploading files to remote server...', 'info');
  
  try {
    await client.cd(CONFIG.FTP_REMOTE_PATH);
    const uploadedCount = await uploadDirectory(client, CONFIG.LOCAL_DIST, '.');
    logStep(`Successfully uploaded ${uploadedCount} files`, 'success');
    return uploadedCount;
  } catch (error) {
    logStep(`Upload failed: ${error.message}`, 'error');
    deploymentLog.errors.push(error.message);
    throw error;
  }
}

/**
 * Verify remote structure
 */
async function verifyRemoteStructure(client) {
  logStep('Verifying remote file structure...', 'info');
  
  try {
    await client.cd(CONFIG.FTP_REMOTE_PATH);
    const list = await client.list();
    
    const requiredItems = ['index.html', 'assets'];
    const foundItems = list.map(item => item.name);
    const missingItems = requiredItems.filter(item => !foundItems.includes(item));
    
    if (missingItems.length > 0) {
      throw new Error(`Missing required items on remote: ${missingItems.join(', ')}`);
    }
    
    // Check assets folder
    await client.cd('assets');
    const assetsList = await client.list();
    const hasJS = assetsList.some(f => f.name.endsWith('.js'));
    const hasCSS = assetsList.some(f => f.name.endsWith('.css'));
    
    if (!hasJS || !hasCSS) {
      throw new Error('Assets folder missing JS or CSS files');
    }
    
    logStep('Remote structure verified successfully', 'success');
    logStep(`Assets: ${assetsList.length} files (JS: ${hasJS}, CSS: ${hasCSS})`, 'info');
    
    return true;
  } catch (error) {
    logStep(`Verification failed: ${error.message}`, 'error');
    deploymentLog.errors.push(error.message);
    throw error;
  }
}

/**
 * Generate deployment report
 */
function generateReport() {
  const endTime = new Date();
  const duration = ((endTime - deploymentLog.startTime) / 1000).toFixed(2);
  
  console.log('\n' + chalk.bold('═'.repeat(60)));
  console.log(chalk.bold.cyan('          DEPLOYMENT REPORT'));
  console.log(chalk.bold('═'.repeat(60)) + '\n');
  
  console.log(chalk.bold('Timeline:'));
  console.log(`  Start:    ${deploymentLog.startTime.toLocaleString()}`);
  console.log(`  End:      ${endTime.toLocaleString()}`);
  console.log(`  Duration: ${duration}s\n`);
  
  console.log(chalk.bold('Summary:'));
  console.log(`  Steps:    ${deploymentLog.steps.length}`);
  console.log(`  Errors:   ${deploymentLog.errors.length}`);
  console.log(`  Warnings: ${deploymentLog.warnings.length}\n`);
  
  if (deploymentLog.errors.length > 0) {
    console.log(chalk.bold.red('Errors:'));
    deploymentLog.errors.forEach(error => {
      console.log(chalk.red(`  ✗ ${error}`));
    });
    console.log();
  }
  
  if (deploymentLog.warnings.length > 0) {
    console.log(chalk.bold.yellow('Warnings:'));
    deploymentLog.warnings.forEach(warning => {
      console.log(chalk.yellow(`  ⚠ ${warning}`));
    });
    console.log();
  }
  
  console.log(chalk.bold('Access your site:'));
  console.log(chalk.cyan(`  ${CONFIG.DOMAIN}\n`));
  
  console.log(chalk.bold('═'.repeat(60)) + '\n');
  
  // Save report to file
  const reportPath = path.join(__dirname, `deployment-report-${Date.now()}.json`);
  fs.writeFile(reportPath, JSON.stringify(deploymentLog, null, 2))
    .then(() => logStep(`Report saved to ${path.basename(reportPath)}`, 'info'))
    .catch(() => {});
}

/**
 * Main deployment function
 */
async function deploy() {
  console.log(chalk.bold.cyan('\n🚀 Starting deployment to Hostinger...\n'));
  
  // Validate credentials
  if (!CONFIG.FTP_PASS) {
    logStep('FTP password not found in .env.deploy', 'error');
    console.log(chalk.yellow('\nPlease create .env.deploy file with:'));
    console.log(chalk.yellow('FTP_PASS=your_ftp_password\n'));
    process.exit(1);
  }
  
  const client = new Client();
  client.ftp.verbose = false; // Set to true for debugging
  
  try {
    // Step 1: Build project
    await buildProject();
    
    // Step 2: Verify dist folder
    await verifyDistFolder();
    
    // Step 3: Connect to FTP
    await connectFTP(client);
    
    // Step 4: Clear remote directory
    await clearRemoteDirectory(client);
    
    // Step 5: Upload files
    const uploadedCount = await uploadFiles(client);
    
    // Step 6: Verify remote structure
    await verifyRemoteStructure(client);
    
    // Success!
    console.log('\n' + chalk.bold.green('✓ DEPLOYMENT SUCCESSFUL!') + '\n');
    logStep(`Deployed ${uploadedCount} files to ${CONFIG.DOMAIN}`, 'success');
    
  } catch (error) {
    console.log('\n' + chalk.bold.red('✗ DEPLOYMENT FAILED!') + '\n');
    logStep(`Deployment failed: ${error.message}`, 'error');
    console.log(chalk.red('\nError details:'));
    console.log(chalk.red(error.stack || error.message));
    console.log(chalk.yellow('\nSee deploy-manual.md for manual deployment instructions.\n'));
    
  } finally {
    client.close();
    generateReport();
  }
}

// Run deployment
deploy().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});
