import z from "zod";

export const CreateFamilyGroupDto = z.object({
  name: z.string().min(2).max(80),
});

export type CreateFamilyGroupDto = z.infer<typeof CreateFamilyGroupDto>;

export const CreateFamilyInviteDto = z.object({
  expiresInDays: z.coerce.number().int().min(1).max(30).optional(),
});

export type CreateFamilyInviteDto = z.infer<typeof CreateFamilyInviteDto>;

export const AddFamilyMemberDto = z.object({
  userId: z.string().min(1),
  relation: z.string().optional(),
});

export type AddFamilyMemberDto = z.infer<typeof AddFamilyMemberDto>;

export const JoinFamilyInviteDto = z.object({
  relation: z.string().optional(),
});

export type JoinFamilyInviteDto = z.infer<typeof JoinFamilyInviteDto>;

export const UpdateFamilyMemberDto = z.object({
  relation: z.string().optional(),
});

export type UpdateFamilyMemberDto = z.infer<typeof UpdateFamilyMemberDto>;
