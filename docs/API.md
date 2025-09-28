# Documentación API - ASC v0.5

## Introducción

La API de ASC proporciona acceso programático a todas las funcionalidades del sistema de gestión de mantenimiento industrial. Está construida con NestJS y sigue los principios REST con documentación OpenAPI.

## Base URL

```
Desarrollo: http://localhost:3001/api
Producción: https://api.asc.com/api
```

## Autenticación

### Login Multi-tenant

```http
POST /auth/login
Content-Type: application/json

{
  "empresaCodigo": "DEMO",
  "username": "admin",
  "password": "admin123"
}
```

**Respuesta:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "admin",
    "email": "admin@demo.com",
    "nombre": "Carlos",
    "apellido": "Administrador",
    "rol": "admin",
    "empresa": {
      "id": "uuid",
      "codigo": "DEMO",
      "nombre": "Empresa Demo ASC"
    }
  }
}
```

### Refresh Token

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Headers de Autenticación

Todas las requests autenticadas deben incluir:

```http
Authorization: Bearer {accessToken}
```

## Códigos de Estado

| Código | Descripción |
|--------|-------------|
| 200 | OK - Operación exitosa |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Token inválido/expirado |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Conflicto de datos |
| 422 | Unprocessable Entity - Validación fallida |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error - Error del servidor |

## Endpoints Principales

### Cotizaciones

#### Listar Cotizaciones
```http
GET /cotizaciones
Authorization: Bearer {token}
```

**Respuesta:**
```json
[
  {
    "id": "uuid",
    "numero": "COT-2025-001",
    "titulo": "Reparación Bomba Principal",
    "estado": "en_revision",
    "cliente": {
      "id": "uuid",
      "nombre": "Minera Los Andes S.A."
    },
    "activo": {
      "id": "uuid",
      "codigo": "EQ001",
      "nombre": "Chancador Primario"
    },
    "subtotal": 850000,
    "impuestos": 161500,
    "total": 1011500,
    "createdAt": "2025-09-28T20:30:00Z",
    "updatedAt": "2025-09-28T21:15:00Z"
  }
]
```

#### Crear Cotización
```http
POST /cotizaciones
Authorization: Bearer {token}
Content-Type: application/json

{
  "clienteId": "uuid",
  "activoId": "uuid",
  "titulo": "Reparación Bomba Centrífuga",
  "descripcion": "Reparación completa con cambio de impulsores",
  "validezDias": 30
}
```

#### Agregar Item a Cotización
```http
POST /cotizaciones/{id}/items
Authorization: Bearer {token}
Content-Type: application/json

{
  "descripcion": "Cambio de impulsor principal",
  "cantidad": 1,
  "urgencia": "alta"
}
```

**Nota**: Los técnicos pueden agregar items sin precio. Solo admin y líderes pueden asignar precios.

#### Asignar Precios (Solo Admin/Líder)
```http
POST /cotizaciones/{id}/asignar-precios
Authorization: Bearer {token}
Content-Type: application/json

{
  "items": [
    {
      "itemId": "uuid",
      "cantidad": 1,
      "precioUnitario": 350000
    }
  ],
  "porcentajeImpuestos": 19
}
```

#### Cambiar Estado
```http
PATCH /cotizaciones/{id}/estado
Authorization: Bearer {token}
Content-Type: application/json

{
  "estado": "en_revision"
}
```

**Estados válidos:**
- `borrador` → `en_revision`
- `en_revision` → `lista_envio` | `borrador`
- `lista_envio` → `enviada` | `en_revision`
- `enviada` → `aprobada` | `rechazada`
- `aprobada` → `cerrada`
- `rechazada` → `cerrada`

### Activos

#### Listar Activos
```http
GET /activos?clienteId={uuid}&estado=operativo
Authorization: Bearer {token}
```

#### Crear Activo
```http
POST /activos
Authorization: Bearer {token}
Content-Type: application/json

