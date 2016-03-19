//client.expire('key1', 30);
var NGeoRedisAPI = require('./NGeoRedis');

function RedisAPI(pool) {
    this.pool = pool;
}

RedisAPI.prototype.rangeMsgDB = function(resHttp,type,pos,dist) {
  //params = {lat1, lat2, dist, owner, content, create_time, title, tags, pics}
  this.pool.range(type,pos,dist,resHttp);
};
RedisAPI.prototype.getMsgDB = function(resHttp,name) {
  this.pool.getJson(name,resHttp);
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
//pos={latitude: 43.6667, longitude: -79.4167}
RedisAPI.prototype.setMsgDB = function(resHttp,msg){
  this.pool.setJson(msg,resHttp);
  this.pool.setGeoDB(msg);
  this.typeIncDB(msg.type);
};
RedisAPI.prototype.rmMsgDB = function(resHttp,k){
  this.pool.rmMsgDB(k,resHttp);
  this.pool.rmGeoDB(k);
};
RedisAPI.prototype.typeIncDB = function(k){
  this.pool.typeInc(k);
};
module.exports = RedisAPI;
