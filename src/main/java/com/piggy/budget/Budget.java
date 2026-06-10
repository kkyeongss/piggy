package com.piggy.budget;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "budget_setting")
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "monthly_budget", nullable = false, precision = 15, scale = 2)
    private BigDecimal monthlyBudget;

    protected Budget() {}

    public Budget(Long userId, BigDecimal monthlyBudget) {
        this.userId = userId;
        this.monthlyBudget = monthlyBudget;
    }

    public BigDecimal getMonthlyBudget() { return monthlyBudget; }

    public void setMonthlyBudget(BigDecimal monthlyBudget) {
        this.monthlyBudget = monthlyBudget;
    }
}
