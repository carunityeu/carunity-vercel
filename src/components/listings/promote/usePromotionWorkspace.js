import { useEffect, useState } from 'react';
import { EMPTY_SELECTION, hasSelection } from '@/lib/promoteOptions';
export default function usePromotionWorkspace(list, open, initialSelectedIds) {
 const [selections, setSelections] = useState({});
 const [activeId, setActiveId] = useState(null);
 const [enabled, setEnabled] = useState(new Set());
 const [same, setSame] = useState(false);
 const idsKey = list.map(c => c.id).join(',');
 const initialKey = initialSelectedIds?.join(',');
 useEffect(() => {
  if (!open) return;
  setSelections({}); setSame(false);
  setEnabled(new Set(initialSelectedIds?.length ? initialSelectedIds : list.map(c => c.id)));
  setActiveId(initialSelectedIds?.[0] || list[0]?.id || null);
 }, [open, idsKey, initialKey]);
 const activeCar = list.find(c => c.id === activeId) || list[0];
 const change = next => {
  setEnabled(prev => new Set([...prev, activeCar.id]));
  setSelections(prev => same ? Object.fromEntries(list.map(c => [c.id, enabled.has(c.id) || c.id === activeCar.id ? { ...next } : prev[c.id] || EMPTY_SELECTION])) : { ...prev, [activeCar.id]: next });
 };
 const toggle = id => {
  const next = new Set(enabled);
  if (next.has(id)) next.delete(id);
  else { next.add(id); if (same && activeCar) setSelections(s => ({ ...s, [id]: { ...(s[activeCar.id] || EMPTY_SELECTION) } })); }
  setEnabled(next);
 };
 const toggleAll = () => {
  if (enabled.size === list.length) setEnabled(new Set());
  else { setEnabled(new Set(list.map(c => c.id))); if (same && activeCar) setSelections(prev => Object.fromEntries(list.map(c => [c.id, { ...(prev[activeCar.id] || EMPTY_SELECTION) }]))); }
 };
 const toggleSame = () => {
  if (!same && activeCar) setSelections(prev => ({ ...prev, ...Object.fromEntries(list.filter(c => enabled.has(c.id)).map(c => [c.id, { ...(prev[activeCar.id] || EMPTY_SELECTION) }])) }));
  setSame(!same);
 };
 const skip = () => {
  setEnabled(prev => { const next = new Set(prev); next.delete(activeCar.id); return next; });
  const index = list.findIndex(c => c.id === activeCar.id);
  const next = [...list.slice(index + 1), ...list.slice(0, index)].find(c => enabled.has(c.id));
  if (next) setActiveId(next.id);
 };
 return { selections, activeCar, setActiveId, enabled, same, change, toggle, toggleAll, toggleSame, skip, ready: list.filter(c => enabled.has(c.id) && hasSelection(selections[c.id])) };
}