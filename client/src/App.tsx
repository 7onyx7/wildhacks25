import { ThemeProvider } from 'next-themes'
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
