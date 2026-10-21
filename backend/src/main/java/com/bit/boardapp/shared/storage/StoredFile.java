package com.bit.boardapp.shared.storage;

/** Metadata returned only after the storage provider has accepted the upload. */
public record StoredFile(String fileName, String directory, String originalName, String contentType) { }
