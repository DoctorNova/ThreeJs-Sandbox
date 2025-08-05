import { readFileSync } from 'fs';
import { defineConfig } from 'vite';

const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)));
let repoName = '';

if (packageJson.repository && packageJson.repository.url) {
  // Extract repo name from URL like "https://github.com/user/repo.git"
  const match = packageJson.repository.url.match(/\/([^\/]+?)(?:\.git)?$/);
  if (match) repoName = match[1];
}

export default defineConfig({
  assetsInclude: ["**/shaders/*"],
  base: repoName ? `/${repoName}/` : '/',
  plugins: [],
  server: {
    watch: {
      usePolling: true,
    },
  },
});