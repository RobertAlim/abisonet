// app/api/mt/users/[name]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ToggleSchema, UpdateUserSchema } from "@/lib/z";
import {
	deleteHotspotUser,
	setHotspotUserDisabled,
	updateHotspotUser,
} from "@/lib/routeros-rest";

type Params = { params: { name: string } };

export async function PATCH(req: NextRequest, { params }: Params) {
	const body = await req.json();
	if ("disabled" in body) {
		const { disabled } = ToggleSchema.parse(body);
		const updated = await setHotspotUserDisabled(params.name, disabled);
		return NextResponse.json(updated);
	}
	const patch = UpdateUserSchema.parse(body);
	const updated = await updateHotspotUser(params.name, patch);
	return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
	await deleteHotspotUser(params.name);
	return new Response(null, { status: 204 });
}
