package com.bit.boardapp.repository.impl;

import com.bit.boardapp.entity.Board;
import com.bit.boardapp.repository.BoardRepositoryCustom;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;

import static com.bit.boardapp.entity.QBoard.board;

@Repository
@RequiredArgsConstructor
public class BoardRepositoryCustomImpl implements BoardRepositoryCustom {
    private final EntityManager em;
    private final JPAQueryFactory jpaQueryFactory;

    @Override
    public Page<Board> searchAll(Pageable pageable, String searchCondition, String searchKeyword) {
        List<Board> boardList = jpaQueryFactory
                    .selectFrom(board)
                    .where(getSearch(searchCondition, searchKeyword))
                    .offset(pageable.getOffset())
                    .limit(pageable.getPageSize())
                    .fetch();

        long totalCnt = jpaQueryFactory
                .select(board.count())
                .where(getSearch(searchCondition, searchKeyword))
                .from(board)
                .fetchOne();

        return new PageImpl<>(boardList, pageable, totalCnt);
    }

    public BooleanBuilder getSearch(String searchCondition, String searchKeyword) {
        BooleanBuilder booleanBuilder = new BooleanBuilder();

        if(searchKeyword == null || searchKeyword.isEmpty()) {
            return null;
        }

        if(searchCondition.equalsIgnoreCase("all")) {
            booleanBuilder.or(board.boardTitle.containsIgnoreCase(searchKeyword));
            booleanBuilder.or(board.boardContent.containsIgnoreCase(searchKeyword));
            booleanBuilder.or(board.boardWriter.containsIgnoreCase(searchKeyword));
        } else if(searchCondition.equalsIgnoreCase("title")) {
            booleanBuilder.or(board.boardTitle.containsIgnoreCase(searchKeyword));
        } else if(searchCondition.equalsIgnoreCase("content")) {
            booleanBuilder.or(board.boardContent.containsIgnoreCase(searchKeyword));
        } else if(searchCondition.equalsIgnoreCase("writer")) {
            booleanBuilder.or(board.boardWriter.containsIgnoreCase(searchKeyword));
        }

        return booleanBuilder;
    }
}
