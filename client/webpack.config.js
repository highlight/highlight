const path = require('path');
const webpack = require('webpack'); //to access built-in plugins

module.exports = {
  entry: {
    index: path.resolve(__dirname, 'src/index.tsx'),
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
  devtool: 'source-map',
  plugins: [
    new webpack.EnvironmentPlugin(['BACKEND_URI']),
  ],
};
