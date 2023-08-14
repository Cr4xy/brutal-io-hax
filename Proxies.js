module.exports = async function getProxies(desiredAmount) {
	const proxies = new Set();
	const t = await (await fetch("https://spys.one/en/socks-proxy-list/", {
		"headers": {
		  "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
		  "accept-language": "en-US,en;q=0.9,de-DE;q=0.8,de;q=0.7",
		  "cache-control": "no-cache",
		  "content-type": "application/x-www-form-urlencoded",
		  "pragma": "no-cache",
		  "sec-ch-ua": "\"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"114\", \"Google Chrome\";v=\"114\"",
		  "sec-ch-ua-mobile": "?0",
		  "sec-ch-ua-platform": "\"Windows\"",
		  "sec-fetch-dest": "document",
		  "sec-fetch-mode": "navigate",
		  "sec-fetch-site": "same-origin",
		  "sec-fetch-user": "?1",
		  "upgrade-insecure-requests": "1"
		},
		"referrer": "https://spys.one/en/socks-proxy-list/",
		"referrerPolicy": "strict-origin-when-cross-origin",
		"body": "xx0=2d7541961f1be4a0e31145929cb55ac0&xpp=5&xf1=0&xf2=0&xf4=0&xf5=2",
		"method": "POST",
		"mode": "cors",
		"credentials": "include"
	  })).text();
	var vars = {};
	w = t.match(/<script type="text\/javascript">([a-z0-9;=^]+)<\/script>/);
	const varCode = w[1];
	for (let stmt of varCode.split(";")) {
		if (!stmt) continue;
		let [vn, vv] = stmt.split("=");
		if (vv.indexOf("^") < 0) {
			vars[vn] = parseInt(vv);
		} else {
			let [exp, vn1] = vv.split("^");
			vars[vn] = parseInt(exp) ^ vars[vn1];
		}
	}
	const entryRgx = /<tr.+?>(.+?)<\/tr>/g;
	let m;
	while (m = entryRgx.exec(t)) {
		let row = m[1];
		let ip = row.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/);
		if (!ip) continue;
		ip = ip[0];
		let portCode = row.match(/document.write\("<font class=.+"\+(.+?)\)<\/script>/);
		if (!portCode) continue;
		portCode = portCode[1];
		let port = "";
		for (let stmt of portCode.split("+")) {
			let [a, b] = stmt.slice(1, -1).split("^");
			port += vars[a] ^ vars[b];
		}
		proxies.add(`${ip}:${port}`);
	}
	return Array.from(proxies).slice(0, desiredAmount);
}

