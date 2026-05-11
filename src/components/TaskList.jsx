import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { subscribeTasks } from "../services/taskService";
import { useAuth } from "../context/AuthContext";
import { CATEGORIES, getCategoryById } from "../constants/categories";
import { STATUSES, getStatusById } from "../constants/statuses";
import { PRIORITIES, getPriorityById } from "../constants/priorities";
import css from "./TaskList.module.css";

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
                <span>{value === ALL ? "Todas" : options.find(o => o.id === value)?.label}</span>
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
                                {opt.icon ? `${opt.icon} ` : ""}{opt.label} ({opt._count ?? 0})
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
    const navigate = useNavigate();
    const [tasks, setTasks]                   = useState([]);
    const [loading, setLoading]               = useState(true);
    const [categoryFilter, setCategoryFilter] = useState(ALL);
    const [statusFilter, setStatusFilter]     = useState(ALL);
    const [priorityFilter, setPriorityFilter] = useState(ALL);
    const [searchQuery, setSearchQuery]       = useState("");

    useEffect(() => {
        const unsubscribe = subscribeTasks(user.uid, (tasks) => {
            setTasks(tasks);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user.uid]);

    const visibleTasks = tasks.filter(t => t.status !== "cancelada");
    const byCategory = categoryFilter === ALL ? visibleTasks : visibleTasks.filter(t => t.category === categoryFilter);
    const byStatus      = statusFilter === ALL   ? byCategory  : byCategory.filter(t => t.status === statusFilter);
    const byPriority    = priorityFilter === ALL ? byStatus    : byStatus.filter(t => t.priority === priorityFilter);
    const filteredTasks = searchQuery.trim() === ""
        ? byPriority
        : byPriority.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const statusesWithCount   = STATUSES.map(s => ({ ...s, _count: visibleTasks.filter(t => t.status === s.id).length }));
    const categoriesWithCount = CATEGORIES.map(c => ({ ...c, _count: visibleTasks.filter(t => t.category === c.id).length }));
    const prioritiesWithCount = PRIORITIES.map(p => ({ ...p, _count: visibleTasks.filter(t => t.priority === p.id).length }));

    if (loading) return <p style={styles.message}>Cargando tareas...</p>;

    return (
        <div>
            <input
                type="text"
                placeholder="🔍 Buscar tarea..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
            />

            <div style={styles.filtersRow}>
                <CustomSelect value={statusFilter}   onChange={setStatusFilter}   options={statusesWithCount}   allLabel="Estado"    allCount={tasks.length} />
                <CustomSelect value={categoryFilter} onChange={setCategoryFilter} options={categoriesWithCount} allLabel="Categoría" allCount={tasks.length} />
                <CustomSelect value={priorityFilter} onChange={setPriorityFilter} options={prioritiesWithCount} allLabel="Prioridad" allCount={tasks.length} />
            </div>

            {filteredTasks.length === 0 ? (
                <p style={styles.message}>{searchQuery ? "No hay tareas que coincidan." : "No hay tareas aquí."}</p>
            ) : (
                <ul className={css.list}>
                    {filteredTasks.map((task) => {
                        const cat      = getCategoryById(task.category);
                        const status   = getStatusById(task.status);
                        const priority = getPriorityById(task.priority);
                        const isDone   = ["completada", "cancelada"].includes(task.status);

                        return (
                            <li
                                key={task.id}
                                className={css.item}
                                onClick={() => navigate(`/tarea/${task.id}`)}
                            >
                                <div className={css.itemInner}>
                                    <div className={css.mainRow}>
                                        <div className={css.titleBlock}>
                                            <span className={css.title} style={{
                                                textDecoration: isDone ? "line-through" : "none",
                                                color: isDone ? "#9ca3af" : "#1f2937",
                                            }}>
                                                {task.title}
                                            </span>
                                            {task.description && (
                                                <span className={css.description}>{task.description}</span>
                                            )}
                                            {task.dueDate && (() => {
                                                const today = new Date().toISOString().split("T")[0];
                                                const isOverdue = task.dueDate < today;
                                                const isToday   = task.dueDate === today;
                                                const color = isOverdue ? "#dc2626" : isToday ? "#d97706" : "#6b7280";
                                                const label = isOverdue ? "⚠️ Vencida" : isToday ? "⏰ Hoy" : "📅";
                                                const [y, m, d] = task.dueDate.split("-");
                                                return (
                                                    <span className={css.dueDate} style={{ color }}>
                                        {label} {d}/{m}/{y}
                                                </span>
                                                );
                                            })()}
                                        </div>
                                        <div className={css.actions}>
                                            <span style={{ ...styles.badge, backgroundColor: priority.bg, color: priority.color, border: `1px solid ${priority.color}40` }}>
                                                {priority.icon} {priority.label}
                                            </span>
                                                            <span style={{ ...styles.badge, backgroundColor: cat.color + "20", color: cat.color, border: `1px solid ${cat.color}40` }}>
                                                {cat.label}
                                            </span>
                                                            <span style={{ ...styles.badge, backgroundColor: status.bg, color: status.color, border: `1px solid ${status.color}40` }}>
                                                {status.label}
                                            </span>
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
    filtersRow: { display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap" },
    selectWrapper: { position: "relative", flex: 1, minWidth: 0 },
    selectLabel: { margin: "0 0 0.3rem 0", fontSize: "0.72rem", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" },
    selectTrigger: { width: "100%", padding: "0.5rem 0.6rem", borderRadius: "10px", border: "1.5px solid", fontSize: "0.82rem", fontWeight: "600", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.25rem", boxSizing: "border-box" },
    selectArrow: { fontSize: "0.65rem", opacity: 0.7 },
    dropdown: { position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, backgroundColor: "white", borderRadius: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", border: "1px solid #e5e7eb", zIndex: 100, overflow: "hidden" },
    dropdownItem: { padding: "0.6rem 0.75rem", cursor: "pointer", fontSize: "0.82rem", fontWeight: "500", display: "flex", alignItems: "center", gap: "0.5rem", whiteSpace: "nowrap" },
    dot: { width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0 },
    description: { fontSize: "0.82rem", color: "#6b7280", textAlign: "left", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
    badge: { fontSize: "0.75rem", fontWeight: "600", padding: "0.25rem 0.65rem", borderRadius: "20px", whiteSpace: "nowrap" },
    message: { textAlign: "center", color: "#999", marginTop: "2rem" },
};