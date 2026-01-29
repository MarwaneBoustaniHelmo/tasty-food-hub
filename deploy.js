#!/usr/bin/env node

/**
 * AUTOMATED DEPLOYMENT SCRIPT FOR TASTY FOOD HUB
 * Deploys React Vite build to Hostinger via FTP
 * 
 * Usage: node deploy.js
 * 
 * Requirements:
 * - Node.js 18+
 * - npm packages: @samkirkland/ftp-deploy, dotenv
 * - FTP credentials via environment variables or .env.deploy
 */

import { deploy as ftpDeploy } from "@samkirkland/ftp-deploy";
import dotenv from "dotenv";
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.deploy ONLY if FTP_PASSWORD is not already set
if (!process.env.FTP_PASSWORD) {
  dotenv.config({ path: path.join(__dirname, '.env.deploy') });
}

// Configuration - prioritize environment variables
const CONFIG = {
  FTP_HOST: (process.env.FTP_HOST || '72.60.93.15').replace('ftp://', '').replace('ftps://', ''),
  FTP_USER: process.env.FTP_USER || 'u487930812',
  FTP_PASS: process.env.FTP_PASSWORD || process.env.FTP_PASS,
  FTP_REMOTE_PATH: process.env.FTP_REMOTE_PATH || '/public_html',
  DOMAIN: process.env.DOMAIN || 'https://tastyfood.me',
  LOCAL_DIST: path.join(__dirname, 'dist')
};

// Deployment state tracking
const deploymentLog = {
  startTime: new Date(),
  steps: [],
  errors: [],
  warnings: []
};

/**
 * Log deployment step
 */
function logStep(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const icon = {
    info: '→',
    success: '✓',
    error: '✗',
    warning: '⚠'
  }[type];
  
  deploymentLog.steps.push({ timestamp, message, type });
  console.log(`${icon} [${timestamp}] ${message}`);
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
    
    logStep(`Found ${files.length} files/folders in dist/`, 'success');
    return true;
  } catch (error) {
    logStep(`Dist verification failed: ${error.message}`, 'error');
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
  
  console.log('\n' + '═'.repeat(60));
  console.log('          DEPLOYMENT REPORT');
  console.log('═'.repeat(60) + '\n');
  
  console.log('Timeline:');
  console.log(`  Start:    ${deploymentLog.startTime.toLocaleString()}`);
  console.log(`  End:      ${endTime.toLocaleString()}`);
  console.log(`  Duration: ${duration}s\n`);
  
  console.log('Summary:');
  console.log(`  Steps:    ${deploymentLog.steps.length}`);
  console.log(`  Errors:   ${deploymentLog.errors.length}`);
  console.log(`  Warnings: ${deploymentLog.warnings.length}\n`);
  
  if (deploymentLog.errors.length > 0) {
    console.log('Errors:');
    deploymentLog.errors.forEach(error => {
      console.log(`  ✗ ${error}`);
    });
    console.log();
  }
  
  if (deploymentLog.warnings.length > 0) {
    console.log('Warnings:');
    deploymentLog.warnings.forEach(warning => {
      console.log(`  ⚠ ${warning}`);
    });
    console.log();
  }
  
  console.log('Access your site:');
  console.log(`  ${CONFIG.DOMAIN}\n`);
  
  console.log('═'.repeat(60) + '\n');
  
  // Save report to file
  const reportPath = path.join(__dirname, `deployment-report-${Date.now()}.json`);
  fs.writeFile(reportPath, JSON.stringify(deploymentLog, null, 2))
    .then(() => logStep(`Report saved to ${path.basename(reportPath)}`, 'info'))
    .catch(() => {});
}

/**
 * Main deployment function using @samkirkland/ftp-deploy
 */
async function deploy() {
  console.log('\n🚀 Starting deployment to Hostinger...\n');
  
  // Validate credentials
  if (!CONFIG.FTP_PASS) {
    logStep('FTP password not found in environment variables', 'error');
    console.log('\nPlease set FTP_PASSWORD before running deployment:\n');
    console.log('Linux/Mac/WSL:');
    console.log('  export FTP_PASSWORD="your_password"');
    console.log('  npm run deploy:hostinger\n');
    console.log('Windows PowerShell:');
    console.log('  $env:FTP_PASSWORD="your_password"');
    console.log('  npm run deploy:hostinger\n');
    console.log('Windows CMD:');
    console.log('  set FTP_PASSWORD=your_password');
    console.log('  npm run deploy:hostinger\n');
    process.exit(1);
  }
  
  // Show connection info (mask password)
  console.log('Connection Info:');
  console.log(`  Host: ${CONFIG.FTP_HOST}`);
  console.log(`  User: ${CONFIG.FTP_USER}`);
  console.log(`  Pass: ${CONFIG.FTP_PASS ? '***' + CONFIG.FTP_PASS.slice(-4) : 'NOT SET'}`);
  console.log(`  Path: ${CONFIG.FTP_REMOTE_PATH}\n`);
  
  try {
    // Step 1: Build project
    await buildProject();
    
    // Step 2: Verify dist folder
    await verifyDistFolder();
    
    // Step 3: Deploy via FTP
    logStep('Deploying to FTP server...', 'info');
    
    const ftpConfig = {
      server: CONFIG.FTP_HOST,      // Changed from 'host' to 'server'
      username: CONFIG.FTP_USER,    // Changed from 'user' to 'username'
      password: CONFIG.FTP_PASS,
      port: 21,
      "local-dir": CONFIG.LOCAL_DIST + "/",  // Must end with /
      "server-dir": CONFIG.FTP_REMOTE_PATH + "/",  // Must end with /
      "dangerous-clean-slate": false,  // Changed from deleteRemote
    };
    
    await ftpDeploy(ftpConfig);
    
    // Success!
    console.log('\n✓ DEPLOYMENT SUCCESSFUL!\n');
    logStep(`Deployed to ${CONFIG.DOMAIN}`, 'success');
    
  } catch (error) {
    console.log('\n✗ DEPLOYMENT FAILED!\n');
    logStep(`Deployment failed: ${error.message}`, 'error');
    console.log('\nError details:');
    console.log(error.stack || error.message);
    console.log('\nSee deploy-manual.md for manual deployment instructions.\n');
    deploymentLog.errors.push(error.message);
    
  } finally {
    generateReport();
  }
}

// Run deployment
deploy().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
