FROM eclipse-temurin:17-jdk AS builder
WORKDIR /app
COPY . .
RUN bash gradlew --no-daemon --max-workers=2 clean bootJar

FROM eclipse-temurin:17-jre
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /app/build/libs/board-app-0.0.1-SNAPSHOT.jar /app/app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
