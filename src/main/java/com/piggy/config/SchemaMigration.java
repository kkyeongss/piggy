package com.piggy.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * TransactionType 에 SAVING 추가 시 H2의 컬럼 CHECK 제약을 갱신.
 */
@Component
public class SchemaMigration implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SchemaMigration.class);

    private final JdbcTemplate jdbc;

    public SchemaMigration(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(ApplicationArguments args) {
        // H2 2.x: ALTER COLUMN ... SET CHECK 로 기존 인라인 체크 제약을 교체
        try {
            jdbc.execute("ALTER TABLE transactions ALTER COLUMN type SET CHECK " +
                         "(type IN ('INCOME', 'EXPENSE', 'SAVING'))");
            log.info("SchemaMigration: transactions.type CHECK 제약 업데이트 완료");
        } catch (Exception e) {
            log.warn("SchemaMigration SET CHECK 실패, 다른 방법 시도: {}", e.getMessage());
            tryFallback();
        }
    }

    private void tryFallback() {
        // fallback: 컬럼 타입 재정의로 기존 check 제거 후 재추가
        try {
            jdbc.execute("ALTER TABLE transactions ALTER COLUMN type varchar(10) NOT NULL");
            jdbc.execute("ALTER TABLE transactions ADD CONSTRAINT ck_tx_type " +
                         "CHECK (type IN ('INCOME', 'EXPENSE', 'SAVING'))");
            log.info("SchemaMigration fallback 완료");
        } catch (Exception e2) {
            log.warn("SchemaMigration fallback 실패: {}", e2.getMessage());
        }
    }
}
