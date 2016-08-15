var express 	= require('express');
var app 		= express();
var mysql      	= require('mysql');
var fs 			= require("fs");
var bodyParser  = require('body-parser');
var User   		= require('./app/models/user');
var morgan      = require('morgan');
var con 		= require('./config');
var port 		= 8080;
var apiRoutes 	= express.Router();
var jwt    		= require('jsonwebtoken');

app.set('superSecret', con.secret);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));

app.get('/', function(req, res) {
	res.send('Hello! The API is at http://localhost:' + port + '/api');
});

apiRoutes.get('/setup', function(req, res) {
	user = new Users({
		name		: 'Serenity',
		password	: 'Joss Whedon'
	});
	user.save(function(err, rows, fields) {
		if (err) throw err;
		if (!rows)
		{
			res.json({ success: false});
		}
		else if(rows)
		{
			res.json({ success: true});
		}
	});
});
apiRoutes.post('/authenticate', function(req, res) {
	
	var name=req.body.name;
	var password=req.body.password;
    sec = new Users();
	sec.find('all', {where: 'name="'+name+'"'}, function(err, result) {
			if (err) throw err
			else if (!result[0]) {
				res.json({ success: false, message: 'Authentication failed. User not found.' });
			}
			else if (result[0])
			{
				if (result[0].password !=password) {
					res.json({ success: false, message: 'Authentication failed. Wrong password.' });
				} else {
					var token = jwt.sign(result[0], app.get('superSecret'), {
					expiresIn: 86400
				});
				res.json({
					success: true,
					message: 'Enjoy your token!',
					token: token
				});
			}		
		}
    });
});
apiRoutes.use(function(req, res, next) {
	var token = req.body.token || req.param('token') || req.headers['x-access-token'];
	if (token) {
		jwt.verify(token, app.get('superSecret'), function(err, decoded) {			
			if (err) {
				return res.json({ success: false, message: 'Failed to authenticate token.' });		
			} else {
				req.decoded = decoded;	
				next();
			}
		});

	} else {
		return res.status(403).send({ 
			success: false, 
			message: 'No token provided.',
		});
		
	}
	
});
apiRoutes.get('/', function(req, res) {
	res.json({ message: 'Welcome to the coolest API on earth!' });
});
apiRoutes.get('/users/update/:id/:name/:password', function(req, res) {
	if(req.params.id < 0) {
		return res.status(404).send({ 
			success: false, 
			message: 'Page Not Found',
		});
  	}else
	{
		update = new Users({
			name: req.params.name,
			password: req.params.password,
		});
		update.set('id', req.params.id);
		update.save(function(err, rows, fields) {
			if (err)
			{
				res.json({ message: "No result"});
			}
			if (!rows)
			{
				res.json({ success: false});
			}
			else if(rows)
			{
				res.json({ success: true});
			}
		});
	}
});
apiRoutes.get('/users/remove/:id', function(req, res) {
	if(req.params.id < 0) {
		return res.status(404).send({ 
			success: false, 
			message: 'Page Not Found',
		});
  	}else
	{
		remove = new Users({
			name: req.params.name,
			password: req.params.password,
		});
		remove.set('id', req.params.id);
		remove.remove(function(err, rows, fields) {
			if (err)
			{
				res.json({ message: "No result"});
			}
			if (!rows)
			{
				res.json({ success: false});
			}
			else if(rows)
			{
				res.json({ success: true});
			}
		});
	}
});
apiRoutes.get('/users', function(req, res) {
    sec = new Users();
	sec.find('all', {}, function(err, result) {
		res.json(result);
	});
});

apiRoutes.get('/check', function(req, res) {
	res.json(req.decoded);
});

app.use('/api', apiRoutes);
app.listen(port);