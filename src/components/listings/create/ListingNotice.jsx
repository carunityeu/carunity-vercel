import React from 'react';
import { Info } from 'lucide-react';

export default function ListingNotice({ children, action }) {
  return <div className="lc-notice"><Info aria-hidden="true" /><span>{children}</span>{action}</div>;
}