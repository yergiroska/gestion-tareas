import { useEffect, useState, useRef } from "react";
import { subscribeTasks, updateTask } from "../services/taskService";
import { useAuth } from "../context/AuthContext";
import { CATEGORIES, getCategoryById } from "../constants/categories";
import { STATUSES, getStatusById } from "../constants/statuses";
import { PRIORITIES, getPriorityById } from "../constants/priorities";

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
    const [tasks, setTasks]                       = useState([]);
    const [loading, setLoading]                   = useState(true);
    const [categoryFilter, setCategoryFilter]     = useState(ALL);
    const [statusFilter, setStatusFilter]         = useState(ALL);
    const [priorityFilter, setPriorityFilter]     = useState(ALL);
    const [searchQuery, setSearchQuery]           = useState("");
    const [editingId, setEditingId]               = useState(null);
    const [editingTitle, setEditingTitle]         = useState("");
    const [editingCategory, setEditingCategory]   = useState("");
    const [editingPriority, setEditingPriority]   = useState("");

    useEffect(() => {
        const unsubscribe = subscribeTasks(user.uid, (tasks) => {
            setTasks(tasks);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user.uid]);

    const handleStatusChange = async (taskId, newStatus) => {
        if (!window.confirm("¿Deseas cambiar el estado de esta tarea?")) return;
        await updateTask(taskId, { status: newStatus });
    };

    const startEditing = (task) => {
        setEditingId(task.id);
        setEditingTitle(task.title);
        setEditingCategory(task.category ?? "otro");
        setEditingPriority(task.priority ?? "media");
    };

    const handleEdit = async (taskId) => {
        if (!editingTitle.trim()) return;
        await updateTask(taskId, {
            title: editingTitle.trim(),
            category: editingCategory,
            priority: editingPriority,
        });
        setEditingId(null);
    };

    const cancelEdit = () => setEditingId(null);

    const byCategory = categoryFilter === ALL ? tasks : tasks.filter(t => t.category === categoryFilter);
    const byStatus   = statusFilter === ALL   ? byCategory : byCategory.filter(t => t.status === statusFilter);
    const byPriority = priorityFilter === ALL ? byStatus   : byStatus.filter(t => t.priority === priorityFilter);
    const filteredTasks = searchQuery.trim() === ""
        ? byPriority
        : byPriority.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const statusesWithCount   = STATUSES.map(s => ({ ...s, _count: tasks.filter(t => t.status === s.id).length }));
    const categoriesWithCount = CATEGORIES.map(c => ({ ...c, _count: tasks.filter(t => t.category === c.id).length }));
    const prioritiesWithCount = PRIORITIES.map(p => ({ ...p, _count: tasks.filter(t => t.priority === p.id).length }));

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
                <CustomSelect value={statusFilter}   onChange={setStatusFilter}   options={statusesWithCount}   allLabel="Estado"     allCount={tasks.length} />
                <CustomSelect value={categoryFilter} onChange={setCategoryFilter} options={categoriesWithCount} allLabel="Categoría"  allCount={tasks.length} />
                <CustomSelect value={priorityFilter} onChange={setPriorityFilter} options={prioritiesWithCount} allLabel="Prioridad"  allCount={tasks.length} />
            </div>

            {filteredTasks.length === 0 ? (
                <p style={styles.message}>{searchQuery ? "No hay tareas que coincidan." : "No hay tareas aquí."}</p>
            ) : (
                <ul style={styles.list}>
                    {filteredTasks.map((task) => {
                        const cat      = getCategoryById(task.category);
                        const status   = getStatusById(task.status);
                        const priority = getPriorityById(task.priority);
                        const isDone   = ["completada", "cancelada"].includes(task.status);
                        const isEditing = editingId === task.id;

                        return (
                            <li key={task.id} style={styles.item}>
                                <div style={styles.itemInner}>
                                    {/* Fila principal */}
                                    <div style={styles.mainRow}>
                                        <div style={styles.titleBlock}>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editingTitle}
                                                    onChange={(e) => setEditingTitle(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") handleEdit(task.id);
                                                        if (e.key === "Escape") cancelEdit();
                                                    }}
                                                    style={styles.editInput}
                                                    autoFocus
                                                />
                                            ) : (
                                                <span style={{
                                                    ...styles.title,
                                                    textDecoration: isDone ? "line-through" : "none",
                                                    color: isDone ? "#9ca3af" : "#1f2937",
                                                }}>
                                                    {task.title}
                                                </span>
                                            )}
                                            {!isEditing && task.description && (
                                                <span style={styles.description}>{task.description}</span>
                                            )}
                                            {!isEditing && task.dueDate && (() => {
                                                const today = new Date().toISOString().split("T")[0];
                                                const isOverdue = task.dueDate < today;
                                                const isToday   = task.dueDate === today;
                                                const color = isOverdue ? "#dc2626" : isToday ? "#d97706" : "#6b7280";
                                                const label = isOverdue ? "⚠️ Vencida" : isToday ? "⏰ Hoy" : "📅";
                                                // Formatear fecha a dd/mm/aaaa
                                                const [y, m, d] = task.dueDate.split("-");
                                                return (
                                                    <span style={{ ...styles.dueDate, color }}>
                                                        {label} {d}/{m}/{y}
                                                    </span>
                                                );
                                            })()}
                                        </div>

                                        <div style={styles.actions}>
                                            {!isEditing && (
                                                <>
                                                    <span style={{ ...styles.badge, backgroundColor: priority.bg, color: priority.color, border: `1px solid ${priority.color}40` }}>
                                                        {priority.icon} {priority.label}
                                                    </span>
                                                    <span style={{ ...styles.badge, backgroundColor: cat.color + "20", color: cat.color, border: `1px solid ${cat.color}40` }}>
                                                        {cat.label}
                                                    </span>
                                                    <select
                                                        value={task.status}
                                                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                                        style={{ ...styles.statusSelect, backgroundColor: status.bg, color: status.color, borderColor: status.color + "60" }}
                                                    >
                                                        {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                                    </select>
                                                </>
                                            )}
                                            {isEditing ? (
                                                <>
                                                    <button onClick={() => handleEdit(task.id)} style={styles.iconBtn}>✔️</button>
                                                    <button onClick={cancelEdit} style={styles.iconBtn}>✖️</button>
                                                </>
                                            ) : (
                                                <button onClick={() => startEditing(task)} style={styles.iconBtn}>✏️</button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Panel de edición */}
                                    {isEditing && (
                                        <div style={styles.editPanel}>
                                            <p style={styles.editPanelLabel}>Categoría</p>
                                            <div style={styles.pillRow}>
                                                {CATEGORIES.map(c => (
                                                    <button
                                                        key={c.id}
                                                        type="button"
                                                        onClick={() => setEditingCategory(c.id)}
                                                        style={{
                                                            ...styles.pill,
                                                            backgroundColor: editingCategory === c.id ? c.color : "#e5e7eb",
                                                            color: editingCategory === c.id ? "white" : "#6b7280",
                                                            border: `2px solid ${editingCategory === c.id ? c.color : "#d1d5db"}`,
                                                        }}
                                                    >
                                                        {c.label}
                                                    </button>
                                                ))}
                                            </div>
                                            <p style={styles.editPanelLabel}>Prioridad</p>
                                            <div style={styles.pillRow}>
                                                {PRIORITIES.map(p => (
                                                    <button
                                                        key={p.id}
                                                        type="button"
                                                        onClick={() => setEditingPriority(p.id)}
                                                        style={{
                                                            ...styles.pill,
                                                            backgroundColor: editingPriority === p.id ? p.color : "#e5e7eb",
                                                            color: editingPriority === p.id ? "white" : "#6b7280",
                                                            border: `2px solid ${editingPriority === p.id ? p.color : "#d1d5db"}`,
                                                        }}
                                                    >
                                                        {p.icon} {p.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
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
    dropdownItem: { padding: "0.6rem 1rem", cursor: "pointer", fontSize: "0.88rem", fontWeight: "500", display: "flex", alignItems: "center", gap: "0.6rem" },
    dot: { width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0 },
    list: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" },
    item: { backgroundColor: "#f9fafb", borderRadius: "10px", border: "1px solid #e5e7eb" },
    itemInner: { padding: "0.9rem 1.1rem" },
    mainRow: { display: "flex", alignItems: "flex-start", gap: "0.75rem" },
    titleBlock: { display: "flex", flexDirection: "column", gap: "0.2rem", flex: 1 },
    title: { fontSize: "1rem", textAlign: "left" },
    editInput: { padding: "0.4rem 0.75rem", borderRadius: "6px", border: "1px solid #4f46e5", fontSize: "1rem", outline: "none", width: "100%", boxSizing: "border-box" },
    description: { fontSize: "0.82rem", color: "#6b7280", textAlign: "left", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
    actions: { display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 },
    badge: { fontSize: "0.75rem", fontWeight: "600", padding: "0.25rem 0.65rem", borderRadius: "20px", whiteSpace: "nowrap" },
    statusSelect: { padding: "0.3rem 0.6rem", borderRadius: "20px", border: "1px solid", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer", outline: "none", appearance: "none", paddingRight: "1.5rem", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23666'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 0.5rem center" },
    iconBtn: { background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", padding: "0.25rem 0.5rem" },
    editPanel: { marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #e5e7eb" },
    editPanelLabel: { margin: "0 0 0.4rem 0", fontSize: "0.72rem", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" },
    pillRow: { display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" },
    pill: { padding: "0.3rem 0.85rem", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer", transition: "all 0.15s" },
    message: { textAlign: "center", color: "#999", marginTop: "2rem" },
    dueDate: {
        fontSize: "0.8rem", fontWeight: "600", textAlign: "left",
    },
};