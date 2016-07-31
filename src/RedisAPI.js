//client.expire('key1', 30);
var NGeoRedisAPI = require('./NGeoRedis');

function RedisAPI(client) {
    this.client = client;
    this.geo = new NGeoRedisAPI(client);
}

RedisAPI.prototype.rangeMsgDB = function(resHttp,type,pos,dist) {
  //params = {lat1, lat2, dist, owner, content, create_time, title, tags, pics}
  this.geo.range(resHttp,type,pos,dist);
};
RedisAPI.prototype.getMsgDB = function(resHttp,name) {
  this.client.hgetall(name,function(err,reply){
    //console.log(name+reply)
    if(err) resHttp.json(err);
    else    resHttp.json(reply);
  });
  //this.geo.getGeoDB(name);
};
RedisAPI.prototype.getManyMsgDB = function(resHttp,names) {
  var multi = this.client.multi();
  var values = names.map(function(name){
    multi.incr("hgetall "+name);
  });
  multi.exec(function(err, values){
    if(err) resHttp.json(err);
    else    resHttp.json(values);
  });
  //this.geo.getGeoDB(name);
};
RedisAPI.prototype.getMyMsgDB = function(resHttp,user) {
  let self = this;
  this.client.hgetall(user,function(err,result){
      if(err) resHttp.json(err);
      else{    //resHttp.json(result);  //{"type:lat,lng:ctime":"owner|open"}
          var multi = self.client.multi();
          let keys = Object.keys(result)
          var values = keys.map(function(key){ multi.hgetall(key)});
          multi.exec(function(err, values){
              if(err) resHttp.json(err);
              else    resHttp.json(values);
          });
      }
  });
};
//pos={latitude: 43.6667, longitude: -79.4167}
RedisAPI.prototype.setMsgDB = function(resHttp,msg){
  var k = msg.type+':'+msg.lat+','+msg.lng+':'+msg.ctime;
  var pos = {latitude: msg.lat, longitude:msg.lng};
  this.client.hmset(k, msg, function(err, result) {
    if(err) resHttp.json(err);
    else    resHttp.json(msg);
  });
  this.geo.setGeoDB(k,pos);
  this.setTypeDB(msg.type);
};
RedisAPI.prototype.putMsgDB = function(resHttp,body){
   //body.key,body.field,body.value  //null check
  this.client.hmset(body.key, body.field, body.value, function(err,result){
    if(err) resHttp.json(err);
    else    resHttp.json(result);
  });
};
RedisAPI.prototype.rmHashKeyDB = function(resHttp,body){
  this.client.hdel(body.key, body.field, function(err, result) {
    if(err) resHttp.json(err);
    else    resHttp.json(result);
  });
};
RedisAPI.prototype.rmMsgDB = function(resHttp,k){
  this.client.del(k, function(err, result) {
    if(err) resHttp.json(err);
    else    resHttp.json(result);
  });
  this.geo.rmGeoDB(k);
};
RedisAPI.prototype.delDB = function(k){
  this.client.del(k, function(e) {
    console.log(e);
  });
};
RedisAPI.prototype.setTypeDB = function(k){
  var _client = this.client;
  this.client.incr("type:"+k, function(err,score){
    var args = ['types', score, k];
    _client.zadd(args, function(e,res) {
      if(err) console.log(e);
      //else console.log("type:"+k+' with score:'+score);
    });
  });
};
RedisAPI.prototype.getHashKeysDB = function(resHttp,key){
  //console.log('RedisAPI.getHashKeysDB()key='+key +', err='+err+', result='+result)
  this.client.hkeys(key, function(err,result){
    if(err) resHttp.json(err);
    else    resHttp.json(result);
  })
};
RedisAPI.prototype.renameHashDB = function(resHttp, body){
  var _client = this.client;  //body.key, body.oldfield, body.newfield
  this.client.hget(body.key, body.oldfield, function(err,value){
    if(err){
      resHttp.json(err);
    }else{
      _client.hset(body.key,body.newfield,value, function(err, result) {
        if(err){
          //resHttp.json(err);
        }
        //else    resHttp.json(msg);
        _client.hdel(body.key, body.oldfield)
      });
    }
  });
};
module.exports = RedisAPI;
