package com.piggy.dashboard.dto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardResponse(
        int year,
        int month,
        BigDecimal totalIncome,
        BigDecimal totalExpense,
        BigDecimal totalSaving,                    // 이번 달 저축 합계
        List<CategoryExpense> categoryExpenses,   // 분류별 지출
        List<CategoryExpense> incomeBreakdown,    // 이번 달 수입 내역
        BigDecimal monthlyBudget,                  // 0 이면 미설정
        Double budgetUsedRate,                     // 지출/예산 (예산 0이면 null)
        BigDecimal budgetRemaining,                // 예산-지출 (예산 0이면 null)
        BigDecimal savingsTotal,                   // 저축 누적 금액 (전체 기간)
        List<CategoryExpense> savingsBreakdown,    // 저축 항목별 누적
        BigDecimal availableCash,                  // 사용 가능 금액 (전체 수입 − 지출 − 저축)
        List<WeeklyExpense> weeklyExpenses         // 주간 지출 추이
) {
    public record CategoryExpense(String category, BigDecimal amount) {
    }

    public record WeeklyExpense(String label, BigDecimal amount) {
    }
}
