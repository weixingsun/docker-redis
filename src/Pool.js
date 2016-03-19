//client.expire('key1', 30);
//var Pool = require('redis-connection-pool')('myRedisPool', {
//    host: '127.0.0.1', // default
//    port: 6379, //default
//    max_clients: 30, // defalut
//    perform_checks: false, // checks for needed push/pop functionality
//    database: 0, // database number to use
//    options: { auth_pass: 'password' }
//  });
function PoolObj() {
    this.pool = require('sol-redis-pool')({
        host:'127.0.0.1',
        port: 6379,
        enable_offline_queue: true,
        no_ready_check: true
    },{
        idleTimeoutMillis: 5000,
        max:10,
        min:1
    });
    this.pool.on('error', function(reason) {
        console.log('Connection Error:', reason);
    });
    this.georedis = require('georedis');
}
PoolObj.prototype.getJson = function(name, resHttp){
    var _pool = this.pool;
    _pool.acquire(function(err,client){
        client.hgetall(name,function(err,reply){
            if(err) resHttp.json(err);
            else    resHttp.json(reply);
            _pool.release(client);
        });
    });
};
PoolObj.prototype.getManyJson = function(names, resHttp){
    var _pool = this.pool;
    _pool.acquire(function(err,client){
        var multi = client.multi();
        var values = names.map(function(name){
            multi.incr("hgetall "+name);
        });
        multi.exec(function(err, values){
            if(err) resHttp.json(err);
            else    resHttp.json(values);
            _pool.release(client);
        });
    });
};
PoolObj.prototype.setJson = function(msg, resHttp){
    var _pool = this.pool;
    var k = msg.type+':'+msg.lat+','+msg.lng;
    //var pos = {latitude: msg.lat, longitude:msg.lng};
    _pool.acquire(function(err,client){
        client.hmset(k,msg,function(err,reply){
            if(err) resHttp.json(err);
            else    resHttp.json(reply);
            _pool.release(client);
        });
        //this.setGeoDB(k,pos);
    });
};
PoolObj.prototype.rmMsgDB = function(key, resHttp){
    var _pool = this.pool;
    _pool.acquire(function(err,client){
        client.del(key,function(err,reply){
            if(err) resHttp.json(err);
            else    resHttp.json(reply);
            _pool.release(client);
        });
        //geo.rmGeoDB(k)
    });
};
PoolObj.prototype.typeInc = function(key){
    var _pool = this.pool;
    _pool.acquire(function(err,client){
        client.incr("score:"+key, function(err,score){
            var args = ['types', score, key];
            client.zadd(args, function(e,reply) {
                if(e) console.error(e);
                else  console.log(reply);
                _pool.release(client);
            });
        });
    });
};
PoolObj.prototype.getGeoSetName = function(type, client){
    return this.georedis.initialize(client, { zset: 'geotype:'+type });
};
//pos={latitude: 43.6667, longitude: -79.4167}
PoolObj.prototype.setGeoDB = function(msg){
    var pos = {latitude: msg.lat, longitude:msg.lng};
    var name = msg.type+':'+msg.lat+','+msg.lng;
    var _this = this;
    _this.pool.acquire(function(err,client){
        var geo = _this.getGeoSetName(msg.type,client);
        geo.addLocation(name, pos, function(err, reply){
            if(err) console.error(err);
            //else  console.log('added location:', reply);
            _this.pool.release(client);
        });
    });
};
PoolObj.prototype.rmGeoDB = function(key){
    var type = key.split(':')[0];
    var _this = this;
    _this.pool.acquire(function(err,client){
        var geo = _this.getGeoSetName(type,client);
        geo.removeLocation(key, function(e, reply){
            if(e) console.error(e);
            //else  console.log('removed location:', reply);
            _this.pool.release(client);
        });
    });
};
PoolObj.prototype.getOptions = function(){
  return {
    //withCoordinates: true, // Will provide coordinates with locations, default false
    //withHashes: true, // Will provide a 52bit Geohash Integer, default false
    withDistances: true, // Will provide distance from query, default false
    order: 'ASC', // or 'DESC' or true (same as 'ASC'), default false
    units: 'm', // or 'km', 'mi', 'ft', default 'm'
    count: 20, // Number of results to return, default undefined
    accurate: true // Useful if in emulated mode and accuracy is important, default false
  };
};
PoolObj.prototype.toJson = function(strPos){
    var values = strPos.split(',');
    return {latitude:values[0],longitude:values[1]};
};
PoolObj.prototype.range = function(type,pos,dist,resHttp){
    var _this = this;
    _this.pool.acquire(function(err,client){
        var geo = _this.getGeoSetName(type,client);
        var loc = _this.toJson(pos);
        var opt = _this.getOptions();
        geo.nearby(loc, dist, opt, function(err, locations){
            if(err) resHttp.json(err);
            else    _this.rangeRealData(resHttp,locations);
            _this.pool.release(client);
        });
    });
};
PoolObj.prototype.getKeysFromLocations = function(locations){
    return locations.map(function(item) {
        return item.key;
    });
};
PoolObj.prototype.rangeRealData = function(resHttp,locations){
    var _this = this;
    _this.pool.acquire(function(err,client){
        var multi = client.multi();
        var values = locations.map(function(item){ multi.hgetall(item.key)});
        multi.exec(function(e, values){
            if(e) resHttp.json(e);
            else  resHttp.json(values);
            _this.pool.release(client);
        });
    });
};
module.exports = PoolObj;
