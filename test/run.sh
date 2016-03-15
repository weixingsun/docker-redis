#!/usr/bin/env bash
sysctl -p;
#service nginx start
#service ssh   start
echo never > /sys/kernel/mm/transparent_hugepage/enabled
echo 2048 > /proc/sys/net/core/somaxconn
REDIS_VERSION=redis-3.2.0-rc3
cd /$REDIS_VERSION && src/redis-server redis.conf
#cd /opt && /opt/node/bin/node /opt/msg.js 
#> /tmp/log.node 2>&1
