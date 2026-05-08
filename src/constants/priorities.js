export const PRIORITIES = [
    { id: "alta",  label: "Alta",  color: "#dc2626", bg: "#fee2e2", icon: "🔴" },
    { id: "media", label: "Media", color: "#d97706", bg: "#fef3c7", icon: "🟡" },
    { id: "baja",  label: "Baja",  color: "#16a34a", bg: "#dcfce7", icon: "🟢" },
];

export const DEFAULT_PRIORITY = "media";

export const getPriorityById = (id) =>
    PRIORITIES.find((p) => p.id === id) ?? PRIORITIES[1];