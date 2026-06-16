// 인증 관련 API 호출 모음. 백엔드 응답 에러는 { "message": "..." } 형태로 통일돼 있음.

const JSON_HEADERS = { 'Content-Type': 'application/json' }

async function request(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: JSON_HEADERS,
    credentials: 'include', // 세션 쿠키 유지
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    let message = `요청에 실패했어요. (${res.status})`
    try {
      const data = await res.json()
      if (data && data.message) message = data.message
    } catch {
      // 본문이 비어있거나 JSON이 아니면 기본 메시지 사용
    }
    throw new Error(message)
  }

  if (res.status === 204) return null
  return res.json().catch(() => null)
}

export function login(loginId, password) {
  return request('/api/auth/login', { loginId, password })
}

export function quickLogin() {
  return request('/api/auth/quick-login', {})
}

export function signup(payload) {
  // payload: { loginId, password, name, phone }
  return request('/api/auth/signup', payload)
}

export function logout() {
  return request('/api/auth/logout', {})
}

export function findId(name, phone) {
  return request('/api/auth/find-id', { name, phone })
}

// 본인 확인 (비밀번호 찾기 1단계)
export function findPassword(loginId, name, phone) {
  return request('/api/auth/find-password', { loginId, name, phone })
}

// 새 비밀번호 설정 (비밀번호 찾기 2단계)
export function resetPassword(loginId, name, phone, newPassword) {
  return request('/api/auth/reset-password', { loginId, name, phone, newPassword })
}

// 휴대폰 인증번호 발송 (응답의 devCode 는 개발용 — 실제 SMS 연동 시 제거)
export async function checkLoginId(loginId) {
  const res = await fetch(`/api/auth/check-id?loginId=${encodeURIComponent(loginId)}`, {
    credentials: 'include',
  })
  if (res.status === 409) throw new Error('이미 사용 중인 아이디에요.')
  if (!res.ok) throw new Error('아이디 확인에 실패했어요.')
}

export function sendPhoneCode(phone) {
  return request('/api/auth/phone/send-code', { phone })
}

// 휴대폰 인증번호 검증
export function verifyPhoneCode(phone, code) {
  return request('/api/auth/phone/verify-code', { phone, code })
}

/**
 * 소셜 로그인 공급자 목록. 새 공급자 추가 = 이 배열에 한 줄 추가.
 * id 는 백엔드 Spring Security OAuth2 registrationId 와 일치시켜야 함.
 */
export const SOCIAL_PROVIDERS = [
  { id: 'kakao', label: '카카오로 시작하기', bg: '#fee500', color: '#191600' },
  { id: 'naver', label: '네이버로 시작하기', bg: '#03c75a', color: '#ffffff' },
]

/**
 * 소셜 로그인. 현재는 준비 중이라 안내만 표시.
 * 백엔드 OAuth2 설정 후 아래 redirect 한 줄로 교체하면 됨(팝업 없이 풀페이지 이동):
 *   window.location.href = `/oauth2/authorization/${providerId}`
 */
export function socialLogin(providerId) {
  void providerId
  alert('소셜 로그인은 준비 중이에요. 곧 추가할게요!')
}
