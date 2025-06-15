package com.bit.boardapp.controller;

import com.bit.boardapp.common.FileUtils;
import com.bit.boardapp.dto.BoardDTO;
import com.bit.boardapp.dto.BoardFileDTO;
import com.bit.boardapp.dto.ResponseDTO;
import com.bit.boardapp.service.BoardService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/board")
public class BoardController {

    @Value("${myapp.external-api-url}")
    private String apiUrl;

    private final BoardService boardService;
    private final FileUtils fileUtils;

    @GetMapping("/board-list")
    public ResponseEntity<?> getBoardList(@PageableDefault(page = 0, size = 10) Pageable pageable,
                                          @RequestParam("searchCondition") String searchCondition,
                                          @RequestParam("searchKeyword") String searchKeyword) {
        ResponseDTO<BoardDTO> responseDTO = new ResponseDTO<>();

        try {
            Page<BoardDTO> boardDTOPage = boardService.searchAll(pageable, searchCondition, searchKeyword);

            responseDTO.setPageItems(boardDTOPage);
            responseDTO.setItem(BoardDTO.builder()
                            .searchCondition(searchCondition)
                            .searchKeyword(searchKeyword)
                            .build());
            responseDTO.setStatusCode(HttpStatus.OK.value());

            return ResponseEntity.ok(responseDTO);
        } catch(Exception e) {
            responseDTO.setErrorCode(401);
            responseDTO.setErrorMessage(e.getMessage());
            responseDTO.setStatusCode(HttpStatus.BAD_REQUEST.value());

            return ResponseEntity.badRequest().body(responseDTO);
        }
    }

    @PostMapping("/board")
    /**
     * application/json 형태의 데이터에 파일이 추가된 경우 @RequestBody가 아닌 @RequestPart로 전송된 데이터를 받아준다.
     */
    public ResponseEntity<?> postBoard(@RequestPart("boardDTO") BoardDTO boardDTO,
                                       @RequestPart(value = "uploadFiles", required = false) MultipartFile[] multipartFiles,
                                       @PageableDefault(page = 0, size = 10) Pageable pageable) {
        ResponseDTO<BoardDTO> responseDTO = new ResponseDTO<>();
        System.out.println(multipartFiles.length);

        try {
            List<BoardFileDTO> boardFileDTOList = new ArrayList<>();

            if(multipartFiles != null) {
                Arrays.stream(multipartFiles).forEach(multipartFile -> {
                    if (multipartFile.getOriginalFilename() != null &&
                            !multipartFile.getOriginalFilename().equalsIgnoreCase("")) {
                        BoardFileDTO boardFileDTO = fileUtils.parseFileInfo(multipartFile, "board/");

                        boardFileDTOList.add(boardFileDTO);
                    }
                });
            }

            boardDTO.setBoardFileDTOList(boardFileDTOList);
            boardService.post(boardDTO);

            Page<BoardDTO> boardDTOPage = boardService.searchAll(pageable, "all", "");

            responseDTO.setPageItems(boardDTOPage);
            responseDTO.setStatusCode(HttpStatus.OK.value());

            return ResponseEntity.ok(responseDTO);
        } catch(Exception e) {
            responseDTO.setErrorCode(402);
            responseDTO.setErrorMessage(e.getMessage());
            responseDTO.setStatusCode(HttpStatus.BAD_REQUEST.value());

            return ResponseEntity.badRequest().body(responseDTO);
        }
    }

    @GetMapping("/board/{boardNo}")
    public ResponseEntity<?> getBoard(@PathVariable("boardNo") long boardNo) {
        ResponseDTO<BoardDTO> responseDTO = new ResponseDTO<>();

        try {
            BoardDTO boardDTO = boardService.findById(boardNo);

            responseDTO.setItem(boardDTO);
            responseDTO.setStatusCode(HttpStatus.OK.value());

            return ResponseEntity.ok(responseDTO);
        } catch(Exception e) {
            responseDTO.setErrorCode(403);
            responseDTO.setErrorMessage(e.getMessage());
            responseDTO.setStatusCode(HttpStatus.BAD_REQUEST.value());

            return ResponseEntity.badRequest().body(responseDTO);
        }
    }

