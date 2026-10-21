package com.bit.boardapp.shared.storage;

import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class MinioFileStorageTest {
    private final MinioClient client = mock(MinioClient.class);
    private final FileStorage storage = new MinioFileStorage(client, "test-bucket");

    @Test
    void uploadsOriginalBytesAndReturnsProviderIndependentMetadata() throws Exception {
        byte[] bytes = "attachment contents".getBytes(StandardCharsets.UTF_8);
        MockMultipartFile upload = new MockMultipartFile("upload", "report.pdf", "application/pdf", bytes);
        when(client.putObject(any())).thenAnswer(call -> {
            PutObjectArgs args = call.getArgument(0);
            assertThat(args.stream().readAllBytes()).isEqualTo(bytes);
            return null;
        });

        StoredFile stored = storage.store(upload, "reports/");

        ArgumentCaptor<PutObjectArgs> args = ArgumentCaptor.forClass(PutObjectArgs.class);
        verify(client).putObject(args.capture());
        assertThat(args.getValue().bucket()).isEqualTo("test-bucket");
        assertThat(args.getValue().object()).isEqualTo("reports/" + stored.fileName());
        assertThat(args.getValue().contentType()).isEqualTo("application/pdf");
        assertThat(stored.originalName()).isEqualTo("report.pdf");
        assertThat(stored.directory()).isEqualTo("reports/");
        assertThat(stored.fileName()).endsWith("_report.pdf");
    }

    @Test
    void unknownFileTypesUseAnExplicitBinaryContentType() {
        StoredFile stored = storage.store(new MockMultipartFile("upload", "file.unregistered-board-format", null,
                new byte[] {1, 2, 3}), "attachments/");
        assertThat(stored.contentType()).isEqualTo("application/octet-stream");
    }

    @Test
    void failedUploadDoesNotReturnSuccessfulMetadata() throws Exception {
        IOException failure = new IOException("Storage unavailable");
        when(client.putObject(any())).thenThrow(failure);

        assertThatThrownBy(() -> storage.store(new MockMultipartFile("upload", "file.txt", "text/plain",
                new byte[] {1}), "attachments/"))
                .isInstanceOf(FileStorageException.class)
                .hasMessage("File upload failed")
                .hasCause(failure);
    }
}
