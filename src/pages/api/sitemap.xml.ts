import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.afrilitt.com";
    const currentDate = new Date().toISOString();

    // Fetch published documents
    const { data: documents } = await supabase
      .from("documents")
      .select("slug, updated_at")
      .eq("is_published", true)
      .eq("is_approved", true);

    // Fetch active categories
    const { data: categories } = await supabase
      .from("categories")
      .select("slug")
      .eq("is_active", true);

    // Build sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Page d'accueil -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Catalogue -->
  <url>
    <loc>${baseUrl}/catalogue</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Page des catégories -->
  <url>
    <loc>${baseUrl}/categories</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- À propos -->
  <url>
    <loc>${baseUrl}/a-propos</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <!-- Contact -->
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <!-- Catégories individuelles -->
${
  categories
    ?.map(
      (cat) => `  <url>
    <loc>${baseUrl}/categories/${cat.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join("\n") || ""
}

  <!-- Documents publiés -->
${
  documents
    ?.map(
      (doc) => `  <url>
    <loc>${baseUrl}/documents/${doc.slug}</loc>
    <lastmod>${doc.updated_at || currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join("\n") || ""
}
</urlset>`;

    res.setHeader("Content-Type", "text/xml");
    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
    res.status(200).send(sitemap);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).json({ error: "Failed to generate sitemap" });
  }
}