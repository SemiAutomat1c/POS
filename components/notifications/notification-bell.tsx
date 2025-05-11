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
  
  // Initialize notifications on mount and set up polling
  useEffect(() => {
    console.log("Initializing notification system");
    
    // Initial fetch of notifications
    dispatch(fetchNotifications());
    
    // Only check low stock items once at startup to avoid constant changes
    dispatch(checkLowStockItems());
    
    // Set up regular polling for notifications, but not too frequently
    const pollInterval = setInterval(() => {
      if (!open) { // Only poll when dropdown is closed
        dispatch(fetchNotifications());
      }
    }, 15000); // 15 seconds
    
    return () => clearInterval(pollInterval);
  }, [dispatch]);
  
  // Update local unread count when Redux state changes
  useEffect(() => {
    setLocalUnreadCount(unreadCount);
    console.log("Updated local unread count:", unreadCount);
  }, [unreadCount]);
  
  // Ensure fresh data when opening dropdown
  useEffect(() => {
    if (open) {
      dispatch(fetchNotifications());
    }
  }, [open, dispatch]);

  // Function to handle notification click
  const handleNotificationClick = async (notification: Notification, event?: React.MouseEvent) => {
    console.log('===== START Notification Click =====');
    console.log('Clicked notification:', {id: notification.id, title: notification.title, isRead: notification.isRead});
    
    // If notification is already read, just close dropdown
    if (notification.isRead) {
      console.log('Notification already read, no action needed');
      
      // Navigate if there's an action link
      if (notification.actionLink) {
        console.log('Navigating to:', notification.actionLink);
        window.location.href = notification.actionLink;
      }
      
      console.log('===== END Notification Click (already read) =====');
      return;
    }
    
    try {
      console.log('Notification is unread, marking as read...');
      
      // Mark as read in Redux
      console.log('Dispatching markAsRead action...');
      await dispatch(markAsRead(notification.id)).unwrap();
      console.log('Redux markAsRead completed successfully');
      
      // Force a refresh of all notifications to ensure consistent state
      await dispatch(fetchNotifications()).unwrap();
      
      console.log('Successfully completed all steps for marking notification as read:', notification.id);
      
      // Navigate if there's an action link
      if (notification.actionLink) {
        console.log('Navigating to:', notification.actionLink);
        window.location.href = notification.actionLink;
      }
    } catch (error) {
      console.error('ERROR in handleNotificationClick:', error);
      
      // Restore state by forcing refresh
      dispatch(fetchNotifications());
    } finally {
      console.log('===== END Notification Click =====');
    }
  };
  
  // Nuclear reset function
  const handleReset = async () => {
    console.log("Executing nuclear reset of notifications");
    
    try {
      // Close dropdown first
      setOpen(false);
      
      // Clear local state immediately
      setLocalUnreadCount(0);
      
      // Use Redux action for persistent storage
      await dispatch(resetAllNotifications()).unwrap();
      console.log("Nuclear reset completed");
      
      // Refresh notifications
      dispatch(fetchNotifications());
    } catch (error) {
      console.error("Error in reset:", error);
    }
  };

  return (
    <DropdownMenu 
      open={open} 
      onOpenChange={(isOpen) => {
        // Only set open state if it's changing to true
        // This prevents the dropdown from closing when clicking inside
        if (isOpen !== open) {
          setOpen(isOpen);
          
          // When opening the dropdown, force refresh
          if (isOpen) {
            dispatch(fetchNotifications());
          }
        }
      }}
    >
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
                    
                    // First close dropdown
                    setOpen(false);
                    
                    // Mark all as read
                    await dispatch(markAllAsRead()).unwrap();
                    
                    // Set local count to zero
                    setLocalUnreadCount(0);
                    
                    // Refresh notifications to ensure consistent state
                    dispatch(fetchNotifications());
                    
                    console.log('Successfully marked all notifications as read');
                  } catch (error) {
                    console.error('Error marking all as read:', error);
                    
                    // Refresh to ensure correct state
                    dispatch(fetchNotifications());
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
                  // Prevent default selection behavior
                  event.preventDefault();
                  
                  // Close the dropdown immediately
                  setOpen(false);
                  
                  // Only then handle the notification click
                  setTimeout(() => {
                    handleNotificationClick(notification);
                  }, 10);
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