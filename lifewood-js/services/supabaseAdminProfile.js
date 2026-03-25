import emailjs from '@emailjs/browser';
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
const PASSWORD_RESET_EXPIRY_MINUTES = 60;
const PASSWORD_RESET_TOKEN_SALT = 'lifewood-admin-reset-v1';
const EMAILJS_DEFAULT_CONFIG = {
  serviceId: 'service_ejy2ekk',
  publicKey: 'F1EDAr2TRvH4-ezX5',
  flexibleTemplateId: 'template_wlz0jxm',
};

const normalizeIdentifier = (value) => String(value || '').trim().toLowerCase();
const sanitizeSegment = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
const readEmailEnv = (keys) => {
  const processEnv =
    typeof process !== 'undefined' && process && process.env
      ? process.env
      : {};

  for (const key of keys) {
    const fromImportMeta = import.meta?.env?.[key];
    if (typeof fromImportMeta === 'string' && fromImportMeta.trim()) {
      return fromImportMeta.trim();
    }

    const fromProcess = processEnv[key];
    if (typeof fromProcess === 'string' && fromProcess.trim()) {
      return fromProcess.trim();
    }
  }

  return '';
};
const EMAILJS_SERVICE_ID = readEmailEnv([
  'VITE_EMAILJS_SERVICE_ID',
  'EMAILJS_SERVICE_ID',
  'NEXT_PUBLIC_EMAILJS_SERVICE_ID',
]) || EMAILJS_DEFAULT_CONFIG.serviceId;
const EMAILJS_PUBLIC_KEY = readEmailEnv([
  'VITE_EMAILJS_PUBLIC_KEY',
  'EMAILJS_PUBLIC_KEY',
  'NEXT_PUBLIC_EMAILJS_PUBLIC_KEY',
]) || EMAILJS_DEFAULT_CONFIG.publicKey;
const EMAILJS_PASSWORD_RESET_TEMPLATE_ID = readEmailEnv([
  'VITE_EMAILJS_PASSWORD_RESET_TEMPLATE_ID',
  'EMAILJS_PASSWORD_RESET_TEMPLATE_ID',
  'NEXT_PUBLIC_EMAILJS_PASSWORD_RESET_TEMPLATE_ID',
  'VITE_EMAILJS_FLEX_TEMPLATE_ID',
  'EMAILJS_FLEX_TEMPLATE_ID',
  'NEXT_PUBLIC_EMAILJS_FLEX_TEMPLATE_ID',
]) || EMAILJS_DEFAULT_CONFIG.flexibleTemplateId;
const isMissingAdminProfileEditNormalizedColumnError = (error) => {
  const message = String(error?.message || '').toLowerCase();
  return (
    message.includes(`${ADMIN_PROFILE_EDITS_TABLE}.username_norm`) ||
    message.includes(`${ADMIN_PROFILE_EDITS_TABLE}.email_norm`) ||
    message.includes('column "username_norm" does not exist') ||
    message.includes('column "email_norm" does not exist')
  );
};
const isMissingAdminProfileEditDirectColumnError = (error) => {
  const message = String(error?.message || '').toLowerCase();
  return (
    message.includes(`${ADMIN_PROFILE_EDITS_TABLE}.username`) ||
    message.includes(`${ADMIN_PROFILE_EDITS_TABLE}.email`) ||
    message.includes('column "username" does not exist') ||
    message.includes('column "email" does not exist')
  );
};
const applyAdminProfileEdit = ({ baseProfile, editProfile }) => {
  if (!baseProfile) return null;
  if (!editProfile) return baseProfile;

  return {
    ...baseProfile,
    username: String(editProfile.username || '').trim() || baseProfile.username,
    email: String(editProfile.email || '').trim() || baseProfile.email,
    name: String(editProfile.name || '').trim() || baseProfile.name,
    avatarUrl: String(editProfile.avatarUrl || '').trim() || baseProfile.avatarUrl,
  };
};

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

