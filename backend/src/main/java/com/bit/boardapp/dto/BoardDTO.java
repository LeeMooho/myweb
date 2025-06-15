package com.bit.boardapp.dto;

import com.bit.boardapp.entity.Board;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class BoardDTO {
    private long boardNo;
    private String boardTitle;
    private String boardContent;
    private String boardWriter;
    private String boardRegdate;
    private int boardCnt;
    private List<BoardFileDTO> boardFileDTOList;
    private String searchCondition;
    private String searchKeyword;

    public Board toEntity() {
        return Board.builder()
                .boardNo(this.boardNo)
                .boardTitle(this.boardTitle)
                .boardContent(this.boardContent)
                .boardWriter(this.boardWriter)
                .boardRegdate(LocalDateTime.parse(this.boardRegdate))
                .boardCnt(this.boardCnt)
                .boardFileList(new ArrayList<>())
                .build();
    }
}
