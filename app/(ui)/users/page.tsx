// app/(ui)/users/page.tsx
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

type User = {
	id?: string;
	name: string;
	profile?: string | null;
	comment?: string | null;
	disabled: boolean;
};

export default function UsersPage() {
	const qc = useQueryClient();

	const usersQ = useQuery<User[]>({
		queryKey: ["mt-users"],
		queryFn: async () => {
			const r = await fetch("/api/mt/ppp");
			if (!r.ok) throw new Error("Failed to fetch users");
			return (await r.json()) as User[];
		},
		staleTime: 60_000,
	});

	const toggleM = useMutation({
		mutationFn: async (p: { name: string; disabled: boolean }) => {
			const r = await fetch(`/api/mt/ppp/${encodeURIComponent(p.name)}`, {
				method: "PATCH",
				body: JSON.stringify({ disabled: p.disabled }),
				headers: { "Content-Type": "application/json" },
			});
			if (!r.ok) throw new Error("Toggle failed");
			return (await r.json()) as User;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: ["mt-users"] }),
	});

	const createM = useMutation({
		mutationFn: async (p: {
			name: string;
			password: string;
			profile?: string;
			comment?: string;
		}) => {
			const r = await fetch("/api/mt/ppp", {
				method: "PUT",
				body: JSON.stringify(p),
				headers: { "Content-Type": "application/json" },
			});
			if (!r.ok) throw new Error("Create failed");
			return (await r.json()) as User;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: ["mt-users"] }),
	});

	const [form, setForm] = useState<{
		name: string;
		password: string;
		profile?: string;
		comment?: string;
	}>({
		name: "",
		password: "",
	});

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-semibold">Hotspot Users</h1>
				<Dialog>
					<DialogTrigger asChild>
						<Button>Add user</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create Hotspot User</DialogTitle>
						</DialogHeader>
						<div className="space-y-3">
							<Input
								placeholder="username"
								value={form.name}
								onChange={(e) => setForm({ ...form, name: e.target.value })}
							/>
							<Input
								placeholder="password"
								type="password"
								value={form.password}
								onChange={(e) => setForm({ ...form, password: e.target.value })}
							/>
							<Input
								placeholder="profile (optional)"
								value={form.profile ?? ""}
								onChange={(e) => setForm({ ...form, profile: e.target.value })}
							/>
							<Input
								placeholder="comment (optional)"
								value={form.comment ?? ""}
								onChange={(e) => setForm({ ...form, comment: e.target.value })}
							/>
							<Button
								onClick={() => createM.mutate(form)}
								disabled={!form.name || !form.password}
							>
								{createM.isPending ? "Creating..." : "Create"}
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			<div className="rounded-xl border p-4">
				{usersQ.isLoading ? (
					<div>Loading…</div>
				) : usersQ.isError ? (
					<div className="text-red-600">Failed to load users</div>
				) : (
					<div className="grid grid-cols-1 gap-2">
						{usersQ.data!.map((u) => (
							<div
								key={u.name}
								className="flex items-center justify-between rounded-lg border px-4 py-3"
							>
								<div>
									<div className="font-medium">{u.name}</div>
									<div className="text-sm text-muted-foreground">
										{u.profile ?? "no profile"}{" "}
										{u.comment ? `• ${u.comment}` : ""}
									</div>
								</div>
								<div className="flex items-center gap-3">
									<span className="text-sm">
										{u.disabled ? "Disabled" : "Enabled"}
									</span>
									<Switch
										checked={!u.disabled}
										onCheckedChange={(checked) =>
											toggleM.mutate({ name: u.name, disabled: !checked })
										}
									/>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
