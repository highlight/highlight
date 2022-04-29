import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import svgrPlugin from 'vite-plugin-svgr';

import lessToJS from 'less-vars-to-js';
import * as path from 'path';
import { resolve } from 'path';
import fs from 'fs';
import envCompatible from 'vite-plugin-env-compatible';
import tsconfigPaths from 'vite-tsconfig-paths';
import createImportPlugin from 'vite-plugin-import';

const pathResolver = (path: string) => resolve(__dirname, path);
const themeVariables = lessToJS(
    fs.readFileSync(
        pathResolver(
            path.join(__dirname, 'src/style/AntDesign/antd.overrides.less')
        ),
        'utf8'
    )
);

export default defineConfig({
    css: {
        preprocessorOptions: {
            less: {
                javascriptEnabled: true,
                modifyVars: themeVariables,
            },
        },
    },
    optimizeDeps: { include: ['firebase/app'] },
    plugins: [
        tsconfigPaths(),
        react(),
        envCompatible({
            prefix: 'REACT_APP',
            ignoreProcessEnv: true,
            mountedPath: 'process.env',
        }),
        svgrPlugin({
            svgrOptions: {
                icon: true,
            },
        }),
        createImportPlugin([
            {
                libraryName: 'antd',
                style: (name) => {
                    if (name === 'col' || name === 'row') {
                        return 'antd/lib/style/index.less';
                    }
                    return `antd/es/${name}/style/index.less`;
                },
            },
        ]),
    ],
    build: {
        outDir: 'build',
        minify: true,
        sourcemap: true,
    },
    server: {
        https: false,
        port: 3000,
        host: '0.0.0.0',
        cors: true,
        strictPort: true,
    },
});
