export interface FlashcardSM2Input {
  easeFactor?: number;
  repetitions?: number;
  interval?: number;
  [key: string]: any;
}

export interface SM2CalculationResult {
  easeFactor: number;
  repetitions: number;
  interval: number;
  nextReviewDate: string;
  needsRevision: boolean;
}

export const calculateSM2 = (card: FlashcardSM2Input, quality: number): SM2CalculationResult => {
  let easeFactor = card.easeFactor || 2.5;
  let repetitions = card.repetitions || 0;
  let interval = card.interval || 1;

  if (quality >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    repetitions = 0;
    interval = 1;
  }

  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);
  const nextReviewDate = nextDate.toISOString().split('T')[0];

  return {
    easeFactor: parseFloat(easeFactor.toFixed(2)),
    repetitions,
    interval,
    nextReviewDate,
    needsRevision: quality < 3
  };
};

export const getCardsDueToday = (flashcards: any[]): any[] => {
  const todayStr = new Date().toISOString().split('T')[0];
  return (flashcards || []).filter((card: any) => {
    if (!card.nextReviewDate) return true;
    return card.nextReviewDate <= todayStr || card.needsRevision;
  });
};
