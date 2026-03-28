import { useState } from "react";
import { createTask } from "../services/taskService";
import { useAuth } from "../context/AuthContext";

export default function TaskForm() {
    const { user } = useAuth();
    const [title, setTitle] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return setError("El título es obligatorio.");
        setError("");
        setLoading(true);
        try {
            await createTask(user.uid, { title: title.trim() });
            setTitle("");
        } catch (err) {
            setError("Error al crear la tarea.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleSubmit} style={styles.form}>
                <input
                    type="text"
                    placeholder="Nueva tarea..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={styles.input}
                />
                <button type="submit" disabled={loading} style={styles.button}>
                    {loading ? "Guardando..." : "+ Añadir"}
                </button>
            </form>
            {error && <p style={styles.error}>{error}</p>}
        </div>
    );
}

const styles = {
    container: { marginBottom: "1.5rem" },
    form: { display: "flex", gap: "0.75rem" },
    input: {
        flex: 1, padding: "0.75rem", borderRadius: "8px",
        border: "1px solid #ddd", fontSize: "1rem",
    },
    button: {
        padding: "0.75rem 1.25rem", backgroundColor: "#4f46e5",
        color: "white", border: "none", borderRadius: "8px",
        fontSize: "1rem", cursor: "pointer", fontWeight: "bold",
    },
    error: { color: "red", marginTop: "0.5rem" },
};