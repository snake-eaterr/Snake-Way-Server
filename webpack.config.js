const path = require('path')
const nodeExternals = require('webpack-node-externals')



const config = {
	entry: ['@babel/polyfill', './index.js'],
	target: 'node',
	externals: [nodeExternals()],

	output: {
		path: path.resolve('server-build'),
		filename: 'index.js',
		libraryTarget: 'commonjs2'
	},

	module: {
		rules: [
			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				options: {
					presets: ['@babel/preset-env', '@babel/preset-react']
				}
			},
			{
				test: /\.(ttf|eot|svg|gif|jpg|png|jpeg)(\?[\s\S]+)?$/,
				use: 'file-loader'
			}
		]
	},

}

module.exports = config