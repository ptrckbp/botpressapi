import OpenAI from "openai";
import { File } from "buffer";

const convertTextToAudio = async (
  text: string,
  voice: OpenAI.Audio.SpeechCreateParams["voice"],
  openaiKey: string
) => {

  const openai = new OpenAI({
    apiKey: openaiKey,
  });

  

  const result = await openai.audio.speech.create({
    model: "tts-1",
    voice: voice ?? "onyx",
    input: text,
  });

  const buffer = Buffer.from(await result.arrayBuffer());

  const file = new File([buffer], "audio.mp3", {
    type: "audio/mp3",
  });

  return file;
};

export default convertTextToAudio;
