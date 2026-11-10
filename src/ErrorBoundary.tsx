import { Component, type ErrorInfo, type ReactNode } from 'react'
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application error', error, info.componentStack)
  }
  render() {
    return this.state.failed ? (
      <main style={{ padding: 32 }}>
        <h1>No pudimos abrir esta vista.</h1>
        <p>
          No se borraron los planes del dispositivo. Recargá la aplicación; si persiste, conservá el
          almacenamiento para recuperar el plan.
        </p>
        <button onClick={() => window.location.reload()}>Recargar</button>
      </main>
    ) : (
      this.props.children
    )
  }
}
