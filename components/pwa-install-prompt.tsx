"use client"

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
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
  const [promptCaptured, setPromptCaptured] = useState(false)
  const pathname = usePathname()
  
  // Only show on landing page or demo pages
  const isAllowedPage = pathname === '/' || 
                        pathname.startsWith('/demo') || 
                        pathname.startsWith('/login') || 
                        pathname.startsWith('/register')

  useEffect(() => {
    // Only run on client side and on allowed pages
    if (typeof window === 'undefined' || !isAllowedPage) return
    
    // Check if app is already installed (imperfect method)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');
    
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event
    const handler = (e: BeforeInstallPromptEvent) => {
      // Prevent default browser prompt
      e.preventDefault()
      
      // Save event for later use
      setInstallPrompt(e)
      setPromptCaptured(true)
      
      // Show our prompt immediately if the app is installable
      setIsVisible(true)
      console.log("PWA is installable! Install prompt captured.");
    }

    // Add a debug message to check if the event listener is set up
    console.log("Setting up beforeinstallprompt event listener");
    window.addEventListener('beforeinstallprompt', handler)

    // Only show the warning if we haven't captured a prompt
    const warningTimeout = setTimeout(() => {
      if (!promptCaptured && !isInstalled) {
        console.log("No install prompt detected after 3 seconds. This is normal if you've already installed the app or declined installation previously.");
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      clearTimeout(warningTimeout)
    }
  }, [promptCaptured, isInstalled, isAllowedPage])

  const handleInstall = async () => {
    if (!installPrompt) return
    
    console.log("Triggering install prompt");
    // Show browser install prompt
    await installPrompt.prompt()
    
    // Wait for user choice
    const { outcome } = await installPrompt.userChoice
    console.log(`User ${outcome} the installation`);
    
    // Clear saved prompt
    setInstallPrompt(null)
    setIsVisible(false)
    
    if (outcome === 'accepted') {
      setIsInstalled(true)
    }
  }

  const handleClose = () => {
    setIsVisible(false)
    // Store that user dismissed the prompt
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  // Only show if we have a prompt and it's visible and we're on an allowed page
  if ((!isVisible || !installPrompt || !isAllowedPage) && !isInstalled) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-xs">
      <Card className="p-4 shadow-lg border-2 border-blue-500">
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