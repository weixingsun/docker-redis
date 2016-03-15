curl -H "Content-Type: application/json" -XPOST -d '{ "type":"car", "lat":-43.52, "lng":172.62, "ctime":160226013945, "owner":"sun", "title":"test2", "content":"empty", "pics":"", "tags":"" }' localhost:8080/api/msg
curl -H "Content-Type: application/json" -XPOST -d '{ "type":"car", "lat":-43.53, "lng":172.63, "ctime":160226013945, "owner":"sun", "title":"test2", "content":"empty", "pics":"", "tags":"" }' localhost:8080/api/msg
curl -H "Content-Type: application/json" -XPOST -d '{ "type":"car", "lat":-43.54, "lng":172.64, "ctime":160226013945, "owner":"sun", "title":"test2", "content":"empty", "pics":"", "tags":"" }' localhost:8080/api/msg

curl -H "Content-Type: application/json" -XPOST -d '{ "type":"car", "lat":-43.53, "lng":172.62, "ctime":160226013945, "owner":"sun", "title":"test2", "content":"empty", "pics":"", "tags":"" }' localhost:8080/api/msg
