import { Button, Container, Grid, TextField, Typography } from '@mui/material';
import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { postBoard } from '../apis/boardApi';
import {useNavigate} from 'react-router-dom';

const Post = () => {
    const loginUserId = useSelector(state => state.boards.loginUserId);
    const uploadFiles = [];
    const dispatch = useDispatch();
    const navi = useNavigate();

    const openFileInput = useCallback(() => {
        document.querySelector("#uploadFiles").click();
    }, []);

    const changeFiles = useCallback((e) => {
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

    const handlePost = useCallback((e) => {
        e.preventDefault();
        
        // form 태그에 담긴 input의 내용으로 FormData 객체 생성
        // input type='file'의 파일들은 제외되고 생성된다.
        // key는 name 속성으로 value는 value 속성으로 지정된다.
        const formData = new FormData(e.target);

        // FormData를 객체 형태로 변환
        const formDataObj = {};

        formData.forEach((v, k) => formDataObj[k] = v);

        // 파일을 제외한 데이터들은 application/json형태로 Blob 객체로 생성
        const boardDTO = new Blob([JSON.stringify(formDataObj)], {
            type: 'application/json'
        });
        
        // 실제로 서버로 전송될 FormData 객체
        const sendFormData = new FormData();

        sendFormData.append("boardDTO", boardDTO);

        Array.from(uploadFiles).forEach(file => {sendFormData.append("uploadFiles", file)});

        dispatch(postBoard(sendFormData));

        navi("/board-list");
    }, [dispatch, navi, uploadFiles]);
  return (
    <Container maxWidth='md' style={{marginTop: '3%', textAlign: 'center'}}>
        <Grid container>
            <Grid item xs={12}>
                <Typography component='h1' variant='h5'>
                    글 등록
                </Typography>
            </Grid>
        </Grid>
        <form onSubmit={handlePost}>
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
                        required
                        placeholder='게시글 제목'
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
                        required
                        placeholder='게시글 작성자'
                        aria-readonly='true'
                        value={loginUserId}
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
                        required
                        placeholder='게시글 내용'
                        multiline
                        rows={10}
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
                        onChange={changeFiles}></input>
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
                    <Container
                        component='div'
                        name='preview'
                        id='preview'></Container>
                </Grid>
            </Grid>
            <Grid container style={{marginTop: '3%', textAlign: 'center'}}>
                <Grid item xs={12}>
                    <Button type='submit' variant='contained'>등록</Button>
                </Grid>
            </Grid>
        </form>
    </Container>
  );
}

export default Post;