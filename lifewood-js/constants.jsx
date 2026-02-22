import React from 'react';

export const COLORS = {
  CASTLETON: '#046241',
  DARK_SERPENT: '#133020',
  SAFFRON: '#FFB347',
  EARTH_YELLOW: '#FFC370',
  PAPER: '#f5eedb',
  SEA_SALT: '#F9F7F7',
};

export const SERVICES_DATA = [
  {
    id: 'data-annotation',
    title: 'AI Services',
    shortDesc: 'Comprehensive AI data services across acquisition, collection, annotation, curation, and validation.',
    fullDesc: 'Lifewood delivers end-to-end AI data services designed to improve decision-making, reduce operational cost, and accelerate deployment. From multimodal data collection to annotation and quality validation, our workflows transform raw information into trusted, production-ready assets for enterprise AI.',
    icon: 'target',
    process: ['Data Acquisition', 'Data Collection', 'Data Annotation', 'Data Curation', 'Data Validation'],
    benefits: ['Text, Image, Audio, and Video Coverage', 'Industrialized QA and Governance', 'Multilingual Global Delivery', 'Production-Ready Data at Scale']
  },
  {
    id: 'ai-model-training',
    title: 'AI Projects',
    shortDesc: 'Innovation-led AI data projects that convert complex data ecosystems into measurable business outcomes.',
    fullDesc: 'Our AI projects are built to operationalize innovation through scalable data engineering. Lifewood supports enterprise initiatives with structured project delivery across data extraction, machine learning enablement, and workflow optimization to improve deployment speed, user experience, and AI insight quality.',
    icon: 'cpu',
    process: ['Project Discovery', 'Data Extraction', 'ML Enablement', 'Delivery Optimization', 'Performance Review'],
    benefits: ['Innovation-Driven Project Execution', 'Faster Time-to-Value', 'Enterprise Workflow Integration', 'Scalable AI Program Delivery']
  },
  {
    id: 'data-processing',
    title: 'Data Processing',
    shortDesc: 'Turning unstructured noise into actionable structured data.',
    fullDesc: 'Transform massive volumes of raw data into structured, meaningful formats. Our systems handle everything from OCR to complex audio-to-text workflows.',
    icon: 'refresh-ccw',
    process: ['Ingestion', 'Categorization', 'Validation', 'Normalization', 'Secure Storage'],
    benefits: ['Enterprise-grade Security', 'Automated Workflows', 'Format Versatility', 'Massive Throughput']
  },
  {
    id: 'ai-consulting',
    title: 'AI Consulting',
    shortDesc: 'Strategic guidance on AI implementation and data strategy.',
    fullDesc: 'Navigate the complex AI landscape with our strategic advisory services. We help global enterprises design data roadmaps and ethical AI frameworks.',
    icon: 'users',
    process: ['Maturity Assessment', 'Strategy Design', 'Vendor Selection', 'Implementation Support', 'Change Management'],
    benefits: ['Vendor Neutral Advice', 'ESG-focused Implementation', 'Cost Efficiency', 'Risk Mitigation']
  }
];

