"use client"

import { useEffect, useState } from 'react'
import { X, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// BeforeInstallPromptEvent is not part of the standard DOM events, so we need to define it
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

declare global {
  interface WindowEventMap {
    'beforeinstallprompt': BeforeInstallPromptEvent
  }
}

export function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return
    
    // Check if app is already installed (imperfect method)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');
    
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Get previously stored user choice
    const hasPrompted = localStorage.getItem('pwa-install-prompted');
    
    // Listen for beforeinstallprompt event
    const handler = (e: BeforeInstallPromptEvent) => {
      // Prevent default browser prompt
      e.preventDefault()
      
      // Save event for later use
      setInstallPrompt(e)
      
      // Only show our prompt if user hasn't seen it in the past 30 days
      if (!hasPrompted || Date.now() - parseInt(hasPrompted) > 30 * 24 * 60 * 60 * 1000) {
        // Show prompt after 30 seconds
        setTimeout(() => {
          setIsVisible(true)
          // Save timestamp of when we showed the prompt
          localStorage.setItem('pwa-install-prompted', Date.now().toString())
        }, 30000)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    
    // Show browser install prompt
    await installPrompt.prompt()
    
    // Wait for user choice
    const { outcome } = await installPrompt.userChoice
    
    // Clear saved prompt
    setInstallPrompt(null)
    setIsVisible(false)
    
    if (outcome === 'accepted') {
      setIsInstalled(true)
    }
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  if (!isVisible || isInstalled) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-xs">
      <Card className="p-4 shadow-lg">
        <div className="flex justify-between items-start">
          <h3 className="font-medium">Install GadgetTrack</h3>
          <Button variant="ghost" size="icon" onClick={handleClose} className="h-6 w-6 -mt-1 -mr-1">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1 mb-3">
          Add GadgetTrack to your home screen for quick access and offline functionality.
        </p>
        <Button onClick={handleInstall} className="w-full" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Install App
        </Button>
      </Card>
    </div>
  )
} 