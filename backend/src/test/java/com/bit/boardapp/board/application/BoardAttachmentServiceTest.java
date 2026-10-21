package com.bit.boardapp.board.application;

import com.bit.boardapp.board.application.dto.BoardFileDTO;
import com.bit.boardapp.shared.storage.FileStorage;
import com.bit.boardapp.shared.storage.StoredFile;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.mock.web.MockMultipartFile;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class BoardAttachmentServiceTest {
    @ParameterizedTest
    @CsvSource({"image/png,image", "application/pdf,etc"})
    void featureMetadataDependsOnlyOnTheStorageContract(String contentType, String expectedCategory) {
        FileStorage storage = mock(FileStorage.class);
        MockMultipartFile upload = new MockMultipartFile("file", "original.file", contentType, new byte[] {1});
        when(storage.store(upload, "board/"))
                .thenReturn(new StoredFile("stored.file", "board/", "original.file", contentType));

        BoardFileDTO result = new BoardAttachmentService(storage).upload(upload);

        assertThat(result.getBoardFileName()).isEqualTo("stored.file");
        assertThat(result.getBoardFilePath()).isEqualTo("board/");
        assertThat(result.getBoardFileOrigin()).isEqualTo("original.file");
        assertThat(result.getBoardFileCate()).isEqualTo(expectedCategory);
        verify(storage).store(upload, "board/");
    }
}
