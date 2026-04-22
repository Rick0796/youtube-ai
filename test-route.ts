async function test2() {
  try {
    const res = await fetch("http://localhost:3000/api/test-route");
    console.log(await res.text());
  } catch(e) {
    console.error(e.message);
  }
}
test2();
