const fs = require('fs');

try {
  require('@langchain/community/llms/ollama');
  fs.writeFileSync('test_require.txt', 'ollama OK\n');
} catch (e) {
  fs.appendFileSync('test_require.txt', 'ollama Error: ' + e.message + '\n');
}

try {
  require('faiss-node');
  fs.appendFileSync('test_require.txt', 'faiss-node OK\n');
} catch (e) {
  fs.appendFileSync('test_require.txt', 'faiss-node Error: ' + e.message + '\n');
}

try {
  require('langchain/text_splitter');
  fs.appendFileSync('test_require.txt', 'text_splitter OK\n');
} catch (e) {
  fs.appendFileSync('test_require.txt', 'text_splitter Error: ' + e.message + '\n');
}
