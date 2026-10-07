import { redirect } from 'next/navigation'

// The onboarding guard in (app)/layout sends first-time visitors on from here.
export default function Home() {
  redirect('/today')
}
