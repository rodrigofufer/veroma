# 🌍 Veroma – Plataforma Cívica Internacional

**Veroma** es una plataforma cívica multilingüe que permite a cualquier persona, en cualquier lugar, plantear problemas cívicos, enviar propuestas y votar — desde barrios locales hasta movimientos globales.

> Construida durante el Hackathon de Devpost, Veroma ya es funcional, escalable y lista para generar impacto.

---

## ✨ Características (Versión Actual)

- 🗳️ Sistema de votación semanal: 10 votos por usuario, reinicio cada lunes
- ✍️ Publicación de ideas anónima o pública
- 🌐 Selección predictiva de países (insensible a acentos)
- 📱 Diseño totalmente responsive (móvil + escritorio)
- 🌎 Interfaz en inglés (soporte multilingüe con Lingo próximamente)
- 🍪 Cookie de sesión simple para mantener tu sesión activa
- 👥 Roles de usuario: ciudadano, representante, administrador
- 🏛️ Propuestas oficiales con plazos de votación

---

## 🚧 Próximamente

- 🛡️ Verificación segura de identidad (compatible con blockchain)  
- 🗺️ Votación por niveles según ubicación (local → ciudad → nacional → global)  
- 🌍 Internacionalización completa (más de 85 idiomas vía Lingo)  
- 🚨 Sistema de reportes y moderación  
- 🧪 Lanzamiento piloto en regiones seleccionadas  

---

## 🧠 Stack Tecnológico

- React con TypeScript  
- Tailwind CSS  
- Supabase (Auth + Base de datos)  
- Framer Motion (animación UI)  
- Netlify (Despliegue)  
- Bolt.new (lógica UI / constructor)  
- Lingo (motor de traducción – próximamente)  

## 🛠 Desarrollo Local

1. Copia `.env.example` a `.env` y añade tus credenciales de Supabase:
   ```
   VITE_SUPABASE_URL=<tu-url-de-supabase>
   VITE_SUPABASE_ANON_KEY=<tu-clave-anon-de-supabase>
   ```
   Si el botón de inicio de sesión se queda en **"Iniciando sesión..."**, es probable que estas variables de entorno falten o sean incorrectas.
2. Instala las dependencias:
   ```
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```
   npm run dev
   ```

---

## 💡 ¿Por qué Veroma?

La mayoría de las plataformas cívicas están limitadas por geografía, burocracia o política. Veroma es diferente. Fue construida para ser:

- 🌐 Sin fronteras  
- 🗳️ Democrática  
- 👥 Inclusiva  
- 💬 Impulsada por la comunidad  

Ya sea arreglar una farola rota o proponer una resolución global sobre el clima — cada voz importa.

---

## 🍪 Cookies

Veroma utiliza una cookie ligera llamada `veroma_session` para mantener tu sesión activa después de autenticarte. Esta cookie no contiene datos personales y expira cuando cierras sesión.

---

## 📜 Cumplimiento del Hackathon

- ✅ Construido completamente durante el período oficial del Hackathon de Devpost  
- ✅ Todo el código, texto y recursos son originales o tienen licencia comercial  
- ✅ El nombre *Veroma* es un nombre en clave provisional para desarrollo  
- ✅ El participante conserva todos los derechos de propiedad intelectual; Devpost recibe una licencia no exclusiva para exhibición  

---

**Veroma** no es solo un prototipo — es el comienzo de una revolución cívica escalable.