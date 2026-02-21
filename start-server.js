const { spawn } = require('child_process');
const path = require('path');

const server = spawn('npm', ['run', 'dev'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    DEBUG: 'next:*'
  }
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  console.error('Server exited with code:', code);
  process.exit(code);
});

process.on('SIGINT', () => {
  server.kill();
  process.exit(0);
});
