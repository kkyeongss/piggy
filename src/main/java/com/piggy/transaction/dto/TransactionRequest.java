package com.piggy.transaction.dto;

import com.piggy.transaction.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionRequest(
        @NotNull(message = "수입/지출 구분은 필수입니다.")
        TransactionType type,

        @NotNull(message = "금액은 필수입니다.")
        @Positive(message = "금액은 0보다 커야 합니다.")
        BigDecimal amount,

        @NotBlank(message = "카테고리는 필수입니다.")
        @Size(max = 50)
        String category,

        @Size(max = 100)
        String title,

        @Size(max = 50)
        String paymentMethod,

        @Size(max = 255)
        String memo,

        @NotNull(message = "날짜는 필수입니다.")
        LocalDate date
) {
}
