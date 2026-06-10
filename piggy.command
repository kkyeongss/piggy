#!/bin/bash
# 맥 더블클릭 실행 파일 - piggy.jar와 같은 폴더에 두고 실행
cd "$(dirname "$0")"

# Java 확인
if ! command -v java &>/dev/null; then
  osascript -e 'display alert "Java가 설치되어 있지 않습니다." message "https://adoptium.net 에서 Java 21을 설치하세요."'
  exit 1
fi

# 8080 포트 중복 실행 방지
if lsof -ti:8080 &>/dev/null; then
  osascript -e 'display alert "Piggy 실행 중" message "이미 8080 포트에서 실행 중입니다. 브라우저에서 http://localhost:8080 을 열어주세요."'
  open http://localhost:8080
  exit 0
fi

# 앱 시작
java -Dpiggy.open-browser=true -jar piggy.jar
