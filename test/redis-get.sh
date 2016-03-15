redis-cli <<EOF
hmset "car:111:222" type car lat 111 lng 222 
hgetall "car:111:222"
geoadd car 172.62 -43.54  -43.54,172.62
geodist car -43.52,172.62 -43.53,172.62
geohash car -43.52,172.62 -43.53,172.62
EOF
