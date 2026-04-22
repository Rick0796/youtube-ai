import ytdl from 'ytdl-core';

async function test() {
  try {
    const info = await ytdl.getInfo('BtlWoqWLm9Q');
    console.log("Success! Title:", info.videoDetails.title);
  } catch (e) {
    console.error("Failed:", e.message);
  }
}

test();
