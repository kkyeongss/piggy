package com.piggy.auth;

import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static Long getCurrentUserId() {
        var principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof PiggyUserDetails userDetails) {
            return userDetails.getUserId();
        }
        throw new IllegalStateException("인증 정보를 찾을 수 없어요.");
    }
}
