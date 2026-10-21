package com.bit.boardapp.shared.storage;

import io.minio.MinioClient;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.test.context.TestConfiguration;

import static org.assertj.core.api.Assertions.assertThat;

class StorageProviderConfigurationTest {
    private final ApplicationContextRunner context = new ApplicationContextRunner()
            .withUserConfiguration(MinioStorageConfiguration.class, MinioFileStorage.class);

    @Test
    void minioIsTheDefaultProvider() {
        context.withPropertyValues("minio.endPoint=http://127.0.0.1", "minio.access-key=test-access",
                        "minio.secret-key=test-secret", "minio.bucket=test-bucket")
                .run(application -> {
                    assertThat(application).hasSingleBean(FileStorage.class);
                    assertThat(application.getBean(FileStorage.class)).isInstanceOf(MinioFileStorage.class);
                });
    }

    @Test
    void replacingStorageDoesNotRequireMinioCredentialsOrChangesToFeatureCode() {
        context.withPropertyValues("storage.provider=local")
                .withUserConfiguration(LocalStorageConfiguration.class)
                .run(application -> {
                    assertThat(application).hasSingleBean(FileStorage.class);
                    assertThat(application).doesNotHaveBean(MinioClient.class);
                    assertThat(application.getBean(FileStorage.class))
                            .isSameAs(application.getBean("localStorage"));
                });
    }

    @TestConfiguration(proxyBeanMethods = false)
    static class LocalStorageConfiguration {
        @Bean
        FileStorage localStorage() {
            return (file, directory) -> new StoredFile("local-file", directory, file.getOriginalFilename(),
                    "application/octet-stream");
        }
    }
}
