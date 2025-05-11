// ========================================================
// Notification System Diagnostic & Repair Utility
// Run this in the browser console to find and fix issues
// ========================================================

function fixNotificationDuplicates() {
  console.group('🔧 Notification System Repair Utility');
  console.log('Starting diagnostic scan at:', new Date().toLocaleString());
  
  // Open the database
  const request = indexedDB.open('posSystemDB', 1);
  
  request.onerror = function(event) {
    console.error("Error opening database:", event);
    console.groupEnd();
  };
  
  request.onsuccess = function(event) {
    const db = event.target.result;
    
    // Function to get all notifications
    const getAllNotifications = () => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['notifications'], 'readonly');
        const store = transaction.objectStore('notifications');
        const request = store.getAll();
        
        request.onerror = (event) => reject(event.target.error);
        request.onsuccess = (event) => resolve(event.target.result);
      });
    };
    
    // Function to delete a notification
    const deleteNotification = (id) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['notifications'], 'readwrite');
        const store = transaction.objectStore('notifications');
        const request = store.delete(id);
        
        request.onerror = (event) => reject(event.target.error);
        request.onsuccess = (event) => resolve(true);
      });
    };
    
    // Start the diagnostic process
    getAllNotifications().then(async (notifications) => {
      console.log(`Found ${notifications.length} total notifications`);
      console.log(`Unread count: ${notifications.filter(n => !n.isRead).length}`);
      
      // Group by related item
      const byRelatedItem = {};
      const notificationsToRemove = [];
      
      // First, organize notifications by related item
      notifications.forEach(notification => {
        if (notification.type === 'low_stock' && notification.relatedItemId) {
          const key = notification.relatedItemId.toString();
          if (!byRelatedItem[key]) {
            byRelatedItem[key] = [];
          }
          byRelatedItem[key].push(notification);
        }
      });
      
      // Check for duplicates
      let duplicatesFound = 0;
      
      Object.entries(byRelatedItem).forEach(([itemId, notifs]) => {
        if (notifs.length > 1) {
          // Sort by creation date (newest first)
          notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          
          console.log(`Found ${notifs.length} notifications for product ${itemId}:`);
          notifs.forEach((n, i) => {
            const date = new Date(n.createdAt);
            console.log(`  ${i}. ID: ${n.id}, Title: "${n.title}", Created: ${date.toLocaleString()}, Read: ${n.isRead}`);
            
            // Keep the newest notification and mark others for removal
            if (i > 0) {
              notificationsToRemove.push(n.id);
              duplicatesFound++;
            }
          });
        }
      });
      
      if (duplicatesFound === 0) {
        console.log('✅ No duplicate notifications found');
        console.groupEnd();
        return;
      }
      
      console.log(`Found ${duplicatesFound} duplicate notifications to clean up`);
      
      // Ask for confirmation
      const shouldProceed = confirm(
        `Found ${duplicatesFound} duplicate notifications. Do you want to remove them?\n` +
        "Click OK to proceed with cleanup, or Cancel to abort."
      );
      
      if (!shouldProceed) {
        console.log('⏹️ Cleanup aborted by user');
        console.groupEnd();
        return;
      }
      
      // Delete the duplicate notifications
      console.log('Removing duplicate notifications...');
      let successCount = 0;
      let errorCount = 0;
      
      for (const id of notificationsToRemove) {
        try {
          await deleteNotification(id);
          successCount++;
          console.log(`✓ Deleted notification ${id}`);
        } catch (error) {
          errorCount++;
          console.error(`✗ Failed to delete notification ${id}:`, error);
        }
      }
      
      console.log(`Cleanup completed: ${successCount} notifications removed, ${errorCount} errors`);
      
      // Verify final state
      const finalNotifications = await getAllNotifications();
      console.log(`Final notification count: ${finalNotifications.length}`);
      console.log(`Final unread count: ${finalNotifications.filter(n => !n.isRead).length}`);
      
      console.groupEnd();
      
      alert(`Notification system cleanup complete!\n\n${successCount} duplicate notifications removed.\n\nRefresh the page to see the changes.`);
    }).catch(error => {
      console.error('Error during notification cleanup:', error);
      console.groupEnd();
      alert('An error occurred during notification cleanup. Check the console for details.');
    });
  };
}

// Run the utility
fixNotificationDuplicates(); 