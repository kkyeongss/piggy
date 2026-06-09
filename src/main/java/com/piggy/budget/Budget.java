package com.piggy.budget;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;

/** 월 예산 설정 (단일 행, id=1 고정). 추후 설정 화면에서 관리 예정. */
@Entity
@Table(name = "budget_setting")
public class Budget {

    @Id
    private Long id;

    @Column(name = "monthly_budget", nullable = false, precision = 15, scale = 2)
    private BigDecimal monthlyBudget;

    protected Budget() {
    }

    public Budget(Long id, BigDecimal monthlyBudget) {
        this.id = id;
        this.monthlyBudget = monthlyBudget;
    }

    public BigDecimal getMonthlyBudget() {
        return monthlyBudget;
    }

    public void setMonthlyBudget(BigDecimal monthlyBudget) {
        this.monthlyBudget = monthlyBudget;
    }
}
