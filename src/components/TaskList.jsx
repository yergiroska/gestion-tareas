import { useEffect, useState } from "react";
import { subscribeTasks } from "../services/taskService";
import { useAuth } from "../context/AuthContext";

export default function TaskList() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeTasks(user.uid, (tasks) => {
            setTasks(tasks);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user.uid]);

    if (loading) return <p style={styles.message}>Cargando tareas...</p>;
    if (tasks.length === 0) return <p style={styles.message}>No tienes tareas aún.</p>;

    return (
        <ul style={styles.list}>
            {tasks.map((task) => (
                <li key={task.id} style={styles.item}>
                    <span style={styles.title}>{task.title}</span>
                    <span style={{
                        ...styles.badge,
                        backgroundColor: task.completed ? "#dcfce7" : "#fef9c3",
                        color: task.completed ? "#16a34a" : "#ca8a04",
                    }}>
            {task.completed ? "✅ Completada" : "⏳ Pendiente"}
          </span>
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
    title: { fontSize: "1rem", color: "#333" },
    badge: {
        fontSize: "0.8rem", fontWeight: "bold",
        padding: "0.3rem 0.75rem", borderRadius: "20px",
    },
    message: { textAlign: "center", color: "#999", marginTop: "2rem" },
};