package com.piggy.dashboard.dto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardResponse(
        int year,
        int month,
        BigDecimal totalIncome,
        BigDecimal totalExpense,
        List<CategoryExpense> categoryExpenses,   // 분류별 지출
        BigDecimal monthlyBudget,                  // 0 이면 미설정
        Double budgetUsedRate,                     // 지출/예산 (예산 0이면 null)
        BigDecimal budgetRemaining,                // 예산-지출 (예산 0이면 null)
        BigDecimal savingsTotal,                   // 저축 카테고리 누적 금액
        List<CategoryExpense> savingsBreakdown,    // 저축 카테고리별 누적
        List<WeeklyExpense> weeklyExpenses         // 주간 지출 추이
) {
    public record CategoryExpense(String category, BigDecimal amount) {
    }

    public record WeeklyExpense(String label, BigDecimal amount) {
    }
}
