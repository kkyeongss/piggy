package com.piggy.paymentmethod;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;

/** 지출방법/결제수단 (예: 현금, 신한카드, 체크카드 ...) */
@Entity
@Table(name = "payment_methods")
public class PaymentMethod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    protected PaymentMethod() {
    }

    public PaymentMethod(Long userId, String name) {
        this.userId = userId;
        this.name = name;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    public void rename(String name) {
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Long getUserId() {
        return userId;
    }
}
