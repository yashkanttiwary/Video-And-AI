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

import { useState, KeyboardEvent } from 'react';
import { useAppContext } from './context';
import c from 'classnames';

export default function LoginPage() {
  const { setUser } = useAppContext();
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!name.trim() || !key.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setUser({ name: name.trim(), apiKey: key.trim() });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="loginPage">
      <div className="loginCard">
        <div className="loginHeader">
          <span className="icon">smart_display</span>
          <h1>Video Analyzer</h1>
        </div>
        
        <p className="loginDescription">
          Unlock AI-powered video analysis. Enter your details to get started.
        </p>

        <div className="inputGroup">
           <label>Your Name</label>
           <input 
             value={name} 
             onChange={e => setName(e.target.value)} 
             placeholder="Enter your name"
             onKeyDown={handleKeyDown}
           />
        </div>
        
        <div className="inputGroup">
           <label>Gemini API Key</label>
           <input 
             type="password" 
             value={key} 
             onChange={e => setKey(e.target.value)} 
             placeholder="Enter API Key"
             onKeyDown={handleKeyDown}
           />
           <p className="helper">
             Don't have a key? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">Get one here</a>
           </p>
        </div>
        
        {error && <div className="errorBanner">{error}</div>}
        
        <button className="loginButton" onClick={handleLogin}>
          START SYSTEM <span className="icon">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}