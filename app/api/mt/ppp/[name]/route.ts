// app/api/mt/users/[name]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ToggleSchema, UpdateUserSchema } from "@/lib/z";
import {
	deletePppSecret,
	setPppSecretDisabled,
	updatePppSecret,
} from "@/lib/routeros-rest";

// Helpers to keep param typing clean
type NameParams = { name: string };
type RouteCtx = { params: Promise<NameParams> };

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
	const { name } = await ctx.params; // <-- changed
	const body = await req.json();

	if ("disabled" in body) {
		const { disabled } = ToggleSchema.parse(body);
		const updated = await setPppSecretDisabled(name, disabled);
		return NextResponse.json(updated);
	}

	const patch = UpdateUserSchema.parse(body);
	const updated = await updatePppSecret(name, patch);
	return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, ctx: RouteCtx) {
	const { name } = await ctx.params; // <-- changed
	await deletePppSecret(name);
	return new Response(null, { status: 204 });
}
