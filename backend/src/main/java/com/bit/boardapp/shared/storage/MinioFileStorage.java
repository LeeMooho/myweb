package com.bit.boardapp.shared.storage;

import io.minio.MinioClient;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import io.minio.PutObjectArgs;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Component
@ConditionalOnProperty(name = "storage.provider", havingValue = "minio", matchIfMissing = true)
public class MinioFileStorage implements FileStorage {
    private final MinioClient client;
    private final String bucket;

    public MinioFileStorage(MinioClient client, @Value("${minio.bucket:mywebbucket}") String bucket) {
        this.client = client;
        this.bucket = bucket;
    }

    @Override
    public StoredFile store(MultipartFile file, String directory) {
        String originalName = file.getOriginalFilename();
        String fileName = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS"))
                + "_" + UUID.randomUUID() + "_" + originalName;
        try (InputStream stream = file.getInputStream()) {
            String contentType = file.getContentType();
            if (contentType == null || contentType.isBlank()) {
                contentType = originalName == null ? null : Files.probeContentType(Path.of(originalName));
            }
            if (contentType == null) contentType = "application/octet-stream";
            client.putObject(PutObjectArgs.builder()
                    .bucket(bucket).object(directory + fileName)
                    .stream(stream, file.getSize(), -1)
                    .contentType(contentType).build());
            return new StoredFile(fileName, directory, originalName, contentType);
        } catch (Exception error) {
            throw new FileStorageException("File upload failed", error);
        }
    }
}
