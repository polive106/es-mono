import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { requireAuth, getAuthUser } from '../middleware/auth';
import { db } from '@es-mono/database';
import { DrizzleCompanyRepository } from '../repositories/implementations/DrizzleCompanyRepository';
import type { CompanyRepository } from '@es-mono/domain';

const companiesRoutes = new Hono();

// Initialize repository using domain port interface
const companyRepository: CompanyRepository = new DrizzleCompanyRepository(db);

/**
 * GET /api/companies
 * Get all companies in the network
 */
companiesRoutes.get('/', requireAuth, async (c) => {
  const companies = await companyRepository.findAll();

  // Convert domain entities to plain objects for JSON response
  const companiesData = companies.map((company) => company.toObject());

  return c.json({ companies: companiesData });
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

  return c.json({ company: company.toObject() });
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

    // Get existing company (domain entity)
    const existingCompany = await companyRepository.findById(id);
    if (!existingCompany) {
      return c.json({ error: 'Company not found' }, 404);
    }

    // Apply updates using domain entity methods (includes validation)
    if (updates.industry) {
      existingCompany.updateIndustry(updates.industry);
    }
    if (updates.size) {
      existingCompany.updateSize(updates.size);
    }

    // Persist via repository
    const updatedCompany = await companyRepository.update(existingCompany);

    return c.json({
      message: 'Company updated successfully',
      company: updatedCompany.toObject(),
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
