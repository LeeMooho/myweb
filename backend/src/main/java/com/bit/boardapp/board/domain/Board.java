package com.bit.boardapp.board.domain;

import com.bit.boardapp.shared.domain.AuditingFields;
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
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Board extends AuditingFields {
    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private long boardNo;

    @Column(length = 1000)
    private String boardTitle;

    @Column(columnDefinition = "TEXT")
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

    public void addBoardFileList(BoardFile boardFile) {
        this.boardFileList.add(boardFile);
    }
}
