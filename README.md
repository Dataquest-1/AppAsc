# ASC - Sistema de Gestión de Mantenimiento Industrial

Monorepo para el sistema de gestión de mantenimiento industrial multi-tenant con arquitectura escalable.

## 🏗️ Arquitectura

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Backend**: NestJS + TypeScript
- **Base de datos**: PostgreSQL con Row-Level Security (RLS)
- **Contenedores**: Docker + Docker Compose
- **CI/CD**: GitHub Actions

## 📁 Estructura del Proyecto

```
├── apps/
│   ├── web/          # Frontend Next.js
│   └── api/          # Backend NestJS
├── packages/
│   ├── ui/           # Componentes compartidos
│   ├── config/       # Configuraciones compartidas
│   └── sdk/          # SDK para APIs externas
├── infra/
│   ├── docker/       # Configuraciones Docker
│   └── compose/      # Docker Compose
├── migrations/       # Migraciones SQL
├── .github/          # Workflows CI/CD
└── docs/            # Documentación
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- Docker y Docker Compose
- PostgreSQL 15+

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd app-asc-monorepo
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

4. **Levantar servicios con Docker**
   ```bash
   npm run docker:up
   ```

5. **Ejecutar migraciones**
   ```bash
   npm run db:migrate
   ```

6. **Cargar datos de prueba**
   ```bash
   npm run db:seed
   ```

7. **Iniciar desarrollo**
   ```bash
   npm run dev
   ```

## 🛠️ Comandos Disponibles

- `npm run dev` - Iniciar desarrollo (web + api)
- `npm run build` - Construir para producción
- `npm run lint` - Ejecutar linter
- `npm run type-check` - Verificar tipos TypeScript
- `npm run test` - Ejecutar tests
- `npm run docker:up` - Levantar contenedores
- `npm run docker:down` - Detener contenedores
- `npm run db:migrate` - Ejecutar migraciones
- `npm run db:seed` - Cargar datos de prueba

## 🔐 Autenticación Multi-tenant

El sistema utiliza autenticación de 3 campos:
- **empresa_code**: Código único de la empresa
- **username**: Nombre de usuario
- **password**: Contraseña

### Roles disponibles:
- **admin**: Acceso completo
- **lider_equipo**: Gestión de equipo y asignaciones
- **tecnico**: Ejecución de tareas (sin acceso a precios)

## 📊 Funcionalidades Principales

### ✅ Implementadas
- [ ] Autenticación multi-tenant con JWT
- [ ] RBAC (Roles y permisos)
- [ ] Clientes y Activos (CRUD)
- [ ] Formularios dinámicos
- [ ] Planes de mantenimiento
- [ ] Sistema de emergencias
- [ ] Cotizaciones colaborativas
- [ ] Órdenes de trabajo
- [ ] Dashboard de KPIs
- [ ] API externa v1

### 🔄 En Desarrollo
- [ ] Gestión documental
- [ ] Firma digital
- [ ] Exportaciones automáticas
- [ ] Gamificación

## 🗄️ Base de Datos

PostgreSQL con Row-Level Security (RLS) activo. Todas las tablas incluyen `empresa_id` para aislamiento de datos.

### Migraciones
```bash
npm run db:generate  # Generar nueva migración
npm run db:migrate   # Ejecutar migraciones
```

### Seeds
```bash
npm run db:seed      # Cargar datos de prueba
```

## 🔒 Seguridad

- **RLS**: Aislamiento de datos por empresa
- **JWT**: Autenticación stateless
- **RBAC**: Control de acceso basado en roles
- **Rate limiting**: Protección contra abuso
- **CORS**: Configuración segura

## 📚 Documentación API

La documentación de la API está disponible en:
- **Swagger UI**: `/api/docs`
- **OpenAPI**: `/api/docs-json`

## 🧪 Testing

```bash
npm run test              # Tests unitarios
npm run test:watch       # Tests en modo watch
```

## 🚢 Despliegue

### Producción
```bash
npm run build
npm run docker:up
```

### CI/CD
Los workflows de GitHub Actions ejecutan:
- Linting y type-checking
- Tests unitarios
- Migraciones de base de datos
- Build de aplicaciones

## 🤝 Contribuir

1. Crear branch desde `main`
2. Implementar cambios
3. Ejecutar tests: `npm run test`
4. Crear Pull Request

## 📄 Licencia

Propietario - Todos los derechos reservados.

---

**Desarrollado por Servicios DataQuest** 🚀