const encodeBase64Url = (value) => {
  const input = String(value || '');
  if (typeof btoa === 'function') {
    return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  return input;
};

const decodeBase64Url = (value) => {
  const input = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
  const padded = input + '='.repeat((4 - (input.length % 4 || 4)) % 4);
  if (typeof atob === 'function') {
    return atob(padded);
  }

  return padded;
};

const createStatelessPasswordResetToken = async ({
  username,
  email,
  passwordHash,
  expiresAt,
}) => {
  const normalizedUsername = normalizeIdentifier(username);
  const normalizedEmail = normalizeIdentifier(email);
  const expiresAtMs = Number(expiresAt) || 0;
  const proof = await hashAdminPassword(
    `${normalizedUsername}|${normalizedEmail}|${expiresAtMs}|${String(passwordHash || '').trim()}|${PASSWORD_RESET_TOKEN_SALT}`
  );

  return encodeBase64Url(
    JSON.stringify({
      v: 1,
      u: normalizedUsername,
      e: normalizedEmail,
      x: expiresAtMs,
      p: proof,
    })
  );
};

const parseStatelessPasswordResetToken = (token) => {
  const rawToken = String(token || '').trim();
  if (!rawToken) return null;

  try {
    const parsed = JSON.parse(decodeBase64Url(rawToken));
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
};

const getAdminBaseRowFromSupabase = async ({ identifier }) => {
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
    data,
    error,
  };
};

const resolveAdminBaseRowByIdentifier = async ({ identifier }) => {
  const normalizedIdentifier = normalizeIdentifier(identifier);
  if (!normalizedIdentifier) {
    return { data: null, editData: null, error: null };
  }

  const baseResult = await getAdminBaseRowFromSupabase({ identifier: normalizedIdentifier });
  if (baseResult.error || baseResult.data) {
    return {
      data: baseResult.data,
      editData: null,
      error: baseResult.error,
    };
  }

  const editResult = await getAdminProfileEditRowFromSupabase({
    identifier: normalizedIdentifier,
  });
  if (editResult.error || !editResult.data) {
    return {
      data: null,
      editData: editResult.data || null,
      error: editResult.error,
    };
  }

  const baseLookupCandidates = Array.from(
    new Set(
      [editResult.data.username, editResult.data.email]
        .map((value) => String(value || '').trim())
        .filter(Boolean)
    )
  );

  for (const candidate of baseLookupCandidates) {
    const candidateBaseResult = await getAdminBaseRowFromSupabase({ identifier: candidate });
    if (candidateBaseResult.error) {
      return {
        data: null,
        editData: editResult.data,
        error: candidateBaseResult.error,
      };
    }

    if (candidateBaseResult.data) {
      return {
        data: candidateBaseResult.data,
        editData: editResult.data,
        error: null,
      };
    }
  }

  return {
    data: null,
    editData: editResult.data,
    error: null,
  };
};

const overlayAdminProfileEdit = async ({ baseProfile, identifier }) => {
  if (!baseProfile) {
    return { data: null, error: null };
  }

  const profileEditResult = await getAdminProfileEditRowFromSupabase({
    identifier: identifier || baseProfile.username,
  });

  if (profileEditResult.error) {
    return {
      data: baseProfile,
      error: profileEditResult.error,
    };
  }

  const editProfile = profileEditResult.data;
  if (!editProfile) {
    return {
      data: baseProfile,
      error: null,
    };
  }

  return { data: applyAdminProfileEdit({ baseProfile, editProfile }), error: null };
};

const resolveAdminIdentityForPasswordReset = async ({ identifier }) => {
  if (!supabase) {
    return {
      data: null,
      baseRow: null,
      error: new Error(SUPABASE_CONFIG_ERROR_MESSAGE),
    };
  }

  const normalizedIdentifier = normalizeIdentifier(identifier);
  if (!normalizedIdentifier) {
    return { data: null, baseRow: null, error: null };
  }

  const resolvedBaseResult = await resolveAdminBaseRowByIdentifier({
    identifier: normalizedIdentifier,
  });
  if (resolvedBaseResult.error) {
    return {
      data: null,
      baseRow: null,
      error: resolvedBaseResult.error,
    };
  }

  if (resolvedBaseResult.data) {
    const baseProfile = mapAdminRowToAdminUser(resolvedBaseResult.data);
    const overlayResult = resolvedBaseResult.editData
      ? { data: applyAdminProfileEdit({ baseProfile, editProfile: resolvedBaseResult.editData }), error: null }
      : await overlayAdminProfileEdit({
          baseProfile,
          identifier: normalizedIdentifier,
        });

    return {
      data: overlayResult.data,
      baseRow: resolvedBaseResult.data,
      error: overlayResult.error,
    };
  }

  return { data: null, baseRow: null, error: null };
};

const buildAdminPasswordResetEmail = ({
  recipientName,
  recipientEmail,
  resetUrl,
  expiresInMinutes = PASSWORD_RESET_EXPIRY_MINUTES,
}) => {
  const safeRecipientName = String(recipientName || 'Admin').trim() || 'Admin';
  const safeRecipientEmail = String(recipientEmail || '').trim();
  const safeResetUrl = String(resetUrl || '').trim();
  const expiryLabel = `${Number(expiresInMinutes) || PASSWORD_RESET_EXPIRY_MINUTES} minutes`;

  return {
    subject: 'Lifewood Admin Password Reset',
    body: [
      `Hello ${safeRecipientName},`,
      '',
      'We received a request to reset your Lifewood Admin Portal password.',
      ...(safeRecipientEmail ? [`Admin email: ${safeRecipientEmail}`] : []),
      '',
      'Use the secure link below to choose a new password:',
      safeResetUrl || '[Reset link unavailable]',
      '',
      `This link expires in ${expiryLabel}.`,
      'If you did not request this change, you can ignore this email.',
      '',
      'Lifewood Admin Security',
    ].join('\n'),
  };
};

const sendAdminPasswordResetEmail = async ({
  recipientName,
  recipientEmail,
  resetUrl,
}) => {
  const templateId = EMAILJS_PASSWORD_RESET_TEMPLATE_ID;
  const canSendWithEmailJs = Boolean(EMAILJS_SERVICE_ID && EMAILJS_PUBLIC_KEY && templateId);
  if (!canSendWithEmailJs) {
    return { ok: false, mode: 'none', reason: 'emailjs_not_configured' };
  }

  const safeRecipientEmail = String(recipientEmail || '').trim();
  if (!safeRecipientEmail) {
    return { ok: false, mode: 'none', reason: 'missing_recipient' };
  }

  const { subject, body } = buildAdminPasswordResetEmail({
    recipientName,
    recipientEmail: safeRecipientEmail,
    resetUrl,
  });

  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      templateId,
      {
        to_email: safeRecipientEmail,
        to_name: String(recipientName || 'Admin').trim() || 'Admin',
        recipient_email: safeRecipientEmail,
        recipient_name: String(recipientName || 'Admin').trim() || 'Admin',
        email: safeRecipientEmail,
        name: String(recipientName || 'Admin').trim() || 'Admin',
        subject,
        message: body,
        body,
        reset_link: resetUrl,
        reset_url: resetUrl,
        action_url: resetUrl,
      },
      {
        publicKey: EMAILJS_PUBLIC_KEY,
      }
    );

    return { ok: true, mode: 'emailjs' };
  } catch (error) {
    console.error('Admin password reset EmailJS send failed.', error);
    return { ok: false, mode: 'none', reason: 'emailjs_send_failed' };
  }
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

  if (error && isMissingAdminProfileEditNormalizedColumnError(error)) {
    const fallbackPayload = { ...payload };
    delete fallbackPayload.username_norm;
    delete fallbackPayload.email_norm;

    const fallbackResult = await supabase
      .from(ADMIN_PROFILE_EDITS_TABLE)
      .upsert(fallbackPayload, { onConflict: 'username' })
      .select('*')
      .single();

    if (fallbackResult.error && isMissingAdminProfileEditDirectColumnError(fallbackResult.error)) {
      return {
        data: null,
        error: null,
      };
    }

    return {
      data: mapAdminRowToAdminUser(fallbackResult.data),
      error: fallbackResult.error,
    };
  }

  return {
    data: mapAdminRowToAdminUser(data),
    error,
  };
};

