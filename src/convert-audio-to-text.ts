import { File } from "buffer";
import { OpenAI } from "openai";

const convertAudioToText = async (audioFile: File, openaiKey: string) => {
  const openai = new OpenAI({
    apiKey: openaiKey,
  });

  const transcription = await openai.audio.transcriptions.create({
    file: audioFile,
    model: "whisper-1",
  });

  return transcription.text;
};

export { convertAudioToText };
