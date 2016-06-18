#!/usr/bin/env bash
sysctl -p;
service nginx start
#service ssh   start
#echo never > /sys/kernel/mm/transparent_hugepage/enabled
REDIS_VERSION=redis-3.2.1
/$REDIS_VERSION/src/redis-server /$REDIS_VERSION/redis.conf
/node/bin/node /src/main.js 
#> /tmp/log.node 2>&1
