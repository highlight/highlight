const path = require('path');
const webpack = require('webpack'); //to access built-in plugins

module.exports = {
  entry: {
    index: path.resolve(__dirname, 'src/index.tsx'),
  },
  output: {
    path: path.resolve(__dirname, 'dist/firstload/src'),
    filename: '[name].js',
    library: 'highlightLib',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  devServer: {
    watchContentBase: true,
    writeToDisk: true,
    port: 9000,
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
  optimization: {
    minimize: true
  },
  devtool: 'source-map',
};
