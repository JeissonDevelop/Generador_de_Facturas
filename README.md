# Generador de Facturas Personalizadas

## Despliegue e integración continua en GitHub Pages

Este proyecto está configurado para desplegarse automáticamente en GitHub Pages mediante GitHub Actions.

### Requisitos

- Rama principal: `main`
- GitHub Pages activado con fuente **GitHub Actions**

### Activación en GitHub (1 vez)

1. Sube estos cambios al repositorio.
2. En GitHub, ve a **Settings > Pages**.
3. En **Build and deployment**, selecciona **Source: GitHub Actions**.
4. Guarda.

### Cómo funciona el CI/CD

- Workflow: `.github/workflows/deploy-pages.yml`
- Se ejecuta en cada push a `main` (y también manualmente con `workflow_dispatch`).
- Instala dependencias con `pnpm`.
- Ejecuta build estático de Next.js (`next build` con `output: "export"`).
- Publica la carpeta `out` en GitHub Pages.

### URL esperada

- Repositorio tipo proyecto: `https://<usuario>.github.io/<repo>/`
- Repositorio tipo usuario/organización (`<usuario>.github.io`): `https://<usuario>.github.io/`

### Nota de configuración de rutas

`next.config.mjs` calcula `basePath` automáticamente durante el build de GitHub Actions usando `GITHUB_REPOSITORY`, por lo que no necesitas editar rutas manualmente al cambiar de repositorio.
