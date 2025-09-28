-- DDL v0.5 - Schema inicial con RLS multi-tenant
-- Todas las tablas incluyen empresa_id para aislamiento de datos

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Función para obtener empresa_id del contexto
CREATE OR REPLACE FUNCTION get_current_empresa_id() RETURNS UUID AS $$
BEGIN
  RETURN COALESCE(
    NULLIF(current_setting('app.empresa_id', true), '')::UUID,
    '00000000-0000-0000-0000-000000000000'::UUID
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tabla empresas (sin RLS, es la base del multi-tenant)
CREATE TABLE empresas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefono VARCHAR(50),
  direccion TEXT,
  logo_url VARCHAR(500),
  activa BOOLEAN DEFAULT true,
  configuracion JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla usuarios
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(50) NOT NULL CHECK (rol IN ('admin', 'lider_equipo', 'tecnico')),
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255),
  telefono VARCHAR(50),
  activo BOOLEAN DEFAULT true,
  ultimo_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(empresa_id, username),
  UNIQUE(empresa_id, email)
);

-- Tabla clientes
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  codigo VARCHAR(50) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefono VARCHAR(50),
  direccion TEXT,
  contacto_principal VARCHAR(255),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(empresa_id, codigo)
);

-- Tabla activos
CREATE TABLE activos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  codigo VARCHAR(100) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  marca VARCHAR(100),
  modelo VARCHAR(100),
  numero_serie VARCHAR(100),
  ubicacion VARCHAR(255),
  estado VARCHAR(50) DEFAULT 'operativo' CHECK (estado IN ('operativo', 'detenido', 'mantenimiento', 'fuera_servicio')),
  criticidad VARCHAR(20) DEFAULT 'media' CHECK (criticidad IN ('baja', 'media', 'alta', 'critica')),
  fecha_instalacion DATE,
  valor_compra DECIMAL(15,2),
  vida_util_anos INTEGER,
  qr_code VARCHAR(255),
  nfc_tag VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(empresa_id, codigo)
);

-- Tabla formularios
CREATE TABLE formularios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  ambito VARCHAR(50) NOT NULL CHECK (ambito IN ('mantenimiento', 'inspeccion', 'emergencia', 'reparacion')),
  activo BOOLEAN DEFAULT true,
  configuracion JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla form_campos
CREATE TABLE form_campos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  formulario_id UUID NOT NULL REFERENCES formularios(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  etiqueta VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('text', 'number', 'date', 'select', 'multiselect', 'checklist', 'photo', 'signature')),
  requerido BOOLEAN DEFAULT false,
  orden INTEGER NOT NULL,
  opciones JSONB DEFAULT '[]',
  validaciones JSONB DEFAULT '{}',
  dependencias JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla planes_mantenimiento
