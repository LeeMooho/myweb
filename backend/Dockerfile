# Build stage
FROM eclipse-temurin:17-jdk AS builder
WORKDIR /app

COPY . .
RUN ./gradlew clean build -x test

# Run stage
FROM eclipse-temurin:17-jdk
WORKDIR /app

# wait-for-it.sh 다운로드 및 실행 권한 부여
RUN apt-get update && apt-get install -y curl \
    && curl -o wait-for-it.sh https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh \
    && chmod +x wait-for-it.sh


COPY --from=builder /app/build/libs/board-app-0.0.1-SNAPSHOT.jar /app/app.jar


# 포트 개방
EXPOSE 8080 5005

# JVM 디버깅 옵션 추가
ENTRYPOINT ["./wait-for-it.sh", "db:3306", "--", "java", "-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005", "-jar", "/app/app.jar"]
