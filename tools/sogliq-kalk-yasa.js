#!/usr/bin/env node
/* kalki.uz — sog'liq kalkulyatorlari: TVI (BMI), ideal vazn, suv me'yori. Hisob — assets/meyor-core.js (KalkiFit bilan BITTA formula).
 * Andoza — alkogol-kalkulyator.html (sayt infratuzilmasi: til, answerbox, PWA, reklama, PDF/ulashish, v2 sarlavha). Sahifaga xos qismlar shu yerda.
 *   node tools/sogliq-kalk-yasa.js            — 3 sahifani yozadi (UZ; RU — prerender), registrlarni (pages.json, sitemap, sw, index, …) yangilaydi
 * Keyin: node tools/site-chrome.js --write && node tools/og-images.js --write && node tools/prerender.js <slug>.html --write (har biri) */
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
const rd = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8'), wr = (f, s) => fs.writeFileSync(path.join(ROOT, f), s);
const TPL = rd('alkogol-kalkulyator.html');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jsq = (s) => JSON.stringify(s);

/* ---------- umumiy forma bo'laklari ---------- */
const F = {
  jins: '<div class="field"><label data-i="lGender">Jins</label><div class="seg"><button type="button" id="gM" class="on" data-i="segM">Erkak</button><button type="button" id="gF" data-i="segF">Ayol</button></div></div>',
  num: (id, lab, unit, ph, opt) => '<div class="field"><label for="' + id + '" data-i="l_' + id + '">' + lab + '</label><div class="input-shell"><input type="text" id="' + id + '" inputmode="decimal" autocomplete="off" placeholder="' + ph + '"' + (opt ? ' data-opt="1"' : '') + '><span class="unit" data-i="u_' + id + '">' + unit + '</span></div><div class="field-err" id="' + id + 'Err"></div></div>',
};
const CSS = '.field-err{display:none;color:#B3261E;font-size:var(--t-xs,14px);font-weight:700;margin-top:6px}.field-err.show{display:block}'
  + '.big-figure .num.sm{font-size:2rem}.tvi-scale{display:flex;height:10px;border-radius:6px;overflow:hidden;margin:12px 0 4px}.tvi-scale i{flex:1}.tvi-scale i:nth-child(1){background:#7FA7D9}.tvi-scale i:nth-child(2){background:#5FB88A}.tvi-scale i:nth-child(3){background:#E8B04B}.tvi-scale i:nth-child(4){background:#D9734B}'
  + '.tvi-pin{position:relative;height:12px}.tvi-pin b{position:absolute;top:0;width:3px;height:12px;background:#fff;border-radius:2px;transform:translateX(-50%)}'
  + '.kid-msg{display:none;margin-top:12px;background:rgba(255,255,255,.14);border-radius:10px;padding:11px 13px;font-size:var(--t-xs,14px);font-weight:600;line-height:1.5}.kid-msg.show{display:block}';

