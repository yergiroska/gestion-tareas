import { useState } from "react";
import { createTask } from "../services/taskService";
import { useAuth } from "../context/AuthContext";
import { CATEGORIES, DEFAULT_CATEGORY } from "../constants/categories";

export default function TaskForm() {
    const { user } = useAuth();
    const [title, setTitle]             = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory]       = useState(DEFAULT_CATEGORY);
    const [error, setError]             = useState("");
    const [loading, setLoading]         = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim())       return setError("El título es obligatorio.");
        if (!description.trim()) return setError("La descripción es obligatoria.");
        setError("");
        setLoading(true);
        try {
            await createTask(user.uid, {
                title: title.trim(),
                description: description.trim(),
                category,
            });
            setTitle("");
            setDescription("");
            setCategory(DEFAULT_CATEGORY);
        } catch (err) {
            setError("Error al crear la tarea.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Selector de categoría */}
            <div style={styles.categoryRow}>
                {CATEGORIES.map((cat) => {
                    const isActive = category === cat.id;
                    return (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setCategory(cat.id)}
                            style={{
                                ...styles.categoryBtn,
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

            <form onSubmit={handleSubmit} style={styles.form}>
                {/* Título */}
                <input
                    type="text"
                    placeholder="Título de la tarea *"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={styles.input}
                />
                {/* Descripción */}
                <textarea
                    placeholder="Descripción de la tarea *"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={styles.textarea}
                    rows={3}
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
    categoryRow: {
        display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem",
    },
    categoryBtn: {
        padding: "0.35rem 1rem", borderRadius: "20px",
        fontSize: "0.85rem", fontWeight: "600", cursor: "pointer",
        transition: "all 0.15s",
    },
    form: {
        display: "flex", flexDirection: "column", gap: "0.75rem",
    },
    input: {
        padding: "0.75rem 1rem", borderRadius: "8px",
        border: "1px solid #e5e7eb", fontSize: "1rem", outline: "none",
        backgroundColor: "#f9fafb",
    },
    textarea: {
        padding: "0.75rem 1rem", borderRadius: "8px",
        border: "1px solid #e5e7eb", fontSize: "0.95rem", outline: "none",
        backgroundColor: "#f9fafb", resize: "vertical", fontFamily: "inherit",
    },
    submitBtn: {
        padding: "0.75rem 1.5rem", backgroundColor: "#4f46e5",
        color: "white", border: "none", borderRadius: "8px",
        fontSize: "1rem", cursor: "pointer", fontWeight: "bold",
        alignSelf: "flex-end",
    },
    error: { color: "#ef4444", marginTop: "0.5rem", fontSize: "0.9rem" },
};