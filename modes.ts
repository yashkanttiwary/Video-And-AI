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

interface Mode {
  emoji: string;
  description: string;
  prompt: string | ((input: string) => string);
  isList?: boolean;
  subModes?: Record<string, string>;
}

const modes: Record<string, Mode> = {
  'A/V captions': {
    emoji: '👀',
    description:
      'Generate detailed, time-stamped captions for every scene, including dialogue and visual descriptions.',
    prompt: `You are an expert video analyst. Your task is to generate precise, structured captions for the provided video.

**CRITICAL INSTRUCTIONS:**
1.  **FULL DURATION:** You MUST analyze the video from 00:00:00 to the very last second. Do not stop in the middle.
2.  **GRANULARITY:** Break the video down into short segments (every 5-10 seconds or every scene change).
3.  **CONTENT:** For each segment, provide a concise description of the visuals AND transcribe any spoken dialogue verbatim.
4.  **FUNCTION CALL:** Call the 'set_timecodes' function **only once** with a single array containing all the generated timecode objects.

**Example:**
[
  { "time": "00:00:02", "text": "A shot of a sunlit kitchen counter." },
  { "time": "00:00:06", "text": "Dialogue: 'Is everything ready?'" }
]`,
    isList: true,
  },

  'Simple Captions': {
    emoji: '💬',
    description:
      'Get a simple, time-stamped transcript of all spoken dialogue in the original language.',
    prompt: `You are a transcription specialist. Your task is to accurately transcribe all spoken dialogue.

**CRITICAL INSTRUCTIONS:**
1.  **FULL DURATION:** You MUST transcribe the video from start to finish.
2.  **FORMAT:** If the video is long, summarize blocks of dialogue into single timestamp entries to ensure the entire video is covered within the output limit.
3.  **FUNCTION CALL:** Call the 'set_timecodes' function **only once**.`,
    isList: true,
  },

  Paragraph: {
    emoji: '📝',
    description:
      'Summarize the entire content into a single, concise paragraph.',
    prompt: `Generate a paragraph that summarizes this ENTIRE video. Keep it to 3 to 5 \
sentences. Ensure you cover the beginning, middle, and end. Place each sentence of the summary into an object sent to \
set_timecodes with the timecode of the sentence in the video.`,
  },

  'Key moments': {
    emoji: '🔑',
    description:
      'Identify and list the most important moments as a bulleted list.',
    prompt: `Generate bullet points for the video covering the ENTIRE duration. Place each bullet point into an \
object sent to set_timecodes with the timecode of the bullet point in the video.`,
    isList: true,
  },

  'Proofread & QA': {
    emoji: '🧐',
    description:
      'Analyze video for spelling errors, factual mismatches, and engagement quality.',
    prompt: `You are an Expert Video Quality Assurance Specialist.

**ANALYSIS TASKS:**
1. **TEXT & VISUAL VERIFICATION:** Scan every frame for spelling errors.
2. **FACTUAL SYNC:** Compare audio against visual elements.
3. **ENGAGEMENT:** Analyze the Hook, Middle, and End.

**CRITICAL INSTRUCTIONS:**
Call the 'set_timecodes' function **only once** with a single array containing your findings.
You MUST process the entire video file.`,
    isList: true,
  },

  'AI Cut': {
    emoji: '✂️',
    description:
      'Analyzes your media for filler words, awkward pauses, and repetition.',
    prompt: `You are an expert video editor's assistant. Analyze the ENTIRE video file.

**CRITICAL INSTRUCTIONS:**
1.  **IDENTIFY IMPERFECTIONS:** Look for filler words, long pauses, and repetition throughout the whole video.
2.  **PROVIDE SUGGESTIONS:** For each issue, provide a timestamp and suggested edit.
3.  **FUNCTION CALL:** Call 'set_timecodes' only once with all suggestions.`,
    isList: true,
  },

  'B-Roll Ideas': {
    emoji: '🎬',
    description:
      'Get a creative partner that analyzes your content and suggests relevant B-roll shots.',
    prompt: `You are a creative video director. Analyze the ENTIRE video and suggest B-roll.

**CRITICAL INSTRUCTIONS:**
1.  **CONTEXTUAL RELEVANCE:** Base suggestions on dialogue and visuals.
2.  **FORMAT:** Provide concrete visual ideas with timestamps.
3.  **FUNCTION CALL:** Call 'set_timecodes' only once.`,
    isList: true,
  },

  'Sound Cues': {
    emoji: '🎵',
    description:
      'Get time-stamped suggestions for where to add music or sound effects.',
    prompt: `You are an expert sound designer. Analyze the ENTIRE video.

**CRITICAL INSTRUCTIONS:**
1.  **IDENTIFY KEY MOMENTS:** Listen for emotional shifts or transitions.
2.  **SUGGEST CUES:** Suggest music or sound effects with timestamps.
3.  **FUNCTION CALL:** Call 'set_timecodes' only once.`,
    isList: true,
  },
  Table: {
    emoji: '🗓️',
    description:
      'List all objects detected in the video, with timestamps and descriptions.',
    prompt: `You are an expert video analyst. Identify significant objects throughout the ENTIRE video.

**CRITICAL INSTRUCTIONS:**
1.  **IDENTIFY OBJECTS:** List prominent objects at various points.
2.  **CONTEXT:** Describe the scene.
3.  **FUNCTION CALL:** Call 'set_timecodes_with_objects' only once.`,
  },
  Chart: {
    emoji: '📈',
    description:
      'Plot a specific metric over time on a chart.',
    prompt: (input: string) =>
      `You are an expert data analyst. Analyze the ENTIRE video and extract numeric data for the metric: "${input}". Sample the video at regular intervals from start to finish and call 'set_timecodes_with_numeric_values'.`,
    subModes: {
      Sentiment:
        'Overall emotional sentiment of the dialogue/scene (-1 to 1).',
      'Energy level':
        'The energy level or intensity of action in the scene (1 to 10).',
      'Number of faces': 'The number of human faces visible in the frame.',
      Custom: '',
    },
  },
  Custom: {
    emoji: '✨',
    description:
      'Write your own prompt to analyze the video in any way you want.',
    prompt: (input: string) => `You are a helpful AI assistant. Analyze the ENTIRE video based on this instruction: "${input}". Respond by calling the most appropriate function ('set_timecodes', etc).`,
  },
};

export default modes;
