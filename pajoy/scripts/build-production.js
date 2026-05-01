#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🏗️ Building PAJOY Uniforms POS for Production...');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n🔄 ${description}...`, 'cyan');
  try {
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    log(`✅ ${description} completed`, 'green');
  } catch (error) {
    log(`❌ ${description} failed`, 'red');
    console.error(error.message);
    process.exit(1);
  }
}

// Check if required directories exist
function checkDirectories() {
  const requiredDirs = ['build', 'database', 'electron', 'backend', 'frontend', 'scripts'];
  
  log('\n📁 Checking required directories...', 'cyan');
  
  for (const dir of requiredDirs) {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      log(`❌ Required directory missing: ${dir}`, 'red');
      process.exit(1);
    }
    log(`✅ ${dir}`, 'green');
  }
}

// Check if required files exist
function checkFiles() {
  const requiredFiles = [
    'package.json',
    'electron/main.js',
    'backend/server.js',
    'frontend/package.json',
    'database/create_payments_table.sql'
  ];
  
  log('\n📄 Checking required files...', 'cyan');
  
  for (const file of requiredFiles) {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
      log(`❌ Required file missing: ${file}`, 'red');
      process.exit(1);
    }
    log(`✅ ${file}`, 'green');
  }
}

// Create build directory structure
function createBuildStructure() {
  log('\n📂 Creating build structure...', 'cyan');
  
  const buildDirs = [
    'build',
    'build/icons',
    'release'
  ];
  
  for (const dir of buildDirs) {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      log(`📁 Created: ${dir}`, 'green');
    }
  }
}

// Check if icon files exist
function checkIcons() {
  log('\n🎨 Checking application icons...', 'cyan');
  
  const iconTypes = [
    { file: 'build/icon.png', description: 'PNG icon (Windows/Linux)' },
    { file: 'build/icon.icns', description: 'ICNS icon (macOS)' },
    { file: 'build/icon.ico', description: 'ICO icon (Windows installer)' }
  ];
  
  let missingIcons = [];
  
  for (const icon of iconTypes) {
    const iconPath = path.join(process.cwd(), icon.file);
    if (fs.existsSync(iconPath)) {
      log(`✅ ${icon.description}`, 'green');
    } else {
      log(`⚠️ ${icon.description} - Optional`, 'yellow');
      missingIcons.push(icon);
    }
  }
  
  if (missingIcons.length > 0) {
    log('\n💡 Icon files are optional. The application will still build without them.', 'yellow');
  }
}

// Update package.json for production
function updatePackageForProduction() {
  log('\n📦 Updating package.json for production...', 'cyan');
  
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Ensure production dependencies are included
  if (!packageJson.dependencies) {
    packageJson.dependencies = {};
  }
  
  // Move axios to dependencies if it's in devDependencies
  if (packageJson.devDependencies && packageJson.devDependencies.axios) {
    packageJson.dependencies.axios = packageJson.devDependencies.axios;
    delete packageJson.devDependencies.axios;
  }
  
  // Write updated package.json
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  log('✅ Package.json updated for production', 'green');
}

// Main build process
function buildProduction() {
  log('🚀 Starting PAJOY Uniforms POS Production Build', 'bright');
  log('=====================================', 'bright');
  
  try {
    // Pre-build checks
    checkDirectories();
    checkFiles();
    createBuildStructure();
    checkIcons();
    updatePackageForProduction();
    
    // Install dependencies
    runCommand('npm ci', 'Installing dependencies');
    
    // Run database migration
    runCommand('node scripts/migrate-payments.js', 'Running payment database migration');
    
    // Build frontend
    runCommand('npm run build:frontend', 'Building frontend for production');
    
    // Build Electron application
    runCommand('npm run dist:win', 'Building Windows executable');
    
    // Success message
    log('\n🎉 Build completed successfully!', 'bright');
    log('=====================================', 'bright');
    log('✅ Windows executable created in release/', 'green');
    log('✅ Ready for distribution', 'green');
    
    // Show output files
    const releaseDir = path.join(process.cwd(), 'release');
    if (fs.existsSync(releaseDir)) {
      const files = fs.readdirSync(releaseDir);
      log('\n📦 Generated files:', 'cyan');
      files.forEach(file => {
        const filePath = path.join(releaseDir, file);
        const stats = fs.statSync(filePath);
        const size = (stats.size / 1024 / 1024).toFixed(2);
        log(`   📄 ${file} (${size} MB)`, 'green');
      });
    }
    
    log('\n🚀 To run the application:', 'cyan');
    log('   1. Copy the .env.example to .env and configure your settings', 'yellow');
    log('   2. Run the installer or execute the .exe file directly', 'yellow');
    log('   3. The application will auto-start the backend server', 'yellow');
    
  } catch (error) {
    log('\n❌ Build failed!', 'red');
    log('=====================================', 'red');
    log('Please check the error messages above and fix any issues.', 'yellow');
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const targetPlatform = args[0] || 'win';

if (['win', 'mac', 'linux'].includes(targetPlatform)) {
  log(`🎯 Building for platform: ${targetPlatform}`, 'cyan');
  buildProduction();
} else {
  log('❌ Invalid platform. Use: win, mac, or linux', 'red');
  process.exit(1);
}
