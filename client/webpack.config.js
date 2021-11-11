const path = require('path');
const webpack = require('webpack'); //to access built-in plugins

module.exports = {
    entry: {
        index: path.resolve(__dirname, 'src/index.tsx'),
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        library: 'highlightLib',
        libraryTarget: 'umd',
    },
    devServer: {
        watchContentBase: true,
        writeToDisk: true,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.ts', '.tsx'],
        modules: [path.resolve(__dirname, 'src'), 'node_modules'],
        // NOTE: Only enable for experimenting with a dev version of rrweb.
        // The second argument to path.resolve() should be the path to the dist folder in rrweb.
        // alias: {
        //   "@highlight-run/rrweb": path.resolve(__dirname, "../../rrweb/dist"),
        // }
    },
    mode: 'development',
    devtool: 'source-map',
    plugins: [
        new webpack.EnvironmentPlugin({
            PUBLIC_GRAPH_URI: 'https://pub.highlight.run',
        }),
    ],
};
