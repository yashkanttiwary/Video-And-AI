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
  uri: string;
  mimeType: string;
}

const systemInstruction = `When given a video and a query, call the relevant \
function only once with the appropriate timecodes and text for the video. \
You must analyze the ENTIRE duration of the video, from start to finish.`;

async function generateContent(
  text: string,
  file: UploadedFile,
) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Using gemini-3-pro-preview as it supports long context for videos
  const response = await ai.models.generateContent({
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
  if (!process.env.API_KEY) {
    throw new Error('API Key not configured in environment.');
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    onStatusChange('Uploading to Gemini...');
    onProgress(10);

    // Step 1: Upload the file
    const uploadResponse = await ai.files.upload({
      file: file,
      config: { mimeType: file.type }
    });

    onProgress(40);
    onStatusChange('Google is processing video...');

    // Step 2: Poll for active status
    let fileRecord = uploadResponse.file;
    while (fileRecord.state === 'PROCESSING') {
      // Wait 2 seconds before checking again
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const statusResponse = await ai.files.get({ name: fileRecord.name });
      fileRecord = statusResponse.file;
    }

    if (fileRecord.state === 'FAILED') {
      throw new Error('Video processing failed on Google servers.');
    }

    onProgress(100);
    onStatusChange('Ready for analysis');

    return {
      name: fileRecord.name,
      uri: fileRecord.uri,
      mimeType: fileRecord.mimeType,
    };

  } catch (e) {
    onProgress(0);
    console.error(e);
    throw new Error('Upload failed. ' + (e instanceof Error ? e.message : 'Unknown error'));
  }
}

export {generateContent, uploadFile};