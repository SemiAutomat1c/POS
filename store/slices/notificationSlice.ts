import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Notification } from '@/lib/models/Notification';
import { 
  getNotifications, 
  getUnreadNotifications,
  addNotification, 
  updateNotification, 
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  generateLowStockNotifications,
  forceResetAllNotifications
} from '@/lib/db-models';

interface NotificationState {
  items: Notification[];
  unreadCount: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
  status: 'idle',
  error: null
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async () => {
    return await getNotifications();
  }
);

export const fetchUnreadNotifications = createAsyncThunk(
  'notifications/fetchUnread',
  async () => {
    return await getUnreadNotifications();
  }
);

export const createNotification = createAsyncThunk(
  'notifications/create',
  async (notification: Omit<Notification, 'id'>) => {
    return await addNotification(notification);
  }
);

export const updateNotificationData = createAsyncThunk(
  'notifications/update',
  async (notification: Notification) => {
    return await updateNotification(notification);
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id: number, { rejectWithValue, getState, dispatch }) => {
    try {
      console.log('===== START Redux markAsRead thunk =====', id);
      
      // Log current state
      const state = getState() as { notifications: NotificationState };
      const notifInState = state.notifications.items.find(n => n.id === id);
      console.log('Current notification in Redux state:', 
        notifInState ? { id: notifInState.id, isRead: notifInState.isRead } : 'Not found');
      
      // If already read, no need to proceed
      if (notifInState?.isRead) {
        console.log('Notification already marked as read, skipping DB update');
        console.log('===== END Redux markAsRead thunk (ALREADY READ) =====');
        return notifInState;
      }
      
      console.log('Calling markNotificationAsRead in DB layer');
      const updatedNotification = await markNotificationAsRead(id);
      
      if (!updatedNotification) {
        console.error('Failed to mark notification as read - no response from DB:', id);
        console.log('===== END Redux markAsRead thunk (DB RESPONSE EMPTY) =====');
        return rejectWithValue('Failed to mark notification as read - not found in database');
      }
      
      console.log('Successfully marked notification as read in DB:', id, {
        id: updatedNotification.id,
        isRead: updatedNotification.isRead,
        title: updatedNotification.title
      });
      
      // After successfully marking a notification as read,
      // force fetch all notifications to ensure UI consistency
      dispatch(fetchNotifications());
      
      console.log('===== END Redux markAsRead thunk (SUCCESS) =====');
      return updatedNotification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      
      // More detailed error logging
      if (error instanceof Error) {
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      console.log('===== END Redux markAsRead thunk (ERROR) =====');
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async () => {
    await markAllNotificationsAsRead();
    return true;
  }
);

export const removeNotification = createAsyncThunk(
  'notifications/remove',
  async (id: number) => {
    await deleteNotification(id);
    return id;
  }
);

export const clearAllNotifications = createAsyncThunk(
  'notifications/clearAll',
  async () => {
    await deleteAllNotifications();
    return true;
  }
);

export const checkLowStockItems = createAsyncThunk(
  'notifications/checkLowStock',
  async () => {
    const count = await generateLowStockNotifications();
    // After generating notifications, fetch all to update the state
    const notifications = await getNotifications();
    return notifications;
  }
);

export const resetAllNotifications = createAsyncThunk(
  'notifications/resetAll',
  async (_, { dispatch }) => {
    try {
      console.log("Starting complete notification reset");
      
      // First try to mark all as read before wiping
      await markAllNotificationsAsRead();
      
      // Now do the actual reset
      await forceResetAllNotifications();
      
      // Force trigger a refresh of the notification state
      dispatch(fetchNotifications());
      
      // Return empty array to reflect the new state
      return [];
    } catch (error) {
      console.error("Error in resetAllNotifications:", error);
      return [];
    }
  }
);

// The notifications slice
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.unreadCount = action.payload.filter(n => !n.isRead).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch notifications';
      })
      
      // Fetch unread notifications
      .addCase(fetchUnreadNotifications.fulfilled, (state, action) => {
        state.unreadCount = action.payload.length;
      })
      
      // Create notification
      .addCase(createNotification.fulfilled, (state, action) => {
        if (action.payload) {
          state.items.unshift(action.payload);
          if (!action.payload.isRead) {
            state.unreadCount += 1;
          }
        }
      })
      
      // Update notification
      .addCase(updateNotificationData.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.items.findIndex(item => item.id === action.payload?.id);
          if (index !== -1) {
            // If a notification was changed from unread to read, decrement unread count
            if (!action.payload.isRead !== !state.items[index].isRead) {
              state.unreadCount += action.payload.isRead ? -1 : 1;
            }
            state.items[index] = action.payload;
          }
        }
      })
      
      // Mark notification as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        console.log('===== START Redux reducer markAsRead.fulfilled =====');
        console.log('Payload received:', action.payload ? {
          id: action.payload.id,
          isRead: action.payload.isRead
        } : 'No payload');
        
        if (action.payload) {
          const index = state.items.findIndex(item => item.id === action.payload?.id);
          console.log('Found notification at index:', index);
          
          if (index !== -1) {
            // Log the before state
            console.log('Before update:', {
              id: state.items[index].id,
              isRead: state.items[index].isRead,
              unreadCount: state.unreadCount
            });
            
            // Update the notification in the state
            state.items[index] = {
              ...state.items[index],
              ...action.payload,
              isRead: true // Ensure it's marked as read
            };
            
            // Update the unread count
            const oldUnreadCount = state.unreadCount;
            state.unreadCount = state.items.filter(item => !item.isRead).length;
            
            console.log('After update:', {
              id: state.items[index].id,
              isRead: state.items[index].isRead,
              unreadCountBefore: oldUnreadCount,
              unreadCountAfter: state.unreadCount,
              unreadCountChange: oldUnreadCount - state.unreadCount
            });
            
            console.log('Updated notification in state, new unread count:', state.unreadCount);
          } else {
            console.warn('Notification not found in state:', action.payload?.id);
          }
        } else {
          console.warn('No payload returned from markAsRead');
        }
        
        console.log('===== END Redux reducer markAsRead.fulfilled =====');
      })
      
      // Mark all notifications as read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items.forEach(item => {
          item.isRead = true;
        });
        state.unreadCount = 0;
      })
      
      // Remove notification
      .addCase(removeNotification.fulfilled, (state, action) => {
        const removedItem = state.items.find(item => item.id === action.payload);
        state.items = state.items.filter(item => item.id !== action.payload);
        
        // If removed item was unread, decrement the count
        if (removedItem && !removedItem.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      
      // Clear all notifications
      .addCase(clearAllNotifications.fulfilled, (state) => {
        state.items = [];
        state.unreadCount = 0;
      })
      
      // Force reset all notifications
      .addCase(resetAllNotifications.fulfilled, (state) => {
        state.items = [];
        state.unreadCount = 0;
        console.log('Reset all notifications in Redux state');
      })
      
      // Check low stock items
      .addCase(checkLowStockItems.fulfilled, (state, action) => {
        state.items = action.payload;
        state.unreadCount = action.payload.filter(n => !n.isRead).length;
      });
  }
});

export const { clearErrors } = notificationsSlice.actions;
export default notificationsSlice.reducer; 