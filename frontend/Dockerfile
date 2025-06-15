### 개발용 (dev)
FROM node:18 AS development
WORKDIR /app
# 의존성 설치를 위한 파일 먼저 복사
COPY package.json .
COPY . .

RUN npm install
EXPOSE 3000
CMD npm start

### 운영용 (prod)
FROM node:18 AS builder
WORKDIR /app
RUN npm install
COPY ./frontend ./
RUN npm run build

FROM nginx:stable-alpine AS production
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]