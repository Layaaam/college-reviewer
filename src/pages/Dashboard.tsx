import { ArrowRight, CheckCircle2, Clock3, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge, Button, Card, ProgressBar } from '@/components/ui'
import { DataState } from '@/components/DataState'
import { PageHeader } from '@/components/PageHeader'
import { useAuth } from '@/lib/auth'
import { getRecentAttempts, getStudentProgress, getSubjects } from '@/lib/api'
import { useAsyncData } from '@/hooks/useAsyncData'

export function Dashboard() {
  const { profile } = useAuth()
  const { data, loading, error } = useAsyncData(async () => {
    const [subjects, progress, attempts] = await Promise.all([getSubjects(), getStudentProgress(), getRecentAttempts()])
    return { subjects, progress, attempts }
  }, [profile?.id])
  const firstName = (profile?.full_name || profile?.email || 'Student').split(/[\s@]/)[0]
  const answered = data?.progress.reduce((sum, item) => sum + item.questions_answered, 0) ?? 0
  const correct = data?.progress.reduce((sum, item) => sum + item.correct_answers, 0) ?? 0
  const accuracy = answered ? Math.round(correct / answered * 100) : 0
  const next = data?.subjects.find((subject) => !data.progress.some((item) => item.subject_id === subject.id)) ?? data?.subjects[0]

  return <>
    <PageHeader eyebrow={`Welcome, ${firstName}`} title="Keep your momentum going." description="A little focused practice today will take you one step closer to your goal." />
    <DataState loading={loading} error={error}>{data && <>
      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <Card className="overflow-hidden bg-[#146C4B] p-6 text-white md:p-8"><div className="flex h-full flex-col justify-between gap-8"><div><Badge tone="green">Continue reviewing</Badge><h2 className="mt-4 max-w-md text-2xl font-bold">{next?.name ?? 'Choose a subject'}</h2><p className="mt-2 max-w-md text-sm text-white/75">Open a short lesson and sharpen the basics.</p></div><Link to={next ? `/review/${next.slug}` : '/review'}><Button className="bg-white text-[#146C4B] hover:bg-[#E8F3ED]">Open review <ArrowRight size={16} className="ml-2 inline" /></Button></Link></div></Card>
        <Card className="p-6"><div className="flex items-center justify-between"><div><Badge>Quick practice</Badge><h2 className="mt-4 text-xl font-bold">Test your knowledge</h2><p className="mt-2 text-sm text-[#737A76]">10 questions · about 10 minutes</p></div><div className="grid h-12 w-12 place-items-center rounded-xl bg-[#E8F3ED] text-[#146C4B]"><Target size={24} /></div></div><Link to="/practice"><Button variant="outline" className="mt-8 w-full">Choose a subject</Button></Link></Card>
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2"><Stat icon={<Target size={19} />} label="Overall accuracy" value={`${accuracy}%`} note="Across completed quizzes" /><Stat icon={<CheckCircle2 size={19} />} label="Questions answered" value={String(answered)} note="Keep building your base" /></div>
      <section className="mt-10"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">Your subjects</h2><Link to="/review" className="text-sm font-semibold text-[#146C4B]">View all</Link></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{data.subjects.map((subject) => { const item = data.progress.find((row) => row.subject_id === subject.id); return <Card key={subject.id} className="p-5"><div className="flex items-start justify-between"><div className="grid h-10 w-10 place-items-center rounded-xl text-lg" style={{ background: subject.color }}>{subject.icon}</div><Badge tone={item ? 'green' : 'gray'}>{item ? `${item.accuracy}%` : 'Not started'}</Badge></div><h3 className="mt-5 font-bold">{subject.name}</h3><p className="mt-1 text-sm text-[#737A76]">{subject.description}</p><div className="mt-5"><div className="mb-2 flex justify-between text-xs text-[#737A76]"><span>{item?.questions_answered ?? 0} questions</span><span>{item?.accuracy ?? 0}%</span></div><ProgressBar value={item?.accuracy ?? 0} /></div></Card> })}</div></section>
      <section className="mt-10"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">Recent results</h2><Link to="/progress" className="text-sm font-semibold text-[#146C4B]">See progress</Link></div><Card className="divide-y divide-[#E2E7E4]">{data.attempts.length ? data.attempts.slice(0, 3).map((attempt) => <Link to={`/results/${attempt.id}`} key={attempt.id} className="flex items-center justify-between p-5"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-[#E8F3ED] text-[#146C4B]"><CheckCircle2 size={18} /></div><div><div className="font-semibold">{data.subjects.find((subject) => subject.id === attempt.subject_id)?.name ?? 'Subject'} quiz</div><div className="mt-1 flex items-center gap-2 text-xs text-[#737A76]"><Clock3 size={13} />{new Date(attempt.completed_at ?? attempt.started_at).toLocaleDateString()}</div></div></div><span className="font-bold text-[#146C4B]">{attempt.score}%</span></Link>) : <p className="p-5 text-sm text-[#737A76]">No completed quizzes yet. Your results will appear here.</p>}</Card></section>
    </>}</DataState>
  </>
}

function Stat({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: string; note: string }) {
  return <Card className="p-5"><div className="flex items-center gap-2 text-[#146C4B]">{icon}<span className="text-sm font-semibold text-[#737A76]">{label}</span></div><div className="mt-3 text-2xl font-bold">{value}</div><div className="mt-1 text-xs text-[#737A76]">{note}</div></Card>
}
