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
import java.util.Map;
import java.util.Set;
import java.util.Locale;

@Component
@ConditionalOnProperty(name = "storage.provider", havingValue = "minio", matchIfMissing = true)
public class MinioFileStorage implements FileStorage {
    private static final Set<String> INLINE_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/bmp", "image/avif");
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
            String mediaType = contentType.split(";", 2)[0].trim().toLowerCase(Locale.ROOT);
            // Attachments are served on the app origin; active HTML/SVG must download.
            String disposition = INLINE_IMAGE_TYPES.contains(mediaType) ? "inline" : "attachment";
            client.putObject(PutObjectArgs.builder()
                    .bucket(bucket).object(directory + fileName)
                    .stream(stream, file.getSize(), -1)
                    .contentType(contentType)
                    .headers(Map.of("Content-Disposition", disposition)).build());
            return new StoredFile(fileName, directory, originalName, contentType);
        } catch (Exception error) {
            throw new FileStorageException("File upload failed", error);
        }
    }
}
