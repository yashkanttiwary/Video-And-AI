/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// Copyright 2024 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {GoogleGenAI, HarmBlockThreshold, HarmCategory} from '@google/genai';
import functions from './functions';

export interface UploadedFile {
  name: string;
  data: string; // Base64 encoded data for inlineData
  mimeType: string;
}

const systemInstruction = `When given a video and a query, call the relevant \
function only once with the appropriate timecodes and text for the video. \
All timecodes must be strings in the format 'HH:MM:SS' (e.g. 00:00:05).`;

async function generateContent(
  text: string,
  file: UploadedFile,
  apiKey: string,
  signal?: AbortSignal
) {
  // Always use new GoogleGenAI({apiKey: process.env.API_KEY});
  const ai = new GoogleGenAI({ apiKey: apiKey || process.env.API_KEY });
  
  // Note: The Node.js/Web SDK for Gemini doesn't always support signal on the high-level method directly 
  // depending on version, but good practice to pass if custom fetch implementation allows.
  // Current @google/genai SDK doesn't expose signal in RequestOptions yet for all methods,
  // but we implement the interface for future compatibility / or if user uses a custom fetcher.
  // For now, the signal is primarily managed in the App logic to ignore results.

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: {
      parts: [
        {text},
        {
          inlineData: {
            mimeType: file.mimeType,
            data: file.data,
          },
        },
      ],
    },
    config: {
      systemInstruction,
      temperature: 0.5,
      tools: [{functionDeclarations: functions}],
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    },
  });

  return response;
}

/**
 * Converts a file to a base64 string for processing via inlineData.
 */
function fileToBase64(file: File, onProgress?: (progress: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    };

    reader.onload = () => {
      // Extract the base64 part (remove the prefix: data:video/mp4;base64,...)
      const result = reader.result as string;
      const base64String = result.substring(result.indexOf(',') + 1);
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
}

async function uploadFile(
  file: File,
  onProgress: (progress: number) => void,
  onStatusChange: (status: string) => void,
  apiKey: string,
): Promise<UploadedFile> {
  onStatusChange('Reading file...');
  onProgress(0);
  
  if (!apiKey && !process.env.API_KEY) {
    throw new Error('API Key not configured. Please set it in the sidebar.');
  }
  
  try {
    // Pass onProgress to fileToBase64 for real updates
    const base64Data = await fileToBase64(file, onProgress);
    onStatusChange('Analysis ready');
    
    return {
      name: file.name,
      data: base64Data,
      mimeType: file.type,
    };
  } catch (e) {
    onProgress(0);
    console.error(e);
    throw new Error('Could not read file. It might be too large or corrupted.');
  }
}

export {generateContent, uploadFile};
