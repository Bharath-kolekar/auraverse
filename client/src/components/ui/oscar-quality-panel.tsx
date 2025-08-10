import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle, AlertCircle, Trophy, Film, Zap } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface OscarStandards {
  category: string;
  requirements: string[];
  technicalSpecs: any;
  qualityGuidelines: string[];
}

interface ValidationResult {
  meets: boolean;
  issues: string[];
  recommendations: string[];
}

export function OscarQualityPanel() {
  const [selectedCategory, setSelectedCategory] = useState('cinematography');
  const [standards, setStandards] = useState<OscarStandards | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadStandards(selectedCategory);
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/oscar/categories');
      const data = await response.json();
      setCategories(data.categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadStandards = async (category: string) => {
    try {
      const response = await fetch(`/api/oscar/standards/${category}`);
      const data = await response.json();
      setStandards(data);
    } catch (error) {
      console.error('Failed to load standards:', error);
    }
  };

  const validateContent = async (content: any) => {
    try {
      const response = await fetch('/api/oscar/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          content
        })
      });
      const data = await response.json();
      setValidation(data);
    } catch (error) {
      console.error('Failed to validate content:', error);
    }
  };

  const formatCategoryName = (category: string) => {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (!standards) {
    return (
      <div className="bg-gradient-to-br from-yellow-900/20 to-amber-900/20 rounded-xl p-6 border border-yellow-500/30">
        <div className="flex items-center gap-3 mb-4">
          <Award className="w-6 h-6 text-yellow-400" />
          <h3 className="text-xl font-bold text-white">Oscar Quality Standards</h3>
        </div>
        <div className="text-yellow-200">Loading standards...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-yellow-900/20 to-amber-900/20 rounded-xl p-6 border border-yellow-500/30"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-8 h-8 text-yellow-400" />
        <div>
          <h3 className="text-2xl font-bold text-white">Professional Quality Standards</h3>
          <p className="text-yellow-200">Industry-leading film production benchmarks</p>
        </div>
      </div>

      {/* Category Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-yellow-200 mb-2">
          Content Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full bg-black/30 border border-yellow-500/30 rounded-lg px-4 py-2 text-white focus:border-yellow-400 focus:outline-none"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {formatCategoryName(category)}
            </option>
          ))}
        </select>
      </div>

      {/* Standards Overview */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Requirements */}
        <div className="bg-black/20 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-yellow-300 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Requirements
          </h4>
          <ul className="space-y-2">
            {standards.requirements.map((req, index) => (
              <li key={index} className="text-yellow-100 text-sm flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                {req}
              </li>
            ))}
          </ul>
        </div>

        {/* Quality Guidelines */}
        <div className="bg-black/20 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-yellow-300 mb-3 flex items-center gap-2">
            <Film className="w-5 h-5" />
            Quality Guidelines
          </h4>
          <ul className="space-y-2">
            {standards.qualityGuidelines.map((guideline, index) => (
              <li key={index} className="text-yellow-100 text-sm flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                {guideline}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Technical Specifications */}
      {standards.technicalSpecs && (
        <div className="bg-black/20 rounded-lg p-4 mb-6">
          <h4 className="text-lg font-semibold text-yellow-300 mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Technical Specifications
          </h4>
          
          {standards.technicalSpecs.video && (
            <div className="mb-4">
              <h5 className="text-yellow-200 font-medium mb-2">Video Requirements</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-yellow-300">Min Resolution:</span>
                  <span className="text-white ml-2">{standards.technicalSpecs.video.minResolution}</span>
                </div>
                <div>
                  <span className="text-yellow-300">Frame Rate:</span>
                  <span className="text-white ml-2">{standards.technicalSpecs.video.frameRate} FPS</span>
                </div>
                <div>
                  <span className="text-yellow-300">Min Duration:</span>
                  <span className="text-white ml-2">{standards.technicalSpecs.video.duration.min} minutes</span>
                </div>
                <div>
                  <span className="text-yellow-300">Formats:</span>
                  <span className="text-white ml-2">{standards.technicalSpecs.video.format.join(', ')}</span>
                </div>
              </div>
            </div>
          )}

          {standards.technicalSpecs.audio && (
            <div>
              <h5 className="text-yellow-200 font-medium mb-2">Audio Requirements</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-yellow-300">Channels:</span>
                  <span className="text-white ml-2">{standards.technicalSpecs.audio.channels.join(', ')}</span>
                </div>
                <div>
                  <span className="text-yellow-300">Quality:</span>
                  <span className="text-white ml-2">{standards.technicalSpecs.audio.quality}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Validation Status */}
      {validation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`rounded-lg p-4 ${
            validation.meets 
              ? 'bg-green-900/30 border border-green-500/30' 
              : 'bg-red-900/30 border border-red-500/30'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            {validation.meets ? (
              <CheckCircle className="w-6 h-6 text-green-400" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-400" />
            )}
            <h4 className="text-lg font-semibold text-white">
              {validation.meets ? 'Meets Professional Standards' : 'Standards Not Met'}
            </h4>
          </div>

          {validation.issues.length > 0 && (
            <div className="mb-4">
              <h5 className="text-red-300 font-medium mb-2">Issues to Address:</h5>
              <ul className="space-y-1">
                {validation.issues.map((issue, index) => (
                  <li key={index} className="text-red-200 text-sm flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {validation.recommendations.length > 0 && (
            <div>
              <h5 className={`font-medium mb-2 ${validation.meets ? 'text-green-300' : 'text-yellow-300'}`}>
                {validation.meets ? 'Additional Excellence Tips:' : 'Recommendations:'}
              </h5>
              <ul className="space-y-1">
                {validation.recommendations.map((rec, index) => (
                  <li key={index} className={`text-sm flex items-start gap-2 ${validation.meets ? 'text-green-200' : 'text-yellow-200'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${validation.meets ? 'bg-green-400' : 'bg-yellow-400'}`} />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}

      {/* Action Button */}
      <motion.button
        onClick={() => validateContent({
          duration: 60,
          resolution: '1920x1080',
          format: 'Digital Cinema'
        })}
        className="w-full mt-6 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Validate Current Project Against Professional Standards
      </motion.button>
    </motion.div>
  );
}