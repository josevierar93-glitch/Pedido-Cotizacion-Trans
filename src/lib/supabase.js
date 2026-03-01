import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

let supabase = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export async function enviarPedido(pedido) {
  if (!supabase) {
    return {
      error: { message: 'Supabase no configurado. Crea un archivo .env con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY' }
    }
  }

  const { data: pedidoData, error: errorPedido } = await supabase
    .from('pedidos')
    .insert({
      origen: pedido.origen,
      cp_origen: pedido.cp_origen,
      destino: pedido.destino,
      cp_destino: pedido.cp_destino,
      servicio_especial: pedido.servicio_especial
    })
    .select('id')
    .single()

  if (errorPedido) return { error: errorPedido }

  const paletsParaInsertar = pedido.palets.map(p => ({
    pedido_id: pedidoData.id,
    cantidad: p.cantidad,
    medida: p.medida,
    peso: p.peso,
    remontable: p.remontable
  }))

  const { error: errorPalets } = await supabase
    .from('pedido_palets')
    .insert(paletsParaInsertar)

  if (errorPalets) return { error: errorPalets }

  return { data: pedidoData, error: null }
}
