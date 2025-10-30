import { redirect } from 'next/navigation'
import { createRLSClient } from '@/lib/supabase-client'

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side auth check before rendering client component
  const supabase = await createRLSClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    console.log('[Profile Layout] No authenticated user, redirecting to login')
    redirect('/login')
  }
  
  console.log('[Profile Layout] User authenticated:', user.id)
  
  return <>{children}</>
}

