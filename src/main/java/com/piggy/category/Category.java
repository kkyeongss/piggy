package com.piggy.category;

import com.piggy.transaction.TransactionType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

/** 거래 분류. 수입용/지출용 구분(type)과 저축 집계 여부(savings)를 가진다. */
@Entity
@Table(name = "categories", uniqueConstraints = @UniqueConstraint(name = "uk_categories_name", columnNames = "name"))
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @ColumnDefault("'EXPENSE'")
    @Column(name = "type", nullable = false, length = 10)
    private TransactionType type;

    @Column(nullable = false, length = 50)
    private String name;

    /** 저축으로 집계할지 여부. '현재 모은 현금'에 합산됨 */
    @ColumnDefault("false")
    @Column(nullable = false)
    private boolean savings;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected Category() {
    }

    public Category(TransactionType type, String name, boolean savings) {
        this.type = type;
        this.name = name;
        this.savings = savings;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    public void update(String name, boolean savings) {
        this.name = name;
        this.savings = savings;
    }

    public Long getId() {
        return id;
    }

    public TransactionType getType() {
        return type;
    }

    public String getName() {
        return name;
    }

    public boolean isSavings() {
        return savings;
    }
}
