import { useState, useEffect } from 'react';
import { Search, Plus, Beer, Wine, Martini, X } from 'lucide-react';
import { Drink } from '../lib/supabase';

interface DrinkSelectorProps {
  drinks: Drink[];
  onAddDrink: (drink: Drink, quantity: number) => void;
  onClose: () => void;
}

export function DrinkSelector({ drinks, onAddDrink, onClose }: DrinkSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [quantity, setQuantity] = useState('1');

  const categories = [
    { id: 'all', label: 'All Drinks', icon: Martini },
    { id: 'beer', label: 'Beer', icon: Beer },
    { id: 'wine', label: 'Wine', icon: Wine },
    { id: 'spirits', label: 'Spirits', icon: Martini },
    { id: 'premix', label: 'Premix', icon: Martini },
    { id: 'cider', label: 'Cider', icon: Beer },
    { id: 'cocktail', label: 'Cocktails', icon: Martini },
  ];

  const filteredDrinks = drinks.filter((drink) => {
    const matchesSearch =
      drink.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drink.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drink.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || drink.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddDrink = () => {
    if (!selectedDrink) return;
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) return;
    onAddDrink(selectedDrink, qty);
    setSelectedDrink(null);
    setQuantity('1');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Add a Drink</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="p-6 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search drinks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-3">
            {filteredDrinks.map((drink) => (
              <button
                key={drink.id}
                onClick={() => setSelectedDrink(drink)}
                className={`text-left p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  selectedDrink?.id === drink.id
                    ? 'border-slate-700 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{drink.name}</h3>
                    {drink.brand && (
                      <p className="text-sm text-slate-600 mt-0.5">{drink.brand}</p>
                    )}
                    {drink.description && (
                      <p className="text-sm text-slate-500 mt-1">{drink.description}</p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-lg font-bold text-slate-900">
                      {drink.standard_drinks.toFixed(1)}
                    </div>
                    <div className="text-xs text-slate-600">std drinks</div>
                  </div>
                </div>
                <div className="mt-2 flex gap-4 text-xs text-slate-600">
                  <span>{drink.volume_ml}ml</span>
                  <span>{drink.alcohol_percentage}% ABV</span>
                  <span className="capitalize">{drink.category}</span>
                </div>
              </button>
            ))}
            {filteredDrinks.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <Martini className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No drinks found</p>
              </div>
            )}
          </div>
        </div>

        {selectedDrink && (
          <div className="p-6 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="0.5"
                  max="20"
                  step="0.5"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                />
              </div>
              <div className="flex-1">
                <div className="text-sm text-slate-700 mb-2">Total Standard Drinks</div>
                <div className="text-2xl font-bold text-slate-900">
                  {(selectedDrink.standard_drinks * parseFloat(quantity || '0')).toFixed(
                    1
                  )}
                </div>
              </div>
              <button
                onClick={handleAddDrink}
                className="mt-6 bg-slate-700 hover:bg-slate-800 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Drink
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