{
  "clienteId": "uuid",
  "codigo": "EQ008",
  "nombre": "Compresor de Aire Nuevo",
  "descripcion": "Compresor de tornillo rotativo",
  "marca": "Atlas Copco",
  "modelo": "GA-200",
  "numeroSerie": "ATC-GA200-2025-001",
  "ubicacion": "Sala Compresores - Nivel 1",
  "estado": "operativo",
  "criticidad": "media",
  "fechaInstalacion": "2025-01-15",
  "valorCompra": 280000
}
```

#### Obtener Bitácora de Activo
```http
GET /activos/{id}/bitacora
Authorization: Bearer {token}
```

### Órdenes de Trabajo

#### Listar Órdenes de Trabajo
```http
GET /ordenes-trabajo?estado=asignada&asignadoA={userId}
Authorization: Bearer {token}
```

#### Crear Orden de Trabajo
```http
POST /ordenes-trabajo
Authorization: Bearer {token}
Content-Type: application/json

{
  "tipo": "mantenimiento",
  "prioridad": "media",
  "activoId": "uuid",
  "clienteId": "uuid",
  "titulo": "Mantenimiento Preventivo Mensual",
  "descripcion": "Lubricación y inspección general",
  "fechaProgramada": "2025-10-15T08:00:00Z",
  "formularioId": "uuid"
}
```

#### Cambiar Estado de OT
```http
PATCH /ordenes-trabajo/{id}/estado
Authorization: Bearer {token}
Content-Type: application/json

{
  "estado": "en_curso"
}
```

**Máquina de Estados:**
- `nueva` → `asignada`
- `asignada` → `en_curso`
- `en_curso` → `en_espera` | `cerrada`
- `en_espera` → `en_curso`
- Cualquier estado → `cancelada` (con motivo)

### Emergencias

#### Crear Emergencia
```http
POST /emergencias
Authorization: Bearer {token}
Content-Type: application/json

{
  "activoId": "uuid",
  "clienteId": "uuid",
  "descripcion": "Bomba con ruido anormal y vibración excesiva",
  "reportadoPor": "Pedro Supervisor",
  "telefonoContacto": "+56987654321",
  "slaMinutos": 240
}
```

#### Asignar Técnico
```http
PATCH /emergencias/{id}/asignar
Authorization: Bearer {token}
Content-Type: application/json

{
  "usuarioId": "uuid"
}
```

#### Marcar Llegada
```http
POST /emergencias/{id}/llegada
Authorization: Bearer {token}
```

### Dashboard y KPIs

#### Obtener KPIs
```http
GET /dashboard/kpis?mes=2025-09&clienteId={uuid}
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "slaPromedio": 87.5,
  "pctDetenidos": 12.3,
  "coberturaMant": 94.2,
  "cotizacionesAbiertas": 8,
  "tiempoDetenidoPorActivo": [
    {
      "activoId": "uuid",
      "codigo": "EQ001",
      "nombre": "Chancador Primario",
      "horasDetenido": 24,
      "pctPeriodo": 3.3
    }
  ]
}
```

#### Métricas Diarias
```http
GET /dashboard/metricas-diarias?desde=2025-09-01&hasta=2025-09-30
Authorization: Bearer {token}
```

## Permisos por Rol

### Admin
- ✅ Acceso completo a todos los endpoints
- ✅ Gestión de usuarios y configuración
- ✅ Eliminación de recursos
- ✅ Asignación de precios en cotizaciones

### Líder de Equipo
- ✅ Gestión de cotizaciones y precios
- ✅ Asignación de órdenes de trabajo
- ✅ Gestión de emergencias
- ✅ Reportes y dashboard
- ❌ Gestión de usuarios del sistema

### Técnico
- ✅ Visualización de activos y clientes
- ✅ Creación y edición de items en cotizaciones (sin precios)
- ✅ Ejecución de órdenes de trabajo asignadas
- ✅ Atención de emergencias asignadas
- ❌ Visualización de precios en cotizaciones
- ❌ Asignación de trabajos a otros técnicos

## Rate Limiting

| Endpoint | Límite |
|----------|--------|
| `/auth/login` | 5 req/min por IP |
| `/auth/refresh` | 10 req/min por usuario |
| API General | 100 req/min por usuario |
| Uploads | 10 req/min por usuario |

## Paginación

Para endpoints que retornan listas grandes:

```http
GET /activos?page=1&limit=20&sortBy=nombre&sortOrder=asc
```

**Respuesta:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Filtros y Búsqueda

### Filtros Comunes
```http
GET /activos?search=bomba&estado=operativo&clienteId={uuid}
GET /cotizaciones?estado=en_revision&desde=2025-09-01&hasta=2025-09-30
GET /ordenes-trabajo?tipo=mantenimiento&prioridad=alta&asignadoA={userId}
```

### Operadores de Búsqueda
- `search`: Búsqueda de texto en campos principales
- `desde/hasta`: Rango de fechas
- `estado`: Filtro por estado específico
- `tipo`: Filtro por tipo de recurso

## Webhooks

### Registrar Webhook
```http
POST /webhooks
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://mi-sistema.com/webhook/asc",
  "eventos": ["cotizacion.aprobada", "emergencia.creada", "ot.cerrada"],
  "activo": true
}
```

### Eventos Disponibles
- `cotizacion.creada`
- `cotizacion.aprobada`
- `cotizacion.rechazada`
- `ot.creada`
- `ot.asignada`
- `ot.cerrada`
- `emergencia.creada`
- `emergencia.resuelta`
- `activo.detenido`

### Formato de Webhook
```json
{
  "evento": "cotizacion.aprobada",
  "timestamp": "2025-09-28T21:30:00Z",
  "empresaId": "uuid",
  "data": {
    "cotizacionId": "uuid",
    "numero": "COT-2025-001",
    "total": 1011500,
    "clienteId": "uuid",
    "activoId": "uuid"
  }
}
```

## Manejo de Errores

### Formato de Error Estándar
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Email must be a valid email address"
    }
  ],
  "timestamp": "2025-09-28T21:30:00Z",
  "path": "/api/usuarios"
}
```

