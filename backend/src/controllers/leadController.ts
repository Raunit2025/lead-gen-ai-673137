import supabase from '../client.ts';
import ApiError from '../utils/ApiError.ts';
import catchAsync from '../utils/catchAsync.ts';
import { Context } from 'hono';

/**
 * Helper to map snake_case database columns to camelCase frontend fields
 */
const toCamelCase = (lead: any) => {
    if (!lead) return null;
    return {
        id: lead.id,
        userId: lead.user_id,
        companyName: lead.company_name,
        industry: lead.industry,
        website: lead.website,
        email: lead.email,
        linkedin: lead.linkedin,
        generatedEmail: lead.generated_email,
        generatedLinkedin: lead.generated_linkedin,
        isDeleted: lead.is_deleted,
        createdAt: lead.created_at,
        updatedAt: lead.updated_at
    };
};

/**
 * Get all saved leads for the current user
 */
export const getSavedLeads = catchAsync(async (c: Context) => {
    const userId = c.get('userId');

    const { data, error } = await supabase
        .from('saved_leads')
        .select('*')
        .eq('user_id', userId)
        .eq('is_deleted', false);

    if (error) {
        throw new ApiError(500, error.message);
    }

    return c.json(data?.map(toCamelCase) || []);
});

/**
 * Save a lead
 */
export const saveLead = catchAsync(async (c: Context) => {
    const userId = c.get('userId');
    const body = await c.req.json();

    const { id, companyName, industry, website, email, linkedin, generatedEmail, generatedLinkedin } = body;

    if (!companyName) {
        throw new ApiError(400, 'Company name is required');
    }

    // Validate if ID is a valid UUID
    const isValidId = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const leadData: any = {
        user_id: userId,
        company_name: companyName,
        industry,
        website,
        email,
        linkedin,
        generated_email: generatedEmail,
        generated_linkedin: generatedLinkedin,
        is_deleted: false,
        updated_at: new Date().toISOString()
    };

    let lead;
    if (isValidId) {
        // Check if lead exists and who it belongs to
        const { data: existingLead } = await supabase.from('saved_leads').select('*').eq('id', id).maybeSingle();

        if (existingLead) {
            if (existingLead.user_id === userId) {
                // It belongs to the current user, update it
                const { data: updatedData, error: updateError } = await supabase
                    .from('saved_leads')
                    .update(leadData)
                    .eq('id', id)
                    .select()
                    .single();

                if (updateError) throw new ApiError(500, updateError.message);
                lead = updatedData;
            } else {
                // Collision: ID exists but belongs to someone else
                // Create a new record for this user with a fresh ID
                const { data: newData, error: insertError } = await supabase
                    .from('saved_leads')
                    .insert(leadData)
                    .select()
                    .single();

                if (insertError) throw new ApiError(500, insertError.message);
                lead = newData;
            }
        } else {
            // Doesn't exist, try insert with provided ID
            leadData.id = id;
            const { data: newData, error: insertError } = await supabase
                .from('saved_leads')
                .insert(leadData)
                .select()
                .single();

            if (insertError) {
                // Handle unique constraint violation (Postgres error code 23505)
                if (insertError.code === '23505') {
                    const { data: existing } = await supabase
                        .from('saved_leads')
                        .select('*')
                        .eq('id', id)
                        .maybeSingle();

                    if (existing && existing.user_id === userId) {
                        // It belongs to us, update it
                        const { data: updatedData, error: updateError } = await supabase
                            .from('saved_leads')
                            .update(leadData)
                            .eq('id', id)
                            .select()
                            .single();
                        if (updateError) throw new ApiError(500, updateError.message);
                        lead = updatedData;
                    } else {
                        // Collision or belongs to someone else, create with fresh ID
                        delete leadData.id;
                        const { data: newData2, error: insertError2 } = await supabase
                            .from('saved_leads')
                            .insert(leadData)
                            .select()
                            .single();
                        if (insertError2) throw new ApiError(500, insertError2.message);
                        lead = newData2;
                    }
                } else {
                    throw new ApiError(500, insertError.message);
                }
            } else {
                lead = newData;
            }
        }
    } else {
        // No valid ID provided, create new
        const { data: newData, error: insertError } = await supabase
            .from('saved_leads')
            .insert(leadData)
            .select()
            .single();

        if (insertError) throw new ApiError(500, insertError.message);
        lead = newData;
    }

    return c.json(toCamelCase(lead));
});

/**
 * Remove a lead
 */
export const removeLead = catchAsync(async (c: Context) => {
    const userId = c.get('userId');
    const leadId = c.req.param('id');

    const { error } = await supabase
        .from('saved_leads')
        .update({ is_deleted: true })
        .eq('id', leadId)
        .eq('user_id', userId);

    if (error) {
        throw new ApiError(500, error.message);
    }

    return c.json({ message: 'Lead removed successfully' });
});

/**
 * Update a lead
 */
export const updateLead = catchAsync(async (c: Context) => {
    const userId = c.get('userId');
    const leadId = c.req.param('id');
    const body = await c.req.json();

    const { companyName, industry, website, email, linkedin, generatedEmail, generatedLinkedin } = body;

    // Check ownership and existence first
    const { data: lead, error: fetchError } = await supabase
        .from('saved_leads')
        .select('*')
        .eq('id', leadId)
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .maybeSingle();

    if (fetchError || !lead) {
        throw new ApiError(404, 'Lead not found');
    }

    const { data: updatedLead, error: updateError } = await supabase
        .from('saved_leads')
        .update({
            company_name: companyName,
            industry,
            website,
            email,
            linkedin,
            generated_email: generatedEmail,
            generated_linkedin: generatedLinkedin,
            updated_at: new Date().toISOString()
        })
        .eq('id', leadId)
        .select()
        .single();

    if (updateError) {
        throw new ApiError(500, updateError.message);
    }

    return c.json(toCamelCase(updatedLead));
});
