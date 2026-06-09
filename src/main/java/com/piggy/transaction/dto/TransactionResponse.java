package com.piggy.transaction.dto;

import com.piggy.transaction.Transaction;
import com.piggy.transaction.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionResponse(
        Long id,
        TransactionType type,
        BigDecimal amount,
        String category,
        String title,
        String paymentMethod,
        String memo,
        LocalDate date
) {
    public static TransactionResponse from(Transaction t) {
        return new TransactionResponse(t.getId(), t.getType(), t.getAmount(),
                t.getCategory(), t.getTitle(), t.getPaymentMethod(), t.getMemo(), t.getDate());
    }
}
