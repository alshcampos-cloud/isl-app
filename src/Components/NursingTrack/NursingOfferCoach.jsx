// NursingTrack — Offer Negotiation Coach (Stub)
// Will be replaced in Step 4 with full implementation.
import { ArrowLeft } from 'lucide-react';

export default function NursingOfferCoach({ onBack }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 flex flex-col items-center justify-center">
      <p className="text-white text-lg mb-4">Offer Coach — Coming in Step 4</p>
      <button onClick={onBack} onTouchEnd={(e) => { e.preventDefault(); onBack(); }} className="text-sky-400">
        <ArrowLeft className="w-5 h-5 inline mr-1" /> Back
      </button>
    </div>
  );
}
