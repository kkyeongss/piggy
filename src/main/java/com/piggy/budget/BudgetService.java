package com.piggy.budget;

import com.piggy.auth.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class BudgetService {

    private final BudgetRepository repository;

    public BudgetService(BudgetRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public BigDecimal getMonthlyBudget() {
        Long userId = SecurityUtils.getCurrentUserId();
        return repository.findByUserId(userId)
                .map(Budget::getMonthlyBudget)
                .orElse(BigDecimal.ZERO);
    }

    @Transactional
    public void setMonthlyBudget(BigDecimal amount) {
        Long userId = SecurityUtils.getCurrentUserId();
        Budget budget = repository.findByUserId(userId)
                .orElseGet(() -> new Budget(userId, BigDecimal.ZERO));
        budget.setMonthlyBudget(amount);
        repository.save(budget);
    }
}
