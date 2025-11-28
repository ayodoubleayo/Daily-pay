// File: components/useMessage.jsx
'use client';

import { useCallback, useState } from 'react';

/**
 * Stable message hook for global small notifications.
 * - showMessage is wrapped in useCallback([]) so it never changes reference
 * - returns { message, isError, showMessage, clearMessage }
 */
export default function useMessage() {
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const showMessage = useCallback((msg, isErr = false) => {
    setIsError(isErr);
    setMessage(msg);

    // clear after 5s
    setTimeout(() => setMessage(''), 5000);
  }, []);

  const clearMessage = useCallback(() => {
    setMessage('');
    setIsError(false);
  }, []);

  return { message, isError, showMessage, clearMessage };
}
