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

**Instructions:**
1.  **Break the video down into short, time-stamped segments.** A new segment should begin every **5-10 seconds**, or whenever a significant visual change or new line of dialogue occurs.
2.  For each segment, identify the exact start timecode (in HH:MM:SS format).
3.  For each segment, write a concise description of the visuals and transcribe any spoken dialogue verbatim.
4.  Combine the description and dialogue into a single 'text' string for each timecode.
5.  Call the 'set_timecodes' function **once** with a single array containing all the generated timecode objects.

**Example of the expected output array:**
[
  { time: "00:00:02", text: "A car drives down a sunny suburban street." },
  { time: "00:00:07", text: "The car pulls into a driveway. Dialogue: \\"We're home.\\"" },
  { time: "00:00:11", text: "A person gets out of the car and walks towards the house." }
]`,
    isList: true,
  },

  'Simple Captions': {
    emoji: '💬',
    description:
      'Get a simple, time-stamped transcript of all spoken dialogue in the original language.',
    prompt: `You are a transcription specialist. Your task is to accurately transcribe all spoken dialogue from the provided media file.

**Instructions:**
1.  **Break the transcription into short, easy-to-read lines.** A new caption line should be created for every sentence or natural pause in speech. Do not group multiple sentences into one timestamp.
2.  Identify the start timecode (in HH:MM:SS format) for each line.
3.  Transcribe the speech verbatim. Do not translate or add descriptions.
4.  If speech is unclear, use "[inaudible]".
5.  Call the 'set_timecodes' function **once** with a single array of all the transcription objects.

**Example of the expected output array:**
[
  { time: "00:02:10", text: "This is the first sentence that was spoken." },
  { time: "00:02:13", text: "And this is the very next one." },
  { time: "00:02:16", text: "It's important to keep them separate." }
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
