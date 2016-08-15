con 		= require('../../config');
mysqlModel 	= require('mysql-model');
MyAppModel 	= mysqlModel.createConnection({
    host     : con.host,
    user     : con.user,
    password : con.password,
    database : con.database
});