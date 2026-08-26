async function run() {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=hello+world`;
  const response = await fetch(url);
  console.log(response.status, response.statusText);
  const text = await response.text();
  console.log(text);
}
run();
