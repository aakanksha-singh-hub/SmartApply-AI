import { BrowserRouter as Router } from 'react-router-dom'
import AppRoutes from '@/router/routes'
import { Layout } from '@/components/Layout'
import { CommandMenu } from '@/components/CommandMenu'
import { Toaster } from '@/components/ui/sonner'

// Import API test utility for debugging
import '@/lib/utils/apiTest'

function App() {
  return (
    <div 
      className="relative min-h-screen"
      style={{
        backgroundImage: "url('/bg-image.svg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <Router>
        <CommandMenu />
        <Layout>
          <AppRoutes />
        </Layout>
        <Toaster />
      </Router>
    </div>
  )
}

export default App
