import { useEffect, useRef } from 'react';

const SECRET_KEYWORD = 'admin rai';
const BUFFER_LIMIT = 20;
const INACTIVITY_RESET_MS = 2500;

const isEditableTarget = (target) => {
  if (!target || !(target instanceof Element)) return false;

  const tagName = String(target.tagName || '').toLowerCase();
  if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') return true;
  if (target.isContentEditable) return true;

  return Boolean(target.closest('[contenteditable="true"]'));
};

const normalizeRedirectPath = (path) => {
  const trimmed = String(path || '').trim() || '/admin/login';
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

const redirectToPath = (path) => {
  const normalizedPath = normalizeRedirectPath(path);
  const usingHashRouter = typeof window !== 'undefined' && window.location.hash.startsWith('#/');

  if (usingHashRouter) {
    window.location.hash = `#${normalizedPath}`;
    return;
  }

  window.location.href = normalizedPath;
};

const useSecretAdminTrigger = ({ keyword = SECRET_KEYWORD, redirectTo = '/admin/login' } = {}) => {
  const bufferRef = useRef('');
  const timeoutRef = useRef(null);
  const normalizedKeyword = String(keyword || SECRET_KEYWORD).trim().toLowerCase();

  useEffect(() => {
    const clearBuffer = () => {
      bufferRef.current = '';
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const scheduleBufferReset = () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(clearBuffer, INACTIVITY_RESET_MS);
    };

    const handleKeyDown = (event) => {
      if (event.defaultPrevented) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (isEditableTarget(event.target) || isEditableTarget(document.activeElement)) return;

      if (event.key === 'Backspace') {
        bufferRef.current = bufferRef.current.slice(0, -1);
        scheduleBufferReset();
        return;
      }

      if (event.key.length !== 1) return;

      const nextBuffer = (bufferRef.current + event.key.toLowerCase()).slice(-BUFFER_LIMIT);
      bufferRef.current = nextBuffer;
      scheduleBufferReset();

      if (nextBuffer.includes(normalizedKeyword)) {
        clearBuffer();
        redirectToPath(redirectTo);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [normalizedKeyword, redirectTo]);
};

export default useSecretAdminTrigger;
