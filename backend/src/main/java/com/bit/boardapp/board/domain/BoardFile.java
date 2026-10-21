package com.bit.boardapp.board.domain;

import com.bit.boardapp.shared.domain.AuditingFields;
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
public class BoardFile extends AuditingFields {
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

}
