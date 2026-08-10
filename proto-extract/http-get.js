const http = require("http");
const https = require("https");

const getText = (url, options = {}, redirectsRemaining = 5) =>
  new Promise((resolve, reject) => {
    const target = new URL(url);
    const transport = target.protocol === "https:" ? https : http;
    const request = transport.get(target, options, response => {
      const { location } = response.headers;
      if (
        response.statusCode >= 300 &&
        response.statusCode < 400 &&
        location
      ) {
        response.resume();
        if (redirectsRemaining === 0) {
          reject(new Error(`Too many redirects while requesting ${url}`));
          return;
        }
        resolve(
          getText(
            new URL(location, target).href,
            options,
            redirectsRemaining - 1
          )
        );
        return;
      }

      if (response.statusCode < 200 || response.statusCode >= 300) {
        response.resume();
        reject(
          new Error(`Request to ${url} failed with HTTP ${response.statusCode}`)
        );
        return;
      }

      response.setEncoding("utf8");
      let body = "";
      response.on("data", chunk => {
        body += chunk;
      });
      response.on("end", () => resolve(body));
    });

    request.setTimeout(30000, () => {
      request.destroy(new Error(`Request to ${url} timed out`));
    });
    request.on("error", reject);
  });

module.exports = { getText };
