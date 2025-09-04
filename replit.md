# Investment Portfolio Tracker

## Overview

This is a full-stack web application for manual investment portfolio tracking. The application allows users to register their investment operations (purchases, sales, and income) across different asset types including stocks, REITs, funds, fixed income, and crypto. It provides automated calculations for invested amounts, current values, and portfolio performance tracking through a clean dashboard interface.

The system is built as a React frontend with an Express.js backend, using PostgreSQL for data persistence and featuring a modern UI built with shadcn/ui components and Tailwind CSS.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **API Design**: RESTful API endpoints following standard HTTP methods
- **Request Handling**: Express middleware for JSON parsing, CORS, and request logging
- **Error Handling**: Centralized error handling middleware with structured error responses
- **Development Server**: Hot reload setup with Vite integration for development

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Definition**: Shared schema definitions using Drizzle with Zod validation
- **Migration Management**: Drizzle Kit for database schema migrations
- **Development Storage**: In-memory storage implementation for development/testing

### Data Models
- **Operations Table**: Stores investment transactions with fields for asset details, operation type, dates, quantities, prices, and fees
- **Users Table**: Basic user management with username/password authentication
- **Validation**: Comprehensive input validation using Zod schemas with Portuguese error messages

### External Dependencies
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: PostgreSQL-based session storage using connect-pg-simple
- **Development Tools**: Replit integration with error overlay and cartographer plugins
- **UI Components**: Extensive Radix UI component library for accessible UI elements
- **Date Handling**: date-fns library with Portuguese locale support
- **Icons**: Lucide React for consistent iconography

### Key Design Decisions
- **Type Safety**: Full TypeScript implementation with shared types between frontend and backend
- **Database Schema**: Decimal precision for financial calculations to avoid floating-point errors
- **Validation Strategy**: Client-side and server-side validation using the same Zod schemas
- **UI Architecture**: Component-based design with reusable UI components following shadcn/ui patterns
- **API Structure**: RESTful endpoints with consistent error handling and response formats
- **Development Experience**: Hot reload, error overlays, and development-specific tooling for improved DX