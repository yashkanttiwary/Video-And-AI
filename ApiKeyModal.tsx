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

import { useState, useEffect } from 'react';
import { useAppContext } from './context';

export default function ApiKeyModal() {
  const { user, setUser, showSettings, setShowSettings } = useAppContext();
  const [name, setName] = useState('');
  const [key, setKey] = useState('');

  useEffect(() => {
    if (showSettings && user) {
      setName(user.name);
      setKey(user.apiKey);
    }
  }, [showSettings, user]);

  if (!showSettings) return null;

  const handleSave = () => {
    if (name.trim() && key.trim()) {
      setUser({ ...user!, name: name.trim(), apiKey: key.trim() });
      setShowSettings(false);
    }
  };

  return (
    <div className="modalOverlay" onClick={() => setShowSettings(false)}>
      <div className="modalContent" onClick={e => e.stopPropagation()}>
        <div className="modalHeader">
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
             <span className="icon">manage_accounts</span>
             <h2>Settings</h2>
          </div>
          <button className="iconButton" onClick={() => setShowSettings(false)}>
            <span className="icon">close</span>
          </button>
        </div>

        <div className="inputGroup">
           <label>Display Name</label>
           <input
             value={name}
             onChange={e => setName(e.target.value)}
             placeholder="Your Name"
           />
        </div>

        <div className="inputGroup">
           <label>Gemini API Key</label>
           <input
             type="password"
             value={key}
             onChange={e => setKey(e.target.value)}
             placeholder="API Key"
           />
        </div>

        <div className="modalActions">
          <button className="modalButton secondary" onClick={() => setShowSettings(false)}>
            Cancel
          </button>
          <button className="modalButton primary" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}