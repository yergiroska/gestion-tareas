import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>📋 Gestión de Tarea</h1>
                <div style={styles.userInfo}>
                    <span style={styles.email}>{user?.email}</span>
                    <button onClick={handleLogout} style={styles.button}>
                        Cerrar sesión
                    </button>
                </div>
            </div>
            <div style={styles.content}>
                <TaskForm />
                <TaskList />
            </div>
        </div>
    );
}

const styles = {
    container: { minHeight: "100vh", backgroundColor: "#f0f2f5" },
    header: {
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "1rem 2rem", backgroundColor: "white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },
    title: { margin: 0, color: "#4f46e5" },
    userInfo: { display: "flex", alignItems: "center", gap: "1rem" },
    email: { color: "#666", fontSize: "0.9rem" },
    button: {
        padding: "0.5rem 1rem", backgroundColor: "#ef4444", color: "white",
        border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold",
    },
    content: {
        display: "flex", justifyContent: "center",
        alignItems: "center", height: "calc(100vh - 70px)",
    },
    welcome: { color: "#666", fontSize: "1.2rem" },
};