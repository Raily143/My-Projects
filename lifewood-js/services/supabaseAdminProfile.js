import { supabase } from '../utils/supabaseClient';

const ADMIN_PROFILES_TABLE = 'admin_profiles';
const SUPABASE_CONFIG_ERROR_MESSAGE =
  'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment (or SUPABASE_URL/SUPABASE_ANON_KEY) and redeploy.';
const DEFAULT_ADMIN_PASSWORD_HASH =
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';

const normalizeIdentifier = (value) => String(value || '').trim().toLowerCase();

const mapAdminRowToAdminUser = (row) => {
  if (!row) return null;

  const displayName = String(row.display_name || '').trim();
  const role = String(row.role || 'Admin').trim() || 'Admin';

  return {
    id: row.id,
    username: String(row.username || '').trim(),
    email: String(row.email || '').trim(),
    role,
    name: displayName || role || 'Admin',
    avatarUrl: String(row.avatar_url || '').trim(),
    passwordHash: String(row.password_hash || '').trim(),
  };
};

const upsertAdminRow = async (payload) => {
  const { data, error } = await supabase
    .from(ADMIN_PROFILES_TABLE)
    .upsert(payload, { onConflict: 'username_norm' })
    .select('*')
    .single();

  return {
    data: mapAdminRowToAdminUser(data),
    error,
  };
};

export const hashAdminPassword = async (password) => {
  const raw = String(password || '');
  if (!raw) return '';

  if (typeof crypto === 'undefined' || !crypto.subtle || typeof TextEncoder === 'undefined') {
    return raw;
  }

  const encoder = new TextEncoder();
  const bytes = encoder.encode(raw);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

export const getAdminProfileFromSupabase = async ({ identifier }) => {
  if (!supabase) {
    return {
      data: null,
      error: new Error(SUPABASE_CONFIG_ERROR_MESSAGE),
    };
  }

  const normalizedIdentifier = normalizeIdentifier(identifier);
  if (!normalizedIdentifier) {
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .from(ADMIN_PROFILES_TABLE)
    .select('*')
    .or(`username_norm.eq.${normalizedIdentifier},email_norm.eq.${normalizedIdentifier}`)
    .limit(1)
    .maybeSingle();

  return {
    data: mapAdminRowToAdminUser(data),
    error,
  };
};

export const authenticateAdminWithSupabase = async ({ identifier, password }) => {
  const profileResult = await getAdminProfileFromSupabase({ identifier });
  if (profileResult.error) {
    return { data: null, status: 'error', error: profileResult.error };
  }

  if (!profileResult.data) {
    return { data: null, status: 'not_found', error: null };
  }

  const hashedInput = await hashAdminPassword(password);
  const storedHash = String(profileResult.data.passwordHash || '').trim();

  if (!hashedInput || !storedHash || storedHash !== hashedInput) {
    return { data: null, status: 'invalid_password', error: null };
  }

  return { data: profileResult.data, status: 'success', error: null };
};

export const seedAdminProfileFromDefaults = async ({
  username = 'admin123',
  email = 'admin@lifewood.com',
  displayName = 'Admin',
  role = 'Admin',
  avatarUrl = '',
  passwordHash = DEFAULT_ADMIN_PASSWORD_HASH,
} = {}) => {
  if (!supabase) {
    return {
      data: null,
      error: new Error(SUPABASE_CONFIG_ERROR_MESSAGE),
    };
  }

  const trimmedUsername = String(username || 'admin123').trim() || 'admin123';
  const trimmedEmail = String(email || 'admin@lifewood.com').trim() || 'admin@lifewood.com';
  const trimmedRole = String(role || 'Admin').trim() || 'Admin';
  const trimmedDisplayName = String(displayName || '').trim() || trimmedRole || 'Admin';
  const nextPasswordHash = String(passwordHash || '').trim() || DEFAULT_ADMIN_PASSWORD_HASH;

  return upsertAdminRow({
    username: trimmedUsername,
    username_norm: normalizeIdentifier(trimmedUsername),
    email: trimmedEmail,
    email_norm: normalizeIdentifier(trimmedEmail),
    display_name: trimmedDisplayName,
    role: trimmedRole,
    avatar_url: String(avatarUrl || '').trim(),
    password_hash: nextPasswordHash,
    updated_at: new Date().toISOString(),
  });
};

export const updateAdminProfileInSupabase = async ({
  username,
  email,
  displayName,
  avatarUrl,
}) => {
  if (!supabase) {
    return {
      data: null,
      error: new Error(SUPABASE_CONFIG_ERROR_MESSAGE),
    };
  }

  const trimmedUsername = String(username || '').trim();
  if (!trimmedUsername) {
    return {
      data: null,
      error: new Error('Admin username is required to update profile.'),
    };
  }

  const updatePayload = {
    updated_at: new Date().toISOString(),
  };

  if (typeof displayName === 'string') {
    updatePayload.display_name = String(displayName || '').trim();
  }

  if (typeof email === 'string') {
    const trimmedEmail = String(email || '').trim();
    updatePayload.email = trimmedEmail;
    updatePayload.email_norm = normalizeIdentifier(trimmedEmail);
  }

  if (typeof avatarUrl === 'string') {
    updatePayload.avatar_url = String(avatarUrl || '').trim();
  }

  const { data, error } = await supabase
    .from(ADMIN_PROFILES_TABLE)
    .update(updatePayload)
    .eq('username_norm', normalizeIdentifier(trimmedUsername))
    .select('*')
    .single();

  return {
    data: mapAdminRowToAdminUser(data),
    error,
  };
};

export const updateAdminPasswordInSupabase = async ({
  username,
  currentPassword,
  newPassword,
}) => {
  if (!supabase) {
    return {
      data: null,
      error: new Error(SUPABASE_CONFIG_ERROR_MESSAGE),
    };
  }

  const trimmedUsername = String(username || '').trim();
  if (!trimmedUsername) {
    return {
      data: null,
      error: new Error('Admin username is required to update password.'),
    };
  }

  const currentPasswordHash = await hashAdminPassword(currentPassword);
  const newPasswordHash = await hashAdminPassword(newPassword);

  if (!currentPasswordHash || !newPasswordHash) {
    return {
      data: null,
      error: new Error('Both current and new password are required.'),
    };
  }

  const profileResult = await getAdminProfileFromSupabase({ identifier: trimmedUsername });
  if (profileResult.error) {
    return { data: null, error: profileResult.error };
  }

  if (!profileResult.data) {
    return {
      data: null,
      error: new Error('Admin profile not found.'),
    };
  }

  const storedHash = String(profileResult.data.passwordHash || '').trim();
  if (!storedHash || storedHash !== currentPasswordHash) {
    return {
      data: null,
      error: new Error('Current password is incorrect.'),
    };
  }

  const { data, error } = await supabase
    .from(ADMIN_PROFILES_TABLE)
    .update({
      password_hash: newPasswordHash,
      updated_at: new Date().toISOString(),
    })
    .eq('username_norm', normalizeIdentifier(trimmedUsername))
    .select('*')
    .single();

  return {
    data: mapAdminRowToAdminUser(data),
    error,
  };
};
