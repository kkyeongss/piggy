package com.piggy;

import static org.assertj.core.api.Assertions.assertThat;

import com.piggy.auth.PiggyUserDetails;
import com.piggy.auth.User;
import com.piggy.auth.UserRepository;
import com.piggy.dashboard.DashboardService;
import com.piggy.dashboard.dto.DashboardResponse;
import com.piggy.transaction.TransactionService;
import com.piggy.transaction.TransactionType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootTest
class DashboardSmokeTest {

    @Autowired TransactionService transactionService;
    @Autowired DashboardService dashboardService;
    @Autowired UserRepository userRepository;
    @Autowired PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUpAuth() {
        User user = userRepository.findByLoginId("testuser").orElseGet(() ->
                userRepository.save(new User("testuser", passwordEncoder.encode("pw"), "테스트", "010-0000-0000")));
        PiggyUserDetails principal = new PiggyUserDetails(user.getId(), user.getLoginId(), user.getPasswordHash());
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));
    }

    @Test
    void contextLoads() {
        // 스프링 컨텍스트(빈/JPA 매핑/H2)가 정상 기동되는지 확인
    }

    @Test
    void dashboardAggregatesTransactions() {
        YearMonth ym = YearMonth.now();
        LocalDate day = ym.atDay(10);

        transactionService.create(TransactionType.INCOME, new BigDecimal("3000000"), "급여", null, null, null, day);
        transactionService.create(TransactionType.EXPENSE, new BigDecimal("12000"), "식비", "점심", "현금", null, day);
        transactionService.create(TransactionType.EXPENSE, new BigDecimal("4000"), "카페", null, "신용카드", null, day);

        DashboardResponse r = dashboardService.getDashboard(ym.getYear(), ym.getMonthValue());

        assertThat(r.totalIncome()).isEqualByComparingTo("3000000");
        assertThat(r.totalExpense()).isEqualByComparingTo("16000");
        assertThat(r.savingsTotal()).isEqualByComparingTo("0");
        assertThat(r.categoryExpenses()).hasSizeGreaterThanOrEqualTo(2);
    }
}
