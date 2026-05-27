'use client';

import { Flag } from 'lucide-react';
import React, { useState } from 'react';
import { ReportTargetType } from '../lib/report.actions';
import { ReportModal } from './ReportModal';

export type ReportButtonProps = {
  targetType: ReportTargetType;
  targetId: string;
  className?: string;
  variant?: 'outline' | 'icon' | 'custom';
  label?: string;
  children?: React.ReactNode;
};

export function ReportButton({
  targetType,
  targetId,
  className = '',
  variant = 'outline',
  label = 'Báo cáo',
  children,
}: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const renderButtonContent = () => {
    if (children) return children;

    if (variant === 'icon') {
      return <Flag className="w-4 h-4" />;
    }

    // Default outline variant
    return (
      <>
        <Flag className="w-4 h-4" /> {label}
      </>
    );
  };

  const getBaseClassName = () => {
    if (variant === 'custom') return className;

    if (variant === 'icon') {
      return `inline-flex items-center justify-center p-1 text-ink-subtle hover:text-danger hover:bg-danger-50 rounded transition-colors ${className}`;
    }

    return `inline-flex items-center gap-2 justify-center btn-outline cursor-pointer hover:border-danger hover:text-danger transition-colors ${className}`;
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={getBaseClassName()}
        aria-label={label}
        title={label}
      >
        {renderButtonContent()}
      </button>

      {isOpen && (
        <ReportModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          targetType={targetType}
          targetId={targetId}
        />
      )}
    </>
  );
}
