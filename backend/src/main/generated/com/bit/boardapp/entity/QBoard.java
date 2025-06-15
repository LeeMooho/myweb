package com.bit.boardapp.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QBoard is a Querydsl query type for Board
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QBoard extends EntityPathBase<Board> {

    private static final long serialVersionUID = 2081364544L;

    public static final QBoard board = new QBoard("board");

    public final NumberPath<Integer> boardCnt = createNumber("boardCnt", Integer.class);

    public final StringPath boardContent = createString("boardContent");

    public final ListPath<BoardFile, QBoardFile> boardFileList = this.<BoardFile, QBoardFile>createList("boardFileList", BoardFile.class, QBoardFile.class, PathInits.DIRECT2);

    public final NumberPath<Long> boardNo = createNumber("boardNo", Long.class);

    public final DateTimePath<java.time.LocalDateTime> boardRegdate = createDateTime("boardRegdate", java.time.LocalDateTime.class);

    public final StringPath boardTitle = createString("boardTitle");

    public final StringPath boardWriter = createString("boardWriter");

    public QBoard(String variable) {
        super(Board.class, forVariable(variable));
    }

    public QBoard(Path<? extends Board> path) {
        super(path.getType(), path.getMetadata());
    }

    public QBoard(PathMetadata metadata) {
        super(Board.class, metadata);
    }

}

