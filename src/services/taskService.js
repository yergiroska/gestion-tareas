import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    getDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { migrateStatus } from "../constants/statuses";

const COLLECTION = "tasks";

export const subscribeTasks = (userId, callback) => {
    const q = query(
        collection(db, COLLECTION),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snapshot) => {
        const tasks = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            category: doc.data().category ?? "otro",
            status: migrateStatus({ ...doc.data() }),
            priority: doc.data().priority ?? "media",
        }));
        callback(tasks);
    });
};

// Escucha una tarea en tiempo real por ID
export const subscribeTask = (taskId, callback) => {
    return onSnapshot(doc(db, COLLECTION, taskId), (snap) => {
        if (!snap.exists()) return callback(null);
        const data = snap.data();
        callback({
            id: snap.id,
            ...data,
            category: data.category ?? "otro",
            status: migrateStatus({ ...data }),
            priority: data.priority ?? "media",
        });
    });
};

// Obtener una tarea una sola vez por ID
export const getTaskById = async (taskId) => {
    const snap = await getDoc(doc(db, COLLECTION, taskId));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
        id: snap.id,
        ...data,
        category: data.category ?? "otro",
        status: migrateStatus({ ...data }),
        priority: data.priority ?? "media",
    };
};

export const createTask = (userId, task) =>
    addDoc(collection(db, COLLECTION), {
        ...task,
        userId,
        status: "pendiente",
        createdAt: serverTimestamp(),
    });

export const updateTask = (taskId, data) =>
    updateDoc(doc(db, COLLECTION, taskId), {
        ...data,
        updatedAt: serverTimestamp(),
    });

export const deleteTask = (taskId) =>
    deleteDoc(doc(db, COLLECTION, taskId));