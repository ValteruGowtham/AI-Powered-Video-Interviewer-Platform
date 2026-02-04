/**
 * Skeleton Loading Components
 * Used for content placeholders while data is loading
 */
import React from 'react';
import './Skeleton.css';

/**
 * Basic skeleton block
 */
export function Skeleton({ width, height, variant = 'rectangular', className = '', style = {} }) {
  return (
    <div
      className={`skeleton skeleton-${variant} ${className}`}
      style={{
        width: width || '100%',
        height: height || '1rem',
        ...style
      }}
      aria-hidden="true"
    />
  );
}

/**
 * Text skeleton with multiple lines
 */
export function SkeletonText({ lines = 3, lastLineWidth = '60%' }) {
  return (
    <div className="skeleton-text">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height="0.875rem"
          width={index === lines - 1 ? lastLineWidth : '100%'}
          style={{ marginBottom: index < lines - 1 ? '0.5rem' : 0 }}
        />
      ))}
    </div>
  );
}

/**
 * Card skeleton for question/session cards
 */
export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card-header">
        <Skeleton variant="circular" width="40px" height="40px" />
        <div className="skeleton-card-meta">
          <Skeleton height="1rem" width="60%" />
          <Skeleton height="0.75rem" width="40%" />
        </div>
      </div>
      <SkeletonText lines={2} />
      <div className="skeleton-card-footer">
        <Skeleton height="2rem" width="80px" variant="rounded" />
        <Skeleton height="2rem" width="80px" variant="rounded" />
      </div>
    </div>
  );
}

/**
 * Table skeleton for data tables
 */
export function SkeletonTable({ rows = 5, columns = 4 }) {
  return (
    <div className="skeleton-table">
      <div className="skeleton-table-header">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} height="1rem" width="80%" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="skeleton-table-row">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              height="0.875rem" 
              width={colIndex === 0 ? '70%' : '60%'} 
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Report skeleton for the report page
 */
export function SkeletonReport() {
  return (
    <div className="skeleton-report">
      <div className="skeleton-report-header">
        <Skeleton variant="circular" width="120px" height="120px" />
        <div className="skeleton-report-title">
          <Skeleton height="2rem" width="300px" />
          <Skeleton height="1rem" width="200px" />
        </div>
      </div>
      
      <div className="skeleton-report-stats">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-stat-card">
            <Skeleton height="3rem" width="3rem" variant="circular" />
            <Skeleton height="1rem" width="80px" />
          </div>
        ))}
      </div>

      <div className="skeleton-report-sections">
        <div className="skeleton-section">
          <Skeleton height="1.5rem" width="200px" style={{ marginBottom: '1rem' }} />
          <SkeletonText lines={4} />
        </div>
        <div className="skeleton-section">
          <Skeleton height="1.5rem" width="200px" style={{ marginBottom: '1rem' }} />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}

export default {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonTable,
  SkeletonReport
};
