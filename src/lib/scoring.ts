export function calculateScore(correct: number, total: number) { return total === 0 ? 0 : Math.round((correct / total) * 100) }
export function calculateAccuracy(correct: number, answered: number) { return answered === 0 ? 0 : Math.round((correct / answered) * 100) }
export function validateUnanswered(selected: Array<string | undefined>) { return selected.filter((choice) => !choice).length }
