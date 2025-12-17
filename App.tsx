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

import c from 'classnames';
import {
  ChangeEvent,
  DragEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import {generateContent, uploadFile} from './api';
import modes from './modes';
import OutputPanel from './OutputPanel';
import Sidebar from './Sidebar';
import type {Timecode} from './types';
import VideoPlayer from './VideoPlayer';
import {AppProvider, useAppContext} from './context';

const chartModes = Object.keys(modes.Chart.subModes!);

function AppContent() {
  const {
    vidUrl, setVidUrl,
    setVideoDuration,
    file, setFile,
    mediaType, setMediaType,
    setTimecodeList,
    setTextResponse,
    setActiveMode,
    setIsLoading,
    showSidebar, setShowSidebar,
    isLoadingVideo, setIsLoadingVideo,
    setVideoError,
    setUploadProgress,
    setUploadStatus,
    setApiError,
    isCustomMode, isChartMode, isCustomChartMode,
    selectedMode, chartMode, chartPrompt, customPrompt,
    setChartLabel,
    activeMode
  } = useAppContext();

  // Helper getters for mode state
  const isCustomModeBool = selectedMode === 'Custom';
  const isChartModeBool = selectedMode === 'Chart';
  const isCustomChartModeBool = isChartModeBool && chartMode === 'Custom';
  
  const [theme] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  );
  
  const scrollRef = useRef<HTMLElement>(null);
  const latestRequestRef = useRef(0);
  const vidUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (vidUrlRef.current) {
        URL.revokeObjectURL(vidUrlRef.current);
      }
    };
  }, []);

  const setTimecodes = (timecodes: Timecode[]) => {
    const sanitized = timecodes.map((t) =>
      'text' in t ? {...t, text: t.text.replace(/\\'/g, "'")} : t,
    );
    setTimecodeList(sanitized as Timecode[]);
  };

  const onModeSelect = async (mode: string) => {
    if (!file) {
      setApiError('Please upload a video or audio file first.');
      return;
    }

    const requestId = Date.now();
    latestRequestRef.current = requestId;

    setActiveMode(mode);
    setIsLoading(true);
    setTimecodeList(null);
    setTextResponse(null);
    setApiError(null);
    setChartLabel(
      isChartModeBool
        ? isCustomChartModeBool
          ? chartPrompt
          : chartMode
        : '',
    );

    try {
      const promptConfig = modes[mode].prompt;
      const prompt =
        isCustomModeBool && typeof promptConfig === 'function'
          ? promptConfig(customPrompt)
          : isChartModeBool && typeof promptConfig === 'function'
          ? promptConfig(
              isCustomChartModeBool
                ? chartPrompt
                : modes[mode].subModes![chartMode],
            )
          : (promptConfig as string);

      let resp;
      const maxRetries = 3;
      for (let i = 0; i < maxRetries; i++) {
        if (latestRequestRef.current !== requestId) return;

        resp = await generateContent(prompt, file);

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
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      if (latestRequestRef.current !== requestId) return;

      const call = resp.functionCalls?.[0];

      if (call?.name && call.args) {
        if (call.name.startsWith('set_timecodes')) {
          setTimecodes(call.args.timecodes as Timecode[]);
        }
      } else if (resp.text) {
        setTextResponse(resp.text);
      } else {
        const finishReason = resp.candidates?.[0]?.finishReason;
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
      if (latestRequestRef.current === requestId) {
        console.error(e);
        setApiError(e instanceof Error ? e.message : 'An unknown error occurred.');
      }
    } finally {
      if (latestRequestRef.current === requestId) {
        setIsLoading(false);
      }
      scrollRef.current?.scrollTo({top: 0});
    }
  };

  const handleCancel = () => {
    latestRequestRef.current = Date.now();
    setIsLoading(false);
    setApiError(null);
  };

  const handleFileUpload = async (fileToUpload: File | null | undefined) => {
    if (!fileToUpload) return;

    const isVideo = fileToUpload.type.startsWith('video/');
    const isAudio = fileToUpload.type.startsWith('audio/');

    if (!isVideo && !isAudio) {
      setVideoError('Invalid file type. Please upload a video or audio file.');
      return;
    }

    setIsLoadingVideo(true);
    setVideoError(null);
    setFile(null);
    setTimecodeList(null);
    setTextResponse(null);
    setApiError(null);
    setUploadProgress(0);
    setVideoDuration(0);
    setMediaType(isVideo ? 'video' : 'audio');

    if (vidUrlRef.current) {
      URL.revokeObjectURL(vidUrlRef.current);
    }
    const newUrl = URL.createObjectURL(fileToUpload);
    vidUrlRef.current = newUrl;
    setVidUrl(newUrl);

    try {
      const res = await uploadFile(
        fileToUpload,
        setUploadProgress,
        setUploadStatus,
      );
      setFile(res);
    } catch (e) {
      console.error(e);
      setVideoError(e instanceof Error ? e.message : 'Error processing file.');
    } finally {
      setIsLoadingVideo(false);
      setUploadProgress(0);
    }
  };

  const uploadMedia = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files?.[0]);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files?.[0]);
  };

  return (
    <main
      className={theme}
      onDrop={uploadMedia}
      onDragOver={(e) => e.preventDefault()}>
      <div className="contentWrapper">
        <section className="top">
          {vidUrl && !isLoadingVideo && (
            <>
              <Sidebar
                onModeSelect={onModeSelect}
                isCustomMode={isCustomModeBool}
                isChartMode={isChartModeBool}
                isCustomChartMode={isCustomChartModeBool}
                chartModes={chartModes}
              />
              <button
                className="collapseButton"
                onClick={() => setShowSidebar(!showSidebar)}
                aria-label={showSidebar ? 'Collapse sidebar' : 'Expand sidebar'}>
                <span className="icon">
                  {showSidebar ? 'chevron_left' : 'chevron_right'}
                </span>
              </button>
            </>
          )}

          <VideoPlayer
            onFileChange={handleFileChange}
          />
        </section>

        <OutputPanel
          handleCancel={handleCancel}
          scrollRef={scrollRef}
          hasFile={!!vidUrl}
        />
      </div>
    </main>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