const getAdminProfileEditRowFromSupabase = async ({ identifier }) => {
  const rawIdentifier = String(identifier || '').trim();
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

  if (error && isMissingAdminProfileEditNormalizedColumnError(error)) {
    const fallbackIdentifiers = Array.from(
      new Set([rawIdentifier, normalizedIdentifier].filter(Boolean))
    );

    for (const candidate of fallbackIdentifiers) {
      const byUsernameResult = await supabase
        .from(ADMIN_PROFILE_EDITS_TABLE)
        .select('*')
        .eq('username', candidate)
        .limit(1)
        .maybeSingle();

      if (byUsernameResult.error && isMissingAdminProfileEditDirectColumnError(byUsernameResult.error)) {
        continue;
      }

      if (byUsernameResult.data || byUsernameResult.error) {
        return {
          data: mapAdminRowToAdminUser(byUsernameResult.data),
          error: byUsernameResult.error,
        };
      }

      const byEmailResult = await supabase
        .from(ADMIN_PROFILE_EDITS_TABLE)
        .select('*')
        .eq('email', candidate)
        .limit(1)
        .maybeSingle();

      if (byEmailResult.error && isMissingAdminProfileEditDirectColumnError(byEmailResult.error)) {
        continue;
      }

      if (byEmailResult.data || byEmailResult.error) {
        return {
          data: mapAdminRowToAdminUser(byEmailResult.data),
          error: byEmailResult.error,
        };
      }
    }

    return { data: null, error: null };
  }

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

  const resolvedBaseResult = await resolveAdminBaseRowByIdentifier({
    identifier: normalizedIdentifier,
  });
  const baseProfile = mapAdminRowToAdminUser(resolvedBaseResult.data);
  const error = resolvedBaseResult.error;
  if (error || !baseProfile) {
    return {
      data: baseProfile,
      error,
    };
  }

  if (resolvedBaseResult.editData) {
    return {
      data: applyAdminProfileEdit({ baseProfile, editProfile: resolvedBaseResult.editData }),
      error: null,
    };
  }

  const overlayResult = await overlayAdminProfileEdit({
    baseProfile,
    identifier: normalizedIdentifier,
  });
  return overlayResult;
};

