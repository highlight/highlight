/// <reference types="vite/client" />
/// <reference types="vitest/globals" />
import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [react(), tsconfigPaths(), svgr(), basicSsl(), envPlugin()],
    server: {
        port: 3000,
        https: true,
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

function envPlugin(): Plugin {
    return {
        name: 'highlight:env',
        transform(code, id) {
            const isScript = /\.(ts|tsx|js|jsx|mjs)$/.test(id);
            if (!isScript) return code;
            return code.replace(/process\.env\.(\w+)/g, (_, key) => {
                if (key === 'PUBLIC_URL') {
                    return JSON.stringify('/');
                }
                if (
                    key.startsWith('REACT_APP_') ||
                    key === 'NODE_ENV' ||
                    key === 'DEV'
                ) {
                    return JSON.stringify(process.env[key]);
                }
                return `undefined`;
            });
        },
    };
}
