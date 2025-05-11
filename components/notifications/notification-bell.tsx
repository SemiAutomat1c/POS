'use client';

import { useState, useEffect, useRef, useCallback, useTransition } from 'react';
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
import { toast } from 'sonner';

export default function NotificationBell() {
  const dispatch = useAppDispatch();
  const { items: notifications, unreadCount, status } = useAppSelector(state => state.notifications);
  const [open, setOpen] = useState(false);
  const [localUnreadCount, setLocalUnreadCount] = useState(0);
  const [prevUnreadCount, setPrevUnreadCount] = useState(0); // Track previous unread count
  const badgeRef = useRef<HTMLDivElement>(null);
  const [updateKey, setUpdateKey] = useState(0);
  const [isPending, startTransition] = useTransition();
  
  const forceUpdate = useCallback(() => {
    setUpdateKey(prev => prev + 1);
  }, []);
  
  // Initialize notifications on mount and set up polling
  useEffect(() => {
    console.log("Initializing notification system");
    
    // Initial fetch of notifications
    dispatch(fetchNotifications());
    
    // Check low stock items at startup
    dispatch(checkLowStockItems());
    
    // Set up regular polling for notifications and low stock items
    const pollInterval = setInterval(() => {
      if (!open) { // Only poll when dropdown is closed
        // First check for low stock items
        dispatch(checkLowStockItems()).then(() => {
          // Then fetch all notifications
          dispatch(fetchNotifications());
        });
      }
    }, 30000); // 30 seconds
    
    return () => clearInterval(pollInterval);
  }, [dispatch, open]);
  
  // Update local unread count when Redux state changes
  useEffect(() => {
    // Add diagnostic to log every notification we have
    console.group('📋 Current Notifications Update');
    console.log(`Previous unread count: ${prevUnreadCount}, New unread count: ${unreadCount}`);
    
    if (unreadCount > 0) {
      console.log('All unread notifications:');
      notifications
        .filter(n => !n.isRead)
        .forEach(n => {
          console.log(`ID: ${n.id} | Type: ${n.type} | Title: "${n.title}" | RelatedItem: ${n.relatedItemId} | Created: ${new Date(n.createdAt).toLocaleString()}`);
        });
    }
    
    // Detect if we have new notifications
    if (unreadCount > prevUnreadCount && prevUnreadCount !== 0) {
      console.log("🔔 New notifications detected:", unreadCount - prevUnreadCount);
      
      // Get just the new notifications
      const newNotifications = notifications.filter(n => 
        !n.isRead && 
        // Use a time-based approach - notifications created in the last 30 seconds
        (new Date().getTime() - new Date(n.createdAt).getTime() < 30000)
      );
      
      console.log("Recently created notifications:", newNotifications.length);
      newNotifications.forEach(n => {
        console.log(`New notification: ID=${n.id}, Title="${n.title}", Message="${n.message}"`);
      });
      
      // Show a toast notification
      toast("New notifications", {
        description: `You have ${unreadCount - prevUnreadCount} new notification${unreadCount - prevUnreadCount > 1 ? 's' : ''}`,
        action: {
          label: "View",
          onClick: () => setOpen(true)
        }
      });
      
      // Auto-open the dropdown after a short delay to ensure it's visible
      setTimeout(() => {
        setOpen(true);
      }, 500);
    }
    
    // Update local state
    setLocalUnreadCount(unreadCount);
    setPrevUnreadCount(unreadCount);
    console.log("Updated local unread count:", unreadCount);
    console.groupEnd();
  }, [unreadCount, prevUnreadCount, notifications]);
  
  // Ensure fresh data when opening dropdown
  useEffect(() => {
    if (open) {
      // Check for low stock items first, then fetch notifications
      dispatch(checkLowStockItems()).then(() => {
        dispatch(fetchNotifications());
      });
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
      
      // Update local state optimistically
      setLocalUnreadCount(prev => Math.max(0, prev - 1));
      
      // Close dropdown right away for better UX
      setOpen(false);
      
      // Mark as read in Redux
      console.log('Dispatching markAsRead action...');
      await dispatch(markAsRead(notification.id)).unwrap();
      console.log('Redux markAsRead completed successfully');
      
      // Force a refresh of all notifications to ensure consistent state
      await dispatch(fetchNotifications()).unwrap();
      
      // Use startTransition for smoother UI updates
      startTransition(() => {
        forceUpdate();
      });
      
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
      startTransition(() => {
        forceUpdate();
      });
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
            // Check for low stock items first
            dispatch(checkLowStockItems()).then(() => {
              // Then fetch all notifications
              dispatch(fetchNotifications());
            });
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  // Update optimistically
                  setLocalUnreadCount(0);
                  
                  // Perform the actual update
                  dispatch(markAllAsRead()).then(() => {
                    dispatch(fetchNotifications());
                    startTransition(() => {
                      forceUpdate();
                    });
                  });
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
                  
                  // Update local unread count optimistically for immediate feedback
                  if (!notification.isRead) {
                    setLocalUnreadCount(prev => Math.max(0, prev - 1));
                  }
                  
                  // Handle the notification click with a slight delay
                  // to avoid UI freezing during the state update
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