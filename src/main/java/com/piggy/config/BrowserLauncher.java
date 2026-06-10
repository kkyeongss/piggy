package com.piggy.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.awt.Desktop;
import java.net.URI;

/**
 * 앱이 완전히 뜨면(ApplicationReadyEvent) 기본 브라우저로 화면을 자동으로 엽니다.
 * piggy.open-browser=true 일 때만 동작 (실행 스크립트에서 -Dpiggy.open-browser=true 로 켬).
 * 개발 모드(./gradlew bootRun)에서는 기본값 false 라 열리지 않습니다.
 */
@Component
public class BrowserLauncher {

    @Value("${piggy.open-browser:false}")
    private boolean openBrowser;

    @Value("${server.port:8080}")
    private int port;

    @EventListener(ApplicationReadyEvent.class)
    public void openOnStartup() {
        if (!openBrowser) {
            return;
        }
        String url = "http://localhost:" + port;

        // 1순위: java.awt.Desktop
        try {
            if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
                Desktop.getDesktop().browse(new URI(url));
                return;
            }
        } catch (Exception ignored) {
            // 폴백으로 진행
        }

        // 2순위: OS별 명령
        try {
            String os = System.getProperty("os.name", "").toLowerCase();
            ProcessBuilder pb;
            if (os.contains("win")) {
                pb = new ProcessBuilder("rundll32", "url.dll,FileProtocolHandler", url);
            } else if (os.contains("mac")) {
                pb = new ProcessBuilder("open", url);
            } else {
                pb = new ProcessBuilder("xdg-open", url);
            }
            pb.start();
        } catch (Exception ignored) {
            // 자동 열기에 실패해도 앱은 정상 동작 (사용자가 직접 접속하면 됨)
        }
    }
}
