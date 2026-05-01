const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting PAJOY System...\n');

// Start backend
const backend = spawn('node', ['backend/server.js'], {
  stdio: 'inherit',
  cwd: path.join(__dirname),
  env: { ...process.env }
});

backend.on('close', (code) => {
  console.log(`Backend process exited with code ${code}`);
  process.exit(code);
});

// Wait a moment for backend to start, then start frontend
setTimeout(() => {
  console.log('🌐 Starting frontend...\n');
  
  const frontend = spawn('cmd', ['/c', 'npm', 'run', 'dev'], {
    stdio: 'inherit',
    cwd: path.join(__dirname, 'frontend'),
    env: { ...process.env }
  });

  frontend.on('close', (code) => {
    console.log(`Frontend process exited with code ${code}`);
    process.exit(code);
  });

  frontend.on('error', (error) => {
    console.error('Failed to start frontend:', error);
    process.exit(1);
  });
}, 3000);

backend.on('error', (error) => {
  console.error('Failed to start backend:', error);
  process.exit(1);
});

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  backend.kill('SIGINT');
  process.exit(0);
});
