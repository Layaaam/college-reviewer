import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react'
import { Badge, Button, Card, ProgressBar } from '@/components/ui'
import { DataState } from '@/components/DataState'
import { getMistakes, getQuizResult, getSubjects } from '@/lib/api'
import { useAsyncData } from '@/hooks/useAsyncData'

export function Results() {
  const { attemptId = '' } = useParams()
  const { data, loading, error } = useAsyncData(async () => {
    const [result, subjects] = await Promise.all([getQuizResult(attemptId), getSubjects()])
    return { result, subjects }
  }, [attemptId])
  const result = data?.result
  const subject = data?.subjects.find((item) => item.id === result?.attempt.subject_id)
  const correctCount = result?.answers.filter((answer) => answer.is_correct).length ?? 0

  return <DataState loading={loading} error={error}>
    {result && <div className="mx-auto max-w-4xl">
      <div className="text-center"><Badge>Quiz complete</Badge><h1 className="mt-4 text-3xl font-bold md:text-4xl">Nice work.</h1><p className="mt-2 text-[#737A76]">Here’s a look at what you know and what to revisit.</p></div>
      <Card className="mx-auto mt-8 max-w-xl p-7"><div className="flex items-center justify-between"><div><div className="text-sm text-[#737A76]">{subject?.name ?? 'Subject'}</div><div className="mt-2 text-4xl font-bold text-[#146C4B]">{result.attempt.score}%</div></div><div className="text-right text-sm text-[#737A76]"><div><strong className="text-[#151817]">{correctCount}</strong> correct</div><div className="mt-1"><strong className="text-[#151817]">{result.attempt.total_questions - correctCount}</strong> to review</div></div></div><div className="mt-6"><ProgressBar value={result.attempt.score} /></div>{subject && <Link to={`/practice/${subject.slug}`}><Button variant="outline" className="mt-6 w-full">Retry quiz</Button></Link>}</Card>
      <section className="mt-10"><h2 className="mb-4 text-xl font-bold">Review your answers</h2><div className="space-y-4">{result.questions.map((question) => { const answer = result.answers.find((item) => item.question_id === question.id); const selected = question.choices.find((choice) => choice.id === answer?.selected_choice_id); const correct = question.choices.find((choice) => choice.is_correct); return <Card key={question.id} className="p-5 md:p-6"><div className="flex gap-3"><div className="mt-0.5">{answer?.is_correct ? <CheckCircle2 className="text-[#2E8B57]" size={20} /> : <XCircle className="text-[#C94B4B]" size={20} />}</div><div className="flex-1"><div className="font-semibold leading-6">{question.question_text}</div><div className="mt-3 text-sm"><span className="text-[#737A76]">Your answer: </span><span className={answer?.is_correct ? 'font-semibold text-[#2E8B57]' : 'font-semibold text-[#C94B4B]'}>{selected?.choice_text ?? 'Not answered'}</span></div>{!answer?.is_correct && <div className="mt-1 text-sm"><span className="text-[#737A76]">Correct answer: </span><span className="font-semibold text-[#2E8B57]">{correct?.choice_text}</span></div>}<div className="mt-4 rounded-xl bg-[#F0F4F1] p-4 text-sm leading-6 text-[#737A76]"><strong className="text-[#151817]">Explanation: </strong>{question.explanation}</div></div></div></Card> })}</div></section>
      <div className="mt-8 text-center"><Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-[#146C4B]">Back to dashboard <ArrowRight size={16} /></Link></div>
    </div>}
  </DataState>
}

export function Mistakes() {
  const [subjectId, setSubjectId] = useState('')
  const { data, loading, error } = useAsyncData(async () => {
    const [subjects, mistakes] = await Promise.all([getSubjects(), getMistakes(subjectId || undefined)])
    return { subjects, mistakes }
  }, [subjectId])
  return <>
    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end"><div><div className="text-sm font-semibold text-[#146C4B]">Mistakes</div><h1 className="mt-2 text-3xl font-bold">Turn mistakes into progress.</h1><p className="mt-2 text-[#737A76]">Questions you missed are collected here with their explanations.</p></div><select value={subjectId} onChange={(event) => setSubjectId(event.target.value)} className="rounded-xl border border-[#E2E7E4] bg-white px-4 py-3 text-sm" aria-label="Filter mistakes"><option value="">All subjects</option>{data?.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></div>
    <div className="mt-8"><DataState loading={loading} error={error}>
      {data?.mistakes.length ? <div className="space-y-4">{data.mistakes.map(({ question, answer }) => { const subject = data.subjects.find((item) => item.id === question.subject_id); const selected = question.choices.find((choice) => choice.id === answer.selected_choice_id); const correct = question.choices.find((choice) => choice.is_correct); return <Card key={question.id} className="p-6"><Badge tone="gray">{subject?.name ?? 'Subject'}</Badge><h2 className="mt-4 font-bold">{question.question_text}</h2><p className="mt-3 text-sm text-[#737A76]">Your answer: {selected?.choice_text ?? 'Not answered'}</p><p className="mt-1 text-sm font-semibold text-[#146C4B]">Correct answer: {correct?.choice_text}</p><p className="mt-4 rounded-xl bg-[#F0F4F1] p-4 text-sm leading-6">{question.explanation}</p>{subject && <Link to={`/practice/${subject.slug}`}><Button variant="outline" className="mt-4">Practice again</Button></Link>}</Card> })}</div> : <Card className="p-8 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#E8F3ED] text-[#146C4B]"><CheckCircle2 /></div><h2 className="mt-5 text-xl font-bold">No mistakes to review yet</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#737A76]">Complete a practice quiz to see questions that need another look.</p><Link to="/practice"><Button className="mt-6">Practice now</Button></Link></Card>}
    </DataState></div>
  </>
}
