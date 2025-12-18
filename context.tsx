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

import {createContext, useContext, useState, ReactNode, Dispatch, SetStateAction} from 'react';
import type {UploadedFile} from './api';
import type {Timecode} from './types';
import modes from './modes';

interface AppContextType {
  vidUrl: string | null;
  setVidUrl: Dispatch<SetStateAction<string | null>>;
  videoDuration: number;
  setVideoDuration: Dispatch<SetStateAction<number>>;
  file: UploadedFile | null;
  setFile: Dispatch<SetStateAction<UploadedFile | null>>;
  mediaType: 'video' | 'audio' | null;
  setMediaType: Dispatch<SetStateAction<'video' | 'audio' | null>>;
  timecodeList: Timecode[] | null;
  setTimecodeList: Dispatch<SetStateAction<Timecode[] | null>>;
  textResponse: string | null;
  setTextResponse: Dispatch<SetStateAction<string | null>>;
  requestedTimecode: number | null;
  setRequestedTimecode: Dispatch<SetStateAction<number | null>>;
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
  activeSegmentIndex: number;
  setActiveSegmentIndex: Dispatch<SetStateAction<number>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({children}: {children?: ReactNode}) {
  const [vidUrl, setVidUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [mediaType, setMediaType] = useState<'video' | 'audio' | null>(null);
  const [timecodeList, setTimecodeList] = useState<Timecode[] | null>(null);
  const [textResponse, setTextResponse] = useState<string | null>(null);
  const [requestedTimecode, setRequestedTimecode] = useState<number | null>(null);
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
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(-1);

  return (
    <AppContext.Provider
      value={{
        vidUrl, setVidUrl,
        videoDuration, setVideoDuration,
        file, setFile,
        mediaType, setMediaType,
        timecodeList, setTimecodeList,
        textResponse, setTextResponse,
        requestedTimecode, setRequestedTimecode,
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
        activeSegmentIndex, setActiveSegmentIndex
      }}>
      {children}
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