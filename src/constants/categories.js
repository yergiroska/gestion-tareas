export const CATEGORIES = [
    { id: "trabajo",   label: "Trabajo",   color: "#4f46e5" },
    { id: "personal",  label: "Personal",  color: "#10b981" },
    { id: "estudio",   label: "Estudio",   color: "#f59e0b" },
    { id: "otro",      label: "Otro",      color: "#6b7280" },
];

export const DEFAULT_CATEGORY = "otro";

export const getCategoryById = (id) =>
    CATEGORIES.find((cat) => cat.id === id) ?? CATEGORIES[CATEGORIES.length - 1];