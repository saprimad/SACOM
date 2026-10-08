import { describe, it, expect } from 'vitest';
import { unanswered, completion, eligible, anonymousId, DemoRepository, type Section } from '../src/core';
import config from '../src/questionnaire.json';
const sections=config.sections as Section[];
describe('draft questionnaire rules',()=>{
 it('loads all Q2–Q79 with five sections',()=>{
  const qs=sections.flatMap(s=>s.questions);
  expect(sections).toHaveLength(5);
  expect(qs).toHaveLength(78);
  expect(qs[0].id).toBe('q2');
  expect(qs.at(-1)?.id).toBe('q79');
 });
 it('requires screening items and computes completion',()=>{
  const questions=sections.flatMap(s=>s.questions);
  expect(unanswered(questions,{})).toEqual(['q2','q3','q4','q5']);
  const answers={q2:'Yes',q3:'Yes',q4:'Yes',q5:'Yes'};
  expect(unanswered(questions,answers)).toEqual([]);
  expect(completion(sections,answers)).toBe(100);
  expect(completion(sections,{})).toBe(0);
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
