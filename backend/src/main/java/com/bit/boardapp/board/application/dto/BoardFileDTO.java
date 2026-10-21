package com.bit.boardapp.board.application.dto;

import java.time.LocalDateTime;
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
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime modifiedAt;
    private String modifiedBy;

}
