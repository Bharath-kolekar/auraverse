export interface OscarStandardsConfig {
  category: string;
  requirements: string[];
  technicalSpecs: TechnicalSpecs;
  qualityGuidelines: string[];
}

export interface TechnicalSpecs {
  video?: {
    minResolution: string;
    recommendedResolution: string;
    frameRate: number[];
    format: string[];
    deliveryFormat: string[];
    colorSpace: string[];
    bitDepth: number;
    hdr: string[];
    aspectRatio: string[];
    duration: {
      min: number;
      max?: number;
    };
  };
  audio?: {
    channels: string[];
    format: string[];
    quality: string;
    minimumQuality: string;
    loudness: string;
    peakLevel: string;
    dynamicRange: string;
    stems: string[];
  };
  postProduction?: {
    editing: string[];
    colorGrading: string[];
    vfx: string[];
    qualityControl: string[];
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
          recommendedResolution: '4096x2160',
          frameRate: [24, 48],
          format: ['ProRes 4444 XQ', 'DNxHR 444', 'Digital Cinema (DCP)'],
          deliveryFormat: ['SMPTE DCP', 'DCP (Digital Cinema Package)'],
          colorSpace: ['DCI-P3', 'Rec. 2020'],
          bitDepth: 10,
          hdr: ['Dolby Vision', 'HDR10+'],
          aspectRatio: ['2.39:1', '1.85:1', '16:9'],
          duration: { min: 40 }
        },
        audio: {
          channels: ['5.1 surround', '7.1 surround', 'Dolby Atmos', 'IMAX 12-track'],
          format: ['Uncompressed PCM (WAV/AIFF)', 'Dolby Digital (AC-3)', 'SMPTE ST 429-3'],
          quality: '24-bit/96kHz',
          minimumQuality: '24-bit/48kHz',
          loudness: '-27 LUFS (streaming target)',
          peakLevel: '-2 dBTP (True Peak)',
          dynamicRange: 'ITU-R BS.1770-4 compliant',
          stems: ['Dialogue', 'Music', 'Sound Effects']
        },
        postProduction: {
          editing: ['Frame-accurate cutting', 'Multi-cam editing', 'Sub-frame audio editing'],
          colorGrading: ['Primary & Secondary grading', 'LUT support', 'HDR grading (PQ/HLG curves)'],
          vfx: ['Node-based compositing', 'Green screen keying', '3D tracking for CGI integration'],
          qualityControl: ['Black level check (IRE 0-255)', 'Phase correlation analysis', 'DCP validation']
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
          recommendedResolution: '4096x2160',
          frameRate: [24, 48],
          format: ['ProRes 4444 XQ', 'DNxHR 444', 'Digital Cinema (DCP)'],
          deliveryFormat: ['SMPTE DCP', 'DCP (Digital Cinema Package)'],
          colorSpace: ['DCI-P3', 'Rec. 2020'],
          bitDepth: 10,
          hdr: ['Dolby Vision', 'HDR10+'],
          aspectRatio: ['2.39:1', '1.85:1', '16:9'],
          duration: { min: 40 }
        },
        postProduction: {
          editing: ['Frame-accurate cutting', 'Multi-cam editing'],
          colorGrading: ['Primary & Secondary grading', 'LUT support', 'HDR grading (PQ/HLG curves)'],
          vfx: ['Node-based compositing', 'Green screen keying'],
          qualityControl: ['Black level check (IRE 0-255)', 'Aspect ratio validation', 'DCP validation']
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
          recommendedResolution: '4096x2160',
          frameRate: [24, 48],
          format: ['ProRes 4444 XQ', 'DNxHR 444', 'Digital Cinema (DCP)'],
          deliveryFormat: ['SMPTE DCP', 'DCP (Digital Cinema Package)'],
          colorSpace: ['DCI-P3', 'Rec. 2020'],
          bitDepth: 10,
          hdr: ['Dolby Vision', 'HDR10+'],
          aspectRatio: ['2.39:1', '1.85:1', '16:9'],
          duration: { min: 40 }
        },
        postProduction: {
          editing: ['Frame-accurate cutting', 'Multi-cam editing'],
          colorGrading: ['Primary & Secondary grading', 'LUT support', 'HDR grading'],
          vfx: ['Node-based compositing', 'Green screen keying', '3D tracking for CGI integration'],
          qualityControl: ['Black level check (IRE 0-255)', 'Phase correlation analysis', 'DCP validation']
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
          channels: ['5.1 surround', '7.1 surround', 'Dolby Atmos', 'IMAX 12-track'],
          format: ['Uncompressed PCM (WAV/AIFF)', 'Dolby Digital (AC-3)', 'SMPTE ST 429-3'],
          quality: '24-bit/96kHz',
          minimumQuality: '24-bit/48kHz',
          loudness: '-27 LUFS (streaming target)',
          peakLevel: '-2 dBTP (True Peak)',
          dynamicRange: 'ITU-R BS.1770-4 compliant',
          stems: ['Dialogue', 'Music', 'Sound Effects']
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
          recommendedResolution: '4096x2160',
          frameRate: [24, 48],
          format: ['ProRes 4444 XQ', 'DNxHR 444', 'Digital Cinema (DCP)'],
          deliveryFormat: ['SMPTE DCP', 'DCP (Digital Cinema Package)'],
          colorSpace: ['DCI-P3', 'Rec. 2020'],
          bitDepth: 10,
          hdr: ['Dolby Vision', 'HDR10+'],
          aspectRatio: ['2.39:1', '1.85:1', '16:9'],
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