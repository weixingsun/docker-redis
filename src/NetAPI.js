//var https = require('https');
function NetAPI() {}

//localhost/service/onesignal.php?
NetAPI.prototype.getphp = function(url) {
  var request = require('request');
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body)
    }
  })
};
NetAPI.prototype.makepushjson = function (json) {
  return {
    app_id: "beed51f1-1763-4ab3-bcd2-da4364786ceb",
    contents: {"en": json.title},
    data: {"tag_notification": json.type+'_'+json.cat+':'+json.lat+','+json.lng+':'+json.ctime},
    filters: [
      {"field": "tag", "key": json.type+'_'+json.cat, "relation": "=", "value": json.country+' '+json.city}, 
      //{"operator": "OR"}, 
      //{"field": "amount_spent", "relation": ">", "value": "0"}
    ]
  };
};
// Net.push(Net.makepushjson())
NetAPI.prototype.push = function(data) {
  var headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Authorization": "Basic NWM5ZjRhOGQtOWM2Yi00NzY3LWFlMjktNzcxMWU4ZThlMGE1"
  };
  
  var options = {
    host: "onesignal.com",
    port: 443,
    path: "/api/v1/notifications",
    method: "POST",
    headers: headers
  };
  
  var https = require('https');
  var req = https.request(options, function(res) {  
    res.on('data', function(res) {
      //console.log("Response:");
      //console.log(data);
      //console.log(JSON.parse(res));
    });
  });
  
  req.on('error', function(e) {
    console.log("OneSignal push to tags ERROR:");
    console.log(e);
  });
  
  req.write(JSON.stringify(data));
  req.end();
};
module.exports = NetAPI;
