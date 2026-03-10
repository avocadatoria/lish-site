'use client';

import Typography from '@mui/material/Typography';
import { useAi } from '../../../hooks/useAi.js';

export default function AiPlaygroundPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useAi();

  return (
    <main>
      <Typography variant="h4" component="h1" gutterBottom>AI Chat</Typography>

      <div style={{ maxHeight: `60vh`, overflow: `auto`, marginBottom: `1rem` }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: `0.5rem` }}>
            <strong>{msg.role === `user` ? `You` : `AI`}:</strong>
            <Typography>{msg.content}</Typography>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder={`Ask something...`}
          disabled={isLoading}
          style={{ width: `80%`, marginRight: `0.5rem` }}
        />
        <button type={`submit`} disabled={isLoading}>
          {isLoading ? `Thinking...` : `Send`}
        </button>
      </form>
    </main>
  );
}
