# HabitFlow Backend

API REST para la aplicación de tracking de hábitos HabitFlow.

## Stack

Node.js · Express 5 · MongoDB · Mongoose 9 · JWT · bcrypt · cookie-parser

## Variables de entorno

Crear archivo `.env` en la raíz del proyecto:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?appName=Cluster0
CLIENT_URL=http://localhost:5173
PORT=8000
JWT_SECRET=tu_secreto
```

## Instalación

```bash
npm install
npm run dev
```

## Scripts

| Comando       | Descripción                        |
|---------------|------------------------------------|
| `npm run dev` | Inicia el servidor con nodemon     |
| `npm start`   | Inicia el servidor con node        |

## Endpoints

### Auth (`/api/`)

| Método | Ruta       | Descripción           | Auth |
|--------|------------|-----------------------|------|
| POST   | `/register`  | Registrar usuario   | No   |
| POST   | `/login`     | Iniciar sesión      | No   |
| POST   | `/refresh`   | Refrescar token     | No   |
| POST   | `/logout`    | Cerrar sesión       | No   |
| GET    | `/me`        | Obtener usuario actual | Cookie |

### Habits (`/api/`)

Todas requieren token vía cookie httpOnly o header `Authorization: Bearer <token>`.

| Método | Ruta               | Descripción                |
|--------|--------------------|----------------------------|
| GET    | `/habits`          | Listar hábitos del usuario |
| GET    | `/habits/:id`      | Obtener un hábito          |
| POST   | `/habits`          | Crear un hábito            |
| PUT    | `/habits/:id`      | Actualizar título          |
| PUT    | `/habits/:id/check`| Marcar/desmarcar día       |
| DELETE | `/habits/:id`      | Eliminar hábito            |

## Autenticación

- Login genera un **access token** (30 min) y un **refresh token** (30 días)
- Ambos se almacenan en cookies httpOnly
- El endpoint `/me` renueva automáticamente el access token si expiró y el refresh token aún es válido
- Logout limpia ambas cookies

## Deploy

Compatible con Render, Railway, Fly.io, etc. Asegurar que las variables de entorno estén configuradas y que `CLIENT_URL` apunte al dominio del frontend en producción.
