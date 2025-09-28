-- Seeds para empresa demo con usuarios y datos de prueba
-- Este script debe ejecutarse después de 001_initial_schema.sql

-- Insertar empresa demo
INSERT INTO empresas (id, codigo, nombre, email, telefono, direccion, activa) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'DEMO', 'Empresa Demo ASC', 'admin@demo.asc.com', '+56912345678', 'Av. Providencia 1234, Santiago, Chile', true);

-- Configurar contexto para la empresa demo
SELECT set_config('app.empresa_id', '550e8400-e29b-41d4-a716-446655440000', false);

-- Insertar usuarios demo
INSERT INTO usuarios (id, empresa_id, username, email, password_hash, rol, nombre, apellido, telefono, activo) VALUES
-- Admin (password: admin123)
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'admin', 'admin@demo.asc.com', '$2b$10$K7L/8Y1t85D3K7L/8Y1t8.K7L/8Y1t85D3K7L/8Y1t85D3K7L/8Y1t8O', 'admin', 'Carlos', 'Administrador', '+56987654321', true),
-- Líder de equipo (password: lider123)
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'lider1', 'lider@demo.asc.com', '$2b$10$L8M/9Z2u96E4L8M/9Z2u9.L8M/9Z2u96E4L8M/9Z2u96E4L8M/9Z2u9P', 'lider_equipo', 'María', 'Líder', '+56987654322', true),
-- Técnico 1 (password: tecnico123)
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'tecnico1', 'tecnico1@demo.asc.com', '$2b$10$M9N/0A3v07F5M9N/0A3v0.M9N/0A3v07F5M9N/0A3v07F5M9N/0A3v0Q', 'tecnico', 'Juan', 'Técnico', '+56987654323', true),
-- Técnico 2 (password: tecnico123)
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'tecnico2', 'tecnico2@demo.asc.com', '$2b$10$N0O/1B4w18G6N0O/1B4w1.N0O/1B4w18G6N0O/1B4w18G6N0O/1B4w1R', 'tecnico', 'Ana', 'Técnica', '+56987654324', true);

-- Insertar clientes demo
INSERT INTO clientes (id, empresa_id, codigo, nombre, email, telefono, direccion, contacto_principal, activo) VALUES
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'CLI001', 'Minera Los Andes S.A.', 'contacto@mineralosandes.cl', '+56223456789', 'Camino Minero Km 45, Región de Atacama', 'Pedro Supervisor', true),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'CLI002', 'Planta Procesadora Norte', 'mantenimiento@plantanorte.cl', '+56234567890', 'Zona Industrial Norte, Antofagasta', 'Carmen Jefe Mantto', true),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 'CLI003', 'Fábrica Textil Central', 'operaciones@textilcentral.cl', '+56245678901', 'Parque Industrial Central, Santiago', 'Roberto Operaciones', true);

-- Insertar activos demo
INSERT INTO activos (id, empresa_id, cliente_id, codigo, nombre, descripcion, marca, modelo, numero_serie, ubicacion, estado, criticidad, fecha_instalacion, valor_compra) VALUES
-- Activos Minera Los Andes
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440010', 'EQ001', 'Chancador Primario', 'Chancador de mandíbulas para mineral', 'Metso', 'C160', 'MET-C160-2019-001', 'Planta Chancado - Nivel 1', 'operativo', 'critica', '2019-03-15', 2500000.00),
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440010', 'EQ002', 'Correa Transportadora A1', 'Correa principal de transporte de mineral', 'Continental', 'CT-1200', 'CON-CT1200-2020-002', 'Túnel Principal - Tramo A', 'operativo', 'alta', '2020-01-20', 450000.00),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440010', 'EQ003', 'Bomba Centrífuga Principal', 'Bomba de agua para proceso', 'Grundfos', 'NK-200', 'GRU-NK200-2018-003', 'Sala de Bombas - Sector B', 'detenido', 'alta', '2018-11-10', 180000.00),
-- Activos Planta Procesadora Norte
('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440011', 'EQ004', 'Molino SAG', 'Molino semi-autógeno', 'FLSmidth', 'SAG-28x12', 'FLS-SAG28-2021-004', 'Planta Molienda - Área Central', 'operativo', 'critica', '2021-06-01', 8500000.00),
('550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440011', 'EQ005', 'Compresor de Aire', 'Compresor principal de planta', 'Atlas Copco', 'GA-315', 'ATC-GA315-2020-005', 'Sala Compresores - Nivel 2', 'mantenimiento', 'media', '2020-09-15', 320000.00),
-- Activos Fábrica Textil
('550e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440012', 'EQ006', 'Telar Automático 1', 'Telar de alta velocidad', 'Picanol', 'OMNIplus-800', 'PIC-OM800-2019-006', 'Sala Producción - Línea A', 'operativo', 'alta', '2019-08-20', 750000.00),
('550e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440012', 'EQ007', 'Caldero Industrial', 'Generador de vapor para proceso', 'Babcock Wanson', 'WNS-6', 'BWW-WNS6-2017-007', 'Sala Calderos - Planta Baja', 'operativo', 'critica', '2017-04-12', 420000.00);

