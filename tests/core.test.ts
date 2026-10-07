import { describe, it, expect } from 'vitest';
import { unanswered, completion, eligible, anonymousId, DemoRepository, type Section } from '../src/core';
import config from '../src/questionnaire.json';
const sections=config.sections as Section[];
describe('questionnaire rules',()=>{
 it('validates required radio and checkbox answers but allows optional reflection',()=>{
 expect(unanswered(sections.flatMap(s=>s.questions),{})).toEqual(['familiarity','sources']);
 expect(unanswered(sections[1].questions,{sources:[]})).toEqual(['sources']);
 expect(completion(sections,{familiarity:'skip',sources:['skip']})).toBe(100);
 expect(completion(sections,{})).toBe(0);
 });
 it('requires both sample eligibility conditions',()=>{expect(eligible('yes','yes')).toBe(true);expect(eligible('no','yes')).toBe(false);expect(eligible('yes','')).toBe(false);});
 it('creates distinct anonymous IDs',()=>{expect(anonymousId()).not.toBe(anonymousId());expect(anonymousId()).toMatch(/^SACOM-/);});
 it('sample IDs are unique and every question has both languages',()=>{const qs=sections.flatMap(s=>s.questions);expect(new Set(qs.map(q=>q.id)).size).toBe(qs.length);qs.forEach(q=>{expect(q.label.en).toBeTruthy();expect(q.label.ms).toBeTruthy();});});
 it('demo adapter returns an anonymous receipt',async()=>{const id=anonymousId();expect(await new DemoRepository().submit({responseId:id,language:'en',questionnaireVersion:'sample-v1',consent:{accepted:true,acceptedAt:'test'},answers:{},submittedAt:'test'})).toEqual({responseId:id});});
});
