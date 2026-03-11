import supabase from "../client.js";
import bcrypt from 'bcrypt';
/**
 * User Service - Supabase implementation
 */
const toCamelCase = (user) => {
    if (!user)
        return null;
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        password: user.password,
        isDeleted: user.is_deleted,
        createdAt: user.created_at,
        updatedAt: user.updated_at
    };
};
/**
 * Get user by ID
 */
export async function getUserById(userId) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .eq('is_deleted', false)
        .maybeSingle();
    if (error)
        return null;
    return toCamelCase(data);
}
/**
 * Get user by email
 */
export async function getUserByEmail(email) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('is_deleted', false)
        .maybeSingle();
    if (error)
        return null;
    return toCamelCase(data);
}
/**
 * Register user with email and password
 */
export async function registerWithEmailPassword(email, password, name) {
    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        throw new Error('User with this email already exists');
    }
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
        .from('users')
        .insert({
        email,
        name: name || null,
        password: passwordHash,
        is_deleted: false
    })
        .select()
        .single();
    if (error)
        throw new Error(error.message);
    return toCamelCase(data);
}
/**
 * Authenticate user with email and password
 */
export async function authenticateWithEmailPassword(email, password) {
    // Find user
    const user = await getUserByEmail(email);
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
 * Get user identities
 */
export async function getUserIdentities(userId) {
    const { data, error } = await supabase
        .from('user_identities')
        .select('*')
        .eq('user_id', userId)
        .eq('is_deleted', false);
    if (error)
        return [];
    return data;
}
/**
 * Unlink identity
 */
export async function unlinkIdentity(userId, provider) {
    const { error } = await supabase
        .from('user_identities')
        .update({ is_deleted: true })
        .eq('user_id', userId)
        .eq('provider', provider)
        .eq('is_deleted', false);
    if (error)
        throw new Error(error.message);
}
/**
 * findOrCreateUser
 */
export async function findOrCreateUser(profile) {
    const existingUser = await getUserByEmail(profile.email);
    if (existingUser)
        return existingUser;
    const { data, error } = await supabase
        .from('users')
        .insert({
        email: profile.email,
        name: profile.name || null,
        password: '', // OAuth users have no password
        is_deleted: false
    })
        .select()
        .single();
    if (error)
        throw new Error(error.message);
    return toCamelCase(data);
}
/**
 * findOrCreateUserByPhone
 */
export async function findOrCreateUserByPhone(phone, name) {
    const placeholderEmail = `${phone.replace(/[^0-9]/g, '')}@phone.local`;
    const existingUser = await getUserByEmail(placeholderEmail);
    if (existingUser)
        return existingUser;
    const { data, error } = await supabase
        .from('users')
        .insert({
        email: placeholderEmail,
        name: name || null,
        password: '', // Phone users have no password
        is_deleted: false
    })
        .select()
        .single();
    if (error)
        throw new Error(error.message);
    return toCamelCase(data);
}
