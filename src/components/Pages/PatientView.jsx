import React from 'react';
import QuadrantGrid from '../Dashboard/QuadrantGrid';
import BottomBar from '../Layout/BottomBar';

export default function PatientView() {
  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 overflow-hidden">
      <div className="flex-1 p-8">
        <QuadrantGrid />
      </div>
      <BottomBar />
    </div>
  );
}
