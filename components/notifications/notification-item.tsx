import { Bell, AlertTriangle, ShoppingCart, User, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '@/lib/models/Notification';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
}

export default function NotificationItem({ notification }: NotificationItemProps) {
  console.log('Rendering NotificationItem:', {
    id: notification.id,
    title: notification.title,
    isRead: notification.isRead
  });
  
  // Format the date to show how long ago it was created (e.g., "2 hours ago")
  const formattedDate = formatDistanceToNow(
    new Date(notification.createdAt),
    { addSuffix: true }
  );
  
  // Get icon based on notification type
  const getIcon = () => {
    switch (notification.type) {
      case 'low_stock':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'order':
        return <ShoppingCart className="h-5 w-5 text-blue-500" />;
      case 'customer':
        return <User className="h-5 w-5 text-green-500" />;
      case 'system':
      default:
        return <Info className="h-5 w-5 text-slate-500" />;
    }
  };
  
  // Get badge style based on priority
  const getPriorityBadge = () => {
    let className = '';
    let label = '';
    
    switch (notification.priority) {
      case 'high':
        className = 'bg-red-500/10 text-red-500 border-red-200';
        label = 'High';
        break;
      case 'medium':
        className = 'bg-orange-500/10 text-orange-500 border-orange-200';
        label = 'Medium';
        break;
      case 'low':
      default:
        className = 'bg-blue-500/10 text-blue-500 border-blue-200';
        label = 'Low';
        break;
    }
    
    return <Badge className={className}>{label}</Badge>;
  };

  return (
    <div className={cn(
      "flex w-full gap-3 p-1 rounded",
      notification.isRead 
        ? "opacity-70" 
        : "bg-muted/50 border-l-2 border-blue-500"
    )}>
      <div className="flex-shrink-0 mt-1">
        {getIcon()}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p className={cn(
            "text-sm",
            notification.isRead ? "font-normal" : "font-medium"
          )}>
            {notification.title}
          </p>
          {!notification.isRead && (
            <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formattedDate}</span>
          {notification.priority !== 'low' && getPriorityBadge()}
        </div>
      </div>
    </div>
  );
} 