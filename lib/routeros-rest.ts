// lib/routeros-rest.ts
import ky from "ky";

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

export type RouterOSBoolString = "true" | "false";

export const asBool = (v: RouterOSBoolString | string | undefined): boolean =>
	String(v).toLowerCase() === "true";

export interface HotspotUser {
	/** RouterOS internal record id like *1A; present in GET lists */
	".id"?: string;
	name: string;
	password?: string; // only for creation/update
	profile?: string;
	comment?: string;
	disabled?: RouterOSBoolString | string; // "true"/"false" from router
}

export interface HotspotUserDto {
	name: string;
	profile?: string | null;
	comment?: string | null;
	disabled: boolean;
	id?: string; // from ".id"
}

function toDto(u: HotspotUser): HotspotUserDto {
	return {
		id: u[".id"],
		name: u.name,
		profile: u.profile ?? null,
		comment: u.comment ?? null,
		disabled: asBool(u.disabled),
	};
}

// List users
export async function listHotspotUsers(): Promise<HotspotUserDto[]> {
	const res = (await api.get("ip/hotspot/user").json()) as HotspotUser[];
	return res.map(toDto);
}

// Create user
export async function createHotspotUser(input: {
	name: string;
	password: string;
	profile?: string;
	comment?: string;
}): Promise<HotspotUserDto> {
	const body = JSON.stringify(input);
	const res = (await api
		.put("ip/hotspot/user", { body })
		.json()) as HotspotUser;
	return toDto(res);
}

// Enable/Disable
export async function setHotspotUserDisabled(
	name: string,
	disabled: boolean
): Promise<HotspotUserDto> {
	// PATCH supports name keys directly (named params allowed); otherwise resolve id first. :contentReference[oaicite:3]{index=3}
	const res = (await api
		.patch(`ip/hotspot/user/${encodeURIComponent(name)}`, {
			body: JSON.stringify({ disabled: disabled ? "true" : "false" }),
		})
		.json()) as HotspotUser;
	return toDto(res);
}

// Update (profile/comment, optional password change)
export async function updateHotspotUser(
	name: string,
	patch: Partial<Pick<HotspotUser, "password" | "profile" | "comment">>
): Promise<HotspotUserDto> {
	const payload: Record<string, string> = {};
	if (patch.password) payload.password = patch.password;
	if (patch.profile) payload.profile = patch.profile;
	if (typeof patch.comment === "string") payload.comment = patch.comment;
	const res = (await api
		.patch(`ip/hotspot/user/${encodeURIComponent(name)}`, {
			body: JSON.stringify(payload),
		})
		.json()) as HotspotUser;
	return toDto(res);
}

// Delete
export async function deleteHotspotUser(name: string): Promise<void> {
	await api.delete(`ip/hotspot/user/${encodeURIComponent(name)}`);
}
