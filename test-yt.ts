import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const yt = require('youtube-transcript');
const { YoutubeTranscript } = yt.default || yt;

YoutubeTranscript.fetchTranscript('BtlWoqWLm9Q')
  .then(console.log)
  .catch(e => {
    console.log("Error object:", e);
    console.log("Type:", typeof e);
    console.log("Message:", e.message);
  });
