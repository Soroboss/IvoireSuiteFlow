export const ISF_BRAND = {
  name: "IvoireSuiteFlow",
  slogan: "Simplifiez vos opérations, valorisez vos établissements."
};

export const BOOKING_MODES = [
  { value: "hourly", label: "Horaire", color: "text-isf-warning" },
  { value: "nightly", label: "Nuitée", color: "text-isf-gold" },
  { value: "stay", label: "Séjour", color: "text-isf-info" },
  { value: "pass", label: "Pass", color: "text-isf-purple" }
] as const;

export const ROOM_STATUSES = [
  { value: "available", label: "Disponible", color: "bg-isf-success/20 text-isf-success" },
  { value: "occupied", label: "Occupé", color: "bg-isf-error/20 text-isf-error" },
  { value: "cleaning", label: "Nettoyage", color: "bg-isf-warning/20 text-isf-warning" },
  { value: "maintenance", label: "Maintenance", color: "bg-isf-text-muted/20 text-isf-text-muted" },
  { value: "out_of_service", label: "Hors service", color: "bg-slate-700/30 text-slate-400" }
] as const;

export const PAYMENT_METHODS = [
  "cash",
  "orange_money",
  "mtn_momo",
  "wave",
  "moov_money",
  "card",
  "transfer",
  "corporate"
] as const;

export const AMENITIES = [
  "clim",
  "tv",
  "wifi",
  "frigo",
  "cuisine_equipee",
  "machine_laver",
  "balcon",
  "terrasse",
  "baignoire",
  "douche_italienne",
  "minibar",
  "salon",
  "parking_prive",
  "coffre_fort",
  "vue_lagune"
] as const;
