const webpack = require("webpack");

module.exports = {
	entry: {
		app: ['./src/main.js']
	},
	module: {
		loaders: [
			{test: /\.js$/, include: [/src/], loader: 'babel?cacheDirectory'},
			{test: /\.css$/, loader: 'style!css'}
		]
	},
	output: {
		path: './src/build/',
		publicPath: '/build/',
		filename: '[name].js'
	},
	plugins: [
		new webpack.DefinePlugin({
			__DEV__: false,
			"process.env.NODE_ENV": '"production"'
		}),
		new webpack.NoErrorsPlugin()
	]
};