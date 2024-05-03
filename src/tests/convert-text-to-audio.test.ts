import "dotenv/config";
import { describe, expect, test } from "@jest/globals";
import convertTextToAudio from "../convert-text-to-audio";
import { File } from "buffer";

describe("convertTextToAudio returns file", () => {
  test("convert hello world to audio", async () => {
    const openAIKey = process.env.OPENAI_API_KEY as string;

    const file = await convertTextToAudio("hello world", "onyx", openAIKey);

    // expect it to be a file object
    expect(file).toBeInstanceOf(File);
  });
});
