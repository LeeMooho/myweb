FROM node:22 AS development
WORKDIR /app
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
EXPOSE 3000
CMD ["npm", "start"]

FROM node:22 AS builder
WORKDIR /app
ARG REACT_APP_API_URL=/api
ARG REACT_APP_MINIO_API_URL=/storage/mywebbucket/
ARG REACT_APP_FRONT_URL
ARG REACT_APP_BACK_URL
ARG REACT_APP_KAKAO_REST_API
ARG REACT_APP_GOOGLE_REST_API
ENV REACT_APP_API_URL=${REACT_APP_API_URL} \
    REACT_APP_MINIO_API_URL=${REACT_APP_MINIO_API_URL} \
    REACT_APP_FRONT_URL=${REACT_APP_FRONT_URL} \
    REACT_APP_BACK_URL=${REACT_APP_BACK_URL} \
    REACT_APP_KAKAO_REST_API=${REACT_APP_KAKAO_REST_API} \
    REACT_APP_GOOGLE_REST_API=${REACT_APP_GOOGLE_REST_API}
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM nginx:stable-alpine AS production
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
