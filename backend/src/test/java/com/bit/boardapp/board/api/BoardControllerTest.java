package com.bit.boardapp.board.api;

import com.bit.boardapp.board.application.BoardAttachmentService;
import com.bit.boardapp.shared.storage.FileStorageException;
import com.bit.boardapp.board.application.dto.BoardDTO;
import com.bit.boardapp.board.application.BoardService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// Exercise HTTP binding and JSON contracts without a database or object store.
@ExtendWith(MockitoExtension.class)
class BoardControllerTest {
    @Mock private BoardService boardService;
    @Mock private BoardAttachmentService attachmentService;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.standaloneSetup(new BoardController(boardService, attachmentService))
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .build();
    }

    @Test
    void listUsesDefaultPageAndReturnsSearchMetadata() throws Exception {
        BoardDTO board = BoardDTO.builder().boardNo(7).boardTitle("검색 결과").build();
        when(boardService.searchAll(any(Pageable.class), eq("title"), eq("검색")))
                .thenAnswer(call -> new PageImpl<>(List.of(board), call.getArgument(0), 1));

        mvc.perform(get("/api/board/board-list")
                        .param("searchCondition", "title").param("searchKeyword", "검색"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.item.searchCondition").value("title"))
                .andExpect(jsonPath("$.item.searchKeyword").value("검색"))
                .andExpect(jsonPath("$.pageItems.content[0].boardNo").value(7));

        ArgumentCaptor<Pageable> pageable = ArgumentCaptor.forClass(Pageable.class);
        verify(boardService).searchAll(pageable.capture(), eq("title"), eq("검색"));
        assertThat(pageable.getValue().getPageNumber()).isZero();
        assertThat(pageable.getValue().getPageSize()).isEqualTo(10);
        assertThat(pageable.getValue().getSort().getOrderFor("boardRegdate").getDirection())
                .isEqualTo(Sort.Direction.DESC);
    }

    @Test
    void listBindsRequestedPageSizeAndReturnsEmptyPage() throws Exception {
        when(boardService.searchAll(any(Pageable.class), eq("all"), eq("")))
                .thenAnswer(call -> Page.empty(call.getArgument(0)));

        mvc.perform(get("/api/board/board-list").param("searchCondition", "all")
                        .param("searchKeyword", "").param("page", "2").param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pageItems.content").isEmpty())
                .andExpect(jsonPath("$.pageItems.totalElements").value(0))
                .andExpect(jsonPath("$.pageItems.number").value(2))
                .andExpect(jsonPath("$.pageItems.size").value(5));
    }

    @Test
    void listFailureReturnsTheErrorEnvelopeConsumedByTheFrontend() throws Exception {
        when(boardService.searchAll(any(Pageable.class), eq("all"), eq("")))
                .thenThrow(new IllegalStateException("Board lookup failed"));

        mvc.perform(get("/api/board/board-list")
                        .param("searchCondition", "all").param("searchKeyword", ""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.statusCode").value(400))
                .andExpect(jsonPath("$.errorMessage").value("Board lookup failed"));
    }

    @Test
    void listRejectsMissingSearchParametersBeforeCallingTheService() throws Exception {
        mvc.perform(get("/api/board/board-list")).andExpect(status().isBadRequest());
        verifyNoInteractions(boardService);
    }

    @Test
    void detailReturnsTheRequestedPost() throws Exception {
        when(boardService.findById(7)).thenReturn(BoardDTO.builder()
                .boardNo(7).boardTitle("Post title").boardContent("Post content").build());

        mvc.perform(get("/api/board/board/7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.item.boardNo").value(7))
                .andExpect(jsonPath("$.item.boardContent").value("Post content"));
    }

    @Test
    void postAcceptsJsonMultipartWithoutAttachments() throws Exception {
        BoardDTO board = BoardDTO.builder().boardTitle("새 글").boardContent("본문").build();
        MockMultipartFile json = new MockMultipartFile("boardDTO", "", "application/json",
                new ObjectMapper().writeValueAsBytes(board));
        when(boardService.searchAll(any(Pageable.class), eq("all"), eq("")))
                .thenAnswer(call -> Page.empty(call.getArgument(0)));

        mvc.perform(multipart("/api/board/board").file(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200));

        ArgumentCaptor<BoardDTO> saved = ArgumentCaptor.forClass(BoardDTO.class);
        verify(boardService).post(saved.capture());
        assertThat(saved.getValue().getBoardTitle()).isEqualTo("새 글");
        assertThat(saved.getValue().getBoardFileDTOList()).isEmpty();
        verifyNoInteractions(attachmentService);
    }

    @Test
    void deleteFailureDoesNotReturnASuccessfulRefreshedList() throws Exception {
        doThrow(new IllegalStateException("Delete failed")).when(boardService).deleteById(7);

        mvc.perform(delete("/api/board/board/7"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.statusCode").value(400))
                .andExpect(jsonPath("$.errorMessage").value("Delete failed"));
        verify(boardService, never()).searchAll(any(), anyString(), anyString());
    }
    @Test
    void storageFailureDoesNotPersistAnAttachmentThatWasNotUploaded() throws Exception {
        BoardDTO board = BoardDTO.builder().boardTitle("Post with attachment").build();
        MockMultipartFile json = new MockMultipartFile("boardDTO", "", "application/json",
                new ObjectMapper().writeValueAsBytes(board));
        MockMultipartFile file = new MockMultipartFile("uploadFiles", "file.txt", "text/plain", new byte[] {1});
        when(attachmentService.upload(any()))
                .thenThrow(new FileStorageException("File upload failed", new java.io.IOException("offline")));

        mvc.perform(multipart("/api/board/board").file(json).file(file))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorMessage").value("File upload failed"));
        verifyNoInteractions(boardService);
    }

}
