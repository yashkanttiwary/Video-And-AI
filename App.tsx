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
import {uploadFile} from './api';
import modes from './modes';
import OutputPanel from './OutputPanel';
import Sidebar from './Sidebar';
import VideoPlayer from './VideoPlayer';
import {AppProvider, useAppContext, usePlaybackContext} from './context';
import ApiKeyModal from './ApiKeyModal';
import { useAnalysis } from './useAnalysis';

const chartModes = Object.keys(modes.Chart.subModes!);

function AppContent() {
  const {
    vidUrl, setVidUrl,
    setFile,
    setMediaType,
    setTimecodeList,
    setTextResponse,
    showSidebar, setShowSidebar,
    isLoadingVideo, setIsLoadingVideo,
    setVideoError,
    setUploadProgress,
    setUploadStatus,
    setApiError,
    selectedMode, chartMode,
    activeMode,
    userApiKey
  } = useAppContext();

  const { setVideoDuration } = usePlaybackContext();

  const { runAnalysis, cancelAnalysis } = useAnalysis();

  // Helper getters for mode state
  const isCustomModeBool = selectedMode === 'Custom';
  const isChartModeBool = selectedMode === 'Chart';
  const isCustomChartModeBool = isChartModeBool && chartMode === 'Custom';
  
  const [theme] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  );
  
  const scrollRef = useRef<HTMLElement>(null);
  const vidUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (vidUrlRef.current) {
        URL.revokeObjectURL(vidUrlRef.current);
      }
    };
  }, []);

  const onModeSelect = async (mode: string) => {
    await runAnalysis(mode);
    scrollRef.current?.scrollTo({top: 0});
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
        userApiKey
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
      <ApiKeyModal />
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
          handleCancel={cancelAnalysis}
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
