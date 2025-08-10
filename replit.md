# Overview

This is a full-stack web application called "Infinite Intelligence" that provides AI-powered content creation tools. The platform allows users to generate audio, video, VFX, and images using artificial intelligence, with features like voice command controls and a marketplace for sharing/selling content. Built with a modern React frontend, Express backend, and PostgreSQL database using Drizzle ORM. The application is designed for deployment on the user's custom domain cognomega.com.

# User Preferences

Preferred communication style: Simple, everyday language.
Custom domain: cognomega.com for production deployment.
Application goal: Oscar-quality content generation with end-to-end automation.
Platform features: Multi-device recording capabilities from mobile phones and computers.
Cost optimization: Zero-cost local processing for unlimited testing and development.
Performance enhancement: Local AI delivers 2-5x faster responses with professional-grade quality.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for client-side routing
- **Authentication**: Session-based authentication with Replit Auth integration
- **Voice Controls**: Web Speech API integration for voice command functionality
- **AI Training Assistant**: Interactive floating assistant for user education and platform guidance

## Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **API Design**: RESTful API with structured route handling
- **Authentication**: Replit OpenID Connect (OIDC) with Passport.js strategy
- **Session Management**: Express sessions stored in PostgreSQL with connect-pg-simple
- **AI Services**: Local processing using browser APIs and template-based generation (zero cost alternative to external APIs)
- **Training Service**: Local pattern-based training system with offline Maya assistant (zero cost)
- **Storage**: In-memory storage system to eliminate database costs (with optional PostgreSQL for production)
- **File Structure**: Modular organization with separate routes, services, and storage layers

## Data Storage
- **Primary Storage**: In-memory storage for zero-cost operation
- **Optional Database**: PostgreSQL with Neon serverless driver (for production scaling)
- **ORM**: Drizzle ORM for type-safe database operations (when database is enabled)
- **Schema**: Well-structured data models for users, content, projects, voice commands, and training conversations
- **Local Persistence**: Browser localStorage/IndexedDB for client-side data persistence
- **Cost Optimization**: Memory storage eliminates all database costs during development and testing

## Authentication & Authorization
- **Provider**: Replit Auth using OpenID Connect protocol
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **Middleware**: Custom authentication middleware for protected routes
- **User Management**: Automatic user creation/updates via OIDC claims

# External Dependencies

## AI Services (Zero Cost Local Processing)
- **Local AI Services**: Template-based content generation using browser APIs and pattern matching (zero cost)
- **Browser Speech Synthesis**: Native Web Speech API for voice generation (zero cost)
- **Local Pattern Matching**: Command processing using local algorithms (zero cost)
- **Optional External APIs**: DeepSeek R1 and Kokoro TTS available when budget allows (can be toggled)

## Authentication
- **Replit Auth**: OpenID Connect provider for user authentication
- **Passport.js**: Authentication middleware with OpenID Connect strategy

## Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **WebSocket Support**: For real-time features (configured via ws package)

## Frontend Libraries
- **Radix UI**: Headless UI component primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework for styling
- **React Hook Form**: Form handling with validation
- **Date-fns**: Date manipulation utilities

## Development Tools
- **Vite**: Fast build tool with HMR and development server
- **TypeScript**: Type safety across the entire application
- **ESLint/Prettier**: Code quality and formatting (implied by project structure)
- **Replit Integration**: Development environment with runtime error handling and cartographer plugin