package com.piggy.reset;

import com.piggy.auth.SecurityUtils;
import com.piggy.category.CategoryRepository;
import com.piggy.common.ApiException;
import com.piggy.paymentmethod.PaymentMethodRepository;
import com.piggy.transaction.TransactionRepository;
import com.piggy.transaction.TransactionType;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ResetService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final PaymentMethodRepository paymentMethodRepository;

    public ResetService(TransactionRepository transactionRepository,
                        CategoryRepository categoryRepository,
                        PaymentMethodRepository paymentMethodRepository) {
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
        this.paymentMethodRepository = paymentMethodRepository;
    }

    @Transactional
    public void reset(String target) {
        Long userId = SecurityUtils.getCurrentUserId();
        switch (target) {
            case "income-transactions"  -> transactionRepository.deleteByUserIdAndType(userId, TransactionType.INCOME);
            case "expense-transactions" -> transactionRepository.deleteByUserIdAndType(userId, TransactionType.EXPENSE);
            case "saving-transactions"  -> transactionRepository.deleteByUserIdAndType(userId, TransactionType.SAVING);
            case "income-categories"    -> categoryRepository.deleteByUserIdAndType(userId, TransactionType.INCOME);
            case "expense-categories"   -> categoryRepository.deleteByUserIdAndType(userId, TransactionType.EXPENSE);
            case "saving-categories"    -> categoryRepository.deleteByUserIdAndType(userId, TransactionType.SAVING);
            case "payment-methods"      -> paymentMethodRepository.deleteByUserId(userId);
            case "all" -> {
                transactionRepository.deleteByUserId(userId);
                categoryRepository.deleteByUserId(userId);
                paymentMethodRepository.deleteByUserId(userId);
            }
            default -> throw new ApiException(HttpStatus.BAD_REQUEST, "알 수 없는 초기화 대상이에요.");
        }
    }
}
