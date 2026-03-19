import { supabase } from '../utils/supabaseClient';

const APPLICANT_CV_BUCKET =
  import.meta?.env?.VITE_SUPABASE_CV_BUCKET ||
  (typeof process !== 'undefined' ? process?.env?.SUPABASE_CV_BUCKET : '') ||
  'cv-storage';
const SUPABASE_CONFIG_ERROR_MESSAGE =
  'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment (or SUPABASE_URL/SUPABASE_ANON_KEY) and redeploy.';
const sanitizeSegment = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const resolveCvStoragePath = (storedCvValue) => {
  const rawValue = String(storedCvValue || '').trim();
  if (!rawValue || /^https?:\/\//i.test(rawValue)) return '';

  let storagePath = rawValue.replace(/^\/+/, '');
  const bucketPrefix = `${APPLICANT_CV_BUCKET}/`;
  if (storagePath.startsWith(bucketPrefix)) {
    storagePath = storagePath.slice(bucketPrefix.length);
  }

  if (!storagePath.includes('/')) {
    return '';
  }

  return storagePath;
};

export const insertJoinUsApplication = async (payload) => {
  if (!supabase) {
    return {
      data: null,
      error: new Error(SUPABASE_CONFIG_ERROR_MESSAGE),
    };
  }

  const { data, error } = await supabase
    .from('applicants')
    .insert(payload);

  return { data, error };
};

export const fetchApplicantsFromSupabase = async () => {
  if (!supabase) {
    return {
      data: [],
      error: new Error(SUPABASE_CONFIG_ERROR_MESSAGE),
    };
  }

  const { data, error } = await supabase
    .from('applicants')
    .select('*')
    .order('created_at', { ascending: false });

  return { data: data || [], error };
};

export const subscribeToApplicantsRealtime = (onChange) => {
  if (!supabase) return null;

  return supabase
    .channel('public:applicants:realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'applicants' },
      (payload) => {
        if (typeof onChange === 'function') {
          onChange(payload);
        }
      }
    )
    .subscribe();
};

export const unsubscribeApplicantsRealtime = async (channel) => {
  if (!supabase || !channel) return;
  await supabase.removeChannel(channel);
};

export const updateApplicantStatusInSupabase = async ({ id, status }) => {
  if (!supabase) {
    return {
      data: null,
      error: new Error(SUPABASE_CONFIG_ERROR_MESSAGE),
    };
  }

  const normalizedId = Number.isNaN(Number(id)) ? id : Number(id);

  const { error } = await supabase
    .from('applicants')
    .update({
      application_status: status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', normalizedId);

  return { data: null, error };
};

export const updateApplicantInterviewScheduleInSupabase = async ({ id, scheduleIso }) => {
  if (!supabase) {
    return {
      data: null,
      error: new Error(SUPABASE_CONFIG_ERROR_MESSAGE),
    };
  }

  const normalizedId = Number.isNaN(Number(id)) ? id : Number(id);
  const updatedAtIso = new Date().toISOString();
  const normalizedScheduleIso = String(scheduleIso || '').trim();
  const schedulePayload = normalizedScheduleIso || updatedAtIso;

  // Try to persist both schedule metadata and explicit schedule status first.
  const firstAttempt = await supabase
    .from('applicants')
    .update({
      application_status: 'scheduled_interview',
      interview_scheduled_at: schedulePayload,
      updated_at: updatedAtIso,
    })
    .eq('id', normalizedId);

  if (!firstAttempt.error) {
    return { data: null, error: null };
  }

  // Fallback for schemas that support scheduled status but not interview_scheduled_at column.
  const secondAttempt = await supabase
    .from('applicants')
    .update({
      application_status: 'scheduled_interview',
      updated_at: updatedAtIso,
    })
    .eq('id', normalizedId);

  if (!secondAttempt.error) {
    return { data: null, error: null };
  }

  // Fallback for schemas that have interview_scheduled_at but keep status enum to pending/hired/rejected.
  const thirdAttempt = await supabase
    .from('applicants')
    .update({
      interview_scheduled_at: schedulePayload,
      updated_at: updatedAtIso,
    })
    .eq('id', normalizedId);

  if (!thirdAttempt.error) {
    return { data: null, error: null };
  }

  return { data: null, error: firstAttempt.error || secondAttempt.error || thirdAttempt.error };
};

export const deleteApplicantFromSupabase = async ({ id }) => {
  if (!supabase) {
    return {
      error: new Error(SUPABASE_CONFIG_ERROR_MESSAGE),
    };
  }

  const normalizedId = Number.isNaN(Number(id)) ? id : Number(id);

  const { error } = await supabase
    .from('applicants')
    .delete()
    .eq('id', normalizedId);

  return { error };
};

export const getApplicantCvPublicUrl = (storedCvValue) => {
  if (!supabase || !storedCvValue) return '';

  const rawValue = String(storedCvValue || '').trim();
  if (!rawValue) return '';

  if (/^https?:\/\//i.test(rawValue)) {
    return rawValue;
  }

  const storagePath = resolveCvStoragePath(rawValue);
  if (!storagePath) return '';

  const { data } = supabase.storage.from(APPLICANT_CV_BUCKET).getPublicUrl(storagePath);
  return data?.publicUrl || '';
};

export const downloadApplicantCvBlobUrl = async (storedCvValue) => {
  if (!supabase || !storedCvValue) {
    return { blobUrl: '', error: new Error('CV source is unavailable.') };
  }

  const rawValue = String(storedCvValue || '').trim();
  if (!rawValue) {
    return { blobUrl: '', error: new Error('CV source is unavailable.') };
  }

  if (/^https?:\/\//i.test(rawValue)) {
    return { blobUrl: rawValue, error: null };
  }

  const storagePath = resolveCvStoragePath(rawValue);
  if (!storagePath) {
    return { blobUrl: '', error: new Error('CV storage path is invalid.') };
  }

  const { data, error } = await supabase.storage.from(APPLICANT_CV_BUCKET).download(storagePath);
  if (error || !data) {
    return { blobUrl: '', error: error || new Error('Unable to download CV from Supabase Storage.') };
  }

  const blobUrl = URL.createObjectURL(data);
  return { blobUrl, error: null };
};

export const uploadApplicantCvToSupabase = async ({ file, applicantEmail }) => {
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
      error: new Error('No CV file provided.'),
    };
  }

  const safeName = sanitizeSegment(file.name || 'cv.pdf') || `cv-${Date.now()}.pdf`;
  const safeEmail = sanitizeSegment(applicantEmail || 'applicant') || 'applicant';
  const storagePath = `${safeEmail}/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage
    .from(APPLICANT_CV_BUCKET)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'application/pdf',
    });

  if (error) {
    return { path: '', publicUrl: '', error };
  }

  const { data } = supabase.storage.from(APPLICANT_CV_BUCKET).getPublicUrl(storagePath);
  return {
    path: storagePath,
    publicUrl: data?.publicUrl || '',
    error: null,
  };
};

export const findApplicantCvPathByEmailAndFileName = async ({ applicantEmail, fileName }) => {
  if (!supabase) {
    return {
      path: '',
      error: new Error(SUPABASE_CONFIG_ERROR_MESSAGE),
    };
  }

  const safeEmail = sanitizeSegment(applicantEmail || '');
  const normalizedFileName = sanitizeSegment(fileName || '');
  if (!safeEmail || !normalizedFileName) {
    return { path: '', error: new Error('Insufficient CV lookup data.') };
  }

  const { data, error } = await supabase.storage
    .from(APPLICANT_CV_BUCKET)
    .list(safeEmail, { limit: 100, offset: 0 });

  if (error) {
    return { path: '', error };
  }

  const found = (data || []).find((entry) => {
    const entryName = sanitizeSegment(entry?.name || '');
    if (!entryName) return false;
    return entryName === normalizedFileName || entryName.endsWith(`-${normalizedFileName}`);
  });

  if (!found?.name) {
    return { path: '', error: null };
  }

  return { path: `${safeEmail}/${found.name}`, error: null };
};
