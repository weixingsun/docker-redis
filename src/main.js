var express = require('express');
var redis = require('redis');
var client = redis.createClient();
//var Pool = require('./ConnPool');
//var pool = new Pool();
var RedisAPI = require('./RedisAPI');
//var RedisAPI = new RedisAPI(pool);
var DBAPI = new RedisAPI(client);
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
  DBAPI.rangeMsgDB(res, req.params.type, req.params.pos, req.params.dist);
});
app.post('/api/msg', function (req, res) {
  DBAPI.setMsgDB(res,req.body);
});
app.put('/api/msg', function (req, res) {
  DBAPI.putMsgDB(res,req.body); 
});
app.get('/api/msg/:msg_name', function(req, res){
  DBAPI.getMsgDB(res,req.params.msg_name);
});
app.get('/api/msg_types', function(req, res){
  DBAPI.getMsgTypesDB(res);
});
app.delete('/api/msg/:name',function(req, res){
  DBAPI.rmMsgDB(res,req.params.name);
});
app.get('/api/notify/:user', function(req, res){
  DBAPI.getMsgDB(res,'#'+req.params.user);
});
app.use(function(err, req, res, next) { 
  console.error(err.stack); 
  console.error(req.body); 
  res.status(500).send({ errors: [ 'invalid_request' ] }); 
});
app.listen(49999,'127.0.0.1');
