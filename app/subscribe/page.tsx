import { Suspense } from 'react'
import SubscribeForm from './SubscribeForm'

export default function SubscribePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SubscribeForm />
    </Suspense>
  )
} 