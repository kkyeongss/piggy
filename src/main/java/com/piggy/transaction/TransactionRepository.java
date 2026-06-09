package com.piggy.transaction;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByTypeAndDateBetween(TransactionType type, LocalDate start, LocalDate end);

    List<Transaction> findAllByOrderByDateDescIdDesc();

    List<Transaction> findByDateBetweenOrderByDateAscIdAsc(LocalDate start, LocalDate end);

    @Query("select coalesce(sum(t.amount), 0) from Transaction t "
            + "where t.type = :type and t.date between :start and :end")
    BigDecimal sumByTypeAndDateBetween(@Param("type") TransactionType type,
                                       @Param("start") LocalDate start,
                                       @Param("end") LocalDate end);

    @Query("select coalesce(sum(t.amount), 0) from Transaction t where t.type = :type")
    BigDecimal sumByType(@Param("type") TransactionType type);

    @Query("select coalesce(sum(t.amount), 0) from Transaction t where t.category in :names")
    BigDecimal sumByCategoryIn(@Param("names") java.util.Collection<String> names);

    List<Transaction> findByCategoryIn(java.util.Collection<String> names);
}
