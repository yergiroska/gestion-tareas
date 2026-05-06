export const STATUSES = [
    { id: "pendiente",   label: "Pendiente",   color: "#ca8a04", bg: "#fef9c3" },
    { id: "en_proceso",  label: "En proceso",  color: "#2563eb", bg: "#dbeafe" },
    { id: "pausa",       label: "En pausa",    color: "#9333ea", bg: "#f3e8ff" },
    { id: "cancelada",   label: "Cancelada",   color: "#dc2626", bg: "#fee2e2" },
    { id: "completada",  label: "Completada",  color: "#16a34a", bg: "#dcfce7" },
];

export const DEFAULT_STATUS = "pendiente";

export const getStatusById = (id) =>
    STATUSES.find((s) => s.id === id) ?? STATUSES[0];

// Convierte el modelo antiguo (completed: bool) al nuevo
export const migrateStatus = (task) => {
    if (task.status) return task.status;
    if (task.completed === true) return "completada";
    return "pendiente";
};