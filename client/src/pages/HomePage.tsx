import { useState } from 'react'
import { useLocation } from 'wouter'
import { Search, Sparkles, Globe, Zap, Shield, Users, LogOut, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function HomePage() {
  const [, setLocation] = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const { user, logout, isAuthenticated } = useAuth()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <div className="min-h-screen overflow-hidden" style={{ minHeight: '100vh' }}>
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl floating" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-500/30 rounded-full blur-3xl floating" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl floating" style={{ animationDelay: '4s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-primary-400" />
              <span className="text-2xl font-bold gradient-text">LocalEase</span>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-2 text-white/80">
                    <User className="w-4 h-4" />
                    <span className="text-sm">
                      {user?.firstName} {user?.lastName}
                    </span>
                  </div>
                  <button
                    onClick={() => setLocation('/profile')}
                    className="glass-button text-sm flex items-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={logout}
                    className="glass-button text-sm flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                  <button
                    onClick={() => setLocation('/provider-signup')}
                    className="glass-button-primary text-sm"
                  >
                    Become a Provider
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setLocation('/login')}
                    className="glass-button text-sm"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setLocation('/register')}
                    className="glass-button-primary text-sm"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-20 pb-32">
        <div className="max-w-5xl mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 text-shadow">
              Find Local Services
              <br />
              <span className="gradient-text">Powered by AI</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto">
              Connect with service providers worldwide in 100+ languages.
              AI-powered matching, instant translation, seamless booking.
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="animate-slide-up max-w-3xl mx-auto">
            <div className="glass-card p-3 flex items-center space-x-3 glow-primary">
              <Search className="w-6 h-6 text-white/50 ml-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for plumbers, cleaners, electricians... in any language"
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/50 text-lg"
              />
              <button
                type="submit"
                className="glass-button-primary px-8 py-3"
              >
                Search
              </button>
            </div>
            <p className="text-white/60 text-sm mt-4">
              Try: "Need a plumber urgently" or "नलसाज़ चाहिए" or "Necesito un fontanero"
            </p>
          </form>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 gradient-text">
            Why Choose LocalEase?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: '100+ Languages',
                description: 'Communicate in your language. AI translates everything automatically.',
                color: 'text-primary-400'
              },
              {
                icon: Sparkles,
                title: 'AI-Powered Matching',
                description: 'Smart algorithms find the perfect service provider for your needs.',
                color: 'text-secondary-400'
              },
              {
                icon: Zap,
                title: '60-Second Signup',
                description: 'Providers can create profiles in any language in under a minute.',
                color: 'text-pink-400'
              },
              {
                icon: Shield,
                title: 'Verified Providers',
                description: 'All service providers are verified with reviews and ratings.',
                color: 'text-primary-400'
              },
              {
                icon: Users,
                title: 'Global Community',
                description: 'Join millions of users and providers worldwide.',
                color: 'text-secondary-400'
              },
              {
                icon: Search,
                title: 'Smart Search',
                description: 'Natural language search understands what you need.',
                color: 'text-pink-400'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="glass-card-hover p-8 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <feature.icon className={`w-12 h-12 ${feature.color} mb-4`} />
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-white/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="glass-container">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              {[
                { number: '100+', label: 'Languages Supported' },
                { number: '10K+', label: 'Service Providers' },
                { number: '50K+', label: 'Happy Customers' },
                { number: '99.9%', label: 'Uptime' }
              ].map((stat, index) => (
                <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="text-5xl font-bold gradient-text mb-2">{stat.number}</div>
                  <div className="text-white/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20 pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card p-12 glow-secondary">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Join thousands of service providers earning on LocalEase
            </p>
            <button
              onClick={() => setLocation('/provider-signup')}
              className="glass-button-primary text-lg px-12 py-4"
            >
              Create Your Profile in 60 Seconds
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-white/60">
          <p>&copy; 2024 LocalEase. AI-Powered Global Local Services Platform.</p>
        </div>
      </footer>
    </div>
  )
}
