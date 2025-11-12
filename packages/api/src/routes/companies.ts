import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { requireAuth, getAuthUser } from '../middleware/auth';
import { db } from '@es-mono/database';
import { DrizzleCompanyRepository } from '../repositories/implementations/DrizzleCompanyRepository';

const companiesRoutes = new Hono();

// Initialize repository
const companyRepository = new DrizzleCompanyRepository(db);

/**
 * GET /api/companies
 * Get all companies in the network
 */
companiesRoutes.get('/', requireAuth, async (c) => {
  const companies = await companyRepository.findAll();

  return c.json({ companies });
});

/**
 * GET /api/companies/:id
 * Get a specific company by ID
 */
companiesRoutes.get('/:id', requireAuth, async (c) => {
  const { id } = c.req.param();

  const company = await companyRepository.findById(id);

  if (!company) {
    return c.json({ error: 'Company not found' }, 404);
  }

  return c.json({ company });
});

/**
 * PATCH /api/companies/:id
 * Update a company's profile
 */
companiesRoutes.patch(
  '/:id',
  requireAuth,
  zValidator(
    'json',
    z.object({
      industry: z.string().min(1).optional(),
      size: z.enum(['1-10', '11-50', '51-200', '201-500']).optional(),
    })
  ),
  async (c) => {
    const user = getAuthUser(c);
    const { id } = c.req.param();
    const updates = c.req.valid('json');

    // Verify user belongs to the company they're trying to update
    if (user.companyId !== id) {
      return c.json({ error: 'Unauthorized to update this company' }, 403);
    }

    // Verify company exists
    const existingCompany = await companyRepository.findById(id);
    if (!existingCompany) {
      return c.json({ error: 'Company not found' }, 404);
    }

    // Update company
    const updatedCompany = await companyRepository.update(id, updates);

    return c.json({
      message: 'Company updated successfully',
      company: updatedCompany,
    });
  }
);

/**
 * POST /api/companies/validate-invite
 * Validate an invite code
 */
companiesRoutes.post(
  '/validate-invite',
  zValidator(
    'json',
    z.object({
      inviteCode: z.string().length(8),
    })
  ),
  async (c) => {
    const { inviteCode } = c.req.valid('json');

    const isValid = await companyRepository.isInviteCodeValid(inviteCode);

    return c.json({ valid: isValid });
  }
);

// Export route type for Hono RPC type inference
export type CompaniesAPI = typeof companiesRoutes;

export default companiesRoutes;
