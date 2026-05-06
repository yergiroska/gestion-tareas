import { useEffect, useState, useRef } from "react";
import { subscribeTasks, updateTask } from "../services/taskService";
import { useAuth } from "../context/AuthContext";
import { CATEGORIES, getCategoryById } from "../constants/categories";
import { STATUSES, getStatusById } from "../constants/statuses";

const ALL = "todas";

function CustomSelect({ value, onChange, options, allLabel, allCount }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const currentOption = value === ALL ? null : options.find(o => o.id === value);
    const displayColor = currentOption ? currentOption.color : "#4f46e5";
    const displayBg = currentOption ? (currentOption.bg ?? currentOption.color + "20") : "#ede9fe";

    return (
        <div ref={ref} style={styles.selectWrapper}>
            <p style={styles.selectLabel}>{allLabel}</p>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                style={{
                    ...styles.selectTrigger,
                    backgroundColor: displayBg,
                    color: displayColor,
                    borderColor: displayColor + "60",
                }}
            >
                <span>
                    {value === ALL
                        ? "Todas"
                        : options.find(o => o.id === value)?.label
                    }
                </span>
                <span style={styles.selectArrow}>{open ? "▲" : "▼"}</span>
            </button>
            {open && (
                <div style={styles.dropdown}>
                    <div
                        onClick={() => { onChange(ALL); setOpen(false); }}
                        style={{
                            ...styles.dropdownItem,
                            backgroundColor: value === ALL ? "#ede9fe" : "white",
                            color: value === ALL ? "#4f46e5" : "#374151",
                        }}
                    >
                        <span style={{ ...styles.dot, backgroundColor: "#4f46e5" }} />
                        Todas ({allCount})
                    </div>
                    {options.map((opt) => {
                        const isActive = value === opt.id;
                        return (
                            <div
                                key={opt.id}
                                onClick={() => { onChange(opt.id); setOpen(false); }}
                                style={{
                                    ...styles.dropdownItem,
                                    backgroundColor: isActive ? (opt.bg ?? opt.color + "20") : "white",
                                    color: isActive ? opt.color : "#374151",
                                }}
                            >
                                <span style={{ ...styles.dot, backgroundColor: opt.color }} />
                                {opt.label} ({opt._count ?? 0})
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function TaskList() {
    const { user } = useAuth();
    const [tasks, setTasks]                   = useState([]);
    const [loading, setLoading]               = useState(true);
    const [categoryFilter, setCategoryFilter] = useState(ALL);
    const [statusFilter, setStatusFilter]     = useState(ALL);
    const [searchQuery, setSearchQuery]       = useState("");

    useEffect(() => {
        const unsubscribe = subscribeTasks(user.uid, (tasks) => {
            setTasks(tasks);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user.uid]);

    const handleStatusChange = async (taskId, newStatus) => {
        await updateTask(taskId, { status: newStatus });
    };

    const byCategory = categoryFilter === ALL
        ? tasks
        : tasks.filter((t) => t.category === categoryFilter);

    const byStatus = statusFilter === ALL
        ? byCategory
        : byCategory.filter((t) => t.status === statusFilter);

    const filteredTasks = searchQuery.trim() === ""
        ? byStatus
        : byStatus.filter((t) =>
            t.title.toLowerCase().includes(searchQuery.toLowerCase())
        );

    const statusesWithCount = STATUSES.map(s => ({
        ...s,
        _count: tasks.filter(t => t.status === s.id).length,
    }));
    const categoriesWithCount = CATEGORIES.map(c => ({
        ...c,
        _count: tasks.filter(t => t.category === c.id).length,
    }));

    if (loading) return <p style={styles.message}>Cargando tareas...</p>;

    return (
        <div>
            {/* Buscador */}
            <input
                type="text"
                placeholder="🔍 Buscar tarea..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
            />

            {/* Filtros */}
            <div style={styles.filtersRow}>
                <CustomSelect
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={statusesWithCount}
                    allLabel="Estado"
                    allCount={tasks.length}
                />
                <CustomSelect
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                    options={categoriesWithCount}
                    allLabel="Categoría"
                    allCount={tasks.length}
                />
            </div>

            {/* Lista */}
            {filteredTasks.length === 0 ? (
                <p style={styles.message}>
                    {searchQuery ? "No hay tareas que coincidan." : "No hay tareas aquí."}
                </p>
            ) : (
                <ul style={styles.list}>
                    {filteredTasks.map((task) => {
                        const cat    = getCategoryById(task.category);
                        const status = getStatusById(task.status);
                        const isDone = ["completada", "cancelada"].includes(task.status);

                        return (
                            <li key={task.id} style={styles.item}>
                                <div style={styles.itemInner}>
                                    <div style={styles.mainRow}>
                                        <div style={styles.titleBlock}>
                                            <span style={{
                                                ...styles.title,
                                                textDecoration: isDone ? "line-through" : "none",
                                                color: isDone ? "#9ca3af" : "#1f2937",
                                            }}>
                                                {task.title}
                                            </span>
                                            {task.description && (
                                                <span style={styles.description}>{task.description}</span>
                                            )}
                                        </div>
                                        <div style={styles.actions}>
                                            <span style={{
                                                ...styles.categoryBadge,
                                                backgroundColor: cat.color + "20",
                                                color: cat.color,
                                                border: `1px solid ${cat.color}40`,
                                            }}>
                                                {cat.label}
                                            </span>
                                            <select
                                                value={task.status}
                                                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                                style={{
                                                    ...styles.statusSelect,
                                                    backgroundColor: status.bg,
                                                    color: status.color,
                                                    borderColor: status.color + "60",
                                                }}
                                            >
                                                {STATUSES.map((s) => (
                                                    <option key={s.id} value={s.id}>{s.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

const styles = {
    searchInput: {
        width: "100%", padding: "0.6rem 1rem", marginBottom: "1rem",
        borderRadius: "8px", border: "1px solid #e5e7eb",
        fontSize: "0.95rem", outline: "none", backgroundColor: "#f9fafb",
        boxSizing: "border-box",
    },
    filtersRow: {
        display: "flex", gap: "0.75rem", marginBottom: "1.25rem",
    },
    selectWrapper: { position: "relative", flex: 1, minWidth: 0 },
    selectLabel: {
        margin: "0 0 0.3rem 0", fontSize: "0.72rem",
        fontWeight: "700", color: "#9ca3af",
        textTransform: "uppercase", letterSpacing: "0.05em",
    },
    selectTrigger: {
        width: "100%", padding: "0.55rem 1rem",
        borderRadius: "10px", border: "1.5px solid",
        fontSize: "0.82rem", fontWeight: "600", cursor: "pointer",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: "0.5rem", boxSizing: "border-box",
    },
    selectArrow: { fontSize: "0.65rem", opacity: 0.7 },
    dropdown: {
        position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
        backgroundColor: "white", borderRadius: "10px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
        border: "1px solid #e5e7eb", zIndex: 100,
        overflow: "hidden",
    },
    dropdownItem: {
        padding: "0.6rem 1rem", cursor: "pointer", fontSize: "0.88rem",
        fontWeight: "500", display: "flex", alignItems: "center", gap: "0.6rem",
    },
    dot: { width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0 },
    list: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" },
    item: { backgroundColor: "#f9fafb", borderRadius: "10px", border: "1px solid #e5e7eb" },
    itemInner: { padding: "0.9rem 1.1rem" },
    mainRow: { display: "flex", alignItems: "center", gap: "0.75rem" },
    titleBlock: { display: "flex", flexDirection: "column", gap: "0.2rem", flex: 1 },
    title: { fontSize: "1rem", textAlign: "left" },
    description: {
        fontSize: "0.82rem", color: "#6b7280", textAlign: "left",
        display: "-webkit-box", WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical", overflow: "hidden",
    },
    actions: { display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 },
    categoryBadge: {
        fontSize: "0.75rem", fontWeight: "600",
        padding: "0.25rem 0.65rem", borderRadius: "20px",
    },
    statusSelect: {
        padding: "0.3rem 0.6rem", borderRadius: "20px",
        border: "1px solid", fontSize: "0.8rem", fontWeight: "600",
        cursor: "pointer", outline: "none", appearance: "none",
        paddingRight: "1.5rem",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23666'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 0.5rem center",
    },
    message: { textAlign: "center", color: "#999", marginTop: "2rem" },
};