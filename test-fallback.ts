async function test() {
  const res = await fetch("http://localhost:3000/api/youtube/data?url=https://www.youtube.com/watch?v=BtlWoqWLm9Q");
  console.log(res.status);
  console.log(await res.text());
}
test();
