/** @format */

import React from "react";

export interface LoadingProps {
  loadingMessage?: string | null;
}

const LoadingPage: React.FC<LoadingProps> = ({ loadingMessage }) => {
  return (
    <div className="loading-container flex flex-col items-center justify-center">
      <div className="loading-letter">Å</div>
      {loadingMessage && (
        <div className="loading-message">{loadingMessage}</div>
      )}
    </div>
  );
};

export default LoadingPage;
