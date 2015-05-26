docker stop activiti
docker rm activiti
docker stop mysql
docker rm mysql


docker run --name=mysql -d \
  -e 'DB_NAME=activiti_production' -e 'DB_USER=activiti' -e 'DB_PASS=password' \
    -v /opt/mysql/data:/var/lib/mysql \
    -p 3306:3306 sameersbn/mysql:latest

docker run --name=activiti -d --link mysql:mysql \
  -p 8080:8080 eternnoir/activiti:latest
