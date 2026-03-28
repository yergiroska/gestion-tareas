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
} from "firebase/firestore";
import { db } from "./firebase";

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
        }));
        callback(tasks);
    });
};

export const createTask = (userId, task) =>
    addDoc(collection(db, COLLECTION), {
        ...task,
        userId,
        completed: false,
        createdAt: serverTimestamp(),
    });

export const updateTask = (taskId, data) =>
    updateDoc(doc(db, COLLECTION, taskId), data);

export const deleteTask = (taskId) =>
    deleteDoc(doc(db, COLLECTION, taskId));