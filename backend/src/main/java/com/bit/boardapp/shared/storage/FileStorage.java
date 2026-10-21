package com.bit.boardapp.shared.storage;

import org.springframework.web.multipart.MultipartFile;

/** Generic upload contract; feature modules do not depend on a storage vendor. */
public interface FileStorage {
    StoredFile store(MultipartFile file, String directory);
}
