package com.bit.boardapp.controller;

import com.bit.boardapp.dto.ResponseDTO;
import com.bit.boardapp.dto.UserDTO;
import com.bit.boardapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserController {
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/join")
    public ResponseEntity<?> join(@RequestBody UserDTO userDTO) {
        ResponseDTO<UserDTO> responseDTO = new ResponseDTO<>();

        try {
            userDTO.setActive(true);
            userDTO.setLastLoginDate(LocalDateTime.now().toString());
            userDTO.setUserRegdate(LocalDateTime.now().toString());
            userDTO.setRole("ROLE_USER");
            userDTO.setUserPw(passwordEncoder.encode(userDTO.getUserPw()));

            UserDTO joinUserDTO = userService.join(userDTO);

            joinUserDTO.setUserPw("");

            responseDTO.setItem(joinUserDTO);
            responseDTO.setStatusCode(HttpStatus.OK.value());

            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            responseDTO.setErrorCode(100);
            responseDTO.setErrorMessage(e.getMessage());
            responseDTO.setStatusCode(HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.badRequest().body(responseDTO);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserDTO userDTO) {
        ResponseDTO<UserDTO> responseDTO = new ResponseDTO<>();

        try {
            UserDTO loginUserDTO = userService.login(userDTO);

            loginUserDTO.setUserPw("");

            responseDTO.setItem(loginUserDTO);
            responseDTO.setStatusCode(HttpStatus.OK.value());
            return ResponseEntity.ok(responseDTO);
        } catch(Exception e) {
            if(e.getMessage().equalsIgnoreCase("not exist userid")) {
                responseDTO.setErrorCode(200);
                responseDTO.setErrorMessage(e.getMessage());
            } else if(e.getMessage().equalsIgnoreCase("wrong password")) {
                responseDTO.setErrorCode(201);
                responseDTO.setErrorMessage(e.getMessage());
            } else {
                responseDTO.setErrorCode(202);
                responseDTO.setErrorMessage(e.getMessage());
            }

            responseDTO.setStatusCode(HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.badRequest().body(responseDTO);
        }
    }

    @PostMapping("/id-check")
    public ResponseEntity<?> idCheck(@RequestBody UserDTO userDTO) {
        ResponseDTO<Map<String, String>> responseDTO = new ResponseDTO<>();

        try {
            long idCheck = userService.idCheck(userDTO);

            Map<String, String> returnMap = new HashMap<>();

            if(idCheck == 0) {
                returnMap.put("idCheckResult", "available id");
            } else {
                returnMap.put("idCheckResult", "invalid id");
            }

            responseDTO.setItem(returnMap);
            responseDTO.setStatusCode(HttpStatus.OK.value());

            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            responseDTO.setErrorMessage(e.getMessage());
            responseDTO.setErrorCode(101);
            responseDTO.setStatusCode(HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.badRequest().body(responseDTO);
        }
    }

    @GetMapping("/logout")
    public ResponseEntity<?> logout() {
        ResponseDTO<Map<String, String>> responseDTO = new ResponseDTO<>();

        try {
            SecurityContext securityContext = SecurityContextHolder.getContext();
            securityContext.setAuthentication(null);
            SecurityContextHolder.setContext(securityContext);

            Map<String, String> msgMap = new HashMap<>();

            msgMap.put("logoutMsg", "logout success");

            responseDTO.setItem(msgMap);
            responseDTO.setStatusCode(HttpStatus.OK.value());

            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            responseDTO.setErrorMessage(e.getMessage());
            responseDTO.setErrorCode(202);
            responseDTO.setStatusCode(HttpStatus.BAD_REQUEST.value());
            return ResponseEntity.badRequest().body(responseDTO);
        }
    }
}
