import emailjs from '@emailjs/browser';

const CONTACT_SUBMISSIONS_KEY = 'lifewood.admin.contacts';
const JOIN_APPLICATIONS_KEY = 'lifewood.admin.joinApplications';

const safeJsonParse = (rawValue) => {
  if (!rawValue) return null;
  try {
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
};

const getStorage = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
};

const readList = (key) => {
  const storage = getStorage();
  if (!storage) return [];
  const parsed = safeJsonParse(storage.getItem(key));
  return Array.isArray(parsed) ? parsed : [];
};

const writeList = (key, values) => {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(key, JSON.stringify(values));
};

const generateRecordId = (prefix) => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
};

const normalizeStatus = (status) => {
  if (status === 'hired') return 'hired';
  if (status === 'scheduled_interview' || status === 'schedule_interview' || status === 'scheduled') {
    return 'scheduled_interview';
  }
  if (status === 'rejected') return 'rejected';
  return 'pending';
};

const normalizeEmailIntent = (status) => {
  const value = String(status || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ');

  if (value === 'hired' || value === 'accept' || value === 'accepted') return 'hired';
  if (value === 'schedule interview' || value === 'interview' || value === 'scheduled interview') {
    return 'schedule_interview';
  }
  return 'rejected';
};

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

const EMAILJS_DEFAULT_CONFIG = {
  serviceId: 'service_ejy2ekk',
  publicKey: 'F1EDAr2TRvH4-ezX5',
  hiredTemplateId: 'template_q3tnorw',
  flexibleTemplateId: 'template_wlz0jxm',
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

const EMAILJS_HIRED_TEMPLATE_ID = readEmailEnv([
  'VITE_EMAILJS_HIRED_TEMPLATE_ID',
  'EMAILJS_HIRED_TEMPLATE_ID',
  'NEXT_PUBLIC_EMAILJS_HIRED_TEMPLATE_ID',
]) || EMAILJS_DEFAULT_CONFIG.hiredTemplateId;

const EMAILJS_FLEX_TEMPLATE_ID = readEmailEnv([
  'VITE_EMAILJS_FLEX_TEMPLATE_ID',
  'EMAILJS_FLEX_TEMPLATE_ID',
  'NEXT_PUBLIC_EMAILJS_FLEX_TEMPLATE_ID',
]) || EMAILJS_DEFAULT_CONFIG.flexibleTemplateId;

export const getContactSubmissions = () => readList(CONTACT_SUBMISSIONS_KEY);

export const getJoinApplications = () => readList(JOIN_APPLICATIONS_KEY);

export const addContactSubmission = ({ name, email, message }) => {
  const item = {
    id: generateRecordId('contact'),
    source: 'contact',
    name: String(name || '').trim(),
    email: String(email || '').trim(),
    message: String(message || '').trim(),
    status: 'pending',
    isOpened: false,
    openedAt: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const existing = getContactSubmissions();
  writeList(CONTACT_SUBMISSIONS_KEY, [item, ...existing]);
  return item;
};

export const markContactSubmissionOpened = ({ id }) => {
  const existing = getContactSubmissions();
  let updatedRecord = null;

  const next = existing.map((item) => {
    if (item.id !== id) return item;
    updatedRecord = {
      ...item,
      isOpened: true,
      openedAt: Date.now(),
      updatedAt: Date.now(),
    };
    return updatedRecord;
  });

  writeList(CONTACT_SUBMISSIONS_KEY, next);
  return updatedRecord;
};

export const deleteContactSubmission = ({ id }) => {
  if (!id) return false;
  const existing = getContactSubmissions();
  const next = existing.filter((item) => item.id !== id);
  if (next.length === existing.length) return false;
  writeList(CONTACT_SUBMISSIONS_KEY, next);
  return true;
};

export const addJoinApplication = ({
  firstName,
  lastName,
  email,
  phoneCountryCode,
  phoneLocal,
  gender,
  age,
  position,
  country,
  address,
  cvFileName,
  cvFileUrl,
  cvStoragePath,
}) => {
  const item = {
    id: generateRecordId('applicant'),
    source: 'join',
    firstName: String(firstName || '').trim(),
    lastName: String(lastName || '').trim(),
    fullName: `${String(firstName || '').trim()} ${String(lastName || '').trim()}`.trim(),
    email: String(email || '').trim(),
    phoneCountryCode: String(phoneCountryCode || '').trim(),
    phoneLocal: String(phoneLocal || '').trim(),
    phoneDisplay: `${String(phoneCountryCode || '').trim()} ${String(phoneLocal || '').trim()}`
      .trim()
      .replace(/\s+/g, ' '),
    gender: String(gender || '').trim(),
    age: String(age || '').trim(),
    position: String(position || '').trim(),
    country: String(country || '').trim(),
    address: String(address || '').trim(),
    cvFileName: String(cvFileName || '').trim(),
    cvFileUrl: String(cvFileUrl || '').trim(),
    cvStoragePath: String(cvStoragePath || '').trim(),
    status: 'pending',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    reviewedAt: null,
    reviewedBy: '',
  };

  const existing = getJoinApplications();
  writeList(JOIN_APPLICATIONS_KEY, [item, ...existing]);
  return item;
};

export const updateJoinApplicationStatus = ({ id, status, reviewedBy = '' }) => {
  const nextStatus = normalizeStatus(status);
  const existing = getJoinApplications();
  let updatedRecord = null;

  const next = existing.map((item) => {
    if (item.id !== id) return item;
    updatedRecord = {
      ...item,
      status: nextStatus,
      reviewedBy: String(reviewedBy || '').trim(),
      reviewedAt: Date.now(),
      updatedAt: Date.now(),
    };
    return updatedRecord;
  });

  writeList(JOIN_APPLICATIONS_KEY, next);
  return updatedRecord;
};

export const deleteJoinApplication = ({ id }) => {
  if (!id) return false;
  const existing = getJoinApplications();
  const next = existing.filter((item) => item.id !== id);
  if (next.length === existing.length) return false;
  writeList(JOIN_APPLICATIONS_KEY, next);
  return true;
};

export const formatApplicantStatusLabel = (status) => {
  if (status === 'hired' || status === 'accepted') return 'Accepted';
  if (status === 'scheduled_interview' || status === 'schedule_interview' || status === 'scheduled') return 'For Interview';
  if (status === 'rejected') return 'Rejected';
  return 'Pending';
};

export const buildApplicantStatusEmail = ({ name, status, interviewDateTimeText = '', interviewTimezone = '' }) => {
  const normalizedStatus = normalizeEmailIntent(status);
  const applicantName = String(name || 'Applicant').trim() || 'Applicant';
  const scheduleText = String(interviewDateTimeText || '').trim();
  const scheduleTimezone = String(interviewTimezone || '').trim();

  if (normalizedStatus === 'hired') {
    return {
      subject: 'Lifewood Application Update - Hired',
      body: [
        `Dear ${applicantName},`,
        '',
        'We are pleased to inform you that your application has been accepted.',
        'Status: Hired',
        '',
        'Our recruitment team will contact you soon with your onboarding details and next steps.',
        '',
        'Thank you for your interest in Lifewood.',
        '',
        'Best regards,',
        'Lifewood Recruitment Team',
      ].join('\n'),
    };
  }

  if (normalizedStatus === 'schedule_interview') {
    return {
      subject: 'Lifewood Application Update - Interview Schedule',
      body: [
        `Dear ${applicantName},`,
        '',
        'Thank you for your interest in Lifewood.',
        'We would like to proceed with your interview.',
        ...(scheduleText ? [`Interview Date & Time: ${scheduleText}`] : []),
        ...(scheduleTimezone ? [`Timezone: ${scheduleTimezone}`] : []),
        '',
        'Please be ready at the scheduled time. If you need to reschedule, kindly reply to this email.',
        '',
        'Best regards,',
        'Lifewood Recruitment Team',
      ].join('\n'),
    };
  }

  return {
    subject: 'Lifewood Application Update - Rejected',
    body: [
      `Dear ${applicantName},`,
      '',
      'Thank you for taking the time to apply to Lifewood.',
      'After careful review, we are unable to proceed with your application at this time.',
      'Status: Rejected',
      '',
      'We appreciate your interest and encourage you to apply again for future opportunities.',
      '',
      'Best regards,',
      'Lifewood Recruitment Team',
    ].join('\n'),
  };
};

export const openApplicantStatusEmailDraft = async ({
  recipientEmail,
  name,
  status,
  interviewDate = '',
  interviewTime = '',
  interviewDateTimeIso = '',
  interviewDateTimeText = '',
  interviewTimezone = '',
}) => {
  if (typeof window === 'undefined') return { ok: false, mode: 'none', reason: 'window_unavailable' };
  if (!recipientEmail) return { ok: false, mode: 'none', reason: 'missing_recipient' };

  const recipient = String(recipientEmail).trim();
  const applicantName = String(name || 'Applicant').trim() || 'Applicant';
  const intent = normalizeEmailIntent(status);
  const normalizedInterviewDate = String(interviewDate || '').trim();
  const normalizedInterviewTime = String(interviewTime || '').trim();
  const normalizedInterviewDateTimeIso = String(interviewDateTimeIso || '').trim();
  const normalizedInterviewDateTimeText = String(interviewDateTimeText || '').trim();
  const normalizedInterviewTimezone =
    String(interviewTimezone || '').trim() ||
    (typeof Intl !== 'undefined' ? String(Intl.DateTimeFormat().resolvedOptions().timeZone || '').trim() : '');

  const resolvedInterviewDateTimeText = (() => {
    if (normalizedInterviewDateTimeText) return normalizedInterviewDateTimeText;
    if (normalizedInterviewDate && normalizedInterviewTime) {
      const candidate = new Date(`${normalizedInterviewDate}T${normalizedInterviewTime}`);
      if (!Number.isNaN(candidate.getTime())) return candidate.toLocaleString();
    }
    if (normalizedInterviewDateTimeIso) {
      const candidate = new Date(normalizedInterviewDateTimeIso);
      if (!Number.isNaN(candidate.getTime())) return candidate.toLocaleString();
    }
    return '';
  })();

  const { subject, body } = buildApplicantStatusEmail({
    name: applicantName,
    status: intent,
    interviewDateTimeText: resolvedInterviewDateTimeText,
    interviewTimezone: normalizedInterviewTimezone,
  });
  const templateId = intent === 'hired' ? EMAILJS_HIRED_TEMPLATE_ID : EMAILJS_FLEX_TEMPLATE_ID;
  const canSendWithEmailJs = Boolean(EMAILJS_SERVICE_ID && EMAILJS_PUBLIC_KEY && templateId);

  if (!canSendWithEmailJs) {
    return { ok: false, mode: 'none', reason: 'emailjs_not_configured' };
  }

  try {
    const templateParams = {
      to_email: recipient,
      to_name: applicantName,
      applicant_name: applicantName,
      recipient_email: recipient,
      to: recipient,
      toEmail: recipient,
      email_to: recipient,
      candidate_email: recipient,
      applicant_email: recipient,
      email: recipient,
      name: applicantName,
      subject,
      message: body,
      body,
      status: intent === 'schedule_interview' ? 'Schedule Interview' : intent === 'hired' ? 'Hired' : 'Rejected',
      status_key: intent,
      action: intent,
      interview_date: normalizedInterviewDate,
      interview_time: normalizedInterviewTime,
      interview_date_time: resolvedInterviewDateTimeText,
      interview_datetime_iso: normalizedInterviewDateTimeIso,
      interview_datetime: resolvedInterviewDateTimeText,
      interview_timezone: normalizedInterviewTimezone,
      date: normalizedInterviewDate,
      time: normalizedInterviewTime,
      timezone: normalizedInterviewTimezone,
    };

    await emailjs.send(EMAILJS_SERVICE_ID, templateId, templateParams, {
      publicKey: EMAILJS_PUBLIC_KEY,
    });
    return { ok: true, mode: 'emailjs' };
  } catch (error) {
    console.error('EmailJS send failed.', error);
    return { ok: false, mode: 'none', reason: 'emailjs_send_failed' };
  }
};
