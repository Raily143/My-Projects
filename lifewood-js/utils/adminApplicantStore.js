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
  if (status === 'rejected') return 'rejected';
  return 'pending';
};

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
  if (status === 'hired') return 'Hired';
  if (status === 'rejected') return 'Rejected';
  return 'Pending';
};

export const buildApplicantStatusEmail = ({ name, status }) => {
  const normalizedStatus = normalizeStatus(status);
  const applicantName = String(name || 'Applicant').trim() || 'Applicant';

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

export const openApplicantStatusEmailDraft = ({ recipientEmail, name, status }) => {
  if (typeof window === 'undefined') return false;
  if (!recipientEmail) return false;

  const { subject, body } = buildApplicantStatusEmail({ name, status });
  const mailto = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
  return true;
};
