#도커 명령어
로컬
docker-compose up -d
→ 자동으로 .env + .env.override + docker-compose.override.yml 적용

다른 명령어는 docker-compose --env-file .env up --build라고 하는데 확인해야할 듯

운영
docker compose --env-file .env.prod -f docker-compose.prod.yml build --no-cache


docker compose --env-file .env.prod -f docker-compose.prod.yml up --build -d


sudo apt update
sudo apt install npm -y
rm -rf node_modules package-lock.json
npm install
npm run build

docker compose -f docker-compose.prod.yml down