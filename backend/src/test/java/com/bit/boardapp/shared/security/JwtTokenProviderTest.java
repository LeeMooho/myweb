package com.bit.boardapp.shared.security;

import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

class JwtTokenProviderTest {
    private final JwtTokenProvider provider = new JwtTokenProvider();

    @Test
    void tokenRoundTripUsesAnIdentityStringWithoutAFeatureEntity() {
        assertThat(provider.validateAndGetUsername(provider.create("test-writer")))
                .isEqualTo("test-writer");
    }

    @Test
    void malformedTokensAreRejected() {
        assertThatThrownBy(() -> provider.validateAndGetUsername("invalid.token"))
                .isInstanceOf(JwtException.class);
    }
}
