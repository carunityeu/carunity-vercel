import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import CaroResults from '@/components/caro/CaroResults';

export default function CaroMessage({ message }) {
  const { t } = useTranslation();
  if (message.hidden || !['user', 'assistant'].includes(message.role)) return null;
  const content = typeof message.content === 'string' ? message.content : '';
  if (message.role === 'user') return <div className="caro-message caro-user">{content}</div>;
  const ids = [...new Set([...content.matchAll(/\]\(\/CarDetails\?id=([a-zA-Z0-9_-]+)\)/g)].map(match => match[1]))].slice(0, 3);
  const text = content.replace(/\[([^\]]*)\]\(\/CarDetails\?id=[a-zA-Z0-9_-]+\)/g, '').replace(/\[[^\]]*\](?:\(\/CarDetails[^)]*)?$/, '').replace(/^\s*[-*]\s*$/gm, '');
  return <div className="caro-message" data-caro-answer>
    <div className="caro-answer"><ReactMarkdown components={{ a: ({ href, children }) => href?.startsWith('/') && !href.startsWith('//') ? <a href={href}>{children}</a> : <span>{children}</span> }}>{text}</ReactMarkdown></div>
    {message.tool_calls?.map((tool, index) => {
      const pending = ['pending', 'running', 'in_progress'].includes(tool.status);
      const failed = ['failed', 'error', 'stopped'].includes(tool.status) || /"success"\s*:\s*false|"error"\s*:/i.test(typeof tool.results === 'string' ? tool.results : JSON.stringify(tool.results || {}));
      const projection = tool.display_projection;
      const label = projection?.hide_details && projection?.details_redacted ? (pending ? projection.active_label : failed ? projection.error_label : projection.label) : null;
      const Icon = pending ? Loader2 : failed ? AlertCircle : Check;
      return <div key={tool.id || index} className="caro-status"><Icon className={`w-3.5 h-3.5 ${pending ? 'animate-spin' : ''}`} /><span>{label || t(pending ? 'caro.searching' : failed ? 'caro.error' : 'caro.checked')}</span></div>;
    })}
    {ids.length > 0 && <CaroResults ids={ids} />}
  </div>;
}