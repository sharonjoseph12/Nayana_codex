/**
 * Nayana Clinical Cloud Sync Service (Phase 31)
 * --------------------------------------------
 * Handles ward-wide bedside synchronization and remote family advocacy.
 */

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY;

class CloudSyncService {
  constructor() {
    this.isCloudEnabled = !!(SUPABASE_URL && SUPABASE_KEY);
    this.localChannel = new BroadcastChannel('nayana_comms');
    this.subscribers = new Set();
    this.heartbeatInterval = null;

    if (!this.isCloudEnabled) {
      console.warn('NAYANA: Local P2P Sync Active. (Cloud restricted)');
    }
  }

  /**
   * Broadcasts bedside state to the entire ward and remote portal.
   */
  async broadcastState(state) {
    const payload = { 
      ...state, 
      timestamp: Date.now(),
      tabId: window.__nayana_tab_id 
    };

    this.localChannel.postMessage(payload);

    if (this.isCloudEnabled) {
      // Future: Post to Supabase 'realtime' channel
    }
  }

  /**
   * Starts clinical heartbeat watchdog.
   */
  startHeartbeat(roomId) {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = setInterval(() => {
      this.broadcastState({ type: 'HEARTBEAT', roomId, patientId: roomId });
    }, 5000);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
  }

  /**
   * Send a direct command/response.
   */
  sendCommand(targetRoom, command) {
     this.localChannel.postMessage({ 
       type: 'CAREGIVER_RESPONSE', 
       target: targetRoom, 
       timestamp: Date.now(),
       ...command 
     });
  }

  /**
   * Phase 31: Send a Digital Hug from family portal to patient.
   */
  sendFamilyHug(roomId) {
     this.broadcastState({ 
        type: 'FAMILY_HUG', 
        roomId, 
        timestamp: Date.now() 
     });
  }

  subscribe(callback) {
    const wrapper = (event) => callback(event.data);
    this.localChannel.addEventListener('message', wrapper);
    return () => this.localChannel.removeEventListener('message', wrapper);
  }
}

export const cloudSync = new CloudSyncService();
