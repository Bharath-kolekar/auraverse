import { Router } from 'express';
import { serverCache } from './services/cache-service';

const router = Router();

// Get cache statistics
router.get('/api/cache/stats', async (req, res) => {
  try {
    const stats = serverCache.getStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Failed to get cache stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cache statistics'
    });
  }
});

// Clear cache
router.post('/api/cache/clear', async (req, res) => {
  try {
    await serverCache.clearAll();
    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    console.error('Failed to clear cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache'
    });
  }
});

// Invalidate cache by pattern
router.post('/api/cache/invalidate', async (req, res) => {
  try {
    const { pattern } = req.body;
    if (!pattern) {
      return res.status(400).json({
        success: false,
        error: 'Pattern is required'
      });
    }
    
    await serverCache.invalidatePattern(pattern);
    res.json({
      success: true,
      message: `Cache invalidated for pattern: ${pattern}`
    });
  } catch (error) {
    console.error('Failed to invalidate cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to invalidate cache'
    });
  }
});

export default router;