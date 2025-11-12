/**
 * Repository Layer
 *
 * This module provides the repository pattern implementation for data access.
 * - Interfaces: Define contracts for data operations (ports in hexagonal architecture)
 * - Implementations: Concrete implementations using Drizzle ORM (adapters)
 *
 * This separation enables:
 * - Easy mocking for unit tests
 * - Swapping implementations (e.g., SQLite → PostgreSQL)
 * - Business logic independence from infrastructure
 */

export * from './interfaces';
export * from './implementations';
