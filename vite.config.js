module.exports = async () => {
  const { defineConfig } = await import('vite');

  return defineConfig({
    assetsInclude: ["**/shaders/*"],
    plugins: [],
    server: {
      watch: {
        usePolling: true,
      },
    },
  });
};