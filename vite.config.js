import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/zabbix-proxy': {
        target: 'http://45.189.16.8',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/zabbix-proxy/, '/zabbix/api_jsonrpc.php'),
        secure: false,
      }
    }
  }
})
