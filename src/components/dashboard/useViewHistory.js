import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function useViewHistory(user) {
  const [cursors, setCursors] = useState([null]);
  const before = cursors[cursors.length - 1];
  const query = { user_email: user.email };
  const history = useQuery({
    queryKey: ['viewHistory', user.email, before],
    queryFn: async () => {
      const result = await base44.entities.ViewHistory.aggregate({
        query, groupBy: 'car_id', max: 'viewed_at', sort: '-max_viewed_at', limit: 6,
        ...(before ? { having: { max_viewed_at: { $lt: before } } } : {})
      });
      const ids = result.rows.map(row => row.car_id);
      const page = ids.length ? await base44.entities.Car.filter({ id: { $in: ids }, status: 'active' }, { limit: 6 }) : { items: [] };
      const byId = Object.fromEntries(page.items.map(car => [car.id, car]));
      return { rows: result.rows.map(row => ({ ...row, car: byId[row.car_id] })), hasMore: result.truncated };
    }
  });
  const count = useQuery({
    queryKey: ['viewHistory', user.email, 'count'],
    queryFn: async () => {
      const result = await base44.entities.ViewHistory.aggregate({ query, countDistinct: 'car_id' });
      return result.rows[0]?.countDistinct_car_id ?? result.rows[0]?.count_distinct_car_id ?? 0;
    }
  });
  return { ...history, count: count.data, page: cursors.length,
    previous: () => setCursors(prev => prev.slice(0, -1)),
    next: () => setCursors(prev => [...prev, history.data.rows.at(-1).max_viewed_at]) };
}