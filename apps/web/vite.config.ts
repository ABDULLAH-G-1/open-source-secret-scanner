import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function siteUrlPlugin(): Plugin {
  return {
    name: 'site-url-injector',
    enforce: 'pre',
    buildStart() {
      const siteFilePath = path.resolve(__dirname, 'src/constants/site.ts');
      const content = fs.readFileSync(siteFilePath, 'utf8');
      const match = content.match(/SITE_URL\s*=\s*['"]([^'"]+)['"]/);
      const siteUrl = match ? match[1] : '';

      if (siteUrl.includes('TODO')) {
        console.warn('\n' + '!'.repeat(64));
        console.warn('⚠️  WARNING: SITE_URL in apps/web/src/constants/site.ts contains "TODO"');
        console.warn(`   Current value: ${siteUrl}`);
        console.warn('   Update this with your real production domain before launch.');
        console.warn('!'.repeat(64) + '\n');
      }
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const siteFilePath = path.resolve(__dirname, 'src/constants/site.ts');
        const content = fs.readFileSync(siteFilePath, 'utf8');
        const match = content.match(/SITE_URL\s*=\s*['"]([^'"]+)['"]/);
        const siteUrl = match ? match[1] : 'https://TODO.vercel.app';
        return html.replace(/%SITE_URL%/g, siteUrl);
      },
    },
  };
}

export default defineConfig({
  plugins: [siteUrlPlugin(), react()],
  server: {
    port: 3000,
  },
});
