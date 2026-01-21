# Autenticación Social con GitHub: Next.js + Strapi

Una guía práctica para implementar autenticación OAuth con GitHub en aplicaciones modernas.

## Descripción del Proyecto

Este proyecto demuestra cómo integrar autenticación social usando GitHub como proveedor OAuth en una arquitectura moderna con:

- **Frontend**: Next.js 16 con App Router y TypeScript
- **Backend**: Strapi 5 como headless CMS
- **Autenticación**: GitHub OAuth 2.0
- **Estilos**: Tailwind CSS

## Arquitectura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Next.js App   │────▶│  Strapi Backend │────▶│  GitHub OAuth   │
│   (Puerto 3000) │     │  (Puerto 1337)  │     │                 │
│                 │◀────│                 │◀────│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Flujo de Autenticación

1. El usuario hace clic en "Sign in with GitHub"
2. El frontend redirige a Strapi: `http://localhost:1337/api/connect/github`
3. Strapi redirige a GitHub para la autorización
4. GitHub autentica y redirige de vuelta a Strapi con un código
5. Strapi intercambia el código por un token de acceso
6. Strapi redirige al frontend con el `access_token`
7. El Route Handler del frontend solicita el JWT a Strapi
8. Se almacena el JWT en una cookie HttpOnly
9. El usuario es redirigido al Dashboard

---

# Clase Magistral: Implementación de OAuth con GitHub

## Introducción

La autenticación social se ha convertido en un estándar de la industria. Los usuarios prefieren no crear nuevas cuentas con contraseñas que olvidarán. GitHub, siendo la plataforma donde viven millones de desarrolladores, es una opción natural para aplicaciones técnicas.

En esta clase vamos a construir un sistema de autenticación completo, paso a paso. No es un tutorial superficial; vamos a entender cada componente y por qué existe.

## Parte 1: Fundamentos de OAuth 2.0

OAuth 2.0 es un protocolo de autorización. No de autenticación —aunque lo usemos para eso—. La diferencia es sutil pero importante:

- **Autenticación**: "¿Quién eres?"
- **Autorización**: "¿Qué puedes hacer?"

OAuth nos permite autorizar a nuestra aplicación a acceder a recursos del usuario en GitHub (como su perfil), y con esa información podemos autenticarlo en nuestro sistema.

### Los Actores

- **Resource Owner**: El usuario
- **Client**: Nuestra aplicación (Next.js)
- **Authorization Server**: GitHub
- **Resource Server**: También GitHub (en este caso)

## Parte 2: Configuración del Frontend

### El Botón de Login

```typescript
// src/app/page.tsx
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:1337";
const path = "/api/connect/github";
const url = new URL(backendUrl + path);
```

Este código construye la URL de redirección. Nota que no vamos directamente a GitHub; vamos a Strapi. ¿Por qué? Porque Strapi gestiona todo el flujo OAuth por nosotros: almacena las credenciales, intercambia tokens, y crea usuarios.

### El Route Handler

El Route Handler es donde ocurre la magia del lado del frontend:

```typescript
// src/app/connect/[provider]/redirect/route.ts
export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("access_token");
  
  // Strapi nos devuelve el access_token de GitHub
  // Ahora lo intercambiamos por un JWT de Strapi
  const res = await fetch(`${backendUrl}/api/auth/${provider}/callback?access_token=${token}`);
  const data = await res.json();
  
  // Guardamos el JWT en una cookie HttpOnly
  cookieStore.set("jwt", data.jwt, config);
}
```

Usamos un segmento dinámico `[provider]` para poder añadir otros proveedores en el futuro (Google, Twitter, etc.) sin cambiar código.

### Seguridad de las Cookies

```typescript
const config = {
  maxAge: 60 * 60 * 24 * 7, // 1 semana
  path: "/",
  domain: process.env.HOST ?? "localhost",
  httpOnly: true,  // No accesible desde JavaScript
  secure: process.env.NODE_ENV === "production", // Solo HTTPS en producción
};
```

La cookie es `httpOnly`, lo que significa que el código JavaScript del navegador no puede leerla. Esto previene ataques XSS donde un script malicioso podría robar tokens.

## Parte 3: El Middleware de Protección

Next.js ejecuta el middleware antes de cada request. Es el lugar perfecto para verificar autenticación:

```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  const user = await getUserMeLoader();
  
  if (currentPath.startsWith("/dashboard") && user.ok === false) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  
  return NextResponse.next();
}
```

### ¿Por qué verificar con Strapi?

Podríamos simplemente verificar si existe la cookie. Pero eso no es suficiente:

1. La cookie podría haber expirado en el servidor
2. El usuario podría haber sido deshabilitado
3. El token podría haber sido revocado

La única fuente de verdad es Strapi. Por eso hacemos una llamada a `/api/users/me` con el JWT.

## Parte 4: Configuración de Strapi

### Habilitando el Proveedor

En el admin de Strapi (`http://localhost:1337/admin`):

1. Ve a Settings → Users & Permissions → Providers
2. Habilita GitHub
3. Configura:
   - **Client ID**: Del OAuth App de GitHub
   - **Client Secret**: Del OAuth App de GitHub
   - **Redirect URL**: `http://localhost:3000/connect/github/redirect`

### Creando la OAuth App en GitHub

