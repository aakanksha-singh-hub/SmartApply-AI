#!/usr/bin/env node
// Build script that skips TypeScript type checking
import { execSync } from 'child_process';

console.log('Building with Vite (skipping TypeScript check)...');
try {
  execSync('vite build', { stdio: 'inherit' });
  console.log('✅ Build successful!');
  process.exit(0);
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

