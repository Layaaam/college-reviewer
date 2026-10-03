import { ArrowUpRight, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge, Card, ProgressBar } from '@/components/ui'
import { DataState } from '@/components/DataState'
import { PageHeader } from '@/components/PageHeader'
import { useAsyncData } from '@/hooks/useAsyncData'
import { getRecentAttempts, getStudentProgress, getStudentTopicProgress, getSubjects, getTopics } from '@/lib/api'

export function Progress() {
  const { data, loading, error } = useAsyncData(async () => {
    const [subjects, progress, attempts, topics, topicProgress] = await Promise.all([getSubjects(), getStudentProgress(), getRecentAttempts(), getTopics(), getStudentTopicProgress()])
    return { subjects, progress, attempts, topics, topicProgress }
  }, [])
  const answered = data?.progress.reduce((sum, item) => sum + item.questions_answered, 0) ?? 0
  const correct = data?.progress.reduce((sum, item) => sum + item.correct_answers, 0) ?? 0
  const accuracy = answered ? Math.round(correct / answered * 100) : 0
  const studied = data?.progress.filter((item) => item.questions_answered > 0) ?? []
  const strongest = [...studied].sort((a, b) => b.accuracy - a.accuracy)[0]
  const nextFocus = data?.subjects.find((subject) => !studied.some((item) => item.subject_id === subject.id)) ??
    [...studied].sort((a, b) => a.accuracy - b.accuracy).map((item) => data?.subjects.find((subject) => subject.id === item.subject_id))[0]
  const weakTopics = data ? [...data.topicProgress].filter((item) => item.questions_answered > 0).sort((a, b) => a.accuracy - b.accuracy || b.exposure_count - a.exposure_count).slice(0, 6) : []

  return <><PageHeader eyebrow="Progress" title="See your growth over time" description="Simple signals to help you decide what to practice next." />
    <DataState loading={loading} error={error}>{data && <>
      <div className="grid gap-5 sm:grid-cols-3"><Card className="p-5"><div className="text-sm text-[#737A76]">Overall accuracy</div><div className="mt-2 text-3xl font-bold text-[#146C4B]">{accuracy}%</div><div className="mt-2 text-xs text-[#737A76]">Across {answered} questions</div></Card><Card className="p-5"><div className="text-sm text-[#737A76]">Strongest subject</div><div className="mt-2 text-xl font-bold">{data.subjects.find((subject) => subject.id === strongest?.subject_id)?.name ?? 'Not yet'}</div><div className="mt-2 text-xs text-[#737A76]">{strongest ? `${strongest.accuracy}% accuracy` : 'Complete a quiz to see this'}</div></Card><Card className="p-5"><div className="text-sm text-[#737A76]">Next focus</div><div className="mt-2 text-xl font-bold">{nextFocus?.name ?? 'Choose a subject'}</div><div className="mt-2 text-xs text-[#737A76]">Start with a lesson</div></Card></div>
      <section className="mt-10"><h2 className="mb-4 text-xl font-bold">Progress by subject</h2><div className="grid gap-4 md:grid-cols-2">{data.subjects.map((subject) => { const item = data.progress.find((row) => row.subject_id === subject.id); return <Card key={subject.id} className="p-5"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl text-lg" style={{ background: subject.color }}>{subject.icon}</div><div><div className="font-semibold">{subject.name}</div><div className="text-xs text-[#737A76]">{item?.questions_answered ?? 0} questions answered</div></div></div><Badge tone={item ? 'green' : 'gray'}>{item ? `${item.accuracy}%` : 'Not started'}</Badge></div><div className="mt-5"><ProgressBar value={item?.accuracy ?? 0} /></div></Card> })}</div></section>
      <section className="mt-10"><div className="mb-4"><h2 className="text-xl font-bold">Weak areas by topic</h2><p className="mt-1 text-sm text-[#737A76]">Based on accuracy and exposure across completed sessions.</p></div>{weakTopics.length ? <div className="grid gap-4 md:grid-cols-2">{weakTopics.map((item) => { const topic = data.topics.find((entry) => entry.id === item.topic_id); const subject = data.subjects.find((entry) => entry.id === topic?.subject_id); return <Card key={item.topic_id} className="p-5"><div className="flex items-start justify-between gap-3"><div><Badge tone="gray">{subject?.name ?? 'Subject'}</Badge><h3 className="mt-3 font-bold">{topic?.title ?? 'Topic'}</h3><p className="mt-1 text-xs text-[#737A76]">{item.questions_answered} answered · {item.exposure_count} exposures</p></div><span className="font-bold text-[#146C4B]">{item.accuracy}%</span></div><div className="mt-4"><ProgressBar value={item.accuracy} /></div>{subject && <Link className="mt-4 inline-flex text-sm font-semibold text-[#146C4B]" to={`/practice/${subject.slug}`}>Practice this subject</Link>}</Card> })}</div> : <Card className="p-5 text-sm text-[#737A76]">Complete a topic practice or exam to identify weak areas.</Card>}</section>
      <section className="mt-10"><h2 className="mb-4 text-xl font-bold">Recent attempts</h2><Card className="divide-y divide-[#E2E7E4]">{data.attempts.length ? data.attempts.map((attempt) => <Link to={`/results/${attempt.id}`} key={attempt.id} className="flex items-center justify-between p-5 hover:bg-[#F8FAF8]"><div className="flex items-center gap-3"><CheckCircle2 className="text-[#2E8B57]" size={19} /><div><div className="font-semibold">{data.subjects.find((subject) => subject.id === attempt.subject_id)?.name ?? 'Subject'} quiz</div><div className="text-xs text-[#737A76]">{attempt.total_questions} questions · {new Date(attempt.completed_at ?? attempt.started_at).toLocaleDateString()}</div></div></div><div className="flex items-center gap-2 font-bold text-[#146C4B]">{attempt.score}% <ArrowUpRight size={16} /></div></Link>) : <p className="p-5 text-sm text-[#737A76]">No completed quizzes yet.</p>}</Card></section>
    </>}</DataState>
  </>
}
