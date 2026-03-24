import { supabase } from '../utils/supabaseClient';

const ADMIN_PROFILES_TABLE = 'admin_profiles';
const ADMIN_PROFILE_EDITS_TABLE = 'admin_pics';
const ADMIN_AVATAR_BUCKET =
  import.meta?.env?.VITE_SUPABASE_AVATAR_BUCKET ||
  (typeof process !== 'undefined' ? process?.env?.SUPABASE_AVATAR_BUCKET : '') ||
  'avatars';
const SUPABASE_CONFIG_ERROR_MESSAGE =
  'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment (or SUPABASE_URL/SUPABASE_ANON_KEY) and redeploy.';
const DEFAULT_ADMIN_PASSWORD_HASH =
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';

const normalizeIdentifier = (value) => String(value || '').trim().toLowerCase();
const sanitizeSegment = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

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

const upsertAdminProfileEditRow = async (payload) => {
  const { data, error } = await supabase
    .from(ADMIN_PROFILE_EDITS_TABLE)
    .upsert(payload, { onConflict: 'username_norm' })
    .select('*')
    .single();

  return {
    data: mapAdminRowToAdminUser(data),
    error,
  };
};

const getAdminProfileEditRowFromSupabase = async ({ identifier }) => {
  const normalizedIdentifier = normalizeIdentifier(identifier);
  if (!normalizedIdentifier) {
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .from(ADMIN_PROFILE_EDITS_TABLE)
    .select('*')
    .or(`username_norm.eq.${normalizedIdentifier},email_norm.eq.${normalizedIdentifier}`)
    .limit(1)
    .maybeSingle();

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

export const uploadAdminAvatarToSupabase = async ({ file, username, email }) => {
  if (!supabase) {
    return {
      path: '',
      publicUrl: '',
      error: new Error(SUPABASE_CONFIG_ERROR_MESSAGE),
    };
  }

  if (!file) {
    return {
      path: '',
      publicUrl: '',
      error: new Error('No avatar file provided.'),
    };
  }

  const safeOwner =
    sanitizeSegment(username || email || 'admin') ||
    'admin';
  const safeName = sanitizeSegment(file.name || 'avatar.jpg') || `avatar-${Date.now()}.jpg`;
  const storagePath = `${safeOwner}/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage
    .from(ADMIN_AVATAR_BUCKET)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'image/jpeg',
    });

  if (error) {
    return { path: '', publicUrl: '', error };
  }

  const { data } = supabase.storage.from(ADMIN_AVATAR_BUCKET).getPublicUrl(storagePath);
  return {
    path: storagePath,
    publicUrl: data?.publicUrl || '',
    error: null,
  };
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

  const baseProfile = mapAdminRowToAdminUser(data);
  if (error || !baseProfile) {
    return {
      data: baseProfile,
      error,
    };
  }

  // Overlay profile edits from admin_pics while keeping auth fields from admin_profiles.
  const profileEditResult = await getAdminProfileEditRowFromSupabase({
    identifier: normalizedIdentifier,
  });
  const editProfile = profileEditResult.data;
  if (!editProfile) {
    return {
      data: baseProfile,
      error: null,
    };
  }

  return {
    data: {
      ...baseProfile,
      username: String(editProfile.username || '').trim() || baseProfile.username,
      email: String(editProfile.email || '').trim() || baseProfile.email,
      name: String(editProfile.name || '').trim() || baseProfile.name,
      avatarUrl: String(editProfile.avatarUrl || '').trim() || baseProfile.avatarUrl,
    },
    error: null,
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
  const normalizedUsername = normalizeIdentifier(trimmedUsername);
  const existingProfile = await getAdminProfileFromSupabase({ identifier: trimmedUsername });
  if (existingProfile.error) {
    return {
      data: null,
      error: existingProfile.error,
    };
  }

  const fallbackEmailSource =
    typeof email === 'string'
      ? String(email || '').trim()
      : String(existingProfile.data?.email || '').trim() ||
        (trimmedUsername.includes('@') ? trimmedUsername : 'admin@lifewood.com');
  const fallbackDisplayName =
    typeof displayName === 'string'
      ? String(displayName || '').trim()
      : String(existingProfile.data?.name || existingProfile.data?.role || 'Admin').trim();
  const fallbackAvatarUrl =
    typeof avatarUrl === 'string'
      ? String(avatarUrl || '').trim()
      : String(existingProfile.data?.avatarUrl || '').trim();
  const fallbackRole = String(existingProfile.data?.role || 'Admin').trim() || 'Admin';
  const fallbackPasswordHash =
    String(existingProfile.data?.passwordHash || DEFAULT_ADMIN_PASSWORD_HASH).trim() ||
    DEFAULT_ADMIN_PASSWORD_HASH;
  const profileEditSaveResult = await upsertAdminProfileEditRow({
    username: trimmedUsername,
    username_norm: normalizedUsername,
    email: fallbackEmailSource,
    email_norm: normalizeIdentifier(fallbackEmailSource),
    display_name: fallbackDisplayName || fallbackRole || 'Admin',
    role: fallbackRole,
    avatar_url: fallbackAvatarUrl,
    password_hash: fallbackPasswordHash,
    updated_at: new Date().toISOString(),
  });

  if (profileEditSaveResult.error) {
    return {
      data: null,
      error: profileEditSaveResult.error,
    };
  }

  const savedProfile = profileEditSaveResult.data || {};
  return {
    data: {
      id: savedProfile.id || existingProfile.data?.id || '',
      username: String(savedProfile.username || '').trim() || trimmedUsername,
      email: String(savedProfile.email || '').trim() || fallbackEmailSource,
      role: String(existingProfile.data?.role || fallbackRole).trim() || 'Admin',
      name:
        String(savedProfile.name || '').trim() ||
        fallbackDisplayName ||
        String(existingProfile.data?.name || '').trim() ||
        'Admin',
      avatarUrl: String(savedProfile.avatarUrl || '').trim() || fallbackAvatarUrl,
      passwordHash:
        String(existingProfile.data?.passwordHash || fallbackPasswordHash).trim() ||
        fallbackPasswordHash,
    },
    error: null,
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
