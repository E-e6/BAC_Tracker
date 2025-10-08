import { useState, useEffect } from 'react';
import { supabase, DrinkingSession } from './lib/supabase';
import { UserProfileForm } from './components/UserProfileForm';
import { BACTracker } from './components/BACTracker';

function App() {
  const [session, setSession] = useState<DrinkingSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveSession();
  }, []);

  const loadActiveSession = async () => {
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
      setLoading(false);
      return;
    }

    if (data) {
      setSession(data);
    } else {
      localStorage.removeItem('activeSessionId');
    }
    setLoading(false);
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

  if (!session) {
    return <UserProfileForm onSubmit={handleStartSession} />;
  }

  return <BACTracker session={session} onEndSession={handleEndSession} />;
}

export default App;
