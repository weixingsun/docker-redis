var redis = require('redis');
//var msgClient = redis.createClient();
var geoClient = redis.createClient(); //.select(1);
var geo = require('georedis').initialize(geoClient);
function addGeoDB(name,pos){
  geo.addLocation('Toronto', {latitude: 43.6667, longitude: -79.4167}, function(err, reply){
    if(err) console.error(err)
    else console.log('added location:', reply)
  })
}
addGeoDB(1,2);
