import { useState } from 'react';
import { User } from 'lucide-react';

interface UserProfileFormProps {
  onSubmit: (data: { weight: number; gender: 'male' | 'female' | 'other' }) => void;
}

export function UserProfileForm({ onSubmit }: UserProfileFormProps) {
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum < 30 || weightNum > 300) {
      setError('Please enter a valid weight between 30-300kg');
      return;
    }

    onSubmit({ weight: weightNum, gender });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-slate-100 p-4 rounded-full">
            <User className="w-8 h-8 text-slate-700" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-2 text-slate-900">
          BAC Tracker
        </h1>
        <p className="text-center text-slate-600 mb-8">
          Track your blood alcohol content with precision
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="weight"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Your Weight (kg)
            </label>
            <input
              type="number"
              id="weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g., 75"
              min="30"
              max="300"
              step="0.5"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Gender (for metabolism calculation)
            </label>
            <div className="space-y-2">
              {[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="gender"
                    value={option.value}
                    checked={gender === option.value}
                    onChange={(e) =>
                      setGender(e.target.value as 'male' | 'female' | 'other')
                    }
                    className="w-4 h-4 text-slate-600 focus:ring-slate-500"
                  />
                  <span className="ml-3 text-slate-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-slate-700 hover:bg-slate-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            Start Tracking
          </button>
        </form>

        <div className="mt-8 p-4 bg-slate-50 rounded-lg">
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-800">Australian Legal Limits:</strong>
            <br />
            • Full license: 0.05 BAC
            <br />
            • Probationary/Learner: 0.00 BAC
            <br />• Commercial drivers: 0.02 BAC
          </p>
        </div>
      </div>
    </div>
  );
}
