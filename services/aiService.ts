import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import Groq from "groq-sdk";
import { TaskData, FollicleScanData, Patient, PatientHistoryData, SpermAnalysisData, HcgData } from "../types";

// AI Provider types
type AIProvider = 'gemini' | 'openrouter' | 'groq';

interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  baseURL?: string;
}

// Provider configurations
const AI_CONFIGS: Record<AIProvider, Omit<AIConfig, 'apiKey'>> = {
  gemini: {
    provider: 'gemini',
    model: 'gemini-2.5-flash-preview-04-17'
  },
  openrouter: {
    provider: 'openrouter',
    model: 'deepseek/deepseek-chat',
    baseURL: 'https://openrouter.ai/api/v1'
  },
  groq: {
    provider: 'groq',
    model: 'llama-3.3-70b-versatile'
  }
};

// Provider instances
let geminiClient: GoogleGenAI | null = null;
let groqClient: Groq | null = null;

// Initialize providers
function initializeProviders(): AIConfig[] {
  const availableConfigs: AIConfig[] = [];

  // Initialize Gemini
  const geminiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (geminiKey) {
    geminiClient = new GoogleGenAI({ apiKey: geminiKey });
    availableConfigs.push({ ...AI_CONFIGS.gemini, apiKey: geminiKey });
  }

  // Initialize OpenRouter
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (openrouterKey) {
    availableConfigs.push({ ...AI_CONFIGS.openrouter, apiKey: openrouterKey });
  }

  // Initialize Groq
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    groqClient = new Groq({ apiKey: groqKey });
    availableConfigs.push({ ...AI_CONFIGS.groq, apiKey: groqKey });
  }

  return availableConfigs;
}

// Utility functions
const cleanJsonString = (jsonStr: string): string => {
  let cleaned = jsonStr.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = cleaned.match(fenceRegex);
  if (match && match[2]) {
    cleaned = match[2].trim();
  }
  return cleaned;
};

