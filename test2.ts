import express from "express";
import { YoutubeTranscript } from "youtube-transcript";

async function testFetch() {
  try {
     console.log("Start");
     await YoutubeTranscript.fetchTranscript("BtlWoqWLm9Q");
     console.log("Success");
  } catch (e: any) {
    console.log("CAUGHT MESSAGE:", e.message);
  }
}
testFetch();
