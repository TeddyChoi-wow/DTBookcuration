
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <p className="text-slate-600 font-medium text-lg animate-pulse">
        북 큐레이터가 책장을 살펴보고 있어요...
      </p>
    </div>
  );
};

export default LoadingSpinner;
