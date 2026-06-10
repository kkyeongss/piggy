package com.piggy.dashboard;

import com.piggy.auth.SecurityUtils;
import com.piggy.budget.BudgetService;
import com.piggy.category.CategoryService;
import com.piggy.dashboard.dto.DashboardResponse;
import com.piggy.dashboard.dto.DashboardResponse.CategoryExpense;
import com.piggy.dashboard.dto.DashboardResponse.WeeklyExpense;
import com.piggy.transaction.Transaction;
import com.piggy.transaction.TransactionRepository;
import com.piggy.transaction.TransactionType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final TransactionRepository transactionRepository;
    private final BudgetService budgetService;
    private final CategoryService categoryService;

    public DashboardService(TransactionRepository transactionRepository, BudgetService budgetService,
                            CategoryService categoryService) {
        this.transactionRepository = transactionRepository;
        this.budgetService = budgetService;
        this.categoryService = categoryService;
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(int year, int month) {
        Long userId = SecurityUtils.getCurrentUserId();
        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        BigDecimal totalIncome = transactionRepository
                .sumByUserIdAndTypeAndDateBetween(userId, TransactionType.INCOME, start, end);
        BigDecimal totalExpense = transactionRepository
                .sumByUserIdAndTypeAndDateBetween(userId, TransactionType.EXPENSE, start, end);

        List<Transaction> monthExpenses = transactionRepository
                .findByUserIdAndTypeAndDateBetween(userId, TransactionType.EXPENSE, start, end);

        Map<String, BigDecimal> byCategory = new LinkedHashMap<>();
        for (Transaction t : monthExpenses) {
            byCategory.merge(t.getCategory(), t.getAmount(), BigDecimal::add);
        }
        List<CategoryExpense> categoryExpenses = byCategory.entrySet().stream()
                .sorted(Map.Entry.<String, BigDecimal>comparingByValue().reversed())
                .map(e -> new CategoryExpense(e.getKey(), e.getValue()))
                .toList();

        List<WeeklyExpense> weeklyExpenses = new ArrayList<>();
        for (YearMonth m : List.of(ym.minusMonths(1), ym)) {
            LocalDate ms = m.atDay(1);
            LocalDate me = m.atEndOfMonth();
            List<Transaction> exp = transactionRepository
                    .findByUserIdAndTypeAndDateBetween(userId, TransactionType.EXPENSE, ms, me);
            int weeks = (int) Math.ceil(m.lengthOfMonth() / 7.0);
            BigDecimal[] weekSums = new BigDecimal[weeks];
            for (int i = 0; i < weeks; i++) weekSums[i] = BigDecimal.ZERO;
            for (Transaction t : exp) {
                int idx = Math.min((t.getDate().getDayOfMonth() - 1) / 7, weeks - 1);
                weekSums[idx] = weekSums[idx].add(t.getAmount());
            }
            for (int i = 0; i < weeks; i++) {
                weeklyExpenses.add(new WeeklyExpense(m.getMonthValue() + "월 " + (i + 1) + "주", weekSums[i]));
            }
        }

        BigDecimal budget = budgetService.getMonthlyBudget();
        Double budgetUsedRate = null;
        BigDecimal budgetRemaining = null;
        if (budget.signum() > 0) {
            budgetUsedRate = totalExpense.doubleValue() / budget.doubleValue();
            budgetRemaining = budget.subtract(totalExpense);
        }

        List<String> savingsNames = categoryService.savingsCategoryNames();
        Map<String, BigDecimal> savByCat = new LinkedHashMap<>();
        for (String n : savingsNames) savByCat.put(n, BigDecimal.ZERO);
        if (!savingsNames.isEmpty()) {
            for (Transaction t : transactionRepository.findByUserIdAndCategoryIn(userId, savingsNames)) {
                savByCat.merge(t.getCategory(), t.getAmount(), BigDecimal::add);
            }
        }
        BigDecimal savingsTotal = savByCat.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        List<CategoryExpense> savingsBreakdown = savByCat.entrySet().stream()
                .sorted(Map.Entry.<String, BigDecimal>comparingByValue().reversed())
                .map(e -> new CategoryExpense(e.getKey(), e.getValue()))
                .toList();

        BigDecimal netCash = transactionRepository.sumByUserIdAndType(userId, TransactionType.INCOME)
                .subtract(transactionRepository.sumByUserIdAndType(userId, TransactionType.EXPENSE));
        BigDecimal availableCash = netCash.subtract(savingsTotal);

        return new DashboardResponse(
                year, month,
                totalIncome, totalExpense,
                categoryExpenses,
                budget, budgetUsedRate, budgetRemaining,
                savingsTotal,
                savingsBreakdown,
                availableCash,
                weeklyExpenses
        );
    }
}
