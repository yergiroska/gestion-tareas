import { useEffect, useState } from "react";
import {subscribeTasks, updateTask, deleteTask} from "../services/taskService";
import { useAuth } from "../context/AuthContext";

export default function TaskList() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState("");

    useEffect(() => {
        const unsubscribe = subscribeTasks(user.uid, (tasks) => {
            setTasks(tasks);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user.uid]);

    const toggleComplete = async (task) => {
        await updateTask(task.id, { completed: !task.completed });
    };

    const handleDelete = async (taskId) => {
        if (!window.confirm("¿Eliminar esta tarea?")) return;
        await deleteTask(taskId);
    };

    const startEditing = (task) => {
        setEditingId(task.id);
        setEditingTitle(task.title);
    };

    const handleEdit = async (taskId) => {
        if (!editingTitle.trim()) return;
        await updateTask(taskId, { title: editingTitle.trim() });
        setEditingId(null);
        setEditingTitle("");
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingTitle("");
    };

    if (loading) return <p style={styles.message}>Cargando tareas...</p>;
    if (tasks.length === 0) return <p style={styles.message}>No tienes tareas aún.</p>;

    return (
        <ul style={styles.list}>
            {tasks.map((task) => (
                <li key={task.id} style={styles.item}>
                    <div style={styles.left}>
                        <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleComplete(task)}
                            style={styles.checkbox}
                        />
                        {editingId === task.id ? (
                            <div style={styles.editContainer}>
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
                                <button onClick={() => handleEdit(task.id)} style={styles.saveBtn}>✔️</button>
                                <button onClick={cancelEdit} style={styles.cancelBtn}>✖️</button>
                            </div>
                        ) : (
                            <span style={{
                                ...styles.title,
                                textDecoration: task.completed ? "line-through" : "none",
                                color: task.completed ? "#999" : "#333",
                            }}>
                                {task.title}
                            </span>
                        )}
                    </div>
                    <div style={styles.right}>
                        <span style={{
                            ...styles.badge,
                            backgroundColor: task.completed ? "#dcfce7" : "#fef9c3",
                            color: task.completed ? "#16a34a" : "#ca8a04",
                        }}>
                          {task.completed ? "✅ Completada" : "⏳ Pendiente"}
                        </span>
                        {editingId !== task.id && (
                            <button onClick={() => startEditing(task)} style={styles.editBtn}>✏️</button>
                        )}
                        <button onClick={() => handleDelete(task.id)} style={styles.deleteBtn}>🗑️</button>
                    </div>
                </li>
            ))}
        </ul>
    );
}

const styles = {
    list: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" },
    item: {
        display: "flex", justifyContent: "space-between", alignItems: "center",
        backgroundColor: "white", padding: "1rem 1.25rem",
        borderRadius: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
    },
    left: { display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 },
    right: { display: "flex", alignItems: "center", gap: "0.75rem" },
    checkbox: { width: "18px", height: "18px", cursor: "pointer" },
    title: { fontSize: "1rem" },
    editContainer: { display: "flex", alignItems: "center", gap: "0.5rem", flex: 1 },
    editInput: {
        flex: 1, padding: "0.4rem 0.75rem", borderRadius: "6px",
        border: "1px solid #4f46e5", fontSize: "1rem", outline: "none",
    },
    saveBtn: { background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" },
    cancelBtn: { background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" },
    editBtn: { background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" },
    deleteBtn: { background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" },
    badge: {
        fontSize: "0.8rem", fontWeight: "bold",
        padding: "0.3rem 0.75rem", borderRadius: "20px",
    },
    message: { textAlign: "center", color: "#999", marginTop: "2rem" },
};