import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'



// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: "./",
  build: {
      outDir: "../api/static",
      emptyOutDir: true,
      sourcemap: true,
      rollupOptions: {
          output: {
              manualChunks: id => {
                  if (id.includes("@fluentui/react-icons")) {
                      return "fluentui-icons";
                  } else if (id.includes("@fluentui/react")) {
                      return "fluentui-react";
                  } else if (id.includes("node_modules")) {
                      return "vendor";
                  }
              }
          }
      }
  },
  server: {
    host: '127.0.0.1',
    watch: {
      usePolling: true,
      interval: 100, // Poll every 100ms
    },
      proxy: {
        "/about": {target: "http://127.0.0.1:5000", changeOrigin: true},
        "/uploadFile": {target: "http://127.0.0.1:5000", changeOrigin: true},
        "/getDeploymentInfo": {target: "http://127.0.0.1:5000", changeOrigin: true},
        "/getFiles": {target: "http://127.0.0.1:5000", changeOrigin: true},
        "/getUploadedFiles": {target: "http://127.0.0.1:5000", changeOrigin: true},
        "/getAOAIResponse": {target: "http://127.0.0.1:5000", changeOrigin: true},
        "/getAOAIRawDocResponse": {target: "http://127.0.0.1:5000", changeOrigin: true},
        "/getSummary": {target: "http://127.0.0.1:5000", changeOrigin: true},
        "/getAOAIAccounts": {target: "http://127.0.0.1:5000", changeOrigin: true}
      }
  }
});