CREATE TABLE planes_mantenimiento (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  activo_id UUID NOT NULL REFERENCES activos(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  periodicidad VARCHAR(50) NOT NULL CHECK (periodicidad IN ('mensual', 'trimestral', 'semestral', 'anual', 'custom')),
  intervalo_dias INTEGER,
  formulario_id UUID REFERENCES formularios(id),
  activo BOOLEAN DEFAULT true,
  proxima_ejecucion DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla cotizaciones
CREATE TABLE cotizaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  activo_id UUID NOT NULL REFERENCES activos(id) ON DELETE CASCADE,
  numero VARCHAR(50) NOT NULL,
  estado VARCHAR(50) DEFAULT 'borrador' CHECK (estado IN ('borrador', 'en_revision', 'lista_envio', 'enviada', 'aprobada', 'rechazada', 'cerrada')),
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  subtotal DECIMAL(15,2) DEFAULT 0,
  impuestos DECIMAL(15,2) DEFAULT 0,
  total DECIMAL(15,2) DEFAULT 0,
  validez_dias INTEGER DEFAULT 30,
  creado_por UUID NOT NULL REFERENCES usuarios(id),
  aprobado_por UUID REFERENCES usuarios(id),
  fecha_aprobacion TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(empresa_id, numero)
);

-- Tabla cotizacion_items
CREATE TABLE cotizacion_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cotizacion_id UUID NOT NULL REFERENCES cotizaciones(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  cantidad DECIMAL(10,2) NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(15,2) DEFAULT 0,
  subtotal DECIMAL(15,2) DEFAULT 0,
  urgencia VARCHAR(20) DEFAULT 'media' CHECK (urgencia IN ('baja', 'media', 'alta')),
  agregado_por UUID NOT NULL REFERENCES usuarios(id),
  precio_asignado_por UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla ordenes_trabajo
CREATE TABLE ordenes_trabajo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  numero VARCHAR(50) NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('mantenimiento', 'reparacion', 'emergencia', 'inspeccion')),
  estado VARCHAR(50) DEFAULT 'nueva' CHECK (estado IN ('nueva', 'asignada', 'en_curso', 'en_espera', 'cerrada', 'cancelada')),
  prioridad VARCHAR(20) DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta', 'critica')),
  activo_id UUID NOT NULL REFERENCES activos(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  cotizacion_id UUID REFERENCES cotizaciones(id),
  plan_mantenimiento_id UUID REFERENCES planes_mantenimiento(id),
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  asignado_a UUID REFERENCES usuarios(id),
  creado_por UUID NOT NULL REFERENCES usuarios(id),
  fecha_programada TIMESTAMP WITH TIME ZONE,
  fecha_inicio TIMESTAMP WITH TIME ZONE,
  fecha_fin TIMESTAMP WITH TIME ZONE,
  tiempo_estimado_horas DECIMAL(5,2),
  tiempo_real_horas DECIMAL(5,2),
  formulario_id UUID REFERENCES formularios(id),
  respuestas_formulario JSONB DEFAULT '{}',
  observaciones TEXT,
  motivo_cancelacion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(empresa_id, numero)
);

-- Tabla ot_reparacion_items
CREATE TABLE ot_reparacion_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  orden_trabajo_id UUID NOT NULL REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
  cotizacion_item_id UUID REFERENCES cotizacion_items(id),
  descripcion TEXT NOT NULL,
  estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completado', 'parcial', 'no_realizado')),
  observaciones TEXT,
  fotos_antes JSONB DEFAULT '[]',
  fotos_despues JSONB DEFAULT '[]',
  tiempo_horas DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla emergencias
CREATE TABLE emergencias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  activo_id UUID NOT NULL REFERENCES activos(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  numero VARCHAR(50) NOT NULL,
  estado VARCHAR(50) DEFAULT 'llamada' CHECK (estado IN ('llamada', 'asignada', 'en_ruta', 'en_sitio', 'resuelta', 'cerrada')),
  descripcion TEXT NOT NULL,
  reportado_por VARCHAR(255),
  telefono_contacto VARCHAR(50),
  hora_llamada TIMESTAMP WITH TIME ZONE NOT NULL,
  hora_asignacion TIMESTAMP WITH TIME ZONE,
  hora_llegada TIMESTAMP WITH TIME ZONE,
  hora_cierre TIMESTAMP WITH TIME ZONE,
  asignado_a UUID REFERENCES usuarios(id),
  sla_minutos INTEGER DEFAULT 240, -- 4 horas por defecto
  cumple_sla BOOLEAN,
  estado_final_activo VARCHAR(50) CHECK (estado_final_activo IN ('operativo', 'detenido')),
  orden_trabajo_id UUID REFERENCES ordenes_trabajo(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(empresa_id, numero)
);

-- Tabla bitacora
CREATE TABLE bitacora (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  activo_id UUID NOT NULL REFERENCES activos(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('mantenimiento', 'reparacion', 'emergencia', 'inspeccion', 'cambio_estado')),
  descripcion TEXT NOT NULL,
  orden_trabajo_id UUID REFERENCES ordenes_trabajo(id),
  emergencia_id UUID REFERENCES emergencias(id),
  cotizacion_id UUID REFERENCES cotizaciones(id),
  usuario_id UUID REFERENCES usuarios(id),
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadatos JSONB DEFAULT '{}'
);

-- Tabla ajustes_empresa
CREATE TABLE ajustes_empresa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  desvios_en_terreno_enabled BOOLEAN DEFAULT false,
  qr_nfc_enabled BOOLEAN DEFAULT true,
  alert_rules JSONB DEFAULT '{"pct_detenidos_threshold": 20, "sla_riesgo_threshold": 80, "vencimientos_dias": 7}',
  branding JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(empresa_id)
);

-- Habilitar RLS en todas las tablas (excepto empresas)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activos ENABLE ROW LEVEL SECURITY;
ALTER TABLE formularios ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_campos ENABLE ROW LEVEL SECURITY;
ALTER TABLE planes_mantenimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizacion_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_trabajo ENABLE ROW LEVEL SECURITY;
ALTER TABLE ot_reparacion_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE bitacora ENABLE ROW LEVEL SECURITY;
ALTER TABLE ajustes_empresa ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para usuarios
CREATE POLICY usuarios_empresa_policy ON usuarios
  FOR ALL USING (empresa_id = get_current_empresa_id());

-- Políticas RLS para clientes
CREATE POLICY clientes_empresa_policy ON clientes
  FOR ALL USING (empresa_id = get_current_empresa_id());

-- Políticas RLS para activos
CREATE POLICY activos_empresa_policy ON activos
  FOR ALL USING (empresa_id = get_current_empresa_id());

-- Políticas RLS para formularios
CREATE POLICY formularios_empresa_policy ON formularios
  FOR ALL USING (empresa_id = get_current_empresa_id());

-- Políticas RLS para form_campos
CREATE POLICY form_campos_empresa_policy ON form_campos
  FOR ALL USING (empresa_id = get_current_empresa_id());

-- Políticas RLS para planes_mantenimiento
CREATE POLICY planes_mantenimiento_empresa_policy ON planes_mantenimiento
  FOR ALL USING (empresa_id = get_current_empresa_id());

-- Políticas RLS para cotizaciones
CREATE POLICY cotizaciones_empresa_policy ON cotizaciones
  FOR ALL USING (empresa_id = get_current_empresa_id());

-- Políticas RLS para cotizacion_items
CREATE POLICY cotizacion_items_empresa_policy ON cotizacion_items
  FOR ALL USING (empresa_id = get_current_empresa_id());

-- Políticas RLS para ordenes_trabajo
CREATE POLICY ordenes_trabajo_empresa_policy ON ordenes_trabajo
  FOR ALL USING (empresa_id = get_current_empresa_id());

-- Políticas RLS para ot_reparacion_items
CREATE POLICY ot_reparacion_items_empresa_policy ON ot_reparacion_items
  FOR ALL USING (empresa_id = get_current_empresa_id());

-- Políticas RLS para emergencias
CREATE POLICY emergencias_empresa_policy ON emergencias
  FOR ALL USING (empresa_id = get_current_empresa_id());

-- Políticas RLS para bitacora
CREATE POLICY bitacora_empresa_policy ON bitacora
  FOR ALL USING (empresa_id = get_current_empresa_id());

-- Políticas RLS para ajustes_empresa
CREATE POLICY ajustes_empresa_policy ON ajustes_empresa
  FOR ALL USING (empresa_id = get_current_empresa_id());

-- Índices para optimización
CREATE INDEX idx_usuarios_empresa_id ON usuarios(empresa_id);
CREATE INDEX idx_usuarios_username ON usuarios(empresa_id, username);
CREATE INDEX idx_clientes_empresa_id ON clientes(empresa_id);
CREATE INDEX idx_activos_empresa_id ON activos(empresa_id);
CREATE INDEX idx_activos_cliente_id ON activos(cliente_id);
CREATE INDEX idx_ordenes_trabajo_empresa_id ON ordenes_trabajo(empresa_id);
CREATE INDEX idx_ordenes_trabajo_activo_id ON ordenes_trabajo(activo_id);
CREATE INDEX idx_ordenes_trabajo_estado ON ordenes_trabajo(empresa_id, estado);
CREATE INDEX idx_emergencias_empresa_id ON emergencias(empresa_id);
CREATE INDEX idx_emergencias_estado ON emergencias(empresa_id, estado);
CREATE INDEX idx_bitacora_activo_id ON bitacora(activo_id);
CREATE INDEX idx_bitacora_fecha ON bitacora(empresa_id, fecha DESC);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_empresas_updated_at BEFORE UPDATE ON empresas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activos_updated_at BEFORE UPDATE ON activos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_planes_mantenimiento_updated_at BEFORE UPDATE ON planes_mantenimiento
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cotizaciones_updated_at BEFORE UPDATE ON cotizaciones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cotizacion_items_updated_at BEFORE UPDATE ON cotizacion_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ordenes_trabajo_updated_at BEFORE UPDATE ON ordenes_trabajo
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ot_reparacion_items_updated_at BEFORE UPDATE ON ot_reparacion_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergencias_updated_at BEFORE UPDATE ON emergencias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ajustes_empresa_updated_at BEFORE UPDATE ON ajustes_empresa
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
