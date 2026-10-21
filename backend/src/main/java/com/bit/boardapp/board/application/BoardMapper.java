package com.bit.boardapp.board.application;

import com.bit.boardapp.board.application.dto.BoardDTO;
import com.bit.boardapp.board.application.dto.BoardFileDTO;
import com.bit.boardapp.board.domain.Board;
import com.bit.boardapp.board.domain.BoardFile;

import java.time.LocalDateTime;
import java.util.ArrayList;

/** Keeps transport DTOs outside the persistence/domain model. */
public final class BoardMapper {
    private BoardMapper() { }

    public static BoardDTO toDTO(Board board) {
        return BoardDTO.builder()
                .boardNo(board.getBoardNo())
                .boardTitle(board.getBoardTitle())
                .boardContent(board.getBoardContent())
                .boardWriter(board.getBoardWriter())
                .boardRegdate(board.getBoardRegdate().toString())
                .boardCnt(board.getBoardCnt())
                .boardFileDTOList(board.getBoardFileList().stream().map(BoardMapper::toDTO).toList())
                .build();
    }

    public static Board toEntity(BoardDTO dto) {
        return Board.builder()
                .boardNo(dto.getBoardNo())
                .boardTitle(dto.getBoardTitle())
                .boardContent(dto.getBoardContent())
                .boardWriter(dto.getBoardWriter())
                .boardRegdate(LocalDateTime.parse(dto.getBoardRegdate()))
                .boardCnt(dto.getBoardCnt())
                .boardFileList(new ArrayList<>())
                .build();
    }

    public static BoardFileDTO toDTO(BoardFile file) {
        return BoardFileDTO.builder()
                .boardFileNo(file.getBoardFileNo())
                .boardNo(file.getBoard().getBoardNo())
                .boardFileName(file.getBoardFileName())
                .boardFilePath(file.getBoardFilePath())
                .boardFileOrigin(file.getBoardFileOrigin())
                .boardFileCate(file.getBoardFileCate())
                .boardFileStatus(file.getBoardFileStatus())
                .newFileName(file.getNewFileName())
                .build();
    }

    public static BoardFile toEntity(BoardFileDTO dto, Board board) {
        return BoardFile.builder()
                .board(board)
                .boardFileNo(dto.getBoardFileNo())
                .boardFileName(dto.getBoardFileName())
                .boardFileOrigin(dto.getBoardFileOrigin())
                .boardFileCate(dto.getBoardFileCate())
                .boardFilePath(dto.getBoardFilePath())
                .boardFileStatus(dto.getBoardFileStatus())
                .newFileName(dto.getNewFileName())
                .build();
    }
}
