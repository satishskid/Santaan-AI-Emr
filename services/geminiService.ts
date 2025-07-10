
// This file is kept for backward compatibility
// All AI functionality has been moved to aiService.ts which supports multiple providers with fallback

import { TaskData, Patient } from "../types";
import { getAIAnalysis as getAIAnalysisFromService, getProviderStatus as getProviderStatusFromService } from "./aiService";

// Export the main function for backward compatibility
export const getAIAnalysis = getAIAnalysisFromService;

// Export provider status for debugging
export const getProviderStatus = getProviderStatusFromService;


