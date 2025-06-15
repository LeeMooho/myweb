package com.bit.boardapp.configuration;

import com.bit.boardapp.jwt.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.filter.CorsFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public static PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
                    .cors(httpSecurityCorsConfigurer -> {})
                    .csrf(AbstractHttpConfigurer::disable)
                    .httpBasic(httpSecurityHttpBasicConfigurer -> {
                        httpSecurityHttpBasicConfigurer.disable();
                    })
                    .sessionManagement(httpSecuritySessionManagementConfigurer -> {
                        httpSecuritySessionManagementConfigurer.sessionCreationPolicy(SessionCreationPolicy.STATELESS);
                    })
                    .authorizeHttpRequests(authorizationManagerRequestMatcherRegistry -> {
                        authorizationManagerRequestMatcherRegistry.requestMatchers("/").permitAll();
                        authorizationManagerRequestMatcherRegistry.requestMatchers("/board/**").hasAnyRole("ADMIN", "USER");
                        authorizationManagerRequestMatcherRegistry.requestMatchers("/admin/**").hasRole("ADMIN");
                        authorizationManagerRequestMatcherRegistry.requestMatchers("/user/login").permitAll();
                        authorizationManagerRequestMatcherRegistry.requestMatchers("/user/join").permitAll();
                        authorizationManagerRequestMatcherRegistry.requestMatchers("/user/id-check").permitAll();
                        authorizationManagerRequestMatcherRegistry.anyRequest().authenticated();
                    })
                    .addFilterAfter(jwtAuthenticationFilter, CorsFilter.class)
                    .build();
    }
}
