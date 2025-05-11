// Return model for IndexedDB
// Handles returns, exchanges, and store credit

import { SaleItem } from "./Sale";

export type ReturnStatus = 'pending' | 'approved' | 'completed' | 'rejected';
export type ReturnType = 'refund' | 'exchange' | 'store_credit';
export type ReturnReason = 
  'defective' | 
  'not_as_described' | 
  'unwanted' | 
  'wrong_item' | 
  'damaged' | 
  'other';

export type RefundMethod = 'original_payment' | 'cash' | 'store_credit' | 'bank_transfer';

export interface Return {
  id: number;
  originalSaleId: number;
  customerId?: number;
  returnDate: Date | string;
  status: ReturnStatus;
  returnType: ReturnType;
  reason: ReturnReason;
  reasonDetails?: string;
  items: ReturnItem[];
  refundAmount: number;
  refundMethod: RefundMethod;
  storeCredit?: StoreCredit;
  exchangeItems?: SaleItem[];
  processedBy?: number; // Staff member ID
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ReturnItem {
  id?: number;
  returnId?: number;
  originalSaleItemId: number;
  productId: number;
  serialNumber?: string;
  quantity: number;
  returnedQuantity: number;
  price: number;
  refundAmount: number;
  condition: 'good' | 'damaged' | 'defective' | 'open_box';
  returnToInventory: boolean; // Whether to add back to inventory
  restockFee?: number;
  notes?: string;
}

export interface StoreCredit {
  id: number;
  customerId: number;
  amount: number;
  originalAmount: number;
  issueDate: Date | string;
  expiryDate?: Date | string;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  referenceCode: string; // Unique code for the store credit
  balance: number;
  transactions?: StoreCreditTransaction[];
}

export interface StoreCreditTransaction {
  id: number;
  storeCreditId: number;
  amount: number;
  date: Date | string;
  type: 'issue' | 'use' | 'adjustment';
  saleId?: number;
  returnId?: number;
  notes?: string;
}

// Sample return policy rules
export const ReturnPolicyRules = {
  newItems: {
    daysAllowed: 30,
    requiresReceipt: true,
    restockingFee: 0.15, // 15% for non-defective returns
    requiresOriginalPackaging: true
  },
  preOwnedItems: {
    daysAllowed: 14,
    requiresReceipt: true,
    restockingFee: 0.20, // 20% for pre-owned returns
    requiresOriginalPackaging: false
  },
  refurbishedItems: {
    daysAllowed: 30,
    requiresReceipt: true,
    restockingFee: 0.10, // 10% for refurbished returns
    requiresOriginalPackaging: false
  }
}; 