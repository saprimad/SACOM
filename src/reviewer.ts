import type { Language, Localized, Question, QuestionOption, Section } from './core';
import { esc, renderContext } from './questionnaire-view';

export interface Criterion {
  id: string;
  label: Localized;
  description: Localized;
  options: QuestionOption[];
}

interface ReviewAnswer { scores: Record<string, string>; comment: string }
const choiceLabels: Localized[] = [
  { en: 'Retain without revision', ms: 'Kekalkan tanpa pindaan' },
  { en: 'Retain with minor revisions', ms: 'Kekalkan dengan pindaan kecil' },
  { en: 'Major revisions and further review required', ms: 'Pindaan besar dan semakan lanjut diperlukan' },
];

export class ReviewerView {
  private sectionIndex = 0;
  private ratings = new Map<string, ReviewAnswer>();
  private recommendation = '';
  private generalComment = '';

  constructor(private sections: Section[], private criteria: Criterion[]) {}

  private get count() {
    return [...this.ratings.values()].filter(response =>
      this.criteria.every(criterion => response.scores[criterion.id])).length;
  }

  private get total() {
    return this.sections.reduce((total, section) => total + section.questions.length, 0);
  }

  render(language: Language) {
    const t = (en: string, ms: string) => language === 'en' ? en : ms;
    const section = this.sections[this.sectionIndex];
    const completeCount = `${this.count} / ${this.total} ${t('items fully rated','item dinilai sepenuhnya')}`;
    return `<section class="reviewer-page card">
      <h1 tabindex="-1">${t('Expert content review','Penilaian kandungan oleh pakar')}</h1>
      <p>${t('Review the 25 November 2026 questionnaire draft. Score each item against its purpose and the study objectives. You can leave a score blank and explain why in the comment.', 'Semak draf soal selidik 25 November 2026. Nilai setiap item berdasarkan tujuan item dan objektif kajian. Skor boleh dibiarkan kosong dengan catatan sebabnya.')}</p>
      <p class="reviewer-privacy">${t('Ratings stay in this tab until refreshed. Download the CSV to keep a copy.','Skor disimpan dalam tab ini sehingga halaman dimuat semula. Muat turun CSV untuk menyimpan salinan.')}</p>
      <details class="reviewer-guide"><summary>${t('Study objectives and rating guide','Objektif kajian dan panduan penilaian')}</summary>
        <ol><li>${t('Determine Malaysian adults’ biological, psychological, social, spiritual, economic and legal perceptions of cannabis in relation to Thailand’s policy changes.','Menentukan persepsi biologi, psikologi, sosial, kerohanian, ekonomi dan perundangan orang dewasa Malaysia terhadap ganja berkaitan perubahan dasar Thailand.')}</li>
        <li>${t('Identify sociodemographic characteristics and experiences in Thailand associated with these perceptions.','Mengenal pasti ciri sosiodemografi dan pengalaman di Thailand yang berkait dengan persepsi tersebut.')}</li>
        <li>${t('Examine associations of awareness and information exposure about Thailand’s policies with these perceptions.','Meneliti hubungan antara kesedaran dan pendedahan maklumat tentang dasar Thailand dengan persepsi tersebut.')}</li></ol>
        <ul>${this.criteria.map(c => `<li><strong>${esc(c.label[language])} (${c.options.length})</strong> ${esc(c.description[language])}</li>`).join('')}</ul>
        <p>${t('Consider equivalence of the Malay and English wording. Rate B1 as one multiple-response item.','Pertimbangkan kesetaraan ayat BM dan English. Nilai B1 sebagai satu item dengan pelbagai pilihan jawapan.')}</p>
      </details>
      <div class="reviewer-toolbar">
        <label for="reviewer-section">${t('Section','Bahagian')}
          <select id="reviewer-section">${this.sections.map((s, index) => `<option value="${index}" ${index === this.sectionIndex ? 'selected' : ''}>${esc(s.title[language])}</option>`).join('')}</select>
        </label>
        <p id="review-progress" aria-live="polite">${completeCount}</p>
        <button type="button" class="secondary" id="download-review">${t('Download CSV','Muat turun CSV')}</button>
      </div>
      <h2>${esc(section.title[language])}</h2>
      ${renderContext(section, language)}
      <div class="reviewer-items">${section.questions.map(q => this.renderItem(q, language)).join('')}</div>
      <section class="reviewer-overall"><h2>${t('Overall review','Semakan keseluruhan')}</h2>
        <label for="reviewer-recommendation">${t('Recommendation','Cadangan keseluruhan')}</label>
        <select id="reviewer-recommendation"><option value="">${t('Select if applicable','Pilih jika berkenaan')}</option>${choiceLabels.map((c, i) => `<option value="${i}" ${this.recommendation === String(i) ? 'selected' : ''}>${esc(c[language])}</option>`).join('')}</select>
        <label for="reviewer-overall-comment">${t('Comments on coverage, alignment, wording or response scales','Komen tentang liputan, keselarasan, ayat atau skala jawapan')}</label>
        <textarea id="reviewer-overall-comment" maxlength="3000">${esc(this.generalComment)}</textarea>
      </section>
    </section>`;
  }

