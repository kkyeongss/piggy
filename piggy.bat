@echo off
:: 윈도우 더블클릭 실행 파일 - piggy.jar와 같은 폴더에 두고 실행
cd /d "%~dp0"

:: Java 확인
java -version >nul 2>&1
if errorlevel 1 (
  echo [오류] Java가 설치되어 있지 않습니다.
  echo https://adoptium.net 에서 Java 21을 설치하세요.
  pause
  exit /b 1
)

:: 8080 포트 중복 실행 방지
netstat -ano | findstr ":8080 " | findstr LISTENING >nul 2>&1
if not errorlevel 1 (
  echo 이미 8080 포트에서 실행 중입니다.
  start http://localhost:8080
  pause
  exit /b 0
)

:: 앱 시작 (콘솔 창 유지하여 로그 확인 가능)
echo Piggy 가계부를 시작합니다...
java -Dpiggy.open-browser=true -jar piggy.jar
pause
