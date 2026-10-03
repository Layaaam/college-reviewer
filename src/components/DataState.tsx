import { Card, Skeleton } from '@/components/ui'

export function DataState({ loading, error, children }: { loading: boolean; error: string | null; children: React.ReactNode }) {
  if (loading) return <div aria-label="Loading content" className="grid gap-4 md:grid-cols-2"><Skeleton className="h-48" /><Skeleton className="h-48" /></div>
  if (error) return <Card className="p-6"><p role="alert" className="font-semibold text-[#C94B4B]">Could not load this page</p><p className="mt-2 text-sm text-[#737A76]">{error}</p></Card>
  return <>{children}</>
}
