import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { Review, SubjectReview } from '@/pages/Review'
import { Practice, PracticeSubject } from '@/pages/Practice'
import { Quiz } from '@/pages/Quiz'
import { Results, Mistakes } from '@/pages/Results'
import { Progress } from '@/pages/Progress'
import { Admin, AdminStudent } from '@/pages/Admin'
import { NotFound } from '@/pages/NotFound'
import { useAuth } from '@/lib/auth'
function Protected({ children }: { children: React.ReactNode }) { const { profile, loading } = useAuth(); if (loading) return <div className="grid min-h-screen place-items-center bg-[#F6F7F6]">Loading your reviewer…</div>; return profile ? <>{children}</> : <Navigate to="/login" replace /> }
function AdminOnly({ children }: { children: React.ReactNode }) { const { profile } = useAuth(); return profile?.role === 'admin' ? <>{children}</> : <Navigate to="/dashboard" replace /> }
export default function App() { return <BrowserRouter><Routes><Route path="/login" element={<Login />} /><Route element={<Protected><AppLayout /></Protected>}><Route path="/" element={<Navigate to="/dashboard" replace />} /><Route path="/dashboard" element={<Dashboard />} /><Route path="/review" element={<Review />} /><Route path="/review/:subject" element={<SubjectReview />} /><Route path="/practice" element={<Practice />} /><Route path="/practice/:subject" element={<PracticeSubject />} /><Route path="/quiz/:quizId" element={<Quiz />} /><Route path="/results/:attemptId" element={<Results />} /><Route path="/mistakes" element={<Mistakes />} /><Route path="/progress" element={<Progress />} /><Route path="/admin" element={<AdminOnly><Admin /></AdminOnly>} /><Route path="/admin/students/:studentId" element={<AdminOnly><AdminStudent /></AdminOnly>} /></Route><Route path="*" element={<NotFound />} /></Routes></BrowserRouter> }
