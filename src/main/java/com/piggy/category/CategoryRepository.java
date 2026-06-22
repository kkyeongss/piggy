package com.piggy.category;

import com.piggy.transaction.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUserIdOrderByNameAsc(Long userId);

    boolean existsByUserIdAndTypeAndName(Long userId, TransactionType type, String name);

    boolean existsByUserIdAndTypeAndNameAndIdNot(Long userId, TransactionType type, String name, Long id);

    List<Category> findByUserIdAndSavingsTrue(Long userId);

    @Modifying
    @Query("delete from Category c where c.userId = :userId and c.type = :type")
    int deleteByUserIdAndType(@Param("userId") Long userId, @Param("type") TransactionType type);

    @Modifying
    @Query("delete from Category c where c.userId = :userId")
    int deleteByUserId(@Param("userId") Long userId);
}
