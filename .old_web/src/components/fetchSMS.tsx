// components/FetchSMS.tsx

import { useState, useEffect } from 'react';

interface SMSMessage {
  error?: string;
  messages: string[];
}

function FetchSMS() {
  const [messages, setMessages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/fetch-sms');
      const data: SMSMessage = await response.json();
      if (response.ok) {
        setMessages(data.messages);
      } else {
        setError(data.error || 'Failed to fetch messages');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch messages');
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div>
      <h2>Received SMS Messages</h2>
      {error && <p>Error: {error}</p>}
      {messages.length > 0 ? (
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>
              <pre>{msg}</pre>
            </li>
          ))}
        </ul>
      ) : (
        <p>No messages found.</p>
      )}
    </div>
  );
}

export default FetchSMS;
