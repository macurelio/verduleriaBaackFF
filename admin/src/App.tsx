import { useAuth } from './auth'
import { Spinner } from './components/ui'
import LoginScreen from './screens/Login'
import Layout from './screens/Layout'

function Root() {
  const { user, loading } = useAuth()
  if (loading) return <Spinner label="Cargando…" />
  if (!user) return <LoginScreen />
  return <Layout />
}

export default function App() {
  return <Root />
}