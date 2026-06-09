import { useCallback, useEffect, useRef, useState } from 'react'
import './Modal.css'

/**
 * 단일 페이지 유지용 모달 팝업. window.open 없이 화면 위 오버레이로 표시.
 * - 닫힐 때 아래로 슬라이드 + 페이드 아웃 (요청한 "팝업이 내려가는" 모션)
 * - ESC / 딤 클릭 / X 로 닫기
 * - closing prop 으로 외부에서 종료 모션을 트리거할 수 있음 (예: 회원가입 완료)
 * - onBack 이 있으면 헤더 좌측에 뒤로가기 버튼 표시
 */
export default function Modal({ title, onClose, onBack, children, closing: controlledClosing = false, wide = false }) {
  const panelRef = useRef(null)
  const [internalClosing, setInternalClosing] = useState(false)
  const closing = controlledClosing || internalClosing

  const requestClose = useCallback(() => setInternalClosing(true), [])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') requestClose()
    }
    document.addEventListener('keydown', onKeyDown)

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const firstField =
      panelRef.current?.querySelector('input, textarea, select') ||
      panelRef.current?.querySelector('button')
    firstField?.focus()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [requestClose])

  // 패널의 종료 애니메이션이 끝나면 실제 언마운트
  const handleAnimationEnd = (e) => {
    if (e.target !== e.currentTarget) return
    if (closing) onClose()
  }

  return (
    <div className={`modal-overlay${closing ? ' is-closing' : ''}`} onMouseDown={requestClose}>
      <div
        className={`modal-panel${wide ? ' wide' : ''}${closing ? ' is-closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={panelRef}
        onMouseDown={(e) => e.stopPropagation()}
        onAnimationEnd={handleAnimationEnd}
      >
        <div className="modal-header">
          {onBack ? (
            <button type="button" className="modal-icon-btn" aria-label="이전" onClick={onBack}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          ) : (
            <span className="modal-icon-placeholder" aria-hidden="true" />
          )}
          <h2 className="modal-title">{title}</h2>
          <button type="button" className="modal-icon-btn" aria-label="닫기" onClick={requestClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}
