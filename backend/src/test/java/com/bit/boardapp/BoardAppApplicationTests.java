package com.bit.boardapp;

import com.bit.boardapp.board.application.dto.BoardDTO;
import com.bit.boardapp.board.persistence.BoardRepository;
import com.bit.boardapp.board.application.BoardService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Transactional
@WithMockUser(username = "test-writer", roles = "USER")
class BoardAppApplicationTests {
    @Autowired private MockMvc mvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private BoardRepository boardRepository;
    @Autowired private BoardService boardService;

    @Test
    void createSearchAndDeletePostUsingTheRealApplicationAndDatabase() throws Exception {
        BoardDTO board = BoardDTO.builder().boardTitle("통합 테스트 글")
                .boardContent("게시글 본문").boardWriter("test-writer").build();
        MockMultipartFile json = new MockMultipartFile("boardDTO", "", "application/json",
                objectMapper.writeValueAsBytes(board));

        mvc.perform(multipart("/api/board/board").file(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(200));

        var saved = boardRepository.findAll();
        assertThat(saved).singleElement().satisfies(post -> {
            assertThat(post.getBoardTitle()).isEqualTo("통합 테스트 글");
            assertThat(post.getCreatedBy()).isEqualTo("test-writer");
            assertThat(post.getCreatedAt()).isNotNull();
        });
        long boardNo = saved.get(0).getBoardNo();

        mvc.perform(get("/api/board/board-list")
                        .param("searchCondition", "title").param("searchKeyword", "통합"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pageItems.totalElements").value(1))
                .andExpect(jsonPath("$.pageItems.content[0].boardNo").value(boardNo));

        mvc.perform(delete("/api/board/board/{boardNo}", boardNo))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pageItems.totalElements").value(0));
        assertThat(boardRepository.existsById(boardNo)).isFalse();
    }

    @Test
    void titleSearchExcludesBodyOnlyMatchesWhileAllSearchIncludesThem() throws Exception {
        boardService.post(post("Needle in title", "Unrelated body"));
        boardService.post(post("Other title", "needle in body"));
        boardService.post(post("Unrelated title", "Unrelated body"));

        mvc.perform(get("/api/board/board-list")
                        .param("searchCondition", "title").param("searchKeyword", "NEEDLE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pageItems.totalElements").value(1))
                .andExpect(jsonPath("$.pageItems.content[0].boardTitle").value("Needle in title"));

        mvc.perform(get("/api/board/board-list")
                        .param("searchCondition", "all").param("searchKeyword", "NEEDLE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pageItems.totalElements").value(2));
    }

    private BoardDTO post(String title, String content) {
        return BoardDTO.builder().boardTitle(title).boardContent(content).boardWriter("test-writer")
                .boardFileDTOList(List.of()).build();
    }
}
