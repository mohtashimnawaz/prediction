'use client';

interface CardProps {
  mint: string;
  power: number;
  rarity: number;
  multiplier: number;
  wins: number;
  losses: number;
  onClick?: () => void;
}

const rarityColors = {
  1: { name: 'Common', color: 'border-gray-400', glow: 'card-glow', bg: 'from-gray-700 to-gray-900', icon: '⚪' },
  2: { name: 'Uncommon', color: 'border-green-400', glow: 'card-glow', bg: 'from-green-700 to-gray-900', icon: '🟢' },
  3: { name: 'Rare', color: 'border-blue-400', glow: 'card-glow', bg: 'from-blue-700 to-gray-900', icon: '🔵' },
  4: { name: 'Epic', color: 'border-purple-400', glow: 'card-glow', bg: 'from-purple-700 to-gray-900', icon: '🟣' },
  5: { name: 'Legendary', color: 'border-yellow-400', glow: 'card-glow-gold', bg: 'from-yellow-600 to-orange-900', icon: '🟡' },
};

export default function CardDisplay({ mint, power, rarity, multiplier, wins, losses, onClick }: CardProps) {
  const rarityInfo = rarityColors[rarity as keyof typeof rarityColors] || rarityColors[1];
  const totalBattles = wins + losses;
  const winRate = totalBattles > 0 ? ((wins / totalBattles) * 100).toFixed(1) : '0.0';

  return (
    <div
      onClick={onClick}
      className={`group relative bg-gradient-to-br ${rarityInfo.bg} rounded-2xl border-2 ${rarityInfo.color} ${rarityInfo.glow} p-6 cursor-pointer hover:scale-105 hover:-rotate-1 transition-all duration-300 overflow-hidden`}
      style={{
        transform: 'perspective(1000px)',
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Shine effect on hover */}
      <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      
      {/* Rarity Badge */}
      <div className="absolute top-3 right-3 px-4 py-1.5 glass-strong rounded-full text-xs font-bold flex items-center gap-1 animate-glow-pulse">
        <span>{rarityInfo.icon}</span>
        <span>{rarityInfo.name}</span>
      </div>

      {/* Card Icon with float animation */}
      <div className="w-full aspect-square bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-lg flex items-center justify-center mb-4 group-hover:shadow-2xl transition-shadow duration-300">
        <span className="text-7xl animate-float">🃏</span>
      </div>

      {/* Stats with glassmorphism */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm p-2 glass rounded-lg">
          <span className="text-gray-300 font-medium">Power</span>
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-gray-700/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                style={{ width: `${(power / 10) * 100}%` }}
              />
            </div>
            <span className="font-bold text-white">{power}/10</span>
          </div>
        </div>
        
        <div className="flex justify-between text-sm p-2 glass rounded-lg">
          <span className="text-gray-300 font-medium">Multiplier</span>
          <span className="font-bold text-yellow-400 text-lg">{(multiplier / 1000).toFixed(2)}x</span>
        </div>

        <div className="border-t border-white/10 pt-3 space-y-2">
          <div className="flex justify-between text-xs p-2 glass rounded-lg">
            <span className="text-gray-400">Record</span>
            <span className="text-white font-mono font-bold">
              <span className="text-green-400">{wins}W</span> - <span className="text-red-400">{losses}L</span>
            </span>
          </div>
          <div className="flex justify-between text-xs p-2 glass rounded-lg">
            <span className="text-gray-400">Win Rate</span>
            <span className={`font-bold text-lg ${
              parseFloat(winRate) >= 60 ? 'text-green-400' :
              parseFloat(winRate) >= 40 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {winRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Mint Address (truncated) */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <p className="text-xs text-gray-400 text-center font-mono truncate">
          {mint.slice(0, 8)}...{mint.slice(-8)}
        </p>
      </div>
      
      {/* Hover indicator */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-xs text-white/60">✨ Click to view details</span>
      </div>
    </div>
  );
}
