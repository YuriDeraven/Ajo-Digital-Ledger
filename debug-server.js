#!/usr/bin/env node

// Set environment variables
process.env.NODE_ENV = 'development';
process.env.DEBUG = '*';

console.log('=== DEBUG SERVER START ===');
console.log('CWD:', process.cwd());
console.log('ENV:', {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
});

// Catch all unhandled errors
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason);
  process.exit(1);
});

// Try to start Next.js
const { nextStart } = require('next/dist/cli/next-start');

console.log('Starting Next.js server...');

try {
  require('next/dist/bin/next')(['dev', '--port', '3000']);
} catch (error) {
  console.error('DIRECT ERROR:', error);
  process.exit(1);
}
