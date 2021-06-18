const express=require('express')
var app=express()
var http = require("http").createServer(app);

var formidable = require("express-formidable");
app.use(formidable());


var mongodb = require("mongodb");
var mongoClient = mongodb.MongoClient;
var ObjectId = mongodb.ObjectId;

var bcrypt = require("bcrypt");

var jwt = require("jsonwebtoken");
var accessTokenSecret = "myAccessTokenSecret1234567890";


app.use("/public", express.static(__dirname + "/public"));
app.set("view engine", "ejs");

var mainURL = "http://localhost:2000";


http.listen(2000, function () {
	console.log("Server started at " + mainURL);
    mongoClient.connect("mongodb://localhost:27017",(err,client)=>{
        useUnifiedTopology: true 
        var db = client.db("oyester-training");
		console.log("db connected.");



        app.get('/signup',(req,res)=>{
            res.render('signup')
        })
        
        app.post('/signup',(req,res)=>{
            const name = req.fields.name;
			const email = req.fields.email;
			const password = req.fields.password;

            db.collection("users").findOne({
				$or: [{
					"email": email
				}, ]
			}, function (error, user) {
				if (user == null) {
					bcrypt.hash(password, 10, function (error, hash) {
						db.collection("users").insertOne({
							"name": name,
							"email": email,
							"password": hash,
							
						}, function (error, data) {
							res.json({
								"status": "success",
								"message": "Signed up successfully. You can login now."
							});
						});
					});
				} else {
					res.json({
						"status": "error",
						"message": "Email already exist."
					});
				}
			});
        })

        app.get("/login",(req,res)=>{
            res.render("login.ejs")
        })

        app.get('/home',(req,res)=>{
            res.render("home.ejs")
        })

        app.post("/login", function (req, res) {
			var email = req.fields.email;
			var password = req.fields.password;
			db.collection("users").findOne({
				"email": email
			}, function (error, user) {
				if (user == null) {
					res.json({
						"status": "error",
						"message": "Email does not exist"
					});
				} else {
					bcrypt.compare(password, user.password, function (error, isVerify) {
						if (isVerify) {
							var accessToken = jwt.sign({ email: email }, accessTokenSecret);
							db.collection("users").findOneAndUpdate({
								"email": email
							}, {
								$set: {
									"accessToken": accessToken
								}
							}, function (error, data) {
								res.json({
									"status": "success",
									"message": "Login successfully",
									"accessToken": accessToken,
								});
							});
						} else {
							res.json({
								"status": "error",
								"message": "Password is not correct"
							});
						}
					});
				}
			});
		});
        app.get("/logout", function (request, result) {
			result.redirect("/login");
		});

       

    })
});