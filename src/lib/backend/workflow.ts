/**
 * Cartographie fonctionnelle backend IvoireSuiteFlow + InsForge.
 *
 * Couches :
 * 1) **InsForge** : PostgreSQL (PostgREST), auth JWT, storage, RPC SQL, realtime.
 * 2) **Next.js Route Handlers** (`src/app/api/**`) : règles métier, agrégation,
 *    appels qui ne doivent pas être exposés au navigateur (clés service si besoin).
 * 3) **Client** : UI + `@insforge/sdk` (anon + session utilisateur) pour lectures/écritures
 *    autorisées par les policies InsForge ; migration progressive vers `/api/*` pour le sensible.
 *
 * Flux typiques :
 * - **Inscription** : `POST /api/register` → `auth.signUp` + inserts `organizations` / `establishments` / `profiles`.
 * - **Réservation publique** : `POST /api/public-bookings` + `POST /api/public-bookings/availability` → RPC `get_available_rooms`, etc.
 * - **Dashboard authentifié** : soit client InsForge direct, soit `GET/PATCH /api/...` avec `Authorization: Bearer`.
 *
 * Domaines à couvrir par des routes (évolution) :
 * - auth/session : `/api/me`
 * - contexte tenant : `/api/context` (profil + org + établissement courant)
 * - réservations : CRUD + actions (check-in/out, prolongation)
 * - chambres / types : CRUD
 * - caisse / factures / paiements / rapport Z
 * - admin SaaS : super_admin uniquement (déjà `/api/admin/saas`)
 */

export const API_PREFIX = "/api" as const;
