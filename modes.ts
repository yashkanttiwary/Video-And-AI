/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// Copyright 2024 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may not use this file except in compliance with the License.
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
1.  **GRANULARITY REQUIREMENT:** You MUST break the video down into very short, time-stamped segments. A new caption entry MUST be created every 5-10 seconds, WITHOUT FAIL. Also create a new entry for any significant visual change or new line of dialogue, even if it is less than 5 seconds. DO NOT group long periods of time into a single entry. This is a strict requirement.
2.  **CONTENT:** For each segment, provide a concise description of the visuals AND transcribe any spoken dialogue verbatim.
3.  **FUNCTION CALL:** Call the 'set_timecodes' function **only once** with a single array containing all the generated timecode objects.

**Example of the required granular output:**
[
  { "time": "00:00:02", "text": "A shot of a sunlit kitchen counter." },
  { "time": "00:00:06", "text": "A person's hands are chopping vegetables." },
  { "time": "00:00:10", "text": "Dialogue: 'Is everything ready for dinner?'" },
  { "time": "00:00:14", "text": "Another person walks into the frame. Dialogue: 'Almost!'" }
]`,
    isList: true,
  },

  'Simple Captions': {
    emoji: '💬',
    description:
      'Get a simple, time-stamped transcript of all spoken dialogue in the original language.',
    prompt: `You are a transcription specialist. Your task is to accurately transcribe all spoken dialogue from the provided media file.

**CRITICAL INSTRUCTIONS:**
1.  **GRANULARITY REQUIREMENT:** You MUST break the transcription into short, easy-to-read lines. A new caption MUST be created for each individual sentence. If a sentence is long, you MUST break it at a natural pause (like a comma or a breath). DO NOT group multiple sentences under a single timestamp. This is a strict requirement.
2.  **ACCURACY:** Transcribe the speech verbatim. Do not add descriptions. If speech is unclear, use "[inaudible]".
3.  **FUNCTION CALL:** Call the 'set_timecodes' function **only once** with a single array of all the transcription objects.

**Example of the required granular output:**
[
  { "time": "00:02:10", "text": "This is the first sentence that was spoken." },
  { "time": "00:02:13", "text": "And this is the very next one," },
  { "time": "00:02:15", "text": "even if it's part of the same thought." },
  { "time": "00:02:18", "text": "It's important to keep them separate." }
]`,
    isList: true,
  },

  Paragraph: {
    emoji: '📝',
    description:
      'Summarize the entire content into a single, concise paragraph.',
    prompt: `Generate a paragraph that summarizes this video. Keep it to 3 to 5 \
sentences. Place each sentence of the summary into an object sent to \
set_timecodes with the timecode of the sentence in the video.`,
  },

  'Key moments': {
    emoji: '🔑',
    description:
      'Identify and list the most important moments as a bulleted list.',
    prompt: `Generate bullet points for the video. Place each bullet point into an \
object sent to set_timecodes with the timecode of the bullet point in the video.`,
    isList: true,
  },

  Table: {
    emoji: '🤓',
    description:
      'Extract key scenes and list the objects found within them in a table format.',
    prompt: `Choose 5 key shots from this video and call set_timecodes_with_objects \
with the timecode, text description of 10 words or less, and a list of objects \
visible in the scene (with representative emojis).`,
  },

  Haiku: {
    emoji: '🌸',
    description:
      'Generate a 5-7-5 syllable haiku that captures the essence of the content.',
    prompt: `Generate a haiku for the video. Place each line of the haiku into an \
object sent to set_timecodes with the timecode of the line in the video. Make sure \
to follow the syllable count rules (5-7-5).`,
  },

  Chart: {
    emoji: '📈',
    description:
      'Analyze and plot a specific metric over the duration of the video.',
    prompt: (input: string) =>
      `Generate chart data for this video based on the following instructions: \
${input}. Call set_timecodes_with_numeric_values once with the list of data values and timecodes.`,
    subModes: {
      Excitement:
        'for each scene, estimate the level of excitement on a scale of 1 to 10',
      Importance:
        'for each scene, estimate the level of overall importance to the video on a scale of 1 to 10',
      'Number of people': 'for each scene, count the number of people visible',
    },
  },

  Custom: {
    emoji: '🔧',
    description:
      'Provide your own prompt to analyze the video in any way you want.',
    prompt: (input: string) =>
      `Call set_timecodes once using the following instructions: ${input}`,
    isList: true,
  },
};

export default modes;