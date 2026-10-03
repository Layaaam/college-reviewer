import { AlertTriangle, ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Clock3, ExternalLink, Lightbulb, ListChecks } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Badge, Button, Card } from '@/components/ui'
import { DataState } from '@/components/DataState'
import { PageHeader } from '@/components/PageHeader'
import { getLessonByTopic, getLessonsBySubject, getSubjectBySlug, getSubjects, getTopicsBySubject } from '@/lib/api'
import { useAsyncData } from '@/hooks/useAsyncData'

export function Review() {
  const { data: subjects, loading, error } = useAsyncData(getSubjects, [])
  return <>
    <PageHeader eyebrow="Review" title="Choose a subject" description="Learn the concepts and methods first, then apply them in focused practice." />
    <DataState loading={loading} error={error}>
      {!subjects?.length ? <Card className="p-6">No subjects are available yet.</Card> :
        <div className="grid gap-5 md:grid-cols-2">{subjects.map((subject) => <Card key={subject.id} className="p-6">
          <div className="flex items-start justify-between"><div className="grid h-12 w-12 place-items-center rounded-2xl text-xl" style={{ background: subject.color }}>{subject.icon}</div><Badge tone="gray">Complete lessons</Badge></div>
          <h2 className="mt-6 text-xl font-bold">{subject.name}</h2><p className="mt-2 text-sm leading-6 text-[#737A76]">{subject.description}</p>
          <Link to={`/review/${subject.slug}`}><Button className="mt-6">Browse topics <ArrowRight size={16} className="ml-2 inline" /></Button></Link>
        </Card>)}</div>}
    </DataState>
  </>
}

