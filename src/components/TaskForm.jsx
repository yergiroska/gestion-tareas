import { useState } from "react";
import { createTask } from "../services/taskService";
import { useAuth } from "../context/AuthContext";
import { CATEGORIES, DEFAULT_CATEGORY } from "../constants/categories";
import { PRIORITIES, DEFAULT_PRIORITY } from "../constants/priorities";

export default function TaskForm() {
    const { user } = useAuth();
    const [title, setTitle]             = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory]       = useState(DEFAULT_CATEGORY);
    const [priority, setPriority]       = useState(DEFAULT_PRIORITY);
    const [dueDate, setDueDate]         = useState("");
    const [error, setError]             = useState("");
    const [loading, setLoading]         = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim())       return setError("El título es obligatorio.");
        if (!description.trim()) return setError("La descripción es obligatoria.");
        if (!dueDate)            return setError("La fecha límite es obligatoria.");
        setError("");
        setLoading(true);
        try {
            await createTask(user.uid, {
                title: title.trim(),
                description: description.trim(),
                category,
                priority,
                dueDate,
            });
            setTitle("");
            setDescription("");
            setCategory(DEFAULT_CATEGORY);
            setPriority(DEFAULT_PRIORITY);
            setDueDate("");
        } catch (err) {
            setError("Error al crear la tarea.");
        } finally {
            setLoading(false);
        }
    };

    // Fecha mínima = hoy
    const today = new Date().toISOString().split("T")[0];

    return (
        <div>
            <p style={styles.fieldLabel}>Categoría</p>
            <div style={styles.pillRow}>
                {CATEGORIES.map((cat) => {
                    const isActive = category === cat.id;
                    return (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setCategory(cat.id)}
                            style={{
                                ...styles.pill,
                                backgroundColor: isActive ? cat.color : "#f3f4f6",
                                color: isActive ? "white" : "#6b7280",
                                border: `2px solid ${isActive ? cat.color : "transparent"}`,
                            }}
                        >
                            {cat.label}
                        </button>
                    );
                })}
            </div>

            <p style={styles.fieldLabel}>Prioridad</p>
            <div style={styles.pillRow}>
                {PRIORITIES.map((p) => {
                    const isActive = priority === p.id;
                    return (
                        <button
                            key={p.id}
                            type="button"
                            onClick={() => setPriority(p.id)}
                            style={{
                                ...styles.pill,
                                backgroundColor: isActive ? p.color : "#f3f4f6",
                                color: isActive ? "white" : "#6b7280",
                                border: `2px solid ${isActive ? p.color : "transparent"}`,
                            }}
                        >
                            {p.icon} {p.label}
                        </button>
                    );
                })}
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
                <p style={styles.fieldLabel}>Título</p>
                <input
                    type="text"
                    placeholder="Título de la tarea *"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={styles.input}
                />
                <p style={styles.fieldLabel}>Descripción</p>
                <textarea
                    placeholder="Descripción de la tarea *"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={styles.textarea}
                    rows={3}
                />
                <p style={styles.fieldLabel}>📅 Fecha límite *</p>
                <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    onClick={(e) => e.target.showPicker?.()}
                    style={styles.dateInput}
                />
                <button type="submit" disabled={loading} style={styles.submitBtn}>
                    {loading ? "Guardando..." : "+ Añadir"}
                </button>
            </form>
            {error && <p style={styles.error}>{error}</p>}
        </div>
    );
}

const styles = {
    fieldLabel: {
        margin: "0 0 0.4rem 0", fontSize: "0.75rem",
        fontWeight: "700", color: "#9ca3af",
        textTransform: "uppercase", letterSpacing: "0.05em",
        textAlign: "left",
    },
    pillRow: { display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" },
    pill: {
        padding: "0.35rem 1rem", borderRadius: "20px",
        fontSize: "0.85rem", fontWeight: "600", cursor: "pointer",
        transition: "all 0.15s",
    },
    form: { display: "flex", flexDirection: "column", gap: "0.75rem" },
    input: {
        padding: "0.75rem 1rem", borderRadius: "8px",
        border: "1px solid #e5e7eb", fontSize: "1rem", outline: "none",
        backgroundColor: "white", color: "#1f2937",
    },
    textarea: {
        padding: "0.75rem 1rem", borderRadius: "8px",
        border: "1px solid #e5e7eb", fontSize: "0.95rem", outline: "none",
        backgroundColor: "white", color: "#1f2937",
        resize: "vertical", fontFamily: "inherit",
    },
    dateInput: {
        padding: "0.6rem 0.75rem", borderRadius: "8px",
        border: "1px solid #e5e7eb", fontSize: "0.95rem", outline: "none",
        backgroundColor: "white", color: "#1f2937", cursor: "pointer", flex: 1,
    },
    submitBtn: {
        padding: "0.75rem 1.5rem", backgroundColor: "#4f46e5",
        color: "white", border: "none", borderRadius: "8px",
        fontSize: "1rem", cursor: "pointer", fontWeight: "bold",
        alignSelf: "flex-end",
    },
    error: { color: "#ef4444", marginTop: "0.5rem", fontSize: "0.9rem" },
};