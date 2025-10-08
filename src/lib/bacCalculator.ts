import { SessionDrink } from './supabase';

export interface BACResult {
  currentBAC: number;
  peakBAC: number;
  timeUntilSober: number;
  timeUntilLegal: number;
  status: 'sober' | 'legal' | 'warning' | 'illegal';
  message: string;
}

const ALCOHOL_DENSITY = 0.789;
const GRAMS_PER_ML = ALCOHOL_DENSITY;
const ML_PER_STANDARD_DRINK = 12.67;

const WIDMARK_R = {
  male: 0.68,
  female: 0.55,
  other: 0.61,
};

const ELIMINATION_RATE = 0.015;

export function calculateBAC(
  drinks: SessionDrink[],
  weightKg: number,
  gender: 'male' | 'female' | 'other',
  currentTime: Date = new Date()
): BACResult {
  if (drinks.length === 0) {
    return {
      currentBAC: 0,
      peakBAC: 0,
      timeUntilSober: 0,
      timeUntilLegal: 0,
      status: 'sober',
      message: 'No drinks consumed',
    };
  }

  const r = WIDMARK_R[gender];
  const bodyWaterWeight = weightKg * r;

  let peakBAC = 0;
  let currentBAC = 0;

  drinks.forEach((sessionDrink) => {
    if (!sessionDrink.drink) return;

    const drink = sessionDrink.drink;
    const gramsOfAlcohol =
      (drink.volume_ml * drink.alcohol_percentage * GRAMS_PER_ML) / 100;
    const totalGrams = gramsOfAlcohol * sessionDrink.quantity;

    const bacContribution = (totalGrams / (bodyWaterWeight * 1000)) * 100;

    const consumedTime = new Date(sessionDrink.consumed_at);
    const hoursElapsed =
      (currentTime.getTime() - consumedTime.getTime()) / (1000 * 60 * 60);

    const bacAfterMetabolism = Math.max(
      0,
      bacContribution - ELIMINATION_RATE * hoursElapsed
    );

    currentBAC += bacAfterMetabolism;
    peakBAC += bacContribution;
  });

  currentBAC = Math.max(0, currentBAC);

  const timeUntilSober = currentBAC > 0 ? currentBAC / ELIMINATION_RATE : 0;
  const timeUntilLegal =
    currentBAC > 0.05 ? (currentBAC - 0.05) / ELIMINATION_RATE : 0;

  let status: BACResult['status'] = 'sober';
  let message = 'You are sober and safe to drive';

  if (currentBAC >= 0.08) {
    status = 'illegal';
    message = 'DANGER: Illegal BAC level. Do not drive or operate machinery!';
  } else if (currentBAC >= 0.05) {
    status = 'illegal';
    message = 'ILLEGAL: Over 0.05 limit. Do not drive!';
  } else if (currentBAC >= 0.02) {
    status = 'warning';
    message = 'WARNING: Affected. Not safe for work or driving on probationary license.';
  } else if (currentBAC > 0) {
    status = 'legal';
    message = 'Below legal limit but still affected. Use caution.';
  }

  return {
    currentBAC: parseFloat(currentBAC.toFixed(4)),
    peakBAC: parseFloat(peakBAC.toFixed(4)),
    timeUntilSober: parseFloat(timeUntilSober.toFixed(2)),
    timeUntilLegal: parseFloat(timeUntilLegal.toFixed(2)),
    status,
    message,
  };
}

export function formatTimeUntil(hours: number): string {
  if (hours === 0) return 'Now';

  const totalMinutes = Math.ceil(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

export function getBACStatusColor(status: BACResult['status']): string {
  switch (status) {
    case 'sober':
      return 'text-green-600';
    case 'legal':
      return 'text-blue-600';
    case 'warning':
      return 'text-amber-600';
    case 'illegal':
      return 'text-red-600';
  }
}

export function getBACBackgroundColor(status: BACResult['status']): string {
  switch (status) {
    case 'sober':
      return 'bg-green-50 border-green-200';
    case 'legal':
      return 'bg-blue-50 border-blue-200';
    case 'warning':
      return 'bg-amber-50 border-amber-200';
    case 'illegal':
      return 'bg-red-50 border-red-200';
  }
}
