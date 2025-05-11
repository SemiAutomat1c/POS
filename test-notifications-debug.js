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