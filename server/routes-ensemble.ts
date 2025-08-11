import { Router } from 'express';
import { EnsembleLearningService } from './services/ensemble-learning';

const router = Router();
const ensembleService = new EnsembleLearningService();

// Ensemble generation endpoint
router.post('/api/ensemble/generate', async (req, res) => {
  try {
    const { prompt, type = 'text', crossValidate = true, autoRank = true } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ 
        error: 'Prompt is required',
        voiceEnabled: true 
      });
    }
    
    const result = await ensembleService.generateWithEnsemble({
      type: type as any,
      prompt,
      crossValidate,
      autoRank
    });
    
    res.json({
      success: true,
      content: result.bestResult,
      confidence: result.confidence,
      reasoning: result.reasoning,
      ensemble: result.ensemble,
      voiceEnabled: true,
      voiceInstruction: `Generated ${type} content using ensemble learning with ${(result.confidence * 100).toFixed(0)}% confidence`
    });
  } catch (error) {
    console.error('Ensemble generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate content with ensemble',
      details: error instanceof Error ? error.message : 'Unknown error',
      voiceEnabled: true,
      voiceInstruction: 'Failed to generate content. Please try again.'
    });
  }
});

// Smart switch endpoint
router.post('/api/ensemble/smart-switch', async (req, res) => {
  try {
    const { prompt, context } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ 
        error: 'Prompt is required',
        voiceEnabled: true 
      });
    }
    
    const result = await ensembleService.smartSwitch(prompt, context);
    
    res.json({
      success: true,
      content: result,
      voiceEnabled: true,
      voiceInstruction: 'Content generated using intelligent model switching'
    });
  } catch (error) {
    console.error('Smart switch error:', error);
    res.status(500).json({ 
      error: 'Failed to process with smart switch',
      details: error instanceof Error ? error.message : 'Unknown error',
      voiceEnabled: true,
      voiceInstruction: 'Failed to process request. Please try again.'
    });
  }
});

export default router;