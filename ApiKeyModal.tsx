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

import { useEffect, useState, KeyboardEvent } from 'react';
import { useAppContext } from './context';

export default function ApiKeyModal() {
  const { isApiKeyModalOpen, setIsApiKeyModalOpen, userApiKey, setUserApiKey } = useAppContext();
  const [key, setKey] = useState(userApiKey);

  useEffect(() => {
    setKey(userApiKey);
  }, [userApiKey, isApiKeyModalOpen]);

  if (!isApiKeyModalOpen) return null;

  const handleSave = () => {
    setUserApiKey(key.trim());
    setIsApiKeyModalOpen(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsApiKeyModalOpen(false);
    }
  };

  return (
    <div className="modalOverlay" onClick={() => setIsApiKeyModalOpen(false)}>
      <div className="modalContent" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <h3><span className="icon">key</span> Set API Key</h3>
          <button className="closeButton" onClick={() => setIsApiKeyModalOpen(false)}>
            <span className="icon">close</span>
          </button>
        </div>
        
        <div className="modalBody">
          <p>Enter your Google Gemini API Key. It will be stored securely in your browser's local storage.</p>
          
          <div className="inputGroup">
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="AIzaSy..."
              autoFocus
            />
          </div>

          <p className="helperText">
            Don't have a key? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">Get one from Google AI Studio</a>.
          </p>
        </div>

        <div className="modalFooter">
          <button className="button secondary" onClick={() => setIsApiKeyModalOpen(false)}>
            Cancel
          </button>
          <button className="button primary" onClick={handleSave}>
            Save Key
          </button>
        </div>
      </div>
    </div>
  );
}
