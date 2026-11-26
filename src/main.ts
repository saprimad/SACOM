import './styles.css';
import config from './questionnaire.json';
import { anonymousId, completion, unanswered, visibleQuestions, DemoRepository, type Language, type Section, type Answers, type Question } from './core';
import { esc, renderContext, renderQuestion } from './questionnaire-view';
import { ReviewerView } from './reviewer';
const sections = config.sections as Section[];
const app = document.querySelector<HTMLDivElement>('#app')!;
type SiteView = 'home' | 'about' | 'questionnaire' | 'reviewer';
function viewFromHash(): SiteView {
  const view = location.hash.slice(1);
  return view === 'about' || view === 'questionnaire' || view === 'reviewer' ? view : 'home';
}
let landingView = viewFromHash();
let language: Language = 'en', step = landingView === 'questionnaire' ? 1 : 0, section = 1, errors: string[] = [], answers: Answers = {};
let consent = false, consentDeclined = false, consentAt = '', responseId = anonymousId(), submitted = false, submitting = false;
const consentQuestion = config.consent as Question;
const reviewer = new ReviewerView([
  { ...sections[0], title: { en: 'Consent and eligibility', ms: 'Persetujuan dan kelayakan' }, questions: [consentQuestion, ...sections[0].questions] },
  ...sections.slice(1),
], config.criteria);
const activeQuestions = (s: Section) => visibleQuestions(s, answers);
const repository = new DemoRepository();
// Live mode remains disabled until the approved SurveyMonkey collector is configured.
const surveyMonkeyUrl = import.meta.env.VITE_SURVEYMONKEY_URL?.trim() || '';
const liveReady = false && /^https:\/\//.test(surveyMonkeyUrl);
const t = (en: string, ms: string) => language === 'en' ? en : ms;
const names = () => [t('Welcome','Selamat datang'),t('Participant information','Maklumat peserta'),t('Informed consent','Persetujuan termaklum'),t('Screening questions','Soalan saringan'),t('Questionnaire','Soal selidik'),t('Review & submit','Semak & hantar'),t('Thank you','Terima kasih')];
function option(name: string, value: string, label: string, checked: boolean, type = 'radio') { return `<label class="option"><input type="${type}" name="${name}" value="${esc(value)}" ${checked?'checked':''}> <span>${esc(label)}</span></label>`; }
function render(focus = true) {
 document.documentElement.lang = language;
 const studyTitle = t(
   'Public Perceptions of Marijuana in Malaysia: A Cross-Sectional Study',
   'Persepsi Masyarakat Malaysia terhadap Ganja: Kajian Keratan Rentas',
 );
 document.title = `PACOM · ${studyTitle}`;
 let content = '';
 if(step === 0) content = `<section class="hero hero-minimal" id="overview"><div class="hero-copy"><span class="eyebrow">${t('A SURVEY OF MALAYSIAN PUBLIC PERSPECTIVES','SOAL SELIDIK PANDANGAN MASYARAKAT MALAYSIA')}</span><h1 tabindex="-1">${t('Public Perceptions of Marijuana','Persepsi Masyarakat terhadap Ganja')}</h1><p class="hero-description">${t('Explore Malaysian adults’ perspectives on marijuana, its perceived risks and benefits, and policy developments in Thailand.','Terokai pandangan orang dewasa Malaysia terhadap marijuana, persepsi risiko dan manfaatnya serta perkembangan dasar di Thailand.')}</p><div class="hero-actions"><button class="primary" id="next">${t('Explore questionnaire','Terokai soal selidik')} <span>↗</span></button></div><span class="hero-caption">${t('RESEARCH DEMO · No responses are collected.','DEMO PENYELIDIKAN · Tiada respons dikumpulkan.')}</span><p class="hero-affiliation">${t('Faculty of Pharmacy · Universiti Teknologi MARA (UiTM)','Fakulti Farmasi · Universiti Teknologi MARA (UiTM)')}</p></div></section>`;

 if(step === 0 && landingView === 'about') content = `<div class="about-page"><section class="about-intro"><span class="eyebrow">${t('ABOUT THE STUDY','MENGENAI KAJIAN')}</span><h1 tabindex="-1">${t('Understanding perspectives, not assuming them.','Memahami perspektif, bukan membuat andaian.')}</h1><p>${t('PACOM is a doctoral research initiative dedicated to understanding public perceptions of marijuana in Malaysia in the context of Thailand’s evolving cannabis policies. Grounded in scientific inquiry and academic integrity, the study seeks to understand diverse perspectives without advocating any particular position.','PACOM ialah inisiatif penyelidikan kedoktoran yang bertujuan memahami persepsi masyarakat terhadap marijuana di Malaysia dalam konteks perkembangan dasar kanabis Thailand. Berteraskan penyelidikan saintifik dan integriti akademik, kajian ini meneliti kepelbagaian perspektif tanpa memihak kepada mana-mana pendirian.')}</p></section><section class="about-block"><span class="eyebrow">${t('RESEARCH OBJECTIVES','OBJEKTIF PENYELIDIKAN')}</span><h2>${t('What the survey aims to understand','Apa yang ingin difahami melalui soal selidik')}</h2><p>${t('To explore awareness of marijuana-related developments, perceived benefits and risks, and perspectives on medical use, non-medical use and different legal or regulatory approaches.','Meneroka kesedaran terhadap perkembangan berkaitan marijuana, persepsi manfaat dan risiko, serta pandangan terhadap penggunaan perubatan, penggunaan bukan perubatan dan pelbagai pendekatan undang-undang atau kawal selia.')}</p></section><section class="about-block"><span class="eyebrow">${t('RESEARCH AREAS','BIDANG KAJIAN')}</span><h2>${t('Many dimensions. Different perspectives.','Pelbagai dimensi. Pelbagai perspektif.')}</h2><div class="topic-grid">${[[t('Health & wellbeing','Kesihatan & kesejahteraan'),t('Perceived benefits and risks','Persepsi manfaat dan risiko')],[t('Society & values','Masyarakat & nilai'),t('Social, cultural and moral views','Pandangan sosial, budaya dan moral')],[t('Law & policy','Undang-undang & dasar'),t('Medical and non-medical policy approaches','Pendekatan dasar perubatan dan bukan perubatan')],[t('Thailand’s influence','Pengaruh Thailand'),t('Awareness of neighbouring policy changes','Kesedaran terhadap perubahan dasar negara jiran')],[t('Economic considerations','Pertimbangan ekonomi'),t('Perceived economic implications','Persepsi implikasi ekonomi')]].map(([title,description],i)=>`<article class="topic-card"><span class="topic-number">0${i+1}</span><h3>${title}</h3><p>${description}</p></article>`).join('')}</div></section><section class="about-researcher"><div class="researcher-monogram" aria-hidden="true">MS<span>PACOM</span></div><div><span class="eyebrow">${t('RESEARCHER','PENYELIDIK')}</span><h2>Mad Sapri Tumiran</h2><p>${t('PhD Candidate · Faculty of Pharmacy, Universiti Teknologi MARA (UiTM)','Calon PhD · Fakulti Farmasi, Universiti Teknologi MARA (UiTM)')}</p><a href="mailto:2024254984@student.uitm.edu.my">2024254984@student.uitm.edu.my</a><p>${t('Supervisor: Dr Mohd Shahezwan Abd Wahab, Faculty of Pharmacy, UiTM.','Penyelia: Dr Mohd Shahezwan Abd Wahab, Fakulti Farmasi, UiTM.')}</p></div></section><section class="about-block about-faq"><span class="eyebrow">${t('FREQUENTLY ASKED QUESTIONS','SOALAN LAZIM')}</span><h2>${t('Before you begin','Sebelum anda bermula')}</h2>${[[t('Does PACOM promote marijuana?','Adakah PACOM mempromosikan marijuana?'),t('No. This academic research examines perspectives without promoting any particular position.','Tidak. Penyelidikan akademik ini meneliti pandangan tanpa mempromosikan mana-mana pendirian.')],[t('Who may participate?','Siapa yang boleh mengambil bahagian?'),t('Draft criteria: Malaysian citizens aged 18 or above, residing in Malaysia, able to understand Malay and/or English. Final eligibility remains subject to research approval.','Kriteria draf: warganegara Malaysia berumur 18 tahun ke atas, menetap di Malaysia dan memahami Bahasa Melayu dan/atau bahasa Inggeris. Kelayakan akhir tertakluk kepada kelulusan penyelidikan.')],[t('Are responses collected?','Adakah respons dikumpulkan?'),t('Not currently. This website is a non-collecting demonstration; all submissions are simulated.','Belum. Laman web ini merupakan demonstrasi tanpa pengumpulan data; semua penghantaran disimulasikan.')],[t('How long is the survey?','Berapa lama masa menjawab?'),t('An estimated 10–15 minutes, subject to feasibility testing.','Anggaran 10–15 minit, tertakluk kepada ujian kebolehlaksanaan.')]].map(([q,a])=>`<details class="faq-item"><summary>${q}</summary><p>${a}</p></details>`).join('')}</section><div class="about-end"><p>${t('Research instrument under development. No active recruitment or response collection.','Instrumen penyelidikan masih dalam pembangunan. Tiada pengambilan peserta atau pengumpulan respons aktif.')}</p><button class="primary" data-begin>${t('Explore questionnaire demo','Terokai demo soal selidik')} ↗</button></div></div>`;
 if(step === 1) content = `<span class="badge">${t('DRAFT · DEMONSTRATION ONLY','DRAF · DEMONSTRASI SAHAJA')}</span><h1 tabindex="-1">${names()[1]}</h1><p class="pis-lead">${studyTitle}</p><div class="pis-summary"><div><strong>${t("Who","Siapa")}</strong><span>${t("Malaysian adults 18+ (draft criteria)","Dewasa Malaysia 18+ (kriteria draf)")}</span></div><div><strong>${t("Duration","Tempoh")}</strong><span>${t("10–15 min (estimate)","10–15 min (anggaran)")}</span></div><div><strong>${t("Your choice","Pilihan anda")}</strong><span>${t("Voluntary participation","Penyertaan sukarela")}</span></div><div><strong>${t("Data","Data")}</strong><span>${t("Demo: no collection","Demo: tiada pengumpulan")}</span></div></div><p class="pis-guide">${t("Please read the full participant information below before proceeding.","Sila baca maklumat peserta sepenuhnya di bawah sebelum meneruskan.")}</p><div class="pis-grid">
<section><h2>${t('Introduction','Pengenalan')}</h2><p>${t('Marijuana remains prohibited in Malaysia, while policies concerning medical and non-medical use have changed in other countries. Thailand’s policy changes have brought this issue closer to Malaysia. This study seeks to understand how Malaysian adults view marijuana and its social acceptance.','Marijuana masih dilarang di Malaysia, manakala dasar berkaitan penggunaan perubatan dan bukan perubatan telah berubah di beberapa negara lain. Perubahan dasar di Thailand menjadikan isu ini lebih dekat dengan Malaysia. Kajian ini bertujuan memahami pandangan orang dewasa Malaysia terhadap marijuana dan penerimaan sosialnya.')}</p></section>
<section><h2>${t('Purpose of the research','Tujuan penyelidikan')}</h2><p>${t('To assess social acceptance of marijuana among Malaysian adults and factors associated with their views, including medical use, reduced criminal penalties, non-medical use, regulation and awareness of policy changes in Thailand.','Untuk menilai penerimaan sosial marijuana dalam kalangan orang dewasa Malaysia serta faktor yang berkaitan dengan pandangan mereka, termasuk penggunaan perubatan, pengurangan penalti jenayah, penggunaan bukan perubatan, kawal selia dan kesedaran terhadap perubahan dasar di Thailand.')}</p></section>
<section><h2>${t('What will I do?','Apakah yang perlu saya lakukan?')}</h2><p>${t('The proposed online questionnaire covers demographics, awareness and exposure, perceived risks and benefits, and views on marijuana use and policy. There are no right or wrong answers. Estimated completion time is 10–15 minutes, subject to feasibility testing. This website is a non-collecting demonstration.','Soal selidik dalam talian yang dicadangkan merangkumi demografi, kesedaran dan pendedahan, persepsi risiko dan manfaat serta pandangan terhadap penggunaan marijuana dan dasar berkaitannya. Tiada jawapan betul atau salah. Anggaran masa menjawab ialah 10–15 minit, tertakluk kepada ujian kebolehlaksanaan. Website ini hanyalah demonstrasi tanpa pengumpulan data.')}</p></section>
<section><h2>${t('Who may participate?','Siapakah yang layak?')}</h2><p>${t('The draft screening requires Malaysian citizenship, age 18 years or above, current residence in Malaysia and ability to understand Bahasa Melayu and/or English. Final eligibility criteria remain subject to research approval.','Saringan draf mensyaratkan kewarganegaraan Malaysia, umur sekurang-kurangnya 18 tahun, sedang menetap di Malaysia serta boleh memahami Bahasa Melayu dan/atau bahasa Inggeris. Kriteria akhir tertakluk kepada kelulusan penyelidikan.')}</p></section>
<section><h2>${t('Voluntary participation and withdrawal','Penyertaan sukarela dan penarikan diri')}</h2><p>${t('Participation is voluntary. You may decline, skip non-screening questions or stop before submission without penalty. For a future anonymous live survey, withdrawing an individual response after submission may not be possible. The demo does not submit any answers.','Penyertaan adalah sukarela. Anda boleh menolak, melangkau soalan selain saringan atau berhenti sebelum penghantaran tanpa penalti. Bagi kajian sebenar yang anonim, penarikan semula jawapan individu selepas penghantaran mungkin tidak dapat dilakukan. Demo ini tidak menghantar sebarang jawapan.')}</p></section>
<section><h2>${t('Possible risks and benefits','Risiko dan manfaat')}</h2><p>${t('Questions about marijuana, religion or income may cause discomfort. You may skip optional items or stop. There is no promised direct benefit; findings may contribute to understanding public perspectives and future research.','Soalan berkaitan marijuana, agama atau pendapatan mungkin menimbulkan ketidakselesaan. Anda boleh melangkau soalan pilihan atau berhenti. Tiada manfaat langsung yang dijanjikan; dapatan mungkin membantu memahami pandangan masyarakat dan penyelidikan seterusnya.')}</p></section>
<section><h2>${t('Privacy and confidentiality','Privasi dan kerahsiaan')}</h2><p>${t('The proposed questionnaire does not request names, identity numbers, telephone numbers, full addresses or precise locations. The live survey’s handling, retention and reporting of data must follow the approved ethics protocol. In this demo, responses stay temporarily in page memory and are not transmitted or saved.','Soal selidik yang dicadangkan tidak meminta nama, nombor pengenalan, nombor telefon, alamat penuh atau lokasi tepat. Pengendalian, penyimpanan dan pelaporan data kajian sebenar mesti mematuhi protokol etika yang diluluskan. Dalam demo ini, jawapan hanya berada sementara dalam memori halaman dan tidak dihantar atau disimpan.')}</p></section>
<section><h2>${t('Researcher and enquiries','Penyelidik dan pertanyaan')}</h2><p><strong>Mad Sapri Tumiran</strong><br>${t('PhD Candidate, Faculty of Pharmacy, Universiti Teknologi MARA (UiTM)','Calon PhD, Fakulti Farmasi, Universiti Teknologi MARA (UiTM)')}<br><a href="mailto:2024254984@student.uitm.edu.my">2024254984@student.uitm.edu.my</a></p><p>${t('Supervisor: Dr Mohd Shahezwan Abd Wahab, Faculty of Pharmacy, UiTM. Ethics committee contact and approval reference will be added only when confirmed.','Penyelia: Dr Mohd Shahezwan Abd Wahab, Fakulti Farmasi, UiTM. Butiran jawatankuasa etika dan nombor rujukan kelulusan hanya akan ditambah selepas disahkan.')}</p></section>
</div><div class="notice">${t('DEMO MODE — No responses are collected. This participant information is a draft for academic demonstration and is not evidence of ethics approval or active recruitment.','MOD DEMO — Tiada respons dikumpulkan. Maklumat peserta ini ialah draf demonstrasi akademik dan bukan bukti kelulusan etika atau pengambilan peserta aktif.')}</div>`;
 if (step === 2) content = `<span class="badge">${t('DEMO CONSENT','PERSETUJUAN DEMO')}</span><h1 tabindex="-1">${names()[2]}</h1><p>${t('By selecting Yes, I confirm that I have read and understood the study information and voluntarily agree to participate. This website demonstrates the survey flow.', 'Dengan memilih Ya, saya mengesahkan bahawa saya telah membaca dan memahami maklumat kajian serta bersetuju secara sukarela untuk menyertainya. Laman ini menunjukkan aliran soal selidik sebagai demo.')}</p><fieldset><legend>${esc(consentQuestion.label[language])}</legend>${option('consent','yes',t('Yes','Ya'),consent)}${option('consent','no',t('No — end survey','Tidak — tamat soal selidik'),consentDeclined)}</fieldset>${errors.length ? `<p class="error" role="alert">${t('Select Yes to proceed with the demo.','Pilih Ya untuk meneruskan demo.')}</p>` : ''}`;
 if (step === 3) content = `<h1 tabindex="-1">${names()[3]}</h1><p>${t('Continue only if all eligibility answers are Yes.','Teruskan hanya jika semua jawapan kelayakan ialah Ya.')}</p>${sections[0].questions.map(q => renderQuestion(q, sections[0], language, answers, errors.includes(q.id))).join('')}${errors.includes('screen-ineligible') ? `<p class="error" role="alert">${t('A No answer ends the screening. Change an incorrect answer to continue.','Jawapan Tidak menamatkan saringan. Betulkan jawapan jika tersilap.')}</p>` : ''}`;
 if (step === 4) {
   const current = sections[section];
   const sectionCount = sections.length - 1;
   const progress = Math.round(section / sectionCount * 100);
   const scale = current.scale ? `<div class="likert-key"><strong>${t('Response scale','Skala jawapan')}</strong><span>${current.scale.map(o => `${o.value} ${esc(o.label[language])}`).join(' · ')}</span></div>` : '';
   content = `<div class="progress-meta"><span>${t('Section','Bahagian')} ${section} / ${sectionCount}</span><span>${completion(sections, answers)}% ${t('required answers','jawapan wajib')}</span></div><progress max="100" value="${progress}" aria-label="${t('Questionnaire section progress','Kemajuan bahagian soal selidik')}"></progress><span class="badge">${t('SAMPLE QUESTIONNAIRE','CONTOH SOAL SELIDIK')}</span><h1 tabindex="-1">${esc(current.title[language])}</h1>${renderContext(current, language)}${scale}${activeQuestions(current).map(q => renderQuestion(q, current, language, answers, errors.includes(q.id))).join('')}`;
 }
 if (step === 0 && landingView === 'reviewer') content = reviewer.render(language);
 if(step === 5) content=`<h1 tabindex="-1">${names()[5]}</h1><p>${t('Check your answers before completing this demonstration. You can edit any section.','Semak jawapan anda sebelum melengkapkan demonstrasi ini. Anda boleh mengedit mana-mana bahagian.')}</p>${sections.map((s,i)=>`<div class="review-heading"><h2>${esc(s.title[language])}</h2><button class="link" data-edit="${i}">${t('Edit','Edit')}<span class="sr-only"> — ${esc(s.title[language])}</span></button></div><dl>${activeQuestions(s).map(q=>{const a=answers[q.id];const values=Array.isArray(a)?a:a?[a]:[];const label=q.type==='textarea'||q.type==='number'?a:values.map(v=>{const option=q.options?.find(o=>o.value===v);const detail=option?.specify?answers[q.id+'-detail-'+v]:'';return [option?.label[language].replace(/_+/g,'').trim()||v,detail].filter(Boolean).join(' ');}).join(', ');return `<div class="review"><dt>${esc(q.label[language])}</dt><dd>${esc(label||t('Not answered','Tidak dijawab'))}</dd></div>`;}).join('')}</dl>`).join('')}<div class="notice">${t('Demo submission only. Your answers will not be saved or sent anywhere.','Penghantaran demo sahaja. Jawapan anda tidak akan disimpan atau dihantar ke mana-mana.')}</div>${errors.length?`<p class="error" role="alert">${t('Submission could not be completed. Please try again.','Penghantaran tidak dapat dilengkapkan. Sila cuba lagi.')}</p>`:''}`;
 if(step === 6) content=`<span class="badge">${t('DEMONSTRATION COMPLETE','DEMONSTRASI SELESAI')}</span><h1 tabindex="-1">${t('Thank you for taking part.','Terima kasih atas penyertaan anda.')}</h1><p>${t('You have completed the PACOM prototype. This submission was simulated; no research response has been stored.','Anda telah melengkapkan prototaip PACOM. Penghantaran ini disimulasikan; tiada respons penyelidikan disimpan.')}</p><p>${t('Your anonymous demo response ID','ID respons demo tanpa nama anda')}</p><div class="id">${esc(responseId)}</div><p>${t('This ID demonstrates how a future response receipt could look.','ID ini menunjukkan contoh resit respons pada masa hadapan.')}</p>`;
 app.innerHTML=`<div class="shell ${step===0?'landing':'questionnaire'}"><header class="header"><a class="brand" href="#" aria-label="PACOM home"><svg class="brand-leaf" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 29V7M16 23C8 19 5 14 4 11C10 12 14 16 16 21M16 23C24 19 27 14 28 11C22 12 18 16 16 21M16 18C12 11 13 6 16 2C19 6 20 11 16 18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>PACOM<small>${t('SOCIAL ACCEPTANCE RESEARCH','PENYELIDIKAN PENERIMAAN SOSIAL')}</small></a><nav class="top-nav" aria-label="${t('Site navigation','Navigasi laman')}"><a href="#home" data-view="home" ${step===0&&landingView==='home'?'aria-current="page"':''}>${t('Home','Utama')}</a><a href="#about" data-view="about" ${step===0&&landingView==='about'?'aria-current="page"':''}>${t('About the Study','Mengenai Kajian')}</a><a href="#questionnaire" data-view="questionnaire" ${landingView==='questionnaire'?'aria-current="page"':''}>${t('Sample Questionnaire','Contoh Soal Selidik')}</a><a href="#reviewer" data-view="reviewer" ${step===0&&landingView==='reviewer'?'aria-current="page"':''}>${t('Reviewer','Penilai')}</a></nav><div class="language" aria-label="${t('Language','Bahasa')}"><button data-lang="en" aria-pressed="${language==='en'}">English</button><button data-lang="ms" aria-pressed="${language==='ms'}">Bahasa Melayu</button></div></header>${step===0?`<main>${content}</main>`:`<div class="layout"><aside class="sidebar"><div class="eyebrow">${t('A space for perspectives','Ruang untuk perspektif')}</div><h2>${t('Every perspective starts with a voice.','Setiap perspektif bermula dengan suara.')}</h2><ol class="steps">${names().map((n,i)=>`<li class="${i===step?'active':''}" ${i===step?'aria-current="step"':''}><span>${i<step?'✓':i+1}</span>${n}</li>`).join('')}</ol><p class="note">${t('Sample prototype · No personal details requested','Prototaip contoh · Tiada butiran peribadi diminta')}</p></aside><main class="card">${content}<div class="nav">${step>0&&step<6?`<button class="secondary" id="previous" ${submitting?'disabled':''}>← ${t('Previous','Sebelumnya')}</button>`:'<span></span>'}<button class="primary" id="next" ${submitting?'disabled':''}>${step===6?t('Start a new demo','Mulakan demo baharu'):step===5?t('Complete demo submission','Lengkapkan penghantaran demo'):step===0?t('Begin questionnaire','Mulakan soal selidik'):t('Continue','Teruskan')} ${step===6?'':'→'}</button></div></main></div>`}<footer>${t('PACOM · Academic research prototype · Demo mode · Powered by SurveyMonkey (planned)','PACOM · Prototaip penyelidikan akademik · Mod demo · Powered by SurveyMonkey (dirancang)')} · ${liveReady ? t('Live collector ready','Pautan survei tersedia') : t('SurveyMonkey not connected','SurveyMonkey belum disambungkan')}</footer></div>`;
 if (step === 0 && landingView === 'reviewer') reviewer.bind(app, language, () => render(false));
 app.querySelectorAll<HTMLButtonElement>('[data-begin]').forEach(button => button.onclick = () => navigate('questionnaire'));
 app.querySelectorAll<HTMLAnchorElement>('[data-view]').forEach(link => link.onclick = event => {
   event.preventDefault();
   navigate(link.dataset.view as SiteView);
 });
 app.querySelector<HTMLAnchorElement>('.brand')!.onclick = event => { event.preventDefault(); navigate('home'); };
 app.querySelectorAll<HTMLButtonElement>('[data-lang]').forEach(button => button.onclick = () => {
   language = button.dataset.lang as Language;
   render(false);
   app.querySelector<HTMLButtonElement>(`[data-lang="${language}"]`)?.focus();
 });
 app.querySelectorAll<HTMLButtonElement>('[data-edit]').forEach(button => button.onclick = () => {
   section = Number(button.dataset.edit);
   step = section === 0 ? 3 : 4;
   errors = [];
   render();
 });
 app.querySelector('#previous')?.addEventListener('click', () => {
   errors = [];
   if (step === 4 && section > 1) section--;
   else if (step === 5) { step = 4; section = sections.length - 1; }
   else step--;
   render();
 });
 app.querySelector('#next')?.addEventListener('click', () => void next());
 if (step >= 2 && step <= 4) {
   app.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input,textarea').forEach(input => {
     input.addEventListener('input', () => updateAnswer(input));
   });
 }
 if (focus) app.querySelector<HTMLElement>('h1')?.focus();
}

