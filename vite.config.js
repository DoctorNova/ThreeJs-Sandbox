module.exports = async () => {
  const { defineConfig } = await import('vite');

  return defineConfig({
    plugins: [],
    server: {
      watch: {
        usePolling: true,
      },
    },
  });
};