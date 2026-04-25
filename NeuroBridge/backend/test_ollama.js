const { Ollama } = require('@langchain/community/llms/ollama');

async function test() {
  try {
    const llm = new Ollama({ model: "llama3", temperature: 0.7 });
    console.log(typeof llm.invoke);
    console.log(typeof llm.call);
    console.log(typeof llm.predict);
  } catch(e) {
    console.error(e);
  }
}
test();