export const authenticateAdminWithSupabase = async ({ identifier, password }) => {
  if (!supabase) {
    return {
      data: null,
      status: 'error',
      error: new Error(SUPABASE_CONFIG_ERROR_MESSAGE),
    };
  }

  const normalizedIdentifier = normalizeIdentifier(identifier);
  if (!normalizedIdentifier) {
    return { data: null, status: 'not_found', error: null };
  }

  const resolvedBaseResult = await resolveAdminBaseRowByIdentifier({
    identifier: normalizedIdentifier,
  });
  if (resolvedBaseResult.error) {
    return { data: null, status: 'error', error: resolvedBaseResult.error };
  }

  if (!resolvedBaseResult.data) {
    return { data: null, status: 'not_found', error: null };
  }

  const hashedInput = await hashAdminPassword(password);
  const baseProfile = mapAdminRowToAdminUser(resolvedBaseResult.data);
  const storedHash = String(baseProfile?.passwordHash || '').trim();

  if (!hashedInput || !storedHash || storedHash !== hashedInput) {
    return { data: null, status: 'invalid_password', error: null };
  }

  if (resolvedBaseResult.editData) {
    return {
      data: applyAdminProfileEdit({ baseProfile, editProfile: resolvedBaseResult.editData }),
      status: 'success',
      error: null,
    };
  }

  const overlayResult = await overlayAdminProfileEdit({
    baseProfile,
    identifier: normalizedIdentifier,
  });

  return {
    data: overlayResult.data || baseProfile,
    status: 'success',
    error: null,
  };
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

  const existingByUsernameResult = await getAdminBaseRowFromSupabase({ identifier: trimmedUsername });
  if (existingByUsernameResult.error) {
    return {
      data: null,
      error: existingByUsernameResult.error,
    };
  }

  if (existingByUsernameResult.data) {
    return {
      data: mapAdminRowToAdminUser(existingByUsernameResult.data),
      error: null,
    };
  }

  const existingByEmailResult = await getAdminBaseRowFromSupabase({ identifier: trimmedEmail });
  if (existingByEmailResult.error) {
    return {
      data: null,
      error: existingByEmailResult.error,
    };
  }

  if (existingByEmailResult.data) {
    return {
      data: mapAdminRowToAdminUser(existingByEmailResult.data),
      error: null,
    };
  }

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

  const resolvedBaseResult = await resolveAdminBaseRowByIdentifier({
    identifier: trimmedUsername,
  });
  if (resolvedBaseResult.error) {
    return { data: null, error: resolvedBaseResult.error };
  }

  if (!resolvedBaseResult.data) {
    return {
      data: null,
      error: new Error('Admin profile not found.'),
    };
  }

  const baseProfile = mapAdminRowToAdminUser(resolvedBaseResult.data);
  const storedHash = String(baseProfile?.passwordHash || '').trim();
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
    .eq('id', resolvedBaseResult.data.id)
    .eq('username_norm', normalizeIdentifier(resolvedBaseResult.data.username))
    .select('*')
    .single();

  return {
    data: mapAdminRowToAdminUser(data),
    error,
  };
};

