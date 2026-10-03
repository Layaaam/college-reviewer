import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, LockKeyhole, XCircle } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge, Button, Card, ProgressBar } from '@/components/ui'
import { DataState } from '@/components/DataState'
import { getQuizSession, saveQuizDraft, submitQuizSession } from '@/lib/api'
import { useAsyncData } from '@/hooks/useAsyncData'
import { validateUnanswered } from '@/lib/scoring'
import { formatQuizTime, remainingQuizSeconds } from '@/lib/quizTimer'
import type { PracticeFeedback } from '@/types'

const modeLabels = { topic_practice: 'Topic Practice', subject_quiz: 'Subject Quiz', subject_exam: 'Subject Exam', general_exam: 'General Exam' }

export function Quiz() {
  const { sessionId = '' } = useParams()
  const navigate = useNavigate()
  const { data, loading, error } = useAsyncData(() => getQuizSession(sessionId), [sessionId])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [feedback, setFeedback] = useState<Record<string, PracticeFeedback>>({})
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null)
  const submitLock = useRef(false)
  const submitRef = useRef<(automatic?: boolean) => void>(() => {})

  useEffect(() => {
    if (!data) return
    setSelected(Object.fromEntries(data.questions.filter((question) => question.selected_choice_id).map((question) => [question.id, question.selected_choice_id!])))
  }, [data])

  useEffect(() => {
    if (!data?.deadline || data.status !== 'active') { setRemainingSeconds(null); return }
    const deadline = new Date(data.deadline).getTime()
    const update = () => { const next = remainingQuizSeconds(deadline, Date.now()); setRemainingSeconds(next); if (next === 0) submitRef.current(true) }
    update()
    const interval = window.setInterval(update, 1000)
    return () => window.clearInterval(interval)
  }, [data?.deadline, data?.status])

  async function choose(questionId: string, choiceId: string) {
    if (!data || feedback[questionId]) return
    setSelected((current) => ({ ...current, [questionId]: choiceId }))
    if (data.mode === 'topic_practice') return
    setSaving(true); setSubmitError('')
    try { await saveQuizDraft(data.id, questionId, choiceId) }
    catch (cause) { setSubmitError(cause instanceof Error ? cause.message : 'The answer could not be saved. Try again before submitting.') }
    finally { setSaving(false) }
  }

  async function lockAnswer() {
    if (!data) return
    const question = data.questions[index]; const choiceId = selected[question.id]
    if (!choiceId || feedback[question.id]) return
    setSaving(true); setSubmitError('')
    try { const result = await saveQuizDraft(data.id, question.id, choiceId, true); if ('is_correct' in result) setFeedback((current) => ({ ...current, [question.id]: result })) }
    catch (cause) { setSubmitError(cause instanceof Error ? cause.message : 'The answer could not be locked.') }
    finally { setSaving(false) }
  }

  async function submit(automatic = false) {
    if (!data || submitLock.current) return
    const unanswered = validateUnanswered(data.questions.map((question) => selected[question.id]))
    if (!automatic && unanswered && !window.confirm(`${unanswered} question${unanswered === 1 ? ' is' : 's are'} unanswered. Submit anyway?`)) return
    submitLock.current = true; setSubmitting(true); setSubmitError('')
    try { navigate(`/results/${await submitQuizSession(data.id)}`, { replace: true }) }
    catch (cause) { setSubmitError(cause instanceof Error ? cause.message : 'Submission failed. Your server-saved answers are safe.'); submitLock.current = false; if (automatic) window.setTimeout(() => submitRef.current(true), 5000) }
    finally { setSubmitting(false) }
  }
  submitRef.current = submit

  const question = data?.questions[index]
  const unanswered = data ? validateUnanswered(data.questions.map((item) => selected[item.id])) : 0
  const currentFeedback = question ? feedback[question.id] : undefined
  return <DataState loading={loading} error={error}>
    {data && <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between gap-3"><Link to="/practice" className="flex items-center gap-2 text-sm font-semibold text-[#737A76]"><ArrowLeft size={16} />Exit</Link><div className="flex items-center gap-2"><Badge>{modeLabels[data.mode]}</Badge>{remainingSeconds !== null && <span role="timer" aria-label={`Time left ${formatQuizTime(remainingSeconds)}`} className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold tabular-nums ${remainingSeconds <= 60 ? 'bg-[#FFF5D6] text-[#8A5A00]' : 'bg-[#E8F3ED] text-[#146C4B]'}`}><Clock3 size={15} />{formatQuizTime(remainingSeconds)}</span>}</div></div>
      {question ? <><div className="mb-3 flex items-center justify-between text-sm text-[#737A76]"><span>Question {index + 1} of {data.questions.length}</span><span>{Math.round((index + 1) / data.questions.length * 100)}%</span></div><ProgressBar value={(index + 1) / data.questions.length * 100} />
        <Card className="mt-6 p-6 md:p-10"><div className="flex items-center gap-2 text-sm font-semibold capitalize text-[#146C4B]"><CheckCircle2 size={17} />{question.difficulty}</div>{question.passage && <div className="mt-6 rounded-xl bg-[#F0F4F1] p-5 text-sm leading-7 text-[#39423E]">{question.passage}</div>}<h1 className="mt-6 text-2xl font-bold leading-snug md:text-3xl">{question.question_text}</h1>
          <div className="mt-8 space-y-3">{question.choices.map((choice, choiceIndex) => { const picked = selected[question.id] === choice.id; const correct = currentFeedback?.correct_choice_id === choice.id; const wrongPicked = currentFeedback && picked && !currentFeedback.is_correct; return <button key={choice.id} disabled={Boolean(currentFeedback)} onClick={() => void choose(question.id, choice.id)} className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors ${correct ? 'border-[#2E8B57] bg-[#E8F3ED]' : wrongPicked ? 'border-[#C94B4B] bg-[#FCEAEA]' : picked ? 'border-[#146C4B] bg-[#E8F3ED]' : 'border-[#E2E7E4] hover:border-[#9DBDAA]'}`}><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-current text-sm font-bold text-[#737A76]">{String.fromCharCode(65 + choiceIndex)}</span><span className="font-medium">{choice.choice_text}</span></button> })}</div>
          {data.mode === 'topic_practice' && !currentFeedback && <Button className="mt-5" onClick={() => void lockAnswer()} disabled={!selected[question.id] || saving}><LockKeyhole size={15} className="mr-2 inline" />{saving ? 'Locking…' : 'Lock answer'}</Button>}
          {currentFeedback && <div role="status" className={`mt-5 rounded-xl p-4 text-sm leading-6 ${currentFeedback.is_correct ? 'bg-[#E8F3ED]' : 'bg-[#FCEAEA]'}`}><div className="flex items-center gap-2 font-bold">{currentFeedback.is_correct ? <CheckCircle2 size={18} className="text-[#2E8B57]" /> : <XCircle size={18} className="text-[#C94B4B]" />}{currentFeedback.is_correct ? 'Correct' : 'Review this one'}</div><p className="mt-2">{currentFeedback.explanation}</p></div>}
          <div className="mt-10 flex justify-between gap-3"><Button variant="outline" onClick={() => setIndex(Math.max(0, index - 1))} disabled={index === 0}>Back</Button>{index === data.questions.length - 1 ? <Button onClick={() => void submit()} disabled={submitting || saving}>{submitting ? 'Submitting…' : 'Submit'}</Button> : <Button onClick={() => setIndex(index + 1)} disabled={data.mode === 'topic_practice' && !currentFeedback}>Next <ArrowRight size={16} className="ml-2 inline" /></Button>}</div>
          {index === data.questions.length - 1 && unanswered > 0 && <p className="mt-4 text-center text-sm text-[#8A5A00]">{unanswered} unanswered question{unanswered > 1 ? 's' : ''} will be marked incorrect.</p>}{saving && data.mode !== 'topic_practice' && <p className="mt-3 text-center text-xs text-[#737A76]">Saving answer…</p>}{submitError && <p role="alert" className="mt-4 text-sm text-[#C94B4B]">{submitError}</p>}
        </Card></> : <Card className="p-6">No questions were issued for this session.</Card>}
    </div>}
  </DataState>
}
