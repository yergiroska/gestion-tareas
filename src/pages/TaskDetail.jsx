import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { subscribeTask, updateTask, deleteTask } from "../services/taskService";
import { CATEGORIES } from "../constants/categories";
import { STATUSES } from "../constants/statuses";
import { PRIORITIES } from "../constants/priorities";
import { useAuth } from "../context/AuthContext";

export default function TaskDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [task, setTask]               = useState(null);
    const [loading, setLoading]         = useState(true);
    const [saving, setSaving]           = useState(false);
    const [error, setError]             = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [status, setStatus]     = useState("");
    const [category, setCategory] = useState("");
    const [priority, setPriority] = useState("");
    const [dueDate, setDueDate]   = useState("");

    useEffect(() => {
        const unsubscribe = subscribeTask(id, (data) => {
            if (!data) { navigate("/dashboard"); return; }
            if (data.userId !== user.uid) { navigate("/dashboard"); return; }
            setTask(data);
            setStatus(data.status);
            setCategory(data.category);
            setPriority(data.priority);
            setDueDate(data.dueDate ?? "");
            setLoading(false);
        });
        return () => unsubscribe();
    }, [id]);

    const handleSave = async () => {
        setSaving(true);
        setError("");
        try {
            await updateTask(id, { status, category, priority, dueDate });
            setTimeout(() => navigate("/dashboard"), 800);
        } catch (e) {
            setError("Error al guardar los cambios.");
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        await deleteTask(id);
        navigate("/dashboard");
    };

    const handleCancel = () => navigate("/dashboard");

    const formatDate = (ts) => {
        if (!ts) return "—";
        const date = ts.toDate ? ts.toDate() : new Date(ts);
        return date.toLocaleDateString("es-ES", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    };

    if (loading) return <div style={styles.loading}>Cargando tarea...</div>;

    const isDone          = ["completada", "cancelada"].includes(status);
    const currentStatus   = STATUSES.find(s => s.id === status);
    const currentCategory = CATEGORIES.find(c => c.id === category);
    const currentPriority = PRIORITIES.find(p => p.id === priority);

    return (
        <div style={styles.page}>
            {/* Modal de confirmación de eliminación */}
            {showDeleteModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalIcon}>🗑️</div>
                        <h3 style={styles.modalTitle}>Eliminar tarea</h3>
                        <p style={styles.modalText}>
                            ¿Estás segura de que quieres eliminar <strong>"{task.title}"</strong>? Esta acción no se puede deshacer.
                        </p>
                        <div style={styles.modalBtns}>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                style={styles.modalCancelBtn}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                style={styles.modalDeleteBtn}
                            >
                                Sí, eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <header style={styles.header}>
                <button onClick={handleCancel} style={styles.backBtn}>← Volver</button>
                <h1 style={styles.headerTitle}>Detalle de tarea</h1>
            </header>

            <main style={styles.main}>
                {/* Info */}
                <div style={styles.card}>
                    <h2 style={{
                        ...styles.taskTitle,
                        textDecoration: isDone ? "line-through" : "none",
                        color: isDone ? "#9ca3af" : "#1f2937",
                    }}>
                        {task.title}
                    </h2>
                    {task.description && (
                        <p style={styles.taskDescription}>{task.description}</p>
                    )}
                    <div style={styles.metaRow}>
                        <span style={styles.metaItem}>📅 Creada: {formatDate(task.createdAt)}</span>
                        {task.updatedAt && (
                            <span style={styles.metaItem}>✏️ Actualizada: {formatDate(task.updatedAt)}</span>
                        )}
                        <span style={styles.metaItem}>👤 {user.email}</span>
                    </div>
                </div>

                {/* Formulario */}
                <div style={styles.card}>
                    <h3 style={styles.sectionTitle}>Editar tarea</h3>

                    <p style={styles.fieldLabel}>Estado</p>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        style={{
                            ...styles.select,
                            backgroundColor: currentStatus?.bg ?? "#f9fafb",
                            color: currentStatus?.color ?? "#374151",
                            borderColor: (currentStatus?.color ?? "#e5e7eb") + "80",
                        }}
                    >
                        {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>

                    <p style={styles.fieldLabel}>Categoría</p>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        style={{
                            ...styles.select,
                            backgroundColor: currentCategory ? currentCategory.color + "20" : "#f9fafb",
                            color: currentCategory?.color ?? "#374151",
                            borderColor: (currentCategory?.color ?? "#e5e7eb") + "80",
                        }}
                    >
                        {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>

                    <p style={styles.fieldLabel}>Prioridad</p>
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        style={{
                            ...styles.select,
                            backgroundColor: currentPriority?.bg ?? "#f9fafb",
                            color: currentPriority?.color ?? "#374151",
                            borderColor: (currentPriority?.color ?? "#e5e7eb") + "80",
                        }}
                    >
                        {PRIORITIES.map(p => <option key={p.id} value={p.id}>{p.icon} {p.label}</option>)}
                    </select>

                    <p style={styles.fieldLabel}>Fecha límite</p>
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        style={styles.dateInput}
                    />

                    {error && <p style={styles.error}>{error}</p>}

                    <div style={styles.btnRow}>
                        {task.status === "pendiente" && (
                            <button onClick={() => setShowDeleteModal(true)} style={styles.deleteBtn}>
                                🗑️ Eliminar tarea
                            </button>
                        )}
                        <div style={styles.btnRowRight}>
                            <button onClick={handleCancel} style={styles.cancelBtn}>Cancelar</button>
                            <button onClick={handleSave} disabled={saving} style={styles.saveBtn}>
                                {saving ? "Guardando..." : "Guardar cambios"}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

const styles = {
    page: { minHeight: "100vh", backgroundColor: "#f0f2f5" },
    loading: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#6b7280" },
    modalOverlay: {
        position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
        padding: "1rem",
    },
    modal: {
        backgroundColor: "white", borderRadius: "16px", padding: "2rem",
        maxWidth: "420px", width: "100%", textAlign: "center",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    },
    modalIcon: { fontSize: "2.5rem", marginBottom: "0.75rem" },
    modalTitle: { margin: "0 0 0.5rem 0", fontSize: "1.2rem", fontWeight: "700", color: "#1f2937" },
    modalText: { margin: "0 0 1.5rem 0", fontSize: "0.95rem", color: "#6b7280", lineHeight: "1.5" },
    modalBtns: { display: "flex", gap: "0.75rem", justifyContent: "center" },
    modalCancelBtn: {
        padding: "0.6rem 1.5rem", backgroundColor: "#f3f4f6",
        border: "none", borderRadius: "8px", cursor: "pointer",
        fontWeight: "600", color: "#374151", fontSize: "0.95rem",
    },
    modalDeleteBtn: {
        padding: "0.6rem 1.5rem", backgroundColor: "#dc2626",
        color: "white", border: "none", borderRadius: "8px",
        cursor: "pointer", fontWeight: "700", fontSize: "0.95rem",
    },
    header: {
        display: "flex", alignItems: "center", gap: "1rem",
        padding: "0.75rem 1.5rem", backgroundColor: "white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        position: "sticky", top: 0, zIndex: 10,
    },
    backBtn: {
        padding: "0.4rem 1rem", backgroundColor: "#f3f4f6",
        border: "none", borderRadius: "8px", cursor: "pointer",
        fontWeight: "600", color: "#374151", fontSize: "0.9rem",
    },
    headerTitle: { margin: 0, fontSize: "1.1rem", color: "#4f46e5", fontWeight: "700" },
    main: { maxWidth: "700px", margin: "2rem auto", padding: "0 1rem", display: "flex", flexDirection: "column", gap: "1.5rem" },
    card: { backgroundColor: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
    taskTitle: { margin: "0 0 0.5rem 0", fontSize: "1.4rem", fontWeight: "700", textAlign: "center" },
    taskDescription: { color: "#6b7280", fontSize: "0.95rem", margin: "0 0 1rem 0", lineHeight: "1.5", textAlign: "center" },
    metaRow: { display: "flex", flexDirection: "column", gap: "0.3rem", borderTop: "1px solid #f3f4f6", paddingTop: "0.75rem" },
    metaItem: { fontSize: "0.82rem", color: "#9ca3af" },
    sectionTitle: { margin: "0 0 1.25rem 0", fontSize: "1rem", fontWeight: "700", color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" },
    fieldLabel: { margin: "0 0 0.4rem 0", fontSize: "0.75rem", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" },
    select: {
        width: "100%", padding: "0.65rem 1rem", borderRadius: "8px",
        border: "1.5px solid", fontSize: "0.95rem", fontWeight: "600",
        cursor: "pointer", outline: "none", marginBottom: "1.25rem",
        boxSizing: "border-box",
    },
    dateInput: {
        width: "100%", padding: "0.65rem 1rem", borderRadius: "8px",
        border: "1.5px solid #e5e7eb", fontSize: "0.95rem", outline: "none",
        backgroundColor: "#f9fafb", marginBottom: "1.25rem",
        boxSizing: "border-box", cursor: "pointer",
    },
    error: { color: "#ef4444", fontSize: "0.9rem", marginBottom: "0.75rem" },
    btnRow: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" },
    btnRowRight: { display: "flex", gap: "0.75rem" },
    deleteBtn: {
        padding: "0.6rem 1.25rem", backgroundColor: "#fee2e2",
        color: "#dc2626", border: "1.5px solid #dc262640",
        borderRadius: "8px", cursor: "pointer", fontWeight: "600",
        fontSize: "0.95rem",
    },
    cancelBtn: { padding: "0.6rem 1.25rem", backgroundColor: "#f3f4f6", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", color: "#374151", fontSize: "0.95rem" },
    saveBtn: { padding: "0.6rem 1.5rem", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "0.95rem" },
};