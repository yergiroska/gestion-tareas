import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await login(email, password);
            navigate("/dashboard");
        } catch (err) {
            setError("Correo o contraseña incorrectos.");
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Iniciar sesión</h2>
                {error && <p style={styles.error}>{error}</p>}
                <form onSubmit={handleSubmit} style={styles.form}>
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.input}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                        required
                    />
                    <button type="submit" style={styles.button}>
                        Entrar
                    </button>
                </form>
                <p style={styles.link}>
                    ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: "flex", justifyContent: "center",
        alignItems: "center", height: "100vh", backgroundColor: "#f0f2f5",
    },
    card: {
        background: "white", padding: "2rem", borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)", width: "100%", maxWidth: "400px",
    },
    title: { textAlign: "center", marginBottom: "1.5rem", color: "#333" },
    form: { display: "flex", flexDirection: "column", gap: "1rem" },
    input: {
        padding: "0.75rem", borderRadius: "8px",
        border: "1px solid #ddd", fontSize: "1rem",
    },
    button: {
        padding: "0.75rem", backgroundColor: "#4f46e5", color: "white",
        border: "none", borderRadius: "8px", fontSize: "1rem",
        cursor: "pointer", fontWeight: "bold",
    },
    error: { color: "red", textAlign: "center", marginBottom: "0.5rem" },
    link: { textAlign: "center", marginTop: "1rem", color: "#666" },
};