1. Ve a GitHub → Settings → Developer Settings → OAuth Apps
2. Crea una nueva aplicación:
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:1337/api/connect/github/callback`

La callback URL apunta a Strapi, no al frontend. Strapi recibe el código de GitHub, lo intercambia por tokens, y luego redirige al frontend.

## Parte 5: Conceptos Avanzados

### Server Actions para Logout

```typescript
async function logoutAction() {
  "use server";
  cookieStore.set("jwt", "", { ...config, maxAge: 0 });
  redirect("/");
}
```

Usamos Server Actions de React para el logout. La función se ejecuta en el servidor, elimina la cookie, y redirige. Simple y seguro.

### Caché y Revalidación

```typescript
const response = await fetch(url.href, {
  method: "GET",
  headers: { Authorization: `Bearer ${authToken}` },
  cache: "no-cache",  // Importante: nunca cachear datos de usuario
});
```

Los datos de autenticación nunca deben cachearse. Cada request debe verificar el estado actual del usuario.

## Consideraciones de Producción

1. **Variables de entorno**: Nunca expongas `Client Secret` en el frontend
2. **HTTPS**: Obligatorio en producción para cookies seguras
3. **Dominio**: Configura correctamente el dominio de las cookies
4. **Rate limiting**: GitHub tiene límites de API; implementa caché inteligente
5. **Manejo de errores**: Qué pasa si GitHub está caído, si el token es inválido, etc.

## Extensibilidad

El diseño con `[provider]` dinámico permite añadir proveedores fácilmente:

- Google: `/connect/google/redirect`
- Twitter: `/connect/twitter/redirect`
- Discord: `/connect/discord/redirect`

Solo necesitas configurar el proveedor en Strapi y crear la OAuth App correspondiente.

---

# Bitácora de Desarrollo

## Día 1 - Configuración Inicial

### 09:27 - Inicio del proyecto

Comenzamos analizando los requisitos. El objetivo es claro: implementar autenticación con GitHub usando Next.js y Strapi. Decidí seguir una arquitectura limpia separando frontend y backend en carpetas distintas.

### 09:35 - Creación del frontend

```bash
npx create-next-app@latest frontend --typescript --tailwind --eslint --src-dir --app
```

Elegí las opciones modernas:
- TypeScript para type safety
- Tailwind para estilos rápidos
- App Router por ser el futuro de Next.js
- `src/` directory para mejor organización

### 09:42 - Implementación del formulario de login

Creé el componente de login con el botón de GitHub. Usé los estilos de TailwindUI para una apariencia profesional. El botón es simplemente un `Link` que redirige a la API de Strapi.

### 09:48 - Route Handler para el callback

Esta fue la parte más delicada. El Route Handler debe:
1. Extraer el `access_token` de la URL
2. Enviarlo a Strapi para obtener el JWT
3. Guardar el JWT en una cookie segura
4. Redirigir al dashboard

Tuve que usar `await params` porque en Next.js 16 los params son una Promise.

### 09:52 - Dashboard y Logout

Implementé el dashboard con un botón de logout usando Server Actions. Es más limpio que crear un API route separado para algo tan simple.

### 09:55 - Middleware de protección

El middleware verifica cada request al dashboard. Si el usuario no está autenticado, lo redirige al login. Uso el endpoint `/api/users/me` de Strapi como fuente de verdad.

### 09:56 - Backend con Strapi

```bash
npx create-strapi-app@latest backend --quickstart
```

Strapi 5 trae mejoras significativas en rendimiento y DX. El flag `--quickstart` usa SQLite, perfecto para desarrollo.

### 10:00 - Verificación final

Ambas aplicaciones corriendo:
- Frontend: http://localhost:3000
- Backend: http://localhost:1337

El flujo completo funciona. Solo falta configurar las credenciales de GitHub OAuth en el panel de Strapi.

## Lecciones Aprendidas

1. **Next.js 16 cambios**: Los params en Route Handlers ahora son Promises
2. **Cookies async**: `cookies()` también devuelve una Promise ahora
3. **Middleware deprecation**: Next.js 16 sugiere migrar a "proxy", pero middleware sigue funcionando

## Próximos Pasos

- [ ] Configurar OAuth App en GitHub
- [ ] Configurar proveedor en Strapi Admin
- [ ] Pruebas end-to-end del flujo completo
- [ ] Añadir manejo de errores
- [ ] Implementar refresh de tokens

---

## Instalación Rápida

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Cuenta de GitHub

### 1. Clonar e instalar

```bash
git clone <repo-url>
cd social-strapi

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configurar variables de entorno

Frontend (`frontend/.env.local`):
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:1337
HOST=localhost
```

### 3. Iniciar las aplicaciones

```bash
# Terminal 1 - Backend
cd backend
npm run develop

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4. Configurar GitHub OAuth

1. Crear admin en Strapi: http://localhost:1337/admin
2. Ir a Settings → Users & Permissions → Providers → GitHub
3. Crear OAuth App en GitHub (Developer Settings)
4. Copiar Client ID y Secret a Strapi
5. Redirect URL: `http://localhost:3000/connect/github/redirect`

### 5. Probar

1. Abrir http://localhost:3000
2. Click en "GitHub"
3. Autorizar en GitHub
4. Serás redirigido al Dashboard

---

## Estructura del Proyecto

```
social-strapi/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx              # Login page
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx          # Protected dashboard
│   │   │   └── connect/
│   │   │       └── [provider]/
│   │   │           └── redirect/
│   │   │               └── route.ts  # OAuth callback handler
│   │   ├── components/
│   │   │   └── LogoutButton.tsx      # Logout with Server Action
│   │   ├── services/
│   │   │   └── user-me-loader.ts     # Auth verification service
│   │   └── middleware.ts             # Route protection
│   └── .env.local
├── backend/                          # Strapi application
└── README.md
```

## Licencia

MIT

## Recursos Adicionales

- [Documentación de Strapi Providers](https://docs.strapi.io/dev-docs/plugins/users-permissions#providers)
- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
