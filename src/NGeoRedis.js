//geoClient.select(1);
//client.expire('key1', 30);
function NGeoRedisAPI(client) {
    this.client = client;
}

NGeoRedisAPI.prototype.opsFullname = function(fullname){
  var values = fullname.split(':');
  var type = values[0];
  var name = values[1]+':'+values[2];
  //console.log('type='+type+',name='+name)
  var geo = require('georedis').initialize(this.client, {
    zset: 'geo:'+type //+'_'+cat,
  })
  return [geo,name];
};
//pos={latitude: 43.6667, longitude: -79.4167}
NGeoRedisAPI.prototype.setGeoDB = function(fullname,pos){
  var values = this.opsFullname(fullname);
  values[0].addLocation(values[1], pos, function(err, reply){  //key:lat:lng:ctime
    if(err) console.error(err)
    //else console.log('added location:', reply)
  });
};
NGeoRedisAPI.prototype.rmGeoDB = function(fullname){
  var values = this.opsFullname(fullname);
  values[0].removeLocation(values[1], function(err, reply){
    if(err) console.error(err)
    else console.log('removed location:', reply)
  })
};
NGeoRedisAPI.prototype.getGeoDB = function(fullname){
  var values = this.opsFullname(fullname);
  values[0].location(values[1], function(err, loc){
    if(err) console.error(err)
    else console.log('location: '+values[1]+':', loc.latitude, loc.longitude)
  });
};
NGeoRedisAPI.prototype.range = function(resHttp,type,cat,pos,dist ){
  var _this = this;
  var options = {
    //withCoordinates: true, // Will provide coordinates with locations, default false
    //withHashes: true, // Will provide a 52bit Geohash Integer, default false
    withDistances: true, // Will provide distance from query, default false
    order: 'ASC', // or 'DESC' or true (same as 'ASC'), default false
    units: 'm', // or 'km', 'mi', 'ft', default 'm'
    count: 20, // Number of results to return, default undefined
    accurate: true // Useful if in emulated mode and accuracy is important, default false
  };
  var geo = require('georedis').initialize(this.client, {
    zset: 'geo:'+type+'_'+cat,
  });
  var values = pos.split(',');
  var posJson = {latitude:values[0],longitude:values[1]};
  geo.nearby(posJson, dist, options, function(err, locations){
    if(err) resHttp.json(err);
    else    _this.rangeFull(resHttp,type,cat,locations);
  });
};
NGeoRedisAPI.prototype.rangeFull = function(resHttp,type,cat,locations){
  var keys = locations.map(function(item) {
    return type+'_'+cat+':'+item.key;  //key=type:geokey, geokey=lat,lng:ctime
  });
  //console.log(keys);
  var multi = this.client.multi();
  var values = keys.map(function(key){ multi.hgetall(key)});
  multi.exec(function(err, values){
    if(err) resHttp.json(err);
    //else    resHttp.json({radius:locations, msgs:values});
    else    resHttp.json(values);
  });
};
module.exports = NGeoRedisAPI;
