var express = require('express');
var redis = require('redis');
var msgClient = redis.createClient();
var geoClient = redis.createClient();
geoClient.select(1);
var RedisAPI = require('./RedisAPI');
var RedisAPI = new RedisAPI(msgClient,geoClient);
//var geo = require('georedis').initialize(geoClient);
//redis.createClient({host,port,url,detect_buffers})
//url=[redis:]//[user][:password@][host][:port][/db-number][?db=db-number[&password=bar[&option=value]]]
//client.expire('key1', 30);
//////////////////todo: pooling
var bodyParser = require('body-parser');
//var multer = require('multer'); // v1.0.5
//var upload = multer();
//var urlencodedParser = bodyParser.urlencoded({ extended: false })
//var jsonParser = bodyParser.json()
var app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
//app.enable('trust proxy');
// msg = {  lat,lng,create_time,owner,title,content,pics,tags, };
//app.get(url,parser,function)
app.get('/api/msgs/:type&:pos&:dist', function (req, res) {
  RedisAPI.rangeMsgDB(res, req.params.type, req.params.pos, req.params.dist);
});
app.post('/api/msg', function (req, res) {
  RedisAPI.setMsgDB(res,req.body);
});
app.get('/api/msg/:msg_name', function(req, res){
  RedisAPI.getMsgDB(res,req.params.msg_name);
});
app.delete('/api/msg/:name',function(req, res){
  RedisAPI.rmMsgDB(res,req.params.name);
});
app.use(function(err, req, res, next) { 
  console.error(err.stack); 
  console.error(req.body); 
  res.status(500).send({ errors: [ 'invalid_request' ] }); 
});
app.listen(8080,'0.0.0.0');
