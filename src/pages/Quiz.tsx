import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge, Button, Card, ProgressBar } from '@/components/ui'
import { DataState } from '@/components/DataState'
import { getQuestionsForQuiz, getSubjectBySlug, submitQuiz } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { useAsyncData } from '@/hooks/useAsyncData'
import { validateUnanswered } from '@/lib/scoring'
import { formatQuizTime, QUIZ_DURATION_SECONDS, remainingQuizSeconds } from '@/lib/quizTimer'

export function Quiz() {
  const { quizId: slug = '' } = useParams()
  const { profile } = useAuth()
  const navigate = useNavigate()
  const draftKey = `quiz-draft:${profile?.id ?? 'unknown'}:${slug}`
  const timerKey = `quiz-started:${profile?.id ?? 'unknown'}:${slug}`
  const { data, loading, error } = useAsyncData(async () => {
    const subject = await getSubjectBySlug(slug)
    const questions = await getQuestionsForQuiz(subject.id)
    return { subject, questions }
  }, [slug])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [remainingSeconds, setRemainingSeconds] = useState(QUIZ_DURATION_SECONDS)
  const submitLock = useRef(false)

  useEffect(() => {
    const saved = localStorage.getItem(draftKey)
    if (saved) {
      try { setSelected(JSON.parse(saved) as Record<string, string>) } catch { localStorage.removeItem(draftKey) }
    }
  }, [draftKey])

  useEffect(() => {
    if (!data?.questions.length) return
    const saved = Number(localStorage.getItem(timerKey))
    const valid = Number.isFinite(saved) && saved > 0 && saved <= Date.now()
    const startedAt = valid ? saved : Date.now()
    if (!valid) localStorage.setItem(timerKey, String(startedAt))
    const update = () => setRemainingSeconds(remainingQuizSeconds(startedAt, Date.now()))
    update()
    const interval = window.setInterval(update, 1000)
    return () => window.clearInterval(interval)
  }, [data?.questions.length, timerKey])

  function choose(questionId: string, choiceId: string) {
    const next = { ...selected, [questionId]: choiceId }
    setSelected(next)
    localStorage.setItem(draftKey, JSON.stringify(next))
  }

  async function submit() {
    if (!data || submitLock.current) return
    const { questions, subject } = data
    if (questions.length !== 10) { setSubmitError('This subject needs 10 questions before a quiz can be submitted.'); return }
    const unanswered = validateUnanswered(questions.map((question) => selected[question.id]))
    if (unanswered && !window.confirm(`${unanswered} question${unanswered === 1 ? ' is' : 's are'} unanswered. Submit anyway?`)) return
    submitLock.current = true
    setSubmitting(true)
    setSubmitError('')
    try {
      const attemptId = await submitQuiz(subject.id, questions.map((question) => ({
        question_id: question.id,
        selected_choice_id: selected[question.id] ?? null,
      })))
      localStorage.removeItem(draftKey)
      localStorage.removeItem(timerKey)
      navigate(`/results/${attemptId}`, { replace: true })
    } catch (cause) {
      setSubmitError(cause instanceof Error ? cause.message : 'The quiz could not be saved. Your answers are still here.')
    } finally {
      submitLock.current = false
      setSubmitting(false)
    }
  }

  const question = data?.questions[index]
  const unanswered = data ? validateUnanswered(data.questions.map((item) => selected[item.id])) : 0
  return <DataState loading={loading} error={error}>
    {data && <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between gap-3"><Link to={`/practice/${data.subject.slug}`} className="flex items-center gap-2 text-sm font-semibold text-[#737A76]"><ArrowLeft size={16} />Exit quiz</Link><div className="flex items-center gap-2"><Badge>{data.subject.name}</Badge><span role="timer" aria-label={`Time left ${formatQuizTime(remainingSeconds)}`} aria-live="off" className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold tabular-nums ${remainingSeconds === 0 ? 'bg-[#FCEAEA] text-[#A53636]' : remainingSeconds <= 60 ? 'bg-[#FFF5D6] text-[#8A5A00]' : 'bg-[#E8F3ED] text-[#146C4B]'}`}><Clock3 size={15} />{formatQuizTime(remainingSeconds)}</span></div></div>
      {question ? <>
        <div className="mb-3 flex items-center justify-between text-sm text-[#737A76]"><span>Question {index + 1} of {data.questions.length}</span><span>{Math.round((index + 1) / data.questions.length * 100)}%</span></div>
        <ProgressBar value={(index + 1) / data.questions.length * 100} />
        <Card className="mt-6 p-6 md:p-10"><div className="flex items-center gap-2 text-sm font-semibold text-[#146C4B]"><CheckCircle2 size={17} />{question.difficulty} question</div><h1 className="mt-6 text-2xl font-bold leading-snug md:text-3xl">{question.question_text}</h1>
          <div className="mt-8 space-y-3">{question.choices.map((choice, choiceIndex) => <button key={choice.id} onClick={() => choose(question.id, choice.id)} className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors ${selected[question.id] === choice.id ? 'border-[#146C4B] bg-[#E8F3ED]' : 'border-[#E2E7E4] hover:border-[#9DBDAA]'}`}><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-current text-sm font-bold text-[#737A76]">{String.fromCharCode(65 + choiceIndex)}</span><span className="font-medium">{choice.choice_text}</span></button>)}</div>
          <div className="mt-10 flex justify-between gap-3"><Button variant="outline" onClick={() => setIndex(Math.max(0, index - 1))} disabled={index === 0}>Back</Button>{index === data.questions.length - 1 ? <Button onClick={submit} disabled={submitting}>{submitting ? 'Saving…' : 'Submit quiz'}</Button> : <Button onClick={() => setIndex(index + 1)}>Next <ArrowRight size={16} className="ml-2 inline" /></Button>}</div>
          {index === data.questions.length - 1 && unanswered > 0 && <p className="mt-4 text-center text-sm text-[#8A5A00]">{unanswered} unanswered question{unanswered > 1 ? 's' : ''} will be marked incorrect.</p>}
          {remainingSeconds === 0 && <p role="status" className="mt-4 text-center text-sm text-[#A53636]">Time is up. Your answers are saved here; submit when you are ready.</p>}
          {submitError && <p role="alert" className="mt-4 text-sm text-[#C94B4B]">{submitError}</p>}
        </Card>
      </> : <Card className="p-6">No questions are available for this subject yet.</Card>}
    </div>}
  </DataState>
}
