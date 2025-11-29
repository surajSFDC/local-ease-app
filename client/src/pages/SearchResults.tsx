import { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { useQuery } from '@tanstack/react-query'
import { Search, MapPin, Star, ArrowLeft, Sparkles, DollarSign, Loader2 } from 'lucide-react'
import { api } from '../services/api'
import type { Provider } from '../services/api'

export default function SearchResults() {
  const [location, setLocation] = useLocation()
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const q = params.get('q')
    if (q) {
      setSearchQuery(q)
    }
  }, [location])

  const { data, isLoading, error } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => api.searchProviders(searchQuery),
    enabled: !!searchQuery.trim(),
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const providers = data?.providers || []
  const searchAnalysis = data?.searchAnalysis

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl floating" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl floating" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setLocation('/')}
              className="flex items-center space-x-2 glass-button text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-primary-400" />
              <span className="text-2xl font-bold gradient-text">LocalEase</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Search Bar */}
      <section className="relative z-10 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <form onSubmit={handleSearch}>
            <div className="glass-card p-3 flex items-center space-x-3">
              <Search className="w-6 h-6 text-white/50 ml-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for services..."
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/50 text-lg"
              />
              <button type="submit" className="glass-button-primary px-6 py-2">
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Results */}
      <section className="relative z-10 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="glass-card p-12 text-center animate-fade-in">
              <Loader2 className="w-12 h-12 text-primary-400 animate-spin mx-auto mb-4" />
              <p className="text-white/70">Searching for providers...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="glass-card p-12 text-center animate-fade-in">
              <p className="text-red-400 mb-2">Error searching for providers</p>
              <p className="text-white/70 text-sm">{error instanceof Error ? error.message : 'Unknown error'}</p>
            </div>
          )}

          {/* Search Info */}
          {!isLoading && !error && searchQuery && (
            <div className="glass-card p-6 mb-8 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Search Results for "{searchQuery}"
                  </h2>
                  <p className="text-white/70">
                    Found {providers.length} service provider{providers.length !== 1 ? 's' : ''}
                  </p>
                  {searchAnalysis && (
                    <p className="text-white/60 text-sm mt-2">
                      Detected language: {searchAnalysis.detectedLanguage.name}
                    </p>
                  )}
                </div>
                {searchAnalysis && (
                  <div className="glass-container px-4 py-2">
                    <div className="flex items-center space-x-2 text-primary-400">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm">AI-Powered Search</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Provider Cards */}
          {!isLoading && !error && (
            <div className="space-y-6">
              {providers.map((provider, index) => (
                <div
                  key={provider.id}
                  className="glass-card-hover p-6 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    {/* Provider Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-2xl font-bold mb-1">{provider.name}</h3>
                          <span className="inline-block px-3 py-1 bg-primary-500/20 border border-primary-500/30 rounded-full text-sm text-primary-400">
                            {provider.category}
                          </span>
                        </div>
                      </div>

                      <p className="text-white/70 mb-4">{provider.description}</p>

                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        {/* Rating */}
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="font-medium">{provider.rating.toFixed(1)}</span>
                          <span className="text-white/60">({provider.reviewCount} reviews)</span>
                        </div>

                        {/* Location */}
                        <div className="flex items-center space-x-1 text-white/70">
                          <MapPin className="w-4 h-4" />
                          <span>{provider.location}</span>
                        </div>

                        {/* Pricing */}
                        <div className="flex items-center space-x-1 text-white/70">
                          <DollarSign className="w-4 h-4" />
                          <span>
                            {provider.pricing.currency} {provider.pricing.min} - {provider.pricing.max}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-3 md:min-w-[200px]">
                      <button 
                        onClick={() => setLocation(`/provider/${provider.id}`)}
                        className="glass-button-primary py-3 px-6"
                      >
                        View Profile
                      </button>
                      <button className="glass-button py-3 px-6">
                        Send Message
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && !error && searchQuery && providers.length === 0 && (
            <div className="glass-card p-12 text-center animate-fade-in">
              <Search className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">No results found</h3>
              <p className="text-white/70">Try adjusting your search query</p>
            </div>
          )}

          {/* No Search Query */}
          {!searchQuery && !isLoading && (
            <div className="glass-card p-12 text-center animate-fade-in">
              <Search className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Start your search</h3>
              <p className="text-white/70">Enter a search query above to find service providers</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
