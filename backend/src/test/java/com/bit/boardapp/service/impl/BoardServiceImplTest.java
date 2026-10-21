package com.bit.boardapp.service.impl;

import com.bit.boardapp.dto.BoardDTO;
import com.bit.boardapp.dto.BoardFileDTO;
import com.bit.boardapp.entity.Board;
import com.bit.boardapp.repository.BoardFileRepository;
import com.bit.boardapp.repository.BoardRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BoardServiceImplTest {
    @Mock private BoardRepository boardRepository;
    @Mock private BoardFileRepository boardFileRepository;
    @InjectMocks private BoardServiceImpl service;

    private Board board() {
        return Board.builder().boardNo(7).boardTitle("검색 결과").boardContent("본문")
                .boardWriter("writer").boardCnt(12)
                .boardRegdate(LocalDateTime.of(2026, 1, 1, 12, 0))
                .boardFileList(new ArrayList<>()).build();
    }

    @Test
    void searchPreservesPageMetadataAndMapsPostFields() {
        PageRequest pageable = PageRequest.of(1, 10);
        when(boardRepository.searchAll(pageable, "title", "검색"))
                .thenReturn(new PageImpl<>(List.of(board()), pageable, 21));

        Page<BoardDTO> result = service.searchAll(pageable, "title", "검색");

        assertThat(result.getNumber()).isEqualTo(1);
        assertThat(result.getTotalElements()).isEqualTo(21);
        assertThat(result.getTotalPages()).isEqualTo(3);
        assertThat(result.getContent()).singleElement().satisfies(post -> {
            assertThat(post.getBoardNo()).isEqualTo(7);
            assertThat(post.getBoardTitle()).isEqualTo("검색 결과");
            assertThat(post.getBoardContent()).isEqualTo("본문");
            assertThat(post.getBoardWriter()).isEqualTo("writer");
            assertThat(post.getBoardCnt()).isEqualTo(12);
            assertThat(post.getBoardFileDTOList()).isEmpty();
        });
    }

    @Test
    void searchWithNoMatchesPreservesTheRequestedPage() {
        PageRequest pageable = PageRequest.of(2, 5);
        when(boardRepository.searchAll(pageable, "writer", "missing"))
                .thenReturn(Page.empty(pageable));

        Page<BoardDTO> result = service.searchAll(pageable, "writer", "missing");
        assertThat(result.getContent()).isEmpty();
        assertThat(result.getTotalElements()).isZero();
        assertThat(result.getNumber()).isEqualTo(2);
    }

    @Test
    void missingPostIsNotReturnedAsAnEmptySuccessfulPost() {
        when(boardRepository.findById(999L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.findById(999)).isInstanceOf(NoSuchElementException.class);
    }

    @Test
    void postUsesServerTimestampAndLinksAttachmentsToTheSavedBoard() {
        BoardDTO request = BoardDTO.builder().boardTitle("New post").boardContent("Content")
                .boardRegdate("2000-01-01T00:00")
                .boardFileDTOList(List.of(BoardFileDTO.builder()
                        .boardFileName("stored-name.txt").boardFileOrigin("original.txt")
                        .boardFilePath("board/").boardFileCate("etc").build()))
                .build();
        LocalDateTime before = LocalDateTime.now();

        service.post(request);

        ArgumentCaptor<Board> saved = ArgumentCaptor.forClass(Board.class);
        verify(boardRepository).save(saved.capture());
        assertThat(saved.getValue().getBoardRegdate()).isBetween(before, LocalDateTime.now());
        assertThat(saved.getValue().getBoardFileList()).singleElement().satisfies(file -> {
            assertThat(file.getBoard()).isSameAs(saved.getValue());
            assertThat(file.getBoardFileName()).isEqualTo("stored-name.txt");
            assertThat(file.getBoardFileOrigin()).isEqualTo("original.txt");
        });
    }

    @Test
    void persistenceFailureIsPropagatedToTheController() {
        BoardDTO request = BoardDTO.builder().boardTitle("New post")
                .boardFileDTOList(List.of()).build();
        when(boardRepository.save(any(Board.class))).thenThrow(new IllegalStateException("DB failed"));

        assertThatThrownBy(() -> service.post(request))
                .isInstanceOf(IllegalStateException.class).hasMessage("DB failed");
    }
}
