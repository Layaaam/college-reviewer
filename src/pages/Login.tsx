import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, BookOpen, LockKeyhole, Mail } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { useAuth } from '@/lib/auth'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { signIn, error: authError } = useAuth()

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const profile = await signIn(email, password)
      navigate(profile.role === 'admin' ? '/admin' : '/dashboard', { replace: true })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'We could not sign you in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[#F6F7F6] p-5">
      <Card className="w-full max-w-md p-8 md:p-10">
        <div className="mb-8 flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#146C4B] font-bold text-white">CR</div>
          <span className="font-bold">College Reviewer</span>
        </div>
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="mt-2 text-[#737A76]">Sign in to continue your review journey.</p>
        <form className="mt-8 space-y-5" onSubmit={submit}>
          <label className="block text-sm font-semibold">
            Email
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-[#E2E7E4] bg-white px-3">
              <Mail size={18} className="text-[#737A76]" />
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full py-3 outline-none" placeholder="you@example.com" />
            </div>
          </label>
          <label className="block text-sm font-semibold">
            Password
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-[#E2E7E4] bg-white px-3">
              <LockKeyhole size={18} className="text-[#737A76]" />
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full py-3 outline-none" placeholder="Your password" />
            </div>
          </label>
          {(error || authError) && <p role="alert" className="text-sm text-[#C94B4B]">{error || authError}</p>}
          <Button className="flex w-full items-center justify-center gap-2" type="submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'} <ArrowRight size={17} />
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-[#737A76]">Need help accessing your account? Contact your administrator.</p>
      </Card>
      <div className="fixed bottom-5 flex items-center gap-2 text-sm text-[#737A76]"><BookOpen size={16} />Focused practice for college readiness</div>
    </div>
  )
}
