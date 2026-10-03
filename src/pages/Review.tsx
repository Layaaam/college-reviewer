import { ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Badge, Button, Card } from '@/components/ui'
import { DataState } from '@/components/DataState'
import { PageHeader } from '@/components/PageHeader'
import { getLessonsBySubject, getSubjectBySlug, getSubjects } from '@/lib/api'
import { useAsyncData } from '@/hooks/useAsyncData'

export function Review() {
  const { data: subjects, loading, error } = useAsyncData(getSubjects, [])
  return <>
    <PageHeader eyebrow="Review" title="Choose a subject" description="Short lessons help you learn the idea before you practice it." />
    <DataState loading={loading} error={error}>
      {!subjects?.length ? <Card className="p-6">No subjects are available yet.</Card> :
        <div className="grid gap-5 md:grid-cols-2">{subjects.map((subject) => <Card key={subject.id} className="p-6">
          <div className="flex items-start justify-between"><div className="grid h-12 w-12 place-items-center rounded-2xl text-xl" style={{ background: subject.color }}>{subject.icon}</div><Badge tone="gray">Review</Badge></div>
          <h2 className="mt-6 text-xl font-bold">{subject.name}</h2>
          <p className="mt-2 text-sm leading-6 text-[#737A76]">{subject.description}</p>
          <Link to={`/review/${subject.slug}`}><Button className="mt-6">Open subject <ArrowRight size={16} className="ml-2 inline" /></Button></Link>
        </Card>)}</div>}
    </DataState>
  </>
}

export function SubjectReview() {
  const { subject: slug = '' } = useParams()
  const { data, loading, error } = useAsyncData(async () => {
    const subject = await getSubjectBySlug(slug)
    const lessons = await getLessonsBySubject(subject.id)
    return { subject, lessons }
  }, [slug])
  return <DataState loading={loading} error={error}>
    {data && <>
      <PageHeader eyebrow={`${data.subject.name} · Review`} title="Build your understanding" description="Read a short lesson, then try a few questions to make the idea stick." />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">{data.lessons.length ? data.lessons.map((lesson, index) => <Card key={lesson.id} className="p-6 md:p-8">
          <div className="flex items-start gap-4"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#E8F3ED] text-[#146C4B]"><BookOpen size={19} /></div>
            <div className="flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-bold">{lesson.title}</h2><Badge>Lesson {index + 1}</Badge></div>
              <p className="mt-4 leading-7 text-[#737A76]">{lesson.content}</p>
              {lesson.rule && <div className="mt-5 rounded-xl bg-[#F0F4F1] p-4"><div className="text-xs font-bold uppercase tracking-wide text-[#146C4B]">Remember</div><p className="mt-2 text-sm leading-6">{lesson.rule}</p></div>}
              {lesson.example && <div className="mt-5"><div className="text-sm font-bold">Worked example</div><p className="mt-2 text-sm leading-6 text-[#737A76]">{lesson.example}</p></div>}
            </div>
          </div>
        </Card>) : <Card className="p-6">No lessons are available for this subject yet.</Card>}</div>
        <Card className="h-fit p-6"><div className="text-sm font-semibold text-[#146C4B]">Ready to practice?</div><h2 className="mt-2 text-xl font-bold">Check your understanding</h2><p className="mt-2 text-sm leading-6 text-[#737A76]">Take a 10-question quiz and see explanations for every answer.</p><Link to={`/practice/${data.subject.slug}`}><Button className="mt-6 w-full">Start practice</Button></Link><div className="mt-6 flex items-center gap-2 text-sm text-[#737A76]"><CheckCircle2 size={16} className="text-[#146C4B]" />Short, focused questions</div></Card>
      </div>
    </>}
  </DataState>
}
