// app/api/mt/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { CreateUserSchema } from "@/lib/z";
import { createPppSecret, listPppSecrets } from "@/lib/routeros-rest";
import { db } from "@/lib/db";
import { mtUsers, routers } from "@/drizzle/schema";

export async function GET() {
	const data = await listPppSecrets();
	// Optional: sync basic fields into Neon (single router example)
	const [router] = await db.select().from(routers).limit(1);
	if (router) {
		for (const u of data) {
			await db
				.insert(mtUsers)
				.values({
					routerId: router.id,
					name: u.name,
					profile: u.profile ?? undefined,
					disabled: u.disabled,
					comment: u.comment ?? undefined,
					lastSyncAt: new Date(),
				})
				.onConflictDoUpdate({
					target: [mtUsers.routerId, mtUsers.name],
					set: {
						profile: u.profile ?? undefined,
						disabled: u.disabled,
						comment: u.comment ?? undefined,
						lastSyncAt: new Date(),
					},
				});
		}
	}
	return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
	const json = await req.json();
	const input = CreateUserSchema.parse(json);
	const created = await createPppSecret(input);
	return NextResponse.json(created, { status: 201 });
}
