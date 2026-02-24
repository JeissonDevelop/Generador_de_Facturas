# Generador de Facturas Personalizadas

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore-FFCA28?logo=firebase&logoColor=black)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel)
![CI](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)

Aplicación web full-stack para crear facturas en PDF con plantillas por empresa, autenticación y administración avanzada de usuarios.

---

## 🇪🇸 Español

### 🚀 Propuesta de valor

Centraliza la generación de facturas para múltiples empresas en un solo sistema, reduciendo errores manuales y acelerando el trabajo administrativo.

### ✨ Funcionalidades destacadas

- **Autenticación y control de acceso**
  - Inicio de sesión con Firebase Authentication.
  - Roles `admin` y `user`.
  - Protección de rutas por sesión y permisos.

- **Facturación por empresa**
  - Plantillas personalizadas para:
    - MAMEN AUTOMOTIVE GROUP S.L.
    - TU SOLUCION ADMINISTRATIVA DRDL, S.L.P.
    - WINICAR ESPANA
  - Exportación a PDF con salida consistente para impresión o envío.

- **Panel administrativo**
  - Alta, edición y eliminación de usuarios.
  - Gestión de roles.
  - Cambio de contraseña administrado.

- **Recuperación de contraseña con aprobación interna**
  - Usuario crea solicitud de reset.
  - Admin aprueba o rechaza.
  - Si aprueba, define nueva contraseña.

### 🧱 Stack técnico

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript
- **UI:** Tailwind CSS + librería de componentes reutilizables
- **Auth / DB:** Firebase Authentication + Cloud Firestore
- **Server secure ops:** Firebase Admin SDK
- **PDF:** `html2canvas` + `jspdf`
- **CI/CD:** GitHub Actions
- **Hosting:** Vercel

### 🏗️ Arquitectura (alto nivel)

- **Cliente (React/Next):** render de formularios, UX y sesión.
- **API Routes (Next.js):** endpoints protegidos para operaciones administrativas.
- **Firestore:** datos de perfil, rol y solicitudes de recuperación.
- **Firebase Admin:** cambios sensibles como actualización de contraseñas.

### 📁 Estructura del proyecto

```bash
app/
  page.tsx                      # Dashboard principal (selección de empresa)
  login/page.tsx                # Login + solicitud de recuperación
  admin/page.tsx                # Panel de administración
  api/
    admin/
      users/                    # CRUD de usuarios
      password-reset-requests/  # Gestión de solicitudes de reset
    password-reset-request/     # Creación de solicitud por usuario

components/
  invoice-form-*.tsx            # Formularios por empresa

lib/
  auth-context.tsx              # Estado de sesión y rol
  firebase.ts                   # SDK cliente
  firebase-admin.ts             # SDK admin (server only)
  generate-pdf.ts               # Exportación a PDF
```

### 🖼️ Capturas (portfolio)

#### Pantalla de Login

![Pantalla de Login](docs/screenshots/login.png)

#### Dashboard - Selección de Empresa

![Dashboard](docs/screenshots/dashboard.png)

#### Formulario de Factura

![Formulario de Factura](docs/screenshots/invoice-form.png)

#### Panel Admin - Gestión de Usuarios

![Panel Admin - Usuarios](docs/screenshots/admin-users.png)

#### Panel Admin - Solicitudes de Reset de Contraseña

![Panel Admin - Reset Password](docs/screenshots/admin-password-reset.png)

#### Solicitud de Recuperación de Contraseña

![Recuperación de Contraseña](docs/screenshots/reset_password.png)

### ⚙️ Instalación local

```bash
git clone <URL_DEL_REPO>
cd generador-de-facturas-personalizadas
pnpm install
```

Crea `.env.local` con:

```dotenv
FIREBASE_PROJECT_ID=tu_project_id
FIREBASE_CLIENT_EMAIL=tu_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Ejecuta:

```bash
pnpm dev
```

### 🔐 Variables de entorno en producción

En Vercel configura:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

En GitHub Secrets (Actions) configura:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### 📦 Despliegue automático

Cada push a `main` activa el workflow de GitHub Actions que construye y publica en Vercel.

### 🧪 Scripts

```bash
pnpm dev      # desarrollo
pnpm build    # build producción
pnpm start    # ejecutar build local
pnpm lint     # lint
```

---

## 🇺🇸 English (Portfolio Summary)

### Overview

Custom Invoice Generator is a full-stack web app built to streamline invoice creation across multiple companies using tailored templates and secure role-based access.

### Key Highlights

- Multi-template invoice generation with PDF export.
- Firebase authentication and Firestore-backed user profiles.
- Admin panel for user management (create/edit/delete, roles, password updates).
- Internal password reset workflow with admin approval.
- CI/CD pipeline with GitHub Actions and Vercel deployment.

### Tech Stack

Next.js 16, React 19, TypeScript, Tailwind CSS, Firebase Auth, Firestore, Firebase Admin SDK, html2canvas, jsPDF.

---

## 🛣️ Roadmap

- Invoice history and traceability.
- Search and filters by client/date.
- Administrative audit log.
- Automated tests (unit and integration).
- I18n and regional formatting improvements.

---

## 👨‍💻 Autor

Desarrollado por **JeissonDevelop**.
