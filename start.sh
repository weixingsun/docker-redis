#REDIS_VERSION=redis-3.2.0-rc3
#$REDIS_VERSION/src/redis-server $REDIS_VERSION/redis.conf
docker run -d --name redis -v ~/data:/data -p 80:80 -m 512m -it wsun/redis
