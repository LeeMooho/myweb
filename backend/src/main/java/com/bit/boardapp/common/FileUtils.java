package com.bit.boardapp.common;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.bit.boardapp.configuration.NaverConfiguration;
import com.bit.boardapp.dto.BoardFileDTO;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.UploadObjectArgs;
import io.minio.errors.MinioException;
import jakarta.annotation.PostConstruct;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.UUID;

@Component
public class FileUtils {
    //private final AmazonS3 s3;
    private final MinioClient minioClient;

    public FileUtils(NaverConfiguration naverConfiguration) {
        minioClient = MinioClient.builder()
                      .endpoint(naverConfiguration.getEndPoint(), 9000, false)
                      .credentials(naverConfiguration.getAccessKey(), naverConfiguration.getSecretKey())
                      .region("us-east-1")
                      .build();
    }

    public BoardFileDTO parseFileInfo(MultipartFile multipartFile, String directory) {
        //버킷 이름
        String bucketName = "mywebbucket";

        // 리턴할 BoardFileDTO 객체 생성
        BoardFileDTO boardFileDTO = new BoardFileDTO();

        String boardFileOrigin = multipartFile.getOriginalFilename();

        // 같은 파일명으로 파일 업로드 하면 나중에 업로드된 파일로 덮어 써지기 때문에 날짜+랜덤값+파일명으로 파일명 변경
        SimpleDateFormat formater = new SimpleDateFormat("yyyyMMddHHmmsss");
        Date nowDate = new Date();

        String nowDateStr = formater.format(nowDate);

        UUID uuid = UUID.randomUUID();

        // 실제로 db와 서버에 저장될 파일명
        String boardFileName = nowDateStr + "_" + uuid.toString() + "_" + boardFileOrigin;

        // 파일 업로드 될 파일 경로
        String boardFilePath = directory;

        // 오브젝트 스토리지에 파일 업로드
        try(InputStream fileIputStream = multipartFile.getInputStream()) {
            minioClient.putObject(
            PutObjectArgs.builder().bucket(bucketName).object(directory + boardFileName).stream(
                fileIputStream, -1, 10485760)
        .contentType("image/jpg")
        .build());
        } catch(Exception e) {
            System.out.println(e.getMessage());
        }

        // 이미지인지 아닌지 검사
        File checkImage = new File(boardFileOrigin);
        // 파일의 형식 가져오기
        String type = "";

        try {
            type = Files.probeContentType(checkImage.toPath());
        } catch(IOException ie) {
            System.out.println(ie.getMessage());
        }

        if(type != "") {
            if(type.startsWith("image")) {
                boardFileDTO.setBoardFileCate("image");
            } else {
                boardFileDTO.setBoardFileCate("etc");
            }
        } else {
            boardFileDTO.setBoardFileCate("etc");
        }

        // 리턴될 DTO에 값들 세팅
        boardFileDTO.setBoardFileName(boardFileName);
        boardFileDTO.setBoardFilePath(boardFilePath);
        boardFileDTO.setBoardFileOrigin(boardFileOrigin);

        return boardFileDTO;
    }
}
