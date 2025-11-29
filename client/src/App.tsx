import { Route, Switch } from 'wouter'
import HomePage from './pages/HomePage'
import ProviderSignup from './pages/ProviderSignup'
import SearchResults from './pages/SearchResults'
import ProviderDetail from './pages/ProviderDetail'

function App() {
  console.log('App component rendering')
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1e1b4b', minHeight: '100vh' }}>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/provider-signup" component={ProviderSignup} />
        <Route path="/search" component={SearchResults} />
        <Route path="/provider/:id" component={ProviderDetail} />
        <Route>
          <div className="flex items-center justify-center min-h-screen" style={{ minHeight: '100vh' }}>
            <div className="glass-card p-8 text-center">
              <h1 className="text-4xl font-bold gradient-text mb-4">404</h1>
              <p className="text-white/70">Page not found</p>
            </div>
          </div>
        </Route>
      </Switch>
    </div>
  )
}

export default App
