import { describe, it, expect } from 'vitest';
import { unanswered, completion, eligible, visibleQuestions, anonymousId, DemoRepository, type Section } from '../src/core';
import config from '../src/questionnaire.json';
const sections=config.sections as Section[];
describe('draft questionnaire rules',()=>{
 it('loads the 25 November draft with 80 items including consent',()=>{
  const qs=sections.flatMap(s=>s.questions);
  expect(sections.map(s=>s.questions.length)).toEqual([4,10,14,1,11,19,20]);
  expect([config.consent, ...qs]).toHaveLength(80);
  expect(qs.at(-1)?.id).toBe('DEC-OP1');
 });
 it('requires screening items and computes completion',()=>{
  const questions=sections.flatMap(s=>s.questions);
  expect(unanswered(questions,{})).toEqual(['q3','q2','q4','q5','C1']);
  const answers={q2:'Yes',q3:'Yes',q4:'Yes',q5:'Yes',C1:'No'};
  expect(unanswered(questions,answers)).toEqual([]);
  expect(completion(sections,answers)).toBe(100);
  expect(completion(sections,{})).toBe(0);
 });
 it('shows the eight observation items and two visit follow-ups only on Yes for C1',()=>{
  const visits=sections.find(s=>s.id==='visits')!;
  expect(visibleQuestions(visits,{C1:'No'}).map(q=>q.id)).toEqual(['C1']);
  expect(visibleQuestions(visits,{C1:'Yes'})).toHaveLength(11);
 });
 it('requires both initial demonstration eligibility conditions',()=>{
  expect(eligible('yes','yes')).toBe(true);
  expect(eligible('no','yes')).toBe(false);
  expect(eligible('yes','')).toBe(false);
 });
 it('creates distinct anonymous IDs',()=>{
  expect(anonymousId()).not.toBe(anonymousId());
  expect(anonymousId()).toMatch(/^SACOM-/);
 });
 it('question IDs are unique and bilingual fields are present',()=>{
  const qs=sections.flatMap(s=>s.questions);
  expect(new Set(qs.map(q=>q.id)).size).toBe(qs.length);
  qs.forEach(q=>{expect(q.label.en).toBeTruthy();expect(q.label.ms).toBeTruthy();});
 });
 it('demo adapter returns receipt without persistence',async()=>{
  const id=anonymousId();
  expect(await new DemoRepository().submit({responseId:id,language:'en',questionnaireVersion:config.version,consent:{accepted:true,acceptedAt:'test'},answers:{},submittedAt:'test'})).toEqual({responseId:id});
 });
});