// Lifewood Data Technology - Official Service Types
export const LIFEWOOD_SERVICE_TYPES = [
  {
    id: 'type-a-data-servicing',
    title: 'Type A - Data Servicing',
    description: 'Comprehensive data servicing across multilingual document pipelines, from intake and capture through extraction, normalization, labeling, validation, and final delivery for enterprise AI and analytics.',
    features: [
      'Objective: Transform complex multilingual records into trusted, model-ready data assets',
      'Key Features: Document capture, ingestion, and preparation across archives, newspapers, and genealogy sources',
      'Key Features: Extraction, classification, labeling, and annotation supported by multi-layer QA controls',
      'Key Features: Automated enhancement with auto-crop, de-skew, blur reduction, and object detection',
      'Results: High-accuracy output with faster turnaround and scalable production performance',
      'Results: Structured datasets delivered in formats optimized for enterprise AI workflows'
    ]
  },
  {
    id: 'type-b-horizontal-llm-data',
    title: 'Type B - Horizontal LLM Data',
    description: 'Horizontal LLM data programs spanning collection, annotation, and evaluation across voice, text, and image to support robust model performance across regions and languages.',
    features: [
      'Target: Build broad multimodal corpora for enterprise foundation and language model training',
      'Solutions: Large-scale collection and annotation across audio, visual, and text modalities',
      'Solutions: Coverage across 50+ language sets with native-quality linguistic workflows',
      'Solutions: Managed delivery with milestone tracking, quality gates, and throughput controls',
      'Results: 25,400 validated audio hours completed within a five-month delivery window',
      'Results: On-time handover with consistent quality for production-ready model development'
    ]
  },
  {
    id: 'type-c-vertical-llm-data',
    title: 'Type C - Vertical LLM Data',
    description: 'Vertical LLM data services focused on domain-critical use cases, including autonomous driving annotation, in-vehicle data collection, and enterprise-grade private model initiatives.',
    features: [
      'Target: Deliver high-precision, verticalized data for safety-critical and enterprise AI programs',
      'Solutions: 2D, 3D, and 4D annotation pipelines for autonomous driving and smart cockpit scenarios',
      'Solutions: Dedicated dataset development for programs such as Driver Monitoring System and ShipGPT',
      'Results: Month 1 reached 25% production at 95% accuracy versus a 90% target',
      'Results: Month 2 reached 50% production at 99% accuracy versus a 95% target',
      'Results: Operations scaled to Malaysia and Indonesia with on-time delivery and sustained 99% overall quality'
    ]
  },
  {
    id: 'type-d-aigc',
    title: 'Type D - AI Generated Content (AIGC)',
    description: 'AIGC services that combine generative AI with professional production workflows to deliver high-impact communication across text, voice, image, and video.',
    features: [
      'Approach: Story-led creative strategy designed to express brand personality with clarity',
      'Solutions: Generative AI integrated with advanced filming, editing, and post-production techniques',
      'Solutions: End-to-end content production for campaigns, corporate media, and digital communications',
      'Localization: Rapid adaptation of language and cultural context for global audiences',
      'Reach: Multi-language execution capabilities across 100+ country markets',
      'Results: Faster content iteration with strong narrative quality, originality, and brand consistency'
    ]
  }
];


export const NAVIGATION = [
  { label: 'Home', path: '/home' },
  { 
    label: 'AI Initiatives', 
    path: '/services/data-annotation',
    children: [
      { label: 'AI Services', path: '/services/data-annotation' },
      { label: 'AI Projects', path: '/services/ai-model-training' }
    ]
  },
  { 
    label: 'Our Company', 
    path: '/about',
    children: [
      { label: 'About Us', path: '/about' },
      { label: 'Offices', path: '/offices' }
    ]
  },
  { 
    label: 'What We Offer', 
    path: '/services/type-a-data-servicing',
    children: [
      { label: 'Type A - Data Servicing', path: '/services/type-a-data-servicing' },
      { label: 'Type B - Horizontal LLM Data', path: '/services/type-b-horizontal-llm-data' },
      { label: 'Type C - Vertical LLM Data', path: '/services/type-c-vertical-llm-data' },
      { label: 'Type D - AI Generated Content (AIGC)', path: '/services/type-d-aigc' }
    ]
  },
  { label: 'Philanthropy & Impact', path: '/esg' },
  { label: 'Careers', path: '/careers' },
  { label: 'Contact Us', path: '/contact' },
  { label: 'Internal News', path: '/news' }
];

export const CONTACT_INFO = {
  email: 'hello@lifewood.global',
  phone: '+1 (555) 123-4567',
  address: 'Level 28, Global Tech Plaza, Silicon Valley, CA'
};

