"use client"

import { useEffect, useRef } from "react"
import JsBarcode from "jsbarcode"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

interface BarcodeGeneratorProps {
  value: string
  width?: number
  height?: number
  format?: string
  displayValue?: boolean
  onPrint?: () => void
}

export function BarcodeGenerator({
  value,
  width = 2,
  height = 100,
  format = "CODE128",
  displayValue = true,
}: BarcodeGeneratorProps) {
  const barcodeRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (barcodeRef.current && value) {
      try {
        JsBarcode(barcodeRef.current, value, {
          format,
          width,
          height,
          displayValue,
          font: "Inter",
          fontSize: 16,
          margin: 10,
        })
      } catch (error) {
        console.error("Failed to generate barcode:", error)
      }
    }
  }, [value, width, height, format, displayValue])

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      const barcodeHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Barcode</title>
            <style>
              body {
                margin: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
              }
              .barcode-container {
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="barcode-container">
              ${barcodeRef.current?.outerHTML}
            </div>
            <script>
              window.onload = () => {
                window.print();
                window.close();
              };
            </script>
          </body>
        </html>
      `
      printWindow.document.write(barcodeHtml)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <svg ref={barcodeRef} />
      <Button variant="outline" size="sm" onClick={handlePrint}>
        <Printer className="mr-2 h-4 w-4" />
        Print Barcode
      </Button>
    </div>
  )
} 