  private renderItem(question: Question, language: Language) {
    const t = (en: string, ms: string) => language === 'en' ? en : ms;
    const answer = this.ratings.get(question.id);
    const another = language === 'en' ? 'ms' : 'en';
    let options = (question.options ?? []).map(option => `<li>${esc(option.label[language])}</li>`).join('');
    if (question.units) options = `<li>${t('Numeric response','Jawapan berangka')} (${esc(question.units[language])})</li>`;
    return `${question.subheading ? `<h3>${esc(question.subheading[language])}</h3>` : ''}<article class="reviewer-item">
      <span class="item-code">${esc(question.id)}</span><strong>${esc(question.label[language])}</strong>
      <p class="item-translation" lang="${another}">${esc(question.label[another])}</p>
      ${question.description ? `<p class="question-hint">${esc(question.description[language])}</p>` : ''}
      ${options ? `<details><summary>${t('Participant response options','Pilihan jawapan peserta')}</summary><ul>${options}</ul></details>` : ''}
      <div class="reviewer-scores">${this.criteria.map(c => `<label for="review-${question.id}-${c.id}">${esc(c.label[language])}<select id="review-${question.id}-${c.id}" data-item="${question.id}" data-criterion="${c.id}"><option value="">${t('Unrated','Belum dinilai')}</option>${c.options.map(o => `<option value="${o.value}" ${answer?.scores[c.id] === o.value ? 'selected' : ''}>${o.value} · ${esc(o.label[language])}</option>`).join('')}</select></label>`).join('')}</div>
      <label class="reviewer-comment" for="comment-${question.id}">${t('Comments and proposed wording','Komen dan cadangan ayat')}<textarea id="comment-${question.id}" data-comment="${question.id}" maxlength="1500">${esc(answer?.comment ?? '')}</textarea></label>
    </article>`;
  }

  bind(root: HTMLElement, language: Language, redraw: () => void) {
    root.querySelector<HTMLSelectElement>('#reviewer-section')?.addEventListener('change', event => {
      this.sectionIndex = Number((event.currentTarget as HTMLSelectElement).value);
      redraw();
      root.querySelector<HTMLSelectElement>('#reviewer-section')?.focus();
    });
    root.querySelectorAll<HTMLSelectElement>('select[data-criterion]').forEach(select => {
      select.addEventListener('change', () => {
        this.answerFor(select.dataset.item!).scores[select.dataset.criterion!] = select.value;
        const progress = root.querySelector('#review-progress');
        if (progress) progress.textContent = `${this.count} / ${this.total} ${language === 'en' ? 'items fully rated' : 'item dinilai sepenuhnya'}`;
      });
    });
    root.querySelectorAll<HTMLTextAreaElement>('[data-comment]').forEach(input => {
      input.addEventListener('input', () => { this.answerFor(input.dataset.comment!).comment = input.value; });
    });
    const recommendation = root.querySelector<HTMLSelectElement>('#reviewer-recommendation');
    recommendation?.addEventListener('change', () => { this.recommendation = recommendation.value; });
    const comment = root.querySelector<HTMLTextAreaElement>('#reviewer-overall-comment');
    comment?.addEventListener('input', () => { this.generalComment = comment.value; });
    root.querySelector('#download-review')?.addEventListener('click', () => this.download());
  }

  private answerFor(id: string): ReviewAnswer {
    const existing = this.ratings.get(id);
    if (existing) return existing;
    const response = { scores: {}, comment: '' };
    this.ratings.set(id, response);
    return response;
  }

  private download() {
    const csvCell = (value: string) => `"${(/^[\s\uFEFF]*[=+@-]|^[\t\r\n]/.test(value) ? "'" + value : value).replace(/"/g,'""')}"`;
    const rows = [['Item', 'Section', 'English', 'Bahasa Melayu', ...this.criteria.map(c => c.label.en), 'Comments']];
    for (const section of this.sections) {
      for (const q of section.questions) {
        const a = this.ratings.get(q.id);
        rows.push([q.id, section.title.en, q.label.en, q.label.ms, ...this.criteria.map(c => a?.scores[c.id] ?? ''), a?.comment ?? '']);
      }
    }
    rows.push(['OVERALL', '', '', '', ...this.criteria.map(() => ''), [this.recommendation === '' ? '' : choiceLabels[Number(this.recommendation)].en, this.generalComment].filter(Boolean).join('\n')]);
    const csv = '\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'PACOM-CVI-review-25-Nov-2026.csv';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
