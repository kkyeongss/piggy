package com.piggy.transaction;

import com.piggy.auth.SecurityUtils;
import com.piggy.common.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository repository;

    public TransactionService(TransactionRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public Transaction create(TransactionType type, BigDecimal amount, String category, String title,
                              String paymentMethod, String memo, LocalDate date) {
        Long userId = SecurityUtils.getCurrentUserId();
        return repository.save(new Transaction(
                userId, type, amount, category,
                blankToNull(title), blankToNull(paymentMethod), blankToNull(memo), date));
    }

    @Transactional(readOnly = true)
    public List<Transaction> findAll() {
        return repository.findByUserIdOrderByDateDescIdDesc(SecurityUtils.getCurrentUserId());
    }

    @Transactional(readOnly = true)
    public List<Transaction> findByMonth(int year, int month) {
        Long userId = SecurityUtils.getCurrentUserId();
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.plusMonths(1).minusDays(1);
        return repository.findByUserIdAndDateBetweenOrderByDateAscIdAsc(userId, start, end);
    }

    @Transactional
    public Transaction update(Long id, TransactionType type, BigDecimal amount, String category, String title,
                              String paymentMethod, String memo, LocalDate date) {
        Long userId = SecurityUtils.getCurrentUserId();
        Transaction tx = repository.findById(id)
                .filter(t -> t.getUserId().equals(userId))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "거래를 찾을 수 없어요."));
        tx.update(type, amount, category,
                blankToNull(title), blankToNull(paymentMethod), blankToNull(memo), date);
        return tx;
    }

    @Transactional
    public void delete(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        Transaction tx = repository.findById(id)
                .filter(t -> t.getUserId().equals(userId))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "거래를 찾을 수 없어요."));
        repository.delete(tx);
    }

    private static String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }
}
