const http = require('http');
http.get('http://localhost:4000/api/llm/summarize', (res) => {
  console.log('Status Code:', res.statusCode);
}).on('error', (e) => {
  console.error(e);
});
