package com.bit.boardapp.configuration;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class NaverConfiguration {
    @Value("${ncp.accessKey}")
    private String accessKey;

    @Value("${ncp.secretKey}")
    private String secretKey;

    @Value("${ncp.regionName}")
    private String regionName;

    @Value("${ncp.endPoint}")
    private String endPoint;
}
