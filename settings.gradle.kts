plugins {
    // JDK 21이 로컬에 없으면 자동으로 받아오도록 toolchain resolver 추가
    id("org.gradle.toolchains.foojay-resolver-convention") version "1.0.0"
}

rootProject.name = "piggy"
