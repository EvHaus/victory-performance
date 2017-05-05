const path = require("path");
const webpack = require("webpack");

module.exports = {
	entry: {
		app: ['./src/main.js']
	},
	module: {
		rules: [{
			include: [
				path.resolve(__dirname, "src")
			],
			loader: 'babel-loader',
			query: {
				cacheDirectory: true
			},
			test: /\.js$/
		}, {
			test: /\.css$/,
			use: [
				'style-loader',
				'css-loader'
			]
		}]
	},
	output: {
		path: path.resolve('./src/build'),
		publicPath: '/build/',
		filename: '[name].js'
	},
	plugins: [
		new webpack.DefinePlugin({
			__DEV__: false,
			"process.env.NODE_ENV": '"production"'
		})
	]
};