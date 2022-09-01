/// <reference types="vite/client" />
/// <reference types="vitest/globals" />
import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [react(), tsconfigPaths(), svgr(), basicSsl()],
    envPrefix: 'REACT_APP_',
    server: {
        port: 3000,
        https: true,
    },
    build: {
        outDir: 'build',
        sourcemap: false,
    },
    test: {
        globals: true,
        environment: 'happy-dom',
        setupFiles: ['./src/setupTests.ts'],
    },
});
