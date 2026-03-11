import * as leadController from "../controllers/leadController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import catchAsync from "../utils/catchAsync.js";
import { Hono } from 'hono';
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
