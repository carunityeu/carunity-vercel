import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export default function useCaroStream(conversation, setMessages, setBusy, setError) {
  useEffect(() => {
    if (!conversation?.id) return;
    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, data => {
      const messages = data.messages || [];
      setMessages(messages);
      const last = messages[messages.length - 1];
      const running = last?.tool_calls?.some(tool => ['pending', 'running', 'in_progress'].includes(tool.status));
      if (last?.role === 'assistant' && last.content && !running && last.additional_message_params?.llm_finish_reason === 'stop') setBusy(false);
      if (last?.tool_calls?.some(tool => ['error', 'failed', 'stopped'].includes(tool.status))) { setError(true); setBusy(false); }
    });
    return unsubscribe;
  }, [conversation?.id, setMessages, setBusy, setError]);
}