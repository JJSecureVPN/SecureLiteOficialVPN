import React, { memo } from 'react';
import { Card } from '@/shared/ui';

interface StatCardProps {
  label: React.ReactNode;
  value: React.ReactNode;
  valueClass?: string;
  className?: string;
}

/** StatCard — pequeña tarjeta usada en Account (usa la clase `.stat-card`) */
export const StatCard = memo(function StatCard({
  label,
  value,
  valueClass,
  className = '',
}: StatCardProps) {
  return (
    <Card className={`stat-card ${className}`}>
      <small>{label}</small>
      <strong className={valueClass}>{value}</strong>
    </Card>
  );
});
