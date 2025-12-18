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

// Define the type locally to avoid importing from server-side paths
export interface UploadedFile {
  name: string;
  uri: string;
  mimeType: string;
  state: string;
}

const systemInstruction = `When given a video and a query, call the relevant \
function only once with the appropriate timecodes and text for the video`;

const client = new GoogleGenAI({apiKey: process.env.API_KEY});

async function generateContent(
  text: string,
  file: UploadedFile,
) {
  const response = await client.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        {text},
        {
          fileData: {
            mimeType: file.mimeType,
            fileUri: file.uri,
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

async function uploadFile(
  file: File,
  onProgress: (progress: number) => void,
  onStatusChange: (status: string) => void,
): Promise<UploadedFile> {
  const blob = new Blob([file], {type: file.type});
  onStatusChange('Uploading file...');
  onProgress(10);
  const uploadedFile = await client.files.upload({
    file: blob,
    config: {
      displayName: file.name,
    },
  });
  onProgress(50);
  onStatusChange('Processing media...');

  let getFile = await client.files.get({
    name: uploadedFile.name,
  });
  
  let progress = 50;
  let retries = 0;
  const maxRetries = 60; // Approx 2 minutes (60 * 2s)

  while (getFile.state === 'PROCESSING') {
    if (retries >= maxRetries) {
      throw new Error('File processing timed out. Please try again.');
    }
    retries++;
    
    progress = Math.min(progress + 5, 95);
    onProgress(progress);
    await new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });
    getFile = await client.files.get({
      name: uploadedFile.name,
    });
  }

  if (getFile.state === 'FAILED') {
    onProgress(0);
    throw new Error('File processing failed.');
  }

  onProgress(100);
  onStatusChange('Processing complete');
  
  // Cast the result to our local interface
  return getFile as unknown as UploadedFile;
}

export {generateContent, uploadFile};