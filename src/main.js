var express = require('express');
var redis = require('redis');
var client = redis.createClient();
//var Pool = require('./ConnPool');
//var pool = new Pool();
var RedisAPI = require('./RedisAPI');
var DBAPI = new RedisAPI(client);
var NetAPI = require('./NetAPI');
var Net = new NetAPI();
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
app.get('/api/msgs/:type_cat&:pos&:dist', function (req, res) {
  let arr = req.params.type_cat.split('_')
  //let type= arr[0]  cat = arr[1]
  DBAPI.rangeMsgDB(res, arr[0], arr[1], req.params.pos, req.params.dist);
});
app.post('/api/msg', function (req, res) {
  DBAPI.setMsgDB(res,req.body);
  Net.push(Net.makepushjson(req.body));
});
app.put('/api/msg', function (req, res) {
  DBAPI.putMsgDB(res,req.body); 
});
app.get('/api/msg/:msg_name', function(req, res){
  DBAPI.getMsgDB(res,req.params.msg_name);
});
app.get('/api/mymsg/:user', function(req, res){
  DBAPI.getMyMsgDB(res,req.params.user);
});
app.get('/api/msg_types', function(req, res){
  DBAPI.getMsgTypesDB(res);
});
app.delete('/api/msg/:name',function(req, res){
  DBAPI.rmMsgDB(res,req.params.name);
});
app.get('/api/notify/:user', function(req, res){
  DBAPI.getMsgDB(res,req.params.user);
});
app.get('/api/hash/:key', function(req, res){
  //console.log('/api/hash/'+req.params.key)  // express cannot get with #
  DBAPI.getHashKeysDB(res, req.params.key)
});
app.delete('/api/hashkey', function(req, res){
  DBAPI.rmHashKeyDB(res, req.body)
});
app.put('/api/hash/rename', function(req, res){
  DBAPI.renameHashDB(res, req.body) // key,oldfield,newfield
});
app.use(function(err, req, res, next) { 
  console.error(err.stack); 
  console.error(req.body); 
  res.status(500).send({ errors: [ 'invalid_request' ] }); 
});
app.listen(49999,'127.0.0.1');
