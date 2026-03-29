import { Routes, Route } from 'react-router-dom';
import PatientApp from './PatientApp';
import RemoteCaretakerLogin from './components/Pages/RemoteCaretakerLogin';
import RemoteCaretakerDashboard from './components/Pages/RemoteCaretakerDashboard';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PatientApp />} />
      <Route path="/caretaker" element={<RemoteCaretakerLogin />} />
      <Route path="/caretaker/dashboard" element={<RemoteCaretakerDashboard />} />
    </Routes>
  );
}
