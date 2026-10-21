package com.bit.boardapp.board.application;

import com.bit.boardapp.board.application.dto.BoardFileDTO;
import com.bit.boardapp.shared.storage.FileStorage;
import com.bit.boardapp.shared.storage.StoredFile;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/** Board-specific attachment metadata stays outside the shared storage adapter. */
@Service
@RequiredArgsConstructor
public class BoardAttachmentService {
    private final FileStorage fileStorage;

    public BoardFileDTO upload(MultipartFile file) {
        StoredFile stored = fileStorage.store(file, "board/");
        return BoardFileDTO.builder()
                .boardFileName(stored.fileName())
                .boardFilePath(stored.directory())
                .boardFileOrigin(stored.originalName())
                .boardFileCate(stored.contentType().startsWith("image/") ? "image" : "etc")
                .build();
    }
}