// OpenRouter API call
async function callOpenRouter(config: AIConfig, prompt: string, imageBase64?: string): Promise<string> {
  const messages: any[] = [
    {
      role: "user",
      content: imageBase64 
        ? [
            { type: "text", text: prompt },
            { 
              type: "image_url", 
              image_url: { 
                url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` 
              } 
            }
          ]
        : prompt
    }
  ];

  const response = await fetch(`${config.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'AI-Assisted IVF EMR'
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      response_format: { type: "json_object" },
      temperature: 0.1
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '{}';
}

// Groq API call
async function callGroq(prompt: string, imageBase64?: string): Promise<string> {
  if (!groqClient) {
    throw new Error('Groq client not initialized');
  }

  // Note: Groq doesn't support images in the same way, so we'll include image info in text
  let fullPrompt = prompt;
  if (imageBase64) {
    fullPrompt += "\n\nNote: An image was provided but cannot be processed by this provider. Please provide analysis based on the text description only.";
  }

  const completion = await groqClient.chat.completions.create({
    messages: [
      {
        role: "user",
        content: fullPrompt
      }
    ],
    model: AI_CONFIGS.groq.model,
    temperature: 0.1,
    response_format: { type: "json_object" }
  });

  return completion.choices[0]?.message?.content || '{}';
}

// Gemini API call
async function callGemini(prompt: string, imageBase64?: string): Promise<string> {
  if (!geminiClient) {
    throw new Error('Gemini client not initialized');
  }

  const contents = [];
  const textPart = { text: prompt };
  contents.push(textPart);

  if (imageBase64) {
    const pureBase64 = imageBase64.split(',').pop() || '';
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: pureBase64,
      },
    };
    contents.push(imagePart);
  }

  const response: GenerateContentResponse = await geminiClient.models.generateContent({
    model: AI_CONFIGS.gemini.model,
    contents: { parts: contents },
    config: {
      responseMimeType: "application/json",
    },
  });

  return response.text;
}

// Main AI call function with fallback
async function callAIProvider(config: AIConfig, prompt: string, imageBase64?: string): Promise<string> {
  switch (config.provider) {
    case 'gemini':
      return await callGemini(prompt, imageBase64);
    case 'openrouter':
      return await callOpenRouter(config, prompt, imageBase64);
    case 'groq':
      return await callGroq(prompt, imageBase64);
    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}

// Get prompt for specific task types
const getPromptForTask = (taskTitle: string, context: { taskData: TaskData; patient?: Patient }): string => {
  const { taskData, patient } = context;
  const dataString = JSON.stringify(taskData, null, 2);
  let prompt = `You are an expert AI assistant for an IVF clinic. Analyze the provided data for the task "${taskTitle}".
    Provide concise, actionable suggestions for specific fields in a JSON object format.
    The keys of the JSON object must correspond to the fields in the input data.
    Only provide suggestions for fields where you have a high-confidence recommendation. If no suggestion, omit the key.`;

  if (taskTitle.includes('Follicle Scan')) {
    prompt += `\n\nFor this Follicle Scan, analyze the measurements and any provided image.
    Input Data:
    ${dataString}

    Provide suggestions for 'endometriumThickness' (as a number), 'endometriumPattern' (as 'Trilaminar', 'Homogenous', or 'Other'), and 'notes' (a brief summary).
    Example JSON output:
    { "endometriumThickness": 9.5, "endometriumPattern": "Trilaminar", "notes": "Endometrial lining appears receptive. Follicular growth is homogenous." }`
  } else if (taskTitle.includes('Psychological Assessment')) {
      prompt = `You are a clinical psychologist specializing in fertility counseling. Based on the provided clinical, emotional, and financial needs, please perform two tasks:
      1. Generate a concise "Persona": A 2-3 sentence summary that captures the patient's or couple's psychological archetype (e.g., "The Anxious Planners," "The Resilient Optimists," "The Guarded Hopefuls").
      2. Create an "Intervention Plan": A bulleted list of specific, actionable recommendations for the counselor to support the patient(s). Use '\\n-' to separate bullet points.

      Input Data:
      ${dataString}

      Provide your response in a valid JSON object format with exactly two keys: "persona" and "interventionPlan".
      Example JSON output:
      {
        "persona": "This couple presents as 'The Guarded Researchers.' They are highly informed and analytical, using data to manage their anxiety, but this intellectual approach may mask deeper fears of disappointment.",
        "interventionPlan": "- Schedule a joint session to practice communication techniques.\\n- Provide resources for financial planning for fertility treatments.\\n- Introduce mindfulness and relaxation exercises to manage procedure-related anxiety."
      }`
  } else if (taskTitle === 'Sperm Analysis') {
    const { count, motility, morphology } = taskData as SpermAnalysisData;
    prompt = `You are a senior clinical embryologist. Based on WHO 2021 criteria (Count > 16M/mL, Motility > 42% progressive, Morphology > 4% normal forms), analyze the following sperm parameters:
    - Count: ${count} million/mL
    - Motility: ${motility}%
    - Morphology: ${morphology}%

    Your Task:
    1. Provide a concise 'assessment' term for the sample (e.g., Normozoospermia, Teratozoospermia, Oligoasthenoteratozoospermia (OAT)).
    2. Provide a 'recommendation' for the fertilization method (Standard IVF or ICSI) based on the parameters. Severe defects in any parameter should warrant an ICSI recommendation.

    Provide your response in a valid JSON object format with the keys "assessment" and "recommendation".
    Example JSON output:
    {
        "assessment": "Oligoasthenoteratozoospermia (OAT)",
        "recommendation": "ICSI is strongly recommended due to low count, motility, and morphology."
    }`;
  } else if (taskTitle === 'Day 5 Check & Grading') {
      prompt = `You are an expert embryologist. Analyze the provided embryo image.

      Your Task:
      1. Suggest a blastocyst 'grade' using the Gardner grading system (e.g., '4AA', '3BC', '5AB').
      2. Provide brief 'notes' explaining your reasoning based on expansion, inner cell mass (ICM), and trophectoderm (TE) quality visible in the image.

      Provide your response in a valid JSON object with the keys "grade" and "notes".
      Example JSON output:
      {
          "grade": "4AA",
          "notes": "Fully expanded blastocyst with a tightly packed, prominent ICM and a cohesive trophectoderm with many cells."
      }`;
  } else if (taskTitle === 'hCG Blood Test') {
    const { hcgValue } = taskData as HcgData;
    const daysPostTransfer = 14; // Assuming a standard Day 14 test
    prompt = `You are a clinical nurse specialist. A patient's hCG blood test was taken ${daysPostTransfer} days after a Day 5 embryo transfer.

    The patient's result is: ${hcgValue} mIU/mL.

    Your Task:
    Provide a clinical 'interpretation' for this result. Use one of the following interpretations:
    - 'Positive, consistent with a viable pregnancy.' (for values > 50)
    - 'Low positive. Repeat test in 48-72 hours to confirm viability.' (for values between 5 and 50)
    - 'Negative.' (for values < 5)

    Provide your response in a valid JSON object with a single key: "interpretation".
    Example JSON output:
    { "interpretation": "Positive, consistent with a viable pregnancy." }`;
  } else if (taskTitle === 'Prescribe Medication' && patient) {
    const historyTask = patient.pathway.find(p => p.stepName === 'Initial Consultation')?.tasks.find(t => t.title === 'Review Patient History');
    const historyData = historyTask?.data as PatientHistoryData | undefined;

    prompt = `You are an expert reproductive endocrinologist providing clinical decision support. Based on the following patient data, suggest a medication protocol for ovarian stimulation.

    Patient Data:
    - Age: ${patient.age}
    - Protocol: ${patient.protocol}
    - Diagnoses: ${JSON.stringify(historyData?.diagnoses || 'N/A')}
    - Previous IVF Cycles: ${historyData?.previousIVFCycles || 0}
    - Notes: ${historyData?.notes || 'N/A'}

    Your Task:
    1. Recommend a primary gonadotropin (e.g., Gonal-F, Menopur, Follistim).
    2. Suggest a starting dosage in IU, frequency (e.g., 'Daily'), and an initial duration in days.
    3. Provide a concise clinical 'explanation' for your choices, citing the patient's specific data points. For example: "Given the patient's age and PCOS diagnosis, a conservative starting dose of Gonal-F is recommended to mitigate OHSS risk."

    Provide your response in a valid JSON object format with the following keys: "medication", "dosage", "frequency", "duration", "explanation".
    Example JSON output:
    {
      "medication": "Gonal-F",
      "dosage": "150 IU",
      "frequency": "Daily",
      "duration": "10 days",
      "explanation": "Given the patient's age of ${patient.age} and diagnosis of PCOS, a standard dose of Gonal-F is recommended to ensure a good follicular response while monitoring closely for signs of OHSS."
    }`;
  } else {
    prompt += `
    Input Data:
    ${dataString}

    Provide your suggestions in the following JSON format:
    { "fieldName": "Your suggestion here..." }`;
  }

  return prompt;
};

// Main export function with fallback logic
export const getAIAnalysis = async (
  taskTitle: string,
  context: { taskData: TaskData; patient?: Patient },
  imageBase64?: string
): Promise<Record<string, any>> => {
  const availableConfigs = initializeProviders();

  if (availableConfigs.length === 0) {
    console.warn("No AI providers configured. AI features will be disabled.");
    return Promise.resolve({
      error: "AI analysis is unavailable. No API keys configured.",
    });
  }

  const prompt = getPromptForTask(taskTitle, context);

  // Try each provider in order until one succeeds
  for (let i = 0; i < availableConfigs.length; i++) {
    const config = availableConfigs[i];
    try {
      console.log(`Attempting AI analysis with ${config.provider}...`);

      const responseText = await callAIProvider(config, prompt, imageBase64);
      const jsonStr = cleanJsonString(responseText);
      const result = JSON.parse(jsonStr);

      console.log(`Successfully got AI analysis from ${config.provider}`);
      return result;

    } catch (error) {
      console.warn(`Failed to get analysis from ${config.provider}:`, error);

      // If this is the last provider, throw the error
      if (i === availableConfigs.length - 1) {
        console.error("All AI providers failed:", error);
        return {
          error: `Failed to get analysis from all available providers. Last error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }

      // Otherwise, continue to the next provider
      console.log(`Trying next provider...`);
    }
  }

  // This should never be reached, but just in case
  return {
    error: "Unexpected error: No providers were tried.",
  };
};

// Export provider status for debugging
export const getProviderStatus = (): { provider: AIProvider; available: boolean; model: string }[] => {
  const status = [];

  status.push({
    provider: 'gemini' as AIProvider,
    available: !!(process.env.GEMINI_API_KEY || process.env.API_KEY),
    model: AI_CONFIGS.gemini.model
  });

  status.push({
    provider: 'openrouter' as AIProvider,
    available: !!process.env.OPENROUTER_API_KEY,
    model: AI_CONFIGS.openrouter.model
  });

  status.push({
    provider: 'groq' as AIProvider,
    available: !!process.env.GROQ_API_KEY,
    model: AI_CONFIGS.groq.model
  });

  return status;
};
