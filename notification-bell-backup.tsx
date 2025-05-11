import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  fetchNotifications, 
  markAllAsRead,
  markAsRead,
  checkLowStockItems,
  clearErrors,
  resetAllNotifications
} from '@/store/slices/notificationSlice';
import NotificationItem from './notification-item';
import { Notification } from '@/lib/models/Notification';

export default function NotificationBell() {
  const dispatch = useAppDispatch();
  const { items: notifications, unreadCount, status } = useAppSelector(state => state.notifications);
  const [open, setOpen] = useState(false);
  const [localUnreadCount, setLocalUnreadCount] = useState(0);
  const badgeRef = useRef<HTMLDivElement>(null);
  
  // Initialize notifications on mount
  useEffect(() => {
    console.log("Initializing notification system");
    dispatch(fetchNotifications());
    
    // Create a polling mechanism to keep notifications up to date
    // Use a longer interval to avoid race conditions and frequent UI changes
    const checkInterval = setInterval(() => {
      if (!open) { // Only refresh when dropdown is closed
        dispatch(fetchNotifications());
      }
    }, 10000); // Increased to 10 seconds
    
    // Check low stock once at initialization
    dispatch(checkLowStockItems());
    
    // Check low stock items every 30 seconds to avoid UI flicker
    const lowStockInterval = setInterval(() => {
      if (!open) { // Only check when dropdown is closed
        dispatch(checkLowStockItems());
      }
    }, 30000);
    
    return () => {
      clearInterval(checkInterval);
      clearInterval(lowStockInterval);
    };
  }, [dispatch]);
  
  // Update local unread count when Redux state changes
  useEffect(() => {
    setLocalUnreadCount(unreadCount);
    console.log("Updated local unread count:", unreadCount);
  }, [unreadCount]);
  
  // Ensure dropdown is up-to-date when opened
  useEffect(() => {
    if (open) {
      // Fetch latest notifications when dropdown opens
      dispatch(fetchNotifications());
    }
  }, [open, dispatch]);
  
  // Function to handle notification click
  const handleNotificationClick = async (notification: Notification, event?: React.MouseEvent) => {
    console.log('===== START Notification Click =====');
    console.log('Clicked notification:', {id: notification.id, title: notification.title, isRead: notification.isRead});
    
    // Prevent closing the dropdown while processing
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (!notification.isRead) {
      try {
        console.log('Notification is unread, marking as read...');
        
        // Close dropdown first to prevent race conditions and multiple clicks
        setOpen(false);
        
        // Update local state immediately for better UX
        console.log('Previous localUnreadCount:', localUnreadCount);
        setLocalUnreadCount(prev => Math.max(0, prev - 1));
        console.log('Updated localUnreadCount (state update scheduled)');
        
        // Mark as read directly in Redux first
        console.log('Starting Redux markAsRead dispatch...');
        await dispatch(markAsRead(notification.id)).unwrap();
        console.log('Redux markAsRead completed');
        
        // Force refresh notifications to ensure UI is up-to-date
        console.log('Forcing refresh of notifications...');
        await dispatch(fetchNotifications()).unwrap();
        
        console.log('Successfully completed all steps for marking notification as read:', notification.id);
      } catch (error) {
        console.error('ERROR in handleNotificationClick:', error);
        // Log the exact error type and message
        if (error instanceof Error) {
          console.error('Error type:', error.constructor.name);
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        }
        
        // Rollback local state if there was an error
        console.log('Rolling back localUnreadCount due to error');
        dispatch(fetchNotifications());
      } finally {
        console.log('===== END Notification Click =====');
      }
    } else {
      console.log('Notification already read, skipping mark as read process');
      setOpen(false);
      console.log('===== END Notification Click =====');
    }
    
    // Navigate if there's an action link
    if (notification.actionLink) {
      console.log('Navigating to:', notification.actionLink);
      window.location.href = notification.actionLink;
    }
  };
  
  // Nuclear reset function
  const handleReset = () => {
    console.log("Executing nuclear reset of notifications");
    
    // Clear local state immediately
    setLocalUnreadCount(0);
    
    // Hide badge immediately for better UX
    if (badgeRef.current) {
      badgeRef.current.style.display = 'none';
    }
    
    // Use Redux action for persistent storage
    dispatch(resetAllNotifications())
      .then(() => {
        console.log("Nuclear reset completed");
        dispatch(fetchNotifications());
        setOpen(false);
      });
  };

  return (
    <DropdownMenu open={open} onOpenChange={(isOpen) => {
      // When opening the dropdown, force refresh
      if (isOpen) {
        dispatch(fetchNotifications());
      }
      setOpen(isOpen);
    }}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {localUnreadCount > 0 && (
            <div ref={badgeRef}>
              <Badge 
                className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-5 min-h-5 flex items-center justify-center notification-badge"
                variant="destructive"
              >
                {localUnreadCount}
              </Badge>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <div className="flex gap-2">
            {localUnreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-7"
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  try {
                    console.log('Marking all notifications as read...');
                    await dispatch(markAllAsRead()).unwrap();
                    
                    // Update local state immediately
                    setLocalUnreadCount(0);
                    
                    // Force refresh
                    dispatch(fetchNotifications());
                    
                    console.log('Successfully marked all notifications as read');
                    
                    // Close the dropdown after a brief delay
                    setTimeout(() => setOpen(false), 500);
                  } catch (error) {
                    console.error('Error marking all as read:', error);
                  }
                }}
              >
                Mark all as read
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              className="text-xs h-7"
              onClick={handleReset}
              title="Emergency reset of all notifications"
            >
              Reset
            </Button>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {status === 'loading' ? (
          <div className="p-4 text-center text-muted-foreground">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">No notifications</div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id}
                className={`flex flex-col items-start p-3 cursor-pointer ${!notification.isRead ? 'bg-muted/50' : ''}`}
                onSelect={(event) => {
                  // Prevent default selection behavior which might interfere
                  event.preventDefault();
                  
                  // Immediately close dropdown
                  setOpen(false);
                  
                  // Then handle the notification
                  handleNotificationClick(notification);
                }}
              >
                <NotificationItem notification={notification} />
              </DropdownMenuItem>
            ))}
          </div>
        )}
        
        {notifications.length > 0 && (
          <div className="text-xs text-center text-muted-foreground p-2 border-t">
            {localUnreadCount > 0 
              ? `You have ${localUnreadCount} unread notification${localUnreadCount !== 1 ? 's' : ''}`
              : 'All caught up!'}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 