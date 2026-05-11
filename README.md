# 📋 Gestión de Tareas

Aplicación web de gestión de tareas personales construida con React y Firebase. Permite crear, organizar y hacer seguimiento de tareas con estados, categorías, prioridades y fechas límite.

🌐 **Demo en vivo:** [gestion-tareas-491606.web.app](https://gestion-tareas-491606.web.app)

---

## ✨ Funcionalidades

- **Autenticación** — Registro e inicio de sesión con email y contraseña mediante Firebase Auth. Rutas protegidas para usuarios autenticados.
- **CRUD de tareas** — Crear tareas con título, descripción, categoría, prioridad y fecha límite. Ver el detalle de cada tarea en su propia página.
- **Workflow de estados** — Cada tarea pasa por estados: Pendiente → En proceso → En pausa → Completada. Las tareas canceladas desaparecen del listado automáticamente.
- **Categorías** — Trabajo, Personal, Estudio, Otro.
- **Prioridades** — Alta 🔴, Media 🟡, Baja 🟢.
- **Fechas límite** — Con indicadores visuales de vencimiento: vencida ⚠️, vence hoy ⏰, o fecha futura 📅.
- **Filtros** — Filtrado por estado, categoría y prioridad con dropdowns personalizados con colores.
- **Buscador** — Búsqueda en tiempo real por título de tarea.
- **Tiempo real** — Las tareas se actualizan instantáneamente con Firestore `onSnapshot`.
- **Eliminar con restricción** — Solo se pueden eliminar tareas en estado Pendiente, con modal de confirmación propio.
- **Fechas de auditoría** — Cada tarea muestra fecha y hora de creación y última actualización.
- **Responsive** — Diseño adaptado para desktop y móvil con CSS Modules y media queries.

---

## 🛠️ Stack tecnológico

| Tecnología | Uso |
|---|---|
| React 18 + Vite | Frontend y bundler |
| Firebase Auth | Autenticación de usuarios |
| Firebase Firestore | Base de datos en tiempo real |
| Firebase Hosting | Despliegue en producción |
| GitHub Actions | CI/CD automatizado |
| CSS Modules | Estilos con media queries |
| React Router v6 | Navegación entre páginas |
| Node.js 22 | Entorno de ejecución |

---

## 🏗️ Estructura del proyecto

```
src/
├── components/
│   ├── PrivateRoute.jsx        # Protección de rutas autenticadas
│   ├── TaskForm.jsx            # Formulario de creación de tareas
│   ├── TaskList.jsx            # Listado con filtros y buscador
│   └── TaskList.module.css     # Estilos responsive del listado
├── constants/
│   ├── categories.js           # Definición de categorías
│   ├── priorities.js           # Definición de prioridades
│   └── statuses.js             # Definición de estados y migración
├── context/
│   └── AuthContext.jsx         # Contexto global de autenticación
├── pages/
│   ├── Login.jsx               # Página de inicio de sesión
│   ├── Register.jsx            # Página de registro
│   ├── Dashboard.jsx           # Página principal
│   └── TaskDetail.jsx          # Página de detalle y edición de tarea
├── services/
│   ├── firebase.js             # Configuración de Firebase
│   └── taskService.js          # Operaciones CRUD con Firestore
├── App.jsx                     # Rutas de la aplicación
└── main.jsx                    # Punto de entrada
```

---

## 🚀 Instalación y uso local

### Requisitos

- Node.js 22+
- Cuenta de Firebase con proyecto configurado

### Pasos

1. Clona el repositorio:
```bash
git clone https://github.com/yergiroska/gestion-tareas.git
cd gestion-tareas
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea un archivo `.env` en la raíz con tus credenciales de Firebase:
```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

---

## ⚙️ CI/CD

El proyecto usa GitHub Actions para despliegue automático. Cada push a `main` ejecuta el pipeline que instala dependencias, construye la app y despliega en Firebase Hosting.

Las credenciales de Firebase están configuradas como GitHub Secrets para no exponerlas en el repositorio.

---

## 🗄️ Base de datos

Firestore (región: `europe-southwest1` — Madrid) con una colección `tasks`. Cada documento tiene la siguiente estructura:

```json
{
  "userId": "uid del usuario",
  "title": "Título de la tarea",
  "description": "Descripción detallada",
  "status": "pendiente | en_proceso | pausa | completada | cancelada",
  "category": "trabajo | personal | estudio | otro",
  "priority": "alta | media | baja",
  "dueDate": "YYYY-MM-DD",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

Las reglas de seguridad de Firestore garantizan que cada usuario solo puede leer y escribir sus propias tareas.

---

## 👩‍💻 Autora

**Yergiroska** — Proyecto de portfolio para perfil de Data Engineer con stack full-stack.