import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "❌ Manquante",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
      `✅ Présente (${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 30)}...)` : 
      "❌ Manquante",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 
      `✅ Présente (${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 30)}...)` : 
      "❌ Manquante",
  };

  return res.status(200).json(envVars);
}