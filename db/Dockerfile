FROM mysql:8.0

COPY init.sql /docker-entrypoint-initdb.d

ENV MYSQL_ROOT_PASSWORD=1234qwer!
ENV MYSQL_DATABASE=mywebdb
ENV MYSQL_HOST=%

CMD ["--character-set-server=utf8mb4", "--collation-server=utf8mb4_unicode_ci"]