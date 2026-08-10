const assert = require("node:assert/strict");
const http = require("node:http");
const { after, before, test } = require("node:test");

const { getText } = require("./http-get");

let baseUrl;
let server;

before(async () => {
  server = http.createServer((request, response) => {
    if (request.url === "/redirect") {
      response.writeHead(302, { location: "/payload" });
      response.end();
      return;
    }
    if (request.url === "/payload") {
      response.writeHead(200, { "content-type": "text/plain" });
      response.end("protobuf-source");
      return;
    }
    response.writeHead(503);
    response.end();
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise(resolve => server.close(resolve));
});

test("downloads text and follows redirects", async () => {
  assert.equal(await getText(`${baseUrl}/redirect`), "protobuf-source");
});

test("rejects non-successful responses", async () => {
  await assert.rejects(getText(`${baseUrl}/failure`), /HTTP 503/);
});
