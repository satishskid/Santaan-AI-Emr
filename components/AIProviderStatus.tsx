import React from 'react';
import { getProviderStatus } from '../services/aiService';

const AIProviderStatus: React.FC = () => {
  const providers = getProviderStatus();
  
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">AI Provider Status</h3>
      <div className="space-y-2">
        {providers.map((provider) => (
          <div key={provider.provider} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  provider.available ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="text-sm font-medium capitalize">
                {provider.provider}
              </span>
              <span className="text-xs text-gray-500">
                ({provider.model})
              </span>
            </div>
            <span className={`text-xs px-2 py-1 rounded ${
              provider.available 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {provider.available ? 'Available' : 'Not Configured'}
            </span>
          </div>
        ))}
      </div>
      {providers.every(p => !p.available) && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          No AI providers configured. Please set up API keys in your .env file.
        </div>
      )}
    </div>
  );
};

export default AIProviderStatus;
