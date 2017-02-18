var path = require('path');
var fs = require('fs');
var webpack = require('webpack');

module.exports={
	devtool:'cheap-module-eval-source-map',
	//入口文件
	entry:{
		app:[
			'webpack-hot-middleware/client',
			'./src/app',
		],
		vendors:['react','react-dom','react-router'],
	},
	//输出文件
	output:{
		filename:'[name].js',
		publicPath:'/static/',
	},
	//监控文件
	module:{
		loaders:[{
			//监听jsx
			test: /\.jsx?$/,
			include:[
				path.resolve(__dirname,'src'),
			],
			loaders:['react-hot','babel'],
		}
		,{
			//开启css module
			test: /\.scss$/,
			// exclude: path.resolve(__dirname,'src'),
			include:[
				path.resolve(__dirname,'src'),
			],
			loader: 'style!css?modules&localIdentName=[name]__[local]__[hash:base64:5]!sass?sourceMap=true',
		}
		// },{
		// 	//监听sass
		// 	test:/\.scss$/,
		// 	include:[
		// 		path.resolve(__dirname,'src'),
		// 	],
		// 	loader:'style!css!sass?sourceMap=true&sourceMapContents=true',
		// }
		],
	},

	resolve:{
		extensions:['','.js','.jsx','.scss','.css'],
	},

	//引用插件
	plugins:[
		//提取公共模块插件
		new webpack.optimize.CommonsChunkPlugin({
				name:'vendors',
				chunk:['vendors']
			}),
		//配置开发环境
		new webpack.optimize.DedupePlugin(),
		new webpack.DefinePlugin({
   			'process.env' : {
     			NODE_ENV : JSON.stringify('production')
   			}
 		}),
 		//错误提示
		new webpack.NoErrorsPlugin(),
		//热加载错误提示
		new webpack.HotModuleReplacementPlugin(),
	],

};