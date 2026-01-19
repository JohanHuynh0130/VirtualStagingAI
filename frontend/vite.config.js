import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [
        tailwindcss(),
        react(),
        {
            name: 'delivery-fallback',
            configureServer(server) {
                server.middlewares.use((req, res, next) => {
                    if (req.url.startsWith('/delivery/')) {
                        req.url = '/delivery.html';
                    }
                    next();
                });
            }
        }
    ],
    server: {
        proxy: {
            '/api': 'http://127.0.0.1:3001',
            '/storage': 'http://127.0.0.1:3001',
        }
    },
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                dashboard: resolve(__dirname, 'dashboard.html'),
                editor: resolve(__dirname, 'editor.html'),
                staging: resolve(__dirname, 'staging.html'),
                delivery: resolve(__dirname, 'delivery.html'),
            },
        },
    },
});
