package com.bit.boardapp.entity;

import com.bit.boardapp.dto.BoardFileDTO;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "T_BOARD_FILE")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SequenceGenerator(
        name = "BoardFileSeqGenerator",
        sequenceName = "T_BOARD_FILE_SEQ",
        initialValue = 1,
        allocationSize = 1
)
public class BoardFile {
    @Id
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "BoardFileSeqGenerator"
    )
    private long boardFileNo;

    @ManyToOne
    @JoinColumn(name = "BOARD_NO")
    @JsonBackReference
    private Board board;
    private String boardFileName;
    private String boardFilePath;
    private String boardFileOrigin;
    private String boardFileCate;
    @Transient
    private String boardFileStatus;
    @Transient
    private String newFileName;

    public BoardFileDTO toDTO() {
        return BoardFileDTO.builder()
                .boardFileNo(this.boardFileNo)
                .boardNo(this.board.getBoardNo())
                .boardFileName(this.boardFileName)
                .boardFilePath(this.boardFilePath)
                .boardFileOrigin(this.boardFileOrigin)
                .boardFileCate(this.boardFileCate)
                .boardFileStatus(this.boardFileStatus)
                .newFileName(this.newFileName)
                .build();
    }
}
