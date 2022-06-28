// rollup.config.js

import dev from 'rollup-plugin-dev'
import commonjs from '@rollup/plugin-commonjs'
import filesize from 'rollup-plugin-filesize';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import json from 'rollup-plugin-json';
import esbuild from 'rollup-plugin-esbuild';
import webWorkerLoader from 'rollup-plugin-web-worker-loader';
import pkg from './package.json';

const development = process.env.ENVIRONMENT === 'dev';
const sourceMap = development;
const minify = !development;

const output = {
    file: pkg.main,
    format: 'umd',
    name: 'highlightLib',
    sourcemap: sourceMap
};
const basePlugins = [
    resolve({ browser: true }),
    webWorkerLoader({
        targetPlatform: 'browser',
        inline: true,
        sourceMap,
    }),
    typescript(),
    json(),
    commonjs({sourceMap}),
    esbuild({
        minify,
        sourceMap
    })
]
const rollupBuilds = [];

if (development) {
    rollupBuilds.push(
        {
            input: './src/index.tsx',
            output,
            plugins: [
                ...basePlugins,
                filesize(),
                dev({
                    host: 'localhost',
                    port: 8080
                })
            ]
        }
    )
}
else {
    rollupBuilds.push(
        {
            input: './src/index.tsx',
            output,
            treeshake: 'smallest',
            plugins: [
                ...basePlugins,
                terser({
                    mangle: minify
                }),
                filesize()
            ]
        });
}

export default rollupBuilds;