    @PutMapping("/board")
    public ResponseEntity<?> modify(@RequestPart("boardDTO") BoardDTO boardDTO,
                                 @RequestPart(value = "uploadFiles", required = false) MultipartFile[] uploadFiles,
                                 @RequestPart(value = "changeFiles", required = false) MultipartFile[] changeFiles,
                                 @RequestPart(value = "originFiles", required = false) String originFiles) throws JsonProcessingException {
        ResponseDTO<BoardDTO> responseDTO = new ResponseDTO<>();

        System.out.println(boardDTO.toString());

        List<BoardFileDTO> originFileList = null;

        if(originFiles != null) {
            originFileList = new ObjectMapper().readValue(originFiles, new TypeReference<List<BoardFileDTO>>() {
            });
        }

        List<BoardFileDTO> uBoardFileList = new ArrayList<>();

        try {
            if(originFileList != null) {
                originFileList.stream().forEach(originFile -> {
                    if (originFile.getBoardFileStatus().equalsIgnoreCase("U")) {
                        Arrays.stream(changeFiles).forEach(changeFile -> {
                            if (originFile.getNewFileName().equalsIgnoreCase(changeFile.getOriginalFilename())) {
                                BoardFileDTO boardFileDTO = fileUtils.parseFileInfo(changeFile, "board/");

                                boardFileDTO.setBoardNo(boardDTO.getBoardNo());
                                boardFileDTO.setBoardFileNo(originFile.getBoardFileNo());
                                boardFileDTO.setBoardFileStatus("U");
                                uBoardFileList.add(boardFileDTO);
                            }
                        });
                    } else if (originFile.getBoardFileStatus().equalsIgnoreCase("D")) {
                        BoardFileDTO boardFileDTO = new BoardFileDTO();

                        boardFileDTO.setBoardNo(boardDTO.getBoardNo());
                        boardFileDTO.setBoardFileNo(originFile.getBoardFileNo());
                        boardFileDTO.setBoardFileStatus("D");

                        uBoardFileList.add(boardFileDTO);
                    }
                });
            }

            if(uploadFiles != null) {
                Arrays.stream(uploadFiles).forEach(uploadFile -> {
                    if(!uploadFile.getOriginalFilename().equalsIgnoreCase("")
                        && uploadFile.getOriginalFilename() != null) {
                        BoardFileDTO boardFileDTO = fileUtils.parseFileInfo(uploadFile, "board/");

                        boardFileDTO.setBoardNo(boardDTO.getBoardNo());
                        boardFileDTO.setBoardFileStatus("I");

                        uBoardFileList.add(boardFileDTO);
                    }
                });
            }

            boardService.modify(boardDTO, uBoardFileList);

            BoardDTO modifiedBoardDTO = boardService.findById(boardDTO.getBoardNo());

            responseDTO.setItem(modifiedBoardDTO);
            responseDTO.setStatusCode(HttpStatus.OK.value());

            return ResponseEntity.ok(responseDTO);
        } catch(Exception e) {
            System.out.println(e.getMessage());
            responseDTO.setErrorCode(405);
            responseDTO.setErrorMessage(e.getMessage());
            responseDTO.setStatusCode(HttpStatus.BAD_REQUEST.value());

            return ResponseEntity.badRequest().body(responseDTO);
        }
    }

    @DeleteMapping("/board/{boardNo}")
    public ResponseEntity<?> removeBoard(@PathVariable("boardNo") long boardNo,
                                         @PageableDefault(page = 0, size = 10) Pageable pageable) {
        ResponseDTO<BoardDTO> responseDTO = new ResponseDTO<>();

        try {
            boardService.deleteById(boardNo);

            responseDTO.setPageItems(boardService.searchAll(pageable, "all", ""));
            responseDTO.setStatusCode(HttpStatus.OK.value());

            return ResponseEntity.ok(responseDTO);
        } catch(Exception e) {
            System.out.println(e.getMessage());
            responseDTO.setErrorCode(406);
            responseDTO.setErrorMessage(e.getMessage());
            responseDTO.setStatusCode(HttpStatus.BAD_REQUEST.value());

            return ResponseEntity.badRequest().body(responseDTO);
        }
    }
}
