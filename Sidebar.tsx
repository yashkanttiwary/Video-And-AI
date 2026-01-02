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
import {useCallback, useEffect, useRef, useState} from 'react';
import modes from './modes';
import {useAppContext} from './context';

interface SidebarProps {
  onModeSelect: (mode: string) => void;
  isCustomMode: boolean;
  isChartMode: boolean;
  isCustomChartMode: boolean;
  chartModes: string[];
}

export default function Sidebar({
  onModeSelect,
  isCustomMode,
  isChartMode,
  isCustomChartMode,
  chartModes,
}: SidebarProps) {
  const {
    showSidebar,
    mediaType,
    selectedMode,
    setSelectedMode,
    isLoading,
    customPrompt,
    setCustomPrompt,
    chartMode,
    setChartMode,
    chartPrompt,
    setChartPrompt,
    setIsApiKeyModalOpen,
    userApiKey
  } = useAppContext();

  const [width, setWidth] = useState(250);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const startResizing = useCallback(() => setIsResizing(true), []);
  const stopResizing = useCallback(() => setIsResizing(false), []);

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing && sidebarRef.current) {
        const newWidth =
          mouseMoveEvent.clientX -
          sidebarRef.current.getBoundingClientRect().left;
        setWidth(Math.max(200, Math.min(newWidth, 600)));
      }
    },
    [isResizing],
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  const hasSubMode = isCustomMode || isChartMode;

  const renderContent = () => {
    if (hasSubMode) {
      if (isCustomMode) {
        return (
          <>
            <h2>Custom prompt:</h2>
            <textarea
              aria-label="Custom prompt for video analysis"
              placeholder="Type a custom prompt..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onModeSelect(selectedMode);
                }
              }}
              rows={5}
            />
          </>
        );
      } else {
        return (
          <>
            <h2>Chart this video by:</h2>
            <div className="modeList">
              {chartModes.map((mode) => (
                <button
                  key={mode}
                  className={c('button', {
                    active: mode === chartMode,
                  })}
                  onClick={() => setChartMode(mode)}>
                  {mode}
                </button>
              ))}
            </div>
            <textarea
              aria-label="Custom chart prompt"
              className={c({active: isCustomChartMode})}
              placeholder="Or type a custom prompt..."
              value={chartPrompt}
              onChange={(e) => setChartPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onModeSelect(selectedMode);
                }
              }}
              onFocus={() => setChartMode('Custom')}
              rows={2}
            />
          </>
        );
      }
    } else {
      return (
        <>
          <h2>Explore this {mediaType} via:</h2>
          <div className="modeList">
            {Object.entries(modes).map(([mode, {emoji, description}]) => (
              <button
                key={mode}
                className={c('button', {
                  active: mode === selectedMode,
                })}
                onClick={() => setSelectedMode(mode)}
                disabled={mediaType === 'audio' && mode === 'Table'}>
                <span className="emoji">{emoji}</span> {mode}
                <span className="tooltip">{description}</span>
              </button>
            ))}
          </div>
        </>
      );
    }
  };

  return (
    <div
      ref={sidebarRef}
      className={c('modeSelector', {hide: !showSidebar, resizing: isResizing})}
      style={{width: showSidebar ? width : 0}}>
      
      <div className="sidebarContent">
        <div className="sidebarHeader">
           <button 
             className={c("apiKeyButton", { hasKey: !!userApiKey })} 
             onClick={() => setIsApiKeyModalOpen(true)}
             title="Set Gemini API Key"
           >
             <span className="icon">key</span>
             {userApiKey ? "API Key Set" : "Set API Key"}
           </button>
        </div>
        {renderContent()}
      </div>

      <div className={c('sidebarFooter', {backButton: hasSubMode})}>
        {hasSubMode && (
          <button className="navBack" onClick={() => setSelectedMode(Object.keys(modes)[0])}>
            <span className="icon">chevron_left</span>
            Back
          </button>
        )}
        <button
          className="button generateButton"
          onClick={() => onModeSelect(selectedMode)}
          disabled={
            isLoading ||
            (isCustomMode && !customPrompt.trim()) ||
            (isChartMode && isCustomChartMode && !chartPrompt.trim())
          }>
          ▶️ Generate
        </button>
      </div>
      
      <div className="resizer" onMouseDown={startResizing} />
    </div>
  );
}