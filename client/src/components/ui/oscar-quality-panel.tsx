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
          <p className="text-yellow-200">Industry-leading film production benchmarks are applied automatically</p>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-3 px-6 py-4 bg-green-500/20 border border-green-500/30 rounded-xl">
          <CheckCircle className="w-6 h-6 text-green-400" />
          <span className="text-green-300 font-medium">Professional standards are automatically applied to all content</span>
        </div>
      </div>
    </motion.div>
  );
}