import { z } from 'zod';

export const memberRoleSchema = z.enum(['viewer', 'editor', 'admin']);

export const addMemberSchema = z.object({
    email: z.email('Invalid email address'),
    role: memberRoleSchema.optional().default('editor'),
});

export const removeMemberSchema = z.object({
    memberId: z.coerce.bigint('Member ID is required'),
});

export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type RemoveMemberInput = z.infer<typeof removeMemberSchema>;
export type MemberRoleInput = z.infer<typeof memberRoleSchema>;