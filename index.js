process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const http = require('http');
const fs = require('fs');
const path = require('path');
const BotManager = require('./BotManager');

const port = 1336;
const folderPath = 'www';

const server = http.createServer((req, res) => {
  const filePath = path.join(folderPath, req.url);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
      return;
    }

    res.writeHead(200);
    res.end(data);
  });
});

const botManager = new BotManager();

const WebSocket = require("ws");

const wsServer = new WebSocket.Server({
    port: 1337
});
wsServer.on('connection', ws => {
    ws.on('message', (data) => {
        let dat = JSON.parse(data.toString());
        switch (dat.kind) {
            case "url": {
                botManager.setMasterWsUrl(dat.url);
                break;
            }
            case "pos": {
                botManager.setTarget(dat.x, dat.y);
                break;
            }
        }
    });
    let iv = setInterval(() => {
      botManager.sendPositions(ws);
    }, 40);
    ws.on('close', () => clearInterval(iv));
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
