import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { execSync } from 'child_process';

describe('Bundle Size Verification', () => {
  it('core bundle must stay under 10 KB gzipped', () => {
    const coreDir = path.resolve(__dirname, '..');
    const distMjs = path.join(coreDir, 'dist', 'index.mjs');

    // If dist does not exist yet, build it
    if (!fs.existsSync(distMjs)) {
      execSync('npm run build', { cwd: coreDir, stdio: 'inherit' });
    }

    expect(fs.existsSync(distMjs)).toBe(true);

    const content = fs.readFileSync(distMjs);
    const gzipped = zlib.gzipSync(content);
    const sizeBytes = gzipped.length;
    const sizeKb = (sizeBytes / 1024).toFixed(2);

    console.log(`\n========================================`);
    console.log(`Core Bundle (dist/index.mjs) Size Check:`);
    console.log(`Raw Size:      ${content.length} bytes (${(content.length / 1024).toFixed(2)} KB)`);
    console.log(`Gzipped Size:  ${sizeBytes} bytes (${sizeKb} KB)`);
    console.log(`Limit:         10240 bytes (10.00 KB)`);
    console.log(`Status:        ${sizeBytes < 10240 ? 'PASS (Under 10 KB)' : 'FAIL'}`);
    console.log(`========================================\n`);

    expect(sizeBytes).toBeLessThan(10 * 1024);
  });
});
