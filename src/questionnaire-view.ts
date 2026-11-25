import type { Answers, Language, Question, Section } from './core';

export const esc = (value: unknown) => String(value).replace(/[&<>"']/g, character =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!
);
const localize = (language: Language, en: string, ms: string) => language === 'en' ? en : ms;

export function renderContext(section: Section, language: Language) {
  return (section.intro ?? []).map(paragraph => `<p>${esc(paragraph[language])}</p>`).join('');
}

export function renderQuestion(question: Question, section: Section, language: Language, answers: Answers, invalid: boolean) {
  const { id, label, type, options = [] } = question;
  const answer = answers[id];
  const chosen = (value: string) => Array.isArray(answer) ? answer.includes(value) : answer === value;
  const title = esc(label[language]);
  const hint = question.description ? `<p class="question-hint">${esc(question.description[language])}</p>` : '';
  const error = invalid ? `<p role="alert" class="error">${localize(language,'Please check this answer.','Sila semak jawapan ini.')}</p>` : '';
  const required = question.required ? ` <small>${localize(language,'(required)','(wajib)')}</small>` : '';
  const subheading = question.subheading ? `<h2 class="survey-domain">${esc(question.subheading[language])}</h2>` : '';
  const scaleRow = section.scale && options.length === section.scale.length &&
    options.every((option, index) => option.label.en === section.scale?.[index].label.en);
  if (scaleRow) {
    const choices = options.map(({ value, label }) => `<label class="likert-choice" title="${esc(label[language])}"><input type="radio" name="${id}" value="${value}" aria-label="${esc(label[language])}" ${chosen(value) ? 'checked' : ''}><span class="likert-number" aria-hidden="true">${value}</span></label>`).join('');
    return `${subheading}<fieldset class="likert-row"><legend class="sr-only">${title}</legend><div class="likert-question"><span class="item-code">${id}</span>${title}</div><div class="likert-choices">${choices}</div></fieldset>`;
  }
  let fields = options.map(({ value, label, specify }) => {
    const text = esc(label[language].replace(/_+/g, '').trim());
    const option = `<label class="option"><input type="${type}" name="${id}" value="${value}" ${chosen(value) ? 'checked' : ''}><span>${text}</span></label>`;
    if (!specify) return option;
    const name = `${id}-detail-${value}`;
    const prompt = localize(language,'Please specify. Use sample details only.','Sila nyatakan. Gunakan butiran contoh sahaja.');
    return option + `<label class="survey-detail" data-detail-for="${id}" data-option="${value}" ${chosen(value) ? '' : 'hidden'}><span>${prompt}</span><input name="${name}" type="text" maxlength="120" value="${esc(answers[name] ?? '')}" ${chosen(value) ? '' : 'disabled'}></label>`;
  }).join('');
  if (type === 'number') {
    fields = `<label class="number-field"><span>${esc(question.units?.[language] ?? '')}</span><input type="number" name="${id}" min="${question.minimum ?? 0}" step="1" value="${esc(answer ?? '')}"></label>`;
  } else if (type === 'textarea') {
    fields = `<textarea name="${id}" maxlength="2000" aria-label="${title}">${esc(answer ?? '')}</textarea>`;
  }
  const showCode = /^(A\d|B1|C\d|OV\d|MED-|DEC-)/.test(id);
  return `${subheading}<fieldset class="${invalid ? 'invalid' : ''}"><legend>${showCode ? `<span class="item-code">${id}</span>` : ''}${title}${required}</legend>${hint}${fields}${error}</fieldset>`;
}
