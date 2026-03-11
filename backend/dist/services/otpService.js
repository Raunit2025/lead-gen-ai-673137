import supabase from "../client.js";
import ApiError from "../utils/ApiError.js";
import { Messaging, MessagingProvider } from '@uptiqai/integrations-sdk';
import bcrypt from 'bcrypt';
const OTP_EXPIRATION_TIME = 600000; // 10 minutes in milliseconds
const MAX_ATTEMPTS = 5;
/**
 * Generate and send OTP
 */
export async function generateAndSendOTP(identifier, // Phone number or email
type, purpose = 'login') {
    // Rate limiting: Check for recent OTP requests
    const { data: recentOTP } = await supabase
        .from('otps')
        .select('*')
        .eq('identifier', identifier)
        .eq('type', type)
        .gte('created_at', new Date(Date.now() - 60 * 1000).toISOString())
        .limit(1)
        .maybeSingle();
    if (recentOTP) {
        throw new ApiError(429, 'Please wait before requesting another OTP');
    }
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Hash OTP before storing
    const hashedOTP = await bcrypt.hash(otp, 10);
    // Set expiration
    const expiresAt = new Date(Date.now() + OTP_EXPIRATION_TIME).toISOString();
    // Invalidate previous unverified OTPs
    await supabase
        .from('otps')
        .update({ verified: true })
        .eq('identifier', identifier)
        .eq('type', type)
        .eq('verified', false);
    // Store new OTP
    const { error: insertError } = await supabase.from('otps').insert({
        identifier,
        type,
        otp: hashedOTP,
        expires_at: expiresAt,
        attempts: 0,
        verified: false,
        purpose
    });
    if (insertError) {
        throw new ApiError(500, insertError.message);
    }
    // Send OTP based on type
    if (type === 'phone') {
        const TwilioWhatsApp = new Messaging({ provider: MessagingProvider.TwilioWhatsApp });
        await TwilioWhatsApp.createMessage({
            to: identifier,
            body: `Your verification code is ${otp}. This code will expire in 10 minutes. Please do not share this code with anyone.`
        });
    }
}
/**
 * Verify OTP
 */
export async function verifyOTP(identifier, type, otp) {
    // Find the most recent unverified OTP
    const { data: otpRecord, error: fetchError } = await supabase
        .from('otps')
        .select('*')
        .eq('identifier', identifier)
        .eq('type', type)
        .eq('verified', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
    if (fetchError || !otpRecord) {
        throw new ApiError(404, `No OTP found for this ${type}`);
    }
    // Check expiration
    if (new Date() > new Date(otpRecord.expires_at)) {
        await supabase.from('otps').update({ verified: true }).eq('id', otpRecord.id);
        throw new ApiError(400, 'OTP has expired');
    }
    // Check attempts
    if (otpRecord.attempts >= MAX_ATTEMPTS) {
        await supabase.from('otps').update({ verified: true }).eq('id', otpRecord.id);
        throw new ApiError(400, 'Too many failed attempts. Please request a new OTP.');
    }
    // Verify OTP using bcrypt
    const isValid = await bcrypt.compare(otp, otpRecord.otp);
    if (!isValid) {
        // Increment attempts
        await supabase
            .from('otps')
            .update({ attempts: otpRecord.attempts + 1 })
            .eq('id', otpRecord.id);
        throw new ApiError(400, 'Invalid OTP');
    }
    // Mark as verified
    await supabase.from('otps').update({ verified: true }).eq('id', otpRecord.id);
    return true;
}
