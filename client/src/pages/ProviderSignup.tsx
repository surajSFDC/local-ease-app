import { useState } from 'react'
import { useLocation } from 'wouter'
import { useMutation } from '@tanstack/react-query'
import { Sparkles, ArrowLeft, Globe, Loader2, CheckCircle2 } from 'lucide-react'
import { api } from '../services/api'

export default function ProviderSignup() {
  const [, setLocation] = useLocation()
  const [description, setDescription] = useState('')
  const [success, setSuccess] = useState(false)

  const createProfileMutation = useMutation({
    mutationFn: (desc: string) => api.createProfile(desc),
    onSuccess: (data) => {
      setSuccess(true)
      setTimeout(() => {
        setLocation(`/provider/${data.provider.id}`)
      }, 2000)
    },
  })

  const analyzeMutation = useMutation({
    mutationFn: (text: string) => api.analyzeText(text),
  })

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return

    // First analyze the text to detect language
    try {
      await analyzeMutation.mutateAsync(description)
      // Language detection happens automatically in the API
    } catch (error) {
      console.error('Error analyzing text:', error)
    }

    // Then create the profile
    createProfileMutation.mutate(description)
  }

  const detectedLanguage = analyzeMutation.data?.language.detectedLanguage

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-secondary-500/30 rounded-full blur-3xl floating" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl floating" style={{ animationDelay: '2s' }} />
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

      {/* Main Content */}
      <section className="relative z-10 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl font-bold mb-4 gradient-text">
              Create Your Profile with AI
            </h1>
            <p className="text-xl text-white/80">
              Just describe your service in any language. Our AI will do the rest.
            </p>
          </div>

          {success ? (
            <div className="glass-card p-12 glow-primary animate-fade-in text-center">
              <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4 gradient-text">Profile Created Successfully!</h2>
              <p className="text-white/70 mb-6">Redirecting to your profile...</p>
              <Loader2 className="w-8 h-8 text-primary-400 animate-spin mx-auto" />
            </div>
          ) : (
            <div className="glass-card p-8 md:p-12 glow-primary animate-slide-up">
              <form onSubmit={handleGenerate} className="space-y-6">
                {/* Language Indicator */}
                {detectedLanguage && (
                  <div className="flex items-center space-x-2 text-primary-400 animate-fade-in">
                    <Globe className="w-5 h-5" />
                    <span className="text-sm">
                      Detected Language: {detectedLanguage.name} ({detectedLanguage.nativeName})
                    </span>
                    <span className="text-xs text-white/50">
                      Confidence: {Math.round(detectedLanguage.confidence * 100)}%
                    </span>
                  </div>
                )}

                {/* Description Input */}
                <div>
                  <label className="block text-lg font-medium mb-3">
                    Describe Your Service
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value)
                      // Auto-detect language as user types (debounced)
                      if (e.target.value.trim().length > 10) {
                        analyzeMutation.mutate(e.target.value)
                      }
                    }}
                    placeholder="Example: I'm a professional plumber in London with 15 years of experience. I specialize in emergency repairs, installations, and maintenance. Available 24/7."
                    rows={8}
                    className="glass-input resize-none"
                    disabled={createProfileMutation.isPending}
                  />
                  <p className="text-white/60 text-sm mt-2">
                    Write in any language: English, Hindi, Spanish, Chinese, Arabic, and 100+ more
                  </p>
                </div>

                {/* Examples */}
                <div className="glass-container">
                  <h3 className="font-medium mb-3">Examples in different languages:</h3>
                  <div className="space-y-2 text-sm text-white/70">
                    <p>🇬🇧 "Professional electrician in New York, 10 years experience"</p>
                    <p>🇮🇳 "मैं दिल्ली में एक अनुभवी प्लंबर हूं"</p>
                    <p>🇪🇸 "Soy fontanero profesional en Madrid con 5 años de experiencia"</p>
                    <p>🇨🇳 "我是北京的专业水管工，有8年经验"</p>
                  </div>
                </div>

                {/* Error Message */}
                {createProfileMutation.isError && (
                  <div className="glass-container bg-red-500/10 border-red-500/30">
                    <p className="text-red-400">
                      {createProfileMutation.error instanceof Error 
                        ? createProfileMutation.error.message 
                        : 'Failed to create profile. Please try again.'}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!description.trim() || createProfileMutation.isPending}
                  className="w-full glass-button-primary py-4 text-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createProfileMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Generating Your Profile...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate Profile with AI</span>
                    </>
                  )}
                </button>
              </form>

              {/* Features */}
              <div className="mt-8 pt-8 border-t border-white/10">
                <h3 className="font-medium mb-4">What happens next?</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { step: '1', text: 'AI detects your language' },
                    { step: '2', text: 'Extracts service details' },
                    { step: '3', text: 'Creates professional profile' }
                  ].map((item) => (
                    <div key={item.step} className="glass-card p-4 text-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                        {item.step}
                      </div>
                      <p className="text-sm text-white/70">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Trust Indicators */}
          <div className="mt-12 text-center text-white/60 animate-fade-in">
            <p className="text-sm">
              ✓ Free to create profile • ✓ No credit card required • ✓ Start earning in minutes
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
