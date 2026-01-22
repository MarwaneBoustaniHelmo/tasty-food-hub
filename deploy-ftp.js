#!/usr/bin/env node

import FtpDeploy from 'ftp-deploy';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// FTP Configuration
const ftpConfig = {
  host: '72.60.93.15',
  port: 21,
  user: 'u487930812_tastyfood.me',
  password: process.env.FTP_PASSWORD,
  // FIXED: Point localRoot to dist folder (contents will be uploaded)
  localRoot: path.join(__dirname, 'dist'),
  // FIXED: Upload directly to /public_html/ (NOT /public_html/dist/)
  remoteRoot: '/public_html/',
  include: ['*', '**/*'],
  exclude: ['.git', 'node_modules', '.env', '.gitignore', '.DS_Store'],
  // NEW: Clear out old files before uploading
  deleteRemote: false,
  // Keep this for compatibility
  forcePasv: true,
};

const ftpDeploy = new FtpDeploy();

console.log('\n========================================');
console.log('  🍔 TASTY FOOD HUB - DEPLOYMENT TOOL 🍔');
console.log('========================================\n');

// Step 1: Verify FTP Password
if (!ftpConfig.password) {
  console.error('❌ ERROR: FTP_PASSWORD environment variable not set!');
  console.error('\nSet it before running this script:\n');
  console.error('Windows PowerShell:');
  console.error('  $env:FTP_PASSWORD="TastyFood@2024!"');
  console.error('  node deploy-ftp.js\n');
  console.error('Windows CMD:');
  console.error('  set FTP_PASSWORD=TastyFood@2024!');
  console.error('  node deploy-ftp.js\n');
  console.error('Mac/Linux:');
  console.error('  export FTP_PASSWORD="TastyFood@2024!"');
  console.error('  node deploy-ftp.js\n');
  process.exit(1);
}

// Step 2: Build the React app
console.log('📦 [1/3] Building React application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('\n✅ Build completed successfully!\n');
} catch (error) {
  console.error('\n❌ Build failed! Check errors above.\n');
  process.exit(1);
}

// Step 3: Verify dist folder exists
if (!fs.existsSync(ftpConfig.localRoot)) {
  console.error('❌ ERROR: dist folder not found!');
  console.error('Make sure npm run build completed successfully.\n');
  process.exit(1);
}

// Verify index.html exists
const indexPath = path.join(ftpConfig.localRoot, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('❌ ERROR: index.html not found in dist folder!');
  console.error('Make sure your React app builds correctly.\n');
  process.exit(1);
}

// Step 4: Upload to FTP
console.log('📤 [2/3] Uploading to FTP server...');
console.log(`     Host: ${ftpConfig.host}`);
console.log(`     User: ${ftpConfig.user}`);
console.log(`     From: ${ftpConfig.localRoot}`);
console.log(`     To: ${ftpConfig.remoteRoot}\n`);

ftpDeploy
  .deploy(ftpConfig)
  .then(() => {
    console.log('\n✅ [3/3] Deployment successful!\n');
    console.log('========================================');
    console.log('📍 Live URL: https://tastyfood.me');
    console.log('========================================\n');
    console.log('⏱️  Tips if site doesn\'t appear:');
    console.log('   1. Clear browser cache: Ctrl+Shift+Delete');
    console.log('   2. Hard refresh: Ctrl+F5');
    console.log('   3. Wait 5-10 minutes for CDN');
    console.log('   4. Check console for JavaScript errors\n');
  })
  .catch((err) => {
    console.error('\n❌ Deployment failed!');
    console.error('Error:', err.message);
    console.error('\nTroubleshooting:');
    console.error('- Verify FTP password: TastyFood@2024!');
    console.error('- Check internet connection');
    console.error('- Confirm dist folder has files');
    console.error('- Verify remoteRoot is /public_html/');
    console.error('- Try again: node deploy-ftp.js\n');
    process.exit(1);
  });

