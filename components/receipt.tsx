"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { BarcodeGenerator } from "@/components/barcode-generator"

interface ReceiptProps {
  transactionId: string
  date: Date
  items: {
    name: string
    quantity: number
    price: number
    barcode?: string
  }[]
  total: number
  paymentMethod: string
  customerName?: string
}

export function Receipt({
  transactionId,
  date,
  items,
  total,
  paymentMethod,
  customerName,
}: ReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (printWindow && receiptRef.current) {
      const receiptHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Receipt</title>
            <style>
              body {
                margin: 0;
                padding: 20px;
                font-family: system-ui, -apple-system, sans-serif;
              }
              .receipt {
                max-width: 300px;
                margin: 0 auto;
              }
              .header {
                text-align: center;
                margin-bottom: 20px;
              }
              .items {
                margin: 20px 0;
                border-top: 1px dashed #ccc;
                border-bottom: 1px dashed #ccc;
                padding: 10px 0;
              }
              .item {
                display: flex;
                justify-content: space-between;
                margin: 5px 0;
              }
              .total {
                font-size: 1.2em;
                font-weight: bold;
                text-align: right;
                margin: 10px 0;
              }
              .footer {
                text-align: center;
                font-size: 0.8em;
                margin-top: 20px;
              }
              @media print {
                body {
                  padding: 0;
                }
              }
            </style>
          </head>
          <body>
            ${receiptRef.current.outerHTML}
            <script>
              window.onload = () => {
                window.print();
                window.close();
              };
            </script>
          </body>
        </html>
      `
      printWindow.document.write(receiptHtml)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={receiptRef}
        className="w-full max-w-[300px] p-4 border rounded-lg bg-white text-black"
      >
        <div className="text-center mb-4">
          <h2 className="font-bold text-xl">GadgetTrack</h2>
          <p className="text-sm">Your Gadget Shop</p>
          <p className="text-xs text-gray-500">123 Main Street, City</p>
          <p className="text-xs text-gray-500">Tel: (123) 456-7890</p>
        </div>

        <div className="text-sm mb-4">
          <p>Transaction ID: {transactionId}</p>
          <p>Date: {date.toLocaleString()}</p>
          {customerName && <p>Customer: {customerName}</p>}
        </div>

        <div className="border-t border-b border-dashed py-4 mb-4">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm mb-2">
              <div>
                <p>{item.name}</p>
                <p className="text-xs text-gray-500">x{item.quantity}</p>
                {item.barcode && (
                  <div className="mt-1">
                    <BarcodeGenerator value={item.barcode} height={40} displayValue={false} />
                  </div>
                )}
              </div>
              <p>₱{(item.price * item.quantity).toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="text-right mb-4">
          <p className="text-sm text-gray-500">Payment Method: {paymentMethod}</p>
          <p className="text-lg font-bold">Total: ₱{total.toLocaleString()}</p>
        </div>

        <div className="text-center text-xs text-gray-500 mt-4">
          <p>Thank you for shopping with us!</p>
          <p>Please come again</p>
        </div>

        <div className="mt-4">
          <BarcodeGenerator value={transactionId} height={60} />
        </div>
      </div>

      <Button onClick={handlePrint} className="w-[300px]">
        <Printer className="mr-2 h-4 w-4" />
        Print Receipt
      </Button>
    </div>
  )
} 