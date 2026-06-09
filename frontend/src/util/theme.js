const KEY = 'piggy_theme'

export function getTheme() {
  try {
    return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

export function setTheme(theme) {
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    /* 저장 실패해도 적용은 진행 */
  }
  applyTheme(theme)
}

// 앱 시작 시 저장된 테마 적용 (깜빡임 방지)
export function initTheme() {
  applyTheme(getTheme())
}
