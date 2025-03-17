
import { saveChannelsToStorage } from '../../dataStore';
import { syncAllData } from '../coreSync';

// Function for direct and strong broadcasting to all browsers
export const forceBroadcastToAllBrowsers = async (): Promise<boolean> => {
  console.log('بدء النشر القسري والقوي لجميع المتصفحات...');
  
  try {
    // 1. Save current data
    saveChannelsToStorage();
    
    // 2. Create unique update ID
    const updateId = Date.now().toString() + '_' + Math.random().toString(36).substring(2, 9);
    
    // 3. Send multiple diverse signals
    const signals = [
      { key: 'force_browser_refresh', value: 'true' },
      { key: 'bladi_force_refresh', value: 'true' },
      { key: 'data_version', value: updateId },
      { key: 'bladi_info_update', value: updateId },
      { key: 'channels_last_update', value: updateId },
      { key: 'update_broadcast_id', value: updateId },
      { key: 'force_update', value: 'true' },
      { key: 'refresh_timestamp', value: updateId }
    ];
    
    // Apply signals sequentially with short time intervals
    let delay = 0;
    const step = 100; // 100 milliseconds between each signal
    
    for (const signal of signals) {
      setTimeout(() => {
        localStorage.setItem(signal.key, signal.value);
        console.log(`تم إرسال إشارة: ${signal.key} = ${signal.value}`);
      }, delay);
      delay += step;
    }
    
    // 4. Apply forced sync
    setTimeout(async () => {
      await syncAllData(true);
      
      // 5. Send final signal after sync completion
      localStorage.setItem('sync_complete', updateId);
      localStorage.setItem('force_browser_refresh', 'true');
      
      // 6. Force reload of current page
      setTimeout(() => {
        window.location.href = window.location.href.split('?')[0] + '?refresh=' + updateId;
      }, 1500);
    }, delay + 200);
    
    return true;
  } catch (error) {
    console.error('فشل في النشر القسري:', error);
    return false;
  }
};
