package com.piggy.category;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUserIdOrderByNameAsc(Long userId);

    boolean existsByUserIdAndName(Long userId, String name);

    boolean existsByUserIdAndNameAndIdNot(Long userId, String name, Long id);

    List<Category> findByUserIdAndSavingsTrue(Long userId);
}
