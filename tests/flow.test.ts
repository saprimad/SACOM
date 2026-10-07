// @vitest-environment jsdom
import { it, expect } from 'vitest';
it('runs the bilingual flow, blocks invalid steps, preserves answers, reviews and resets',async()=>{
 document.body.innerHTML='<div id="app"></div>';
 await import('../src/main');
 const click=(selector:string)=>document.querySelector<HTMLButtonElement>(selector)!.click();
 const choose=(selector:string)=>{const el=document.querySelector<HTMLInputElement>(selector)!;el.checked=true;el.dispatchEvent(new Event('input',{bubbles:true}));};
 const next=()=>click('#next');
 next();next();next();expect(document.querySelector('[role="alert"]')).not.toBeNull();
 choose('[name="adult"][value="no"]');choose('[name="understands"][value="yes"]');next();expect(document.querySelector('[role="alert"]')!.textContent).toContain('do not meet');
 choose('[name="adult"][value="yes"]');next();next();expect(document.querySelector('[role="alert"]')).not.toBeNull();
 choose('[name="consent"]');next();next();expect(document.querySelector('[role="alert"]')).not.toBeNull();
 choose('[name="familiarity"][value="moderately"]');click('[data-lang="ms"]');expect(document.documentElement.lang).toBe('ms');expect(document.querySelector<HTMLInputElement>('[name="familiarity"][value="moderately"]')!.checked).toBe(true);
 next();choose('[name="sources"][value="news"]');click('#previous');expect(document.querySelector<HTMLInputElement>('[name="familiarity"][value="moderately"]')!.checked).toBe(true);next();expect(document.querySelector<HTMLInputElement>('[name="sources"][value="news"]')!.checked).toBe(true);
 next();next();expect(document.querySelectorAll('[data-edit]').length).toBe(3);click('[data-edit="0"]');choose('[name="familiarity"][value="skip"]');next();next();next();click('[data-lang="en"]');expect(document.querySelector('main')!.textContent).toContain('Prefer not to answer');
 next();await new Promise(resolve=>setTimeout(resolve,0));expect(document.querySelector('h1')!.textContent).toContain('Thank you');expect(document.querySelector('.id')!.textContent).toMatch(/^SACOM-/);
 next();expect(document.querySelector('h1')!.textContent).toContain('Understanding');
});
