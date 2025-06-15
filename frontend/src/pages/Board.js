import React, { useCallback, useEffect, useState } from 'react';
import { Button, Container, Grid, TextField, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { removeBoard } from '../apis/boardApi';
import { API_URL } from '../config';

const Board = () => {
    const [board, setBoard] = useState(null);
    const {boardNo} = useParams();
    const loginUserId = useSelector(state => state.boards.loginUserId);

    let uploadFiles = [];
    let changeFiles = [];
    let originFiles = [];

    const dispatch = useDispatch();
    const navi = useNavigate();

    const getBoard = useCallback(async () => {
        try {
            const response = await axios.get(
                `${API_URL}/board/board/${boardNo}`,
                {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem("ACCESS_TOKEN")}`
                    }
                }
            );

            setBoard(response.data.item);
        } catch(e) {
            alert("에러발생.");
            console.log(e);
        }
    }, [boardNo]);

    useEffect(() => {
        getBoard();
    }, []);

    useEffect(() => {
        if(board != null) {
            board.boardFileDTOList.forEach(boardFile => {
                const boardFileObj = {
                    boardNo: board.boardNo,
                    boardFileNo: boardFile.boardFileNo,
                    boardFileName: boardFile.boardFileName,
                    boardFileStatus: "N"
                }

                originFiles.push(boardFileObj);
            });
        }
    }, [board]);

    const textFieldChange = useCallback((e) => {
        setBoard({
            ...board,
            [e.target.name]: e.target.value
        });
    }, [board]);

    const openChangeFileInput = (boardFileNo) => {
        document.querySelector(`#changeFile${boardFileNo}`).click();
    }

    const changeBoardFile = (e, boardFileNo) => {
        const fileList = Array.prototype.slice.call(e.target.files);

        const changeFile = fileList[0];

        changeFiles.push(changeFile);

        originFiles = originFiles.map((originFile) => 
            originFile.boardFileNo === boardFileNo ? {
                ...originFile,
                boardFileStatus: "U",
                newFileName: changeFile.name
            } :
            originFile
        );

        const reader = new FileReader();

        reader.onload = function(ev) {
            const img = document.querySelector(`#img${boardFileNo}`);

            const p = document.querySelector(`#fileName${boardFileNo}`);

            img.src = ev.target.result;
            p.textContent = changeFile.name;
        }

        reader.readAsDataURL(changeFile);
    }

    const openFileInput = useCallback(() => {
        document.querySelector("#uploadFiles").click();
    }, []);

    const addFiles = useCallback((e) => {
        const fileList = Array.prototype.slice.call(e.target.files);
        fileList.forEach(file => {
            imageLoader(file);
            uploadFiles.push(file);
        });
    }, []);

    // 미리보기 처리 메소드
    // 미리보기될 파일은 업로드가 되어있는 상태가 아니기 때문에
    // 파일 자체를 Base64 인코딩 방식으로 문자열로 변환해서 이미지로 호출
    // 이미지가 들어갈 태그 생성 및 파일을 Base64 인코딩
    const imageLoader = (file) => {

        let reader = new FileReader();

        reader.onload = (e) => {
            // 이미지 표출할 img 태그 생성
            let img = document.createElement("img");
            img.setAttribute("style", "width: 100%; height: 100%; z-index: none;");

            // 이미지 파일인지 아닌지 판단
            if(file.name.toLowerCase().match(/(.*?)\.(jpg|jpeg|png|gif|svg|bmp)$/)) {
                img.src = e.target.result;
            } else {
                img.src = "/images/defaultFileImg.png";
            }

            // 미리보기 영역에 추가
            // 미리보기 이미지 태그와 삭제버튼 그리고 파일명을 표출하는 태그 묶은 div 태그를 만들어주는 메소드 호출
            document.querySelector("#preview").appendChild(makeDiv(img, file));
        }

        // 파일을 Base64 인코딩한 문자열로 로드
        reader.readAsDataURL(file);
    }

    // 미리보기 영역에 추가될 div를 만들어주는 메소드
    const makeDiv = (img, file) => {
        // div 태그 생성
        let div = document.createElement("div");

        div.setAttribute("style", "display: inline-block; position: relative;" +
            " width: 150px; height: 120px; margin: 5px; border: 1px solid #00f; z-index: 1;");

        // 잘못 올렸을 때 삭제할 수 있는 삭제 버튼 생성
        let btn = document.createElement("input");
        btn.setAttribute("type", "button");
        btn.setAttribute("value", "x");
        // 사용자 정의 속성 추가
        btn.setAttribute("deleteFile", file.name);
        btn.setAttribute("style", "width: 30px; height: 30px; position: absolute;" +
            " right: 0; bottom: 0; z-index: 999; background-color: rgba(255, 255, 255, 0.1);" +
            " color: #f00;");

        // 위에서 생성한 버튼 클릭했을 때 파일 삭제되는 기능 구현
        btn.onclick = (e) => {
            // 클릭된 버튼
            const ele = e.srcElement;

            const deleteFile = ele.getAttribute("deleteFile");

            for(let i = 0; i < uploadFiles.length; i++) {
                //배열에서도 같은 이름의 파일 삭제
                if(deleteFile === uploadFiles[i].name) {
                    uploadFiles.splice(i, 1);
                }
            }

            // 버튼 클릭 했을 때 input에 첨부된 파일도 삭제
            // input type="file"은 첨부된 파일들을 fileList 형태로 관리
            // fileList는 File 객체에 바로 담을 수 없다.
            // DataTransfer라는 클래스를 이용해서 변환 후에 사용한다.

            let dt = new DataTransfer();

            for(let i in uploadFiles) {
                const file = uploadFiles[i];
                dt.items.add(file);
            }

            document.querySelector("#uploadFiles").files = dt.files;

            // 해당 img 태그를 가지고 있는 div 태그 삭제
            const parentDiv = ele.parentNode;
            parentDiv.remove();
        }

        // 파일 명을 표출할 p 태그 생성
        let fileNameP = document.createElement("p");
        fileNameP.setAttribute("style", "display: inline-block; font-size: 8px;");
        fileNameP.textContent = file.name;

        // div 태그에 img, button, p태그 추가
        div.appendChild(img);
        div.appendChild(btn);
        div.appendChild(fileNameP);

        return div;
    }

    const deleteImg = (e, boardFileNo) => {
        originFiles = originFiles.map((originFile) => 
            originFile.boardFileNo === boardFileNo ?
            {
                ...originFile,
                boardFileStatus: "D"
            } :
            originFile
        );

        const ele = e.target;

        ele.parentElement.remove();
    }

    const modify = useCallback(async (formData) => {
        try {
            const response = await axios.put(
                `${API_URL}/board/board`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem("ACCESS_TOKEN")}`,
                        "Content-Type": "multipart/form-data"
                    }
                }
            );
            
            if(response.data && response.data.item) {
                alert("정상적으로 수정되었습니다.");
                window.location.reload();
            }
        } catch(e) {
            alert("에러 발생.");
            console.log(e);
        }
    }, []);

    const handleModify = useCallback((e) => {
        e.preventDefault();

        const formData = new FormData(e.target);

        const formDataObj = {};

        formData.forEach((value, key) => formDataObj[key] = value);

        const sendFormData = new FormData();

        sendFormData.append("boardDTO", new Blob([JSON.stringify(formDataObj)], {
            type: 'application/json'
        }));

        const uploadFileList = document.querySelector("#uploadFiles").files;

        for(let i = 0; i < uploadFileList.length; i++) {
            uploadFiles.push(uploadFileList[i]);
        }

        Array.from(uploadFiles).forEach(file => {
            sendFormData.append("uploadFiles", file)
        });

        Array.from(changeFiles).forEach(file => {
            sendFormData.append("changeFiles", file)
        });

        sendFormData.append("originFiles", JSON.stringify(originFiles));

        modify(sendFormData);
    }, [board, originFiles, changeFiles, uploadFiles]);

    const remove = useCallback((boardNo) => {
        dispatch(removeBoard(boardNo));
        navi("/board-list");
    }, [dispatch, navi]);
  return (
    <Container maxWidth='md' style={{marginTop: '3%', textAlign: 'center'}}>
        <Grid container>
            <Grid item xs={12}>
                <Typography component='h1' variant='h5'>
                    게시글
                </Typography>
            </Grid>
        </Grid>
        <form onSubmit={handleModify}>
            {board != null && <input type='hidden' name='boardNo' id='boardNo' value={board.boardNo}></input>}
            <Grid container style={{marginTop: '3%', textAlign: 'center'}}>
                <Grid 
                    item 
                    xs={2}
                    style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}
                >
                    <Typography component='p' variant='string'>
                        제목
                    </Typography>
                </Grid>
                <Grid
                    item
                    xs={10}
                >
                    <TextField
                        name='boardTitle'
                        id='boardTitle'
                        fullWidth
                        size='small'
                        value={board != null ? board.boardTitle : ''}
                        aria-readonly={board != null && loginUserId != board.boardWriter ? 'true' : 'false'}
                        onChange={textFieldChange}
                    ></TextField>
                </Grid>
            </Grid>
            <Grid container style={{marginTop: '3%', textAlign: 'center'}}>
                <Grid 
                    item 
                    xs={2}
                    style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}
                >
                    <Typography component='p' variant='string'>
                        작성자
                    </Typography>
                </Grid>
                <Grid
                    item
                    xs={10}
                >
                    <TextField
                        name='boardWriter'
                        id='boardWriter'
                        fullWidth
                        size='small'
                        value={board != null ? board.boardWriter : ''}
                    ></TextField>
                </Grid>
            </Grid>
            <Grid container style={{marginTop: '3%', textAlign: 'center'}}>
                <Grid 
                    item 
                    xs={2}
                    style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}
                >
                    <Typography component='p' variant='string'>
                        내용
                    </Typography>
                </Grid>
                <Grid
                    item
                    xs={10}
                >
                    <TextField
                        name='boardContent'
                        id='boardContent'
                        fullWidth
                        size='small'
                        multiline
                        rows={10}
                        value={board != null ? board.boardContent : ''}
                        aria-readonly={board != null && loginUserId != board.boardWriter ? 'true' : 'false'}
                        onChange={textFieldChange}
                    ></TextField>
                </Grid>
            </Grid>
            <Grid container style={{marginTop: '3%', textAlign: 'center'}}>
                <Grid 
                    item 
                    xs={2}
                    style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}
                >
                    <Typography component='p' variant='string'>
                        작성일
                    </Typography>
                </Grid>
                <Grid
                    item
                    xs={10}
                >
                    <TextField
                        name='boardRegdate'
                        id='boardRegdate'
                        fullWidth
                        size='small'
                        value={board != null ? board.boardRegdate : ''}
                    ></TextField>
                </Grid>
            </Grid>
            <Grid container style={{marginTop: '3%', textAlign: 'center'}}>
                <Grid 
                    item 
                    xs={2}
                    style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}
                >
                    <Typography component='p' variant='string'>
                        조회수
                    </Typography>
                </Grid>
                <Grid
                    item
                    xs={10}
                >
                    <TextField
                        name='boardCnt'
                        id='boardCnt'
                        fullWidth
                        size='small'
                        value={board != null ? board.boardCnt : ''}
                    ></TextField>
                </Grid>
            </Grid>
            <Grid container style={{marginTop: '3%', textAlign: 'center'}}>
                <Grid 
                    item 
                    xs={2}
                    style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}
                >
                    <Typography component='p' variant='string'>
                        파일첨부
                    </Typography>
                </Grid>
                <Grid
                    item
                    xs={10}
                >
                    <Button type='button' variant='outlined' onClick={openFileInput}>파일 선택</Button>
                    <input 
                        type='file' 
                        multiple 
                        name='uploadFiles' 
                        id='uploadFiles'
                        style={{display: 'none'}}
                        onChange={addFiles}></input>
                </Grid>
            </Grid>
            <Grid container style={{marginTop: '3%', textAlign: 'center'}}>
                <Grid 
                    item 
                    xs={2}
                    style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}
                >
                    <Typography component='p' variant='string'>
                        미리보기
                    </Typography>
                </Grid>
                <Grid
                    item
                    xs={10}
                >
                    <Typography component='p' variant='string'>
                        파일을 변경하려면 사진을 클릭하시고 추가하려면 파일첨부 버튼을 클릭하세요.
                    </Typography>
                    <Container
                        component='div'
                        name='preview'
                        id='preview'>
                        {board != null && board.boardFileDTOList.map((boardFile, index) => (
                            <div key={index} style={{
                                display: 'inline-block', position: 'relative', width: '150px',
                                height: '120px', margin: '5px', border: '1px solid #00f', zIndex: 1
                            }}>
                                <input type='file'
                                       style={{display: 'none'}}
                                       id={`changeFile${boardFile.boardFileNo}`}
                                       onChange={(e) => changeBoardFile(e, boardFile.boardFileNo)}
                                ></input>
                                <img style={{
                                    width: '100%', height: '100%', zIndex: 'none',
                                    cursor: 'pointer'
                                }} className='fileImg' id={`img${boardFile.boardFileNo}`} 
                                src={`https://kr.object.ncloudstorage.com/bitcamp-bucket-502/${boardFile.boardFilePath}${boardFile.boardFileName}`}
                                onClick={() => openChangeFileInput(boardFile.boardFileNo)}></img>
                                <input type='button' className='btnDel' value='x'
                                       style={{width: '30px', height: '30px', position: 'absolute',
                                            bottom: '0px', right: '0px', zIndex: 999, 
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            color: "#f00"
                                        }} onClick={(e) => deleteImg(e, boardFile.boardFileNo)}></input>
                                <p style={{display: 'inline-block', fontSize: '8px', cursor: 'pointer'}}
                                    id={`fileName${boardFile.boardFileNo}`}>
                                    {boardFile.boardFileOrigin}
                                </p>
                            </div>
                        ))}
                    </Container>
                </Grid>
            </Grid>
            <Grid container style={{marginTop: '3%', textAlign: 'center'}}>
                <Grid item xs={12} 
                    style={
                        board != null && loginUserId === board.boardWriter 
                        ? {display: 'block'}
                        : {display: 'none'}
                    }>
                    <Button type='submit' variant='contained'>수정</Button>
                    <Button type='button' variant='contained' style={{marginLeft: '2%'}}
                            onClick={() => remove(board.boardNo)}
                    >삭제</Button>
                </Grid>
            </Grid>
        </form>
    </Container>
  );
}

export default Board;