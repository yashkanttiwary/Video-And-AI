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

import { useRef } from 'react';
import { GenerateContentResponse } from '@google/genai';
import { generateContent } from './api';
import modes from './modes';
import { useAppContext } from './context';
import type { Timecode } from './types';

export function useAnalysis() {
  const {
    file,
    selectedMode,
    chartMode,
    customPrompt,
    chartPrompt,
    setApiError,
    setIsLoading,
    setTimecodeList,
    setTextResponse,
    setActiveMode,
    setChartLabel,
    userApiKey,
  } = useAppContext();

  const abortControllerRef = useRef<AbortController | null>(null);

  const cancelAnalysis = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setApiError(null);
  };

  const runAnalysis = async (mode: string) => {
    if (!file) {
      setApiError('Please upload a video or audio file first.');
      return;
    }

    // Abort previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const signal = controller.signal;

    setActiveMode(mode);
    setIsLoading(true);
    setTimecodeList(null);
    setTextResponse(null);
    setApiError(null);

    // Derived mode logic
    const isChartMode = selectedMode === 'Chart';
    const isCustomChartMode = isChartMode && chartMode === 'Custom';
    const isCustomMode = selectedMode === 'Custom';

    setChartLabel(
      isChartMode
        ? isCustomChartMode
          ? chartPrompt
          : chartMode
        : '',
    );

    try {
      const promptConfig = modes[mode].prompt;
      const prompt =
        isCustomMode && typeof promptConfig === 'function'
          ? promptConfig(customPrompt)
          : isChartMode && typeof promptConfig === 'function'
          ? promptConfig(
              isCustomChartMode
                ? chartPrompt
                : modes[mode].subModes![chartMode],
            )
          : (promptConfig as string);

      let resp: GenerateContentResponse | null = null;
      const maxRetries = 3;
      
      for (let i = 0; i < maxRetries; i++) {
        if (signal.aborted) return;

        try {
            resp = await generateContent(prompt, file, userApiKey, signal);
        } catch (err) {
            // Check if aborted during await
             if (signal.aborted) return;
             throw err;
        }

        const hasFunctionCall = resp.functionCalls?.[0];
        const hasText = resp.text;
        const finishReason = resp.candidates?.[0]?.finishReason;
        
        if (finishReason === 'SAFETY' || finishReason === 'RECITATION') {
          break;
        }

        if (hasFunctionCall || hasText) {
          break;
        }

        if (i < maxRetries - 1) {
          const delay = 1000 * 2 ** i + Math.random() * 1000;
          await new Promise((resolve) => {
            const timeout = setTimeout(resolve, delay);
            signal.addEventListener('abort', () => clearTimeout(timeout));
          });
        }
      }

      if (signal.aborted) return;

      if (!resp) {
        setApiError('No response received from the model.');
        return;
      }
      
      const safeResp = resp as GenerateContentResponse;
      const call = safeResp.functionCalls?.[0];

      if (call?.name && call.args) {
        if (call.name.startsWith('set_timecodes')) {
          // Basic validation to ensure args.timecodes is an array
          const timecodes = call.args.timecodes;
          if (Array.isArray(timecodes)) {
             const sanitized = timecodes.map((t: any) =>
                'text' in t ? {...t, text: String(t.text).replace(/\\'/g, "'")} : t,
              );
              setTimecodeList(sanitized as Timecode[]);
          } else {
             console.error("Invalid function call arguments", call.args);
             setApiError("Model returned invalid data format.");
          }
        }
      } else if (safeResp.text) {
        setTextResponse(safeResp.text);
      } else {
        const finishReason = safeResp.candidates?.[0]?.finishReason;
        if (finishReason === 'SAFETY') {
          setApiError(
            'The model blocked the response due to safety concerns. Please try a different prompt or video.',
          );
        } else if (finishReason === 'RECITATION') {
          setApiError('The model blocked the response due to recitation concerns.');
        } else {
          setApiError(
            "The model didn't return a valid response after multiple attempts. Please try a different prompt.",
          );
        }
      }
    } catch (e) {
      if (!signal.aborted) {
        console.error(e);
        setApiError(e instanceof Error ? e.message : 'An unknown error occurred.');
      }
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    }
  };

  return { runAnalysis, cancelAnalysis };
}