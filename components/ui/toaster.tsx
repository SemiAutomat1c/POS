"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <ToastProvider>
        <ToastViewport />
      </ToastProvider>
    )
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} suppressHydrationWarning>
            <div className="grid gap-1" suppressHydrationWarning>
              {title && <ToastTitle suppressHydrationWarning>{title}</ToastTitle>}
              {description && (
                <ToastDescription suppressHydrationWarning>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose suppressHydrationWarning />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
