import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Auth from './Auth'

function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Auth onAuthSuccess={setUser} />
  }

  // Check if email is verified
  if (!user.email_confirmed_at) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verify Your Email
          </h2>
          <p className="text-gray-600 mb-6">
            We sent a verification link to <strong>{user.email}</strong>
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Click the link in the email to continue. Check your spam folder if you don't see it.
          </p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Sign out
          </button>
        </div>
      </div>
    )
  }

  // User is authenticated and verified
  return children
}

export default ProtectedRoute