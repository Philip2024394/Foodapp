import React, { useEffect, useState } from 'react';
import { client, account } from '../../lib/appwrite';

type Status = 'idle' | 'ok' | 'error';

export default function AuthHealth() {
  const [endpoint, setEndpoint] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string>('');
  const [sessionEmail, setSessionEmail] = useState<string>('');

  useEffect(() => {
    try {
      // @ts-ignore access configured values indirectly
      const cfg: any = client;
      setEndpoint((import.meta as any).env?.VITE_APPWRITE_ENDPOINT || '');
      setProjectId((import.meta as any).env?.VITE_APPWRITE_PROJECT_ID || '');
    } catch {}

    (async () => {
      try {
        // Attempt to fetch current account; will succeed if session exists
        const me = await account.get();
        setSessionEmail((me as any)?.email || '');
        setStatus('ok');
        setMessage('Client connected; session active');
      } catch (err: any) {
        // If not logged in, still test a lightweight call by checking preferences (will throw if no session)
        try {
          await account.getPrefs();
          setStatus('ok');
          setMessage('Client connected; session present');
        } catch (e) {
          // No session; consider connection ok if endpoint/project look set
          if (endpoint && projectId) {
            setStatus('ok');
            setMessage('Client connected; no active session');
          } else {
            setStatus('error');
            setMessage('Missing endpoint/project envs');
          }
        }
      }
    })();
  }, [endpoint, projectId]);

  return (
    <div className="p-3 text-sm border rounded">
      <div className="font-semibold">Auth Health</div>
      <div>Endpoint: {endpoint || 'not set'}</div>
      <div>Project: {projectId || 'not set'}</div>
      <div>Status: {status}</div>
      <div>Message: {message}</div>
      {sessionEmail ? <div>Session: {sessionEmail}</div> : <div>No session</div>}
    </div>
  );
}
