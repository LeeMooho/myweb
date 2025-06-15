package com.bit.boardapp.dto;

import com.bit.boardapp.entity.Board;
import com.bit.boardapp.entity.BoardFile;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class BoardFileDTO {
    private long boardFileNo;
    private long boardNo;
    private String boardFileName;
    private String boardFilePath;
    private String boardFileOrigin;
    private String boardFileCate;
    private String boardFileStatus;
    private String newFileName;

    public BoardFile toEntity(Board board) {
        return BoardFile.builder()
                .board(board)
                .boardFileNo(this.boardFileNo)
                .boardFileName(this.boardFileName)
                .boardFileOrigin(this.boardFileOrigin)
                .boardFileCate(this.boardFileCate)
                .boardFilePath(this.boardFilePath)
                .boardFileStatus(this.boardFileStatus)
                .newFileName(this.newFileName)
                .build();
    }
}
