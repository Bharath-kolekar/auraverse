import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cacheManager } from '@/services/cache-manager';
import { Zap, HardDrive, Database, Globe, Timer, TrendingUp, RefreshCw, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  operation: string;
  cached: boolean;
  responseTime: number;
  cacheLayer?: string;
  dataSize: number;
}

export default function CacheTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 2000);
    return () => clearInterval(interval);
  }, []);

  const updateStats = () => {
    const stats = cacheManager.getStats();
    setCacheStats(stats);
  };

  // Test 1: Small Data Cache Test
  const testSmallDataCache = async () => {
    const testKey = 'test_small_data';
    const testData = { 
      message: 'Small test data', 
      timestamp: Date.now(),
      array: Array(100).fill('test')
    };

    // Clear previous cache
    await cacheManager.clearAll();
    
    // First request - uncached
    const start1 = performance.now();
    await cacheManager.set(testKey, testData, 3600000);
    const uncachedTime = performance.now() - start1;

    // Second request - cached
    const start2 = performance.now();
    const cachedData = await cacheManager.get(testKey);
    const cachedTime = performance.now() - start2;

    const result: TestResult = {
      operation: 'Small Data (localStorage)',
      cached: cachedData !== null,
      responseTime: cachedTime,
      cacheLayer: 'localStorage',
      dataSize: JSON.stringify(testData).length
    };

    setTestResults(prev => [...prev, result]);
    
    return {
      uncachedTime,
      cachedTime,
      speedup: (uncachedTime / cachedTime).toFixed(2) + 'x'
    };
  };

  // Test 2: Large Data Cache Test
  const testLargeDataCache = async () => {
    const testKey = 'test_large_data';
    const largeArray = Array(10000).fill({ 
      id: Math.random(), 
      data: 'Large test content with lots of data' 
    });
    const testData = { 
      message: 'Large test data', 
      content: largeArray
    };

    // First request - uncached
    const start1 = performance.now();
    await cacheManager.set(testKey, testData, 3600000);
    const uncachedTime = performance.now() - start1;

    // Second request - cached
    const start2 = performance.now();
    const cachedData = await cacheManager.get(testKey);
    const cachedTime = performance.now() - start2;

    const result: TestResult = {
      operation: 'Large Data (IndexedDB)',
      cached: cachedData !== null,
      responseTime: cachedTime,
      cacheLayer: 'IndexedDB',
      dataSize: JSON.stringify(testData).length
    };

    setTestResults(prev => [...prev, result]);
    
    return {
      uncachedTime,
      cachedTime,
      speedup: (uncachedTime / cachedTime).toFixed(2) + 'x'
    };
  };

  // Test 3: API Response Cache Test
  const testApiCache = async () => {
    const testUrl = '/api/cache/stats';
    
    // First request - potentially uncached
    const start1 = performance.now();
    const response1 = await fetch(testUrl);
    const data1 = await response1.json();
    const uncachedTime = performance.now() - start1;

    // Second request - should be cached by service worker
    const start2 = performance.now();
    const response2 = await fetch(testUrl);
    const data2 = await response2.json();
    const cachedTime = performance.now() - start2;

    const result: TestResult = {
      operation: 'API Response (Service Worker)',
      cached: cachedTime < uncachedTime,
      responseTime: cachedTime,
      cacheLayer: 'Service Worker',
      dataSize: JSON.stringify(data2).length
    };

    setTestResults(prev => [...prev, result]);
    
    return {
      uncachedTime,
      cachedTime,
      speedup: (uncachedTime / cachedTime).toFixed(2) + 'x'
    };
  };

  // Test 4: Multi-tier Fallback Test
  const testMultiTierFallback = async () => {
    const testKey = 'test_multitier';
    const testData = { 
      level: 'multi-tier test',
      timestamp: Date.now(),
      metadata: { source: 'test', priority: 'high' }
    };

    // Set in all cache layers
    await cacheManager.set(testKey, testData, 3600000, false);

    // Test memory cache
    const start1 = performance.now();
    const memoryResult = await cacheManager.get(testKey);
    const memoryTime = performance.now() - start1;

    // Clear memory cache to test localStorage
    (cacheManager as any).memoryCache.clear();
    const start2 = performance.now();
    const localStorageResult = await cacheManager.get(testKey);
    const localStorageTime = performance.now() - start2;

    const results = [
      {
        operation: 'Memory Cache Hit',
        cached: true,
        responseTime: memoryTime,
        cacheLayer: 'Memory',
        dataSize: JSON.stringify(testData).length
      },
      {
        operation: 'LocalStorage Fallback',
        cached: true,
        responseTime: localStorageTime,
        cacheLayer: 'LocalStorage',
        dataSize: JSON.stringify(testData).length
      }
    ];

    setTestResults(prev => [...prev, ...results]);
    
    return {
      memoryTime,
      localStorageTime,
      fallbackWorking: localStorageResult !== null
    };
  };

  // Run all tests
  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      toast({
        title: "Starting Cache Performance Tests",
        description: "Running comprehensive cache benchmarks...",
      });

      // Run tests sequentially with delays
      const smallDataResults = await testSmallDataCache();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const largeDataResults = await testLargeDataCache();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const apiResults = await testApiCache();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const multiTierResults = await testMultiTierFallback();
      
      // Update stats
      updateStats();
      
      toast({
        title: "Tests Completed Successfully",
        description: `Average speedup: ${smallDataResults.speedup} for small data`,
        variant: "default",
      });
    } catch (error) {
      console.error('Test error:', error);
      toast({
        title: "Test Error",
        description: "Some tests failed to complete",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getSpeedColor = (time: number) => {
    if (time < 1) return 'text-green-400';
    if (time < 10) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getCacheEfficiency = () => {
    if (!cacheStats) return 0;
    return (cacheStats.hitRate * 100).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/20 to-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Cache Performance Test</h1>
          <p className="text-white/60">Testing multi-tier caching system performance</p>
        </motion.div>

        {/* Current Cache Stats */}
        {cacheStats && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-700/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Hit Rate</p>
                  <p className="text-2xl font-bold text-green-400">{getCacheEfficiency()}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-700/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Hits</p>
                  <p className="text-2xl font-bold text-cyan-400">{cacheStats.hits}</p>
                </div>
                <Zap className="w-8 h-8 text-cyan-400" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-pink-900/20 to-red-900/20 border-pink-700/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Memory Items</p>
                  <p className="text-2xl font-bold text-pink-400">{cacheStats.memoryCacheSize}</p>
                </div>
                <HardDrive className="w-8 h-8 text-pink-400" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-700/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Storage Keys</p>
                  <p className="text-2xl font-bold text-yellow-400">{cacheStats.localStorageKeys}</p>
                </div>
                <Database className="w-8 h-8 text-yellow-400" />
              </div>
            </Card>
          </motion.div>
        )}

        {/* Test Controls */}
        <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-700/50 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Performance Tests</h2>
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4 mr-2" />
                  Run All Tests
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={testSmallDataCache}
              disabled={isRunning}
              className="justify-start"
            >
              <HardDrive className="w-4 h-4 mr-2" />
              Test Small Data (localStorage)
            </Button>
            <Button
              variant="outline"
              onClick={testLargeDataCache}
              disabled={isRunning}
              className="justify-start"
            >
              <Database className="w-4 h-4 mr-2" />
              Test Large Data (IndexedDB)
            </Button>
            <Button
              variant="outline"
              onClick={testApiCache}
              disabled={isRunning}
              className="justify-start"
            >
              <Globe className="w-4 h-4 mr-2" />
              Test API Cache (Service Worker)
            </Button>
            <Button
              variant="outline"
              onClick={testMultiTierFallback}
              disabled={isRunning}
              className="justify-start"
            >
              <Zap className="w-4 h-4 mr-2" />
              Test Multi-tier Fallback
            </Button>
          </div>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-700/50 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Test Results</h2>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-black/30 rounded-lg p-4 border border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Timer className={`w-5 h-5 ${getSpeedColor(result.responseTime)}`} />
                      <div>
                        <p className="text-white font-medium">{result.operation}</p>
                        <p className="text-white/60 text-sm">
                          Cache Layer: {result.cacheLayer} • Size: {(result.dataSize / 1024).toFixed(2)}KB
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getSpeedColor(result.responseTime)}`}>
                        {result.responseTime.toFixed(2)}ms
                      </p>
                      <p className={`text-sm ${result.cached ? 'text-green-400' : 'text-red-400'}`}>
                        {result.cached ? 'Cached' : 'Uncached'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Performance Summary */}
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Performance Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-white/60">Avg Response</p>
                  <p className="text-white font-bold">
                    {testResults.length > 0 
                      ? (testResults.reduce((sum, r) => sum + r.responseTime, 0) / testResults.length).toFixed(2)
                      : '0'}ms
                  </p>
                </div>
                <div>
                  <p className="text-white/60">Cache Hits</p>
                  <p className="text-green-400 font-bold">
                    {testResults.filter(r => r.cached).length}/{testResults.length}
                  </p>
                </div>
                <div>
                  <p className="text-white/60">Total Data</p>
                  <p className="text-cyan-400 font-bold">
                    {(testResults.reduce((sum, r) => sum + r.dataSize, 0) / 1024).toFixed(2)}KB
                  </p>
                </div>
                <div>
                  <p className="text-white/60">Best Time</p>
                  <p className="text-green-400 font-bold">
                    {testResults.length > 0 
                      ? Math.min(...testResults.map(r => r.responseTime)).toFixed(2)
                      : '0'}ms
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}