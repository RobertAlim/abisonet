// lib/routeros-rest-ppp.ts
import ky from "ky";
import { enableProxyFromEnv } from "@/lib/fetch-proxy";

enableProxyFromEnv(); // important: run before first request

const baseUrl = `${
	process.env.ROUTEROS_USE_TLS === "true" ? "https" : "http"
}://${process.env.ROUTEROS_HOST}/rest`;

const api = ky.extend({
	prefixUrl: baseUrl,
	hooks: {
		beforeRequest: [
			(req) => {
				const user = process.env.ROUTEROS_USERNAME!;
				const pass = process.env.ROUTEROS_PASSWORD!;
				const auth = Buffer.from(`${user}:${pass}`).toString("base64");
				req.headers.set("Authorization", `Basic ${auth}`);
				req.headers.set("Content-Type", "application/json");
			},
		],
	},
});

// ---- PPP endpoints ----
export interface PppSecret {
	".id"?: string;
	name: string;
	password?: string;
	service?: string;
	profile?: string;
	comment?: string;
	disabled?: string;
}
export interface PppSecretDto {
	id?: string;
	name: string;
	service?: string | null;
	profile?: string | null;
	comment?: string | null;
	disabled: boolean;
}
const b = (v?: string) => String(v ?? "false").toLowerCase() === "true";
const toDto = (x: PppSecret): PppSecretDto => ({
	id: x[".id"],
	name: x.name,
	service: x.service ?? null,
	profile: x.profile ?? null,
	comment: x.comment ?? null,
	disabled: b(x.disabled),
});

export async function listPppSecrets(): Promise<PppSecretDto[]> {
	const res = (await api.get("ppp/secret").json()) as PppSecret[];
	return res.map(toDto);
}
export async function createPppSecret(input: {
	name: string;
	password: string;
	service?: string;
	profile?: string;
	comment?: string;
}): Promise<PppSecretDto> {
	const res = (await api
		.put("ppp/secret", { body: JSON.stringify(input) })
		.json()) as PppSecret;
	return toDto(res);
}
export async function setPppSecretDisabled(
	name: string,
	disabled: boolean
): Promise<PppSecretDto> {
	const res = (await api
		.patch(`ppp/secret/${encodeURIComponent(name)}`, {
			body: JSON.stringify({ disabled: disabled ? "true" : "false" }),
		})
		.json()) as PppSecret;
	return toDto(res);
}
export async function updatePppSecret(
	name: string,
	patch: Partial<Pick<PppSecret, "password" | "profile" | "comment">>
): Promise<PppSecretDto> {
	const res = (await api
		.patch(`ppp/secret/${encodeURIComponent(name)}`, {
			body: JSON.stringify(patch),
		})
		.json()) as PppSecret;
	return toDto(res);
}
export async function deletePppSecret(name: string): Promise<void> {
	await api.delete(`ppp/secret/${encodeURIComponent(name)}`);
}
