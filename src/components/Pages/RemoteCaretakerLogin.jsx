import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { webrtcManager } from '../../services/webrtc';

export default function RemoteCaretakerLogin() {
  const [sessionCode, setSessionCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleConnect = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!sessionCode.trim() || sessionCode.trim().length !== 6) {
      setError('Please enter a valid 6-digit session code.');
      return;
    }

    setLoading(true);
    try {
      await webrtcManager.connectToHost(sessionCode.trim());
      navigate('/caretaker/dashboard');
    } catch (err) {
      console.error(err);
      setError('Failed to connect to Patient session. Ensure the code is correct and the patient is online.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-[#070707] text-white">
      <div className="w-full max-w-md rounded-[20px] border border-white/10 bg-[#121212] p-8 shadow-2xl">
        <h1 className="mb-2 font-syne text-2xl font-bold">Caretaker Remote Sync</h1>
        <p className="mb-6 font-mono text-xs text-white/40">Enter the 6-digit session code displayed on the patient's local device to connect to their live data stream.</p>
        
        {error ? <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">{error}</div> : null}
        
        <form onSubmit={handleConnect}>
          <div className="mb-6">
            <label className="mb-2 block font-mono text-xs font-bold tracking-widest text-white/30 uppercase">Session Code</label>
            <input
              type="text"
              className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-center font-mono text-2xl tracking-[0.5em] text-white outline-none focus:border-[#00d4ff]/50 focus:bg-white/10 transition-colors"
              placeholder="000000"
              maxLength={6}
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#bf80ff] px-4 py-4 font-syne font-bold text-black shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:shadow-[0_0_30px_rgba(0,212,255,0.5)] transition-all disabled:opacity-50"
          >
            {loading ? 'Connecting securely...' : 'Connect to Patient Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