/* ---------- sahifalar ---------- */
const PAGES = [
  { slug: 'tvi-kalkulyator', joy: 'tvi', ic: 'scale', id: 'tvi', og: 'TVI (BMI) kalkulyatori',
    uz: { title: "TVI (BMI) kalkulyatori — tana vazn indeksi va sog'lom vazn", desc: "Bo'y va vazningizni kiriting — tana vazn indeksi (TVI, BMI), JSST toifasi va bo'yingiz uchun sog'lom vazn oralig'i bir zumda. 18 yoshgacha — alohida izoh.",
      h1: 'TVI (BMI) kalkulyatori', sub: "Tana vazn indeksi va bo'yingiz uchun sog'lom vazn oralig'i — JSST toifalari bo'yicha.", crumb: 'TVI kalkulyatori',
      ab: "TVI (BMI) kalkulyatori — bo'y va vazningizni kiriting: tana vazn indeksi, JSST toifasi (kam vazn, normal, ortiqcha, semizlik) va bo'yingiz uchun sog'lom vazn oralig'i hisoblanadi. 18 yoshgacha TVI foizlik jadval bo'yicha baholanadi.",
      faq: [["TVI qanday hisoblanadi?", "TVI = vazn (kg) ÷ bo'y (m)². Masalan, 70 kg va 1,75 m: 70 ÷ 3,06 ≈ 22,9. Natija JSST toifalari bilan solishtiriladi: 18,5 dan past — kam vazn, 18,5–24,9 — normal, 25–29,9 — ortiqcha vazn, 30 va undan yuqori — semizlik."],
        ["TVI hamma uchun to'g'rimi?", "Yo'q. TVI mushak va yog'ni ajratmaydi: sportchilarda yuqori chiqishi mumkin, keksalarda esa past ko'rsatishi mumkin. Homiladorlikda va 18 yoshgacha ishlatilmaydi — bolalar uchun yosh va jinsga qarab foizlik (percentil) jadval kerak."],
        ["Sog'lom vazn oralig'i qanday topiladi?", "Bo'yingiz uchun TVI 18,5 va 24,9 bo'ladigan vaznlar hisoblanadi. Masalan, 1,70 m bo'yda bu taxminan 53,5–72,0 kg."]],
      seo: "<h2>TVI nima va u nimani ko'rsatadi?</h2><p>Tana vazn indeksi (TVI, inglizcha BMI) — vazn va bo'yning nisbati: vazn (kg) ÷ bo'y (m)². Jahon sog'liqni saqlash tashkiloti (JSST) kattalar uchun toifalarni belgilagan: 18,5 dan past — kam vazn, 18,5–24,9 — normal, 25–29,9 — ortiqcha vazn, 30–34,9 — I darajali, 35–39,9 — II darajali, 40 va undan yuqori — III darajali semizlik.</p><p>TVI — tez tekshiruv uchun qulay ko'rsatkich, lekin tashxis emas: mushak massasi, yosh va tana tuzilishi hisobga olinmaydi. Bel aylanasi va shifokor ko'rigi bilan birga baholang. 18 yoshgacha TVI yosh va jinsga qarab foizlik (percentil) jadval bo'yicha baholanadi.</p>" },
    ru: { title: 'Калькулятор ИМТ (BMI) — индекс массы тела и здоровый вес', desc: 'Введите рост и вес — индекс массы тела (ИМТ, BMI), категория ВОЗ и диапазон здорового веса для вашего роста. До 18 лет — отдельное пояснение.',
      h1: 'Калькулятор ИМТ (BMI)', sub: 'Индекс массы тела и здоровый диапазон веса для вашего роста — по категориям ВОЗ.', crumb: 'Калькулятор ИМТ',
      ab: 'Калькулятор ИМТ (BMI) — введите рост и вес: рассчитаем индекс массы тела, категорию ВОЗ (недостаток, норма, избыток, ожирение) и здоровый диапазон веса для вашего роста. До 18 лет ИМТ оценивают по перцентильным таблицам.',
      faq: [['Как рассчитывается ИМТ?', 'ИМТ = вес (кг) ÷ рост (м)². Например, 70 кг и 1,75 м: 70 ÷ 3,06 ≈ 22,9. Результат сравнивают с категориями ВОЗ: ниже 18,5 — недостаток веса, 18,5–24,9 — норма, 25–29,9 — избыточный вес, 30 и выше — ожирение.'],
        ['Подходит ли ИМТ всем?', 'Нет. ИМТ не различает мышцы и жир: у спортсменов может быть завышен, у пожилых — занижен. При беременности и до 18 лет не используется — для детей нужны перцентильные таблицы по возрасту и полу.'],
        ['Как найти здоровый диапазон веса?', 'Считаются веса, при которых ИМТ равен 18,5 и 24,9 для вашего роста. Например, при росте 1,70 м это примерно 53,5–72,0 кг.']],
      seo: '<h2>Что такое ИМТ и что он показывает?</h2><p>Индекс массы тела (ИМТ, BMI) — соотношение веса и роста: вес (кг) ÷ рост (м)². ВОЗ установила категории для взрослых: ниже 18,5 — недостаток веса, 18,5–24,9 — норма, 25–29,9 — избыточный вес, 30–34,9 — ожирение I степени, 35–39,9 — II степени, 40 и выше — III степени.</p><p>ИМТ удобен для быстрой проверки, но это не диагноз: мышечная масса, возраст и телосложение не учитываются. Оценивайте вместе с окружностью талии и осмотром врача. До 18 лет ИМТ оценивают по перцентильным таблицам с учётом возраста и пола.</p>' },
    form: () => F.jins + F.num('age', 'Yosh', 'yosh', 'masalan, 30') + F.num('height', "Bo'y", 'sm', 'masalan, 170') + F.num('weight', 'Vazn', 'kg', 'masalan, 70'),
    res: '<div class="big-figure"><div class="num" id="mainNum">—</div><div class="lbl" data-i="lblMain">Tana vazn indeksi (TVI)</div></div><div class="tvi-scale" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="tvi-pin" aria-hidden="true"><b id="tviPin" style="left:0"></b></div>'
      + '<div class="kid-msg" id="kidMsg" data-i="kidMsg">18 yoshgacha TVI kattalar jadvali bilan baholanmaydi — bolalar uchun yosh va jinsga qarab foizlik (percentil) jadval kerak. Natijani shifokor yoki pediatr bilan baholang.</div>'
      + '<div class="receipt-rows"><div class="rrow"><span class="k" data-i="kCat">Toifa (JSST)</span><span class="v" id="rCat">—</span></div><div class="rrow"><span class="k" data-i="kRange">Bo\'yingiz uchun sog\'lom vazn</span><span class="v" id="rRange">—</span></div><div class="rrow"><span class="k" data-i="kDiff">Oraliqqacha</span><span class="v accent" id="rDiff">—</span></div></div>',
    dict: { uz: { l_age: 'Yosh', u_age: 'yosh', l_height: "Bo'y", u_height: 'sm', l_weight: 'Vazn', u_weight: 'kg', lblMain: 'Tana vazn indeksi (TVI)', kCat: 'Toifa (JSST)', kRange: "Bo'yingiz uchun sog'lom vazn", kDiff: 'Oraliqqacha',
        kidMsg: "18 yoshgacha TVI kattalar jadvali bilan baholanmaydi — bolalar uchun yosh va jinsga qarab foizlik (percentil) jadval kerak. Natijani shifokor yoki pediatr bilan baholang.",
        cats: { 'ogir-kam': "Jiddiy kam vazn", kam: 'Kam vazn', normal: 'Normal', ortiqcha: 'Ortiqcha vazn', semizlik1: 'Semizlik, I daraja', semizlik2: 'Semizlik, II daraja', semizlik3: 'Semizlik, III daraja' },
        inRange: 'oraliq ichida', toLose: '−{x} kg', toGain: '+{x} kg', kidCat: 'baholanmaydi (18 yoshgacha)', errAge: 'Yoshni kiriting (2–100)', errHeight: "Bo'yni kiriting (100–230 sm)", errWeight: 'Vaznni kiriting (10–300 kg)',
        resWarn: "TVI — tez tekshiruv ko'rsatkichi, tashxis emas: mushak va yog' farqlanmaydi. Homiladorlikda ishlatilmaydi.", foot: "JSST toifalari; sog'lom vazn — TVI 18,5–24,9. Faqat ma'lumot uchun." },
      ru: { l_age: 'Возраст', u_age: 'лет', l_height: 'Рост', u_height: 'см', l_weight: 'Вес', u_weight: 'кг', lblMain: 'Индекс массы тела (ИМТ)', kCat: 'Категория (ВОЗ)', kRange: 'Здоровый вес для вашего роста', kDiff: 'До диапазона',
        kidMsg: 'До 18 лет ИМТ не оценивают по таблице для взрослых — для детей нужны перцентильные таблицы по возрасту и полу. Оцените результат с врачом или педиатром.',
        cats: { 'ogir-kam': 'Выраженный дефицит веса', kam: 'Недостаток веса', normal: 'Норма', ortiqcha: 'Избыточный вес', semizlik1: 'Ожирение I степени', semizlik2: 'Ожирение II степени', semizlik3: 'Ожирение III степени' },
        inRange: 'в диапазоне', toLose: '−{x} кг', toGain: '+{x} кг', kidCat: 'не оценивается (до 18 лет)', errAge: 'Укажите возраст (2–100)', errHeight: 'Укажите рост (100–230 см)', errWeight: 'Укажите вес (10–300 кг)',
        resWarn: 'ИМТ — показатель для быстрой проверки, а не диагноз: мышцы и жир не различаются. При беременности не используется.', foot: 'Категории ВОЗ; здоровый вес — ИМТ 18,5–24,9. Только для справки.' } },
    steps: [["Jins, yosh, bo'y va vazningizni kiriting.", 'Укажите пол, возраст, рост и вес.'], ['TVI va JSST toifasi chiqadi.', 'Покажем ИМТ и категорию ВОЗ.'], ["Bo'yingiz uchun sog'lom vazn oralig'ini ko'ring.", 'Смотрите здоровый диапазон для вашего роста.']],
    calc: `function calc(user){
    var a=num($('age').value), h=num($('height').value), w=num($('weight').value), ok=true;
    ok=chk('age',a>=2&&a<=100,'errAge')&&ok; ok=chk('height',h>=100&&h<=230,'errHeight')&&ok; ok=chk('weight',w>=10&&w<=300,'errWeight')&&ok;
    if(!ok)return false;
    var b=Math.round(M.bmi(w,h)*10)/10, kid=a<18, nv=M.normalVazn(h), cat=M.bmiToifa(b);
    $('mainNum').textContent=dec(b,1);
    $('kidMsg').classList.toggle('show',kid);
    $('rCat').textContent=kid?t('kidCat'):t('cats')[cat];
    $('rRange').textContent=dec(nv.min,1)+' – '+dec(nv.max,1)+' '+t('u_weight');
    $('rDiff').textContent=kid?'—':(w>nv.max?t('toLose').replace('{x}',dec(w-nv.max,1)):(w<nv.min?t('toGain').replace('{x}',dec(nv.min-w,1)):t('inRange')));
    var pos=Math.max(0,Math.min(1,(b-15)/(40-15))); $('tviPin').style.left=(pos*100)+'%';
    data={sex:gender,age:a,height:h,weight:w,kid:kid,v:dec(b,1)};
    return true;
  }`,
    kf: 'if(data.kid)$(\'kfBlok\').hidden=true;else if(window.KFBlok)KFBlok.show($(\'kfBlok\'),\'tvi\',lang,{v:data.v});',
    imp: '{sex:data.sex,age:data.age,height:data.height,weight:data.weight}' },

  { slug: 'ideal-vazn-kalkulyator', joy: 'ideal-vazn', ic: 'heart', id: 'idealvazn', og: 'Ideal vazn kalkulyatori',
    uz: { title: "Ideal vazn kalkulyatori — bo'yingiz uchun sog'lom vazn oralig'i", desc: "Bo'yingiz va jinsingiz bo'yicha ideal vazn: Devine, Robinson, Miller, Hamwi formulalari va TVI 18,5–24,9 oralig'i. Bitta raqam emas — sog'lom oraliq.",
      h1: 'Ideal vazn kalkulyatori', sub: "Bitta «ideal» raqam emas — to'rt formula va TVI bo'yicha sog'lom vazn oralig'i.", crumb: 'Ideal vazn',
      ab: "Ideal vazn kalkulyatori — bo'y va jinsingizni kiriting: Devine, Robinson, Miller va Hamwi formulalari hamda TVI 18,5–24,9 bo'yicha sog'lom vazn oralig'i ko'rsatiladi. Formulalar bir-biridan farq qiladi, shuning uchun natija — bitta raqam emas, oraliq.",
      faq: [["Nega bitta «ideal vazn» raqami yo'q?", "Ideal vazn formulalari (Devine, Robinson, Miller, Hamwi) dori dozasini hisoblash uchun turli yillarda tuzilgan va bir xil bo'yda 5–8 kg farq beradi. Shuning uchun ularning oralig'i va TVI bo'yicha sog'lom oraliq ko'rsatiladi."],
        ["Qaysi formula to'g'riroq?", "Hech biri yagona to'g'ri emas. Tana tuzilishi, mushak massasi va yoshga qarab sog'lom vazn farq qiladi. TVI 18,5–24,9 oralig'i — JSST tavsiyasi; formulalar shu oraliq ichida taxminiy markazni ko'rsatadi."],
        ["152 sm dan past bo'yda hisob to'g'rimi?", "Formulalar 152,4 sm (5 fut) dan baland bo'y uchun tuzilgan — pastroq bo'yda ular kam aniq. Bunday holatda TVI oralig'iga qarang."]],
      seo: "<h2>Ideal vazn qanday hisoblanadi?</h2><p>Mashhur formulalar bo'yning 152,4 sm (5 fut) dan ortiq har 2,54 sm (1 dyuym)iga vazn qo'shadi: Devine (1974) — erkaklar 50 kg + 2,3 kg, ayollar 45,5 kg + 2,3 kg; Robinson (1983) — 52 / 49 kg + 1,9 / 1,7 kg; Miller (1983) — 56,2 / 53,1 kg + 1,41 / 1,36 kg; Hamwi (1964) — 48 / 45,5 kg + 2,7 / 2,2 kg.</p><p>Bu formulalar aslida dori dozasini hisoblash uchun tuzilgan va bir xil bo'yda bir necha kilogramm farq beradi. Shuning uchun sahifa ularning oralig'ini va JSST'ning TVI 18,5–24,9 bo'yicha sog'lom vazn oralig'ini birga ko'rsatadi.</p>" },
    ru: { title: 'Калькулятор идеального веса — здоровый диапазон для вашего роста', desc: 'Идеальный вес по росту и полу: формулы Девайна, Робинсона, Миллера, Хамви и диапазон ИМТ 18,5–24,9. Не одно число — здоровый диапазон.',
      h1: 'Калькулятор идеального веса', sub: 'Не одно «идеальное» число — диапазон по четырём формулам и ИМТ.', crumb: 'Идеальный вес',
      ab: 'Калькулятор идеального веса — введите рост и пол: покажем диапазон по формулам Девайна, Робинсона, Миллера и Хамви и здоровый диапазон по ИМТ 18,5–24,9. Формулы расходятся, поэтому результат — диапазон, а не одно число.',
      faq: [['Почему нет одного «идеального веса»?', 'Формулы идеального веса (Девайн, Робинсон, Миллер, Хамви) создавались в разные годы для расчёта доз лекарств и при одном росте расходятся на 5–8 кг. Поэтому показываем их диапазон и здоровый диапазон по ИМТ.'],
        ['Какая формула точнее?', 'Ни одна не единственно верная. Здоровый вес зависит от телосложения, мышечной массы и возраста. Диапазон ИМТ 18,5–24,9 — рекомендация ВОЗ; формулы показывают примерный центр внутри него.'],
        ['Верен ли расчёт при росте ниже 152 см?', 'Формулы рассчитаны на рост выше 152,4 см (5 футов) — при меньшем росте они менее точны. В этом случае ориентируйтесь на диапазон ИМТ.']],
      seo: '<h2>Как рассчитывается идеальный вес?</h2><p>Известные формулы добавляют вес за каждые 2,54 см (1 дюйм) роста сверх 152,4 см (5 футов): Девайн (1974) — мужчины 50 кг + 2,3 кг, женщины 45,5 кг + 2,3 кг; Робинсон (1983) — 52 / 49 кг + 1,9 / 1,7 кг; Миллер (1983) — 56,2 / 53,1 кг + 1,41 / 1,36 кг; Хамви (1964) — 48 / 45,5 кг + 2,7 / 2,2 кг.</p><p>Эти формулы создавались для расчёта доз лекарств и при одном росте расходятся на несколько килограммов. Поэтому страница показывает их диапазон вместе со здоровым диапазоном ВОЗ по ИМТ 18,5–24,9.</p>' },
    form: () => F.jins + F.num('height', "Bo'y", 'sm', 'masalan, 170') + F.num('weight', 'Hozirgi vazn (ixtiyoriy)', 'kg', 'solishtirish uchun', true),
    res: '<div class="big-figure"><div class="num sm" id="mainNum">—</div><div class="lbl" data-i="lblMain">Formulalar bo\'yicha ideal vazn</div></div>'
      + '<div class="receipt-rows"><div class="rrow"><span class="k" data-i="kTvi">Sog\'lom oraliq (TVI 18,5–24,9)</span><span class="v accent" id="rTvi">—</span></div><div class="rrow"><span class="k">Devine</span><span class="v" id="rDev">—</span></div><div class="rrow"><span class="k">Robinson</span><span class="v" id="rRob">—</span></div><div class="rrow"><span class="k">Miller</span><span class="v" id="rMil">—</span></div><div class="rrow"><span class="k">Hamwi</span><span class="v" id="rHam">—</span></div><div class="rrow" id="rNowRow" hidden style="display:none"><span class="k" data-i="kNow">Hozirgi vaznga nisbatan</span><span class="v" id="rNow">—</span></div></div>'
      + '<div class="kid-msg" id="shortMsg" data-i="shortMsg">152 sm dan past bo\'yda formulalar kam aniq — TVI oralig\'iga qarang.</div>',
    dict: { uz: { l_height: "Bo'y", u_height: 'sm', l_weight: 'Hozirgi vazn (ixtiyoriy)', u_weight: 'kg', lblMain: "Formulalar bo'yicha ideal vazn", kTvi: "Sog'lom oraliq (TVI 18,5–24,9)", kNow: 'Hozirgi vaznga nisbatan',
        shortMsg: "152 sm dan past bo'yda formulalar kam aniq — TVI oralig'iga qarang.", inRange: "sog'lom oraliq ichida", toLose: '{x} kg ortiq', toGain: '{x} kg kam', errHeight: "Bo'yni kiriting (130–230 sm)", errWeight: 'Vaznni tekshiring (30–300 kg)',
        resWarn: "Ideal vazn — taxminiy mo'ljal. Mushak massasi, yosh va tana tuzilishi hisobga olinmaydi. 18 yoshgacha va homiladorlikda ishlatilmaydi.", foot: "Devine (1974), Robinson (1983), Miller (1983), Hamwi (1964); JSST TVI oralig'i. Faqat ma'lumot uchun." },
      ru: { l_height: 'Рост', u_height: 'см', l_weight: 'Текущий вес (необязательно)', u_weight: 'кг', lblMain: 'Идеальный вес по формулам', kTvi: 'Здоровый диапазон (ИМТ 18,5–24,9)', kNow: 'Относительно текущего веса',
        shortMsg: 'При росте ниже 152 см формулы менее точны — ориентируйтесь на диапазон ИМТ.', inRange: 'в здоровом диапазоне', toLose: 'на {x} кг больше', toGain: 'на {x} кг меньше', errHeight: 'Укажите рост (130–230 см)', errWeight: 'Проверьте вес (30–300 кг)',
        resWarn: 'Идеальный вес — примерный ориентир. Мышечная масса, возраст и телосложение не учитываются. До 18 лет и при беременности не используется.', foot: 'Девайн (1974), Робинсон (1983), Миллер (1983), Хамви (1964); диапазон ИМТ ВОЗ. Только для справки.' } },
    steps: [["Jins va bo'yingizni kiriting.", 'Укажите пол и рост.'], ["To'rt formula va TVI bo'yicha oraliq chiqadi.", 'Покажем диапазон по четырём формулам и ИМТ.'], ["Hozirgi vaznni kiritsangiz — farq ko'rinadi.", 'Введите текущий вес — увидите разницу.']],
    calc: `function calc(user){
    var h=num($('height').value), w=num($('weight').value), ok=chk('height',h>=130&&h<=230,'errHeight');
    if(w)ok=chk('weight',w>=30&&w<=300,'errWeight')&&ok;else clr('weight');
    if(!ok)return false;
    var r=M.idealVazn(gender,h), f=r.formulalar, kg=' '+t('u_weight');
    $('mainNum').textContent=dec(r.min,1)+' – '+dec(r.max,1)+kg;
    $('rTvi').textContent=dec(r.tvi.min,1)+' – '+dec(r.tvi.max,1)+kg;
    $('rDev').textContent=dec(f.devine,1)+kg; $('rRob').textContent=dec(f.robinson,1)+kg; $('rMil').textContent=dec(f.miller,1)+kg; $('rHam').textContent=dec(f.hamwi,1)+kg;
    $('shortMsg').classList.toggle('show',h<152.4);
    $('rNowRow').hidden=!w;$('rNowRow').style.display=w?'':'none'; if(w)$('rNow').textContent=w>r.tvi.max?t('toLose').replace('{x}',dec(w-r.tvi.max,1)):(w<r.tvi.min?t('toGain').replace('{x}',dec(r.tvi.min-w,1)):t('inRange'));
    data={sex:gender,height:h,weight:w||null,v:dec(r.tvi.min,1)+'–'+dec(r.tvi.max,1)};
    return true;
  }`,
    kf: 'if(window.KFBlok)KFBlok.show($(\'kfBlok\'),\'ideal-vazn\',lang,{v:data.v});',
    imp: '{sex:data.sex,height:data.height,weight:data.weight}' },

  { slug: 'suv-meyori-kalkulyator', joy: 'suv', ic: 'umbrella', id: 'suvmeyori', og: "Suv me'yori kalkulyatori",
    uz: { title: "Suv me'yori kalkulyatori — kuniga qancha suv ichish kerak", desc: "Vazningizni kiriting — kunlik suv me'yori (33 ml × kg), stakanlarda va millilitrda. KalkiFit ilovasi bilan bir xil hisob. Issiq kunlar va mashg'ulot uchun izoh.",
      h1: "Suv me'yori kalkulyatori", sub: "Kuniga qancha suv ichish kerak — vazningiz bo'yicha, stakanlarda.", crumb: "Suv me'yori",
      ab: "Suv me'yori kalkulyatori — vazningizni kiriting: kunlik suv ehtiyoji 33 ml × kg formulasi bo'yicha hisoblanib, butun stakanga (250 ml) yaxlitlanadi. Issiq kunlarda va mashg'ulotda ehtiyoj oshadi; buyrak yoki yurak kasalligida shifokor bilan maslahatlashing.",
      faq: [["Kuniga qancha suv ichish kerak?", "Taxminiy mo'ljal — har kilogramm vazn uchun 33 ml. Masalan, 70 kg — 2 310 ml, ya'ni taxminan 9 stakan (2 250 ml). Choy, sho'rva, meva va sut ham suv ehtiyojining bir qismini qoplaydi."],
        ["Issiq kunda yoki sportda ko'proq ichish kerakmi?", "Ha. Issiqda va terlaganda suv ko'proq yo'qoladi — mashg'ulotning har soatiga taxminan 0,4–0,8 litr qo'shing. Chanqoqni kutmang, lekin bir martada juda ko'p ichmang."],
        ["Kimlarga bu hisob mos emas?", "Buyrak, yurak yetishmovchiligi yoki suv ichish cheklangan holatlarda me'yorni faqat shifokor belgilaydi. Homiladorlik va emizish davrida ehtiyoj boshqacha."]],
      seo: "<h2>Suv me'yori qanday hisoblanadi?</h2><p>Kalkulyator keng tarqalgan 30–35 ml/kg tavsiyasining o'rtasini oladi: <b>33 ml × vazn (kg)</b>, keyin natija butun stakanga (250 ml) yaxlitlanadi — shunda kun davomida stakan sanash oson bo'ladi. KalkiFit ilovasidagi suv maqsadi aynan shu formula bilan hisoblanadi.</p><p>Bu — umumiy mo'ljal. Ehtiyoj havo harorati, jismoniy faollik, ovqat tarkibi (sho'rva, meva) va sog'liq holatiga qarab o'zgaradi. Siydik rangi och sariq bo'lsa — suv yetarli ekanining oddiy belgisi.</p>" },
    ru: { title: 'Калькулятор нормы воды — сколько воды пить в день', desc: 'Введите вес — дневная норма воды (33 мл × кг) в стаканах и миллилитрах. Тот же расчёт, что в приложении KalkiFit. Пояснения для жары и тренировок.',
      h1: 'Калькулятор нормы воды', sub: 'Сколько воды пить в день — по вашему весу, в стаканах.', crumb: 'Норма воды',
      ab: 'Калькулятор нормы воды — введите вес: дневная потребность считается по формуле 33 мл × кг и округляется до целых стаканов (250 мл). В жару и при тренировках потребность выше; при болезнях почек или сердца проконсультируйтесь с врачом.',
      faq: [['Сколько воды нужно пить в день?', 'Примерный ориентир — 33 мл на каждый килограмм веса. Например, 70 кг — 2 310 мл, то есть около 9 стаканов (2 250 мл). Чай, суп, фрукты и молоко тоже частично покрывают потребность в воде.'],
        ['Нужно ли пить больше в жару или при спорте?', 'Да. В жару и при потоотделении вода теряется быстрее — добавляйте примерно 0,4–0,8 литра на каждый час тренировки. Не ждите жажды, но и не пейте слишком много за раз.'],
        ['Кому этот расчёт не подходит?', 'При болезнях почек, сердечной недостаточности или ограничении жидкости норму определяет только врач. При беременности и кормлении грудью потребность другая.']],
      seo: '<h2>Как рассчитывается норма воды?</h2><p>Калькулятор берёт середину распространённой рекомендации 30–35 мл/кг: <b>33 мл × вес (кг)</b>, затем округляет до целых стаканов (250 мл) — так удобнее считать стаканы в течение дня. Цель по воде в приложении KalkiFit считается точно по этой формуле.</p><p>Это общий ориентир. Потребность меняется в зависимости от температуры, физической активности, состава еды (супы, фрукты) и здоровья. Светло-жёлтый цвет мочи — простой признак, что воды достаточно.</p>' },
    form: () => F.num('weight', 'Vazn', 'kg', 'masalan, 70'),
    res: '<div class="big-figure"><div class="num" id="mainNum">—</div><div class="lbl" data-i="lblMain">Kunlik suv me\'yori</div></div>'
      + '<div class="receipt-rows"><div class="rrow"><span class="k" data-i="kGlass">Stakan (250 ml)</span><span class="v accent" id="rGlass">—</span></div><div class="rrow"><span class="k" data-i="kHow">Hisob</span><span class="v" id="rHow">—</span></div><div class="rrow"><span class="k" data-i="kSport">Mashg\'ulot kuni</span><span class="v" id="rSport">—</span></div></div>',
    dict: { uz: { l_weight: 'Vazn', u_weight: 'kg', lblMain: "Kunlik suv me'yori", kGlass: 'Stakan (250 ml)', kHow: 'Hisob', kSport: "Mashg'ulot kuni", ml: 'ml', glassN: '{n} stakan', sport: '+0,4–0,8 l har soatiga', errWeight: 'Vaznni kiriting (10–300 kg)',
        resWarn: "Umumiy mo'ljal: issiqda va mashg'ulotda ko'proq. Buyrak yoki yurak kasalligida, homiladorlikda me'yorni shifokor belgilaydi.", foot: "33 ml × kg, butun stakanga (250 ml) yaxlitlangan — KalkiFit bilan bir xil. Faqat ma'lumot uchun." },
      ru: { l_weight: 'Вес', u_weight: 'кг', lblMain: 'Дневная норма воды', kGlass: 'Стаканов (250 мл)', kHow: 'Расчёт', kSport: 'День тренировки', ml: 'мл', glassN: '{n} стаканов', sport: '+0,4–0,8 л на каждый час', errWeight: 'Укажите вес (10–300 кг)',
        resWarn: 'Общий ориентир: в жару и при тренировках больше. При болезнях почек или сердца, при беременности норму определяет врач.', foot: '33 мл × кг, округлено до целых стаканов (250 мл) — как в KalkiFit. Только для справки.' } },
    steps: [['Vazningizni kiriting.', 'Укажите вес.'], ["Kunlik me'yor millilitr va stakanda chiqadi.", 'Покажем норму в миллилитрах и стаканах.'], ["Mashg'ulot va issiq kunlar uchun izohni o'qing.", 'Учтите пояснение для тренировок и жары.']],
    calc: `function calc(user){
    var w=num($('weight').value); if(!chk('weight',w>=10&&w<=300,'errWeight'))return false;
    var r=M.water(w);
    $('mainNum').textContent=nf(r.goal)+' '+t('ml');
    $('rGlass').textContent=t('glassN').replace('{n}',r.glasses);
    $('rHow').textContent='33 '+t('ml')+' × '+dec(w,1)+' '+t('u_weight')+' = '+nf(r.ml)+' '+t('ml');
    $('rSport').textContent=t('sport');
    data={weight:w,v:nf(r.goal)};
    return true;
  }`,
    kf: 'if(window.KFBlok)KFBlok.show($(\'kfBlok\'),\'suv\',lang,{v:data.v});',
    imp: '{weight:data.weight}' },
];

