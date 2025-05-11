// Notification model for the POS system

export type NotificationType = 'low_stock' | 'system' | 'order' | 'customer';
export type NotificationPriority = 'low' | 'medium' | 'high';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  isRead: boolean;
  createdAt: Date | string;
  expiresAt?: Date | string; // Optional expiration date
  actionLink?: string; // Optional link to take action
  relatedItemId?: number; // Optional related item ID (product, order, etc.)
} 