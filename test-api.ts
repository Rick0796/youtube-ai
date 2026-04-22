async function test() {
  const res = await fetch("http://localhost:3000/api/youtube/data?url=https://www.youtube.com/watch?v=BtlWoqWLm9Q");
  const data = await res.text();
  console.log("Status:", res.status);
  console.log("Data:", data);
}
test();
