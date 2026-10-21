package com.bit.boardapp.board.application.dto;

import lombok.*;

import java.time.LocalDateTime;
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
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime modifiedAt;
    private String modifiedBy;

}
