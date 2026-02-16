import { FC } from 'react';

export interface RenewWarningProps {
  label: string;
  className?: string;
}

export const RenewWarning: FC<RenewWarningProps> = ({ label, className }) => {
  return (
    <p className={`session-card__warning ${className ?? ''}`}>
      <i className="fa fa-exclamation-triangle" aria-hidden="true" /> {label}
    </p>
  );
};