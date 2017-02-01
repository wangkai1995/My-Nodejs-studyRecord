var path = require('path');
var express= require('express');
var webpack= require('webpack');
var config = require('./webpack.config.dev');

var app = express();
var compile = webpack(config);

var webpackDevOptions = {
	noInfo:true,
	historyApiFallback:true,
	publicPath:config.output.publicPath,
	headers:{
		'Access-Control-Allow-Origin':'*',
	},
};

app.use(require('webpack-dev-middleware')(compile,webpackDevOptions));
app.use(require('webpack-hot-middleware')(compile));


app.get('*',function(reg,res){
	res.sendFile(path.join(__dirname,'index.html'));
});

app.listen(8787,'localhost',function(err){
	if(err){
		console.log(err);
		return;
	}

	console.log('Listening at http://loaclhost:8787');
});