/* RU form yorliqlari (sahifaning o'z D lug'atida) */
const RU_FORM = { lGender: 'Пол', segM: 'Мужчина', segF: 'Женщина', btnCalc: 'Рассчитать', rTag: 'Результат расчёта' };
const UZ_FORM = { lGender: 'Jins', segM: 'Erkak', segF: 'Ayol', btnCalc: 'Hisoblash', rTag: 'Hisob natijasi' };

function faqLd(faq) { return JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }); }
function cut(s, a, b) { const i = s.indexOf(a); if (i < 0) throw new Error('andoza: topilmadi ' + a.slice(0, 40)); const j = s.indexOf(b, i); if (j < 0) throw new Error('andoza: topilmadi ' + b.slice(0, 40)); return [i, j]; }

function page(P) {
  for (const L of ['uz', 'ru']) if (!P[L].seo.includes('data-faq')) P[L].seo += P[L].faq.map(([q, a]) => '<h2 data-faq="1">' + esc(q) + '</h2><p>' + esc(a) + '</p>').join('');          // FAQ — sahifada ko'rinadi va faqschema JSON-LD'ga o'tadi
  let s = TPL.split('alkogol-kalkulyator').join(P.slug);
  const U = P.uz;
  // head: sarlavha, tavsif, og
  s = s.replace(/<title>[^<]*<\/title>/, '<title>' + esc(U.title) + '</title>');
  s = s.replace(/(<meta name="description" content=")[^"]*(")/, '$1' + esc(U.desc) + '$2').replace(/(<meta property="og:title" content=")[^"]*(")/, '$1' + esc(U.title) + '$2').replace(/(<meta property="og:description" content=")[^"]*(")/, '$1' + esc(U.desc) + '$2')
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, '$1' + esc(U.title) + '$2').replace(/(<meta name="twitter:description" content=")[^"]*(")/, '$1' + esc(U.desc) + '$2').replace(/(<meta property="og:image:alt" content=")[^"]*(")/, '$1' + esc(P.og) + '$2')
    .replace(/(og\/[a-z-]+\.png\?v=)\d+/g, '$11');
  // answerbox-data
  s = s.replace(/(<script type="application\/json" id="answerbox-data">)[\s\S]*?(<\/script>)/, (m0, a, b) => a + JSON.stringify({ uz: { text: U.ab, sources: [] }, ru: { text: P.ru.ab, sources: [] }, updated: new Date().toISOString().slice(0, 10) }) + b);
  // faq-ld (UZ — prerender RU'ni sahifa JS'i bilan yozadi)
  s = s.replace(/(<script type="application\/ld\+json" id="faq-ld">)[\s\S]*?(<\/script>)/, (m0, a, b) => a + faqLd(U.faq) + b);
  // ilova/hisob JSON-LD nomi
  s = s.replace(/"name":"Alkogol[^"]*"/g, '"name":' + jsq(U.h1)).replace(/"name":"Алкоголь[^"]*"/g, '"name":' + jsq(P.ru.h1));
  // breadcrumb
  s = s.replace(/<span class="cur">Alkogol kalkulyatori<\/span>/, '<span class="cur">' + esc(U.crumb) + '</span>');
  // sarlavha bloki
  s = s.replace(/<h1 data-i="h1">[^<]*<\/h1>/, '<h1 data-i="h1">' + esc(U.h1) + '</h1>').replace(/<p class="sub" data-i="sub">[^<]*<\/p>/, '<p class="sub" data-i="sub">' + esc(U.sub) + '</p>');
  s = s.replace(/(<div class="answerbox noprint" id="answerbox"><p class="ab-te[^>]*>)[^<]*/, '$1' + esc(U.ab));
  // asosiy kontent: <main ...> dan pdfhead gacha
  const [i, j] = cut(s, '<main class="wrap calc-main">', '<div id="pdfhead"');
  const D = { uz: Object.assign({}, UZ_FORM, P.dict.uz, { h1: U.h1, sub: U.sub, cat: 'Kundalik hayot', seo: U.seo, _title: U.title, _desc: U.desc, _crumb: U.crumb }), ru: Object.assign({}, RU_FORM, P.dict.ru, { h1: P.ru.h1, sub: P.ru.sub, cat: 'Повседневная жизнь', seo: P.ru.seo, l_age: P.dict.ru.l_age, u_age: P.dict.ru.u_age, _title: P.ru.title, _desc: P.ru.desc, _crumb: P.ru.crumb }) };
  const formUz = P.form();
  const main = '<main class="wrap calc-main">\n<style id="sogliqcss">' + CSS + '</style>\n<div class="calc-grid">\n<div class="calc-form">\n<section class="form-card">\n' + formUz
    + '\n<button type="button" class="calc-btn" id="calcBtn" data-i="btnCalc">Hisoblash</button>\n</section>\n</div>\n<aside class="res-col" aria-label="Natija"><section class="receipt" id="receipt" aria-live="polite">\n<div class="receipt-body">\n<div class="receipt-tag" data-i="rTag">Hisob natijasi</div>\n' + P.res
    + '\n<div class="receipt-actions"><button type="button" id="shareBtn">Ulashish</button><button type="button" class="pdfbtn">PDF</button></div>\n</div>\n<div class="receipt-edge"></div>\n</section></aside>\n</div>\n<div class="res-extras">\n<div id="kfBlok" hidden></div>\n<div class="result-warn" data-i="resWarn">' + esc(P.dict.uz.resWarn) + '</div>\n'
    + '<div id="datanote" class="datanote noprint" style="margin-top:10px;font-size:var(--t-xs,14px);line-height:1.45;color:var(--t-muted,#3F4F46)" data-i="foot">' + esc(P.dict.uz.foot) + '</div>\n</div>\n'
    + '<section class="seo" id="seoBlock">' + U.seo + '</section>\n</main>\n'
    + '<script src="/assets/meyor-core.js"></script>\n<script src="/assets/kf-blok.js" defer></script>\n<script>\n(function(){\n  var M=window.KalkiMeyor, $=function(i){return document.getElementById(i)};\n  var D=' + JSON.stringify(D) + ';\n'
    + "  var lang=document.documentElement.lang==='ru'?'ru':'uz', gender='m', data=null, shown=false;\n"
    + "  function t(k){return (D[lang]&&D[lang][k]!=null)?D[lang][k]:D.uz[k]}\n  var num=function(s){return parseFloat(String(s||'').replace(/[^\\d.,]/g,'').replace(',','.'))||0};\n"
    + "  function dec(x,n){return (Math.round(x*Math.pow(10,n))/Math.pow(10,n)).toFixed(n).replace('.',',')}\n  function nf(x){return String(Math.round(x)).replace(/\\B(?=(\\d{3})+(?!\\d))/g,' ')}\n"
    + "  function clr(id){var e=$(id+'Err');if(e){e.classList.remove('show');e.textContent=''}}\n  function chk(id,ok,k){var e=$(id+'Err');if(ok){clr(id);return true}if(e){e.textContent=t(k);e.classList.add('show')}return false}\n"
    + '  ' + P.calc + '\n'
    + "  function run(user){if(!calc(user)){if(!shown)$('receipt').classList.remove('show');return}shown=true;$('receipt').classList.add('show');" + P.kf + "}\n"
    + "  function applyLang(){document.documentElement.lang=lang;var ns=document.querySelectorAll('[data-i]');for(var i=0;i<ns.length;i++){var k=ns[i].getAttribute('data-i'),v=t(k);if(typeof v==='string'){if(k==='seo')ns[i].innerHTML=v;else ns[i].textContent=v}}var sb=$('seoBlock');if(sb)sb.innerHTML=t('seo');document.title=t('_title');[['meta[name=description]','_desc'],['meta[property=\"og:title\"]','_title'],['meta[property=\"og:description\"]','_desc'],['meta[name=\"twitter:title\"]','_title'],['meta[name=\"twitter:description\"]','_desc']].forEach(function(x){var m=document.querySelector(x[0]);if(m)m.setAttribute('content',t(x[1]))});var cr=document.querySelector('#breadcrumb .cur');if(cr)cr.textContent=t('_crumb');if(shown)run(false)}\n"
    + "  if($('gM')){$('gM').onclick=function(){gender='m';this.classList.add('on');$('gF').classList.remove('on');if(shown)run(false)};$('gF').onclick=function(){gender='f';this.classList.add('on');$('gM').classList.remove('on');if(shown)run(false)}}\n"
    + "  $('calcBtn').onclick=function(){run(true)};\n  ['age','height','weight'].forEach(function(id){var e=$(id);if(e)e.addEventListener('keydown',function(ev){if(ev.key==='Enter')run(true)})});\n"
    + "  document.addEventListener('click',function(e){if(!e.target.closest||!e.target.closest('#btnKalkiFit')||!data)return;KFBlok.go(" + jsq(P.joy) + ",lang," + P.imp + ",document.documentElement.getAttribute('data-script')==='cyr')});\n"
    + "  window.__applyLang=applyLang; if(lang==='ru')applyLang();\n  window.addEventListener('kalki:lang',function(e){lang=(e&&e.detail&&e.detail.lang)==='ru'?'ru':'uz';applyLang()});\n})();\n</script>\n";
  s = s.slice(0, i) + main + s.slice(j);
  // eski alkogol skripti qoldiqlari (andozaning o'ziga xos JS bloklari) — main ichida edi, kesildi
  return s;
}

const out = [];
for (const P of PAGES) { const h = page(P); wr(P.slug + '.html', h); out.push(P.slug); }

/* ---------- registrlar (idempotent) ---------- */
const J = (f) => JSON.parse(rd(f)), WJ = (f, o, ind) => wr(f, JSON.stringify(o, null, ind == null ? 1 : ind) + '\n');
{ const p = J('tools/dizayn/pages.json'); for (const P of PAGES) if (!p.some((x) => x.slug === P.slug)) p.push({ file: P.slug + '.html', slug: P.slug, tur: 'kalkulyator', kat: 'hayot', klik_uz: 0, klik_ru: 0, kors_uz: 0, kors_ru: 0, ru: true, cyr: false, v2: false, partiya: 2 }); WJ('tools/dizayn/pages.json', p); }
{ const p = J('tools/dizayn/v2-pages.json'); for (const P of PAGES) if (!p.includes(P.slug + '.html')) p.push(P.slug + '.html'); WJ('tools/dizayn/v2-pages.json', p); }
{ const p = J('tools/og-manifest.json'); for (const P of PAGES) if (!p[P.slug]) p[P.slug] = { title: P.og, cat: 'hayot', hash: '', tpl: 1, v: 1 }; WJ('tools/og-manifest.json', p, 2); }
{ const q = J('data/qadamlar.json'); for (const P of PAGES) q.steps[P.slug] = P.steps.map(([uz, ru]) => ({ uz, ru })); WJ('data/qadamlar.json', q); }
{ const h = J('tools/dizayn/holat.json'); for (const P of PAGES) if (!h[P.slug]) h[P.slug] = { oltin: 'OK', seo: 'OK', test: 'OK', sticky: 'OK' }; WJ('tools/dizayn/holat.json', h); }
{ let s = rd('sitemap.xml'); const day = new Date().toISOString().slice(0, 10); for (const P of PAGES) for (const u of ['https://kalki.uz/' + P.slug, 'https://kalki.uz/ru/' + P.slug]) if (!s.includes('<loc>' + u + '</loc>')) s = s.replace('</urlset>', '  <url><loc>' + u + '</loc><lastmod>' + day + '</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n</urlset>'); wr('sitemap.xml', s); }
{ let s = rd('sw.js'); for (const P of PAGES) if (!s.includes("'/" + P.slug + "'")) s = s.replace("  '/alkogol-kalkulyator',", "  '/alkogol-kalkulyator',\n  '/" + P.slug + "',\n  '/ru/" + P.slug + "',"); if (!s.includes("'/assets/kf-blok.js'")) s = s.replace("  '/assets/meyor-core.js',", "  '/assets/meyor-core.js',\n  '/assets/kf-blok.js',"); wr('sw.js', s); }
{ let s = rd('tools/prerender.js'); for (const P of PAGES) if (!s.includes("'" + P.slug + ".html',")) s = s.replace("  'alkogol-kalkulyator.html',", "  'alkogol-kalkulyator.html',\n  '" + P.slug + ".html',"); wr('tools/prerender.js', s); }
{ let s = rd('tools/site-chrome.js'); const NM = { 'tvi-kalkulyator': 'TVI / ИМТ', 'ideal-vazn-kalkulyator': 'Ideal vazn / Идеальный вес', 'suv-meyori-kalkulyator': "Suv me'yori / Норма воды" };
  for (const P of PAGES) { if (!s.includes("['" + P.slug + "', ")) s = s.replace("  ['alkogol-kalkulyator', 'Alkogol / Алкоголь'],", "  ['alkogol-kalkulyator', 'Alkogol / Алкоголь'],\n  ['" + P.slug + "', " + jsq(NM[P.slug]).replace(/^"|"$/g, "'").replace(/^/, '') + '],'); if (!s.includes("'kaloriya-kalkulyator', '" + P.slug + "'") && !new RegExp("'" + P.slug + "'\\]\\]|'" + P.slug + "', ").test(s.split('XN_GROUPS')[1] || '')) s = s.replace("'kaloriya-kalkulyator', ", "'kaloriya-kalkulyator', '" + P.slug + "', "); }
  wr('tools/site-chrome.js', s); }
{ let s = rd('index.html'); const NM = { uz: { tvi: ['TVI (BMI) kalkulyatori', "Tana vazn indeksi va sog'lom vazn oralig'i"], idealvazn: ['Ideal vazn kalkulyatori', "To'rt formula va TVI bo'yicha oraliq"], suvmeyori: ["Suv me'yori kalkulyatori", 'Kuniga necha stakan suv — vazn bo\'yicha'] },
    ru: { tvi: ['Калькулятор ИМТ (BMI)', 'Индекс массы тела и здоровый вес'], idealvazn: ['Калькулятор идеального веса', 'Диапазон по четырём формулам и ИМТ'], suvmeyori: ['Калькулятор нормы воды', 'Сколько стаканов воды в день — по весу'] } };
  for (const P of PAGES) {
    if (!s.includes("href:'" + P.slug + "'")) s = s.replace("    {cat:'hayot', href:'alkogol-kalkulyator', ic:'alert', id:'alkogol'},", "    {cat:'hayot', href:'alkogol-kalkulyator', ic:'alert', id:'alkogol'},\n    {cat:'hayot', href:'" + P.slug + "', ic:'" + P.ic + "', id:'" + P.id + "'},");
    for (const L of ['uz', 'ru']) { const key = '        ' + P.id + ':'; const anchor = L === 'uz' ? '        alkogol:["Alkogol kalkulyatori",' : '        alkogol:["Алкогольный калькулятор",'; const block = s.split(anchor); if (block.length === 2 && !block[1].slice(0, 4000).includes('\n' + key)) { const k = s.indexOf(anchor); const e = s.indexOf('\n', k); s = s.slice(0, e + 1) + key + JSON.stringify(NM[L][P.id]) + ',\n' + s.slice(e + 1); } }
  }
  wr('index.html', s); }
console.log('yozildi:', out.join(', '));
