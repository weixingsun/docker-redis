//client.expire('key1', 30);
var NGeoRedisAPI = require('./NGeoRedis');

function RedisAPI(client, geoClient) {
    this.client = client;
    this.geo = new NGeoRedisAPI(geoClient);
}

RedisAPI.prototype.rangeMsgDB = function(resHttp,type,pos,dist) {
  //params = {lat1, lat2, dist, owner, content, create_time, title, tags, pics}
  this.geo.range(resHttp,type,pos,dist);
};
RedisAPI.prototype.getMsgDB = function(resHttp,name) {
  this.client.hgetall(name,function(err,reply){
    console.log(name+reply)
    if(err) resHttp.json(err);
    else    resHttp.json(reply);
  });
  //this.geo.getGeoDB(name);
}
//pos={latitude: 43.6667, longitude: -79.4167}
RedisAPI.prototype.setMsgDB = function(resHttp,msg){
  var k = msg.type+':'+msg.lat+','+msg.lng;
  var pos = {latitude: msg.lat, longitude:msg.lng};
  this.client.hmset(k, msg, function(err, result) {
    if(err) resHttp.json(err);
    else    resHttp.json(msg);
  });
  this.geo.setGeoDB(k,pos);
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
module.exports = RedisAPI;

