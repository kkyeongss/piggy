package com.piggy.common;

import org.springframework.http.HttpStatus;

/**
 * 비즈니스 로직에서 발생시키는 예외. 상태코드 + 사용자에게 보여줄 메시지를 담는다.
 */
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
