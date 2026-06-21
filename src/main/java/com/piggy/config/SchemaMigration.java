package com.piggy.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SchemaMigration implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SchemaMigration.class);

    private final JdbcTemplate jdbc;

    public SchemaMigration(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(ApplicationArguments args) {
        fixEnumCheck("transactions");
        fixEnumCheck("categories");
    }

    private void fixEnumCheck(String table) {
        String upperTable = table.toUpperCase();

        // INFORMATION_SCHEMA에서 실제 CHECK 제약 이름을 조회해 정확히 삭제
        // UPPER() 사용 — Hibernate가 소문자 테이블명으로 저장할 수도 있어서 대소문자 무관 매칭
        List<String> names = List.of();
        try {
            names = jdbc.queryForList(
                "SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS " +
                "WHERE UPPER(TABLE_NAME) = ? AND CONSTRAINT_TYPE = 'CHECK'",
                String.class, upperTable
            );
        } catch (Exception e) {
            log.debug("SchemaMigration: {} 제약 조회 실패 - {}", table, e.getMessage());
        }

        for (String name : names) {
            try {
                // 정확한 이름(대소문자 포함)으로 따옴표 처리해 삭제
                jdbc.execute("ALTER TABLE " + table + " DROP CONSTRAINT IF EXISTS \"" + name + "\"");
                log.info("SchemaMigration: {}.type 기존 CHECK 삭제: {}", table, name);
            } catch (Exception e) {
                log.debug("SchemaMigration: {} 제약 {} 삭제 실패 - {}", table, name, e.getMessage());
            }
        }

        // 인라인 제약도 제거 (ALTER COLUMN은 컬럼 레벨 CHECK를 드롭함)
        try {
            jdbc.execute("ALTER TABLE " + table + " ALTER COLUMN type varchar(10) NOT NULL");
        } catch (Exception e) {
            log.debug("SchemaMigration: {}.type ALTER COLUMN 스킵 - {}", table, e.getMessage());
        }

        // 올바른 제약 추가
        try {
            jdbc.execute("ALTER TABLE " + table + " ADD CONSTRAINT CK_" + upperTable + "_TYPE " +
                         "CHECK (type IN ('INCOME', 'EXPENSE', 'SAVING'))");
            log.info("SchemaMigration: {}.type CHECK 업데이트 완료", table);
        } catch (Exception e) {
            log.warn("SchemaMigration: {}.type ADD CONSTRAINT 실패 - {}", table, e.getMessage());
        }
    }
}
