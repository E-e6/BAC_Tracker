import { useState, useEffect } from 'react';
import { supabase, DrinkingSession } from './lib/supabase';
import { UserProfileForm } from './components/UserProfileForm';
import { BACTracker } from './components/BACTracker';

function App() {
  const [session, setSession] = useState<DrinkingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadActiveSession();
  }, []);

  const loadActiveSession = async () => {
    try {
      const sessionId = localStorage.getItem('activeSessionId');
      if (!sessionId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('drinking_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error loading session:', error);
        localStorage.removeItem('activeSessionId');
        setLoading(false);
        return;
      }

      if (data) {
        setSession(data);
      } else {
        localStorage.removeItem('activeSessionId');
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to load session:', err);
      setError('Failed to connect to database. Please check your connection.');
      setLoading(false);
    }
  };

  const handleStartSession = async (data: {
    weight: number;
    gender: 'male' | 'female' | 'other';
  }) => {
    const userId = crypto.randomUUID();

    const { data: newSession, error } = await supabase
      .from('drinking_sessions')
      .insert({
        user_id: userId,
        weight_kg: data.weight,
        gender: data.gender,
        started_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating session:', error);
      return;
    }

    localStorage.setItem('activeSessionId', newSession.id);
    setSession(newSession);
  };

  const handleEndSession = async () => {
    if (!session) return;

    await supabase
      .from('drinking_sessions')
      .update({ is_active: false })
      .eq('id', session.id);

    localStorage.removeItem('activeSessionId');
    setSession(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md">
          <div className="text-red-600 font-bold mb-2">Connection Error</div>
          <div className="text-slate-700 mb-4">{error}</div>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              loadActiveSession();
            }}
            className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return <UserProfileForm onSubmit={handleStartSession} />;
  }

  return <BACTracker session={session} onEndSession={handleEndSession} />;
}

export default App;
