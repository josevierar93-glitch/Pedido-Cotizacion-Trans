-- ============================================
-- Esquema para Gestión de Pedidos de Transporte
-- Ejecuta este script en el SQL Editor de Supabase
-- ============================================

-- Tabla principal de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origen TEXT NOT NULL,
  cp_origen TEXT NOT NULL,
  destino TEXT NOT NULL,
  cp_destino TEXT NOT NULL,
  servicio_especial BOOLEAN NOT NULL DEFAULT FALSE,
  tipo_servicio_especial TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de palets por pedido (permite múltiples tipos de palets por pedido)
CREATE TABLE IF NOT EXISTS pedido_palets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  medida TEXT NOT NULL,
  peso DECIMAL(10, 2) NOT NULL CHECK (peso > 0),
  remontable BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at ON pedidos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pedido_palets_pedido_id ON pedido_palets(pedido_id);

-- Habilitar Row Level Security (RLS) - opcional pero recomendado
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedido_palets ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir inserción y lectura
CREATE POLICY "Permitir inserción en pedidos" ON pedidos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir lectura de pedidos" ON pedidos
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserción en pedido_palets" ON pedido_palets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir lectura de pedido_palets" ON pedido_palets
  FOR SELECT USING (true);

-- ============================================
-- Si ya tenías tablas creadas, ejecuta esto para actualizarlas:
-- ============================================
-- ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS cp_origen TEXT;
-- ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS cp_destino TEXT;
-- ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS tipo_servicio_especial TEXT;
-- ALTER TABLE pedidos DROP COLUMN IF EXISTS peso;
-- ALTER TABLE pedido_palets ADD COLUMN IF NOT EXISTS peso DECIMAL(10, 2) CHECK (peso > 0);
