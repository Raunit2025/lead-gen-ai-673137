import prisma from "../client.js";
import bcrypt from 'bcrypt';
/**
 * User Service - Simplified for LeadGen AI
 */
/**
 * Find or create user - modified to support simpler schema
 */
export async function getUserById(userId) {
    return await prisma.user.findUnique({
        where: { id: userId }
    });
}
/**
 * Get user by email
 */
export async function getUserByEmail(email) {
    return await prisma.user.findUnique({
        where: { email }
    });
}
/**
 * Register user with email and password (simplified)
 */
export async function registerWithEmailPassword(email, password, name) {
    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        throw new Error('User with this email already exists');
    }
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    // Create user with email/password directly on model
    const newUser = await prisma.user.create({
        data: {
            email,
            name: name || null,
            password: passwordHash,
            isDeleted: false
        }
    });
    return newUser;
}
/**
 * Authenticate user with email and password (simplified)
 */
export async function authenticateWithEmailPassword(email, password) {
    // Find user
    const user = await prisma.user.findUnique({
        where: { email }
    });
    if (!user || !user.password) {
        throw new Error('Invalid email or password');
    }
    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        throw new Error('Invalid email or password');
    }
    return user;
}
/**
 * Get user identities - for backward compatibility if needed
 */
export async function getUserIdentities(userId) {
    return await prisma.userIdentity.findMany({
        where: { userId }
    });
}
/**
 * Unlink identity - for backward compatibility
 */
export async function unlinkIdentity(userId, provider) {
    await prisma.userIdentity.updateMany({
        where: {
            userId,
            provider
        },
        data: {
            isDeleted: true
        }
    });
}
/**
 * findOrCreateUser - kept for compatibility with OAuth controllers if they still use it
 */
export async function findOrCreateUser(profile, metadata) {
    const existingUser = await prisma.user.findUnique({
        where: { email: profile.email }
    });
    if (existingUser)
        return existingUser;
    return await prisma.user.create({
        data: {
            email: profile.email,
            name: profile.name || null,
            password: '', // OAuth users have no password
            isDeleted: false
        }
    });
}
/**
 * findOrCreateUserByPhone - for compatibility with phone OTP
 */
export async function findOrCreateUserByPhone(phone, name) {
    const placeholderEmail = `${phone.replace(/[^0-9]/g, '')}@phone.local`;
    const existingUser = await prisma.user.findUnique({
        where: { email: placeholderEmail }
    });
    if (existingUser)
        return existingUser;
    return await prisma.user.create({
        data: {
            email: placeholderEmail,
            name: name || null,
            password: '', // Phone users have no password
            isDeleted: false
        }
    });
}
