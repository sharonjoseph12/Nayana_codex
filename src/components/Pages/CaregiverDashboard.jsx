import React from 'react';
import VitalCard from '../Vitals/VitalCard';
import PainHeatmap from '../Analytics/PainHeatmap';
import LeftSidebar from '../Layout/LeftSidebar';

export default function CaregiverDashboard() {
  // Mock log for the heatmap
  const mockLog = [
    { phrase: 'Pain' },
    { phrase: 'Water' },
    { phrase: 'Pain' }
  ];

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden text-slate-900">
      <LeftSidebar />
      <div className="flex-1 p-8 grid grid-cols-12 gap-6 overflow-y-auto">
        <div className="col-span-12">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Patient Status Dashboard</h1>
          <p className="text-slate-500">Live vitals and recent activity.</p>
        </div>
        
        {/* Vitals Overview */}
        <div className="col-span-12 md:col-span-8 grid grid-cols-2 gap-6">
           <VitalCard label="Heart Rate" value="78" unit="bpm" status="normal" />
           <VitalCard label="SpO2" value="98" unit="%" status="normal" />
           <div className="col-span-2 panel p-6 min-h-[300px]">
              <h3 className="text-lg font-semibold mb-4 text-slate-800">Recent Communications</h3>
              <p className="text-slate-500 italic">No recent messages waiting.</p>
           </div>
        </div>

        {/* Right Sidebar - Analytics */}
        <div className="col-span-12 md:col-span-4 flex flex-col gap-6">
          <PainHeatmap clinicalLog={mockLog} />
        </div>
      </div>
    </div>
  );
}
