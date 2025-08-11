import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HardDrive, Zap, Database, Globe, TrendingUp } from 'lucide-react';
import { cacheManager } from '@/services/cache-manager';
import { useNeuralTheme } from '@/components/effects/NeuralThemeProvider';

export function CacheStatus() {
  const [stats, setStats] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme } = useNeuralTheme();

  useEffect(() => {
    // Update stats every 5 seconds
    const updateStats = () => {
      const cacheStats = cacheManager.getStats();
      setStats(cacheStats);
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  const hitRate = (stats.hitRate * 100).toFixed(1);
  const memorySize = stats.memoryCacheSize;
  const localStorageSize = stats.localStorageKeys;

  return (
    <motion.div
      className={`fixed bottom-4 right-4 z-40 ${theme.gradients.card} backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ width: isExpanded ? '320px' : '180px' }}
    >
      {/* Header */}
      <div 
        className="p-3 border-b border-white/10 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-white font-semibold text-sm">Cache Status</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              parseFloat(hitRate) > 80 ? 'bg-green-500/20 text-green-400' :
              parseFloat(hitRate) > 50 ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {hitRate}% Hit
            </span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              className="text-white/60 text-xs"
            >
              ▼
            </motion.div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-3 grid grid-cols-3 gap-2 text-center border-b border-white/10">
        <div>
          <div className="text-lg font-bold text-white">{stats.hits}</div>
          <div className="text-xs text-white/60">Hits</div>
        </div>
        <div>
          <div className="text-lg font-bold text-white">{stats.misses}</div>
          <div className="text-xs text-white/60">Misses</div>
        </div>
        <div>
          <div className="text-lg font-bold text-green-400">{hitRate}%</div>
          <div className="text-xs text-white/60">Rate</div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="p-3 space-y-3"
        >
          {/* Memory Cache */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-white/80">Memory Cache</span>
            </div>
            <span className="text-xs text-white/60">{memorySize} items</span>
          </div>

          {/* LocalStorage */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-white/80">LocalStorage</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/60">{localStorageSize} keys</span>
              <span className="text-xs text-green-400">
                {stats.localStorage.hits}/{stats.localStorage.hits + stats.localStorage.misses}
              </span>
            </div>
          </div>

          {/* IndexedDB */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-white/80">IndexedDB</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/60">Large assets</span>
              <span className="text-xs text-green-400">
                {stats.indexedDB.hits}/{stats.indexedDB.hits + stats.indexedDB.misses}
              </span>
            </div>
          </div>

          {/* Service Worker */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-pink-400" />
              <span className="text-xs text-white/80">Service Worker</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/60">Offline ready</span>
              <span className="text-xs text-green-400">
                {stats.serviceWorker.hits}/{stats.serviceWorker.hits + stats.serviceWorker.misses}
              </span>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs text-white/80">Performance</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/5 rounded p-2">
                <div className="text-white/60">Avg Response</div>
                <div className="text-white font-semibold">&lt;1ms cached</div>
              </div>
              <div className="bg-white/5 rounded p-2">
                <div className="text-white/60">Bandwidth Saved</div>
                <div className="text-white font-semibold">
                  {((stats.hits * 50) / 1024).toFixed(1)}MB
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex gap-2">
            <button
              onClick={async () => {
                await cacheManager.clearAll();
                const newStats = cacheManager.getStats();
                setStats(newStats);
              }}
              className="flex-1 px-3 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30 transition-colors"
            >
              Clear Cache
            </button>
            <button
              onClick={() => {
                const newStats = cacheManager.getStats();
                setStats(newStats);
              }}
              className="flex-1 px-3 py-1 bg-green-500/20 text-green-400 rounded text-xs hover:bg-green-500/30 transition-colors"
            >
              Refresh Stats
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}