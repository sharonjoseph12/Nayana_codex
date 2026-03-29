import Peer from 'peerjs';
import { v4 as uuidv4 } from 'uuid';

class WebRTCManager {
  constructor() {
    this.peer = null;
    this.connection = null;
    this.isHost = false;
    this.sessionId = null;
    this.listeners = [];
  }

  generateSessionId() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code
  }

  async initHost() {
    this.isHost = true;
    this.sessionId = this.generateSessionId();
    
    return new Promise((resolve, reject) => {
      this.peer = new Peer(`nayana-host-${this.sessionId}`); // Add prefix to avoid collisions on public server
      
      this.peer.on('open', (id) => {
        console.log('Host Peer open with ID:', id);
        resolve(this.sessionId);
      });

      this.peer.on('connection', (conn) => {
        console.log('Remote Caretaker Connected');
        this.connection = conn;
        this.setupConnectionLogic();
      });

      this.peer.on('error', (err) => {
        console.error('Peer error:', err);
        reject(err);
      });
    });
  }

  async connectToHost(sessionCode) {
    this.isHost = false;
    
    return new Promise((resolve, reject) => {
      this.peer = new Peer(`nayana-remote-${uuidv4()}`);
      
      this.peer.on('open', (id) => {
        console.log('Remote Peer open with ID:', id);
        this.connection = this.peer.connect(`nayana-host-${sessionCode}`);
        
        this.connection.on('open', () => {
          console.log('Connected to Host');
          this.setupConnectionLogic();
          resolve(true);
        });

        this.connection.on('error', (err) => {
          reject(err);
        });
      });

      this.peer.on('error', (err) => {
        console.error('Peer error:', err);
        reject(err);
      });
    });
  }

  setupConnectionLogic() {
    this.connection.on('data', (data) => {
      this.notifyListeners(data);
    });

    this.connection.on('close', () => {
      console.log('Connection closed');
      this.notifyListeners({ type: 'CONNECTION_CLOSED' });
    });
  }

  sendData(data) {
    if (this.connection && this.connection.open) {
      this.connection.send(data);
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notifyListeners(data) {
    this.listeners.forEach(cb => cb(data));
  }

  disconnect() {
    if (this.connection) this.connection.close();
    if (this.peer) this.peer.destroy();
    this.connection = null;
    this.peer = null;
  }
}

export const webrtcManager = new WebRTCManager();
