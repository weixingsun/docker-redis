//client.expire('key1', 30);

function RedisAPI(client) {
    this.client = client;
}
function getGeoKey(msg) {
    return msg.lat+','+msg.lng+':'+msg.ctime
}
function getGeoSet(msg) {
    return 'geo:'+msg.type+'_'+msg.cat
}
function getKey(msg) {
    return msg.type+'_'+msg.cat+':'+msg.lat+','+msg.lng+':'+msg.ctime
}
///////////////////////////////////////////////////////////////////////////////
RedisAPI.prototype.rangeMsgDB = function(resHttp,type,cat,pos,dist) {
  //car, sell, lat,lng, 
  var self = this;
  let geoset = 'geo:'+type+'_'+cat;
  let values = pos.split(',');
  let lat = values[0]
  let lng= values[1]
  //console.log('range() set:'+geoset+' lat='+lat+' lng='+lng+' dist='+dist)
  this.client.georadius(geoset, lng,lat, dist, 'm', function(err, locations){ //'m','WITHCOORD','WITHDIST','ASC'
    if(err) resHttp.json(err);
    else    self.rangeFull(resHttp,type,cat,locations);
  });
};
RedisAPI.prototype.rangeFull = function(resHttp,type,cat,locations){
  //console.log(locations)
  var keys = locations.map(function(item) {
    return type+'_'+cat+':'+item;  //key=type_cat:geokey, geokey=lat,lng:ctime
  });
  var multi = this.client.multi();
  var values = keys.map(function(key){ multi.hgetall(key)});
  multi.exec(function(err, values){
    if(err) resHttp.json(err);
    //else    resHttp.json({radius:locations, msgs:values});
    else    resHttp.json(values);
  });
};
///////////////////////////////////////////////////////////////////////////////
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
          if(result==null) resHttp.json([]);
          else{
              var multi = self.client.multi();
              let keys = Object.keys(result)
              var values = keys.map(function(key){ multi.hgetall(key)});
              multi.exec(function(err, values){
                  if(err) resHttp.json(err);
                  else    resHttp.json(values);
              });
          }
      }
  });
};
//pos={latitude: 43.6667, longitude: -79.4167}
RedisAPI.prototype.setMsgDB = function(resHttp,msg){
  var k = getKey(msg)
  //var pos = {latitude: msg.lat, longitude:msg.lng};
  let self=this
  this.client.hmset(k, msg, function(err, result) {
    if(err!=null){
      //console.log('post.bad -> setMsgDB() err='+err+'\nresult='+JSON.stringify(result)+'\nmsg='+JSON.stringify(msg))
      resHttp.json(err)
    }else{
      var small = {}
      for(var key in msg){
        if(key.indexOf('#')<0){
          small[key]=msg[key]
        }
      }
      //{type:msg.type,cat:msg.cat,lat:msg.lat,lng:msg.lng,ctime:msg.ctime,phone:msg.phone}
      resHttp.json(small)
      //console.log('post.good -> setMsgDB() err='+err+'\nresult='+JSON.stringify(result)+'\nmsg='+JSON.stringify(small))
      /*self.client.hgetall(k,function(err,reply){
        //if(err) resHttp.json(err);
        console.log('post.good -> setMsgDB() small='+JSON.stringify(small)+'\nmsg='+JSON.stringify(reply))
        resHttp.json(reply);
      })*/
    }
  });
  //this.setTypeDB(msg.type);
  this.setGeoDB(msg);
  this.setGeoTTL(k,msg);
};
RedisAPI.prototype.setGeoDB = function(msg){
/*
  let arr=key.split(':')
  let geoset = arr[0]
  let pos = arr[1].split(',')
  let lat = pos[0]
  let lng = pos[1]
  let ctime=arr[2]
*/
  let geoset = getGeoSet(msg)
  let name = getGeoKey(msg)
  this.client.geoadd(geoset,msg.lng,msg.lat,name);
};
RedisAPI.prototype.setGeoTTL = function(key,msg){
  let dayInt = (60*60*24)
  let timeInt = msg.ctime
  if(typeof timeInt==='string') timeInt=parseInt(timeInt)
  let ttl = timeInt+dayInt*30;
  if(msg.time){  //'2016-11-22 10:30'
    let rawTime = new Date(msg.time+":00").getTime()
    let nextDay = rawTime+dayInt
    //console.log('msg.time='+msg.time+'  rawTime='+rawTime+'  nextDay='+nextDay)
    ttl = Math.round(nextDay/1000)
  }
  this.client.expireat(key, ttl);
  let ttl_set_name = 'ttl.'+getGeoSet(msg)
  let geokey = getGeoKey(msg)
  this.client.zadd(ttl_set_name,ttl,geokey);
};
RedisAPI.prototype.rmGeoTTL = function(key){
  let self = this;
  let arr = key.split(':');  //cat_buy:lat,lng:ctime
  let geo_set_name = 'geo:'+arr[0]
  let ttl_set_name = 'ttl.'+geo_set_name
  let nowInt = Math.round(+new Date()/1000)
  let key1 = arr[1]+':'+arr[2]
  //console.log('rm geo/ttl:'+key1)
  self.client.zrem(ttl_set_name,key1);
  self.client.zrem(geo_set_name,key1);
  //rm all expired geo rows
  this.client.zrangebyscore(ttl_set_name,0,nowInt, function (err, keys) {
    keys.map((key)=>{
      self.client.zrem(ttl_set_name,key);
      self.client.zrem(geo_set_name,key);
    })
  });
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
  this.rmGeoTTL(k);
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
