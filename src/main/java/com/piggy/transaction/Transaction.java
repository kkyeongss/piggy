package com.piggy.transaction;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/** 가계부 거래 한 건 (수입 또는 지출) */
@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TransactionType type;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    /** 분류 (예: 밥값, 저축, 교통 ...) */
    @Column(nullable = false, length = 50)
    private String category;

    /** 제목 (어디에 썼는지 / 내용). 선택 입력 */
    @Column(length = 100)
    private String title;

    /** 결제수단/카드 (예: 현금, 신한카드 ...). 선택 입력 */
    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    /** 메모. 선택 입력 */
    @Column(length = 255)
    private String memo;

    @Column(name = "transaction_date", nullable = false)
    private LocalDate date;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    protected Transaction() {
    }

    public Transaction(Long userId, TransactionType type, BigDecimal amount, String category, String title,
                       String paymentMethod, String memo, LocalDate date) {
        this.userId = userId;
        this.type = type;
        this.amount = amount;
        this.category = category;
        this.title = title;
        this.paymentMethod = paymentMethod;
        this.memo = memo;
        this.date = date;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    public void update(TransactionType type, BigDecimal amount, String category, String title,
                       String paymentMethod, String memo, LocalDate date) {
        this.type = type;
        this.amount = amount;
        this.category = category;
        this.title = title;
        this.paymentMethod = paymentMethod;
        this.memo = memo;
        this.date = date;
    }

    public Long getId() {
        return id;
    }

    public TransactionType getType() {
        return type;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getCategory() {
        return category;
    }

    public String getTitle() {
        return title;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public String getMemo() {
        return memo;
    }

    public LocalDate getDate() {
        return date;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Long getUserId() {
        return userId;
    }
}
