// This file contains debugging utilities for notifications
// Run this in your browser console to debug notification issues

// Helper function to print current notification state
function debugNotifications() {
  console.group('🔍 Notification System Debug');
  
  // Access IndexedDB directly
  const request = indexedDB.open("gadgetTrackDB", 3);
  
  request.onerror = function(event) {
    console.error("Error opening database:", event);
    console.groupEnd();
  };
  
  request.onsuccess = function(event) {
    const db = request.result;
    
    // Get all notifications
    const transaction = db.transaction(["notifications"], "readonly");
    const objectStore = transaction.objectStore("notifications");
    const getAllRequest = objectStore.getAll();
    
    getAllRequest.onsuccess = function(event) {
      const notifications = getAllRequest.result;
      console.log("Total notifications:", notifications.length);
      console.log("Unread count:", notifications.filter(n => !n.isRead).length);
      
      console.group('📋 All Notifications');
      notifications.forEach(n => {
        console.log(
          `ID: ${n.id} | Type: ${n.type} | Title: ${n.title} | Read: ${n.isRead} | RelatedItem: ${n.relatedItemId}`
        );
      });
      console.groupEnd();
      
      // Check for potential issues
      const issues = [];
      
      // Check for duplicate relatedItemIds
      const itemIdCounts = {};
      notifications
        .filter(n => n.type === 'low_stock')
        .forEach(n => {
          if (n.relatedItemId) {
            itemIdCounts[n.relatedItemId] = (itemIdCounts[n.relatedItemId] || 0) + 1;
          }
        });
      
      Object.entries(itemIdCounts).forEach(([itemId, count]) => {
        if (count > 1) {
          issues.push(`Found ${count} notifications for the same product ID: ${itemId}`);
        }
      });
      
      if (issues.length > 0) {
        console.group('⚠️ Potential Issues');
        issues.forEach(issue => console.warn(issue));
        console.groupEnd();
      } else {
        console.log('✅ No obvious issues detected');
      }
      
      console.groupEnd();
    };
  };
}

// Function to fix common notification issues
function fixNotificationIssues() {
  console.group('🔧 Notification System Repair');
  
  // Access IndexedDB directly
  const request = indexedDB.open("gadgetTrackDB", 3);
  
  request.onerror = function(event) {
    console.error("Error opening database:", event);
    console.groupEnd();
  };
  
  request.onsuccess = function(event) {
    const db = request.result;
    
    // Get all notifications
    const transaction = db.transaction(["notifications"], "readwrite");
    const objectStore = transaction.objectStore("notifications");
    const getAllRequest = objectStore.getAll();
    
    getAllRequest.onsuccess = function(event) {
      const notifications = getAllRequest.result;
      console.log(`Found ${notifications.length} notifications`);
      
      // Fix 1: Mark all as read
      let fixedCount = 0;
      notifications.forEach(n => {
        if (!n.isRead) {
          n.isRead = true;
          objectStore.put(n);
          fixedCount++;
        }
      });
      console.log(`Marked ${fixedCount} notifications as read`);
      
      // Fix 2: Remove duplicates for same product
      const seenItems = new Set();
      const duplicates = [];
      
      notifications
        .filter(n => n.type === 'low_stock')
        .sort((a, b) => b.id - a.id) // Sort by ID descending (keep newest)
        .forEach(n => {
          if (n.relatedItemId) {
            const key = `${n.type}_${n.relatedItemId}`;
            if (seenItems.has(key)) {
              duplicates.push(n.id);
            } else {
              seenItems.add(key);
            }
          }
        });
      
      duplicates.forEach(id => {
        objectStore.delete(id);
      });
      console.log(`Removed ${duplicates.length} duplicate notifications`);
      
      transaction.oncomplete = function() {
        console.log("✅ Fixes applied successfully");
        console.groupEnd();
      };
    };
  };
}

// Helper to completely reset notifications
function resetAllNotifications() {
  console.group('🧨 Notification System Reset');
  
  const request = indexedDB.open("gadgetTrackDB", 3);
  
  request.onsuccess = function(event) {
    const db = request.result;
    const transaction = db.transaction(["notifications"], "readwrite");
    const objectStore = transaction.objectStore("notifications");
    
    const clearRequest = objectStore.clear();
    
    clearRequest.onsuccess = function() {
      console.log("✅ All notifications cleared successfully");
      console.groupEnd();
    };
    
    clearRequest.onerror = function(event) {
      console.error("Error clearing notifications:", event);
      console.groupEnd();
    };
  };
  
  request.onerror = function(event) {
    console.error("Error opening database:", event);
    console.groupEnd();
  };
}

