// 공통 fetch 헬퍼. 에러는 백엔드의 { "message": "..." } 형식을 우선 사용.
export async function api(url, options = {}) {
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    let message = `요청에 실패했어요. (${res.status})`
    try {
      const data = await res.json()
      if (data && data.message) message = data.message
    } catch {
      // 무시
    }
    throw new Error(message)
  }

  if (res.status === 204) return null
  return res.json().catch(() => null)
}
