import { Link } from 'react-router-dom'
import { Button, Card } from '@/components/ui'
export function NotFound() { return <div className="grid min-h-[60vh] place-items-center"><Card className="max-w-md p-8 text-center"><div className="text-sm font-semibold text-[#146C4B]">404</div><h1 className="mt-2 text-2xl font-bold">This page took a wrong turn.</h1><p className="mt-2 text-[#737A76]">Let’s get you back to your review plan.</p><Link to="/dashboard"><Button className="mt-6">Back to dashboard</Button></Link></Card></div> }
