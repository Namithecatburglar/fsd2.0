import React from 'react';

export const SkeletonLoader = ({ className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-wind-surface/80 border border-wind-border/40 rounded-none ${className}`}
        />
      ))}
    </>
  );
};
