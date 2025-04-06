import { ThemeProvider } from './components/theme-provider'
import AppRoutes from './routes'

function App() {

  return (
    <>        
    <ThemeProvider>
      <AppRoutes /> 
    </ThemeProvider>
    </>
  )
}

export default App
