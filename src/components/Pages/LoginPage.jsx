import { useState } from 'react';
import PropTypes from 'prop-types';
import { Stethoscope, User, Building2, UserCog, Phone, Calendar, ArrowRight } from 'lucide-react';

const FIELDS = [
  { key: 'name', label: 'Patient Name', placeholder: 'e.g. Arjun Mehta', icon: User, required: true },
  { key: 'age', label: 'Age', placeholder: 'e.g. 34', icon: Calendar, type: 'number', required: true },
  { key: 'condition', label: 'Condition', placeholder: 'e.g. ALS Stage 2', icon: Stethoscope, required: true },
  { key: 'room', label: 'Room / Bed', placeholder: 'e.g. ICU-7', icon: Building2, required: true },
  { key: 'caregiver', label: 'Caregiver Name', placeholder: 'e.g. Dr. Priya Sharma', icon: UserCog, required: true },
  { key: 'caregiverPhone', label: 'Caregiver Phone', placeholder: '+91XXXXXXXXXX', icon: Phone, required: false },
];

export default function LoginPage({ onLogin }) {
  const [form, setForm] = useState({
    name: '',
    age: '',
    condition: '',
    room: '',
    caregiver: '',
    caregiverPhone: '',
  });

  const [touched, setTouched] = useState({});

  const canSubmit = FIELDS.filter((f) => f.required).every((f) => form[f.key]?.toString().trim());

  function handleChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleBlur(key) {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    onLogin({
      ...form,
      age: Number(form.age),
      caregiverPhone: form.caregiverPhone || '+91XXXXXXXXXX',
    });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-base">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-medical/[0.06] blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-personal/[0.05] blur-[100px]" />
        <div className="absolute right-1/3 top-1/2 h-[300px] w-[300px] rounded-full bg-social/[0.04] blur-[90px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg px-6">
        {/* Branding */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-medical/25 bg-medical/10">
            <Stethoscope size={32} className="text-medical" />
          </div>
          <h1 className="font-display text-4xl text-white">Nayana</h1>
          <p className="mt-2 text-xs uppercase tracking-[0.32em] text-medical/70">
            Assistive ICU Communication Platform
          </p>
        </div>

        {/* Login Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-[28px] border border-white/[0.08] bg-white/[0.04] p-8 shadow-glow backdrop-blur-xl"
        >
          <div className="mb-6">
            <h2 className="font-display text-xl text-white">Patient Registration</h2>
            <p className="mt-1 text-sm text-white/45">Enter patient details to begin the session</p>
          </div>

          <div className="space-y-4">
            {FIELDS.map((field) => {
              const Icon = field.icon;
              const isEmpty = touched[field.key] && field.required && !form[field.key]?.toString().trim();

              return (
                <div key={field.key}>
                  <label className="mb-1.5 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-white/45">
                    <Icon size={12} />
                    {field.label}
                    {field.required && <span className="text-emergency/70">*</span>}
                  </label>
                  <input
                    type={field.type || 'text'}
                    value={form[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    onBlur={() => handleBlur(field.key)}
                    placeholder={field.placeholder}
                    className={`w-full rounded-2xl border bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-medical/40 focus:bg-white/[0.05] ${
                      isEmpty ? 'border-emergency/30' : 'border-white/[0.08]'
                    }`}
                  />
                  {isEmpty && (
                    <p className="mt-1 text-xs text-emergency/60">This field is required</p>
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-full border border-medical/30 bg-medical/15 py-3.5 text-sm font-semibold text-medical transition hover:bg-medical/25 hover:shadow-cyan disabled:cursor-not-allowed disabled:opacity-40"
          >
            Start Session
            <ArrowRight size={18} />
          </button>

          <p className="mt-4 text-center text-xs text-white/30">
            All data stays local to this session
          </p>
        </form>
      </div>
    </div>
  );
}

LoginPage.propTypes = {
  onLogin: PropTypes.func.isRequired,
};
