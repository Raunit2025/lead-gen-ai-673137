import prisma from "../client.js";
import catchAsync from "../utils/catchAsync.js";
import ApiError from "../utils/ApiError.js";
/**
 * Get all saved leads for the current user
 */
export const getSavedLeads = catchAsync(async (c) => {
    const userId = c.get('userId');
    const leads = await prisma.savedLead.findMany({
        where: { userId, isDeleted: false }
    });
    return c.json(leads);
});
/**
 * Save a lead
 */
export const saveLead = catchAsync(async (c) => {
    const userId = c.get('userId');
    const body = await c.req.json();
    const { id, companyName, industry, website, email, linkedin, generatedEmail, generatedLinkedin } = body;
    if (!companyName) {
        throw new ApiError(400, 'Company name is required');
    }
    // Use upsert-like logic but with ownership check
    const isValidId = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const leadData = {
        userId,
        companyName,
        industry,
        website,
        email,
        linkedin,
        generatedEmail,
        generatedLinkedin,
        isDeleted: false,
        updatedAt: new Date()
    };
    let lead;
    if (isValidId) {
        // Check if lead exists and who it belongs to
        const existingLead = await prisma.savedLead.findUnique({
            where: { id }
        });
        if (existingLead) {
            if (existingLead.userId === userId) {
                // It belongs to the current user, update it
                lead = await prisma.savedLead.update({
                    where: { id },
                    data: { ...leadData, updatedAt: new Date() }
                });
            }
            else {
                // Collision: ID exists but belongs to someone else (likely mock data)
                // Create a new record for this user with a fresh ID
                lead = await prisma.savedLead.create({
                    data: { ...leadData, id: undefined }
                });
            }
        }
        else {
            // Doesn't exist, create with provided ID
            try {
                lead = await prisma.savedLead.create({
                    data: { ...leadData, id }
                });
            }
            catch (error) {
                // Handle race condition where another request might have created it
                if (error.code === 'P2002') {
                    // Check ownership of the lead that was just created
                    const existing = await prisma.savedLead.findUnique({
                        where: { id }
                    });
                    if (existing && existing.userId === userId) {
                        // It belongs to us, update it
                        lead = await prisma.savedLead.update({
                            where: { id },
                            data: { ...leadData, updatedAt: new Date() }
                        });
                    }
                    else {
                        // Collision or belongs to someone else, create with fresh ID
                        lead = await prisma.savedLead.create({
                            data: { ...leadData, id: undefined }
                        });
                    }
                }
                else {
                    throw error;
                }
            }
        }
    }
    else {
        // No valid ID provided, create new
        lead = await prisma.savedLead.create({
            data: { ...leadData, id: undefined }
        });
    }
    return c.json(lead);
});
/**
 * Remove a lead
 */
export const removeLead = catchAsync(async (c) => {
    const userId = c.get('userId');
    const leadId = c.req.param('id');
    // Use updateMany for atomicity and implicit ownership check
    await prisma.savedLead.updateMany({
        where: { id: leadId, userId },
        data: { isDeleted: true }
    });
    return c.json({ message: 'Lead removed successfully' });
});
/**
 * Update a lead
 */
export const updateLead = catchAsync(async (c) => {
    const userId = c.get('userId');
    const leadId = c.req.param('id');
    const body = await c.req.json();
    const { companyName, industry, website, email, linkedin, generatedEmail, generatedLinkedin } = body;
    // Check ownership and existence first
    const lead = await prisma.savedLead.findFirst({
        where: { id: leadId, userId, isDeleted: false }
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
            generatedLinkedin,
            updatedAt: new Date()
        }
    });
    return c.json(updatedLead);
});
