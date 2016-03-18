#FROM nginx:latest
#FROM debian:latest
FROM nginx:latest
#MAINTAINER Weixing Sun <weixing.sun@gmail.com>
ENV REDIS_VER=redis-3.2.0-rc3
COPY conf.tar.gz $REDIS_VER.tar.gz src.tar.gz node.tar.gz /
RUN tar zxf node.tar.gz && tar zxf src.tar.gz && tar zxf conf.tar.gz && tar zxf $REDIS_VER.tar.gz && \
    mv /conf/sysctl.conf /etc/ && mv /conf/limit.conf /etc/security/limits.d/ && \
    mv /conf/nginx.conf /etc/nginx/ && mv /conf/sites.default /etc/nginx/ && \
    mkdir /www && echo "" > /www/index.html
ENTRYPOINT ["/src/run.sh"]
EXPOSE 80 8080
#docker build -t wsun/redis .
#docker run -d --name redis -v ~/data:/data -p 80:80 -m 512m -it wsun/redis 
#--privileged