function navigate(view: SiteView, writeHash = true) {
  if (submitting) return;
  if (view === 'questionnaire' && submitted) resetDemo();
  landingView = view;
  step = view === 'questionnaire' ? 1 : 0;
  errors = [];
  if (writeHash) history.replaceState(null, '', `#${view}`);
  render();
  window.scrollTo({ top: 0 });
}

function updateAnswer(input: HTMLInputElement | HTMLTextAreaElement) {
  const { name, value } = input;
  if (name === 'consent') {
    consent = value === 'yes';
    consentDeclined = value === 'no';
    return;
  }
  if (input instanceof HTMLInputElement && input.type === 'checkbox') {
    const checkboxes = Array.from(app.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`));
    const exclusive = sections[section]?.questions.find(q => q.id === name)?.options?.find(o => o.exclusive)?.value;
    if (input.checked && exclusive) {
      for (const checkbox of checkboxes) {
        if (checkbox !== input && (value === exclusive || checkbox.value === exclusive)) checkbox.checked = false;
      }
    }
    answers[name] = checkboxes.filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);
  } else {
    answers[name] = value;
  }
  if (name === 'C1') {
    if (value !== 'Yes') {
      for (const question of sections[section].questions) if (question.condition === 'visited') delete answers[question.id];
    }
    render(false);
    app.querySelector<HTMLInputElement>(`input[name="C1"][value="${value}"]`)?.focus({ preventScroll: true });
    return;
  }
  app.querySelectorAll<HTMLLabelElement>(`[data-detail-for="${name}"]`).forEach(label => {
    const option = label.dataset.option!;
    const current = answers[name];
    const selected = Array.isArray(current) ? current.includes(option) : current === option;
    label.hidden = !selected;
    const field = label.querySelector('input')!;
    field.disabled = !selected;
    if (!selected) { field.value = ''; delete answers[field.name]; }
  });
  const progress = app.querySelector('.progress-meta span:last-child');
  if (progress) progress.textContent = `${completion(sections, answers)}% ${t('required answers','jawapan wajib')}`;
}

async function next() {
  errors = [];
  if (step === 0) { navigate('questionnaire'); return; }
  if (step === 2) {
    if (!consent) { errors = ['consent']; render(); return; }
    consentAt = new Date().toISOString();
  }
  if (step === 3) {
    const screening = sections[0].questions;
    errors = unanswered(screening, answers);
    if (!errors.length && screening.some(q => answers[q.id] !== 'Yes')) errors = ['screen-ineligible'];
    if (errors.length) { render(); return; }
    section = 1;
  }
  if (step === 4) {
    errors = unanswered(activeQuestions(sections[section]), answers);
    app.querySelectorAll<HTMLInputElement>('input[type="number"]').forEach(input => {
      if (!input.validity.valid) errors.push(input.name);
    });
    if (errors.length) { render(); return; }
    if (section < sections.length - 1) { section++; render(); return; }
  }
  if (step === 5) {
    if (submitted || submitting) return;
    if (!consent) { step = 2; render(); return; }
    const missing = sections.findIndex(s => unanswered(activeQuestions(s), answers).length > 0);
    if (missing >= 0 || sections[0].questions.some(q => answers[q.id] !== 'Yes')) {
      section = missing > 0 ? missing : 1;
      step = missing > 0 ? 4 : 3;
      render();
      return;
    }
    submitting = true;
    render(false);
    try {
      await repository.submit({ responseId, questionnaireVersion: config.version, language, consent: { accepted: true, acceptedAt: consentAt }, answers: structuredClone(answers), submittedAt: new Date().toISOString() });
      submitted = true;
      answers = {};
    } catch {
      errors = ['submit'];
      submitting = false;
      render();
      return;
    }
    submitting = false;
  }
  if (step === 6) {
    resetDemo();
    navigate('home');
    return;
  }
  step++;
  render();
}
function resetDemo() {
  section = 1;
  answers = {};
  consent = false;
  consentDeclined = false;
  consentAt = '';
  submitted = false;
  responseId = anonymousId();
}

window.addEventListener('hashchange', () => navigate(viewFromHash(), false));
render(false);
