import { ArrowRight, Clock3 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Badge, Button, Card } from '@/components/ui'
import { DataState } from '@/components/DataState'
import { PageHeader } from '@/components/PageHeader'
import { useAsyncData } from '@/hooks/useAsyncData'
import { getSubjectBySlug, getSubjects } from '@/lib/api'

export function Practice() {
  const { data: subjects, loading, error } = useAsyncData(getSubjects, [])
  return <><PageHeader eyebrow="Practice" title="Choose your challenge" description="Practice is a safe place to make mistakes and learn from them." />
    <DataState loading={loading} error={error}>
      {!subjects?.length ? <Card className="p-6">No subjects are available yet.</Card> :
        <div className="grid gap-5 md:grid-cols-2">{subjects.map((subject) => <Card key={subject.id} className="flex items-center gap-5 p-5">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-xl" style={{ background: subject.color }}>{subject.icon}</div>
          <div className="min-w-0 flex-1"><h2 className="font-bold">{subject.name}</h2><div className="mt-2 flex items-center gap-3 text-xs text-[#737A76]"><span className="flex items-center gap-1"><Clock3 size={13} />10 questions</span><Badge tone="gray">Mixed difficulty</Badge></div></div>
          <Link to={`/practice/${subject.slug}`}><Button variant="outline" aria-label={`Practice ${subject.name}`}><ArrowRight size={17} /></Button></Link>
        </Card>)}</div>}
    </DataState>
  </>
}

export function PracticeSubject() {
  const { subject: slug = '' } = useParams()
  const { data: subject, loading, error } = useAsyncData(() => getSubjectBySlug(slug), [slug])
  return <DataState loading={loading} error={error}>{subject && <div className="mx-auto max-w-2xl">
    <PageHeader eyebrow="Practice quiz" title={`${subject.name} quiz`} description="You will see 10 questions, one at a time. You can move back and change an answer before submitting." />
    <Card className="p-8 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#E8F3ED] text-2xl" style={{ color: '#146C4B' }}>{subject.icon}</div><h2 className="mt-6 text-2xl font-bold">Ready when you are</h2><p className="mx-auto mt-3 max-w-md leading-6 text-[#737A76]">A 10-minute timer starts when the quiz loads. It will not submit for you when time runs out. No negative scoring, and you’ll see an explanation after the quiz.</p><Link to={`/quiz/${subject.slug}`}><Button className="mt-8">Begin quiz <ArrowRight size={16} className="ml-2 inline" /></Button></Link></Card>
  </div>}</DataState>
}
