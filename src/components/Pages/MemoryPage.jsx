import React from 'react';
import PropTypes from 'prop-types';
import { Heart, User, Star, Camera } from 'lucide-react';

const FAMILY_MEMBERS = [
  { id: 'mem-1', name: 'Meera (Wife)', relationship: 'Wife', message: 'Hi Arjun, I am counting down the days until you are home. Stay strong.', color: '#ffb700' },
  { id: 'mem-2', name: 'Saanvi (Daughter)', relationship: 'Daughter', message: 'I got an A in my math test today! I did it for you, Papa.', color: '#00d4ff' },
  { id: 'mem-3', name: 'Rohan (Son)', relationship: 'Son', message: 'The garden is looking great, Dad. We planted those roses you like.', color: '#00ffaa' },
  { id: 'mem-4', name: 'Dr. Patel', relationship: 'Life-long Friend', message: 'Keep fighting, my friend. We are all rooting for you.', color: '#ff3d5a' },
  { id: 'mem-5', name: 'Sneha (Sister)', relationship: 'Sister', message: 'Thinking of you constantly. Sending all my love from Mumbai.', color: '#ffd700' },
  { id: 'mem-6', name: 'The Family Dog', relationship: 'Bruno', message: 'Woof! Bruno misses his walks with you.', color: '#e5e7eb' },
];

/**
 * Phase 26: The Memory Bridge
 * A gaze-optimized psychological respite for paralyzed patients.
 */
export default function MemoryPage({ 
  dwellingOn, 
  dwellProgress, 
  speak 
}) {
  
  const handlePhotoDwell = (member) => {
    speak(member.message);
  };

  return (
    <div className="flex h-full flex-col gap-8 p-8 animate-fade-in select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="p-4 rounded-3xl bg-amber-500/10 text-amber-500 animate-pulse">
              <Heart size={32} />
           </div>
           <div>
              <h1 className="font-display text-4xl font-bold text-white">Memory Bridge</h1>
              <p className="text-sm text-white/40 uppercase tracking-[0.4em] font-mono">Digital Respite • Human Connection</p>
           </div>
        </div>
        <div className="px-6 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-mono text-white/20 uppercase tracking-widest">
           Respite Session Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 flex-1">
        {FAMILY_MEMBERS.map((member) => {
          const isDwelling = dwellingOn === `mem-${member.id}`;
          
          return (
            <button
              key={member.id}
              id={`mem-${member.id}`}
              onClick={() => handlePhotoDwell(member)}
              className={`relative group rounded-[48px] border overflow-hidden transition-all duration-700 bg-[#0c0c0c] flex flex-col items-center justify-center p-8 ${isDwelling ? 'border-amber-500/50 scale-[1.02] shadow-[0_0_50px_rgba(255,183,0,0.2)]' : 'border-white/[0.05]'}`}
            >
               {/* Neural Glow Background */}
               <div 
                 className={`absolute inset-0 transition-opacity duration-1000 ${isDwelling ? 'opacity-20' : 'opacity-0'}`}
                 style={{ backgroundColor: member.color, filter: 'blur(100px)' }}
               />

               <div className="relative mb-6">
                 <div className={`h-24 w-24 rounded-full border-2 border-white/10 flex items-center justify-center transition-all duration-700 ${isDwelling ? 'scale-110 border-amber-500/40' : ''}`}>
                    <User size={48} className="text-white/20" />
                 </div>
                 {isDwelling && (
                    <div className="absolute -inset-2 rounded-full border border-amber-500/20 animate-spin-slow" />
                 )}
               </div>

               <div className="relative text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">{member.name}</h3>
                  <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/20">{member.relationship}</span>
               </div>

               {/* Interaction Progress */}
               {isDwelling && (
                 <div className="absolute inset-x-12 bottom-8 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 shadow-[0_0_10px_rgba(255,183,0,0.8)] transition-all duration-100 ease-linear" 
                      style={{ width: `${dwellProgress}%` }}
                    />
                 </div>
               )}

               {/* Family Icon */}
               <div className="absolute top-6 right-6 text-white/5">
                  <Camera size={24} />
               </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-center">
         <div className="flex items-center gap-3 text-[10px] font-bold text-white/20 uppercase tracking-[0.5em] animate-pulseSoft">
            <Star size={12} className="text-amber-500" /> Connecting to your loved ones
         </div>
      </div>
    </div>
  );
}

MemoryPage.propTypes = {
  dwellingOn: PropTypes.string,
  dwellProgress: PropTypes.number,
  speak: PropTypes.func.isRequired,
};
