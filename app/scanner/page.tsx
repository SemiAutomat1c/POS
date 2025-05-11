"use client"

import type React from "react"

import { useState, useRef } from "react"
import { QrCode, Camera, Smartphone, Barcode, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"

export default function ScannerPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("manual")
  const [scannedCode, setScannedCode] = useState("")
  const [manualCode, setManualCode] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startScanner = async () => {
    setIsScanning(true)

    try {
      // In a real app, we would use a barcode scanning library
      // For this demo, we'll simulate scanning after a delay
      setTimeout(() => {
        const mockCode = "IMEI352789102345678"
        setScannedCode(mockCode)
        setIsScanning(false)

        toast({
          title: "Code Scanned Successfully",
          description: `Detected: ${mockCode}`,
        })

        // In a real app, we would look up the product in the database
        // and display its details
      }, 3000)
    } catch (error) {
      console.error("Error accessing camera:", error)
      setIsScanning(false)

      toast({
        title: "Scanner Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive",
      })
    }
  }

  const stopScanner = () => {
    setIsScanning(false)

    // In a real app, we would stop the video stream
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!manualCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid code",
        variant: "destructive",
      })
      return
    }

    setScannedCode(manualCode)

    toast({
      title: "Code Entered",
      description: `Looking up: ${manualCode}`,
    })

    // In a real app, we would look up the product in the database
  }

  const clearScannedCode = () => {
    setScannedCode("")
    setManualCode("")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Barcode Scanner</h1>
        <p className="text-muted-foreground">Scan product barcodes or IMEI numbers</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Scanner</CardTitle>
            <CardDescription>Scan product barcodes, QR codes, or enter codes manually</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="camera">
                  <Camera className="mr-2 h-4 w-4" />
                  Camera
                </TabsTrigger>
                <TabsTrigger value="manual">
                  <Smartphone className="mr-2 h-4 w-4" />
                  Manual Entry
                </TabsTrigger>
              </TabsList>

              <TabsContent value="camera" className="space-y-4">
                <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
                  {isScanning ? (
                    <>
                      <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-64 h-64 border-2 border-primary rounded-md"></div>
                      </div>
                      <canvas ref={canvasRef} className="hidden" />
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                      <QrCode className="h-16 w-16 mb-4" />
                      <p>Camera preview will appear here</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-center">
                  {isScanning ? (
                    <Button variant="destructive" onClick={stopScanner}>
                      <X className="mr-2 h-4 w-4" />
                      Stop Scanning
                    </Button>
                  ) : (
                    <Button onClick={startScanner}>
                      <Camera className="mr-2 h-4 w-4" />
                      Start Scanning
                    </Button>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="manual">
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="manualCode">Enter Barcode or IMEI</Label>
                    <Input
                      id="manualCode"
                      placeholder="e.g., 352789102345678"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                    />
                  </div>
                  <Button type="submit">
                    <Barcode className="mr-2 h-4 w-4" />
                    Look Up Code
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Scan Result</CardTitle>
            <CardDescription>Product details will appear here after scanning</CardDescription>
          </CardHeader>
          <CardContent>
            {scannedCode ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-md">
                  <div className="font-mono text-sm break-all">{scannedCode}</div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Product Details</h3>
                  <div className="text-sm">
                    {/* In a real app, we would display actual product details */}
                    <p>
                      <span className="font-medium">Name:</span> iPhone 13 Pro
                    </p>
                    <p>
                      <span className="font-medium">Category:</span> Phones
                    </p>
                    <p>
                      <span className="font-medium">Stock:</span> 5 units
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Price</span>
                      <span className="text-sm font-medium">{formatCurrency(65990)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={clearScannedCode}>
                    Clear
                  </Button>
                  <Button>View Details</Button>
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
                <Barcode className="h-16 w-16 mb-4" />
                <p>Scan a barcode or enter a code to see product details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