export function SubjectReview() {
  const { subject: slug = '' } = useParams()
  const { data, loading, error } = useAsyncData(async () => {
    const subject = await getSubjectBySlug(slug)
    const [topics, lessons] = await Promise.all([getTopicsBySubject(subject.id), getLessonsBySubject(subject.id)])
    return { subject, topics, lessons }
  }, [slug])
  return <DataState loading={loading} error={error}>{data && <>
    <PageHeader eyebrow={`${data.subject.name} · Review`} title="Choose a topic to study" description="Each lesson includes core ideas, a repeatable method, guided solutions, common mistakes, exam strategies, and quick checks." />
    <div className="grid gap-5 md:grid-cols-2">{data.topics.map((topic, index) => {
      const lesson = data.lessons.find((item) => item.topic_id === topic.id)
      return <Card key={topic.id} className="flex flex-col p-6"><div className="flex items-start justify-between"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[#E8F3ED] text-[#146C4B]"><BookOpen size={19} /></div><Badge tone="gray">Topic {index + 1}</Badge></div><h2 className="mt-5 text-xl font-bold">{topic.title}</h2><p className="mt-2 flex-1 text-sm leading-6 text-[#737A76]">{topic.description}</p><div className="mt-5 flex items-center justify-between border-t border-[#E2E7E4] pt-4"><span className="flex items-center gap-1 text-xs text-[#737A76]"><Clock3 size={14} />{lesson?.estimated_minutes ?? 20} min lesson</span><Link to={`/review/${data.subject.slug}/${topic.slug}`} className="text-sm font-semibold text-[#146C4B]">Open lesson <ArrowRight size={15} className="ml-1 inline" /></Link></div></Card>
    })}</div>
  </>}</DataState>
}

export function TopicLesson() {
  const { subject: subjectSlug = '', topic: topicSlug = '' } = useParams()
  const { data, loading, error } = useAsyncData(async () => {
    const subject = await getSubjectBySlug(subjectSlug)
    const topics = await getTopicsBySubject(subject.id)
    const topic = topics.find((item) => item.slug === topicSlug)
    if (!topic) throw new Error('This topic was not found.')
    const lesson = await getLessonByTopic(topic.id)
    return { subject, topics, topic, lesson }
  }, [subjectSlug, topicSlug])
  return <DataState loading={loading} error={error}>{data && <div>
    <Link to={`/review/${data.subject.slug}`} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#737A76]"><ArrowLeft size={16} />All {data.subject.name} topics</Link>
    <PageHeader eyebrow={`${data.subject.name} · ${data.topic.title}`} title={data.lesson.title} description={`${data.lesson.estimated_minutes}-minute guided lesson. Learn the method before testing yourself.`} />
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
      <main className="space-y-6">
        <Card className="p-6 md:p-8"><Badge>Lesson overview</Badge><div className="mt-5 space-y-4">{data.lesson.overview.split(/\n\n+/).map((paragraph) => <p key={paragraph} className="leading-7 text-[#4D5652]">{paragraph}</p>)}</div></Card>

        <Card className="p-6 md:p-8"><SectionHeading icon={<ListChecks size={19} />} title="What you should be able to do" /><ul className="mt-5 grid gap-3 md:grid-cols-2">{data.lesson.objectives.map((objective) => <li key={objective} className="flex gap-3 rounded-xl bg-[#F6F8F7] p-4 text-sm leading-6"><CheckCircle2 size={17} className="mt-1 shrink-0 text-[#146C4B]" />{objective}</li>)}</ul></Card>

        <section><h2 className="mb-4 text-2xl font-bold">Core concepts</h2><div className="grid gap-4">{data.lesson.concept_sections.map((concept, index) => <Card key={concept.title} className="p-6"><div className="flex gap-4"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#E8F3ED] font-bold text-[#146C4B]">{index + 1}</div><div><h3 className="font-bold">{concept.title}</h3><p className="mt-2 leading-7 text-[#59635E]">{concept.body}</p></div></div></Card>)}</div></section>

        <Card className="p-6 md:p-8"><SectionHeading icon={<BookOpen size={19} />} title="Step-by-step method" /><ol className="mt-6 space-y-4">{data.lesson.method_steps.map((step, index) => <li key={step} className="flex gap-4"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#146C4B] text-sm font-bold text-white">{index + 1}</span><p className="pt-1 leading-6">{step}</p></li>)}</ol></Card>

        <section><div className="mb-4"><h2 className="text-2xl font-bold">Guided examples</h2><p className="mt-1 text-sm text-[#737A76]">Follow the reasoning, not only the final answer.</p></div><div className="space-y-5">{data.lesson.worked_examples.map((example) => <Card key={example.title} className="overflow-hidden"><div className="border-b border-[#E2E7E4] bg-[#F6F8F7] px-6 py-4 font-bold">{example.title}</div><div className="p-6">{example.passage && <div className="mb-4 rounded-xl bg-[#F0F4F1] p-4 text-sm leading-7">{example.passage}</div>}<div className="text-sm font-bold uppercase tracking-wide text-[#737A76]">Problem</div><p className="mt-2 text-lg font-semibold leading-7">{example.prompt}</p><div className="mt-5 text-sm font-bold uppercase tracking-wide text-[#737A76]">Solution</div><p className="mt-2 leading-7 text-[#4D5652]">{example.solution}</p><div className="mt-4 rounded-xl border border-[#B8D8C5] bg-[#E8F3ED] p-4"><strong>Answer: </strong>{example.answer}</div></div></Card>)}</div></section>

        <div className="grid gap-5 lg:grid-cols-2"><Card className="p-6"><SectionHeading icon={<AlertTriangle size={19} />} title="Common mistakes" /><ul className="mt-5 space-y-3">{data.lesson.common_mistakes.map((mistake) => <li key={mistake} className="flex gap-3 text-sm leading-6"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#C94B4B]" />{mistake}</li>)}</ul></Card><Card className="p-6"><SectionHeading icon={<Lightbulb size={19} />} title="CET strategies" /><ul className="mt-5 space-y-3">{data.lesson.exam_tips.map((tip) => <li key={tip} className="flex gap-3 text-sm leading-6"><CheckCircle2 size={16} className="mt-1 shrink-0 text-[#146C4B]" />{tip}</li>)}</ul></Card></div>

        <Card className="p-6 md:p-8"><SectionHeading icon={<CheckCircle2 size={19} />} title="Quick check" /><p className="mt-2 text-sm text-[#737A76]">Try each item before opening its answer.</p><div className="mt-5 space-y-3">{data.lesson.quick_checks.map((check, index) => <details key={`${check.prompt}-${index}`} className="rounded-xl border border-[#E2E7E4] p-4"><summary className="cursor-pointer font-semibold leading-6">{index + 1}. {check.prompt}</summary><div className="mt-4 border-t border-[#E2E7E4] pt-4 text-sm leading-6"><p><strong>Answer:</strong> {check.answer}</p><p className="mt-2 text-[#59635E]">{check.explanation}</p></div></details>)}</div></Card>
      </main>

      <aside className="h-fit space-y-5 xl:sticky xl:top-24"><Card className="p-6"><div className="text-sm font-semibold text-[#146C4B]">After this lesson</div><h2 className="mt-2 text-xl font-bold">Apply what you learned</h2><p className="mt-2 text-sm leading-6 text-[#737A76]">Start a 10-question topic practice with immediate feedback after each locked answer.</p><Link to={`/practice/${data.subject.slug}`}><Button className="mt-6 w-full">Choose topic practice</Button></Link></Card><Card className="p-5"><h3 className="font-bold">Official scope references</h3><div className="mt-3 space-y-2">{data.lesson.source_links.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="flex items-start gap-2 text-sm leading-5 text-[#146C4B]"><ExternalLink size={14} className="mt-1 shrink-0" />{source.title}</a>)}</div></Card></aside>
    </div>
  </div>}</DataState>
}

function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#E8F3ED] text-[#146C4B]">{icon}</span><h2 className="text-xl font-bold">{title}</h2></div>
}
