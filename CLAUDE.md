# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is Highlight.io, a full-stack observability platform that provides session replay, error monitoring, logging, and distributed tracing capabilities. The repository is structured as a monorepo containing:

- **Backend**: Go-based GraphQL API server with dual public/private GraphQL endpoints
- **Frontend**: React/TypeScript dashboard application built with Vite
- **SDKs**: Multi-language client libraries for integrating with Highlight
- **RRWeb**: Forked session replay recording library (submodule)
- **Infrastructure**: Docker compose and deployment configurations

## Key Development Commands

### Backend Development
```bash
# In /backend directory
make start            # Start backend with doppler (recommended)
make start-no-doppler # Start backend without doppler
make debug            # Start with debugger attached
make test             # Run all tests with race detection
make migrate          # Run database migrations
make public-gen       # Generate public GraphQL schema
make private-gen      # Generate private GraphQL schema
```

### Frontend Development
```bash
# In /frontend directory
yarn dev              # Start development server
yarn build            # Build production bundle
yarn test             # Run tests
yarn test:watch       # Run tests in watch mode
yarn types:check      # TypeScript type checking
yarn lint             # Run ESLint
yarn codegen          # Generate GraphQL types from schema
```

### Monorepo Commands
```bash
# In root directory
yarn build:all        # Build all packages
yarn test:all         # Run all tests
yarn dev              # Start all dev services (frontend + backend)
yarn dev:frontend     # Start only frontend
yarn dev:backend      # Start only backend
yarn lint             # Run linting across all packages
```

### Docker Development
```bash
# In /docker directory
docker-compose up     # Start all infrastructure services
# or use the convenience script:
./run-hobby.sh        # Start hobby deployment
```

## Architecture Overview

### Backend Architecture
- **Language**: Go 1.23+ with Chi HTTP router
- **Database**: PostgreSQL (GORM) for application data, ClickHouse for analytics/time-series data
- **Message Queue**: Apache Kafka for async processing
- **Cache**: Redis for caching and session management
- **GraphQL**: Dual endpoints - public (data ingestion) and private (dashboard)
- **Runtime Modes**: Can run as all-in-one, or split into public-graph, private-graph, and worker services

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with SWC for transpilation
- **State Management**: Apollo Client for GraphQL state
- **Styling**: Tailwind CSS + CSS modules
- **Routing**: React Router v6
- **Monorepo**: Yarn workspaces with Turborepo

### Key Data Flow
1. **Data Ingestion**: Client SDKs → Public GraphQL → Kafka → Worker processes → Database
2. **Dashboard**: Frontend → Private GraphQL → Database queries
3. **Session Replay**: RRWeb recording → Compression → S3/filesystem storage
4. **Real-time**: WebSocket subscriptions for live data updates

## Common Development Patterns

### GraphQL Schema Generation
After modifying GraphQL schemas, regenerate types:
```bash
# For backend changes
make public-gen   # or make private-gen
# For frontend changes
yarn codegen
```

### Testing Strategy
- **Backend**: Go tests with race detection enabled
- **Frontend**: Vitest for unit tests, includes setup for GraphQL mocking
- **Database**: Test-specific database setup with environment variables

### Code Generation
- **Backend**: Uses gqlgen for GraphQL code generation
- **Frontend**: Uses graphql-codegen for TypeScript types
- **Build System**: Turborepo handles dependencies and caching

## Database Operations

### Development Database Setup
```bash
# Backend migrations
make migrate

# ClickHouse migrations run automatically on startup
```

### Environment Variables
The backend uses doppler for secrets management in development. Key variables:
- `PSQL_HOST`, `PSQL_PORT`, `PSQL_USER`, `PSQL_PASSWORD`: PostgreSQL connection
- `CLICKHOUSE_ADDRESS`, `CLICKHOUSE_USERNAME`: ClickHouse connection
- `KAFKA_SERVERS`: Kafka broker addresses

## Development Workflow

### Getting Started
1. **Prerequisites**: Go 1.23+, Node.js 18+, Docker, Doppler CLI
2. **Start Infrastructure**: `cd docker && docker-compose up`
3. **Backend Setup**: `cd backend && make migrate && make start`
4. **Frontend Setup**: `cd frontend && yarn dev`

### Making Changes
1. **Backend GraphQL**: Modify schema → `make public-gen` or `make private-gen`
2. **Frontend**: TypeScript changes trigger hot reload via Vite
3. **Database**: Add migration files, run `make migrate`

### Testing
```bash
# Run backend tests
cd backend && make test

# Run frontend tests
cd frontend && yarn test

# Run all tests
yarn test:all
```

## Build and Deployment

### Production Build
```bash
# Build everything
yarn build:all

# Build specific parts
yarn build:frontend
yarn build:backend
yarn build:sdk
```

### Docker Deployment
- **Hobby**: Single-node deployment with `docker/run-hobby.sh`
- **Enterprise**: Scalable deployment with separate services
- **Development**: Local services via `docker-compose up`

## Code Organization

### Backend Structure
- `main.go`: Application entrypoint with runtime configuration
- `public-graph/`: GraphQL schema and resolvers for data ingestion
- `private-graph/`: GraphQL schema and resolvers for dashboard
- `worker/`: Async processing handlers
- `model/`: Database models and migrations
- `store/`: Data access layer
- `clickhouse/`: ClickHouse-specific queries and schema

### Frontend Structure
- `src/index.tsx`: Application entrypoint
- `src/components/`: Reusable UI components
- `src/pages/`: Route-specific components
- `src/graph/`: GraphQL queries and generated types
- `src/util/`: Utility functions and helpers

### SDK Structure
- `sdk/highlight-*/`: Language-specific client libraries
- `sdk/highlight-run/`: Core JavaScript SDK
- Each SDK follows language-specific patterns and conventions

## Important Notes

- **Hot Reload**: Frontend supports hot reload; backend uses Air for live reload
- **GraphQL**: Always run codegen after schema changes
- **Environment**: Use doppler for secrets in development
- **Debugging**: Backend supports delve debugger on port 2345
- **Performance**: ClickHouse is used for high-volume analytics queries
- **Security**: CORS is configured differently for public vs private endpoints