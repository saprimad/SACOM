// @vitest-environment jsdom
import { expect, it, vi } from 'vitest';
import config from '../src/questionnaire.json';

const click = (selector: string) => {
  const element = document.querySelector<HTMLElement>(selector);
  expect(element, selector).not.toBeNull();
  element!.click();
};
const field = (selector: string) => {
  const element = document.querySelector<HTMLInputElement>(selector);
  expect(element, selector).not.toBeNull();
  return element!;
};
const choose = (name: string, value: string) => click(`[name="${name}"][value="${value}"]`);
const next = () => click('#next');
const heading = () => document.querySelector('h1')!.textContent;
const select = (selector: string, value: string) => {
  const input = document.querySelector<HTMLSelectElement>(selector)!;
  input.value = value;
  input.dispatchEvent(new Event('change', { bubbles: true }));
};

it('runs the updated bilingual participant demo through consent, screening and both visit routes', async () => {
  document.body.innerHTML = '<div id="app"></div>';
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  await import('../src/main');
  expect(heading()).toBe('Public Perceptions of Marijuana');
  click('[data-view="questionnaire"]');
  expect(document.querySelector('.pis-lead')?.textContent).toBe('Public Perceptions of Marijuana in Malaysia: A Cross-Sectional Study');
  next();
  expect(heading()).toContain('Informed consent');
  next();
  expect(document.querySelector('[role="alert"]')).not.toBeNull();
  choose('consent','yes'); next();
  expect(heading()).toContain('Screening');
  choose('q2','No');
  for (const id of ['q3','q4','q5']) choose(id,'Yes');
  next();
  expect(document.querySelector('[role="alert"]')!.textContent).toContain('A No answer');
  choose('q2','Yes');
  click('[data-lang="ms"]');
  expect(field('[name="q2"][value="Yes"]').checked).toBe(true);
  next();
  expect(heading()).toContain('sosiodemografi');
  expect(field('[name="age"]').type).toBe('number');
  next();
  expect(document.querySelector('.likert-key')!.textContent).toContain('Tiada kesedaran langsung');
  expect(document.querySelector('.likert-key')!.textContent).not.toContain('Sangat tidak setuju');
  next();
  const alternatives = config.sections.find(s=>s.id==='sources')!.questions[0].options!;
  const other = alternatives.find(o=>'specify' in o)!;
  const none = alternatives.find(o=>'exclusive' in o)!;
  expect(document.body.textContent).toContain('WhatsApp, Telegram, LINE');
  choose('B1',other.value);
  const details = field(`[name="B1-detail-${other.value}"]`);
  expect(details.disabled).toBe(false);
  details.value = 'Sample';
  details.dispatchEvent(new Event('input'));
  choose('B1',none.value);
  expect(field(`[name="B1"][value="${other.value}"]`).checked).toBe(false);
  expect(details.disabled).toBe(true);
  expect(details.value).toBe('');
  next();
  expect(document.querySelector('[name="C2"]')).toBeNull();
  choose('C1','Yes');
  expect(field('[name="OV8"][value="Yes"]')).toBeTruthy();
  choose('OV8','Yes');
  choose('C1','No');
  expect(document.querySelector('[name="OV8"]')).toBeNull();
  next();
  expect(heading()).toContain('Dasar Ganja Perubatan');
  expect(document.body.textContent).toContain('pengawasan profesional kesihatan yang berkelayakan');
  next();
  expect(heading()).toContain('Penyahjenayahan');
  next();
  expect(document.querySelectorAll('[data-edit]').length).toBe(7);
  expect(document.querySelector('dl')?.textContent).not.toContain('Restoran atau kafe');
  click('[data-lang="en"]');
  next();
  await new Promise(resolve=>setTimeout(resolve,0));
  expect(heading()).toContain('Thank you');
  expect(document.querySelector('.id')!.textContent).toMatch(/^SACOM-/);
  next();
  expect(heading()).toBe('Public Perceptions of Marijuana');
  click('[data-view="about"]');
  expect(heading()).toContain('Understanding perspectives');
  expect(document.querySelectorAll('.topic-card')).toHaveLength(5);
  click('[data-view="home"]');
  expect(heading()).toBe('Public Perceptions of Marijuana');
  click('[data-lang="ms"]');
  expect(heading()).toBe('Persepsi Masyarakat terhadap Ganja');
  click('[data-lang="en"]');
});

it('makes every CVI item available and preserves typed ratings across sections and languages', () => {
  click('[data-view="reviewer"]');
  expect(heading()).toContain('Expert content review');
  expect(document.querySelector('#review-progress')?.textContent).toContain('0 / 80');
  select('#review-q1-relevance','4');
  for (const criterion of ['essentiality','clarity','adequacy']) select(`#review-q1-${criterion}`,'3');
  expect(document.querySelector('#review-progress')?.textContent).toContain('1 / 80');
  const note=document.querySelector<HTMLTextAreaElement>('#comment-q1')!;
  note.value='A sample comment';
  note.dispatchEvent(new Event('input'));
  select('#reviewer-section','3');
  expect(document.querySelectorAll('.reviewer-item')).toHaveLength(1);
  expect(document.querySelectorAll('#review-B1-relevance option')).toHaveLength(5);
  expect(document.querySelectorAll('#review-B1-clarity option')).toHaveLength(4);
  select('#reviewer-section','0');
  click('[data-lang="ms"]');
  expect(heading()).toContain('Penilaian kandungan');
  expect(document.querySelector<HTMLSelectElement>('#review-q1-relevance')?.value).toBe('4');
  expect(document.querySelector<HTMLTextAreaElement>('#comment-q1')?.value).toBe('A sample comment');
  click('[data-view="questionnaire"]');
  expect(heading()).toContain('Maklumat peserta');
  expect(document.querySelector('.pis-lead')?.textContent).toBe('Persepsi Masyarakat Malaysia terhadap Ganja: Kajian Keratan Rentas');
  expect(document.title).toBe('SACOM · Persepsi Masyarakat Malaysia terhadap Ganja: Kajian Keratan Rentas');
  click('[data-view="reviewer"]');
  expect(document.querySelector<HTMLSelectElement>('#review-q1-relevance')?.value).toBe('4');
});


it('exports reviewer data as a local CSV with spreadsheet-safe comments', async () => {
  const captured: Blob[] = [];
  const url = vi.stubGlobal('URL', { createObjectURL: (blob: Blob) => { captured.push(blob); return 'blob:sample'; }, revokeObjectURL: () => {} });
  const download = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  try {
    const note = document.querySelector<HTMLTextAreaElement>('#comment-q1')!;
    note.value = '=1+1';
    note.dispatchEvent(new Event('input'));
    click('#download-review');
    expect(captured).toHaveLength(1);
    const content = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsText(captured[0]);
    });
    expect(content.split('\r\n')).toHaveLength(82);
    expect(content).toContain("\"'=" + "1+1\"");
    expect(content).toContain('"DEC-OP1"');
  } finally {
    download.mockRestore();
    url.unstubAllGlobals();
  }
});
