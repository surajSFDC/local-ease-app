import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useLocation, useRoute } from 'wouter'
import { ArrowLeft, Star, MapPin, DollarSign, Calendar, MessageCircle, Sparkles, Loader2 } from 'lucide-react'
import { api } from '../services/api'
import type { Provider } from '../services/api'

export default function ProviderDetail() {
  const [, setLocation] = useLocation()
  const [, params] = useRoute('/provider/:id')
  const providerId = params?.id || ''
  
  const [bookingDate, setBookingDate] = useState('')
  const [bookingNotes, setBookingNotes] = useState('')
  const [messageText, setMessageText] = useState('')
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [showMessageForm, setShowMessageForm] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['provider', providerId],
    queryFn: () => api.getProvider(providerId),
    enabled: !!providerId,
  })

  const bookingMutation = useMutation({
    mutationFn: () => api.createBooking(providerId, 'customer-1', bookingDate, bookingNotes),
    onSuccess: () => {
      alert('Booking request sent successfully!')
      setShowBookingForm(false)
      setBookingDate('')
      setBookingNotes('')
    },
  })

  const messageMutation = useMutation({
    mutationFn: () => api.sendMessage('customer-1', providerId, messageText),
    onSuccess: () => {
      alert('Message sent successfully!')
      setShowMessageForm(false)
      setMessageText('')
    },
  })

  const provider: Provider | undefined = data?.provider

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-12 text-center">
          <Loader2 className="w-12 h-12 text-primary-400 animate-spin mx-auto mb-4" />
          <p className="text-white/70">Loading provider details...</p>
        </div>
      </div>
    )
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-12 text-center">
          <p className="text-red-400 mb-4">Provider not found</p>
          <button
            onClick={() => setLocation('/')}
            className="glass-button-primary"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

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
              <span>Back</span>
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
          {/* Provider Header */}
          <div className="glass-card p-8 mb-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-3 gradient-text">{provider.name}</h1>
                <span className="inline-block px-4 py-2 bg-primary-500/20 border border-primary-500/30 rounded-full text-sm text-primary-400 mb-4">
                  {provider.category}
                </span>
                <p className="text-xl text-white/80 mb-6">{provider.description}</p>

                <div className="flex flex-wrap items-center gap-6">
                  {/* Rating */}
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-xl font-bold">{provider.rating.toFixed(1)}</span>
                    <span className="text-white/60">({provider.reviewCount} reviews)</span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center space-x-2 text-white/70">
                    <MapPin className="w-5 h-5" />
                    <span className="text-lg">{provider.location}</span>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-center space-x-2 text-white/70">
                    <DollarSign className="w-5 h-5" />
                    <span className="text-lg">
                      {provider.pricing.currency} {provider.pricing.min} - {provider.pricing.max}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="glass-card p-6 mb-6 animate-slide-up">
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => setShowBookingForm(!showBookingForm)}
                className="glass-button-primary py-4 px-6 flex items-center justify-center space-x-2"
              >
                <Calendar className="w-5 h-5" />
                <span>Book Service</span>
              </button>
              <button
                onClick={() => setShowMessageForm(!showMessageForm)}
                className="glass-button py-4 px-6 flex items-center justify-center space-x-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Send Message</span>
              </button>
            </div>
          </div>

          {/* Booking Form */}
          {showBookingForm && (
            <div className="glass-card p-6 mb-6 animate-slide-up">
              <h2 className="text-2xl font-bold mb-4">Book Service</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  bookingMutation.mutate()
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-2">Service Date</label>
                  <input
                    type="datetime-local"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="glass-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Additional Notes</label>
                  <textarea
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    rows={4}
                    className="glass-input resize-none"
                    placeholder="Any special requirements or details..."
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={bookingMutation.isPending}
                    className="glass-button-primary px-6 py-2 flex items-center space-x-2 disabled:opacity-50"
                  >
                    {bookingMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Confirm Booking</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="glass-button px-6 py-2"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Message Form */}
          {showMessageForm && (
            <div className="glass-card p-6 mb-6 animate-slide-up">
              <h2 className="text-2xl font-bold mb-4">Send Message</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  messageMutation.mutate()
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    rows={4}
                    className="glass-input resize-none"
                    placeholder="Type your message..."
                    required
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={messageMutation.isPending}
                    className="glass-button-primary px-6 py-2 flex items-center space-x-2 disabled:opacity-50"
                  >
                    {messageMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Send Message</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMessageForm(false)}
                    className="glass-button px-6 py-2"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Additional Info */}
          <div className="glass-card p-6 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">About This Provider</h2>
            <div className="space-y-4 text-white/70">
              <p>{provider.description}</p>
              <div className="pt-4 border-t border-white/10">
                <p className="text-sm text-white/50">
                  Member since {new Date(provider.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

