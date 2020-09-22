const path = require('path');
const webpack = require('webpack'); //to access built-in plugins
var WebpackObfuscator = require('webpack-obfuscator');

module.exports = {
  entry: {
    index: path.resolve(__dirname, 'src/index.tsx'),
    firstload: path.resolve(__dirname, 'firstload_src/firstload.js'),
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    library: '$',
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
  },
  mode: 'development',
  devtool: 'sourceMap',
  plugins: [
    new webpack.EnvironmentPlugin(['BACKEND_URI']),
    new WebpackObfuscator(
      {
        compact: true,
        identifierNamesGenerator: 'mangled',
        splitStrings: true,
        splitStringsChunkLength: 3,
        shuffleStringArray: true,
      },
      []
    ),
  ],
};
