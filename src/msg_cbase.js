var express = require('express');
var couchbase = require('couchbase');
//var ViewQuery = couchbase.ViewQuery;
var cluster = new couchbase.Cluster('couchbase://172.17.0.1');
var bucket = cluster.openBucket('default');
//////////////////todo: pooling
var bodyParser = require('body-parser');
//var urlencodedParser = bodyParser.urlencoded({ extended: false })
//var jsonParser = bodyParser.json()
var N1qlQuery = couchbase.N1qlQuery;
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.enable('trust proxy');
// msg = {  lat,lng,create_time,owner,title,content,pics,tags, };

function rangeMsgDB(resHttp,req) {
  //params = {lat1, lat2, lng1, lng2, owner, content, create_time, title, tags, pics}
  var lats = req.params.lats;
  var lngs = req.params.lngs;
  var lat1=lats.split(',')[0], lat2=lats.split(',')[1],lng1=lngs.split(',')[0], lng2=lngs.split(',')[1];
  var sql = "SELECT META().id AS id, * FROM default WHERE lat between "+ lat1 + " and "+ lat2 +" and lng between "+lng1+" and "+lng2;
  //type='beer' LIMIT " + ENTRIES_PER_PAGE
  //console.log("sql: " +sql);
  var query = N1qlQuery.fromString(sql).adhoc(false);
  bucket.query(query, function(err, results) {
    //console.log("Found " + results.length + " documents");
    //for(i in results) {
        //console.log("item: id="+i.id + ', key=' + i.key);
    if(err) resHttp.json(err);
    else    resHttp.json(results);
    //}
  });
}
function getMsgDB(resHttp,latlng) {
  bucket.get(latlng, function(err, result) {
    if(err) resHttp.json(err);
    else    resHttp.json(result.value);
  });
}
function upsertMsgDB(resHttp,msg){
  bucket.upsert(msg.lat+','+msg.lng, msg, function(err, result) {
    if(err) resHttp.json(err);
    else    resHttp.json(msg);
  });
}
function deleteMsgDB(resHttp,latlng){
  bucket.remove(latlng, function(err, result) {
    if(err) resHttp.json(err);
    else    resHttp.json(result.value);
  });
}
//app.get(url,parser,function)
app.get('/api/msgs/:lats&:lngs', function (req, res) {
  rangeMsgDB(res,req);
});
app.post('/api/msg', function (req, res) {
  upsertMsgDB(res,req.body);
});
app.get('/api/msg/:latlng', function(req, res){
  getMsgDB(res,req.params.latlng);
});
app.delete('/api/msg/:latlng',function(req, res){
  deleteMsgDB(res,req.params.latlng);
});
app.listen(8080,'0.0.0.0');
