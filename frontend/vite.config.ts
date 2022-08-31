/// <reference types="vitest/globals" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';

const reactAppEnv = {};
for (const key in process.env) {
    if (key.startsWith('REACT_APP_')) {
        reactAppEnv[`process.env.${key}`] = JSON.stringify(process.env[key]);
    }
}

export default defineConfig({
    plugins: [react(), tsconfigPaths(), svgr()],
    define: {
        ...reactAppEnv,
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        'process.env.DEV': JSON.stringify(
            process.env.NODE_ENV === 'development'
        ),
        'process.env.PUBLIC_URL': JSON.stringify('/'),
    },
    server: {
        port: 3000,
    },
    build: {
        outDir: 'build',
    },
    test: {
        globals: true,
        environment: 'happy-dom',
        setupFiles: ['./src/setupTests.ts'],
    },
});
