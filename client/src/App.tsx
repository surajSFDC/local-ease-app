import { Route, Switch } from 'wouter'
import { AuthProvider } from './contexts/AuthContext'
import HomePage from './pages/HomePage'
import ProviderSignup from './pages/ProviderSignup'
import SearchResults from './pages/SearchResults'
import ProviderDetail from './pages/ProviderDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import MyProfile from './pages/MyProfile'

function App() {
  console.log('App component rendering')
  return (
    <AuthProvider>
      <div className="min-h-screen" style={{ backgroundColor: '#1e1b4b', minHeight: '100vh' }}>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/profile" component={MyProfile} />
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
    </AuthProvider>
  )
}

export default App
