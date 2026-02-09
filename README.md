# Autenticación Social con GitHub: Next.js + Strapi

Proyecto de autenticación OAuth con GitHub utilizando Next.js y Strapi.

## Descripción

Este proyecto implementa un sistema completo de autenticación social con GitHub como proveedor OAuth, usando:

- **Frontend**: Next.js 16 (App Router, TypeScript, Tailwind CSS)
- **Backend**: Strapi 5 (Headless CMS)
- **Autenticación**: GitHub OAuth 2.0

## Instalación

### Prerrequisitos
- Node.js 18+
- Cuenta de GitHub

### Pasos

1. **Instalar dependencias**
```bash
# Backend
cd backend
npm install

# Frontend  
cd ../frontend
npm install
```

2. **Configurar variables de entorno**

Frontend (`frontend/.env.local`):
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:1337
```

Backend (`backend/.env`):
```env
GITHUB_CLIENT_ID=tu_client_id
GITHUB_CLIENT_SECRET=tu_client_secret
SERVER_URL=http://localhost:1337
```

3. **Iniciar aplicaciones**

**Importante**: Strapi 5 requiere Node.js 24.x. Si tienes Node 25+, usa nvm:
```bash
nvm use 24
```

```bash
# Terminal 1 - Backend (asegurar Node 24.x)
cd backend
npm run develop
# Se iniciará en http://localhost:1337

# Terminal 2 - Frontend
cd frontend
npm run dev
# Se iniciará en http://localhost:3000 o 3001
```

4. **Configurar GitHub OAuth**
- Crear admin en Strapi: http://localhost:1337/admin
- Settings → Users & Permissions → Providers → GitHub
- Crear OAuth App en GitHub Developer Settings
- Configurar Client ID y Secret en Strapi

## Uso

1. Abrir http://localhost:3001
2. Click en "Sign in with GitHub"
3. Autorizar en GitHub
4. Dashboard protegido con sesión activa

## Estructura

```
social-strapi/
├── frontend/
│   ├── app/
│   │   ├── page.tsx              # Página de login
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Dashboard protegido
│   │   ├── api/
│   │   │   ├── connect/
│   │   │   │   └── [provider]/
│   │   │   │       └── redirect/
│   │   │   │           └── route.ts    # OAuth callback
│   │   │   └── logout/
│   │   │       └── route.ts      # Endpoint logout
│   │   └── components/
│   │       └── LogoutButton.tsx  # Botón de logout
│   ├── middleware.ts             # Protección de rutas
│   ├── .env.local                # Variables de entorno
│   └── package.json
├── backend/
│   ├── config/
│   │   └── plugins.ts            # Configuración GitHub OAuth
│   ├── src/
│   ├── .env                      # Variables de entorno
│   └── package.json
├── docs/
│   └── README.md                 # Documentación detallada
└── README.md                     # Este archivo
```

## Resumen Reflexivo del Desarrollo

Durante el desarrollo del proyecto, el mayor desafío fue gestionar las dependencias y asegurarme de que las versiones fueran compatibles. Strapi 5 requiere Node.js 24.x, pero mi sistema tenía Node 25, lo que me obligó a usar nvm para cambiar de versión. También enfrenté conflictos de puertos y diferencias entre shells (fish vs bash), pero estos obstáculos me enseñaron la importancia de verificar la compatibilidad del entorno antes de comenzar.

Lo más importante que aprendí fue cómo funcionan los tokens de autenticación. Los tokens son como "contraseñas temporales" que permiten al sistema reconocer y autenticar al usuario sin exponer credenciales sensibles. Comprendí por qué Strapi actúa como intermediario: protege el Client Secret de GitHub manteniéndolo en el servidor, nunca exponiéndolo al navegador. También aprendí sobre cookies HttpOnly, que protegen los tokens contra ataques XSS al hacerlos inaccesibles desde JavaScript del lado del cliente. La arquitectura OAuth no es simplemente un botón de login, sino un flujo cuidadosamente diseñado donde cada redirección tiene un propósito de seguridad específico.

Strapi demostró ser una herramienta excelente para configurar rápidamente un backend funcional con autenticación lista para usar. Esta combinación de Next.js y Strapi es un stack moderno y poderoso que definitivamente utilizaré en futuros proyectos. La autenticación social se ha convertido en un estándar de la industria, y ahora entiendo no solo cómo implementarla, sino también por qué cada componente existe y cómo contribuye a la seguridad del sistema.
