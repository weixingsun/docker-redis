#docker build -t wsun/redis .
docker run -d --name redis -v ~/data:/data -p 80:80 -m 512m -it wsun/redis 
#--privileged
#docker run -d --name redis -v ~/data:/data -p 80:80 wsun/redis
#docker run -d --name redis -v ~/data:/data -p 6379:6379 -m 384m redis

#iptables -I FORWARD -d 172.17.0.2 -p tcp --dport 6379 -j ACCEPT
#iptables_list
#iptables -D FORWARD 1
#redis-cli -h 172.17.0.2
#KEYS *
