package com.bit.boardapp.entity;

import com.bit.boardapp.dto.BoardDTO;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "T_BOARD")
@SequenceGenerator(
        name = "BoardSeqGenerator",
        sequenceName = "T_BOARD_SEQ",
        initialValue = 1,
        allocationSize = 1
)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Board {
    @Id
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "BoardSeqGenerator"
    )
    private long boardNo;
    private String boardTitle;
    private String boardContent;
    private String boardWriter;
    private LocalDateTime boardRegdate;
    private int boardCnt;
    @Transient
    private String searchCondition;
    @Transient
    private String searchKeyword;
    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<BoardFile> boardFileList;

    public BoardDTO toDTO() {
        return BoardDTO.builder()
                .boardNo(this.boardNo)
                .boardTitle(this.boardTitle)
                .boardContent(this.boardContent)
                .boardWriter(this.boardWriter)
                .boardRegdate(this.boardRegdate.toString())
                .boardCnt(this.boardCnt)
                .boardFileDTOList(
                        this.boardFileList.stream().map(
                                boardFile -> boardFile.toDTO()
                        ).toList()
                )
                .build();
    }

    public void addBoardFileList(BoardFile boardFile) {
        this.boardFileList.add(boardFile);
    }
}
