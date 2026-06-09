package com.piggy.budget;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class BudgetService {

    private static final Long SINGLE_ID = 1L;

    private final BudgetRepository repository;

    public BudgetService(BudgetRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public BigDecimal getMonthlyBudget() {
        return repository.findById(SINGLE_ID)
                .map(Budget::getMonthlyBudget)
                .orElse(BigDecimal.ZERO);
    }

    @Transactional
    public void setMonthlyBudget(BigDecimal amount) {
        Budget budget = repository.findById(SINGLE_ID)
                .orElseGet(() -> new Budget(SINGLE_ID, BigDecimal.ZERO));
        budget.setMonthlyBudget(amount);
        repository.save(budget);
    }
}
