#docker build -t wsun/redis .
docker run -d --name redis -v ~/data:/data -p 80:80 -m 512m -it wsun/redis 
#--privileged