-- Insertar formularios base
INSERT INTO formularios (id, empresa_id, nombre, descripcion, ambito, activo, configuracion) VALUES
('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440000', 'Mantenimiento Preventivo General', 'Formulario estándar para mantenimientos preventivos', 'mantenimiento', true, '{"requiere_firma": true, "permite_fotos": true}'),
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440000', 'Inspección de Seguridad', 'Checklist de seguridad pre-trabajo', 'inspeccion', true, '{"requiere_firma": true, "permite_fotos": false}'),
('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440000', 'Atención de Emergencia', 'Formulario para registro de emergencias', 'emergencia', true, '{"requiere_firma": true, "permite_fotos": true}'),
('550e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440000', 'Reparación Correctiva', 'Formulario para trabajos de reparación', 'reparacion', true, '{"requiere_firma": true, "permite_fotos": true}');

-- Insertar campos de formularios
INSERT INTO form_campos (id, empresa_id, formulario_id, nombre, etiqueta, tipo, requerido, orden, opciones, validaciones) VALUES
-- Campos para Mantenimiento Preventivo General
('550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440030', 'estado_inicial', 'Estado inicial del equipo', 'select', true, 1, '["Operativo", "Detenido", "Con fallas menores"]', '{}'),
('550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440030', 'actividades_realizadas', 'Actividades realizadas', 'checklist', true, 2, '["Lubricación", "Limpieza", "Inspección visual", "Medición de vibraciones", "Cambio de filtros", "Ajuste de tensiones"]', '{}'),
('550e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440030', 'observaciones', 'Observaciones generales', 'text', false, 3, '[]', '{}'),
('550e8400-e29b-41d4-a716-446655440043', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440030', 'fotos_evidencia', 'Fotos de evidencia', 'photo', false, 4, '[]', '{"max_files": 5}'),
('550e8400-e29b-41d4-a716-446655440044', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440030', 'estado_final', 'Estado final del equipo', 'select', true, 5, '["Operativo", "Detenido", "Requiere reparación"]', '{}'),
('550e8400-e29b-41d4-a716-446655440045', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440030', 'firma_tecnico', 'Firma del técnico', 'signature', true, 6, '[]', '{}'),

-- Campos para Inspección de Seguridad
('550e8400-e29b-41d4-a716-446655440046', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440031', 'epp_completo', 'EPP completo y en buen estado', 'select', true, 1, '["Sí", "No", "Parcial"]', '{}'),
('550e8400-e29b-41d4-a716-446655440047', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440031', 'area_segura', 'Área de trabajo segura', 'select', true, 2, '["Sí", "No"]', '{}'),
('550e8400-e29b-41d4-a716-446655440048', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440031', 'herramientas_ok', 'Herramientas en buen estado', 'select', true, 3, '["Sí", "No"]', '{}'),
('550e8400-e29b-41d4-a716-446655440049', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440031', 'firma_supervisor', 'Firma del supervisor', 'signature', true, 4, '[]', '{}');

-- Insertar planes de mantenimiento demo
INSERT INTO planes_mantenimiento (id, empresa_id, activo_id, nombre, descripcion, periodicidad, intervalo_dias, formulario_id, activo, proxima_ejecucion) VALUES
('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440020', 'Mantenimiento Mensual Chancador', 'Lubricación y inspección mensual', 'mensual', 30, '550e8400-e29b-41d4-a716-446655440030', true, '2025-10-15'),
('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440021', 'Inspección Trimestral Correa', 'Revisión de rodillos y tensión', 'trimestral', 90, '550e8400-e29b-41d4-a716-446655440030', true, '2025-11-01'),
('550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440023', 'Mantenimiento Semestral Molino SAG', 'Cambio de revestimientos y lubricación', 'semestral', 180, '550e8400-e29b-41d4-a716-446655440030', true, '2025-12-01');

-- Insertar cotización demo
INSERT INTO cotizaciones (id, empresa_id, cliente_id, activo_id, numero, estado, titulo, descripcion, subtotal, impuestos, total, creado_por) VALUES
('550e8400-e29b-41d4-a716-446655440060', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440022', 'COT-2025-001', 'en_revision', 'Reparación Bomba Centrífuga Principal', 'Reparación completa de bomba con cambio de impulsores y sellos', 850000.00, 161500.00, 1011500.00, '550e8400-e29b-41d4-a716-446655440003');

-- Insertar items de cotización demo
INSERT INTO cotizacion_items (id, empresa_id, cotizacion_id, descripcion, cantidad, precio_unitario, subtotal, urgencia, agregado_por, precio_asignado_por) VALUES
('550e8400-e29b-41d4-a716-446655440070', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440060', 'Cambio de impulsor principal', 1.00, 350000.00, 350000.00, 'alta', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440060', 'Reemplazo de sellos mecánicos', 2.00, 125000.00, 250000.00, 'alta', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440072', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440060', 'Balanceamiento dinámico', 1.00, 150000.00, 150000.00, 'media', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440073', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440060', 'Mano de obra especializada', 8.00, 12500.00, 100000.00, 'media', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002');

-- Insertar orden de trabajo demo
INSERT INTO ordenes_trabajo (id, empresa_id, numero, tipo, estado, prioridad, activo_id, cliente_id, titulo, descripcion, asignado_a, creado_por, fecha_programada, formulario_id) VALUES
('550e8400-e29b-41d4-a716-446655440080', '550e8400-e29b-41d4-a716-446655440000', 'OT-2025-001', 'mantenimiento', 'asignada', 'media', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440010', 'Mantenimiento Preventivo Chancador', 'Lubricación y inspección general del chancador primario', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', '2025-10-15 08:00:00', '550e8400-e29b-41d4-a716-446655440030');

-- Insertar emergencia demo
INSERT INTO emergencias (id, empresa_id, activo_id, cliente_id, numero, estado, descripcion, reportado_por, telefono_contacto, hora_llamada, asignado_a, sla_minutos) VALUES
('550e8400-e29b-41d4-a716-446655440090', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440010', 'EMG-2025-001', 'asignada', 'Bomba centrífuga con ruido anormal y vibración excesiva', 'Pedro Supervisor', '+56987654321', '2025-09-28 14:30:00', '550e8400-e29b-41d4-a716-446655440003', 240);

-- Insertar registros de bitácora demo
INSERT INTO bitacora (id, empresa_id, activo_id, tipo, descripcion, orden_trabajo_id, usuario_id, fecha) VALUES
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440020', 'mantenimiento', 'Mantenimiento preventivo completado exitosamente', '550e8400-e29b-41d4-a716-446655440080', '550e8400-e29b-41d4-a716-446655440003', '2025-09-15 16:30:00'),
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440022', 'cambio_estado', 'Equipo detenido por falla en bomba', null, '550e8400-e29b-41d4-a716-446655440003', '2025-09-28 14:35:00'),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440021', 'inspeccion', 'Inspección rutinaria - equipo en buen estado', null, '550e8400-e29b-41d4-a716-446655440004', '2025-09-20 10:15:00');

-- Insertar ajustes de empresa demo
INSERT INTO ajustes_empresa (id, empresa_id, desvios_en_terreno_enabled, qr_nfc_enabled, alert_rules, branding) VALUES
('550e8400-e29b-41d4-a716-446655440110', '550e8400-e29b-41d4-a716-446655440000', true, true, 
'{"pct_detenidos_threshold": 15, "sla_riesgo_threshold": 85, "vencimientos_dias": 5}',
'{"logo_url": "", "color_primario": "#1f2937", "color_secundario": "#3b82f6", "nombre_sistema": "ASC Demo"}');

-- Limpiar contexto
SELECT set_config('app.empresa_id', '', false);
