package com.bit.boardapp.shared.storage;

import io.minio.MinioClient;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.net.URI;

@Configuration
@ConditionalOnProperty(name = "storage.provider", havingValue = "minio", matchIfMissing = true)
public class MinioStorageConfiguration {
    @Bean
    public MinioClient minioClient(@Value("${minio.endPoint}") String endpoint,
                                   @Value("${minio.access-key}") String accessKey,
                                   @Value("${minio.secret-key}") String secretKey) {
        URI uri = URI.create(endpoint);
        int port = uri.getPort() == -1 ? 9000 : uri.getPort();
        return MinioClient.builder()
                .endpoint(uri.getHost(), port, "https".equalsIgnoreCase(uri.getScheme()))
                .credentials(accessKey, secretKey)
                .region("us-east-1")
                .build();
    }
}
