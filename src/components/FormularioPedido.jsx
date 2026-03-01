import { useState } from 'react'
import { enviarPedido } from '../lib/supabase'
import './FormularioPedido.css'

const MEDIDAS_PALET = ['80x120', '100x120', '80x100', '100x100', 'Otro']

function FormularioPedido() {
  const [origen, setOrigen] = useState('')
  const [destino, setDestino] = useState('')
  const [peso, setPeso] = useState('')
  const [servicioEspecial, setServicioEspecial] = useState(false)
  const [palets, setPalets] = useState([
    { cantidad: '', medida: '', medidaCustom: '', remontable: true }
  ])
  const [errores, setErrores] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState(null)

  const agregarPalet = () => {
    setPalets([...palets, { cantidad: '', medida: '', medidaCustom: '', remontable: true }])
  }

  const quitarPalet = (index) => {
    if (palets.length > 1) {
      setPalets(palets.filter((_, i) => i !== index))
    }
  }

  const actualizarPalet = (index, campo, valor) => {
    const nuevos = [...palets]
    nuevos[index] = { ...nuevos[index], [campo]: valor }
    setPalets(nuevos)
  }

  const validar = () => {
    const err = {}
    if (!origen.trim()) err.origen = 'El origen es obligatorio'
    if (!destino.trim()) err.destino = 'El destino es obligatorio'
    if (!peso.trim()) err.peso = 'El peso es obligatorio'
    else if (isNaN(parseFloat(peso)) || parseFloat(peso) <= 0) err.peso = 'Introduce un peso válido (kg)'

    palets.forEach((p, i) => {
      if (!p.cantidad || parseInt(p.cantidad) < 1) {
        err[`palet_${i}_cantidad`] = 'Cantidad obligatoria'
      }
      const medida = p.medida === 'Otro' ? p.medidaCustom : p.medida
      if (!medida?.trim()) {
        err[`palet_${i}_medida`] = 'Las medidas son obligatorias'
      }
    })

    setErrores(err)
    return Object.keys(err).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMensaje(null)

    if (!validar()) return

    setEnviando(true)
    try {
      const pedido = {
        origen: origen.trim(),
        destino: destino.trim(),
        peso: parseFloat(peso),
        servicio_especial: servicioEspecial,
        palets: palets.map(p => ({
          cantidad: parseInt(p.cantidad),
          medida: p.medida === 'Otro' ? p.medidaCustom.trim() : p.medida,
          remontable: p.remontable
        }))
      }

      const { error } = await enviarPedido(pedido)

      if (error) throw error

      setMensaje({ tipo: 'exito', texto: 'Pedido registrado correctamente' })
      setOrigen('')
      setDestino('')
      setPeso('')
      setServicioEspecial(false)
      setPalets([{ cantidad: '', medida: '', medidaCustom: '', remontable: true }])
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message || 'Error al registrar el pedido' })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="formulario-pedido" onSubmit={handleSubmit}>
      <div className="form-section">
        <h2>Datos del envío</h2>

        <div className="form-group">
          <label htmlFor="origen">Origen *</label>
          <input
            id="origen"
            type="text"
            value={origen}
            onChange={(e) => setOrigen(e.target.value)}
            placeholder="Ej: Almacén Central, Madrid"
            className={errores.origen ? 'error' : ''}
          />
          {errores.origen && <span className="error-msg">{errores.origen}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="destino">Destino *</label>
          <input
            id="destino"
            type="text"
            value={destino}
            onChange={(e) => setDestino(e.target.value)}
            placeholder="Ej: Sucursal Barcelona"
            className={errores.destino ? 'error' : ''}
          />
          {errores.destino && <span className="error-msg">{errores.destino}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="peso">Peso total (kg) *</label>
          <input
            id="peso"
            type="number"
            step="0.01"
            min="0"
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
            placeholder="Ej: 1500"
            className={errores.peso ? 'error' : ''}
          />
          {errores.peso && <span className="error-msg">{errores.peso}</span>}
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={servicioEspecial}
              onChange={(e) => setServicioEspecial(e.target.checked)}
            />
            <span>¿Requiere servicio especial?</span>
          </label>
        </div>
      </div>

      <div className="form-section">
        <div className="section-header">
          <h2>Palets</h2>
          <button type="button" className="btn-add" onClick={agregarPalet}>
            + Añadir tipo de palet
          </button>
        </div>

        {palets.map((palet, index) => (
          <div key={index} className="palet-block">
            <div className="palet-header">
              <span>Tipo de palet {palets.length > 1 ? index + 1 : ''}</span>
              {palets.length > 1 && (
                <button type="button" className="btn-remove" onClick={() => quitarPalet(index)}>
                  Eliminar
                </button>
              )}
            </div>

            <div className="palet-fields">
              <div className="form-group">
                <label>Cantidad *</label>
                <input
                  type="number"
                  min="1"
                  value={palet.cantidad}
                  onChange={(e) => actualizarPalet(index, 'cantidad', e.target.value)}
                  placeholder="Ej: 4"
                  className={errores[`palet_${index}_cantidad`] ? 'error' : ''}
                />
                {errores[`palet_${index}_cantidad`] && (
                  <span className="error-msg">{errores[`palet_${index}_cantidad`]}</span>
                )}
              </div>

              <div className="form-group">
                <label>Medidas (cm) *</label>
                <select
                  value={palet.medida}
                  onChange={(e) => actualizarPalet(index, 'medida', e.target.value)}
                  className={errores[`palet_${index}_medida`] ? 'error' : ''}
                >
                  <option value="">Selecciona medida</option>
                  {MEDIDAS_PALET.map(m => (
                    <option key={m} value={m}>{m} cm</option>
                  ))}
                </select>
                {palet.medida === 'Otro' && (
                  <input
                    type="text"
                    value={palet.medidaCustom}
                    onChange={(e) => actualizarPalet(index, 'medidaCustom', e.target.value)}
                    placeholder="Ej: 90x110"
                    className="input-inline"
                  />
                )}
                {errores[`palet_${index}_medida`] && (
                  <span className="error-msg">{errores[`palet_${index}_medida`]}</span>
                )}
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={palet.remontable}
                    onChange={(e) => actualizarPalet(index, 'remontable', e.target.checked)}
                  />
                  <span>Remontable</span>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {mensaje && (
        <div className={`mensaje mensaje-${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      <button type="submit" className="btn-submit" disabled={enviando}>
        {enviando ? 'Enviando...' : 'Registrar pedido'}
      </button>
    </form>
  )
}

export default FormularioPedido
