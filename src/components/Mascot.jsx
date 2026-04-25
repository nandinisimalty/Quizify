import { Rocket, Sparkles, AlertCircle } from 'lucide-react';

export default function Mascot({ mood = 'happy', size = 'md' }) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32'
  };

  const currentSize = sizeClasses[mood] || sizeClasses.md;

  if (mood === 'excited') {
    return (
      <div className={`relative animate-bounce ${sizeClasses[size]}`}>
        <div className="absolute inset-0 bg-secondary-400 rounded-full blur-xl opacity-40 animate-pulse"></div>
        <div className="relative w-full h-full bg-gradient-to-tr from-secondary-400 to-secondary-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
          <Rocket className="w-3/5 h-3/5 text-white" />
          <Sparkles className="absolute -top-2 -right-2 text-secondary-500 w-1/3 h-1/3 animate-ping" />
        </div>
      </div>
    );
  }

  if (mood === 'sad' || mood === 'wrong') {
    return (
      <div className={`relative ${sizeClasses[size]}`}>
        <div className="w-full h-full bg-gradient-to-tr from-gray-400 to-gray-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white transition-all scale-95 opacity-80">
          <AlertCircle className="w-1/2 h-1/2 text-white" />
        </div>
      </div>
    );
  }

  // default 'happy'
  return (
    <div className={`relative ${sizeClasses[size]} hover:scale-110 transition-transform duration-300 cursor-pointer`}>
      <div className="w-full h-full bg-gradient-to-tr from-primary-500 to-primary-400 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
        <Rocket className="w-3/5 h-3/5 text-white rotate-12" />
      </div>
    </div>
  );
}
