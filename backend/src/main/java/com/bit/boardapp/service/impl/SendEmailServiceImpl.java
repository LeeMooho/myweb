package com.bit.boardapp.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;

import com.bit.boardapp.dto.UserDTO;
import com.bit.boardapp.dto.MessageDTO;
import com.bit.boardapp.service.SendEmailService;

@Slf4j
@Service
@RequiredArgsConstructor
public class SendEmailServiceImpl implements SendEmailService {

    private final JavaMailSender mailSend;

    @Value("${FROM_ADDRESS}")
    private String FROM_ADDRESS ;


    @Override
    public void mailSend(UserDTO userDTO){

        MessageDTO messageDTO = new MessageDTO();

        String userEmail = userDTO.getUserEmail();

        SimpleMailMessage message = new SimpleMailMessage();

        messageDTO.setUsername(userEmail);
        messageDTO.setSubject("Welcome, This is from Mooho");
        messageDTO.setContents("Hello, This is from Mooho");

        message.setTo(messageDTO.getUsername());
        message.setFrom(FROM_ADDRESS);
        message.setSubject(messageDTO.getSubject());
        message.setText(messageDTO.getContents());

        mailSend.send(message);

    };
}
