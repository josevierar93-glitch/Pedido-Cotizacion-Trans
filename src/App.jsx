import FormularioPedido from './components/FormularioPedido'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Gestión de Pedidos de Transporte</h1>
        <p>Solicitud de transporte entre departamentos</p>
      </header>
      <main className="app-main">
        <FormularioPedido />
      </main>
    </div>
  )
}

export default App
