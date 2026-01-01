import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

function SupabaseTest() {
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function testConnection() {
      try {
        // Try to query the profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('count')
          .limit(1)
        
        if (error) {
          setError(error.message)
        } else {
          setConnected(true)
        }
      } catch (err) {
        setError(err.message)
      }
    }
    
    testConnection()
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Supabase Connection Test</h2>
      {connected && <p style={{ color: 'green' }}>✅ Connected to Supabase!</p>}
      {error && <p style={{ color: 'red' }}>❌ Error: {error}</p>}
      {!connected && !error && <p>Testing connection...</p>}
    </div>
  )
}

export default SupabaseTest