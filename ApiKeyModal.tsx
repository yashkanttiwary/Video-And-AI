/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
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

  // Fixed: Imported KeyboardEvent from react instead of using React.KeyboardEvent
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