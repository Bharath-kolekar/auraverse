export interface OscarStandardsConfig {
  category: string;
  requirements: string[];
  technicalSpecs: TechnicalSpecs;
  qualityGuidelines: string[];
}

export interface TechnicalSpecs {
  video?: {
    minResolution: string;
    frameRate: number;
    format: string[];
    duration: {
      min: number;
      max?: number;
    };
  };
  audio?: {
    channels: string[];
    format: string[];
    quality: string;
  };
  general?: {
    originalityRequired: boolean;
    commercialRelease: boolean;
    technicalExcellence: boolean;
  };
}

export class OscarStandardsService {
  private standards: Map<string, OscarStandardsConfig> = new Map();

  constructor() {
    this.initializeStandards();
  }

  private initializeStandards() {
    // Best Picture Standards
    this.standards.set('picture', {
      category: 'Best Picture',
      requirements: [
        'Feature length (over 40 minutes)',
        'Theatrical release in qualifying metro areas',
        'Minimum 7-day consecutive theatrical run',
        'Daily screenings (at least 3 times, one between 6-10 PM)',
        'Commercial theater exhibition for paid admission',
        'Professional advertising and distribution'
      ],
      technicalSpecs: {
        video: {
          minResolution: '2048x1080',
          frameRate: 24,
          format: ['35mm', '70mm', 'Digital Cinema (DCP)'],
          duration: { min: 40 }
        },
        audio: {
          channels: ['5.1', '7.1', 'Immersive Audio'],
          format: ['SMPTE ST 429-3', 'SMPTE ST 428-2'],
          quality: 'Professional theatrical standard'
        },
        general: {
          originalityRequired: true,
          commercialRelease: true,
          technicalExcellence: true
        }
      },
      qualityGuidelines: [
        'Exceptional storytelling and narrative structure',
        'Outstanding technical achievement across all departments',
        'Significant cultural or artistic impact',
        'Professional production values throughout',
        'Coherent vision and execution'
      ]
    });

    // Cinematography Standards
    this.standards.set('cinematography', {
      category: 'Cinematography',
      requirements: [
        'Exceptional visual storytelling',
        'Technical mastery of camera and lighting',
        'Innovative or masterful use of visual techniques',
        'Consistent visual style supporting narrative'
      ],
      technicalSpecs: {
        video: {
          minResolution: '2048x1080',
          frameRate: 24,
          format: ['35mm', '70mm', 'Digital Cinema'],
          duration: { min: 40 }
        },
        general: {
          originalityRequired: false,
          commercialRelease: true,
          technicalExcellence: true
        }
      },
      qualityGuidelines: [
        'Masterful composition and framing',
        'Excellent lighting design and execution',
        'Creative camera movement and positioning',
        'Effective use of color and contrast',
        'Visual coherence throughout the film'
      ]
    });

    // Visual Effects Standards
    this.standards.set('visual-effects', {
      category: 'Visual Effects',
      requirements: [
        'Outstanding achievement in visual effects',
        'Seamless integration with live action',
        'Technical innovation or excellence',
        'Significant contribution to storytelling'
      ],
      technicalSpecs: {
        video: {
          minResolution: '2048x1080',
          frameRate: 24,
          format: ['Digital Cinema (DCP)', '35mm', '70mm'],
          duration: { min: 40 }
        },
        general: {
          originalityRequired: false,
          commercialRelease: true,
          technicalExcellence: true
        }
      },
      qualityGuidelines: [
        'Photorealistic or stylistically appropriate effects',
        'Seamless compositing and integration',
        'Technical innovation and complexity',
        'Enhancement of narrative without distraction',
        'Consistent quality throughout the film'
      ]
    });

    // Sound Standards
    this.standards.set('sound', {
      category: 'Sound',
      requirements: [
        'Excellence in sound design, mixing, and editing',
        'Professional audio post-production',
        'Support of narrative through audio',
        'Technical excellence in all sound elements'
      ],
      technicalSpecs: {
        audio: {
          channels: ['5.1 minimum', '7.1', 'Immersive Audio'],
          format: ['SMPTE DCP standard', 'Professional theatrical'],
          quality: 'Broadcast/theatrical professional standard'
        },
        general: {
          originalityRequired: false,
          commercialRelease: true,
          technicalExcellence: true
        }
      },
      qualityGuidelines: [
        'Clear and intelligible dialogue',
        'Effective sound effects design',
        'Professional music integration',
        'Appropriate dynamic range',
        'Immersive audio experience'
      ]
    });

    // Animated Feature Standards
    this.standards.set('animated-feature', {
      category: 'Animated Feature Film',
      requirements: [
        'Feature length (over 40 minutes)',
        'Animation comprises at least 75% of running time',
        'Theatrical release requirements same as live action',
        'Exceptional animation artistry and technique'
      ],
      technicalSpecs: {
        video: {
          minResolution: '2048x1080',
          frameRate: 24,
          format: ['Digital Cinema (DCP)', '35mm'],
          duration: { min: 40 }
        },
        general: {
          originalityRequired: true,
          commercialRelease: true,
          technicalExcellence: true
        }
      },
      qualityGuidelines: [
        'Outstanding character animation and design',
        'Exceptional technical achievement in animation',
        'Compelling storytelling through animation',
        'Innovation in animation techniques',
        'Artistic excellence throughout'
      ]
    });
  }

