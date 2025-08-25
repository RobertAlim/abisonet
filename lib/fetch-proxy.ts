// lib/fetch-proxy.ts
import { ProxyAgent, setGlobalDispatcher } from "undici";

export function enableProxyFromEnv() {
	const url = process.env.FIXIE_URL;
	if (!url) return;
	// Sends all outgoing fetch()/undici requests via Fixie
	setGlobalDispatcher(new ProxyAgent(url));
}
