// src/components/ScheduleList.jsx
import React from 'react';
import { Calendar } from 'lucide-react';
import { usePitches } from '../context/PitchContext';

export const ScheduleList = () => {
  const { pitches } = usePitches();

  if (pitches.length === 0) {
    return (
      <div className="text-gray-400 text-center py-8">
        本日のスケジュールはまだ公開されていません
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pitches.map((pitch) => (
        <div
          key={pitch._id}
          className="bg-gray-800/50 rounded-lg p-4 border border-gray-600 flex items-center justify-between"
        >
          {/* …中略… */}
        </div>
      ))}
    </div>
  );
};
