import react from '@vitejs/plugin-react';
import fs from 'fs';
import lessToJS from 'less-vars-to-js';
import * as path from 'path';
import { resolve } from 'path';
import visualizer from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import envCompatible from 'vite-plugin-env-compatible';
import vitePluginImp from 'vite-plugin-imp';
import svgrPlugin from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

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
        vitePluginImp({
            libList: [
                {
                    libName: 'antd',
                    style: (name) => {
                        if (name === 'col' || name === 'row') {
                            return 'antd/lib/style/index.less';
                        }
                        return `antd/es/${name}/style/index.less`;
                    },
                },
            ],
        }),
    ],
    esbuild: {
        minify: true,
        sourcemap: true,
        treeShaking: true,
    },
    define: {
        // By default, Vite doesn't include shims for NodeJS/
        // necessary for segment analytics lib to work
        'global.window.CustomEvent': {},
    },
    build: {
        outDir: 'build',
        manifest: true,
        cssCodeSplit: true,
        sourcemap: true,
        minify: true,
        reportCompressedSize: true,
        rollupOptions: {
            output: {
                compact: true,
                sourcemap: true,
                minifyInternalExports: true,
                manualChunks: {
                    antd: ['antd'],
                    lodash: ['lodash'],
                    reactAwesomeQueryBuilder: ['react-awesome-query-builder'],
                    recharts: ['recharts', 'react-grid-layout'],
                    rehooks: ['@rehooks/local-storage', '@rehooks/window-size'],
                    rrweb: ['@highlight-run/rrweb'],
                },
            },
            plugins: [
                visualizer({
                    filename: resolve(__dirname, 'build/stats.html'),
                    template: 'treemap', // sunburst|treemap|network
                    sourcemap: true,
                }),
            ],
        },
    },
    server: {
        https: true,
        port: 3000,
        host: '0.0.0.0',
        cors: true,
        strictPort: true,
    },
});
