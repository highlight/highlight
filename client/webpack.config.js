const path = require('path');
const webpack = require('webpack'); //to access built-in plugins

module.exports = {
	entry: path.resolve(__dirname, 'src/index.js'),
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'index.js',
		library: '$',
		libraryTarget: 'umd',
	},
	devServer: {
		watchContentBase: true,
		writeToDisk: true,
	},
	module: {
		rules: [
			{
				test: /\.(js)$/,
				exclude: /node_modules/,
				use: ['babel-loader'],
			},
		],
	},
	resolve: {
		extensions: ['.js'],
		modules: [path.resolve(__dirname, 'src'), 'node_modules'],
	},
	mode: 'development',
	devtool: 'sourceMap',
	plugins: [new webpack.EnvironmentPlugin(['BACKEND_URI'])],
};