export const requestAdminPasswordResetInSupabase = async ({
  identifier,
  resetUrlBase,
}) => {
  if (!supabase) {
    return {
      data: null,
      status: 'error',
      error: new Error(SUPABASE_CONFIG_ERROR_MESSAGE),
    };
  }

  const resolvedIdentity = await resolveAdminIdentityForPasswordReset({ identifier });
  if (resolvedIdentity.error) {
    return {
      data: null,
      status: 'error',
      error: resolvedIdentity.error,
    };
  }

  const resolvedProfile = resolvedIdentity.data;
  const baseRow = resolvedIdentity.baseRow;
  if (!resolvedProfile || !baseRow) {
    return { data: null, status: 'not_found', error: null };
  }

  const resetUrlPrefix = String(resetUrlBase || '').trim();
  if (!resetUrlPrefix) {
    return {
      data: null,
      status: 'error',
      error: new Error('Reset URL is unavailable.'),
    };
  }

  const expiresAtMs = Date.now() + PASSWORD_RESET_EXPIRY_MINUTES * 60 * 1000;
  const baseUsername = String(baseRow.username || resolvedProfile.username || '').trim();
  const statelessResetToken = await createStatelessPasswordResetToken({
    username: baseUsername,
    email: resolvedProfile.email,
    passwordHash: baseRow.password_hash,
    expiresAt: expiresAtMs,
  });
  const separator = resetUrlPrefix.includes('?') ? '&' : '?';
  const resetUrl = `${resetUrlPrefix}${separator}identifier=${encodeURIComponent(baseUsername)}&token=${encodeURIComponent(statelessResetToken)}`;

  const emailResult = await sendAdminPasswordResetEmail({
    recipientName: resolvedProfile.name,
    recipientEmail: resolvedProfile.email,
    resetUrl,
  });

  if (!emailResult.ok) {
    return {
      data: null,
      status: 'error',
      error: new Error(
        emailResult.reason === 'emailjs_not_configured'
          ? 'Password reset email is not configured. Check EmailJS settings.'
          : 'Unable to send the password reset email.'
      ),
    };
  }

  return {
    data: {
      email: resolvedProfile.email,
      username: baseUsername,
      expiresAt: new Date(expiresAtMs).toISOString(),
    },
    status: 'sent',
    error: null,
  };
};

