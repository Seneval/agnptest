# AGNP Tennis AI - Experiencia de Transformación

Aplicación web que transforma fotos de usuarios en imágenes profesionales de tennis usando IA generativa para el Abierto GNP Seguros 2025.

## 🎾 Características

- **Análisis con GPT-4 Vision**: Identifica características físicas detalladas
- **Generación con gpt-image-1**: Crea imágenes fotorrealistas de tennis
- **Interfaz moderna**: Diseño profesional con animaciones fluidas
- **Sin registro**: Experiencia directa sin necesidad de login
- **Compartir resultados**: Descarga y comparte en redes sociales

## 🚀 Instalación

1. Clona el repositorio:
```bash
cd agnp-tennis-ai
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura tu API key de OpenAI:
   - Copia `.env.local` y renómbralo a `.env.local`
   - Añade tu API key: `OPENAI_API_KEY=tu_api_key_aqui`

4. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador

## 📁 Estructura del Proyecto

```
agnp-tennis-ai/
├── app/
│   ├── api/
│   │   └── tennis-transform/     # API para análisis y generación
│   ├── components/               # Componentes React
│   │   ├── Header.tsx           # Cabecera con branding
│   │   ├── UploadSection.tsx   # Zona de carga de imágenes
│   │   ├── ProcessingSteps.tsx # Animación de procesamiento
│   │   └── ResultDisplay.tsx   # Visualización de resultados
│   ├── page.tsx                 # Página principal
│   ├── layout.tsx              # Layout base
│   └── globals.css             # Estilos globales
├── lib/
│   ├── openai.ts               # Cliente y configuración OpenAI
│   └── utils.ts                # Utilidades generales
└── public/                      # Assets estáticos
```

## 🛠 Tecnologías

- **Next.js 14**: Framework React con App Router
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Estilos utilitarios
- **OpenAI API**: GPT-4 Vision + gpt-image-1
- **Framer Motion**: Animaciones
- **React Dropzone**: Carga de archivos
- **Vercel**: Deployment

## 💰 Costos Estimados

- GPT-4 Vision: ~$0.01 por análisis
- gpt-image-1 HD: ~$0.19 por imagen
- **Total**: ~$0.20 USD por transformación

## 🚀 Deployment en Vercel

### Opción 1: Deploy con un click
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Seneval/agnptest&env=OPENAI_API_KEY&envDescription=OpenAI%20API%20Key%20para%20generar%20imágenes&project-name=agnp-tennis-ai&repository-name=agnp-tennis-ai)

### Opción 2: Deploy manual

1. **Fork o clona el repositorio**
   ```bash
   git clone https://github.com/Seneval/agnptest.git
   cd agnptest
   ```

2. **Instala Vercel CLI** (opcional)
   ```bash
   npm i -g vercel
   ```

3. **Deploy con Vercel CLI**
   ```bash
   vercel
   ```

4. **O conecta con Vercel desde GitHub**
   - Ve a [vercel.com](https://vercel.com)
   - Importa el proyecto desde GitHub
   - Configura la variable de entorno:
     - Name: `OPENAI_API_KEY`
     - Value: Tu API key de OpenAI
   - Click en "Deploy"

### Variables de entorno requeridas

| Variable | Descripción |
|----------|-------------|
| `OPENAI_API_KEY` | Tu API key de OpenAI (requerida) |

### Configuración adicional

El proyecto ya incluye:
- `vercel.json` con la configuración optimizada
- Edge runtime para mejor performance
- Timeout de 60 segundos para procesamiento de imágenes

## 📝 Notas Importantes

- Límite de imagen: 5MB
- Formatos soportados: JPG, PNG, WebP
- Se recomienda implementar rate limiting en producción
- Las imágenes no se almacenan permanentemente

## 🎨 Personalización

Los colores del AGNP están definidos en `tailwind.config.ts`:
- Navy: `#0A1B3D`
- Blue: `#0066CC`
- Electric: `#4A90E2`
- Orange: `#FF6B35`
- Yellow: `#FFD93D`

---

Desarrollado para el Abierto GNP Seguros 2025 🎾