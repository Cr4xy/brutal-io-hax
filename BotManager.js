
const { SocksProxyAgent } = require("socks-proxy-agent");
const getProxies = require("./Proxies");
const BrutalClient = require('./BrutalClient');
const BotAI = require("./BotAI");

class BotManager {
    static BOTS_PER_IP = 3;
    static PROXY_COUNT = 200;
    constructor() {
        this.masterWsUrl = null;
        this.clients = [];
        this.connectedClients = 0;
        this.spawnEverything();
        //this.spawnBot();
        //this.spawnBot();
        //this.spawnBot();
    }
    async spawnEverything() {
        const proxies = await getProxies(BotManager.PROXY_COUNT);
        for (let i = 0; i < proxies.length; i++) {
            for (let j = 0; j < BotManager.BOTS_PER_IP; j++) {
                this.spawnBot(`socks://${proxies[i]}`);
            }
        }
    }
    spawnBot(proxy) {
        const manager = this;
        const cl = new BrutalClient(this.masterWsUrl, proxy ? new SocksProxyAgent(proxy) : undefined);
        cl.on('connected', function() {
            this.log("connected");
            this.sendNick("hello")
            console.log("connectedClients", ++manager.connectedClients);
        });
        cl.on('disconnected', function() {
            this.log("disconnected");
            console.log("connectedClients", --manager.connectedClients);
            //manager.spawnBot(proxy); // spawn another one
        });
        cl.on('death', function(killer) {
            this.log("i died", killer?.nick);
            this.sendNick("forsen");
        });
        cl.on('kill', function(killed) {
            this.log("i killed", killed.nick);
        });
        cl.on('spawn', function() {
            this.log("spawned");
        });
        //new BotAI(cl);
        this.clients.push(cl);
        return cl;
    }
    setTarget(x, y) {
        for (let cl of this.clients) cl.setTarget(x, y);
    }
    sendPositions(ws) {
        let bots = {};
        for (let cl of this.clients) {
            if (!cl.myEntity) continue;
            bots[cl.clientId] = {x: cl.myEntity.dstX, y: cl.myEntity.dstY};
        }
        ws.send(JSON.stringify({
            type: "bots",
            bots: bots
        }))
    }
    setMasterWsUrl(url) {
        if (!url) return;
        this.masterWsUrl = url;
        for (let cl of this.clients) cl.setWsUrl(url);
    }
}

module.exports = BotManager;