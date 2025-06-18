package com.bit.boardapp.configuration;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class NaverConfiguration {
    @Value("${ncp.regionName}")
    private String regionName;

    @Value("${minio.endPoint}")
    private String endPoint;

    @Value("${minio.access-key}")
    private String accessKey;

    @Value("${minio.secret-key}")
    private String secretKey;
}
