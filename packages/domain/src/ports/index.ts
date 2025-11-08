/**
 * Ports (Interfaces)
 *
 * Hexagonal architecture ports defining contracts between domain and adapters
 *
 * Structure:
 * - repositories/ - Data persistence contracts
 * - services/ - External service contracts
 */

// Export ports as they are created
export * from './repositories';

export {};
