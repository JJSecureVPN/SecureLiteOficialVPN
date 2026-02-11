import { memo, type ButtonHTMLAttributes } from 'react';
import '../../styles/components/quick-buttons.css';

interface QuickButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string; // e.g. 'fa-rotate'
  label: string;
}

export const QuickButton = memo(function QuickButton({ icon, label, className = '', ...props }: QuickButtonProps) {
  return (
    <button className={`ql-qbtn ${className}`} type="button" {...props} aria-label={props['aria-label'] || label}>
      <i className={`fa ${icon}`} aria-hidden="true" />
      <span className="ql-qbtn-label">{label}</span>
    </button>
  );
});

export default QuickButton;