export const resetAdminPasswordWithSupabaseToken = async ({
  identifier,
  token,
  newPassword,
}) => {
  if (!supabase) {
    return {
      data: null,
      status: 'error',
      error: new Error(SUPABASE_CONFIG_ERROR_MESSAGE),
    };
  }

  const normalizedIdentifier = normalizeIdentifier(identifier);
  const rawToken = String(token || '').trim();
  const rawPassword = String(newPassword || '');
  if (!normalizedIdentifier || !rawToken || !rawPassword) {
    return {
      data: null,
      status: 'invalid_request',
      error: new Error('Reset link or password details are incomplete.'),
    };
  }

  const baseResult = await getAdminBaseRowFromSupabase({ identifier: normalizedIdentifier });
  if (baseResult.error) {
    return { data: null, status: 'error', error: baseResult.error };
  }

  if (!baseResult.data) {
    return {
      data: null,
      status: 'invalid_token',
      error: new Error('This password reset link is invalid.'),
    };
  }

  const parsedToken = parseStatelessPasswordResetToken(rawToken);
  if (!parsedToken || Number(parsedToken.v) !== 1) {
    return {
      data: null,
      status: 'invalid_token',
      error: new Error('This password reset link is invalid.'),
    };
  }

  const expiresAtMs = Number(parsedToken.x) || 0;
  if (!expiresAtMs || expiresAtMs < Date.now()) {
    return {
      data: null,
      status: 'expired',
      error: new Error('This password reset link has expired.'),
    };
  }

  const expectedUsername = normalizeIdentifier(baseResult.data.username);
  const expectedEmail = normalizeIdentifier(baseResult.data.email);
  if (
    normalizeIdentifier(parsedToken.u) !== expectedUsername ||
    normalizeIdentifier(parsedToken.e) !== expectedEmail
  ) {
    return {
      data: null,
      status: 'invalid_token',
      error: new Error('This password reset link is invalid.'),
    };
  }

  const expectedProof = await hashAdminPassword(
    `${expectedUsername}|${expectedEmail}|${expiresAtMs}|${String(baseResult.data.password_hash || '').trim()}|${PASSWORD_RESET_TOKEN_SALT}`
  );
  if (!expectedProof || String(parsedToken.p || '').trim() !== expectedProof) {
    return {
      data: null,
      status: 'invalid_token',
      error: new Error('This password reset link is invalid.'),
    };
  }

  const newPasswordHash = await hashAdminPassword(rawPassword);
  const updateResult = await supabase
    .from(ADMIN_PROFILES_TABLE)
    .update({
      password_hash: newPasswordHash,
      updated_at: new Date().toISOString(),
    })
    .eq('id', baseResult.data.id)
    .eq('username_norm', expectedUsername);

  if (updateResult.error) {
    return {
      data: null,
      status: 'error',
      error: updateResult.error,
    };
  }

  const refreshedBaseResult = await getAdminBaseRowFromSupabase({
    identifier: baseResult.data.username || identifier,
  });
  if (refreshedBaseResult.error) {
    return {
      data: null,
      status: 'error',
      error: refreshedBaseResult.error,
    };
  }

  const persistedHash = String(refreshedBaseResult.data?.password_hash || '').trim();
  if (!persistedHash || persistedHash !== newPasswordHash) {
    return {
      data: null,
      status: 'error',
      error: new Error('Password reset did not persist to the admin profile.'),
    };
  }

  const refreshedProfile = await getAdminProfileFromSupabase({
    identifier: baseResult.data.username || baseResult.data.email || identifier,
  });
  if (refreshedProfile.error) {
    return {
      data: null,
      status: 'error',
      error: refreshedProfile.error,
    };
  }

  return {
    data: refreshedProfile.data,
    status: 'success',
    error: null,
  };
};