  getStandardsForCategory(category: string): OscarStandardsConfig | null {
    return this.standards.get(category.toLowerCase()) || null;
  }

  getAllCategories(): string[] {
    return Array.from(this.standards.keys());
  }

  validateContentAgainstStandards(
    category: string,
    content: {
      duration?: number;
      resolution?: string;
      format?: string;
      audioChannels?: string;
    }
  ): {
    meets: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const standards = this.getStandardsForCategory(category);
    if (!standards) {
      return {
        meets: false,
        issues: ['Category not recognized'],
        recommendations: ['Please specify a valid Oscar category']
      };
    }

    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check duration
    if (standards.technicalSpecs.video?.duration) {
      const minDuration = standards.technicalSpecs.video.duration.min;
      if (content.duration && content.duration < minDuration) {
        issues.push(`Duration ${content.duration} minutes is below minimum ${minDuration} minutes`);
        recommendations.push(`Extend content to at least ${minDuration} minutes for Oscar eligibility`);
      }
    }

    // Check resolution
    if (standards.technicalSpecs.video?.minResolution && content.resolution) {
      const [minWidth, minHeight] = standards.technicalSpecs.video.minResolution.split('x').map(Number);
      const [contentWidth, contentHeight] = content.resolution.split('x').map(Number);
      
      if (contentWidth < minWidth || contentHeight < minHeight) {
        issues.push(`Resolution ${content.resolution} is below minimum ${standards.technicalSpecs.video.minResolution}`);
        recommendations.push(`Upgrade to at least ${standards.technicalSpecs.video.minResolution} resolution`);
      }
    }

    return {
      meets: issues.length === 0,
      issues,
      recommendations: issues.length === 0 ? standards.qualityGuidelines : recommendations
    };
  }

  generateOscarQualityPrompt(category: string, userPrompt: string): string {
    const standards = this.getStandardsForCategory(category);
    if (!standards) {
      return userPrompt;
    }

    const qualityEnhancements = [
      'Create with professional cinematography quality',
      'Ensure technical excellence in all aspects',
      'Apply masterful composition and lighting',
      'Use industry-standard visual techniques',
      'Maintain consistent artistic vision'
    ];

    return `${userPrompt}

Oscar-Quality Standards:
- ${standards.qualityGuidelines.join('\n- ')}

Technical Excellence:
- ${qualityEnhancements.join('\n- ')}

Style: Professional, award-worthy, technically excellent, visually stunning`;
  }

  getProductionGuidelines(category: string): string[] {
    const standards = this.getStandardsForCategory(category);
    if (!standards) {
      return ['Category not found'];
    }

    return [
      ...standards.requirements,
      ...standards.qualityGuidelines,
      `Technical specs: ${JSON.stringify(standards.technicalSpecs, null, 2)}`
    ];
  }
}

export const oscarStandardsService = new OscarStandardsService();