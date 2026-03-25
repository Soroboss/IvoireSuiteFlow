import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicBookingForm } from "@/components/public/PublicBookingForm";
import { createServerInsforgeClient } from "@/lib/insforge/server";
import { formatFCFA } from "@/lib/utils";

type Params = { slug: string };
export const dynamic = "force-dynamic";

async function getEstablishment(slug: string) {
  const insforge = createServerInsforgeClient();
  const { data, error } = await insforge.database
    .from("establishments")
    .select(
      "id, name, slug, city, neighborhood, description, star_rating, logo_url, cover_image_url, phone, whatsapp, email, latitude, longitude"
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) return null;
  return data as any;
}

async function getRoomTypes(establishmentId: string) {
  const insforge = createServerInsforgeClient();
  const { data } = await insforge.database
    .from("room_types")
    .select("id, name, description, amenities, images, base_price_night, base_price_week, base_price_day_pass")
    .eq("establishment_id", establishmentId)
    .eq("is_active", true)
    .order("sort_order");
  return (data ?? []) as any[];
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const establishment = await getEstablishment(params.slug);
  if (!establishment) {
    return { title: "Reservation | IvoireSuiteFlow" };
  }
  const title = `Reservation - ${establishment.name} | IvoireSuiteFlow`;
  const description =
    establishment.description ?? `Reservez votre logement a ${establishment.name} (${establishment.neighborhood ?? ""}, ${establishment.city ?? "Abidjan"}).`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: establishment.cover_image_url ? [establishment.cover_image_url] : []
    }
  };
}

export default async function PublicBookingPage({ params }: { params: Params }) {
  const establishment = await getEstablishment(params.slug);
  if (!establishment) notFound();
  const roomTypes = await getRoomTypes(establishment.id);

  const allImages = [establishment.cover_image_url, ...roomTypes.flatMap((rt) => rt.images ?? [])].filter(Boolean);
  const whatsappDigits = (establishment.whatsapp ?? "").replace(/\D/g, "");
  const mapEmbed =
    establishment.latitude && establishment.longitude
      ? `https://maps.google.com/maps?q=${establishment.latitude},${establishment.longitude}&z=15&output=embed`
      : null;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: establishment.name,
    description: establishment.description ?? "",
    image: allImages[0] ?? null,
    telephone: establishment.phone ?? null,
    email: establishment.email ?? null,
    address: {
      "@type": "PostalAddress",
      addressLocality: establishment.city ?? "Abidjan",
      addressRegion: establishment.neighborhood ?? ""
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF8F2] text-[#1A1A2E]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <section className="mx-auto max-w-6xl px-4 py-8">
        <article className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5">
          <div className="relative h-64 bg-slate-200 md:h-80">
            {establishment.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={establishment.cover_image_url} alt={establishment.name} className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-serif text-3xl">{establishment.name}</h1>
                <p className="text-slate-600">
                  {establishment.neighborhood ?? "Quartier"}{establishment.city ? `, ${establishment.city}` : ""}
                </p>
                <p className="mt-1 text-[#C8A951]">{Array.from({ length: establishment.star_rating ?? 0 }).map(() => "★")}</p>
              </div>
              {establishment.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={establishment.logo_url} alt={`${establishment.name} logo`} className="h-16 w-16 rounded-full object-cover ring-2 ring-[#C8A951]/40" />
              ) : null}
            </div>
            <p className="mt-4 text-slate-700">{establishment.description ?? "Bienvenue dans votre prochain sejour d'exception."}</p>
          </div>
        </article>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <h2 className="text-xl font-semibold">Galerie</h2>
              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
                {allImages.slice(0, 9).map((image: string, index: number) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={`${image}-${index}`} src={image} alt={`Photo ${index + 1}`} className="h-28 w-full rounded-lg object-cover" />
                ))}
              </div>
            </article>

            <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <h2 className="text-xl font-semibold">Nos logements</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {roomTypes.map((roomType) => (
                  <div key={roomType.id} className="rounded-xl border border-slate-200 p-4">
                    <p className="font-medium">{roomType.name}</p>
                    <p className="mt-1 text-sm text-slate-600">{roomType.description ?? "Confort et fonctionnalite pour votre sejour."}</p>
                    <p className="mt-2 text-sm text-[#1A1A2E]">
                      A partir de {formatFCFA(Number(roomType.base_price_night ?? roomType.base_price_week ?? roomType.base_price_day_pass ?? 0))}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(roomType.amenities ?? []).slice(0, 6).map((amenity: string) => (
                        <span key={amenity} className="rounded-full bg-[#C8A951]/15 px-2 py-1 text-xs text-[#7B6122]">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <PublicBookingForm slug={params.slug} />
          </div>

          <aside className="space-y-6">
            <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <h3 className="text-lg font-semibold">Nous contacter</h3>
              {whatsappDigits ? (
                <a className="mt-3 block rounded-lg bg-[#25D366] px-4 py-2 text-center font-medium text-white" href={`https://wa.me/225${whatsappDigits}`} target="_blank">
                  WhatsApp
                </a>
              ) : null}
              <p className="mt-3 text-sm text-slate-700">Telephone: {establishment.phone ?? "Non renseigne"}</p>
              <p className="text-sm text-slate-700">Email: {establishment.email ?? "Non renseigne"}</p>
            </article>

            {mapEmbed ? (
              <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                <iframe src={mapEmbed} loading="lazy" className="h-64 w-full" referrerPolicy="no-referrer-when-downgrade" />
              </article>
            ) : null}
          </aside>
        </section>

        <footer className="mt-10 border-t border-slate-200 py-6 text-center text-sm text-slate-600">
          Propulse par IvoireSuiteFlow - <Link href="/">Voir la landing</Link>
        </footer>
      </section>
    </main>
  );
}
