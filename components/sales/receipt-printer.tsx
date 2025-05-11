"use client"

import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { PrinterIcon } from "lucide-react"
import { useEffect, useRef } from "react"

interface SaleItem {
  name: string
  quantity: number
  price: number
  total: number
}

interface Sale {
  id: string
  date: Date
  customer: string
  items: SaleItem[]
  subtotal: number
  tax?: number
  total: number
  paymentType: string
  paymentDetails?: {
    amountGiven: number
    change: number
  }
}

interface ReceiptPrinterProps {
  sale: Sale
  autoPrint?: boolean
}

export function ReceiptPrinter({ sale, autoPrint = false }: ReceiptPrinterProps) {
  const receiptRef = useRef<HTMLDivElement>(null)

  // Auto-print when the component mounts if autoPrint is true
  useEffect(() => {
    if (autoPrint) {
      handlePrint()
    }
  }, [autoPrint])

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow || !receiptRef.current) return

    const receiptContent = receiptRef.current.innerHTML
    const styledContent = `
      <html>
        <head>
          <style>
            body {
              font-family: 'Courier New', Courier, monospace;
              padding: 20px;
              max-width: 300px;
              margin: 0 auto;
            }
            .receipt {
              width: 100%;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .divider {
              border-top: 1px dashed #000;
              margin: 10px 0;
            }
            .item {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
            }
            .totals {
              margin-top: 10px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
            }
            @media print {
              body { margin: 0; padding: 10px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${receiptContent}
        </body>
      </html>
    `

    printWindow.document.write(styledContent)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="w-full">
      <div ref={receiptRef} className="receipt bg-white text-black p-4">
        <div className="header">
          <h2 className="text-xl font-bold">Your Store Name</h2>
          <p>123 Store Street</p>
          <p>City, State 12345</p>
          <p>Tel: (123) 456-7890</p>
        </div>

        <div className="divider" />

        <div className="sale-info space-y-1">
          <p>Receipt #: {sale.id}</p>
          <p>Date: {sale.date.toLocaleString()}</p>
          <p>Customer: {sale.customer}</p>
        </div>

        <div className="divider" />

        <div className="items space-y-2">
          {sale.items.map((item, index) => (
            <div key={index} className="item">
              <div>
                <p>{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.quantity} x {formatCurrency(item.price)}
                </p>
              </div>
              <p>{formatCurrency(item.total)}</p>
            </div>
          ))}
        </div>

        <div className="divider" />

        <div className="totals space-y-2">
          <div className="item">
            <p>Subtotal:</p>
            <p>{formatCurrency(sale.subtotal)}</p>
          </div>
          <div className="item font-bold">
            <p>Total:</p>
            <p>{formatCurrency(sale.total)}</p>
          </div>
        </div>

        <div className="divider" />

        <div className="payment space-y-2">
          <div className="item">
            <p>Payment Method:</p>
            <p>{sale.paymentType}</p>
          </div>
          {sale.paymentDetails ? (
            <>
              <div className="item">
                <p>Amount Given:</p>
                <p>{formatCurrency(sale.paymentDetails.amountGiven)}</p>
              </div>
              <div className="item">
                <p>Change:</p>
                <p>{formatCurrency(sale.paymentDetails.change)}</p>
              </div>
            </>
          ) : (
            <div className="item">
              <p>Amount Paid:</p>
              <p>{formatCurrency(sale.total)}</p>
            </div>
          )}
        </div>

        <div className="divider" />

        <div className="footer">
          <p>Thank you for your purchase!</p>
          <p>Please come again</p>
          <p className="text-xs mt-2">This serves as your official receipt</p>
        </div>
      </div>

      <Button onClick={handlePrint} className="w-full mt-4">
        <PrinterIcon className="w-4 h-4 mr-2" />
        Print Receipt
      </Button>
    </div>
  )
} 