import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Activity,
  Clock,
  TrendingDown,
  AlertTriangle,
  Shield,
  Info,
} from 'lucide-react';
import { supabase, Drink, DrinkingSession, SessionDrink } from '../lib/supabase';
import {
  calculateBAC,
  formatTimeUntil,
  getBACStatusColor,
  getBACBackgroundColor,
} from '../lib/bacCalculator';
import { DrinkSelector } from './DrinkSelector';

interface BACTrackerProps {
  session: DrinkingSession;
  onEndSession: () => void;
}

export function BACTracker({ session, onEndSession }: BACTrackerProps) {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [sessionDrinks, setSessionDrinks] = useState<SessionDrink[]>([]);
  const [showDrinkSelector, setShowDrinkSelector] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDrinks();
    loadSessionDrinks();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const loadDrinks = async () => {
    const { data, error } = await supabase
      .from('drinks')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error loading drinks:', error);
      return;
    }

    setDrinks(data || []);
  };

  const loadSessionDrinks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('session_drinks')
      .select('*, drink:drinks(*)')
      .eq('session_id', session.id)
      .order('consumed_at', { ascending: false });

    if (error) {
      console.error('Error loading session drinks:', error);
      setLoading(false);
      return;
    }

    setSessionDrinks(data || []);
    setLoading(false);
  };

  const handleAddDrink = async (drink: Drink, quantity: number) => {
    const { error } = await supabase.from('session_drinks').insert({
      session_id: session.id,
      drink_id: drink.id,
      quantity,
      consumed_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error adding drink:', error);
      return;
    }

    await supabase
      .from('drinking_sessions')
      .update({ last_updated: new Date().toISOString() })
      .eq('id', session.id);

    loadSessionDrinks();
    setShowDrinkSelector(false);
  };

  const handleRemoveDrink = async (id: string) => {
    const { error } = await supabase.from('session_drinks').delete().eq('id', id);

    if (error) {
      console.error('Error removing drink:', error);
      return;
    }

    loadSessionDrinks();
  };

  const bacResult = calculateBAC(
    sessionDrinks,
    session.weight_kg,
    session.gender,
    currentTime
  );

  const totalStandardDrinks = sessionDrinks.reduce(
    (sum, sd) => sum + (sd.drink?.standard_drinks || 0) * sd.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div
            className={`p-8 border-b-4 transition-colors ${getBACBackgroundColor(
              bacResult.status
            )}`}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  BAC Tracker
                </h1>
                <p className="text-slate-600">
                  {session.weight_kg}kg · {session.gender} · Session started{' '}
                  {new Date(session.started_at).toLocaleTimeString('en-AU', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <button
                onClick={onEndSession}
                className="px-4 py-2 text-slate-600 hover:bg-white rounded-lg transition-colors border border-slate-300"
              >
                End Session
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="text-sm text-slate-600 mb-1">Current BAC</div>
                <div
                  className={`text-3xl font-bold ${getBACStatusColor(
                    bacResult.status
                  )}`}
                >
                  {bacResult.currentBAC.toFixed(3)}
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="text-sm text-slate-600 mb-1">Peak BAC</div>
                <div className="text-3xl font-bold text-slate-900">
                  {bacResult.peakBAC.toFixed(3)}
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="text-sm text-slate-600 mb-1">Total Drinks</div>
                <div className="text-3xl font-bold text-slate-900">
                  {totalStandardDrinks.toFixed(1)}
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="text-sm text-slate-600 mb-1">Drinks Count</div>
                <div className="text-3xl font-bold text-slate-900">
                  {sessionDrinks.length}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="flex items-start gap-3">
                <AlertTriangle
                  className={`w-6 h-6 mt-0.5 ${getBACStatusColor(bacResult.status)}`}
                />
                <div className="flex-1">
                  <div
                    className={`font-semibold mb-1 ${getBACStatusColor(
                      bacResult.status
                    )}`}
                  >
                    {bacResult.message}
                  </div>
                  <div className="flex gap-6 text-sm text-slate-600">
                    {bacResult.currentBAC > 0 && (
                      <>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            Sober in: {formatTimeUntil(bacResult.timeUntilSober)}
                          </span>
                        </div>
                        {bacResult.timeUntilLegal > 0 && (
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            <span>
                              Legal in: {formatTimeUntil(bacResult.timeUntilLegal)}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Drinks Consumed</h2>
              <button
                onClick={() => setShowDrinkSelector(true)}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Drink
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-slate-500">
                <Activity className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                <p>Loading...</p>
              </div>
            ) : sessionDrinks.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <TrendingDown className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="mb-2">No drinks added yet</p>
                <p className="text-sm">Click "Add Drink" to start tracking</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessionDrinks.map((sd) => {
                  if (!sd.drink) return null;
                  const drink = sd.drink;
                  const consumedTime = new Date(sd.consumed_at);
                  const timeAgo = Math.floor(
                    (currentTime.getTime() - consumedTime.getTime()) / (1000 * 60)
                  );

                  return (
                    <div
                      key={sd.id}
                      className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900">
                          {drink.name}
                          {sd.quantity > 1 && (
                            <span className="text-slate-600 font-normal">
                              {' '}
                              × {sd.quantity}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-600 mt-1">
                          {(drink.standard_drinks * sd.quantity).toFixed(1)} std drinks
                          · {drink.volume_ml}ml · {drink.alcohol_percentage}% ABV
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {timeAgo < 1
                            ? 'Just now'
                            : timeAgo < 60
                            ? `${timeAgo} min ago`
                            : `${Math.floor(timeAgo / 60)} hr ${timeAgo % 60} min ago`}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveDrink(sd.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-200">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-slate-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-slate-600 leading-relaxed">
                <p className="font-semibold text-slate-800 mb-2">
                  Australian Legal Limits & Work Safety
                </p>
                <ul className="space-y-1">
                  <li>• Full license: 0.05 BAC maximum</li>
                  <li>• Probationary/Learner license: 0.00 BAC</li>
                  <li>• Commercial/Heavy vehicle drivers: 0.02 BAC</li>
                  <li>
                    • Workplace safety: Many employers require 0.00 BAC for
                    machinery operation
                  </li>
                  <li>
                    • Alcohol elimination rate: ~0.015 BAC per hour (varies by
                    individual)
                  </li>
                </ul>
                <p className="mt-3 text-xs text-slate-500">
                  This calculator provides estimates only. Actual BAC depends on
                  many factors. Always err on the side of caution.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDrinkSelector && (
        <DrinkSelector
          drinks={drinks}
          onAddDrink={handleAddDrink}
          onClose={() => setShowDrinkSelector(false)}
        />
      )}
    </div>
  );
}
