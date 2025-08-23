// lib/z.ts
import { z } from "zod";

export const CreateUserSchema = z.object({
	name: z.string().min(1),
	password: z.string().min(4),
	profile: z.string().min(1).optional(),
	comment: z.string().optional(),
});

export const UpdateUserSchema = z.object({
	password: z.string().min(4).optional(),
	profile: z.string().min(1).optional(),
	comment: z.string().optional(),
});

export const ToggleSchema = z.object({
	disabled: z.boolean(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type ToggleInput = z.infer<typeof ToggleSchema>;
