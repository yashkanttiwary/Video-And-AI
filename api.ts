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
function only once with the appropriate timecodes and text for the video`;

// Initialize the GenAI client strictly according to guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function generateContent(
  text: string,
  file: UploadedFile,
) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
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
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
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
): Promise<UploadedFile> {
  onStatusChange('Reading file...');
  onProgress(30);
  
  try {
    const base64Data = await fileToBase64(file);
    onProgress(100);
    onStatusChange('Analysis ready');
    
    return {
      name: file.name,
      data: base64Data,
      mimeType: file.type,
    };
  } catch (e) {
    onProgress(0);
    throw new Error('Could not read file. It might be too large or corrupted.');
  }
}

export {generateContent, uploadFile};