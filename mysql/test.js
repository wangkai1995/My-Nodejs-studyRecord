
var mysql = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '19950807',
  database : 'test'
});

connection.connect();

connection.query('insert into my(name,age,createTime) VALUES(?, ?, ?)',['wangkai',17,new Date()],function (error, results, fields) {
    if (error) throw error;
    console.log(results);
});

connection.end();

