import { useState } from 'react'
import { Eye, Search, ShieldCheck } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Badge, Card, ProgressBar } from '@/components/ui'
import { DataState } from '@/components/DataState'
import { PageHeader } from '@/components/PageHeader'
import { useAsyncData } from '@/hooks/useAsyncData'
import { getAdminStudentAttempts, getAdminStudentProgress, getAdminStudents, getSubjects } from '@/lib/api'

export function Admin() {
  const [query, setQuery] = useState('')
  const { data: students, loading, error } = useAsyncData(getAdminStudents, [])
  const filtered = students?.filter((student) => `${student.full_name} ${student.email}`.toLowerCase().includes(query.toLowerCase())) ?? []
  return <>
    <div className="mb-8 flex items-start justify-between gap-4"><PageHeader eyebrow="Admin · Read-only" title="Student progress" description="Monitor learning activity without changing student records." /><div className="hidden items-center gap-2 rounded-xl border border-[#E2E7E4] bg-white px-3 py-2 text-sm text-[#146C4B] sm:flex"><ShieldCheck size={17} />Protected view</div></div>
    <DataState loading={loading} error={error}><Card className="overflow-hidden"><div className="flex items-center gap-2 border-b border-[#E2E7E4] p-4"><Search size={18} className="text-[#737A76]" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full outline-none" placeholder="Search by name or email" aria-label="Search students" /></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="bg-[#F6F7F6] text-xs uppercase tracking-wide text-[#737A76]"><tr><th className="px-5 py-4">Student</th><th className="px-5 py-4">Accuracy</th><th className="px-5 py-4">Questions</th><th className="px-5 py-4 text-right">View</th></tr></thead><tbody className="divide-y divide-[#E2E7E4]">{filtered.map((student) => <tr key={student.id}><td className="px-5 py-4"><div className="font-semibold">{student.full_name || student.email}</div><div className="text-xs text-[#737A76]">{student.email}</div></td><td className="px-5 py-4"><Badge>{student.accuracy}%</Badge></td><td className="px-5 py-4">{student.questions_answered}</td><td className="px-5 py-4 text-right"><Link to={`/admin/students/${student.id}`} className="inline-flex items-center gap-2 font-semibold text-[#146C4B]"><Eye size={16} />Details</Link></td></tr>)}</tbody></table></div>
      {!filtered.length && <p className="p-5 text-sm text-[#737A76]">{query ? 'No students match your search.' : 'No student accounts yet.'}</p>}
    </Card></DataState>
  </>
}

export function AdminStudent() {
  const { studentId = '' } = useParams()
  const { data, loading, error } = useAsyncData(async () => {
    const [students, progress, attempts, subjects] = await Promise.all([
      getAdminStudents(), getAdminStudentProgress(studentId), getAdminStudentAttempts(studentId), getSubjects(),
    ])
    return { student: students.find((student) => student.id === studentId), progress, attempts, subjects }
  }, [studentId])
  return <><Link to="/admin" className="text-sm font-semibold text-[#146C4B]">← All students</Link>
    <DataState loading={loading} error={error}>{data?.student ? <>
      <PageHeader eyebrow="Admin · Read-only" title={data.student.full_name || data.student.email} description={`${data.student.email} · Progress details are view-only.`} />
      <div className="grid gap-5 sm:grid-cols-3"><Card className="p-5"><div className="text-sm text-[#737A76]">Accuracy</div><div className="mt-2 text-3xl font-bold text-[#146C4B]">{data.student.accuracy}%</div></Card><Card className="p-5"><div className="text-sm text-[#737A76]">Questions answered</div><div className="mt-2 text-3xl font-bold">{data.student.questions_answered}</div></Card><Card className="p-5"><div className="text-sm text-[#737A76]">Access</div><div className="mt-2 flex items-center gap-2 text-lg font-bold"><ShieldCheck size={19} className="text-[#146C4B]" />Read-only</div></Card></div>
      <section className="mt-10"><h2 className="mb-4 text-xl font-bold">Subject progress</h2><div className="grid gap-4 md:grid-cols-2">{data.subjects.map((subject) => { const item = data.progress.find((row) => row.subject_id === subject.id); return <Card key={subject.id} className="p-5"><div className="flex justify-between"><div className="font-semibold">{subject.name}</div><span className="text-sm font-semibold text-[#146C4B]">{item?.accuracy ?? 0}%</span></div><div className="mt-4"><ProgressBar value={item?.accuracy ?? 0} /></div><div className="mt-2 text-xs text-[#737A76]">{item?.questions_answered ?? 0} questions answered</div></Card> })}</div></section>
      <section className="mt-10"><h2 className="mb-4 text-xl font-bold">Recent activity</h2><Card className="divide-y divide-[#E2E7E4]">{data.attempts.length ? data.attempts.map((attempt) => <div key={attempt.id} className="flex justify-between p-5 text-sm"><span>{data.subjects.find((subject) => subject.id === attempt.subject_id)?.name ?? 'Subject'} quiz · {new Date(attempt.completed_at ?? attempt.started_at).toLocaleDateString()}</span><strong className="text-[#146C4B]">{attempt.score}%</strong></div>) : <p className="p-5 text-sm text-[#737A76]">No completed quizzes yet.</p>}</Card></section>
    </> : <Card className="mt-6 p-6">Student not found.</Card>}</DataState>
  </>
}
