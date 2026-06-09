import { useCallback, useEffect, useState } from 'react'
import ManageList from '../components/ManageList.jsx'
import NameFormModal from '../components/NameFormModal.jsx'
import CategoryFormModal from '../components/CategoryFormModal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import * as mgmt from '../api/management.js'
import './ManagementPage.css'

const CATEGORY_TABS = [
  { key: 'EXPENSE', label: '지출' },
  { key: 'INCOME', label: '수입' },
]

export default function ManagementPage() {
  const [categories, setCategories] = useState([])
  const [methods, setMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [categoryType, setCategoryType] = useState('EXPENSE')
  const [form, setForm] = useState(null) // { kind, mode, item? }
  const [confirm, setConfirm] = useState(null) // { kind, item }

  const load = useCallback(async () => {
    setError('')
    try {
      const [c, m] = await Promise.all([mgmt.getCategories(), mgmt.getMethods()])
      setCategories(c || [])
      setMethods(m || [])
    } catch (err) {
      setError(err.message || '불러오지 못했어요.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const submitForm = async (name, savings) => {
    const { kind, mode, item } = form
    if (kind === 'category') {
      if (mode === 'create') await mgmt.createCategory(categoryType, name, savings)
      else await mgmt.updateCategory(item.id, name, savings)
    } else {
      if (mode === 'create') await mgmt.createMethod(name)
      else await mgmt.updateMethod(item.id, name)
    }
    await load()
  }

  const doDelete = async () => {
    const { kind, item } = confirm
    if (kind === 'category') await mgmt.deleteCategory(item.id)
    else await mgmt.deleteMethod(item.id)
    await load()
  }

  if (loading) return <div className="manage-state">불러오는 중...</div>
  if (error) return <div className="manage-state is-error">{error}</div>

  const shownCategories = categories.filter((c) => c.type === categoryType)
  const typeLabel = categoryType === 'EXPENSE' ? '지출' : '수입'

  const formTitle = () => {
    if (form.kind === 'method') return `지출방법 ${form.mode === 'create' ? '등록' : '수정'}`
    if (form.mode === 'create') return `${typeLabel} 카테고리 등록`
    return '카테고리 수정'
  }

  return (
    <div className="management">
      <h1 className="manage-page-title">카테고리/지출방법 관리</h1>

      <div className="manage-grid">
        <ManageList
          title="카테고리"
          addLabel={`${typeLabel} 카테고리 등록`}
          items={shownCategories}
          emptyText={`등록된 ${typeLabel} 카테고리가 없어요.`}
          tabs={CATEGORY_TABS}
          activeTab={categoryType}
          onTabChange={setCategoryType}
          onAdd={() => setForm({ kind: 'category', mode: 'create' })}
          onEdit={(item) => setForm({ kind: 'category', mode: 'edit', item })}
          onDelete={(item) => setConfirm({ kind: 'category', item })}
        />
        <ManageList
          title="지출방법"
          addLabel="지출방법 등록"
          items={methods}
          emptyText="등록된 지출방법이 없어요."
          onAdd={() => setForm({ kind: 'method', mode: 'create' })}
          onEdit={(item) => setForm({ kind: 'method', mode: 'edit', item })}
          onDelete={(item) => setConfirm({ kind: 'method', item })}
        />
      </div>

      {form && form.kind === 'category' && (
        <CategoryFormModal
          title={formTitle()}
          initialName={form.item?.name ?? ''}
          initialSavings={form.item?.savings ?? false}
          submitLabel={form.mode === 'create' ? '등록' : '수정'}
          onSubmit={submitForm}
          onClose={() => setForm(null)}
        />
      )}
      {form && form.kind === 'method' && (
        <NameFormModal
          title={formTitle()}
          label="지출방법 이름"
          initialValue={form.item?.name ?? ''}
          submitLabel={form.mode === 'create' ? '등록' : '수정'}
          onSubmit={submitForm}
          onClose={() => setForm(null)}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title={`${confirm.kind === 'category' ? '카테고리' : '지출방법'} 삭제`}
          message={`'${confirm.item.name}'을(를) 삭제하시겠습니까?`}
          onConfirm={doDelete}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
