package com.bit.boardapp.service.impl;

import com.bit.boardapp.dto.BoardDTO;
import com.bit.boardapp.dto.BoardFileDTO;
import com.bit.boardapp.entity.Board;
import com.bit.boardapp.entity.BoardFile;
import com.bit.boardapp.repository.BoardFileRepository;
import com.bit.boardapp.repository.BoardRepository;
import com.bit.boardapp.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardServiceImpl implements BoardService {
    private final BoardRepository boardRepository;
    private final BoardFileRepository boardFileRepository;

    @Override
    public Page<BoardDTO> searchAll(Pageable pageable, String searchCondition, String searchKeyword) {
        Page<Board> boardPage = boardRepository.searchAll(pageable, searchCondition, searchKeyword);

        return boardPage.map(board -> board.toDTO());
    }

    @Override
    public void post(BoardDTO boardDTO) {
        boardDTO.setBoardRegdate(LocalDateTime.now().toString());

        Board board = boardDTO.toEntity();

        List<BoardFile> boardFileList = boardDTO.getBoardFileDTOList().stream()
                .map(boardFileDTO -> boardFileDTO.toEntity(board))
                .toList();

        boardFileList.stream().forEach(
                boardFile -> board.addBoardFileList(boardFile));

        boardRepository.save(board);
    }

    @Override
    public BoardDTO findById(long boardNo) {
        Board board = boardRepository.findById(boardNo).orElseThrow();

        return board.toDTO();
    }

    @Override
    public void modify(BoardDTO boardDTO, List<BoardFileDTO> uBoardFileList) {
        Board board = boardDTO.toEntity();

        List<BoardFile> boardFileList = uBoardFileList.stream()
                .map(uBoardFile -> uBoardFile.toEntity(board))
                .toList();

        boardFileList.stream()
                .forEach(
                        boardFile -> {
                            System.out.println(boardFile.getBoard().getBoardNo());
                            if(boardFile.getBoardFileStatus().equalsIgnoreCase("U") ||
                               boardFile.getBoardFileStatus().equalsIgnoreCase("I")) {
                                board.addBoardFileList(boardFile);
                            } else {
                                boardFileRepository.delete(boardFile);
                            }
                        }
                );

        boardRepository.save(board);
    }

    @Override
    public void deleteById(long boardNo) {
        boardRepository.deleteById(boardNo);
    }
}
