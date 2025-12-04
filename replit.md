# GlycoGuide - Diabetes Management Platform

## Overview
GlycoGuide is a diabetes management platform offering a balanced, supportive, and sustainable approach to wellness. It integrates modern nutrition science with mindful awareness, providing tools for blood sugar tracking, glycemic-index-aware meal planning, food logging, and various wellness practices. The platform aims to be a holistic wellness companion focused on lasting well-being for health-conscious individuals, helping them understand the interplay of food, movement, and lifestyle. GlycoGuide operates on a freemium model with three subscription tiers.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Design System**: Utilizes shadcn/ui and Radix UI primitives with Tailwind CSS for a consistent, modern aesthetic.
- **Visuals**: Features a Circadian Rhythm Immersive Experience with a dynamic 24-hour cycle interface, time-based greetings, ambient animations, and personalized affirmations using Framer Motion.
- **Audio**: Includes an Ambient Audio Mode with calming tracks and a 3-note welcome chime via Web Audio API.
- **Micro-Animations**: Framer Motion is used for enhanced user feedback and delight.
- **Brand Voice**: Maintains a consistent brand voice and language standards across all communications.

### Technical Implementations
- **Frontend**: Developed with React 18, TypeScript, and Vite for bundling. TanStack Query manages state, and React Hook Form with Zod handles forms.
- **Backend**: Built using Node.js with Express.js and TypeScript.
- **Database**: PostgreSQL hosted on Neon (serverless) with Drizzle ORM and Drizzle Kit for schema management.
- **Authentication**: Custom email/password authentication leveraging Passport.js (passport-local strategy) and scrypt for password hashing.
- **API Design**: Adheres to RESTful principles.

### Feature Specifications
- **Advanced Nutrition Platform**: Offers a 6-tab interface with meal browsing (500+ low glycemic meals), GI education, carb counting, intelligent meal planning with glucose impact predictions, blood sugar analysis, and personalized smart tips. All meals adhere to low glycemic standards (GI ≤ 55).
- **Freemium Monetization**: Implements a subscription system with Free, Premium, and Pro tiers, integrated with Stripe, offering varying access to features.
- **Enhanced Weekly Health Tracker**: Multi-category health monitoring (Sleep, Hydration, Exercise, BM) with visual indicators.
- **CGM Data System**: Supports import (CSV/JSON for Dexcom & Libre), visualization, and 24-hour trend charts with meal overlays.
- **Community Moderation System**: Full-stack implementation for content approval/rejection and admin notifications.
- **Wellness Education System**: Integrated articles covering Hydration, Mindfulness, Exercise, Energy, Digestive Health, and Sleep.
- **Personalization Features**: Includes daily greetings, a Journey Tracker with streaks and badges, and a Mood Insights Dashboard.
- **Community Reflection Feed**: Provides anonymous wellness sharing with profanity filtering, emoji reactions, real-time updates, and local, privacy-first sentiment analysis.
- **Adaptive Wellness Insights**: Advanced pattern analysis derived from mood and energy logs.
- **Emotion-Aware Reminders**: Email-based wellness check-ins with opt-in preferences and timezone support.
- **Seasonal Updates Infrastructure**: Utilizes a feature flag system for quarterly content refreshes.
- **User Onboarding**: A 6-screen onboarding flow guides users through region selection, health focus preferences, and privacy notice, with preferences saved to the backend.
- **Daily Reflections & Tracking**: Displays daily mindfulness prompts and holiday/religious observances. Includes dedicated pages for blood sugar and blood pressure tracking with logging forms, history, and statistics.
- **Animated Streak Badge**: Features an animated streak badge with a 4-tier milestone journey (7, 30, 60, 90 days), offering contextual rewards and quotes.

### System Design Choices
- **User Account System**: Secure and private, featuring signup, login, and password recovery, integrated with SendGrid for branded email communications.
- **Privacy-First Design**: Emphasizes user privacy and a guided user experience across all account features.
- **Authentication State Management**: Critical use of `isLoading || (isFetching && user === undefined) || status === 'pending'` in `useAuth` hook to prevent race conditions and intermittent 404 errors on protected routes.
- **React Hooks Usage**: All hooks are called at the top of components before any conditional returns to ensure consistent rendering.

## External Dependencies

### Payment & Subscription
- **Stripe**: Payment processing and subscription billing.

### Database & ORM
- **Neon Database**: Serverless PostgreSQL hosting.
- **Drizzle ORM**: Type-safe database toolkit for PostgreSQL.

### Authentication & Session Management
- **Passport.js**: Custom local authentication strategy.
- **Scrypt**: Secure password hashing.
- **Express Session**: Session-based authentication.
- **connect-pg-simple**: PostgreSQL session store.
- **SendGrid**: Transactional email service for user communications.

### UI & Styling
- **Radix UI**: Headless UI primitives.
- **shadcn/ui**: Component library built on Radix UI and Tailwind CSS.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide React**: Icon library.
- **Framer Motion**: Advanced animation library.
- **Google Fonts**: Web font delivery.

### Frontend Libraries & Tools
- **TypeScript**: For static type checking across the codebase.
- **Vite**: Fast build tool for the frontend.
- **TanStack Query**: Data fetching, caching, and synchronization.
- **React Hook Form**: For form management and validation.
- **Zod**: Schema declaration and validation library.
- **Date-fns**: Comprehensive date utility library.

### Development & Hosting
- **Replit Platform**: The primary development environment.