import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null;
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const localUser = await prisma.user.upsert({
    where: { authUserId: user.id },
    update: { email: user.email ?? "" },
    create: {
      authUserId: user.id,
      email: user.email ?? `${user.id}@local.invalid`,
      name: user.user_metadata?.full_name ?? null,
    },
  });

  const family = await prisma.family.upsert({
    where: { ownerId: localUser.id },
    update: {},
    create: { ownerId: localUser.id, name: `${localUser.name ?? localUser.email} porodica` },
  });

  return { ...localUser, family };
}