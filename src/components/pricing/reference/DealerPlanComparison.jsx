import React from 'react';
import { useTranslation } from 'react-i18next';
export default function DealerPlanComparison() {
  const { t } = useTranslation();
  const labels = t('priceRef.tableLabels', { returnObjects: true });
  const rows = [ ['10','25',t('priceRef.unlimited')], ['✓','✓','✓'], ['✓','✓','✓'], [t('priceRef.basic'),t('priceRef.full'),t('priceRef.full')], ['–','–','✓'], ['–','–','✓'], ['–','✓','✓'], ['–',`2 ${t('priceRef.perMonth')}`,`6 ${t('priceRef.perMonth')}`], ['–','–',`2 ${t('priceRef.perMonth')}`], ['–','10%','25%'], [t('priceRef.payMonths'),t('priceRef.payMonths'),t('priceRef.saved')] ];
  return <div className="pr-table-wrap" tabIndex={0} role="region" aria-label={t('priceRef.dealerPlan')}><table className="pr-table">
    <thead><tr><th>{labels[0]}</th>{['STARTER','PRO','PREMIUM'].map(name => <th key={name}>{name}</th>)}</tr></thead>
    <tbody>{rows.map((row,i) => <tr key={labels[i+1]}><th scope="row">{labels[i+1]}</th>{row.map((value,j) => <td key={j} className={value === '✓' || (i === 10 && j === 2) ? 'pr-positive' : ''}>{value}</td>)}</tr>)}</tbody>
  </table></div>;
}