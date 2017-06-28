 /******************************************************
 * PLEASE DO NOT EDIT THIS FILE
 * the verification process may break
 * ***************************************************/

'use strict';

var fs = require('fs');
var express = require('express');
var app = express();
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = process.env.MONGOLAB;


if (!process.env.DISABLE_XORIGIN) {
  app.use(function(req, res, next) {
    var allowedOrigins = ['https://narrow-plane.gomix.me', 'https://www.freecodecamp.com'];
    var origin = req.headers.origin || '*';
    if(!process.env.XORIG_RESTRICT || allowedOrigins.indexOf(origin) > -1){
         console.log(origin);
         res.setHeader('Access-Control-Allow-Origin', origin);
         res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    }
    next();
  });
}

app.use('/public', express.static(process.cwd() + '/public'));

app.route('/_api/package.json')
  .get(function(req, res, next) {
    console.log('requested');
    fs.readFile(__dirname + '/package.json', function(err, data) {
      if(err) return next(err);
      res.type('txt').send(data.toString());
    });
  });
  
app.route('/')
    .get(function(req, res) {
		  res.sendFile(process.cwd() + '/views/index.html');
    })

app.use(function(req, res, next){
  console.log(req.originalUrl);
  
  //expression from https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url
  var expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
  var regex = new RegExp(expression);
  //above from https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url
  if(!req.originalUrl.match(regex))
  {
    console.log("URl not valid");
    res.send("Not a valid URL");
    return false;
  }
  var longUrl = req.originalUrl;
  console.log("Url Valid");  
  //https://battle-wine.glitch.me/http://www.google.com
  MongoClient.connect(url,function(err,db){
    if(err)
     console.log("Error: " + err);
    else
    {
      var shortUrls = db.collection('short-urls');
      console.log("Length: " + shortUrls.length);
      var findOne = function(db,callback)
      {
        shortUrls.findOne({original_url : longUrl},{_id:0},
                function(err,data){
                    console.log(data);
                    if(data!=null)
                      res.send(data);
                    else
                    {
                      makeShortUrl();
                      res.send("Your super box needs words");
                      
                     /* shortUrls.insert({
                        "original_url": longUrl,
                        "short_url": makeShortUrl()
                      },function(err,db){
                        if(err) throw err;
                      });*/

                    }
                });
      }
      findOne(db,function(){
        db.close();
      });
    }
  });  
  //res.send("Your super box needs words");
});

// Error Middleware
app.use(function(err, req, res, next) {
  if(err) {
    res.status(err.status || 500)
      .type('txt')
      .send(err.message || 'SERVER ERROR');
  }  
})

app.listen(process.env.PORT, function () {
  console.log('Node.js listening ...');
});

function makeShortUrl()
{
  var date = new Date();
  var year = date.getFullYear().toString().split("");
  
  console.log(year);
}