### Errores de Validación
```json
{
  "statusCode": 422,
  "message": "Validation failed",
  "error": "Unprocessable Entity",
  "details": [
    {
      "field": "empresaCodigo",
      "message": "Solo se permiten letras mayúsculas, números y guiones"
    },
    {
      "field": "password",
      "message": "La contraseña debe tener al menos 6 caracteres"
    }
  ]
}
```

## Versionado

La API utiliza versionado en la URL:

```
/api/v1/cotizaciones  # Versión 1 (actual)
/api/v2/cotizaciones  # Versión 2 (futura)
```

### Política de Deprecación
- Las versiones se mantienen por **12 meses** después del lanzamiento de la nueva versión
- Se notifica con **3 meses** de anticipación sobre deprecaciones
- Headers de deprecación en respuestas de versiones antiguas

## Ejemplos de Uso

### Flujo Completo: Cotización → Reparación

```javascript
// 1. Crear cotización
const cotizacion = await fetch('/api/cotizaciones', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    clienteId: 'uuid-cliente',
    activoId: 'uuid-activo',
    titulo: 'Reparación Bomba Principal'
  })
});

// 2. Agregar items (técnico)
await fetch(`/api/cotizaciones/${cotizacion.id}/items`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    descripcion: 'Cambio de impulsor',
    cantidad: 1,
    urgencia: 'alta'
  })
});

// 3. Asignar precios (líder)
await fetch(`/api/cotizaciones/${cotizacion.id}/asignar-precios`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    items: [{
      itemId: 'uuid-item',
      cantidad: 1,
      precioUnitario: 350000
    }],
    porcentajeImpuestos: 19
  })
});

// 4. Aprobar cotización
await fetch(`/api/cotizaciones/${cotizacion.id}/estado`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    estado: 'aprobada'
  })
});

// 5. Automáticamente se crea OT de reparación
// 6. Ejecutar reparación con evidencias
// 7. Generar PDF combinado
```

## SDKs y Librerías

### JavaScript/TypeScript
```bash
npm install @asc/sdk
```

```typescript
import { ASCClient } from '@asc/sdk';

const client = new ASCClient({
  baseURL: 'https://api.asc.com',
  apiKey: 'your-api-key'
});

const cotizaciones = await client.cotizaciones.list();
```

### Python
```bash
pip install asc-python-sdk
```

```python
from asc_sdk import ASCClient

client = ASCClient(
    base_url='https://api.asc.com',
    api_key='your-api-key'
)

cotizaciones = client.cotizaciones.list()
```

## Soporte

- **Documentación**: https://docs.asc.com
- **Swagger UI**: https://api.asc.com/docs
- **Soporte**: soporte@asc.com
- **Status**: https://status.asc.com

---

**Última actualización**: Septiembre 2024  
**Versión API**: v1.0.0
