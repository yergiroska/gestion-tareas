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
        <div style={styles.page}>
            <header style={styles.header}>
                <h1 style={styles.title}>📋 Gestión de Tareas</h1>
                <div style={styles.userInfo}>
                    <span style={styles.email}>{user?.email}</span>
                    <button onClick={handleLogout} style={styles.logoutBtn}>
                        Cerrar sesión
                    </button>
                </div>
            </header>

            <main style={styles.main}>
                <div style={styles.card}>
                    <h2 style={styles.sectionTitle}>Nueva tarea</h2>
                    <TaskForm />
                </div>
                <div style={styles.card}>
                    <h2 style={styles.sectionTitle}>Mis tareas</h2>
                    <TaskList />
                </div>
            </main>
        </div>
    );
}

const styles = {
    page: { minHeight: "100vh", backgroundColor: "#f0f2f5" },
    header: {
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0.75rem 1.25rem", backgroundColor: "white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        position: "sticky", top: 0, zIndex: 10,
        gap: "0.5rem", overflow: "hidden",
    },
    title: {
        margin: 0, fontSize: "1.1rem", color: "#4f46e5",
        whiteSpace: "nowrap", flexShrink: 0,
    },
    userInfo: {
        display: "flex", alignItems: "center", gap: "0.5rem",
        minWidth: 0, overflow: "hidden",
    },
    email: {
        color: "#666", fontSize: "0.8rem",
        overflow: "hidden", textOverflow: "ellipsis",
        whiteSpace: "nowrap", minWidth: 0, flex: 1,
    },
    logoutBtn: {
        padding: "0.4rem 0.75rem", backgroundColor: "#ef4444", color: "white",
        border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold",
        fontSize: "0.8rem", whiteSpace: "nowrap", flexShrink: 0,
    },
    main: {
        maxWidth: "960px", margin: "2rem auto",
        padding: "0 1rem", display: "flex",
        flexDirection: "column", gap: "1.5rem",
    },
    card: {
        backgroundColor: "white", borderRadius: "12px",
        padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    },
    sectionTitle: {
        margin: "0 0 1rem 0", fontSize: "1rem", fontWeight: "700",
        color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em",
    },
};