'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { Customer } from "@/types"

export interface CustomerDetailsProps {
  customer: Customer;
  onClose: () => void;
  isOpen?: boolean;
}

export function CustomerDetails({ customer, onClose, isOpen = true }: CustomerDetailsProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium">Name</h4>
            <p className="text-sm">{customer.name}</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Email</h4>
            <p className="text-sm">{customer.email}</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Phone</h4>
            <p className="text-sm">{customer.phone}</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Status</h4>
            <Badge 
              variant={
                customer.status === 'active' 
                  ? 'default'
                  : customer.status === 'inactive'
                  ? 'secondary'
                  : 'destructive'
              }
            >
              {customer.status}
            </Badge>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Total Orders</h4>
            <p className="text-sm">{customer.totalOrders}</p>
          </div>
          {customer.lastPurchase && (
            <div className="space-y-2">
              <h4 className="font-medium">Last Purchase</h4>
              <p className="text-sm">{customer.lastPurchase.toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 