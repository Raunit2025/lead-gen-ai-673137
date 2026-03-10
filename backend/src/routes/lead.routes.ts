import { Hono } from 'hono';
import * as leadController from '../controllers/leadController.ts';
import { authMiddleware } from '../middlewares/authMiddleware.ts';
import catchAsync from '../utils/catchAsync.ts';

const leadRoutes = new Hono();

// All lead routes require authentication
leadRoutes.use('*', authMiddleware);

/**
 * GET /leads
 * Get all saved leads for current user
 */
leadRoutes.get('/', catchAsync(leadController.getSavedLeads));

/**
 * POST /leads
 * Save a new lead or update existing one
 */
leadRoutes.post('/', catchAsync(leadController.saveLead));

/**
 * PATCH /leads/:id
 * Update an existing lead
 */
leadRoutes.patch('/:id', catchAsync(leadController.updateLead));

/**
 * DELETE /leads/:id
 * Remove a lead (soft delete)
 */
leadRoutes.delete('/:id', catchAsync(leadController.removeLead));

export default leadRoutes;
