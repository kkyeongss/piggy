package com.piggy.budget;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/budget")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @GetMapping
    public BudgetResponse get() {
        return new BudgetResponse(budgetService.getMonthlyBudget());
    }

    @PutMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void update(@Valid @RequestBody BudgetRequest req) {
        budgetService.setMonthlyBudget(req.monthlyBudget());
    }

    public record BudgetResponse(BigDecimal monthlyBudget) {
    }

    public record BudgetRequest(
            @NotNull(message = "예산 금액은 필수입니다.")
            @PositiveOrZero(message = "예산은 0 이상이어야 합니다.")
            BigDecimal monthlyBudget
    ) {
    }
}
