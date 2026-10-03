import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'sonner'
import App from './App'
import './index.css'
import { AuthProvider } from '@/lib/auth'
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><AuthProvider><App /><Toaster position="top-right" /></AuthProvider></React.StrictMode>)
