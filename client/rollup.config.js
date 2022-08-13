// rollup.config.js

import dev from 'rollup-plugin-dev';
import commonjs from '@rollup/plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import esbuild from 'rollup-plugin-esbuild';
import webWorkerLoader from 'rollup-plugin-web-worker-loader';
import pkg from './package.json';
import consts from 'rollup-plugin-consts';
import replace from '@rollup/plugin-replace';

const development = process.env.ENVIRONMENT === 'dev';
const sourceMap = development;
const minify = !development;

const output = {
    file: pkg.main,
    format: 'umd',
    name: 'highlightLib',
    sourcemap: sourceMap,
    globals: {
        ['web-worker:./workers/highlight-client-worker']: 'highlightWebWorker',
    },
};
const basePlugins = [
    consts({
        publicGraphURI: process.env.PUBLIC_GRAPH_URI,
    }),
    resolve({ browser: true }),
    webWorkerLoader({
        targetPlatform: 'browser',
        inline: true,
    }),
    typescript(),
    json(),
    replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify(
            development ? 'development' : 'production'
        ),
    }),
    commonjs({}),
    esbuild({
        minify,
    }),
];
const rollupBuilds = [];

if (development) {
    rollupBuilds.push({
        input: './src/index.tsx',
        output,
        external: ['web-worker:./workers/highlight-client-worker'],
        plugins: [
            ...basePlugins,
            filesize(),
            dev({
                host: 'localhost',
                port: 8080,
            }),
        ],
    });
} else {
    rollupBuilds.push({
        input: './src/index.tsx',
        output,
        external: ['web-worker:./workers/highlight-client-worker'],
        treeshake: 'smallest',
        plugins: [
            ...basePlugins,
            terser({
                mangle: minify,
            }),
            filesize(),
        ],
    });
}

export default rollupBuilds;
