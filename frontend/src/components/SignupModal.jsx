import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Modal from './Modal.jsx'
import { sendPhoneCode, verifyPhoneCode, signup } from '../api/auth.js'
import './SignupModal.css'

const STEP_TITLES = ['약관 동의', '정보 입력', '휴대폰 인증']

export default function SignupModal({ onClose }) {
  const [step, setStep] = useState(0)
  const [finishing, setFinishing] = useState(false) // 완료 → 모달 슬라이드다운
  const [showDone, setShowDone] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 1단계: 약관
  const [agree, setAgree] = useState({ terms: false, privacy: false, marketing: false })
  const allChecked = agree.terms && agree.privacy && agree.marketing
  const requiredChecked = agree.terms && agree.privacy

  const toggleAll = () => {
    const next = !allChecked
    setAgree({ terms: next, privacy: next, marketing: next })
  }
  const toggleOne = (key) => setAgree((prev) => ({ ...prev, [key]: !prev[key] }))

  // 2단계: 정보 입력
  const [form, setForm] = useState({ loginId: '', password: '', passwordConfirm: '', name: '', phone: '' })
  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  // 3단계: 휴대폰 인증
  const [codeSent, setCodeSent] = useState(false)
  const [devCode, setDevCode] = useState(null)
  const [code, setCode] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    if (secondsLeft <= 0) return
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [secondsLeft])

  // 단계 높이 측정 → 부드러운 높이 전환
  const viewportRef = useRef(null)
  const stepRefs = useRef([])
  const [height, setHeight] = useState('auto')

  useLayoutEffect(() => {
    const el = stepRefs.current[step]
    if (el) setHeight(el.offsetHeight)
  }, [step, codeSent, devCode, error, secondsLeft, agree, form, code])

  const goTo = (next) => {
    setError('')
    setStep(next)
  }

  const handleAgreeNext = () => {
    if (!requiredChecked) {
      setError('필수 약관에 동의해주세요.')
      return
    }
    goTo(1)
  }

  const handleInfoNext = () => {
    const { loginId, password, passwordConfirm, name, phone } = form
    if (!loginId || !password || !name || !phone) {
      setError('모든 항목을 입력해주세요.')
      return
    }
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않아요.')
      return
    }
    goTo(2)
  }

  const handleSendCode = async () => {
    setError('')
    setSubmitting(true)
    try {
      const res = await sendPhoneCode(form.phone.replace(/-/g, ''))
      setDevCode(res?.devCode ?? null)
      setCodeSent(true)
      setSecondsLeft(180)
    } catch (err) {
      setError(err.message || '인증번호 발송에 실패했어요.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerifyAndSignup = async () => {
    if (!code) {
      setError('인증번호를 입력해주세요.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const phone = form.phone.replace(/-/g, '')
      await verifyPhoneCode(phone, code)
      await signup({
        loginId: form.loginId,
        password: form.password,
        name: form.name,
        phone,
      })
      setShowDone(true)
      setTimeout(() => setFinishing(true), 1000) // 완료 후 모달 슬라이드다운
    } catch (err) {
      setError(err.message || '가입에 실패했어요.')
    } finally {
      setSubmitting(false)
    }
  }

  const mmss = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`

  if (showDone) {
    return (
      <Modal title="가입 완료" onClose={onClose} closing={finishing}>
        <div className="signup-done">
          <div className="signup-done-check" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="signup-done-title">가입 완료!</p>
          <p className="signup-done-desc">이제 로그인할 수 있어요.</p>
        </div>
      </Modal>
    )
  }

  const setStepRef = (i) => (el) => { stepRefs.current[i] = el }

  return (
    <Modal
      title={STEP_TITLES[step]}
      onClose={onClose}
      onBack={step > 0 ? () => goTo(step - 1) : undefined}
    >
      <div className="step-dots" aria-hidden="true">
        {STEP_TITLES.map((_, i) => (
          <span key={i} className={`step-dot${i === step ? ' active' : ''}`} />
        ))}
      </div>

      <div className="step-viewport" ref={viewportRef} style={{ height }}>
        <div className="step-track" style={{ transform: `translateX(-${step * 100}%)` }}>
          {/* 1단계: 약관 동의 */}
          <div className="step-panel" ref={setStepRef(0)} {...(step !== 0 ? { inert: true } : {})}>
            <div className="terms">
              <label className="terms-row terms-all">
                <input type="checkbox" checked={allChecked} onChange={toggleAll} />
                <span>전체 동의</span>
              </label>
              <div className="terms-divider" />
              <label className="terms-row">
                <input type="checkbox" checked={agree.terms} onChange={() => toggleOne('terms')} />
                <span><b className="terms-required">[필수]</b> 이용약관 동의</span>
              </label>
              <label className="terms-row">
                <input type="checkbox" checked={agree.privacy} onChange={() => toggleOne('privacy')} />
                <span><b className="terms-required">[필수]</b> 개인정보 수집·이용 동의</span>
              </label>
              <label className="terms-row">
                <input type="checkbox" checked={agree.marketing} onChange={() => toggleOne('marketing')} />
                <span><b className="terms-optional">[선택]</b> 마케팅 정보 수신 동의</span>
              </label>
            </div>
            {step === 0 && error && <p className="form-message is-error">{error}</p>}
            <button type="button" className="btn btn-primary step-action" onClick={handleAgreeNext} disabled={!requiredChecked}>
              다음
            </button>
          </div>

          {/* 2단계: 정보 입력 */}
          <div className="step-panel" ref={setStepRef(1)} {...(step !== 1 ? { inert: true } : {})}>
            <div className="modal-form">
              <div className="field">
                <label htmlFor="su-loginId">아이디</label>
                <input id="su-loginId" className="input" type="text" autoComplete="username"
                  placeholder="사용할 아이디" value={form.loginId} onChange={update('loginId')} />
              </div>
              <div className="field">
                <label htmlFor="su-password">비밀번호</label>
                <input id="su-password" className="input" type="password" autoComplete="new-password"
                  placeholder="비밀번호" value={form.password} onChange={update('password')} />
              </div>
              <div className="field">
                <label htmlFor="su-passwordConfirm">비밀번호 확인</label>
                <input id="su-passwordConfirm" className="input" type="password" autoComplete="new-password"
                  placeholder="비밀번호 다시 입력" value={form.passwordConfirm} onChange={update('passwordConfirm')} />
              </div>
              <div className="field">
                <label htmlFor="su-name">이름</label>
                <input id="su-name" className="input" type="text" autoComplete="name"
                  placeholder="이름" value={form.name} onChange={update('name')} />
              </div>
              <div className="field">
                <label htmlFor="su-phone">핸드폰 번호</label>
                <input id="su-phone" className="input" type="tel" inputMode="numeric" autoComplete="tel"
                  placeholder="01000000000" value={form.phone} onChange={update('phone')} />
              </div>
              {step === 1 && error && <p className="form-message is-error">{error}</p>}
              <button type="button" className="btn btn-primary" onClick={handleInfoNext}>
                다음
              </button>
            </div>
          </div>

          {/* 3단계: 휴대폰 인증 */}
          <div className="step-panel" ref={setStepRef(2)} {...(step !== 2 ? { inert: true } : {})}>
            <p className="modal-desc"><b>{form.phone}</b> 번호로 인증번호를 받아 입력해주세요.</p>
            <div className="modal-form">
              {!codeSent ? (
                <button type="button" className="btn btn-primary" onClick={handleSendCode} disabled={submitting}>
                  {submitting ? '발송 중...' : '인증번호 받기'}
                </button>
              ) : (
                <>
                  {devCode && (
                    <p className="dev-hint">개발용 인증번호: <b>{devCode}</b> (실제 서비스에서는 문자로 발송돼요)</p>
                  )}
                  <div className="field">
                    <label htmlFor="su-code">인증번호</label>
                    <div className="code-row">
                      <input id="su-code" className="input" type="text" inputMode="numeric" maxLength={6}
                        placeholder="6자리" value={code} onChange={(e) => setCode(e.target.value)} />
                      <span className="code-timer">{secondsLeft > 0 ? mmss : '만료'}</span>
                    </div>
                  </div>
                  <button type="button" className="resend-btn" onClick={handleSendCode} disabled={submitting}>
                    인증번호 재전송
                  </button>
                  {step === 2 && error && <p className="form-message is-error">{error}</p>}
                  <button type="button" className="btn btn-primary" onClick={handleVerifyAndSignup} disabled={submitting}>
                    {submitting ? '처리 중...' : '인증 후 가입 완료'}
                  </button>
                </>
              )}
              {step === 2 && !codeSent && error && <p className="form-message is-error">{error}</p>}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
