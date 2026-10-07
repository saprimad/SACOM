export type Language = 'en' | 'ms';
export type Localized = Record<Language, string>;
export interface Question { id: string; label: Localized; type: 'radio' | 'checkbox' | 'textarea'; required: boolean; options?: {value: string; label: Localized}[] }
export interface Section { id: string; title: Localized; description: Localized; questions: Question[] }
export type Answers = Record<string, string | string[]>;
export function unanswered(questions: Question[], answers: Answers): string[] {
  return questions.filter(q => q.required && (!answers[q.id] || (Array.isArray(answers[q.id]) ? answers[q.id].length === 0 : !String(answers[q.id]).trim()))).map(q => q.id);
}
export function completion(sections: Section[], answers: Answers): number {
  const questions = sections.flatMap(s => s.questions).filter(q => q.required);
  return questions.length ? Math.round((questions.length - unanswered(questions, answers).length) / questions.length * 100) : 100;
}
export function eligible(adult: string, understands: string): boolean { return adult === 'yes' && understands === 'yes'; }
export function anonymousId(): string { return `SACOM-${crypto.randomUUID()}`; }
export interface ResponsePayload { responseId: string; questionnaireVersion: string; language: Language; consent: {accepted: true; acceptedAt: string}; answers: Answers; submittedAt: string }
export interface ResponseRepository { submit(response: ResponsePayload): Promise<{responseId: string}> }
// Development adapter: no network, database, or persistent browser storage.
export class DemoRepository implements ResponseRepository {
  async submit(response: ResponsePayload) { return {responseId: response.responseId}; }
}
