import "dotenv/config";
import { describe, expect, test } from "@jest/globals";
import { convertAudioToText } from "../convert-audio-to-text";
import { File } from "buffer";
import fs from "fs";

describe("file created succesfully", () => {
  test("convert hello world to audio", async () => {
    // get hello world.mp3 as a File object

    const testFilePath = "src/tests/hello world.mp3";

    const fileContents = fs.readFileSync(testFilePath);

    const file = new File([fileContents], "hello world.mp3");

    const openAIKey = process.env.OPENAI_API_KEY as string;

    const text = await convertAudioToText(file, openAIKey);

    expect(text.toLowerCase()).toBe("hello world.");
  });
});
