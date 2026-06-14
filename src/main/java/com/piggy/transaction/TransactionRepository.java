package com.piggy.transaction;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUserIdAndTypeAndDateBetween(Long userId, TransactionType type, LocalDate start, LocalDate end);

    List<Transaction> findByUserIdOrderByDateDescIdDesc(Long userId);

    List<Transaction> findByUserIdAndDateBetweenOrderByDateAscIdAsc(Long userId, LocalDate start, LocalDate end);

    @Query("select coalesce(sum(t.amount), 0) from Transaction t "
            + "where t.userId = :userId and t.type = :type and t.date between :start and :end")
    BigDecimal sumByUserIdAndTypeAndDateBetween(@Param("userId") Long userId,
                                               @Param("type") TransactionType type,
                                               @Param("start") LocalDate start,
                                               @Param("end") LocalDate end);

    @Query("select coalesce(sum(t.amount), 0) from Transaction t where t.userId = :userId and t.type = :type")
    BigDecimal sumByUserIdAndType(@Param("userId") Long userId, @Param("type") TransactionType type);

    @Query("select coalesce(sum(t.amount), 0) from Transaction t where t.userId = :userId and t.category in :names")
    BigDecimal sumByUserIdAndCategoryIn(@Param("userId") Long userId, @Param("names") java.util.Collection<String> names);

    List<Transaction> findByUserIdAndCategoryIn(Long userId, java.util.Collection<String> names);

    List<Transaction> findByUserIdAndType(Long userId, TransactionType type);
}
