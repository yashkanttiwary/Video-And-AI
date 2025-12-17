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
import {KeyboardEvent, RefObject, useEffect, useRef} from 'react';
import ActionToolbar from './ActionToolbar';
import Chart from './Chart';
import modes from './modes';
import type {
  Timecode,
  ObjectTimecode,
  ValueTimecode,
  TextTimecode,
} from './types';
import {timeToSecs} from './utils';
import {useAppContext} from './context';

interface OutputPanelProps {
  handleCancel: () => void;
  scrollRef: RefObject<HTMLElement>;
  hasFile: boolean;
}

export default function OutputPanel({
  handleCancel,
  scrollRef,
  hasFile,
}: OutputPanelProps) {
  const {
    activeMode,
    isLoading,
    apiError,
    textResponse,
    timecodeList,
    chartLabel,
    setRequestedTimecode,
    videoDuration,
    activeSegmentIndex
  } = useAppContext();

  const activeItemRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (activeSegmentIndex !== -1 && activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeSegmentIndex]);

  const handleKeydown = (e: KeyboardEvent, callback: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  };

  const textBasedTimecodes =
    timecodeList?.filter((item): item is TextTimecode => 'text' in item) || [];

  const showActionToolbar =
    textBasedTimecodes.length > 0 &&
    activeMode !== 'Table' &&
    activeMode !== 'Chart';

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="loading">
          <div className="spinner" />
          Waiting for model...
          <button onClick={handleCancel} className="cancelButton">
            Cancel
          </button>
        </div>
      );
    }
    if (apiError) {
      return <div className="apiError">{apiError}</div>;
    }
    if (textResponse) {
      return <div className="textResponse">{textResponse}</div>;
    }
    if (timecodeList) {
      if (activeMode === 'Table') {
        return (
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Description</th>
                <th>Objects</th>
              </tr>
            </thead>
            <tbody>
              {timecodeList.map((item, i) => {
                const {time, text, objects} = item as ObjectTimecode;
                const isActive = i === activeSegmentIndex;
                return (
                  <tr
                    key={i}
                    ref={isActive ? (el) => (activeItemRef.current = el) : null}
                    className={c({activeRow: isActive})}
                    role="button"
                    tabIndex={0}
                    onClick={() => setRequestedTimecode(timeToSecs(time))}
                    onKeyDown={(e) =>
                      handleKeydown(e, () =>
                        setRequestedTimecode(timeToSecs(time)),
                      )
                    }>
                    <td>
                      <time>{time}</time>
                    </td>
                    <td>{text}</td>
                    <td>{objects.join(', ')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
      }
      if (activeMode === 'Chart') {
        return (
          <Chart
            data={timecodeList as ValueTimecode[]}
            yLabel={chartLabel}
            jumpToTimecode={setRequestedTimecode}
          />
        );
      }
      if (activeMode && modes[activeMode]?.isList) {
        return (
          <ul>
            {textBasedTimecodes.map(({time, text}, i) => {
               const isActive = i === activeSegmentIndex;
               return (
                <li key={i} className="outputItem">
                  <button 
                    ref={isActive ? (el) => (activeItemRef.current = el) : null}
                    className={c({activeItem: isActive})}
                    onClick={() => setRequestedTimecode(timeToSecs(time))}>
                    <time>{time}</time>
                    <p className="text">{text}</p>
                  </button>
                </li>
              );
            })}
          </ul>
        );
      }
      return textBasedTimecodes.map(({time, text}, i) => {
         const isActive = i === activeSegmentIndex;
         return (
          <button
            key={i}
            ref={isActive ? (el) => (activeItemRef.current = el) : null}
            className={c('sentence', {activeSentence: isActive})}
            onClick={() => setRequestedTimecode(timeToSecs(time))}>
            <time>{time}</time>
            <span>{text}</span>
          </button>
        );
      });
    }
    return null;
  };

  return (
    <div className={c('tools', {inactive: !hasFile})}>
      <section
        className={c('output', {['mode' + activeMode]: activeMode})}
        ref={scrollRef}>
        {showActionToolbar && (
          <ActionToolbar
            timecodes={textBasedTimecodes}
            videoDuration={videoDuration}
            activeMode={activeMode}
          />
        )}
        {renderContent()}
      </section>
    </div>
  );
}
