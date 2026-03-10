import { Context } from 'hono';
import prisma from '../client.ts';
import catchAsync from '../utils/catchAsync.ts';
import ApiError from '../utils/ApiError.ts';

/**
 * Get all saved leads for the current user
 */
export const getSavedLeads = catchAsync(async (c: Context) => {
    const userId = c.get('userId');
    
    const leads = await prisma.savedLead.findMany({
        where: { userId }
    });
    
    return c.json(leads);
});

/**
 * Save a lead
 */
export const saveLead = catchAsync(async (c: Context) => {
    const userId = c.get('userId');
    const body = await c.req.json();
    
    const { id, companyName, industry, website, email, linkedin, generatedEmail } = body;
    
    if (!companyName) {
        throw new ApiError(400, 'Company name is required');
    }

    const lead = await prisma.savedLead.upsert({
        where: { id: id || '' },
        update: {
            companyName,
            industry,
            website,
            email,
            linkedin,
            generatedEmail,
            updatedAt: new Date()
        },
        create: {
            id: id || undefined,
            userId,
            companyName,
            industry,
            website,
            email,
            linkedin,
            generatedEmail
        }
    });
    
    return c.json(lead);
});

/**
 * Remove a lead
 */
export const removeLead = catchAsync(async (c: Context) => {
    const userId = c.get('userId');
    const leadId = c.req.param('id');
    
    const lead = await prisma.savedLead.findFirst({
        where: { id: leadId, userId }
    });
    
    if (!lead) {
        throw new ApiError(404, 'Lead not found');
    }
    
    await prisma.savedLead.update({
        where: { id: leadId },
        data: { isDeleted: true }
    });
    
    return c.json({ message: 'Lead removed successfully' });
});

/**
 * Update a lead
 */
export const updateLead = catchAsync(async (c: Context) => {
    const userId = c.get('userId');
    const leadId = c.req.param('id');
    const body = await c.req.json();
    
    const { companyName, industry, website, email, linkedin, generatedEmail } = body;
    
    const lead = await prisma.savedLead.findFirst({
        where: { id: leadId, userId }
    });
    
    if (!lead) {
        throw new ApiError(404, 'Lead not found');
    }
    
    const updatedLead = await prisma.savedLead.update({
        where: { id: leadId },
        data: {
            companyName,
            industry,
            website,
            email,
            linkedin,
            generatedEmail,
            updatedAt: new Date()
        }
    });
    
    return c.json(updatedLead);
});