// Notification diagnostics tool
// Run this in the browser console on any page of the application to debug notification issues

function debugNotificationDuplicates() {
  console.group('🔍 Notification Duplication Analysis');
  
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
    
    // Analyze notifications for duplicates
    getAllNotifications().then(notifications => {
      console.log(`Total notifications in database: ${notifications.length}`);
      console.log(`Unread notifications: ${notifications.filter(n => !n.isRead).length}`);
      
      // Group notifications by related item
      const groupedByItem = {};
      notifications.forEach(n => {
        if (n.relatedItemId) {
          if (!groupedByItem[n.relatedItemId]) {
            groupedByItem[n.relatedItemId] = [];
          }
          groupedByItem[n.relatedItemId].push(n);
        }
      });
      
      // Check for duplicates
      console.log('Analyzing notifications by related item:');
      let totalDuplicates = 0;
      
      Object.entries(groupedByItem).forEach(([itemId, notifs]) => {
        if (notifs.length > 1) {
          totalDuplicates += notifs.length - 1;
          console.log(`Product ID: ${itemId} has ${notifs.length} notifications:`);
          
          // Sort by creation date (newest first)
          notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          
          // Log each notification
          notifs.forEach((n, i) => {
            console.log(`  ${i+1}. ID: ${n.id}, Title: ${n.title}, Message: ${n.message}, Created: ${new Date(n.createdAt).toLocaleString()}, Read: ${n.isRead}`);
          });
          
          // Check if messages are the same
          const messages = new Set(notifs.map(n => n.message));
          if (messages.size === 1) {
            console.warn(`  ⚠️ All ${notifs.length} notifications have identical messages`);
          } else {
            console.log(`  ℹ️ Found ${messages.size} different messages for this product`);
          }
        }
      });
      
      if (totalDuplicates === 0) {
        console.log('✅ No duplicate notifications found by related item');
      } else {
        console.warn(`⚠️ Found ${totalDuplicates} duplicate notifications`);
      }
      
      // Check for notifications created within a short time span
      const timeWindow = 10000; // 10 seconds
      const timeGroups = [];
      
      // Sort all notifications by time
      const sortedNotifications = [...notifications].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      let currentGroup = [sortedNotifications[0]];
      
      for (let i = 1; i < sortedNotifications.length; i++) {
        const prev = new Date(sortedNotifications[i-1].createdAt).getTime();
        const curr = new Date(sortedNotifications[i].createdAt).getTime();
        
        if (curr - prev < timeWindow) {
          currentGroup.push(sortedNotifications[i]);
        } else {
          if (currentGroup.length > 1) {
            timeGroups.push([...currentGroup]);
          }
          currentGroup = [sortedNotifications[i]];
        }
      }
      
      if (currentGroup.length > 1) {
        timeGroups.push(currentGroup);
      }
      
      if (timeGroups.length > 0) {
        console.log(`Found ${timeGroups.length} groups of notifications created within ${timeWindow/1000} seconds of each other:`);
        
        timeGroups.forEach((group, i) => {
          console.log(`Group ${i+1}: ${group.length} notifications created around ${new Date(group[0].createdAt).toLocaleString()}`);
          group.forEach(n => {
            console.log(`  - ID: ${n.id}, Title: ${n.title}, RelatedItemId: ${n.relatedItemId}, Created: ${new Date(n.createdAt).toLocaleString()}`);
          });
        });
      } else {
        console.log('✅ No groups of notifications created within a short time span');
      }
      
      console.groupEnd();
    }).catch(error => {
      console.error('Error retrieving notifications:', error);
      console.groupEnd();
    });
  };
}

// Execute the diagnostics function
debugNotificationDuplicates();

// Print instructions
console.log(`
🔔 Notification Debugging Tools 🔔
----------------------------------
Run these functions to debug notification issues:

debugNotifications() - Show current notification state
fixNotificationIssues() - Attempt to fix common issues
resetAllNotifications() - Nuclear option: delete all notifications

Example usage:
  debugNotifications()
`); 