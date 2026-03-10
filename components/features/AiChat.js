'use client';

import Typography from '@mui/material/Typography';
import { useAi } from '../../hooks/useAi.js';

export default function AiChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useAi();

  return (
    <div>
      <div style={{ maxHeight: `400px`, overflow: `auto`, border: `1px solid #ccc`, padding: `1rem`, marginBottom: `1rem` }}>
        {messages.length === 0 && <Typography color="text.secondary">Start a conversation...</Typography>}
        {messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: `0.75rem` }}>
            <strong>{msg.role === `user` ? `You` : `Assistant`}:</strong>
            <div style={{ whiteSpace: `pre-wrap` }}>{msg.content}</div>
          </div>
        ))}
        {isLoading && <Typography color="text.secondary">Thinking...</Typography>}
      </div>

      {error && <Typography color="error">{error.message}</Typography>}

      <form onSubmit={handleSubmit} style={{ display: `flex`, gap: `0.5rem` }}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder={`Type a message...`}
          disabled={isLoading}
          style={{ flex: 1, padding: `0.5rem` }}
        />
        <button type={`submit`} disabled={isLoading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
