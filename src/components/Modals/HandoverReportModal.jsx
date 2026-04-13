import { useState } from 'react';
import PropTypes from 'prop-types';
import { X, Copy, Check, Send, FileText, Loader2 } from 'lucide-react';
import { sendWhatsAppAlert } from '../../services/whatsapp';

export default function HandoverReportModal({ open, onClose, patient, reportText, isGenerating }) {
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!open) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = reportText;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleWhatsApp = async () => {
    setSending(true);
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const msg = `NAYANA HANDOVER REPORT\n\nPatient: ${patient?.name || 'Unknown'} | Room: ${patient?.room || 'Unknown'}\nTime: ${time}\n\n${reportText}\n\nPowered by Nayana Clinical AAC System`;
    await sendWhatsAppAlert(msg);
    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-[28px] border border-white/10 bg-[#0a0a0a] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-medical/10 border border-medical/20">
              <FileText size={16} className="text-medical" />
            </div>
            <div>
              <h2 className="font-display text-sm font-bold text-white uppercase tracking-widest">
                Shift Handover Report
              </h2>
              <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mt-0.5">
                {patient?.name} · {patient?.room} · {new Date().toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Report Body */}
        <div className="px-8 py-6 min-h-[200px]">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 size={32} className="text-medical animate-spin" />
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest">
                Generating Clinical Report…
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
              <p className="text-sm text-white/80 leading-loose font-medium whitespace-pre-wrap">
                {reportText || 'No report data available.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isGenerating && reportText && (
          <div className="flex items-center gap-3 px-8 py-5 border-t border-white/[0.06]">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white/60 hover:text-white hover:border-white/20 transition-all uppercase tracking-widest"
            >
              {copied ? <Check size={14} className="text-stable-green" /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy Text'}
            </button>
            <button
              onClick={handleWhatsApp}
              disabled={sending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-medical/30 bg-medical/10 text-xs font-bold text-medical hover:bg-medical/20 transition-all uppercase tracking-widest disabled:opacity-50"
            >
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {sent ? 'Sent!' : sending ? 'Sending…' : 'Send via WhatsApp'}
            </button>
            <div className="ml-auto text-[10px] font-mono text-white/20 uppercase">
              AI-generated · verify before clinical use
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

HandoverReportModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  patient: PropTypes.object,
  reportText: PropTypes.string,
  isGenerating: PropTypes.bool,
};
