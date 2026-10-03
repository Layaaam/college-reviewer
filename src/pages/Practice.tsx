import { useState } from 'react'
import { ArrowRight, BookOpenCheck, Clock3, Layers3 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge, Button, Card } from '@/components/ui'
import { DataState } from '@/components/DataState'
import { PageHeader } from '@/components/PageHeader'
import { useAsyncData } from '@/hooks/useAsyncData'
import { getSubjectBySlug, getSubjects, getTopicsBySubject, startQuizSession } from '@/lib/api'
import type { QuizMode } from '@/types'

function StartButton({ mode, subjectId, topicId, children, className = '' }: { mode: QuizMode; subjectId?: string; topicId?: string; children: React.ReactNode; className?: string }) {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function start() {
    if (busy) return
    setBusy(true); setError('')
    try { navigate(`/quiz/session/${await startQuizSession(mode, subjectId, topicId)}`) }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'The quiz could not be started.'); setBusy(false) }
  }
  return <div><Button className={className} onClick={start} disabled={busy}>{busy ? 'Preparing…' : children}</Button>{error && <p role="alert" className="mt-2 text-xs text-[#C94B4B]">{error}</p>}</div>
}

export function Practice() {
  const { data: subjects, loading, error } = useAsyncData(getSubjects, [])
  return <><PageHeader eyebrow="Practice" title="Choose your challenge" description="Use focused practice, subject assessments, or a balanced 100-question general exam." />
    <DataState loading={loading} error={error}>
      <Card className="mb-6 border-[#B8D8C5] bg-[#E8F3ED] p-6 md:flex md:items-center md:justify-between"><div><Badge>All six domains</Badge><h2 className="mt-3 text-xl font-bold">General Exam</h2><p className="mt-2 text-sm text-[#52605A]">100 questions · 120 minutes · 20 Math, 20 Science, and 15 from each language, reading, and reasoning domain.</p></div><StartButton mode="general_exam" className="mt-5 md:mt-0">Start general exam <ArrowRight size={16} className="ml-2 inline" /></StartButton></Card>
      {!subjects?.length ? <Card className="p-6">No subjects are available yet.</Card> :
        <div className="grid gap-5 md:grid-cols-2">{subjects.map((subject) => <Card key={subject.id} className="flex items-center gap-5 p-5">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-xl" style={{ background: subject.color }}>{subject.icon}</div>
          <div className="min-w-0 flex-1"><h2 className="font-bold">{subject.name}</h2><div className="mt-2 flex items-center gap-3 text-xs text-[#737A76]"><span className="flex items-center gap-1"><Clock3 size={13} />4 modes</span><Badge tone="gray">Balanced difficulty</Badge></div></div>
          <Link to={`/practice/${subject.slug}`}><Button variant="outline" aria-label={`Practice ${subject.name}`}><ArrowRight size={17} /></Button></Link>
        </Card>)}</div>}
    </DataState>
  </>
}

export function PracticeSubject() {
  const { subject: slug = '' } = useParams()
  const { data, loading, error } = useAsyncData(async () => {
    const subject = await getSubjectBySlug(slug)
    return { subject, topics: await getTopicsBySubject(subject.id) }
  }, [slug])
  return <DataState loading={loading} error={error}>{data && <div>
    <PageHeader eyebrow={`${data.subject.name} · Practice`} title="Choose an assessment mode" description="Every session is issued by the server, favors unseen questions, and balances difficulty where the pool allows." />
    <div className="grid gap-5 md:grid-cols-2">
      <Card className="p-6"><BookOpenCheck className="text-[#146C4B]" /><h2 className="mt-4 text-xl font-bold">Subject Quiz</h2><p className="mt-2 text-sm text-[#737A76]">20 questions · untimed · feedback after submission.</p><StartButton mode="subject_quiz" subjectId={data.subject.id} className="mt-6">Start subject quiz</StartButton></Card>
      <Card className="p-6"><Clock3 className="text-[#146C4B]" /><h2 className="mt-4 text-xl font-bold">Subject Exam</h2><p className="mt-2 text-sm text-[#737A76]">50 questions · 60 minutes · auto-submits at the deadline.</p><StartButton mode="subject_exam" subjectId={data.subject.id} className="mt-6">Start subject exam</StartButton></Card>
    </div>
    <h2 className="mt-10 text-xl font-bold">Topic practice</h2><p className="mt-2 text-sm text-[#737A76]">10 untimed questions with feedback immediately after each answer is locked.</p>
    <div className="mt-5 grid gap-4 md:grid-cols-2">{data.topics.map((topic, index) => <Card key={topic.id} className="p-5"><div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F0F4F1] text-[#146C4B]"><Layers3 size={18} /></div><div><Badge tone="gray">Topic {index + 1}</Badge><h3 className="mt-2 font-bold">{topic.title}</h3><p className="mt-2 text-sm leading-6 text-[#737A76]">{topic.description}</p><StartButton mode="topic_practice" subjectId={data.subject.id} topicId={topic.id} className="mt-4">Practice 10</StartButton></div></div></Card>)}</div>
  </div>}</DataState>
}
