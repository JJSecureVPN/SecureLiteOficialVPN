import React, { memo } from 'react';
import { Card } from '@/shared';

type KVItem = { label: React.ReactNode; value: React.ReactNode; valueClass?: string };

interface KeyValueListProps {
  title: React.ReactNode;
  items: KVItem[];
  compact?: boolean;
  className?: string;
}

/**
 * KeyValueList — lista compacta de clave/valor usada en AccountScreen
 * Reutiliza las clases CSS existentes (`account-card compact`, `card-head`, `account-card li`)
 */
export const KeyValueList = memo(function KeyValueList({
  title,
  items,
  compact = true,
  className = '',
}: KeyValueListProps) {
  return (
    <Card className={`account-card ${compact ? 'compact' : ''} ${className}`.trim()}>
      <div className="card-head">
        <span>{title}</span>
      </div>

      <ul>
        {items.map(({ label, value, valueClass }, i) => (
          <li key={String(i) + String(label)}>
            <span>{label}</span>
            <strong className={valueClass}>{value}</strong>
          </li>
        ))}
      </ul>
    </Card>
  );
});

export default KeyValueList;
