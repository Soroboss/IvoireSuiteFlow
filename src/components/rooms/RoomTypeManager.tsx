"use client";

import { useMemo, useState } from "react";
import { Plus, Upload } from "lucide-react";
import { AMENITIES } from "@/lib/constants";
import type { RoomTypeRow } from "@/types/room";

type Props = {
  types: RoomTypeRow[];
  onCreate: (payload: Partial<RoomTypeRow>) => Promise<void>;
  onUpdate: (id: string, payload: Partial<RoomTypeRow>) => Promise<void>;
};

export function RoomTypeManager({ types, onCreate, onUpdate }: Props) {
  const [form, setForm] = useState<Partial<RoomTypeRow>>({
    name: "",
    description: "",
    base_price_hour: 0,
    base_price_night: 0,
    weekend_price_night: 0,
    high_season_price_night: 0,
    holiday_price_night: 0,
    base_price_week: 0,
    base_price_month: 0,
    base_price_day_pass: 0,
    deposit_amount: 0,
    capacity_adults: 2,
    capacity_children: 0,
    amenities: [],
    sort_order: 0,
    is_active: true
  });

  const amenitySet = useMemo(() => new Set(form.amenities ?? []), [form.amenities]);

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-isf-border bg-isf-bgCard p-4">
        <h2 className="font-serif text-xl text-isf-cream">Nouveau type de logement</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          <input
            placeholder="Nom du type"
            value={form.name ?? ""}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            className="h-10 rounded-md border border-isf-border bg-isf-bgElevated px-3 text-sm"
          />
          <input
            placeholder="Description"
            value={form.description ?? ""}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            className="h-10 rounded-md border border-isf-border bg-isf-bgElevated px-3 text-sm"
          />
          {[
            ["base_price_hour", "Tarif horaire"],
            ["base_price_night", "Nuitée standard"],
            ["weekend_price_night", "Nuitée week-end"],
            ["high_season_price_night", "Nuitée haute saison"],
            ["holiday_price_night", "Nuitée fêtes"],
            ["base_price_week", "Tarif semaine"],
            ["base_price_month", "Tarif mois"],
            ["base_price_day_pass", "Pass journée"],
            ["deposit_amount", "Caution séjour"]
          ].map(([key, label]) => (
            <input
              key={key}
              type="number"
              placeholder={label}
              value={(form as any)[key] ?? 0}
              onChange={(e) => setForm((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
              className="h-10 rounded-md border border-isf-border bg-isf-bgElevated px-3 text-sm"
            />
          ))}
          <input
            type="number"
            placeholder="Capacité adultes"
            value={form.capacity_adults ?? 0}
            onChange={(e) => setForm((prev) => ({ ...prev, capacity_adults: Number(e.target.value) }))}
            className="h-10 rounded-md border border-isf-border bg-isf-bgElevated px-3 text-sm"
          />
          <input
            type="number"
            placeholder="Capacité enfants"
            value={form.capacity_children ?? 0}
            onChange={(e) => setForm((prev) => ({ ...prev, capacity_children: Number(e.target.value) }))}
            className="h-10 rounded-md border border-isf-border bg-isf-bgElevated px-3 text-sm"
          />
          <input
            type="number"
            placeholder="Ordre d'affichage"
            value={form.sort_order ?? 0}
            onChange={(e) => setForm((prev) => ({ ...prev, sort_order: Number(e.target.value) }))}
            className="h-10 rounded-md border border-isf-border bg-isf-bgElevated px-3 text-sm"
          />
        </div>

        <div className="mt-3">
          <p className="mb-2 text-sm text-isf-textSecondary">Équipements</p>
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map((amenity) => {
              const active = amenitySet.has(amenity);
              return (
                <button
                  key={amenity}
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      amenities: active
                        ? (prev.amenities ?? []).filter((item) => item !== amenity)
                        : [...(prev.amenities ?? []), amenity]
                    }))
                  }
                  className={`rounded-full px-2 py-1 text-xs ${active ? "bg-isf-gold text-black" : "bg-white/5 text-isf-textSecondary"}`}
                >
                  {amenity.replaceAll("_", " ")}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-dashed border-isf-borderLight p-4 text-sm text-isf-textSecondary">
          <p className="mb-2">Upload photos (max 10)</p>
          <button type="button" className="inline-flex items-center gap-2 rounded-md border border-isf-border px-3 py-1.5">
            <Upload className="h-4 w-4" />
            Choisir des photos
          </button>
        </div>

        <button
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-isf-gold px-3 py-2 text-sm font-medium text-black"
          onClick={() => onCreate(form)}
        >
          <Plus className="h-4 w-4" />
          Créer le type
        </button>
      </section>

      <section className="overflow-x-auto rounded-xl border border-isf-border bg-isf-bgCard">
        <table className="min-w-full text-sm">
          <thead className="bg-isf-bgElevated text-left text-isf-textSecondary">
            <tr>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Nuitée</th>
              <th className="px-3 py-2">Semaine</th>
              <th className="px-3 py-2">Mois</th>
              <th className="px-3 py-2">Capacité</th>
              <th className="px-3 py-2">Ordre</th>
              <th className="px-3 py-2">Actif</th>
            </tr>
          </thead>
          <tbody>
            {types.map((type) => (
              <tr key={type.id} className="border-t border-isf-border">
                <td className="px-3 py-2">{type.name}</td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    className="w-28 rounded border border-isf-border bg-isf-bgElevated px-2 py-1"
                    defaultValue={type.base_price_night ?? 0}
                    onBlur={(e) => onUpdate(type.id, { base_price_night: Number(e.target.value) })}
                  />
                </td>
                <td className="px-3 py-2">{type.base_price_week ?? 0}</td>
                <td className="px-3 py-2">{type.base_price_month ?? 0}</td>
                <td className="px-3 py-2">
                  {type.capacity_adults}A / {type.capacity_children}E
                </td>
                <td className="px-3 py-2">{type.sort_order}</td>
                <td className="px-3 py-2">
                  <button
                    className={`rounded-full px-2 py-1 text-xs ${type.is_active ? "bg-isf-success/20 text-isf-success" : "bg-slate-700/20 text-slate-400"}`}
                    onClick={() => onUpdate(type.id, { is_active: !type.is_active })}
                  >
                    {type.is_active ? "Actif" : "Inactif"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
