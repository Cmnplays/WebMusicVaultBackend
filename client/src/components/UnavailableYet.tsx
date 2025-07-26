import React from "react";

const UnavailableYet: React.FC = () => {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        Feature Unavailable
      </h1>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        This feature is not available yet. We're working hard to bring it to you
        soon!
      </p>
      <button
        onClick={() => window.history.back()}
        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
      >
        Go Back
      </button>
    </main>
  );
};

export default UnavailableYet;
