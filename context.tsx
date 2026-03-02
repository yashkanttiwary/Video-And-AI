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

import {createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useMemo, useEffect} from 'react';
import type {UploadedFile} from './api';
import type {Timecode} from './types';
import modes from './modes';

// --- App Data Context (Low Frequency) ---

interface AppContextType {
  vidUrl: string | null;
  setVidUrl: Dispatch<SetStateAction<string | null>>;
  file: UploadedFile | null;
  setFile: Dispatch<SetStateAction<UploadedFile | null>>;
  mediaType: 'video' | 'audio' | null;
  setMediaType: Dispatch<SetStateAction<'video' | 'audio' | null>>;
  timecodeList: Timecode[] | null;
  setTimecodeList: Dispatch<SetStateAction<Timecode[] | null>>;
  textResponse: string | null;
  setTextResponse: Dispatch<SetStateAction<string | null>>;
  selectedMode: string;
  setSelectedMode: Dispatch<SetStateAction<string>>;
  activeMode: string | undefined;
  setActiveMode: Dispatch<SetStateAction<string | undefined>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  showSidebar: boolean;
  setShowSidebar: Dispatch<SetStateAction<boolean>>;
  isLoadingVideo: boolean;
  setIsLoadingVideo: Dispatch<SetStateAction<boolean>>;
  videoError: string | null;
  setVideoError: Dispatch<SetStateAction<string | null>>;
  uploadProgress: number;
  setUploadProgress: Dispatch<SetStateAction<number>>;
  uploadStatus: string;
  setUploadStatus: Dispatch<SetStateAction<string>>;
  apiError: string | null;
  setApiError: Dispatch<SetStateAction<string | null>>;
  customPrompt: string;
  setCustomPrompt: Dispatch<SetStateAction<string>>;
  chartMode: string;
  setChartMode: Dispatch<SetStateAction<string>>;
  chartPrompt: string;
  setChartPrompt: Dispatch<SetStateAction<string>>;
  chartLabel: string;
  setChartLabel: Dispatch<SetStateAction<string>>;
  isApiKeyModalOpen: boolean;
  setIsApiKeyModalOpen: Dispatch<SetStateAction<boolean>>;
  userApiKey: string;
  setUserApiKey: Dispatch<SetStateAction<string>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- Playback Context (High Frequency) ---

interface PlaybackContextType {
  videoDuration: number;
  setVideoDuration: Dispatch<SetStateAction<number>>;
  requestedTimecode: number | null;
  setRequestedTimecode: Dispatch<SetStateAction<number | null>>;
  activeSegmentIndex: number;
  setActiveSegmentIndex: Dispatch<SetStateAction<number>>;
}

const PlaybackContext = createContext<PlaybackContextType | undefined>(undefined);

export function AppProvider({children}: {children?: ReactNode}) {
  // App Data State
  const [vidUrl, setVidUrl] = useState<string | null>(null);
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [mediaType, setMediaType] = useState<'video' | 'audio' | null>(null);
  const [timecodeList, setTimecodeList] = useState<Timecode[] | null>(null);
  const [textResponse, setTextResponse] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<string>(Object.keys(modes)[0]);
  const [activeMode, setActiveMode] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [apiError, setApiError] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [chartMode, setChartMode] = useState<string>('Sentiment');
  const [chartPrompt, setChartPrompt] = useState('');
  const [chartLabel, setChartLabel] = useState('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [userApiKey, setUserApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');

  // Sync API key to local storage
  useEffect(() => {
    if (userApiKey) {
      localStorage.setItem('gemini_api_key', userApiKey);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  }, [userApiKey]);

  // Playback State
  const [videoDuration, setVideoDuration] = useState(0);
  const [requestedTimecode, setRequestedTimecode] = useState<number | null>(null);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(-1);

  // Memoize values to prevent unnecessary re-renders
  const appValue = useMemo(() => ({
    vidUrl, setVidUrl,
    file, setFile,
    mediaType, setMediaType,
    timecodeList, setTimecodeList,
    textResponse, setTextResponse,
    selectedMode, setSelectedMode,
    activeMode, setActiveMode,
    isLoading, setIsLoading,
    showSidebar, setShowSidebar,
    isLoadingVideo, setIsLoadingVideo,
    videoError, setVideoError,
    uploadProgress, setUploadProgress,
    uploadStatus, setUploadStatus,
    apiError, setApiError,
    customPrompt, setCustomPrompt,
    chartMode, setChartMode,
    chartPrompt, setChartPrompt,
    chartLabel, setChartLabel,
    isApiKeyModalOpen, setIsApiKeyModalOpen,
    userApiKey, setUserApiKey,
  }), [
    vidUrl, file, mediaType, timecodeList, textResponse, selectedMode, activeMode,
    isLoading, showSidebar, isLoadingVideo, videoError, uploadProgress, uploadStatus,
    apiError, customPrompt, chartMode, chartPrompt, chartLabel, isApiKeyModalOpen, userApiKey
  ]);

  const playbackValue = useMemo(() => ({
    videoDuration, setVideoDuration,
    requestedTimecode, setRequestedTimecode,
    activeSegmentIndex, setActiveSegmentIndex,
  }), [videoDuration, requestedTimecode, activeSegmentIndex]);

  return (
    <AppContext.Provider value={appValue}>
      <PlaybackContext.Provider value={playbackValue}>
        {children}
      </PlaybackContext.Provider>
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

export function usePlaybackContext() {
  const context = useContext(PlaybackContext);
  if (context === undefined) {
    throw new Error('usePlaybackContext must be used within an AppProvider');
  }
  return context;
}
