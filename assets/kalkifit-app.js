/* kalki.uz — "KalkiFit" ilovasi (vanilla JS): kaloriya, ovqat va qadam. Hisob: assets/kalkifit-core.js, umumiy komponentlar: assets/app-kit.js.
 * Saqlash: localStorage "kalki_fit". Hech narsa serverga yuborilmaydi (faqat foydalanuvchi "AI bilan aniqlash"ni bosganda ovqat matni). Baza: data/ovqatlar.json (lazy). */
(function () {
  'use strict';
  if (/jsdom/i.test(navigator.userAgent || '')) return;      // prerender (jsdom) ilova DOM'ini HTML'ga pishirmasin
  var S = window.KalkiFit, Dt = S && S.dates; if (!S || !window.RzKit) return;
  var LS = 'kalki_fit', LS_IMPORT = 'kalki_fit_import', LS_CID = 'kalki_fit_cid', DAY_MS = 86400000;
  var OLD = { 'kalki_fit': 'kalki_salomat', 'kalki_fit_import': 'kalki_salomat_import', 'kalki_fit_cid': 'kalki_salomat_cid' };   // eski nom (Salomat): preview foydalanuvchilari ma'lumoti yo'qolmasin
  function lsGet(k) { try { var v = localStorage.getItem(k); if (v == null && OLD[k]) { v = localStorage.getItem(OLD[k]); if (v != null && k !== 'kalki_fit_import') localStorage.setItem(k, v); } return v; } catch (e) { return null; } }
  var D = {
    uz: {
      appName: 'KalkiFit', navToday: 'Bugun', navFood: 'Ovqat', navSteps: 'Qadam', navMe: 'Men', add: "Ovqat qo'shish", kcal: 'kkal', gram: 'g', km: 'km',
      today: 'Bugun', yesterday: 'Kecha', back: 'Orqaga', next: 'Keyingi', start: 'Boshlash', save: 'Saqlash', cancel: 'Bekor qilish', del: "O'chirish", close: 'Yopish', confirm: 'Tasdiqlash', later: 'Keyinroq', saved: 'Saqlandi', del1: "Yozuv o'chirildi",
      mealb: 'Nonushta', meall: 'Tushlik', mealds: 'Kechki ovqat', mealss: 'Gazak', meald: 'Kechki ovqat', meals: 'Gazak',
      o1q: 'Jinsingiz?', male: 'Erkak', female: 'Ayol', preg: 'Homiladorman yoki emizikli onaman', o2q: 'Yoshingiz nechida?', o2h: "Faqat kunlik me'yorni hisoblash uchun.", o3q: "Bo'yingiz necha sm?", o4q: 'Vazningiz necha kg?', o4h: 'Kasr bilan yozish mumkin: 72,5',
      o5q: "Kuningiz qanday o'tadi?", o6q: 'Maqsadingiz?', errAge: '10 dan 100 gacha yozing', errHeight: '120 dan 230 gacha yozing', errWeight: '30 dan 250 gacha yozing',
      a1: "Ko'proq o'tiraman", a1h: "Ofis yoki uyda ishlayman, kam yuraman", a2: 'Yengil faol', a2h: "Ozgina yuraman yoki haftada 1–2 mashq", a3: "O'rtacha faol", a3h: 'Haftada 3–5 mashq', a4: 'Juda faol', a4h: 'Deyarli har kuni mashq', a5: "Og'ir jismoniy mehnat", a5h: "Kun bo'yi oyoqda, og'ir ish",
      gkeep: 'Vaznni saqlash', gkeepH: "Hozirgi vaznni ushlab turish", gslow: 'Sekin kamaytirish', gslowH: 'Haftasiga ≈ 0,25 kg', glose: 'Kamaytirish', gloseH: 'Haftasiga ≈ 0,5 kg', ggain: "Ko'paytirish", ggainH: 'Haftasiga ≈ 0,25 kg', gLocked: "Sizning holatingizda faqat vaznni saqlash rejimi hisoblanadi.",
      rT: "Sizning kunlik me'yoringiz", rWhyKeep: 'Siz kuniga taxminan {tdee} kkal sarflaysiz. Vaznni saqlash uchun shuncha yeyish kifoya.', rWhyLose: 'Siz kuniga taxminan {tdee} kkal sarflaysiz. Haftasiga ≈ {kg} kg kamaytirish uchun {d} kkal kam yeysiz.', rWhyGain: "Siz kuniga taxminan {tdee} kkal sarflaysiz. Haftasiga ≈ {kg} kg ko'paytirish uchun {d} kkal ko'p yeysiz.",
      rFloor: "Kamaytirish tezligi xavfsiz chegaraga ({min} kkal) moslandi, shuning uchun haftasiga ≈ {kg} kg.", rDoc: "Shifokor bilan maslahatlashing. Bu hisob faqat vaznni saqlash uchun.", under18: "18 yoshdan kichiklar uchun dieta hisoblanmaydi.", pregN: "Homiladorlik va emizish davrida dieta hisoblanmaydi.", lowBmi: "Vazningiz me'yordan past (BMI < 18,5): dieta hisoblanmaydi.",
      disc: "Taxminiy hisob — tibbiy maslahat emas.", rMacro: 'Oqsil {p} g · yog\' {f} g · uglevod {c} g', rWater: 'Suv: {n} stakan ({ml} ml)',
      ringOf: '/ {t} kkal', remLbl: 'Yana yeyish mumkin', overLbl: "Me'yordan ko'p", stepPlus: 'Qadamlar hisobiga +{c} kkal', hHow: 'Bu raqam qanday hisoblanadi?', limitParts: "{t} me'yor + {c} qadamlardan", tAiSite: "AI bugun juda band — ovqatni qidiruv orqali qo'shing (u internetsiz ham ishlaydi). Ertaga AI yana ishlaydi.", phSite: "Rasm tahlili bugun juda band — ovqatni matn yoki qidiruv bilan qo'shing. Ertaga yana ishlaydi.", hEmpty: "Birinchi ovqatni yozing — «Yedingiz» va «Qoldi» shu yerda yangilanadi.", stEmpty: "Qadam yozsangiz, ustunlar shu yerda o'sadi.",
      mP: 'Oqsil', mF: "Yog'", mC: 'Uglevod', wT: 'Suv', wOf: '{n} / {m} stakan', wHint: 'Stakanga bosing', wDone: "Suv me'yori bajarildi", sT: 'Qadam', sAdd: 'Qadam kiritish', sNone: 'Bugun hali kiritilmagan', sGoalDone: 'Qadam maqsadi bajarildi',
      addMeal: "+ Qo'shish", emptyMeal: "Hali yo'q",
      aT: "Ovqat qo'shish", aAiBtn: "AI bilan qo'shish", aSugBtn: 'Bazaga taklif qilish', aSugNote: "Saqlasangiz, nom va kaloriya (shaxsiy ma'lumotsiz) bazaga taklif sifatida yuboriladi.", aPh: 'Ovqat nomi (osh, somsa…)', aRec: 'Oxirgi', aMine: 'Mening taomlarim', aCats: 'Guruhlar', aFav: 'Sevimli', aPop: 'Mashhur', aNone: 'Topilmadi', aNoneH: "Boshqa nom bilan yozing yoki o'z taomingizni qo'shing.", aCustom: "O'z taomim", aText: 'Matn bilan qo\'shish', aLoading: 'Baza yuklanmoqda…', aEst: 'taxminiy', per100: '{k} kkal / 100 g', all: 'Hammasi',
      cat_o: "O'zbek taomlari", cat_n: 'Non', cat_s: 'Sut', cat_m: "Go'sht, baliq, tuxum", cat_g: 'Don va makaron', cat_v: 'Sabzavot', cat_f: 'Meva', cat_d: "Yong'oq, quruq meva", cat_i: 'Ichimlik', cat_q: 'Fast-food', cat_h: 'Shirinlik', cat_x: 'Boshqa',
      pwGramm: 'gramm', pwEq: '1 {u} ≈ {g} g', pwNow: 'hozir {g} g', pwQty: 'Miqdor', pwQuick: 'Tez tanlash', pwSwap: 'Taomni almashtirish', pwSwapT: "O'xshash taomlar", pwNoSim: "O'xshash taom topilmadi", pwDone: 'Tayyor', pwApprox: "Taxminiy qiymat — porsiyani o'zingizga moslang.", pwAll: "Hammasini qo'shish ({n})", pwEditRow: "{x} — porsiyani o'zgartirish", tplMore: 'Ovqat amallari', tplSave1: 'Shu ovqatni saqlash', tplSaveH: 'Odatdagi ovqat sifatida', tplNameT: 'Nomi', tplNameIn: "Yoki o'zingiz yozing", tplSaved: 'Saqlandi: {x}', tplFull: "12 ta to'ldi — Men → «Odatdagi ovqatlarim»dan keraksizini o'chiring.", tplMine: 'Odatdagi ovqatlarim', tplMineH: 'Tez-tez yeydiganlaringiz', tplEmpty: "Tez-tez yeydigan ovqatingizni bir marta saqlang — keyin bir bosishda qo'shiladi.", tplBar: 'Odatdagilar', tplYest: 'Kechagidek', tplYestT: 'Kecha yegan ovqatlar', tplAdd: "Qo'shish ({n})", tplRen: "Nomini o'zgartirish", tplDel1: "Odatdagi ovqat o'chirildi", tplUp: 'Yuqoriga', tplDown: 'Pastga', tplCnt: '{n} ta · {k} kkal', tplChk: 'Tanlash', tplS0: 'Uy nonushtasi', tplS1: 'Ishdagi nonushta', tplS2: 'Mashqdan keyin', tplL0: 'Uy tushligi', tplL1: 'Ishdagi tushlik', tplD0: 'Uy kechki ovqati', tplD1: 'Yengil kechki ovqat', tplT0: 'Tamaddi', tplT1: 'Ishdagi tamaddi', tplSaveS: 'Saqlash', tplToday: 'Bugun yozilganlar', tplTodayRow: '{n} ta taom · {k} kkal', tplNoToday: 'Avval ovqat yozing, keyin uni shu yerda bir bosishda saqlaysiz.', tplAddFood: "Ovqat qo'shish", tplSugT: 'Siz tez-tez yeysiz: {x} — saqlaymi?', tplNo: "Yo'q", tplHint: "Bir marta saqlang — keyin bir bosishda qo'shiladi.", famN: '{n} xil', famDef: 'odatiy tanlov', srcBtn: 'Manba', srcNone: "Bu taom uchun manba yozuvi yo'q.", srcApprox: "Retsept o'rtacha uy taomiga asoslangan, ±15% farq bo'lishi mumkin.", srcApprox2: "Qiymat mavjud jadvallarga asoslangan, ±15% farq bo'lishi mumkin.", srcAi: "Bu qiymatni AI taxmin qildi — aniq emas.", srcUnitB: "birlik grammi mavjud baza qiymati (tarozida hali tekshirilmagan)", srcUnitA: "birlik grammi o'xshash taomdan olingan taxmin", vNew: 'Mening idishim', vfT: "Ichiga to'ldirish", vf_yarim: 'Yarim', vf_tola: "To'la", vf_kop: "Ko'p", vk_kosa: 'Kosa', vk_lagan: 'Lagan', vk_piyola: 'Piyola', vk_likopcha: 'Likopcha', vk_custom: "O'zim yozaman", vn_kosa: 'Mening kosam', vn_lagan: 'Mening laganim', vn_piyola: 'Mening piyolam', vn_likopcha: 'Mening likopcham', vn_custom: 'Mening idishim', vs_kosa: 'Odatiy kosa', vs_lagan: 'Odatiy lagan', vs_piyola: 'Odatiy piyola', vs_likopcha: 'Odatiy likopcha', vs_custom: 'Odatiy porsiya', vcT: 'Mening idishim', vcFor: '«{x}» uchun', vcLink: 'Boshqa idishlaringiz', vcKind: 'Idish turi', vcName: 'Idish nomi', vcHow: 'Hajmini qanday aniqlaymiz?', vcScaleOn: 'Tarozida tortdim', vcScaleOff: "Tarozim yo'q", vcHint: "Idishni bo'sh torting, keyin ovqat bilan — farqi ovqatingiz.", vcFull: 'Ovqat bilan vazn (g)', vcEmpty: "Bo'sh idish vazni (g)", vcDirect: "Yoki to'g'ridan-to'g'ri ovqat grammi", vcRes: 'Ovqat: {g} g', vcStd: '{k} ≈ {g} g', vcCompare: 'Sizning idishingiz standartga nisbatan?', vc_kichik: 'Kichikroq (×0,75)', vc_ohshash: "Shunga o'xshash (×1)", vc_katta: 'Kattaroq (×1,3)', vcSave: 'Saqlash', vcBad: "Gramm 10 dan 3000 gacha bo'lsin", vcMax: "Ko'pi bilan 20 ta idish. Keraksizini Men → «Mening idishlarim»dan o'chiring.", vSaved: 'Saqlandi: {x}', vmT: 'Mening idishlarim', vmH: "O'z kosa va laganlaringiz", vmEmpty: "O'z kosangizni bir marta belgilang — keyin hisob aniqroq bo'ladi.", vmGuide: "Ovqat qo'shayotganda porsiya oynasida «+ Mening idishim» ni bosing.", vmMax: "Ko'pi bilan {n} ta idish.", vmDel1: "Idish o'chirildi", vmEdit: 'Tahrirlash', vmName: 'Nomi', vmFam: 'Taomlar', vsugL: 'Har safar laganingizdan yeysizmi? Uni bir marta belgilang.', vsugK: 'Har safar kosangizdan yeysizmi? Uni bir marta belgilang.', vsugYes: 'Belgilash', vsugNo: 'Keyin', navDiary: 'Kundalik', navResults: 'Natijalar', navProfile: 'Profil', navAdd: "Qo'shish", diaryT: 'Kundalik', resT: 'Natijalar', profT: 'Profil', todayDate: 'Bugun, {d}', cEaten: 'Yedingiz', cGoal: 'Maqsad', cLeft: 'Qoldi', cOver: "Maqsaddan {x} kkal ko'p", cNote: "Kiritilgan ovqatlar bo'yicha", mainAdd: "+ Ovqat qo'shish", wCard: '{a} / {b} ml', wAdd: '+250', sCard: '{n} qadam', sEnter: 'Kiritish', sNoneC: 'Bugun kiritilmagan', macroRow: "Oqsil · Yog' · Uglevod", fabMenuT: "Nimani qo'shamiz?", fabFood: 'Ovqat', fabWater: 'Suv', fabSteps: 'Qadam', fabWeight: 'Vazn', wOpenT: 'Suv', themeT: 'Mavzu', thAuto: 'Avto', thLight: 'Och', thDark: "Qorong'i", profData: "Maqsad va ma'lumotlar", resWeekT: 'Hafta xulosasi', resMore: 'Batafsil', diaryAdd: "Shu kunga ovqat qo'shish", profBackup: 'Zaxira va ko\'chirish', calInfoT: 'Taqvim qanday hisoblanadi?', aAiLine: '✨ AI bilan aniqlash: «{q}»', aRecentT: 'Oxirgilar', aSavedT: 'Saqlanganlar', aMoreT: 'Boshqa usullar', aCatsBtn: "Kategoriyalar bo'yicha ko'rish", aLastTime: 'Oxirgi safar: {x}', aDefOne: '{x} ≈ {k} kkal', aQuickAdd: "Qo'shish", aAdded: "Qo'shildi: {x}", pAddBtn: "Qo'shish", pMoreT: "Turi va hajmini aniqlashtirish", pMore2T: 'Boshqa sozlamalar', srcPer100: '{k} kkal / 100 g', nbSee: "Ko'rish", nbClose: 'Yopish', pUnit: 'Qancha?', pMeal: 'Qaysi ovqat?', pSave: 'Saqlash', pEstNote: "Taxminiy qiymat: aniq retsept va porsiyaga qarab o'zgaradi.", pEdit: 'Ovqatni tahrirlash', pMacro: "oqsil {p} · yog' {f} · uglevod {c}", favOn: 'Sevimlilarga qo\'shildi', favOff: 'Sevimlilardan olindi',
      cT: "O'z taomim", cName: 'Nomi', cKcal: 'Necha kkal? (bir porsiyada)', cG: "Porsiya og'irligi, g (ixtiyoriy)", cP: 'Oqsil, g (ixtiyoriy)', cF: "Yog', g (ixtiyoriy)", cC: 'Uglevod, g (ixtiyoriy)',
      tT: "Matn bilan qo'shish", tPh: 'Masalan: 1 kosa osh, 2 somsa, choy shakar bilan', tGo: 'Aniqlash', tMiss: 'Topilmadi: {x}', tAi: 'AI bilan aniqlash', tAiNote: "Bu matn AI xizmatiga yuboriladi (profil, vazn va tarix yuborilmaydi).", tAiBusy: 'Aniqlanmoqda…', tAiErr: "AI hozir ishlamayapti. Qo'lda qo'shing.", tOffline: "Internet yo'q — AI ishlamaydi. Topilganlarini saqlashingiz mumkin.", tSave: '{n} ta ovqatni saqlash', tAiTag: 'AI taxmini', tHelp: "Faqat siz tasdiqlaganingizda saqlanadi.", tEmpty: 'Hech narsa topilmadi',
      fT: 'Ovqat', fDay: 'Kun', fAddText: "Matn bilan qo'shish", fFavs: 'Sevimlilar', fNoFavs: "Sevimli ovqatlar yo'q. Ovqat qo'shayotganda yurakchani bosing.",
      stT: 'Qadam', stGoal: 'Maqsad: {x}', stEnter: 'Telefondagi jami qadamni yozing', stWhere: 'Qadam sonini qayerdan topaman?', stWeek: 'Oxirgi 7 kun', stCmp: "Bu {km} km — {route} yo'lining {pct}%", stCmpFull: 'Bu taxminan {route} masofasi ({km} km) dan ko\'proq', stMonth: 'Shu oy', stGoalSet: 'Kunlik qadam maqsadi', stDayEdit: '{d} kuni qadami', stTotal: 'Jami: {n} qadam · {km} km · {k} kkal', stNoRank: 'Bu faqat o\'zingiz uchun — reyting yo\'q.',
      hT: 'Qadam sonini qayerdan topaman?', hIos: "iPhone: «Salomatlik» (Health) ilovasi → Ko'rish → Qadamlar", hSam: 'Samsung: Samsung Health → bosh sahifa → Qadamlar', hGoo: 'Android: Google Fit → bosh sahifa → Qadamlar', hNote: "Jami qadamni yozing — ilova masofa va kaloriyani o'zi hisoblaydi.",
      meT: 'Men', meProf: 'Profil', meEdit: 'Tahrirlash', meW: 'Vazn', meAddW: "Vazn qo'shish", meAvg: '7 kunlik o\'rtacha: {x} kg', meAvgH: "Bir kunlik tebranish muhim emas — o'rtacha chiziqqa qarang.", meNoW: "Vazn yozilmagan", meGoalW: "Maqsad vazni, kg (ixtiyoriy)", meProg: "Maqsadgacha {x} kg qoldi", meDelta: 'Boshlanishdan {x} kg', meShare: 'Natijamni ulashish',
      pfAge: 'Yosh', pfH: "Bo'y, sm", pfW: 'Vazn, kg', pfAct: 'Faollik', pfGoal: 'Maqsad', pfSex: 'Jins', pfSaved: "Me'yor yangilandi: {x} kkal",
      wtT: 'Vaznni yozish', wDay: 'Qaysi kun?',
      shT: 'Natijamni ulashish', shH: "Faqat o'zingiz tanlagan raqamlar rasmga tushadi.", shDays: 'Kunlar', shSteps: 'Qadam', shKm: 'Masofa', shWeight: "Vazn o'zgarishi", shGo: 'Rasmni ulashish', shDl: 'Rasmni yuklab olish', shTitle: 'Mening natijam', shWin: 'Oxirgi 30 kun', shDaysV: 'kun yozdim', shStepsV: 'qadam', shKmV: 'km yurdim', shWV: 'kg', shNone: 'Hech narsa tanlanmagan',
      sExp: 'Zaxira nusxa olish', sImp: 'Zaxira nusxadan tiklash', sDel: "Hammasini o'chirish", sLang: 'Til', sFont: "Shrift o'lchami", fN: 'Oddiy', fB: 'Katta', sTips: "Yo'l-yo'riqni qayta ko'rish", sAbout: 'Ilova haqida', priv: "Ma'lumotlaringiz faqat shu qurilmada saqlanadi.", med: "Bu tibbiy maslahat emas. Taxminiy hisob: sog'liq masalasida shifokor bilan maslahatlashing.",
      expDone: 'Zaxira nusxa saqlandi', impT: 'Zaxira nusxadan tiklash', impAsk: "Hozirgi ma'lumot zaxira nusxadagi bilan almashtiriladi. Davom etasizmi?", impOk: 'Tiklandi', impBad: "Zaxira nusxa fayli noto'g'ri", delAsk1: "Hamma ma'lumot o'chiriladi.", delAsk2: "Aniq o'chiraymi? Qaytarib bo'lmaydi.", deleted: "Hammasi o'chirildi",
      xKcalT: "Bu raqam qanday hisoblanadi?", xTarget: "Kunlik me'yor", xLimit: "Bugungi me'yor", xEaten: 'Yeyilgan', xSteps: 'Odatiydan ortiq qadamlar', xRem: 'Yana yeyish mumkin', xWhyStep: "Faollik darajangizdagi odatiy qadam soni ({base}) me'yorga allaqachon kiritilgan. Faqat undan ORTIQ qadamlar uchun to'liq sof kaloriya qo'shiladi: (3,5 − 1) × vazn × (masofa ÷ 5 km/soat). Chegaradan kam bo'lsa 0 qo'shiladi — me'yor kamaymaydi.", xHowT: "Me'yor qanday chiqdi?", xBmr: 'Tinch holatdagi sarf (BMR)', xBmrN: 'Mifflin–St Jeor formulasi', xAct: 'Faollik koeffitsienti', xTdee: 'Kunlik sarf (TDEE)', xGoal: 'Maqsad uchun farq', xFloor: "Pastki xavfsiz chegara", xTargetR: "Kunlik me'yor",
      xMacroT: 'Qanday hisoblangan?', xProt: 'Oqsil: {pk} g/kg × {w} kg = {p} g', xFat: "Yog': kaloriyaning 27,5% i ÷ 9 = {f} g", xCarb: "Uglevod: qolgan kaloriya ÷ 4 = {c} g", xMacroN: 'Oqsil mushaklarni saqlaydi, yog\' va uglevod energiya beradi.',
      xWaterT: 'Suv me\'yori', xWater: '33 ml × {w} kg = {ml} ml ÷ 250 ml = {n} stakan', xWaterN: 'Issiq kunlarda va mashq qilganda ko\'proq ichsangiz bo\'ladi.',
      xStepT: 'Qadam qanday hisoblanadi?', xStride: "Qadam uzunligi: bo'y × 0,414 = {s} sm", xDist: 'Masofa: {n} qadam × {s} sm = {km} km', xKc: 'Kaloriya: 3,5 × {w} kg × ({km} km ÷ 5 km/soat) = {k} kkal', xKcN: "Yurish tezligi 5 km/soat deb olingan (oddiy yurish). Hisob taxminiy.",
      xWeightT: "Vazn yorlig'i nimani bildiradi?", xWeightN: "1 ta o'lchov — «Birinchi o'lchov». 2–6 ta bo'lsa — oxirgi 7 kundagi o'lchovlar o'rtachasi. 7 kundan ko'p tarix bo'lsa — 7 kunlik o'rtacha va oldingi 7 kunga nisbatan trend. Vazn kun davomida 1–2 kg tebranadi, shu sababli bitta o'lchovga qarab xulosa qilmang.",
      tip1: "Bu yerda bugun nechta kkal yeganingiz va qancha qolgani ko'rinadi. Ovqat yozsangiz «Qoldi» kamayadi.", tip2: "«Qo'shish» tugmasi — ovqat, suv, qadam yoki vazn qo'shish. Ovqat uchun odatda 3 ta bosish yetadi.", tip3: "«Natijalar»da vazn, hafta xulosasi va qadam tarixi bor — qadam sonini yozsangiz ilova masofa va kaloriyani hisoblaydi.",
      wkT: "O'tgan hafta", wkAvgK: "To'liq kunlarda o'rtacha: {x} kkal/kun", wkAvgS: "O'rtacha qadam: {x}", wkW: "Vazn (7 kunlik o'rtacha): {a} → {b} kg", wkDays: "7 kundan {n} tasi to'liq", wkNone: "Ma'lumot kam",
      nudgeInstall: "Ilovani bosh ekranga qo'shing — tezroq ochiladi va ma'lumot saqlanadi.", nudgeInstallBtn: "O'rnatish", nudgeIos: "iPhone'da: Safari'da «Ulashish» → «Bosh ekranga qo'shish». Aks holda Safari ma'lumotni o'chirib yuborishi mumkin.", nudgeBackup: "Haftalik zaxira vaqti — ma'lumot faqat shu qurilmada.", nudgeBackupBtn: 'Telegramga yuborish',
      qtyMinus: 'Kamaytirish', qtyPlus: "Ko'paytirish", aboutBack: 'Orqaga', errAmt: 'Raqamni kiriting', stepsT: 'Bugungi qadam', stepsOf: '{d} kuni qadami',
      units: { g100: 'g', kosa: 'kosa', likop: 'lagan', dona: 'dona', bolak: "bo'lak", stakan: 'stakan', qoshiq: 'osh qoshiq', choyq: 'choy qoshiq', piyola: 'piyola', porsiya: 'porsiya', hovuch: 'hovuch', tilim: 'tilim', shisha: 'shisha' }
    },
    ru: {
      appName: 'KalkiFit', navToday: 'Сегодня', navFood: 'Еда', navSteps: 'Шаги', navMe: 'Я', add: 'Добавить еду', kcal: 'ккал', gram: 'г', km: 'км',
      today: 'Сегодня', yesterday: 'Вчера', back: 'Назад', next: 'Далее', start: 'Начать', save: 'Сохранить', cancel: 'Отмена', del: 'Удалить', close: 'Закрыть', confirm: 'Подтвердить', later: 'Позже', saved: 'Сохранено', del1: 'Запись удалена',
      mealb: 'Завтрак', meall: 'Обед', mealds: 'Ужин', mealss: 'Перекус', meald: 'Ужин', meals: 'Перекус',
      o1q: 'Ваш пол?', male: 'Мужской', female: 'Женский', preg: 'Я беременна или кормлю грудью', o2q: 'Сколько вам лет?', o2h: 'Только для расчёта дневной нормы.', o3q: 'Ваш рост в сантиметрах?', o4q: 'Ваш вес в килограммах?', o4h: 'Можно с дробью: 72,5',
      o5q: 'Как проходит ваш день?', o6q: 'Ваша цель?', errAge: 'Введите от 10 до 100', errHeight: 'Введите от 120 до 230', errWeight: 'Введите от 30 до 250',
      a1: 'Больше сижу', a1h: 'Работаю в офисе или дома, мало хожу', a2: 'Слегка активный', a2h: 'Немного хожу или 1–2 тренировки в неделю', a3: 'Умеренно активный', a3h: '3–5 тренировок в неделю', a4: 'Очень активный', a4h: 'Тренировки почти каждый день', a5: 'Тяжёлый физический труд', a5h: 'Весь день на ногах, тяжёлая работа',
      gkeep: 'Сохранить вес', gkeepH: 'Удерживать текущий вес', gslow: 'Медленно снижать', gslowH: '≈ 0,25 кг в неделю', glose: 'Снижать', gloseH: '≈ 0,5 кг в неделю', ggain: 'Набирать', ggainH: '≈ 0,25 кг в неделю', gLocked: 'В вашем случае считается только режим сохранения веса.',
      rT: 'Ваша дневная норма', rWhyKeep: 'Вы тратите примерно {tdee} ккал в день. Чтобы сохранить вес, достаточно столько и есть.', rWhyLose: 'Вы тратите примерно {tdee} ккал в день. Чтобы терять ≈ {kg} кг в неделю, нужно есть на {d} ккал меньше.', rWhyGain: 'Вы тратите примерно {tdee} ккал в день. Чтобы набирать ≈ {kg} кг в неделю, нужно есть на {d} ккал больше.',
      rFloor: 'Темп снижения приведён к безопасной границе ({min} ккал), поэтому ≈ {kg} кг в неделю.', rDoc: 'Проконсультируйтесь с врачом. Этот расчёт только для сохранения веса.', under18: 'Для лиц младше 18 лет диета не рассчитывается.', pregN: 'Во время беременности и кормления диета не рассчитывается.', lowBmi: 'Ваш вес ниже нормы (ИМТ < 18,5): диета не рассчитывается.',
      disc: 'Приблизительный расчёт — не медицинская рекомендация.', rMacro: 'Белки {p} г · жиры {f} г · углеводы {c} г', rWater: 'Вода: {n} стаканов ({ml} мл)',
      ringOf: '/ {t} ккал', remLbl: 'Ещё можно съесть', overLbl: 'Больше нормы', stepPlus: 'За счёт шагов +{c} ккал', hHow: 'Как считается это число?', limitParts: '{t} норма + {c} за шаги', tAiSite: 'ИИ сегодня перегружен — добавьте еду через поиск (он работает и без интернета). Завтра ИИ снова заработает.', phSite: 'Анализ фото сегодня перегружен — добавьте еду текстом или через поиск. Завтра снова заработает.', hEmpty: 'Запишите первую еду — «Съели» и «Осталось» обновятся здесь.', stEmpty: 'Запишете шаги — столбики вырастут здесь.',
      mP: 'Белки', mF: 'Жиры', mC: 'Углеводы', wT: 'Вода', wOf: '{n} / {m} стаканов', wHint: 'Нажимайте на стакан', wDone: 'Норма воды выполнена', sT: 'Шаги', sAdd: 'Ввести шаги', sNone: 'Сегодня ещё не введено', sGoalDone: 'Цель по шагам выполнена',
      addMeal: '+ Добавить', emptyMeal: 'Пока пусто',
      aT: 'Добавить еду', aAiBtn: 'Добавить через ИИ', aSugBtn: 'Предложить в базу', aSugNote: 'Если сохраните, название и калории (без личных данных) уйдут в базу как предложение.', aPh: 'Название (плов, самса…)', aRec: 'Недавние', aMine: 'Мои блюда', aCats: 'Группы', aFav: 'Избранное', aPop: 'Популярное', aNone: 'Не найдено', aNoneH: 'Напишите иначе или добавьте своё блюдо.', aCustom: 'Своё блюдо', aText: 'Добавить текстом', aLoading: 'Загрузка базы…', aEst: 'примерно', per100: '{k} ккал / 100 г', all: 'Все',
      cat_o: 'Узбекские блюда', cat_n: 'Хлеб', cat_s: 'Молочное', cat_m: 'Мясо, рыба, яйца', cat_g: 'Крупы и макароны', cat_v: 'Овощи', cat_f: 'Фрукты', cat_d: 'Орехи, сухофрукты', cat_i: 'Напитки', cat_q: 'Фастфуд', cat_h: 'Сладкое', cat_x: 'Другое',
      pwGramm: 'грамм', pwEq: '1 {u} ≈ {g} г', pwNow: 'сейчас {g} г', pwQty: 'Количество', pwQuick: 'Быстрый выбор', pwSwap: 'Заменить блюдо', pwSwapT: 'Похожие блюда', pwNoSim: 'Похожих блюд не найдено', pwDone: 'Готово', pwApprox: 'Примерное значение — подгоните порцию под себя.', pwAll: 'Добавить всё ({n})', pwEditRow: '{x} — изменить порцию', tplMore: 'Действия с приёмом пищи', tplSave1: 'Сохранить этот приём', tplSaveH: 'Как привычную еду', tplNameT: 'Название', tplNameIn: 'Или впишите своё', tplSaved: 'Сохранено: {x}', tplFull: 'Заполнено 12 — удалите ненужное в «Я» → «Привычная еда».', tplMine: 'Привычная еда', tplMineH: 'То, что вы едите часто', tplEmpty: 'Сохраните то, что часто едите, один раз — потом добавляйте в одно касание.', tplBar: 'Привычное', tplYest: 'Как вчера', tplYestT: 'Что вы ели вчера', tplAdd: 'Добавить ({n})', tplRen: 'Переименовать', tplDel1: 'Привычная еда удалена', tplUp: 'Выше', tplDown: 'Ниже', tplCnt: '{n} шт. · {k} ккал', tplChk: 'Выбрать', tplS0: 'Домашний завтрак', tplS1: 'Завтрак на работе', tplS2: 'После тренировки', tplL0: 'Домашний обед', tplL1: 'Обед на работе', tplD0: 'Домашний ужин', tplD1: 'Лёгкий ужин', tplT0: 'Перекус', tplT1: 'Перекус на работе', tplSaveS: 'Сохранить', tplToday: 'Записано сегодня', tplTodayRow: '{n} шт. · {k} ккал', tplNoToday: 'Сначала запишите еду — потом здесь её можно сохранить в одно касание.', tplAddFood: 'Добавить еду', tplSugT: 'Вы часто едите: {x} — сохранить?', tplNo: 'Нет', tplHint: 'Сохраните один раз — потом добавляйте в одно касание.', famN: '{n} вид.', famDef: 'обычный вариант', srcBtn: 'Источник', srcNone: 'Для этого блюда нет записи об источнике.', srcApprox: 'Рецепт основан на среднем домашнем блюде, возможно отклонение ±15%.', srcApprox2: 'Значение основано на существующих таблицах, возможно отклонение ±15%.', srcAi: 'Это значение оценил ИИ — оно неточное.', srcUnitB: 'граммы единицы — существующее значение базы (на весах пока не проверено)', srcUnitA: 'граммы единицы — оценка по похожему блюду', vNew: 'Моя посуда', vfT: 'Насколько наполнена', vf_yarim: 'Половина', vf_tola: 'Полная', vf_kop: 'С горкой', vk_kosa: 'Миска', vk_lagan: 'Лаган', vk_piyola: 'Пиала', vk_likopcha: 'Тарелочка', vk_custom: 'Своя (впишу название)', vn_kosa: 'Моя миска', vn_lagan: 'Мой лаган', vn_piyola: 'Моя пиала', vn_likopcha: 'Моя тарелочка', vn_custom: 'Моя посуда', vs_kosa: 'Обычная миска', vs_lagan: 'Обычный лаган', vs_piyola: 'Обычная пиала', vs_likopcha: 'Обычная тарелочка', vs_custom: 'Обычная порция', vcT: 'Моя посуда', vcFor: 'для «{x}»', vcLink: 'Другая ваша посуда', vcKind: 'Вид посуды', vcName: 'Название', vcHow: 'Как определим объём?', vcScaleOn: 'Взвесил(а)', vcScaleOff: 'Весов нет', vcHint: 'Взвесьте пустую посуду, затем с едой — разница и есть ваша еда.', vcFull: 'Вес с едой (г)', vcEmpty: 'Вес пустой посуды (г)', vcDirect: 'Или сразу вес еды (г)', vcRes: 'Еда: {g} г', vcStd: '{k} ≈ {g} г', vcCompare: 'Ваша посуда по сравнению со стандартной?', vc_kichik: 'Меньше (×0,75)', vc_ohshash: 'Такая же (×1)', vc_katta: 'Больше (×1,3)', vcSave: 'Сохранить', vcBad: 'Вес от 10 до 3000 г', vcMax: 'Не больше 20 штук. Удалите лишнее в «Я» → «Моя посуда».', vSaved: 'Сохранено: {x}', vmT: 'Моя посуда', vmH: 'Ваши миски и лаганы', vmEmpty: 'Отметьте свою миску один раз — и расчёт станет точнее.', vmGuide: 'При добавлении еды в окне порции нажмите «+ Моя посуда».', vmMax: 'Не больше {n} штук.', vmDel1: 'Посуда удалена', vmEdit: 'Изменить', vmName: 'Название', vmFam: 'Блюда', vsugL: 'Вы всегда едите из своего лагана? Отметьте его один раз.', vsugK: 'Вы всегда едите из своей миски? Отметьте её один раз.', vsugYes: 'Отметить', vsugNo: 'Позже', navDiary: 'Дневник', navResults: 'Итоги', navProfile: 'Профиль', navAdd: 'Добавить', diaryT: 'Дневник', resT: 'Итоги', profT: 'Профиль', todayDate: 'Сегодня, {d}', cEaten: 'Съели', cGoal: 'Цель', cLeft: 'Осталось', cOver: 'На {x} ккал больше цели', cNote: 'По внесённым блюдам', mainAdd: '+ Добавить еду', wCard: '{a} / {b} мл', wAdd: '+250', sCard: '{n} шагов', sEnter: 'Ввести', sNoneC: 'Сегодня не введено', macroRow: 'Белки · Жиры · Углеводы', fabMenuT: 'Что добавим?', fabFood: 'Еда', fabWater: 'Вода', fabSteps: 'Шаги', fabWeight: 'Вес', wOpenT: 'Вода', themeT: 'Тема', thAuto: 'Авто', thLight: 'Светлая', thDark: 'Тёмная', profData: 'Цель и данные', resWeekT: 'Итоги недели', resMore: 'Подробнее', diaryAdd: 'Добавить еду на этот день', profBackup: 'Резервная копия и перенос', calInfoT: 'Как считается календарь?', aAiLine: '✨ Определить через ИИ: «{q}»', aRecentT: 'Недавние', aSavedT: 'Сохранённое', aMoreT: 'Другие способы', aCatsBtn: 'Смотреть по категориям', aLastTime: 'В прошлый раз: {x}', aDefOne: '{x} ≈ {k} ккал', aQuickAdd: 'Добавить', aAdded: 'Добавлено: {x}', pAddBtn: 'Добавить', pMoreT: 'Уточнить вид и размер', pMore2T: 'Другие настройки', srcPer100: '{k} ккал / 100 г', nbSee: 'Смотреть', nbClose: 'Закрыть', pUnit: 'Сколько?', pMeal: 'Какой приём пищи?', pSave: 'Сохранить', pEstNote: 'Значение примерное: зависит от рецепта и порции.', pEdit: 'Изменить запись', pMacro: 'белки {p} · жиры {f} · углеводы {c}', favOn: 'Добавлено в избранное', favOff: 'Убрано из избранного',
      cT: 'Моё блюдо', cName: 'Название', cKcal: 'Сколько ккал? (в одной порции)', cG: 'Вес порции, г (по желанию)', cP: 'Белки, г (по желанию)', cF: 'Жиры, г (по желанию)', cC: 'Углеводы, г (по желанию)',
      tT: 'Добавить текстом', tPh: 'Например: 1 миска плова, 2 самсы, чай с сахаром', tGo: 'Распознать', tMiss: 'Не найдено: {x}', tAi: 'Определить с помощью ИИ', tAiNote: 'Этот текст будет отправлен сервису ИИ (профиль, вес и история не отправляются).', tAiBusy: 'Определяю…', tAiErr: 'ИИ сейчас недоступен. Добавьте вручную.', tOffline: 'Нет интернета — ИИ не работает. Найденное можно сохранить.', tSave: 'Сохранить: {n}', tAiTag: 'оценка ИИ', tHelp: 'Сохраняется только после вашего подтверждения.', tEmpty: 'Ничего не найдено',
      fT: 'Еда', fDay: 'День', fAddText: 'Добавить текстом', fFavs: 'Избранное', fNoFavs: 'Избранного нет. Нажмите на сердечко при добавлении еды.',
      stT: 'Шаги', stGoal: 'Цель: {x}', stEnter: 'Введите общее число шагов с телефона', stWhere: 'Где посмотреть число шагов?', stWeek: 'Последние 7 дней', stCmp: 'Это {km} км — {pct}% пути {route}', stCmpFull: 'Это больше расстояния {route} (≈ {km} км)', stMonth: 'За этот месяц', stGoalSet: 'Дневная цель по шагам', stDayEdit: 'Шаги за {d}', stTotal: 'Всего: {n} шагов · {km} км · {k} ккал', stNoRank: 'Это только для вас — никаких рейтингов.',
      hT: 'Где посмотреть число шагов?', hIos: 'iPhone: приложение «Здоровье» → Обзор → Шаги', hSam: 'Samsung: Samsung Health → главная → Шаги', hGoo: 'Android: Google Fit → главная → Шаги', hNote: 'Введите общее число шагов — расстояние и калории приложение посчитает само.',
      meT: 'Я', meProf: 'Профиль', meEdit: 'Изменить', meW: 'Вес', meAddW: 'Записать вес', meAvg: 'Среднее за 7 дней: {x} кг', meAvgH: 'Колебания за один день не важны — смотрите на линию среднего.', meNoW: 'Вес не записан', meGoalW: 'Желаемый вес, кг (по желанию)', meProg: 'До цели осталось {x} кг', meDelta: 'С начала: {x} кг', meShare: 'Поделиться результатом',
      pfAge: 'Возраст', pfH: 'Рост, см', pfW: 'Вес, кг', pfAct: 'Активность', pfGoal: 'Цель', pfSex: 'Пол', pfSaved: 'Норма обновлена: {x} ккал',
      wtT: 'Записать вес', wDay: 'За какой день?',
      shT: 'Поделиться результатом', shH: 'На картинку попадут только выбранные вами цифры.', shDays: 'Дни', shSteps: 'Шаги', shKm: 'Расстояние', shWeight: 'Изменение веса', shGo: 'Поделиться картинкой', shDl: 'Скачать картинку', shTitle: 'Мой результат', shWin: 'Последние 30 дней', shDaysV: 'дн. вёл записи', shStepsV: 'шагов', shKmV: 'км пройдено', shWV: 'кг', shNone: 'Ничего не выбрано',
      sExp: 'Сделать резервную копию', sImp: 'Восстановить из резервной копии', sDel: 'Удалить всё', sLang: 'Язык', sFont: 'Размер шрифта', fN: 'Обычный', fB: 'Крупный', sTips: 'Показать подсказки снова', sAbout: 'О приложении', priv: 'Ваши данные хранятся только на этом устройстве.', med: 'Это не медицинская рекомендация. Расчёт приблизительный: по вопросам здоровья консультируйтесь с врачом.',
      expDone: 'Резервная копия сохранена', impT: 'Восстановление из резервной копии', impAsk: 'Текущие данные будут заменены данными из резервной копии. Продолжить?', impOk: 'Восстановлено', impBad: 'Неверный файл резервной копии', delAsk1: 'Все данные будут удалены.', delAsk2: 'Точно удалить? Вернуть нельзя.', deleted: 'Всё удалено',
      xKcalT: 'Как считается это число?', xTarget: 'Дневная норма', xLimit: 'Норма на сегодня', xEaten: 'Съедено', xSteps: 'Шаги сверх обычного', xRem: 'Ещё можно съесть', xWhyStep: 'Обычное число шагов для вашего уровня активности ({base}) уже учтено в норме. Прибавляются калории только за шаги СВЕРХ этого порога, полностью и «чистыми»: (3,5 − 1) × вес × (расстояние ÷ 5 км/ч). Если шагов меньше порога — прибавляется 0, норма не уменьшается.', xHowT: 'Как получилась норма?', xBmr: 'Расход в покое (BMR)', xBmrN: 'формула Миффлина — Сан-Жеора', xAct: 'Коэффициент активности', xTdee: 'Дневной расход (TDEE)', xGoal: 'Разница для цели', xFloor: 'Нижняя безопасная граница', xTargetR: 'Дневная норма',
      xMacroT: 'Как посчитано?', xProt: 'Белки: {pk} г/кг × {w} кг = {p} г', xFat: 'Жиры: 27,5% калорий ÷ 9 = {f} г', xCarb: 'Углеводы: остаток калорий ÷ 4 = {c} г', xMacroN: 'Белок сохраняет мышцы, жиры и углеводы дают энергию.',
      xWaterT: 'Норма воды', xWater: '33 мл × {w} кг = {ml} мл ÷ 250 мл = {n} стаканов', xWaterN: 'В жару и при тренировках можно пить больше.',
      xStepT: 'Как считаются шаги?', xStride: 'Длина шага: рост × 0,414 = {s} см', xDist: 'Расстояние: {n} шагов × {s} см = {km} км', xKc: 'Калории: 3,5 × {w} кг × ({km} км ÷ 5 км/ч) = {k} ккал', xKcN: 'Скорость ходьбы принята 5 км/ч (обычная ходьба). Расчёт приблизительный.',
      xWeightT: 'Что означает подпись под весом?', xWeightN: 'Одно измерение — «Первое измерение». 2–6 измерений — среднее за последние 7 дней. Если истории больше 7 дней — среднее за 7 дней и тренд относительно предыдущих 7 дней. Вес в течение дня колеблется на 1–2 кг, поэтому не делайте выводов по одному измерению.',
      tip1: 'Здесь видно, сколько ккал вы съели сегодня и сколько осталось. Записываете еду — «Осталось» уменьшается.', tip2: 'Кнопка «Добавить» — еда, вода, шаги или вес. Для еды обычно хватает 3 нажатий.', tip3: 'В «Итогах» — вес, итоги недели и история шагов; введите шаги — приложение посчитает расстояние и калории.',
      wkT: 'Прошлая неделя', wkAvgK: 'В полные дни в среднем: {x} ккал/день', wkAvgS: 'В среднем шагов: {x}', wkW: 'Вес (среднее за 7 дней): {a} → {b} кг', wkDays: '{n} из 7 дней полные', wkNone: 'Мало данных',
      nudgeInstall: 'Добавьте приложение на главный экран — открывается быстрее, данные надёжнее.', nudgeInstallBtn: 'Установить', nudgeIos: 'На iPhone: в Safari «Поделиться» → «На экран «Домой»». Иначе Safari может удалить данные.', nudgeBackup: 'Пора сделать недельную копию — данные хранятся только на этом устройстве.', nudgeBackupBtn: 'Отправить в Telegram',
      qtyMinus: 'Меньше', qtyPlus: 'Больше', aboutBack: 'Назад', errAmt: 'Введите число', stepsT: 'Шаги за сегодня', stepsOf: 'Шаги за {d}',
      units: { g100: 'г', kosa: 'миска', likop: 'тарелка', dona: 'шт.', bolak: 'кусок', stakan: 'стакан', qoshiq: 'ст. ложка', choyq: 'ч. ложка', piyola: 'пиала', porsiya: 'порция', hovuch: 'горсть', tilim: 'ломтик', shisha: 'бутылка' }
    }
  };
  /* ---------- 2-bosqich matnlari: hazillar, "Buni yesam-chi?", retsept, taqvim, rasm, qo'shimchalar ---------- */
  Object.assign(D.uz, {
    jkT: 'Hazillar', perPortion: 'kkal / porsiya', spUl: 'Yuqori chegara (UL)', jkOn: 'Yoqilgan', jkOff: "O'chirilgan", jkCity: 'Shahringiz', jkCityH: 'Masofa taqqoslashlari shu shahardan boshlanadi', jkParty: "Bugun to'y yoki bayram kuni", jkNote: "Qiziqarli gaplar faqat ovqat, qadam va kundalik hayot ustidan — vazn va tana haqida gap yo'q.",
    stRouteF: "Bu {km} km — {route} masofasi ({rk} km) dan ko'proq", stRouteP: "Bu {km} km — {route} yo'lining {pct}%", cityPick: 'Shaharni tanlang',
    yT: 'Buni yesam-chi?', yBtn: 'Buni yesam-chi?', yPh: 'Qaysi ovqat? (somsa, osh, kola…)', yPick: 'Ovqatni tanlang — nima bo\'lishini ko\'ring', yRem: "Bugun me'yordan qoladi: {x} kkal", yAfterOk: 'Yesangiz: {x} kkal qoladi', yAfterOver: "Yesangiz: me'yordan {x} kkal oshadi", yWalk: 'Yoqish uchun: ≈ {min} daqiqa yurish (≈ {steps} qadam)', yNoSave: "Hech narsa saqlanmaydi — faqat oqibatni ko'rsatadi.", yAdd: 'Yeyman — yozib qo\'yish',
    rcT: "O'z taomim (retsept)", rcName: 'Taom nomi', rcNamePh: "masalan, Onamning oshi", rcIng: 'Masalliqlar', rcAdd: "+ Masalliq qo'shish", rcNoIng: "Hali masalliq yo'q", rcPortions: 'Necha porsiya chiqadi?', rcPer: 'Bir porsiya: {k} kkal', rcPerMac: "oqsil {p} · yog' {f} · uglevod {c} · {g} g", rcTotal: 'Hammasi: {g} g · {k} kkal', rcSave: 'Saqlash', rcSaved: "«{n}» saqlandi — endi qidiruvda chiqadi", rcPickIng: 'Masalliqni tanlang', rcGrams: 'Necha gramm?', rcAddIng: "Qo'shish", rcMine: 'Mening taomlarim', rcNoMine: "Hali retsept yo'q", rcDelete: "Taomni o'chirish", rcDeleted: "Taom o'chirildi", rcEdit: 'Retseptni tahrirlash', rcNew: "+ Retsept qo'shish", rcMineH: "Masalliqlarni gramm bilan yozing — bir porsiya kkal va makro o'zi hisoblanadi.", rcQ: 'Masalliq nomi', aRecipe: 'Retsept',
    calT: 'Oylik taqvim', calNear: 'Maqsadga yaqin', calLow: 'Pastroq', calHigh: 'Yuqoriroq', calPart: 'Qisman / davom etmoqda', calNone: "Ma'lumot yo'q", calPre: 'Kuzatuv boshlanmagan', calStart: 'Kuzatuv boshlangan: {d}', stNone: "Ma'lumot yo'q", stLive: 'Kun davom etmoqda', stPart: 'Qisman yozilgan', stNear: 'Maqsadga yaqin', stLow: 'Pastroq', stHigh: 'Yuqoriroq', stPre: 'Kuzatuv boshlanmagan', stFull: "To'liq kun", deBtn: 'Kunni yakunlash', deHint: "Hamma ovqatni yozgan bo'lsangiz, kunni yakunlang — statistika faqat to'liq kunlardan hisoblanadi.", deDone: 'Kun yakunlandi', deLow: "Kun yakunlandi, lekin yozuv maqsadning yarmidan kam — «qisman» bo'lib qoladi", deDoneL: 'Kun yakunlandi ✓', wFirst: "Birinchi o'lchov", wLast: "Oxirgi o'lchov", wAvgN: "Oxirgi 7 kundagi {n} ta o'lchov o'rtachasi: {x} kg", wTrend: "7 kunlik o'rtacha (trend): {x} kg", wTrendD: 'oldingi 7 kunga nisbatan {d} kg', wkNoFull: "To'liq kun yo'q — o'rtacha hisoblanmadi", xStepBase: "Odatiy chegara: {base} qadam. Bugun ortig'i: {n} qadam → +{k} kkal (sof)", calStreak: '{n} kun ketma-ket yozdingiz', calStreak0: "Seriya hali yo'q — bugun yozilsa boshlanadi", calNote: "Faqat to'liq kunlar (yakunlangan yoki o'tib ketgan, yozuv maqsadning ≥50% i) maqsad bilan solishtiriladi. Ranglar baho emas.", calDays: '{n} kun', calOpen: 'Kunni ochish',
    phBtn: 'Rasm', phT: "Rasm bilan qo'shish", phNote: 'Rasm AI xizmatiga yuboriladi va saqlanmaydi.', phBusy: 'Rasm tahlil qilinmoqda…', phErr: "Rasmni aniqlab bo'lmadi. Qo'lda qo'shing.", phLimit: "Bugungi rasm limiti tugadi (kuniga 10 ta). Ertaga urinib ko'ring.", phOffline: "Internet yo'q — rasm tugmasi o'chiq", phApprox: 'taxminiy ±30%', phScale: 'Porsiyani tuzating', phNone: 'Rasmda ovqat topilmadi. Boshqa rasm yoki matn bilan urinib ko\'ring.', phSave: '{n} ta ovqatni saqlash', phHint: 'Natijani ko\'rib, porsiyani tuzatib tasdiqlang.', phPick: 'Kamera yoki galereya', tkNote: "Tasdiqlasangiz, ovqat nomi va kkal (shaxsiy ma'lumotsiz) umumiy bazaga taklif sifatida yuboriladi.",
    spT: 'Vitamin va qo\'shimchalar: kerakmi?', spH: "Ko'pchilikka kerak emas — avval ovqatni ko'ring.", spSearch: 'Qidirish (D vitamini, kreatin…)', spWhat: 'Nima va nima uchun kerak', spFood: 'Ovqatdan qayerdan olinadi', spWho: 'Kim uchun?', spNot: 'Qachon kerak emas?', spCare: "Ehtiyot bo'ling", spLvl: 'Dalil kuchi', spLvl_strong: 'Kuchli', spLvl_moderate: "O'rtacha", spLvl_low: 'Kam', spLvl_not: "Tavsiya etilmaydi", spEvL: 'Dalil: {t} {w}', spW_strong: 'kuchli', spW_moderate: "o'rtacha", spW_low: 'kam', spW_not: 'tavsiya etilmaydi', spTop: "Ro'yxatda — eng yuqori guruh bahosi; kartada hammasi.", spLvlH: "Foydasi haqidagi dalil kuchi (ma'lum guruhlar uchun).", spSrc: 'Manba: {s}', spChecked: 'Tekshirilgan: {d}', spProt: 'Bugun oqsil: {a} / {b} g', spNone: 'Topilmadi', spLoading: 'Yuklanmoqda…', spErr: "Ma'lumot yuklanmadi. Internetni tekshiring.", spRules: ["1. Avval ovqat.", "2. Tahlil bilan aniqlang.", "3. Ko'pi zararli bo'lishi mumkin."], spBack: 'Ro\'yxatga', srcNih: "NIH (AQSh Milliy sog'liqni saqlash institutlari), Qo'shimchalar idorasi", srcHarvard: "Harvard sog'liqni saqlash maktabi (Nutrition Source)"
  });
  Object.assign(D.ru, {
    jkT: 'Шутки', perPortion: 'ккал / порция', spUl: 'Верхняя граница (UL)', jkOn: 'Включены', jkOff: 'Выключены', jkCity: 'Ваш город', jkCityH: 'Сравнения расстояний начинаются с этого города', jkParty: 'Сегодня свадьба или праздник', jkNote: 'Забавные фразы — только про еду, шаги и быт: про вес и тело — никогда.',
    stRouteF: 'Это {km} км — больше, чем путь {route} ({rk} км)', stRouteP: 'Это {km} км — {pct}% пути {route}', cityPick: 'Выберите город',
    yT: 'А если я это съем?', yBtn: 'А если я это съем?', yPh: 'Какая еда? (самса, плов, кола…)', yPick: 'Выберите еду — посмотрите, что будет', yRem: 'Сегодня до нормы остаётся: {x} ккал', yAfterOk: 'Если съесть: останется {x} ккал', yAfterOver: 'Если съесть: выше нормы на {x} ккал', yWalk: 'Чтобы сжечь: ≈ {min} мин ходьбы (≈ {steps} шагов)', yNoSave: 'Ничего не сохраняется — только показывает последствия.', yAdd: 'Съем — записать',
    rcT: 'Моё блюдо (рецепт)', rcName: 'Название блюда', rcNamePh: 'например, мамин плов', rcIng: 'Ингредиенты', rcAdd: '+ Добавить ингредиент', rcNoIng: 'Ингредиентов пока нет', rcPortions: 'Сколько порций получится?', rcPer: 'Одна порция: {k} ккал', rcPerMac: 'белки {p} · жиры {f} · углеводы {c} · {g} г', rcTotal: 'Всего: {g} г · {k} ккал', rcSave: 'Сохранить', rcSaved: '«{n}» сохранено — теперь найдётся в поиске', rcPickIng: 'Выберите ингредиент', rcGrams: 'Сколько граммов?', rcAddIng: 'Добавить', rcMine: 'Мои блюда', rcNoMine: 'Рецептов пока нет', rcDelete: 'Удалить блюдо', rcDeleted: 'Блюдо удалено', rcEdit: 'Изменить рецепт', rcNew: '+ Добавить рецепт', rcMineH: 'Впишите ингредиенты в граммах — ккал и БЖУ порции посчитаются сами.', rcQ: 'Название ингредиента', aRecipe: 'Рецепт',
    calT: 'Календарь месяца', calNear: 'Близко к цели', calLow: 'Ниже цели', calHigh: 'Выше цели', calPart: 'Частично / день идёт', calNone: 'Нет данных', calPre: 'Наблюдение не начато', calStart: 'Наблюдение начато: {d}', stNone: 'Нет данных', stLive: 'День продолжается', stPart: 'Частично записано', stNear: 'Близко к цели', stLow: 'Ниже цели', stHigh: 'Выше цели', stPre: 'Наблюдение не начато', stFull: 'Полный день', deBtn: 'Завершить день', deHint: 'Если записали всю еду — завершите день: статистика считается только по полным дням.', deDone: 'День завершён', deLow: 'День завершён, но записано меньше половины цели — он останется «частичным»', deDoneL: 'День завершён ✓', wFirst: 'Первое измерение', wLast: 'Последнее измерение', wAvgN: 'Среднее за последние 7 дней по {n} измерениям: {x} кг', wTrend: 'Среднее за 7 дней (тренд): {x} кг', wTrendD: 'по сравнению с предыдущими 7 днями {d} кг', wkNoFull: 'Нет полных дней — среднее не посчитано', xStepBase: 'Обычный порог: {base} шагов. Сегодня сверх него: {n} шагов → +{k} ккал (чистыми)', calStreak: 'Записи подряд: {n} дн.', calStreak0: 'Серии пока нет — начнётся, как только появится запись сегодня', calNote: 'Только полные дни (завершённые или прошедшие, записано ≥50% цели) сравниваются с целью. Цвета — не оценка.', calDays: '{n} дн.', calOpen: 'Открыть день',
    phBtn: 'Фото', phT: 'Добавить по фото', phNote: 'Фото отправляется сервису ИИ и не сохраняется.', phBusy: 'Анализирую фото…', phErr: 'Не удалось распознать фото. Добавьте вручную.', phLimit: 'Лимит фото на сегодня исчерпан (10 в день). Попробуйте завтра.', phOffline: 'Нет интернета — кнопка фото отключена', phApprox: 'примерно ±30%', phScale: 'Поправьте порцию', phNone: 'На фото не найдено еды. Попробуйте другое фото или текст.', phSave: 'Сохранить: {n}', phHint: 'Проверьте результат, поправьте порцию и подтвердите.', phPick: 'Камера или галерея', tkNote: 'Если подтвердите, название блюда и ккал (без личных данных) отправятся в общую базу как предложение.',
    spT: 'Витамины и добавки: нужны ли?', spH: 'Большинству не нужны — сначала посмотрите на питание.', spSearch: 'Поиск (витамин D, креатин…)', spWhat: 'Что это и зачем', spFood: 'Где взять из еды', spWho: 'Для кого?', spNot: 'Когда не нужно?', spCare: 'Осторожно', spLvl: 'Сила доказательств', spLvl_strong: 'Сильная', spLvl_moderate: 'Средняя', spLvl_low: 'Слабая', spLvl_not: 'Не рекомендуется', spEvL: 'Доказательства {t}: {w}', spW_strong: 'сильные', spW_moderate: 'средние', spW_low: 'слабые', spW_not: 'не рекомендуется', spTop: 'В списке — оценка самой сильной группы; в карточке все.', spLvlH: 'Насколько доказана польза (для определённых групп).', spSrc: 'Источник: {s}', spChecked: 'Проверено: {d}', spProt: 'Белок сегодня: {a} / {b} г', spNone: 'Не найдено', spLoading: 'Загрузка…', spErr: 'Данные не загрузились. Проверьте интернет.', spRules: ['1. Сначала еда.', '2. Уточните анализом.', '3. Лишнее может навредить.'], spBack: 'К списку', srcNih: 'NIH (Национальные институты здоровья США), Управление по пищевым добавкам', srcHarvard: 'Гарвардская школа общественного здравоохранения (Nutrition Source)'
  });
  var root = document.getElementById('rzApp');
  var st = null, view = 'today', lang = langNow(), enterNext = true, foodDay = null, db = null, dbState = 0, heroPrev = null, seenFood = null, ob = null, reduce = false;
  function langNow() { return document.documentElement.lang === 'ru' ? 'ru' : 'uz'; }
  function isCyr() { return document.documentElement.getAttribute('data-script') === 'cyr'; }
  function T(k, o) { var s = (D[lang] && D[lang][k] != null) ? D[lang][k] : D.uz[k]; if (typeof s === 'string' && o) s = s.replace(/\{(\w+)\}/g, function (m, x) { return o[x] != null ? o[x] : m; }); return s; }
  var kit = RzKit.create({ root: root, K: Dt, t: function (k) { return T(k); }, lang: langNow, isCyr: isCyr });
  var inst = KalkiInstall.create({ app: 'kalkifit', name: 'KalkiFit', nameAcc: "KalkiFit'ni", nameRu: 'KalkiFit', mark: 'KF', color: '#C2461F', kit: kit, lang: langNow, root: root, hasData: function () { return !!(st && st.setup); }, exportText: function () { return S.exportState(st); }, importText: function (t) { return S.importState(t); }, applyState: function (ns) { ns.prefs = ns.prefs || {}; ns.setup = true; st = ns; seenFood = null; heroPrev = null; save(); }, onGate: function () { render(); }, rowIcon: 'sl-ci', setup: function () { return !!(st && st.setup); }, ready: function () { return !!(st && st.setup && Object.keys(st.days).some(function (d) { return st.days[d].food.length; })); }, onChange: function () { if (st && st.setup && !kit.tipsOn() && (view === 'today' || view === 'me') && (!kit.sheetKind() || kit.sheetKind() === 'install')) { if (!kit.sheetKind()) render(); } } });
  reduce = kit.reduce;
  var esc = kit.esc, fmt = kit.fmt, digits = kit.digits, ico = kit.ico, toast = kit.toast, shHead = kit.shHead, flashEl = kit.flashEl, vib = kit.vib, wait = kit.wait;
  function $(s, r) { return (r || root).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || root).querySelectorAll(s)); }
  function nowTs() { return Math.floor(Date.now() / 1000); }
  function todayStr() { return Dt.today(); }
  function prefs() { return st.prefs || (st.prefs = {}); }
  function dec(n, d) { var s = (Math.round(n * Math.pow(10, d || 1)) / Math.pow(10, d || 1)).toString().replace('.', ','); return s; }
  function num(v) { return S.num(v); }
  function KG() { return lang === 'ru' ? 'кг' : 'kg'; }
  function ML() { return lang === 'ru' ? 'мл' : 'ml'; }
  function openSheet(kind, html, o) { kit.openSheet(kind, html, o || { noFocus: true }); }
  function setSheet(html) { var sh = $('#rzSheet'); sh.innerHTML = '<div class="rz-grab" aria-hidden="true"><i></i></div>' + html; kit.dpInit(); }
  function mealName(m) { return T('meal' + (m === 'd' ? 'd' : m)); }
  function nameOf(f) { return lang === 'ru' && f.r ? f.r : f.n; }
  function unitName(u) { return (D[lang].units && D[lang].units[u]) || D.uz.units[u] || u; }
  function qtyStr(q) { return dec(q, 2).replace(/,00$/, ''); }
  function unitLabel(f, u) { var g = S.unitGrams(f, u); return u === 'g100' ? '100 ' + unitName('g100') : '1 ' + unitName(u) + ' · ' + g + ' ' + T('gram'); }
  function portionText(e) { if (e.unit && String(e.unit).indexOf('v:') === 0) return qtyStr(e.qty) + ' ' + (e.vn || T('vn_lagan')) + (e.vf && e.vf !== 'tola' ? ' · ' + T('vf_' + e.vf) : ''); if (e.unit === 'g100') return fmt(e.g) + ' ' + T('gram'); if (e.unit) return qtyStr(e.qty) + ' ' + unitName(e.unit); return e.g ? fmt(e.g) + ' ' + T('gram') : ''; }

  /* ---------- baza (lazy) ---------- */
  var dbWaiters = [];
  var dbMr = {}, dbAlias = {};
  function loadDb(cb) {
    if (dbState === 2) { cb && cb(); return; }
    if (cb) dbWaiters.push(cb);
    if (dbState === 1) return; dbState = 1;
    fetch('/data/ovqatlar.json').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) { db = S.normFoods(j.foods); S.buildIndex(db); dbMr = j.mr || {}; dbAlias = S.aliasMap(db); dbState = 2; var w = dbWaiters; dbWaiters = []; w.forEach(function (f) { f(); }); })
      .catch(function () { dbState = 0; var w = dbWaiters; dbWaiters = []; w.forEach(function (f) { f(true); }); });
  }
  var jokeBoot = false, qTimer = null;                                 // qidiruv: har harfda emas, 120 ms kutib
  function srchOpts(limit) { return { recents: st.recents, favs: st.favs.concat(st.favs.map(function (i) { return dbAlias[i]; }).filter(Boolean)), freq: S.freqMap(st, todayStr(), 30, dbAlias), limit: limit }; }      // tenglikda: oxirgi 30 kunda ko'p yeyilgan + sevimlilar
  function allFoods() { return (db || []).concat(st.customFoods || []); }
  function foodById(id) { var l = allFoods(); for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }

  /* ---------- saqlash ---------- */
  function load() {
    try { var raw = lsGet(LS); if (raw) { var s = S.migrate(JSON.parse(raw)); if (s) { if (!s.prefs) s.prefs = {}; return s; } } } catch (e) {}
    var s2 = S.emptyState(); s2.prefs = {}; return s2;
  }
  var persistAsked = false;
  function save() {
    try { localStorage.setItem(LS, JSON.stringify(st)); } catch (e) {}
    if (typeof bk !== 'undefined' && bk) bk.touch();
    if (!persistAsked) { persistAsked = true; try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {} }
  }
  function commit() { save(); render(); }

  /* ---------- ikonkalar ---------- */
  kit.addIcons({
    today: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2', food: 'M7 3v8 M4 3v5a3 3 0 0 0 6 0V3 M7 11v10 M17 21V3c-2.2 1.5-3.5 4-3.5 7.5 0 2 1.2 3 3.5 3', steps: 'M8 4c-1.7 0-3 1.8-3 4.5S6 13 8 13s3-1.4 3-3.5S9.7 4 8 4z M7.5 16.5h.01 M16 9c-1.7 0-3 1.8-3 4.5S14 18 16 18s3-1.4 3-3.5S17.7 9 16 9z M15.5 21.5h.01',
    me: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c0-4 3.6-7 8-7s8 3 8 7', drop: 'M12 3s6 6.2 6 10.5A6 6 0 0 1 6 13.5C6 9.2 12 3 12 3z', heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z', search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M21 21l-5-5',
    minus: 'M5 12h14', pen: 'M4 20h4L19 9l-4-4L4 16v4z M13 7l4 4', share: 'M12 3v12 M7 8l5-5 5 5 M5 14v6h14v-6', text: 'M5 6h14 M5 12h14 M5 18h9', shield: 'M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z', rep: 'M4 4v6h6 M20 20v-6h-6 M5 15a8 8 0 0 0 14 3 M19 9A8 8 0 0 0 5 6',
    chart: 'M4 20V11 M10 20V4 M16 20v-6 M22 20H2',
    scale: 'M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M9 9a4 4 0 0 1 6 0 M12 12l1.5-2', phone: 'M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z M11 18h2', flame: 'M12 3c1 3 4 4.5 4 9a4 4 0 0 1-8 0c0-2 1-3 2-4 0 2 1 2 1.5 1.5C12 8 11 6 12 3z'
  });
  function catIcon(c, big) { return '<span class="sl-ci' + (big ? ' big' : '') + '">' + ico(c) + '</span>'; }

  /* ---------- qobiq ---------- */
  function shell() {
    var tab = function (v, ic, k) { return '<button type="button" class="rz-tab" data-act="tab" data-v="' + v + '">' + ico(ic) + '<span class="l" data-k="' + k + '"></span><span class="s" data-k="' + k + '"></span></button>'; };
    root.innerHTML =
      '<div class="rz-top"><a class="rz-logo" href="./" data-cyr="skip">Kalki<span>.uz</span></a><div class="rz-title" id="rzTitle"></div>' +
      '<div class="rz-langwrap"><button type="button" class="rz-lang" id="rzLang" data-act="langmenu" aria-label="Til / Язык" data-cyr="skip">' + ico('lang', '', 2) + '<span id="rzLangTxt">UZ</span></button>' +
      '<div class="rz-langmenu" id="rzLangMenu" hidden data-cyr="skip"><button type="button" data-act="lang" data-l="uz">UZ</button><button type="button" data-act="lang" data-l="cyr">ЎЗ</button><button type="button" data-act="lang" data-l="ru">RU</button></div></div></div>' +
      '<main class="rz-main" id="rzMain" tabindex="-1"></main>' +
      '<nav class="rz-nav" aria-label="' + esc(T('appName')) + '">' + tab('today', 'today', 'navToday') + tab('diary', 'cal2', 'navDiary') + '<span class="rz-fabslot"></span>' + tab('results', 'chart', 'navResults') + tab('profile', 'me', 'navProfile') +
      '<button type="button" class="rz-fab" id="rzFab" data-act="fab" aria-label="' + esc(T('navAdd')) + '">' + ico('plus', '', 2.6) + '<span class="rz-fabl" data-k="navAdd"></span></button></nav>' +
      kit.shellHtml() + '<input type="file" id="phIn" accept="image/*" hidden><div class="rz-onb" id="rzOnb" hidden></div>';
  }

  /* ---------- umumiy bo'laklar ---------- */
  function planNow() { return S.plan(st.profile); }
  function entryRow(e, date) {
    var f = e.fid ? foodById(e.fid) : null, name = f ? nameOf(f) : (e.name || '?'), isNew = seenFood && !seenFood[e.id];
    if (f && f.fam && e.vr) { var lb = S.famLabel(f, e.vr, e.sz, lang); if (lb) name += ' · ' + lb; }
    return '<button type="button" class="sl-row' + (isNew ? ' rz-new' : '') + '" data-act="editfood" data-d="' + date + '" data-id="' + e.id + '"><span class="m"><span class="nm">' + esc(name) + '</span><span class="tm">' + esc(portionText(e)) + (e.est && !e.fid ? ' · ' + esc(T('aEst')) : '') + '</span></span><span class="am">' + (e.est && !e.fid ? '≈ ' : '') + fmt(e.kcal) + '<small> ' + T('kcal') + '</small></span></button>';
  }
  function mealsHtml(date) {
    var x = S.dayOf(st, date) || { food: [] }, h = '';
    S.MEALS.forEach(function (m) {
      var list = x.food.filter(function (e) { return e.meal === m; }), sum = S.sumEntries(list).kcal;
      h += '<section class="rz-card sl-meal"><div class="sl-mh"><span class="mi"><b>' + esc(mealName(m)) + '</b><span>' + (list.length ? fmt(sum) + ' ' + T('kcal') : '') + '</span></span><button type="button" class="sl-plus" data-act="addto" data-m="' + m + '" data-d="' + date + '" aria-label="' + esc(T('add') + ': ' + mealName(m)) + '">' + ico('plus', '', 2.4) + '</button>' + (list.length ? '<button type="button" class="sl-sv" data-act="tplsave" data-m="' + m + '" data-d="' + date + '" aria-label="' + esc(T('tplSave1') + ': ' + mealName(m)) + '">' + ico('star') + '<span>' + esc(T('tplSaveS')) + '</span></button>' : '') + '</div>' +
        (list.length ? list.map(function (e) { return entryRow(e, date); }).join('') : '<div class="rz-mut sl-emp">' + esc(T('emptyMeal')) + (S.kechagidekOk(st, date, m) ? '<button type="button" class="rz-btn ghost sm sl-yb" data-act="yday" data-m="' + m + '" data-d="' + date + '">' + ico('undo') + '<span>' + esc(T('tplYest')) + '</span></button>' : '') + '</div>') + '</section>';
    });
    return h;
  }
  function markSeen() { seenFood = {}; Object.keys(st.days).forEach(function (d) { st.days[d].food.forEach(function (e) { seenFood[e.id] = 1; }); }); }
  var C = 2 * Math.PI * 86;
  function ringHtml(id, ratio0) { return '<svg class="sl-ring" viewBox="0 0 200 200" aria-hidden="true"><circle class="tr" cx="100" cy="100" r="86"/><circle class="pg" id="' + id + '" cx="100" cy="100" r="86" transform="rotate(-90 100 100)" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (C * (1 - ratio0)).toFixed(1) + '"/></svg>'; }
  function animRing(id, ratio) { var el = $('#' + id); if (!el) return; requestAnimationFrame(function () { requestAnimationFrame(function () { el.style.strokeDashoffset = (C * (1 - ratio)).toFixed(1); }); }); }
  function glassSvg() { return '<svg viewBox="0 0 24 28" aria-hidden="true"><path class="fill" d="M5.6 9h12.8l-1.3 14.6a1.6 1.6 0 0 1-1.6 1.4H8.5a1.6 1.6 0 0 1-1.6-1.4L5.6 9z"/><path class="ln" d="M4 4h16l-1.8 19.6A2.6 2.6 0 0 1 15.600 26H8.400a2.6 2.6 0 0 1-2.600-2.400L4 4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>'; }

  var bk = KalkiBackup.create({ app: 'kalkifit', fileBase: 'kalkifit', name: 'KalkiFit', kit: kit, lang: langNow, rowIcon: 'sl-ci', hasData: function () { return !!(st && st.setup); }, exportText: function () { return S.exportState(st); }, today: function () { return todayStr(); }, getLast: function () { return st.lastBackup || 0; }, setLast: function (t) { st.lastBackup = t; save(); }, created: function () { return st.created; }, dayCount: function () { return Object.keys(st.days).filter(function (d) { var x = st.days[d]; return x && ((x.food && x.food.length) || x.steps || x.water); }).length; }, pickFile: function () { doImport(); }, sig: function () { return JSON.stringify(st); }, root: root, importText: function (t) { return S.importState(t); }, applyState: function (ns) { ns.prefs = ns.prefs || {}; ns.setup = true; st = ns; seenFood = null; heroPrev = null; save(); }, onChange: function () { if (st && st.setup && !kit.sheetKind() && !kit.tipsOn()) render(); } });
  var VIEW_ALIAS = { food: 'diary', steps: 'results', me: 'profile', ovqat: 'diary', qadam: 'results', men: 'profile', bugun: 'today', kundalik: 'diary', natijalar: 'results', profil: 'profile', today: 'today', diary: 'diary', results: 'results', profile: 'profile' };
  function viewOf(v) { return VIEW_ALIAS[String(v || '').replace(/^#/, '').toLowerCase()] || null; }       // eski nomlar/manzillar (#ovqat, #qadam, #men …) yangi joyga
  function goTab(v0, fn) { var v = viewOf(v0) || v0; if (view !== v) { var tb = $('[data-act=tab][data-v=' + v + ']'); if (tb) tb.click(); } setTimeout(fn, 480); return true; }
  var news = KalkiNews.create({ app: 'kalkifit', banner: true, kit: kit, lang: langNow, root: root, rowIcon: 'sl-ci', isSetup: function () { return !!(st && st.setup); }, onChange: function () { if (st && st.setup && !kit.sheetKind() && !kit.tipsOn()) render(); }, targets: {
    daychip: function (n) { return goTab('today', function () { n.highlight($('#dayChip') || $('#kcalBtn')); }); },
    stepcalc: function (n) { return goTab('today', function () { n.highlight($('#kcalBtn')); }); },
    search: function (n) { return goTab('today', function () { openAdd(); setTimeout(function () { n.highlight($('#fdQ')); }, 450); }); },
    portion: function (n) { return goTab('today', function () { openAdd(); pickFood('olma'); setTimeout(function () { n.highlight($('.sl-qty')); }, 500); }); },
    units: function (n) { return goTab('today', function () { openAdd(); pickFood('osh'); setTimeout(function () { n.highlight($('#fdUnits')); }, 500); }); },
    variants: function (n) { return goTab('today', function () { openAdd(); pickFood('somsa'); fd.pmore = true; pwScreen(); setTimeout(function () { n.highlight($('#pwMore .rz-chips') || $('.sl-morebtn')); }, 500); }); },
    theme: function (n) { return goTab('profile', function () { var b = $('[data-act=theme]'); n.highlight(b && b.parentNode); }); },
    simple: function (n) { return goTab('today', function () { n.highlight($('#mainAdd')); }); },
    source: function (n) { return goTab('today', function () { openAdd(); pickFood('somsa'); setTimeout(function () { n.highlight($('.sl-src')); }, 500); }); },
    vessel: function (n) { return goTab('today', function () { openAdd(); pickFood('osh'); setTimeout(function () { n.highlight($('.sl-vnew')); }, 500); }); },
    templates: function (n) { return goTab('profile', function () { n.highlight($('[data-act=tpls]')); }); },
    dayend: function (n) { return goTab('today', function () { var b = $('#dayEnd') || $('#dayEndDone'); if (b) n.highlight(b); else { kit.toast(n.t('hDayEnd')); n.highlight($('.sl-meal') || $('#kcalBtn')); } }); } } });
  function nudges() {
    var out = [], p = prefs(), now = Date.now(), hid = function (k) { return p['h_' + k] && now - p['h_' + k] < 7 * DAY_MS; };
    if (bk.remindDue() && !hid('backup')) out.push({ k: 'backup', msg: T('nudgeBackup'), btn: T('nudgeBackupBtn'), act: 'bktg' });
    return out;
  }
  function weekCard() {                              // dushanba: o'tgan hafta xulosasi (faqat faktlar)
    var t = todayStr(), p = prefs(); if (S.weekdayIdx(t) !== 0 || p.weekShown === t || p.weekHide === t) return '';
    var w = S.weekSummary(st, Dt.addDays(t, -1)); if (w.empty) return '';
    var rows = [];
    if (w.loggedDays) rows.push((w.fullDays ? T('wkAvgK', { x: fmt(w.avgKcal) }) : T('wkNoFull')) + ' · ' + T('wkDays', { n: w.fullDays }));
    if (w.avgSteps != null) rows.push(T('wkAvgS', { x: fmt(w.avgSteps) }));
    if (w.weightFrom != null && w.weightTo != null) rows.push(T('wkW', { a: dec(w.weightFrom, 1), b: dec(w.weightTo, 1) }));
    return '<section class="rz-card good sl-week"><span class="ic">' + ico('rep') + '</span><div class="m"><b>' + esc(T('wkT')) + '</b>' + rows.map(function (r) { return '<span>' + esc(r) + '</span>'; }).join('') + '</div><button type="button" class="rz-x" data-act="hideweek" aria-label="' + esc(T('close')) + '">' + ico('x') + '</button></section>';
  }

  /* ---------- BUGUN ---------- */
  function dayChip(t) {                              // kun holati (Kundalik'da): Ma'lumot yo'q / Kun davom etmoqda / To'liq · ...
    var i = S.dayStatus(st, t, todayStr()), lab = stLabel(i, t, todayStr()); if (i.complete) lab = T('stFull') + ' · ' + lab;
    return '<p class="sl-dst" id="dayChip" data-state="' + i.state + '"><i class="c ' + i.state + '" aria-hidden="true"></i>' + esc(lab) + '</p>';
  }
  function dayEndHtml(t, x) {                        // «Kunni yakunlash» — ovqatlar ro'yxati oxirida kichik matnli tugma
    if (!x.food.length) return ''; if (x.done) return '<p class="sl-dayend done" id="dayEndDone">' + ico('check', 'sl-inl') + esc(T('deDoneL')) + '</p>';
    return '<p class="sl-dayend"><button type="button" class="sl-txtbtn" data-act="dayend" id="dayEnd" title="' + esc(T('deHint')) + '">' + esc(T('deBtn')) + '</button></p>';
  }
  function jokeFlashHtml() { return jokeFlash && jokeFlash.d === todayStr() ? '<p class="sl-jflash" id="jFlash" role="status">' + ico('chat', 'sl-inl') + esc(jokeFlash.text) + '</p>' : ''; }
  var jokeFlash = null;
  function jokeAfter(kind) {                         // ovqat/suv qo'shilgach bir qatorli qisqa gap — kuniga ko'pi bilan 2 marta, 9 soniyadan so'ng o'chadi (doimiy karta YO'Q)
    if (!G || prefs().jokes === false) return; var p = prefs(), t = todayStr(); if (!p.jfl || p.jfl.d !== t) p.jfl = { d: t, n: 0 }; if (p.jfl.n >= 2) return;
    var l = G.todayLine ? G.todayLine(jokeCtx()) : null; if (!l || !l.text) return; p.jfl.n++; jokeFlash = { d: t, text: l.text }; save(); var mb = view === 'today' && $('#mainAdd'); if (mb && !$('#jFlash')) mb.insertAdjacentHTML('afterend', jokeFlashHtml());
    clearTimeout(jokeAfter.tm); jokeAfter.tm = setTimeout(function () { jokeFlash = null; var el = $('#jFlash'); if (el) el.remove(); }, 9000);
  }
  function renderToday() {
    var t = todayStr(), pr = st.profile, pl = planNow(), x = S.dayOf(st, t) || { food: [], water: 0, steps: 0 }, tot = S.sumEntries(x.food), h0 = num(pr.height), w0 = S.currentWeight(st);
    var bal = S.dayBalance(pl.target, tot.kcal, x.steps, h0, w0, pr.act), limit = pl.target + bal.credit, ratio = Math.min(1, tot.kcal / Math.max(1, limit)), over = bal.remaining < 0, info = S.dayStatus(st, t, t);
    var glasses = pl.water.glasses, wmax = glasses * S.GLASS_ML, note = info.complete ? T('stFull') + ' · ' + stLabel(info, t, t) : T('cNote');
    var h = (inst.isTop() ? inst.cardHtml() : '');
    h += '<h2 class="rz-h sl-hd" id="todayHd">' + esc(T('todayDate', { d: kit.dLabel(t) })) + '</h2>';
    h += '<section class="sl-cal' + (over ? ' ovr' : '') + '"><button type="button" class="sl-nums" id="kcalBtn" data-act="xkcal" aria-label="' + esc(T('hHow')) + '"><span class="n"><small>' + esc(T('cEaten')) + '</small><b id="kNum">' + fmt(heroPrev ? heroPrev.eaten : tot.kcal) + '</b></span><span class="n"><small>' + esc(T('cGoal')) + '</small><b id="kGoal">' + fmt(limit) + '</b></span>' +
      (over ? '' : '<span class="n"><small>' + esc(T('cLeft')) + '</small><b id="kLeft">' + fmt(bal.remaining) + '</b></span>') + '</button><div class="rz-bar thin sl-prog" aria-hidden="true"><i style="transform:scaleX(' + ratio.toFixed(3) + ')"></i></div>' +
      (over ? '<p class="sl-over" id="kOver">' + esc(T('cOver', { x: fmt(-bal.remaining) })) + '</p>' : '') + '<p class="sl-note" id="dayChip" data-state="' + info.state + '">' + esc(note) + '</p></section>';
    h += '<button type="button" class="rz-btn primary full sl-main" id="mainAdd" data-act="add">' + esc(T('mainAdd')) + '</button>' + (!tot.kcal && !x.food.length ? '<p class="rz-mut sm sl-first">' + esc(T('hEmpty')) + '</p>' : '') + jokeFlashHtml();
    h += mealsHtml(t) + dayEndHtml(t, x);
    h += '<div class="sl-duo"><section class="rz-card sl-mini" id="wCard"><button type="button" class="sl-minib" data-act="wopen" aria-label="' + esc(T('wT')) + '"><span class="l">' + ico('drop') + esc(T('wT')) + '</span><b id="wTxt">' + esc(T('wCard', { a: fmt(x.water * S.GLASS_ML), b: fmt(wmax) })) + '</b></button><button type="button" class="rz-btn sm" data-act="wadd" aria-label="+250 ' + ML() + '">' + esc(T('wAdd')) + '</button></section>' +
      '<section class="rz-card sl-mini sl-stepcard"><button type="button" class="sl-minib" data-act="xsteps"><span class="l">' + ico('steps') + esc(T('sT')) + '</span><b id="sNum">' + (x.steps ? esc(T('sCard', { n: fmt(x.steps) })) : esc(T('sNoneC'))) + '</b></button><button type="button" class="rz-btn sm" data-act="addsteps">' + esc(T('sEnter')) + '</button></section></div>';
    h += '<button type="button" class="rz-card sl-macrow" data-act="xmacro" aria-label="' + esc(T('macroRow')) + '">' + [['mP', 'p', pl.macros.p], ['mF', 'f', pl.macros.f], ['mC', 'c', pl.macros.c]].map(function (m) { return '<span><small>' + esc(T(m[0])) + '</small><b>' + Math.round(tot[m[1]]) + '</b><i>/ ' + m[2] + '</i></span>'; }).join('') + '</button>';
    nudges().forEach(function (n) { h += '<div class="rz-card nudge" data-nudge="' + n.k + '"><div class="t">' + esc(n.msg) + '</div><div class="b">' + (n.btn ? '<button type="button" class="rz-btn sm" data-act="' + n.act + '">' + esc(n.btn) + '</button>' : '') + '<button type="button" class="rz-btn sm ghost" data-act="hide" data-k="' + n.k + '">' + esc(T('later')) + '</button></div></div>'; });
    if (!inst.isTop()) h += inst.cardHtml();
    h += '<p class="rz-priv">' + esc(T('disc')) + '</p>';
    $('#rzMain').innerHTML = h; markSeen();
    var num0 = $('#kNum'); if (heroPrev && heroPrev.eaten !== tot.kcal) kit.setNum(num0, heroPrev.eaten, tot.kcal); heroPrev = { eaten: tot.kcal };
    if (G && !jokeBoot) { jokeBoot = true; loadMasofa(); loadDb(function () { if (view === 'today' && !kit.sheetKind()) render(); }); }
  }

  /* ---------- KUNDALIK ---------- */
  function renderDiary() {
    var t = todayStr(), d = foodDay || t, x = S.dayOf(st, d), tot = S.sumEntries(x ? x.food : []), pl = planNow();
    var lab = d === t ? T('today') : (d === Dt.addDays(t, -1) ? T('yesterday') : kit.dLabel(d));
    var h = '<h2 class="rz-h">' + esc(T('diaryT')) + '</h2><section class="rz-card"><div class="rz-monthnav"><button type="button" data-act="dprev" aria-label="‹">' + ico('back') + '</button><b>' + esc(lab) + '</b><button type="button" data-act="dnext" aria-label="›"' + (d >= t ? ' disabled' : '') + '>' + ico('chev') + '</button></div><div class="sl-daysum"><b>' + fmt(tot.kcal) + '</b><small> / ' + fmt(pl.target) + ' ' + T('kcal') + '</small></div>' + dayChip(d) + '</section>';
    h += mealsHtml(d) + calHtml();
    $('#rzMain').innerHTML = h; markSeen();
  }

  /* ---------- NATIJALAR ---------- */
  function weekStatsHtml() {                         // oxirgi 7 kun (kechagacha) — faqat to'liq kunlar bo'yicha
    var t = todayStr(), w = S.weekSummary(st, Dt.addDays(t, -1)); if (w.empty) return '';
    var rows = [];
    if (w.loggedDays) rows.push((w.fullDays ? T('wkAvgK', { x: fmt(w.avgKcal) }) : T('wkNoFull')) + ' · ' + T('wkDays', { n: w.fullDays }));
    if (w.avgSteps != null) rows.push(T('wkAvgS', { x: fmt(w.avgSteps) }));
    if (w.weightFrom != null && w.weightTo != null) rows.push(T('wkW', { a: dec(w.weightFrom, 1), b: dec(w.weightTo, 1) }));
    return '<section class="rz-card sl-week"><div class="rz-st">' + esc(T('resWeekT')) + '</div>' + rows.map(function (r) { return '<p class="rz-p">' + esc(r) + '</p>'; }).join('') + '</section>';
  }
  function renderResults() {
    var pr = st.profile, cur = S.currentWeight(st), wi = S.weightInfo(st, todayStr()), gp = S.goalProgress(st), first = st.weights.length ? st.weights[0].kg : cur; loadMasofa();
    var h = '<h2 class="rz-h">' + esc(T('resT')) + '</h2>';
    h += '<section class="rz-card sl-weight"><div class="sl-wh"><b>' + ico('scale') + esc(T('meW')) + '</b><button type="button" class="sl-wv" data-act="xweight">?</button></div>' + (st.weights.length ? '<div class="sl-wbig"><b>' + dec(cur, 1) + '</b><small> ' + KG() + '</small></div><div class="rz-mut" id="wLbl">' + esc(weightLabel(wi)) + '</div>' : '<div class="rz-mut">' + esc(T('meNoW')) + '</div>') + weightChart() +
      (gp ? '<div class="sl-gp"><div class="rz-bar thin" aria-hidden="true"><i style="transform:scaleX(' + gp.share + ')"></i></div><span>' + esc(gp.left > 0 ? T('meProg', { x: dec(gp.left, 1) }) : '✓') + '</span></div>' : '') +
      (st.weights.length > 1 ? '<div class="rz-mut sm">' + esc(T('meDelta', { x: (cur - first > 0 ? '+' : '') + dec(cur - first, 1) })) + '</div>' : '') + '<button type="button" class="rz-btn primary full" data-act="addweight">' + esc(T('meAddW')) + '</button></section>';
    h += weekStatsHtml() + stepsHtml() + '<section class="rz-card"><button type="button" class="rz-row" data-act="share"><span class="sl-ci">' + ico('share') + '</span><span class="m"><b>' + esc(T('meShare')) + '</b><span>' + esc(T('shH')) + '</span></span>' + ico('chev', 'r') + '</button></section>';
    $('#rzMain').innerHTML = h; stepsAnim();
    var p = $('.sl-wchart .avg'); if (p && !reduce) { p.style.strokeDashoffset = '1'; requestAnimationFrame(function () { requestAnimationFrame(function () { p.style.strokeDashoffset = '0'; }); }); }
  }
  function stepsHtml() {
    var t = todayStr(), x = S.dayOf(st, t) || { steps: 0 }, stp = S.stepsStats(st, x.steps), ser = S.stepsSeries(st, t, 7), tot = S.stepsTotal(st, ser), mx = Math.max(st.stepGoal, Math.max.apply(null, ser.map(function (s) { return s.steps; })), 1), mon = S.monthSteps(st, Dt.monthOf(t));
    loadMasofa(); var weekJoke = routeFact(tot.km), monJoke = routeFact(mon.km);
    var h = '<section class="rz-card sl-stepbig"><button type="button" class="sl-sn" data-act="xsteps"><span class="l">' + ico('steps') + esc(T('stepsT')) + '</span><b id="sNum">' + fmt(x.steps) + '</b><span class="u">' + (x.steps ? esc(stp.km.toString().replace('.', ',') + ' ' + T('km') + ' · ' + fmt(stp.kcal) + ' ' + T('kcal')) : esc(T('sNone'))) + '</span></button><div class="rz-bar thin" aria-hidden="true"><i style="transform:scaleX(' + Math.min(1, x.steps / st.stepGoal) + ')"></i></div><div class="rz-mut sm">' + esc(T('stGoal', { x: fmt(st.stepGoal) })) + '</div><button type="button" class="rz-btn full" data-act="addsteps">' + esc(T('sAdd')) + '</button><button type="button" class="rz-link" data-act="stephelp">' + esc(T('stWhere')) + '</button></section>';
    h += '<section class="rz-card"><div class="rz-st">' + esc(T('stWeek')) + '</div><div class="sl-chart" style="--g:' + (st.stepGoal / mx).toFixed(3) + '" role="img" aria-label="' + esc(T('stWeek')) + '">' + ser.map(function (s) { var wd = S.weekdayIdx(s.d), nm = D[lang] && (lang === 'ru' ? ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] : ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'])[wd]; return '<button type="button" class="b' + (s.d === t ? ' td' : '') + '" data-act="editsteps" data-d="' + s.d + '" aria-label="' + esc(kit.dLabel(s.d) + ': ' + fmt(s.steps)) + '"><span class="v">' + (s.steps ? fmt(s.steps) : '') + '</span><span class="col"><i style="transform:scaleY(' + (s.steps / mx) + ')"></i></span><span class="d">' + esc(nm) + '</span></button>'; }).join('') + '</div>' +
      '<div class="sl-wtot"><b>' + esc(tot.km.toString().replace('.', ',') + ' ' + T('km')) + '</b><span>' + fmt(tot.steps) + ' · ' + fmt(tot.kcal) + ' ' + T('kcal') + '</span></div>' +
      (tot.steps ? weekJoke : '<p class="rz-mut">' + esc(T('stEmpty')) + '</p>') + '</section>';
    h += '<section class="rz-card"><div class="rz-st">' + esc(T('stMonth')) + '</div><div class="sl-wtot"><b>' + fmt(mon.steps) + '</b><span>' + esc(mon.km.toString().replace('.', ',') + ' ' + T('km') + ' · ' + fmt(mon.kcal) + ' ' + T('kcal')) + '</span></div>' + monJoke + '<button type="button" class="rz-row" data-act="stepgoal"><span class="m"><b>' + esc(T('stGoalSet')) + '</b></span><span class="v">' + fmt(st.stepGoal) + '</span></button><p class="rz-priv">' + esc(T('stNoRank')) + '</p></section>';
    return h;
  }
  function stepsAnim() { $$('.sl-chart .col i').forEach(function (e, i) { var f = e.style.transform; e.style.transform = 'scaleY(0)'; setTimeout(function () { e.style.transform = f; }, reduce ? 0 : 60 + i * 50); }); }


  /* ---------- MEN ---------- */
  function weightChart() {
    var ser = S.weightSeries(st.weights).slice(-30); if (ser.length < 2) return ''; var trend = S.weightInfo(st, todayStr()).kind === 'trend';
    var W = 320, H = 130, pd = 14, kg = ser.map(function (s) { return s.kg; }).concat(ser.map(function (s) { return s.avg; })), mn = Math.min.apply(null, kg) - 0.5, mxv = Math.max.apply(null, kg) + 0.5;
    var X = function (i) { return pd + (W - 2 * pd) * i / (ser.length - 1); }, Y = function (v) { return H - pd - (H - 2 * pd) * (v - mn) / (mxv - mn); };
    var line = ser.map(function (s, i) { return (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(s.avg).toFixed(1); }).join(' ');
    return '<svg class="sl-wchart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(T('meW')) + '">' + ser.map(function (s, i) { return '<circle class="dot" cx="' + X(i).toFixed(1) + '" cy="' + Y(s.kg).toFixed(1) + '" r="3.2"/>'; }).join('') + (trend ? '<path class="avg" d="' + line + '" pathLength="1"/>' : '') + '</svg>';
  }
  function weightLabel(wi) {                         // 1 ta o'lchov / 2–6 ta o'rtacha / ≥7 kunlik tarix — trend
    if (wi.kind === 'first') return T('wFirst'); if (wi.kind === 'last') return T('wLast'); if (wi.kind === 'avg') return T('wAvgN', { n: wi.n, x: dec(wi.kg, 1) });
    if (wi.kind === 'trend') return T('wTrend', { x: dec(wi.kg, 1) }) + (wi.delta != null ? ' · ' + T('wTrendD', { d: (wi.delta > 0 ? '+' : '') + dec(wi.delta, 1) }) : ''); return '';
  }
  function themeNow() { var t = (prefs().theme || 'auto'); return t === 'light' || t === 'dark' ? t : 'auto'; }
  function applyTheme() { var t = themeNow(), h = document.documentElement; if (t === 'auto') h.removeAttribute('data-theme'); else h.setAttribute('data-theme', t); try { if (t === 'auto') localStorage.removeItem('kalki_theme'); else localStorage.setItem('kalki_theme', t); } catch (e) {} }
  function renderProfile() {
    var pr = st.profile, pl = planNow(), big = document.documentElement.classList.contains('fs-big'), curL = isCyr() ? 'cyr' : lang, th = themeNow();
    var row = function (act, ic, t1, t2) { return '<button type="button" class="rz-row" data-act="' + act + '">' + catIcon(ic) + '<span class="m"><b>' + esc(t1) + '</b>' + (t2 ? '<span>' + esc(t2) + '</span>' : '') + '</span>' + ico('chev', 'r') + '</button>'; };
    var seg = function (act, key, opts, cur) { return '<div class="rz-seg">' + opts.map(function (o) { return '<button type="button" data-act="' + act + '" data-' + key + '="' + o[0] + '"' + (cur === o[0] ? ' class="on"' : '') + '>' + esc(o[1]) + '</button>'; }).join('') + '</div>'; };
    var h = '<h2 class="rz-h">' + esc(T('profT')) + '</h2>';
    h += '<section class="rz-card sl-prof"><div class="sl-pg"><div><small>' + esc(T('pfSex')) + '</small><b>' + esc(T(pr.sex === 'f' ? 'female' : 'male')) + '</b></div><div><small>' + esc(T('pfAge')) + '</small><b>' + pr.age + '</b></div><div><small>' + esc(T('pfH')) + '</small><b>' + pr.height + '</b></div><div><small>' + esc(T('pfW')) + '</small><b>' + dec(num(pr.weight), 1) + '</b></div></div>' +
      '<div class="sl-pt"><span>' + esc(T('rT')) + '</span><b>' + fmt(pl.target) + ' ' + T('kcal') + '</b></div><button type="button" class="rz-btn ghost full" data-act="editprof">' + ico('pen') + ' ' + esc(T('meEdit')) + '</button></section>';
    h += '<section class="rz-card">' + row('vessels', 'bowl', T('vmT'), T('vmH')) + row('tpls', 'bm', T('tplMine'), T('tplMineH')) + row('rcmine', 'book', T('rcMine'), '') + row('supp', 'pill', T('spT'), T('spH')) + '</section>';
    h += '<section class="rz-card"><div class="rz-st">' + esc(T('profBackup')) + '</div>' + (inst.row() ? inst.row().html : '') + bk.tgRow() + bk.cloudHtml() + row('export', 'text', T('sExp'), '') + row('import', 'boshqa', T('sImp'), '') + row('wipe', 'x', T('sDel'), '') + bk.lastHtml() + '</section>';
    h += '<section class="rz-card"><div class="rz-st">' + esc(T('sLang')) + '</div><div class="rz-seg" data-cyr="skip"><button type="button" data-act="lang" data-l="uz"' + (curL === 'uz' ? ' class="on"' : '') + '>UZ</button><button type="button" data-act="lang" data-l="cyr"' + (curL === 'cyr' ? ' class="on"' : '') + '>ЎЗ</button><button type="button" data-act="lang" data-l="ru"' + (curL === 'ru' ? ' class="on"' : '') + '>RU</button></div>' +
      '<div class="rz-st" style="margin-top:14px">' + esc(T('themeT')) + '</div>' + seg('theme', 't', [['auto', T('thAuto')], ['light', T('thLight')], ['dark', T('thDark')]], th) +
      '<div class="rz-st" style="margin-top:14px">' + esc(T('sFont')) + '</div><div class="rz-seg"><button type="button" data-act="font" data-f="n"' + (!big ? ' class="on"' : '') + '>' + esc(T('fN')) + '</button><button type="button" data-act="font" data-f="b"' + (big ? ' class="on"' : '') + '>' + esc(T('fB')) + '</button></div></section>';
    h += jokesCardHtml();
    h += '<section class="rz-card">' + news.row() + row('tips', 'help', T('sTips'), '') + '<span class="rz-aboutrow">' + row('about', 'info', T('sAbout'), '') + '</span></section><p class="rz-priv">' + esc(T('priv')) + ' ' + esc(T('med')) + '</p>';
    $('#rzMain').innerHTML = h;
  }

  function render() {
    lang = langNow();
    $$('[data-k]').forEach(function (e) { e.textContent = T(e.getAttribute('data-k')); });
    var lt0 = isCyr() ? 'ЎЗ' : lang.toUpperCase(), lb0 = $('#rzLang'); if (lb0) lb0.setAttribute('aria-label', lt0 + ' · Til / Язык');
    var ab = document.getElementById('rzAboutBack'); if (ab) ab.textContent = T('aboutBack');
    var lockUi = function (on) { ['#rzMain', '.rz-nav'].forEach(function (q) { var e = $(q); if (e) { e.inert = on; if (on) e.setAttribute('aria-hidden', 'true'); else e.removeAttribute('aria-hidden'); } }); };
    if (!st.setup) { lockUi(true); showOnb(); return; }
    lockUi(false);
    var onb = $('#rzOnb'); if (onb && !onb.classList.contains('out')) onb.hidden = true;
    $$('.rz-tab').forEach(function (b) { var on = b.getAttribute('data-v') === view; b.classList.toggle('on', on); b.setAttribute('aria-current', on ? 'page' : 'false'); });
    var title = { today: T('appName'), diary: T('diaryT'), results: T('resT'), profile: T('profT') }[view]; $('#rzTitle').textContent = title;
    var lt = $('#rzLangTxt'); if (lt) lt.textContent = isCyr() ? 'ЎЗ' : lang.toUpperCase();
    $('#rzFab').setAttribute('aria-label', T('navAdd'));
    var main = $('#rzMain'), sc = main.scrollTop;
    ({ today: renderToday, diary: renderDiary, results: renderResults, profile: renderProfile })[view]();
    main.classList.toggle('enter', enterNext); enterNext = false; main.scrollTop = sc;
    if (view === 'today' && !prefs().tipsDone && !kit.tipsOn() && !kit.sheetKind()) setTimeout(function () { if (!kit.tipsOn() && st.setup && view === 'today' && !prefs().tipsDone && !kit.sheetKind() && !$('#rzOnb').classList.contains('out')) tipsStart(); }, 500);
  }


  /* ================= 2-bosqich: hazillar, "Buni yesam-chi?", retsept, taqvim, rasm, taklif, qo'shimchalar ================= */
  kit.addIcons({
    bowl: 'M3 11h18a8 8 0 0 1-8 8h-2a8 8 0 0 1-8-8z M8 7c0-1 1-1 1-2 M12 7c0-1 1-1 1-2 M16 7c0-1 1-1 1-2',
    star: 'M12 3.500l2.700 5.500 6 .900-4.400 4.200 1 6-5.300-2.800-5.300 2.800 1-6L3.300 9.900l6-.900z',
    dots: 'M5.500 12h.010 M12 12h.010 M18.500 12h.010', undo: 'M4 12a8 8 0 1 0 2.500-5.800 M4 4v5h5', bm: 'M6 4h12v17l-6-4-6 4z',
    chat: 'M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-5 4v-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z', cam: 'M4 8h3l2-3h6l2 3h3v11H4z M12 16.500a3.500 3.500 0 1 0 0-7 3.500 3.500 0 0 0 0 7z', pill: 'M10.500 3.500l10 10a4.200 4.200 0 0 1-6 6l-10-10a4.200 4.200 0 0 1 6-6z M8 9l6 6',
    sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z M12 2v2 M12 20v2 M2 12h2 M20 12h2 M4.900 4.900l1.400 1.400 M17.700 17.700l1.400 1.400 M4.900 19.100l1.400-1.400 M17.700 6.300l1.400-1.400', leaf: 'M5 19c0-8 5-13 14-14 0 9-5 14-13 14 M5 19c2-4 5-7 9-9', bolt: 'M13 3L5 13h6l-1 8 8-10h-6z',
    bone: 'M7 8.500a2.500 2.500 0 1 1 3.500-3L16 11l.5.500a2.500 2.500 0 1 1 3 3.500L13 20a2.500 2.500 0 1 1-3-3.500z', muscle: 'M5 15c0-4 3-7 7-7 2 0 3 1 3 3 0 1.500-1 2-2 2.500 3 0 5 1.500 5 4v1H8c-2 0-3-1.500-3-3.500z', book: 'M4 5h7a3 3 0 0 1 3 3v11a3 3 0 0 0-3-3H4z M20 5h-3a3 3 0 0 0-3 3v11a3 3 0 0 1 3-3h3z',
    cal2: 'M5 5h14v15H5z M5 10h14 M9 3v4 M15 3v4', trash: 'M5 7h14 M9 7V4h6v3 M7 7l1 13h8l1-13', warn: 'M12 3l10 18H2z M12 10v5 M12 18h.01'
  });
  var G = window.KalkiFitGaplar, masofa = null, masofaState = 0, supp = null, suppState = 0;
  function loadJson(url, ok, fail) { fetch(url).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(ok).catch(fail || function () {}); }
  function loadMasofa() { if (masofaState) return; masofaState = 1; loadJson('/data/masofalar.json', function (j) { masofa = j; masofaState = 2; if (view === 'today' || view === 'steps' || view === 'me') render(); }, function () { masofaState = 0; }); }
  function loadSupp(cb) { if (suppState === 2) { cb(); return; } if (suppState === 1) return; suppState = 1; loadJson('/data/qoshimchalar.json', function (j) { j.items.forEach(function (it) { if (it.ev && it.ev.length) it.level = topLevel(it.ev); }); supp = j; suppState = 2; cb(); }, function () { suppState = 0; cb(true); }); }
  function jokeCtx() { return { S: S, st: st, today: todayStr(), lang: lang, hour: new Date().getHours(), masofa: masofa, city: prefs().city || 'toshkent', foods: db, jokesOn: prefs().jokes !== false }; }
  function jokeBox(l, cls) { return l ? '<div class="rz-card sl-joke ' + (cls || '') + '" role="note">' + ico('chat') + '<p>' + esc(l.text) + '</p></div>' : ''; }
  function routeFact(km) {                          // hazil o'chiq bo'lganda ham haqiqiy taqqoslash (masofalar.json)
    if (!G || !masofa || !(km >= 1)) return ''; var rt = G.routeFor(masofa, prefs().city || 'toshkent', km);
    return '<p class="rz-p sl-fact">' + ico('flame', 'sl-inl') + esc(T(rt.type === 'full' ? 'stRouteF' : 'stRouteP', { km: G.fmtKm(km), route: G.routePhrase(rt, lang), rk: rt.km, pct: rt.pct })) + '</p>';
  }
  function stepsKmFor(n) { var t = todayStr(), ser = S.stepsSeries(st, t, n); return S.stepsTotal(st, ser).km; }

  /* ---------- "Buni yesam-chi?" (hech narsa saqlanmaydi) ---------- */
  var yd = null;
  function openYesam() { yd = { q: '', food: null, unit: null, qty: 1 }; openSheet('yesam', ySearchHtml()); loadDb(function () { if (yd && !yd.food) yRefresh(); }); }
  function ySearchHtml() { return shHead(T('yT')) + '<div class="sl-search">' + ico('search') + '<input id="ydQ" type="text" inputmode="search" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="' + esc(T('yPh')) + '" value="' + esc(yd.q) + '" aria-label="' + esc(T('yT')) + '"></div><p class="rz-p sm">' + esc(T('yPick')) + '</p><div class="sl-res" id="ydRes">' + yResults() + '</div>'; }
  function yRow(f) { return '<button type="button" class="sl-rr" data-act="ypick" data-id="' + esc(f.id) + '"><span class="m"><span class="nm">' + esc(nameOf(f)) + '</span><span class="tm">' + esc(T('per100', { k: f.k })) + '</span></span>' + ico('chev', 'r') + '</button>'; }
  function yResults() {
    if (dbState !== 2) return '<div class="rz-mut">' + esc(T('aLoading')) + '</div>'; var q = yd.q.trim(), foods = allFoods(), list;
    if (q) list = S.search(foods, q, srchOpts(30));
    else { var rec = st.recents.map(foodById).filter(Boolean), pop = foods.filter(function (f) { return f.t === 'o' && !f.custom; }).slice(0, 10); list = rec.slice(0, 5).concat(pop.filter(function (f) { return rec.indexOf(f) < 0; })).slice(0, 12); }
    return list.length ? list.map(yRow).join('') : '<div class="rz-empty"><b>' + esc(T('aNone')) + '</b></div>';
  }
  function yRefresh() { var r = $('#ydRes'); if (r) r.innerHTML = yResults(); }
  function yGrams() { return yd.unit === 'g100' ? yd.qty : S.unitGrams(yd.food, yd.unit) * yd.qty; }
  function yPick(id) { var f = foodById(id); if (!f) return; yd.food = f; yd.unit = f.u[0][0]; yd.qty = yd.unit === 'g100' ? 100 : 1; setSheet(yHtml()); }
  function yHtml() {
    var f = yd.food;
    return '<div class="rz-sh-h sl-ph"><button type="button" class="rz-x" data-act="yback" aria-label="' + esc(T('back')) + '">' + ico('back') + '</button><b>' + esc(nameOf(f)) + '</b><span></span></div><div class="rz-chips">' + f.u.map(function (u) { return '<button type="button" class="rz-chip' + (yd.unit === u[0] ? ' on' : '') + '" data-act="yunit" data-u="' + u[0] + '" aria-pressed="' + (yd.unit === u[0]) + '">' + esc(unitLabel(f, u[0])) + '</button>'; }).join('') + '</div>' +
      '<div class="sl-qty"><button type="button" data-act="yqty" data-s="-1" aria-label="' + esc(T('qtyMinus')) + '">' + ico('minus', '', 2.4) + '</button><b id="ydQty">' + qtyStr(yd.qty) + (yd.unit === 'g100' ? ' ' + T('gram') : '') + '</b><button type="button" data-act="yqty" data-s="1" aria-label="' + esc(T('qtyPlus')) + '">' + ico('plus', '', 2.4) + '</button></div><div id="ydOut" aria-live="polite">' + yOutHtml() + '</div><p class="rz-p sm">' + esc(T('yNoSave')) + '</p>';
  }
  function yOutHtml() {
    var f = yd.food, g = yGrams(), pt = S.portion(f, g), t = todayStr(), pl = planNow(), x = S.dayOf(st, t) || { food: [], steps: 0 }, tot = S.sumEntries(x.food), bal = S.dayBalance(pl.target, tot.kcal, x.steps, num(st.profile.height), S.currentWeight(st), st.profile.act);
    var after = bal.remaining - pt.kcal, min = S.minutesToBurn(pt.kcal, S.currentWeight(st)), steps = Math.round(min / 60 * 5000 / S.strideM(num(st.profile.height)));
    var item = nameOf(f) + ' (' + (yd.unit === 'g100' ? fmt(g) + ' ' + T('gram') : qtyStr(yd.qty) + ' ' + unitName(yd.unit)) + ')';
    var joke = G && prefs().jokes !== false ? G.pickLine(jokeCtx(), after >= 0 ? 'yesam_ok' : 'yesam_over', { item: item, kcal: pt.kcal, left: after, over: -after, min: min }, 'y|' + f.id + '|' + (after >= 0 ? 'ok' : 'over')) : null; if (joke) save();
    return '<div class="sl-kc"><b>' + fmt(pt.kcal) + '</b><small> ' + T('kcal') + '</small></div>' +
      '<div class="rz-xrows sl-yrows"><div class="rz-xr"><span class="lb">' + esc(T('yRem', { x: fmt(bal.remaining) })) + '</span></div><div class="rz-xr sum big' + (after < 0 ? ' warnr' : '') + '"><span class="lb">' + esc(after >= 0 ? T('yAfterOk', { x: fmt(after) }) : T('yAfterOver', { x: fmt(-after) })) + '</span></div><div class="rz-xr"><span class="lb">' + ico('steps', 'sl-inl') + esc(T('yWalk', { min: min, steps: fmt(steps) })) + '</span></div></div>' + (joke ? '<p class="rz-p sl-yj">' + esc(joke.text) + '</p>' : '');
  }
  function yUpdate() { var o = $('#ydOut'); if (o) o.innerHTML = yOutHtml(); var q = $('#ydQty'); if (q) q.textContent = qtyStr(yd.qty) + (yd.unit === 'g100' ? ' ' + T('gram') : ''); }

  /* ---------- retsept hisoblagich ---------- */
  var rc = null;
  function openRecipe(id) {
    var f = id ? foodById(id) : null;
    rc = { id: f ? f.id : null, name: f ? f.n : '', ings: f && f.recipe ? f.recipe.ings.map(function (i) { return Object.assign({}, i); }) : [], portions: f && f.recipe ? f.recipe.portions : 1, mode: 'main', q: '', pick: null, g: 100 };
    openSheet('recipe', rcHtml()); loadDb();
  }
  function rcIngName(i) { var f = i.id ? foodById(i.id) : null; return f ? nameOf(f) : i.name; }
  function rcOutHtml() {
    var r = S.recipe(rc.ings, rc.portions);
    return rc.ings.length ? '<div class="sl-kc"><b>' + fmt(r.perPortion.kcal) + '</b><small> ' + T('perPortion') + '</small></div><div class="sl-mc">' + esc(T('rcPerMac', { p: dec(r.perPortion.p, 0), f: dec(r.perPortion.f, 0), c: dec(r.perPortion.c, 0), g: fmt(r.perPortion.g) })) + '</div><div class="rz-mut sm" style="text-align:center">' + esc(T('rcTotal', { g: fmt(r.total.g), k: fmt(r.total.kcal) })) + '</div>' : '';
  }
  function rcHtml() {
    var h = shHead(rc.id ? T('rcEdit') : T('rcT')) + '<p class="rz-p sm">' + esc(T('rcMineH')) + '</p><label class="rz-f" for="rcName"><span>' + esc(T('rcName')) + '</span><input id="rcName" type="text" maxlength="60" placeholder="' + esc(T('rcNamePh')) + '" value="' + esc(rc.name) + '"></label>' +
      '<div class="rz-fl">' + esc(T('rcIng')) + '</div>' + (rc.ings.length ? rc.ings.map(function (i, k) { var kc = Math.round(i.k * i.g / 100); return '<div class="sl-ti"><span class="m"><span class="nm">' + esc(rcIngName(i)) + '</span><span class="tm">' + fmt(i.g) + ' ' + T('gram') + '</span></span><b>' + fmt(kc) + '<small> ' + T('kcal') + '</small></b><button type="button" class="rz-x" data-act="rcdel" data-i="' + k + '" aria-label="' + esc(T('del')) + '">' + ico('x') + '</button></div>'; }).join('') : '<div class="rz-mut">' + esc(T('rcNoIng')) + '</div>') +
      '<button type="button" class="rz-btn ghost full" data-act="rcadd">' + esc(T('rcAdd')) + '</button>' +
      '<div class="rz-fl" style="margin-top:12px">' + esc(T('rcPortions')) + '</div><div class="sl-qty"><button type="button" data-act="rcport" data-s="-1" aria-label="' + esc(T('qtyMinus')) + '">' + ico('minus', '', 2.4) + '</button><b id="rcPN">' + rc.portions + '</b><button type="button" data-act="rcport" data-s="1" aria-label="' + esc(T('qtyPlus')) + '">' + ico('plus', '', 2.4) + '</button></div>' +
      '<div id="rcOut" aria-live="polite">' + rcOutHtml() + '</div><div class="rz-actions">' + (rc.id ? '<button type="button" class="rz-btn ghost danger" data-act="rcremove">' + esc(T('del')) + '</button>' : '') + '<button type="button" class="rz-btn primary" id="rcSave" data-act="rcsave">' + esc(T('rcSave')) + '</button></div>';
    return h;
  }
  function rcSearchHtml() {
    return '<div class="rz-sh-h sl-ph"><button type="button" class="rz-x" data-act="rcback" aria-label="' + esc(T('back')) + '">' + ico('back') + '</button><b>' + esc(T('rcPickIng')) + '</b><span></span></div><div class="sl-search">' + ico('search') + '<input id="rcQ" type="text" inputmode="search" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="' + esc(T('rcQ')) + '" value="' + esc(rc.q) + '" aria-label="' + esc(T('rcQ')) + '"></div><div class="sl-res" id="rcRes">' + rcResults() + '</div>';
  }
  function rcResults() {
    if (dbState !== 2) return '<div class="rz-mut">' + esc(T('aLoading')) + '</div>'; var q = rc.q.trim(), foods = (db || []), list;
    list = q ? S.search(foods, q, srchOpts(30)) : foods.filter(function (f) { return f.t !== 'q' && f.t !== 'h' && f.t !== 'i'; }).slice(0, 60);
    return list.length ? list.map(function (f) { return '<button type="button" class="sl-rr" data-act="rcpick" data-id="' + esc(f.id) + '"><span class="m"><span class="nm">' + esc(nameOf(f)) + '</span><span class="tm">' + esc(T('per100', { k: f.k })) + '</span></span>' + ico('chev', 'r') + '</button>'; }).join('') : '<div class="rz-empty"><b>' + esc(T('aNone')) + '</b></div>';
  }
  function rcGramsHtml() {
    var f = rc.pick, pt = S.portion(f, rc.g);
    return '<div class="rz-sh-h sl-ph"><button type="button" class="rz-x" data-act="rcsearch" aria-label="' + esc(T('back')) + '">' + ico('back') + '</button><b>' + esc(nameOf(f)) + '</b><span></span></div><div class="sl-kc"><b id="rcgK">' + fmt(pt.kcal) + '</b><small> ' + T('kcal') + '</small></div><div class="rz-fl">' + esc(T('rcGrams')) + '</div><div class="rz-chips">' + [50, 100, 150, 200, 250, 300, 500].map(function (g) { return '<button type="button" class="rz-chip' + (rc.g === g ? ' on' : '') + '" data-act="rcg" data-g="' + g + '">' + g + ' ' + T('gram') + '</button>'; }).join('') + f.u.filter(function (u) { return u[0] !== 'g100'; }).map(function (u) { return '<button type="button" class="rz-chip alt" data-act="rcg" data-g="' + u[1] + '">' + esc(unitLabel(f, u[0])) + '</button>'; }).join('') + '</div>' +
      '<div class="sl-qty"><button type="button" data-act="rcgq" data-s="-1" aria-label="' + esc(T('qtyMinus')) + '">' + ico('minus', '', 2.4) + '</button><b id="rcgN">' + fmt(rc.g) + ' ' + T('gram') + '</b><button type="button" data-act="rcgq" data-s="1" aria-label="' + esc(T('qtyPlus')) + '">' + ico('plus', '', 2.4) + '</button></div><div class="rz-actions"><button type="button" class="rz-btn primary" data-act="rcaddgo">' + esc(T('rcAddIng')) + '</button></div>';
  }
  function rcGUpdate() { var pt = S.portion(rc.pick, rc.g); var k = $('#rcgK'), n = $('#rcgN'); if (k) k.textContent = fmt(pt.kcal); if (n) n.textContent = fmt(rc.g) + ' ' + T('gram'); $$('[data-act=rcg]').forEach(function (b) { b.classList.toggle('on', +b.getAttribute('data-g') === rc.g && !b.classList.contains('alt')); }); }
  function rcSaveGo() {
    var nm = ($('#rcName') && $('#rcName').value || rc.name).trim(); rc.name = nm; if (!nm) { flashEl($('#rcName')); return; } if (!rc.ings.length) { flashEl($('#rcSave')); return; }
    var f = S.saveRecipe(st, { id: rc.id, name: nm, ings: rc.ings, portions: rc.portions }); if (!f) return; kit.closeSheet(); commit(); vib(); toast(T('rcSaved', { n: f.n }), null, true);
  }
  function rcMineHtml() {
    var mine = st.customFoods || [];
    return '<section class="rz-card"><div class="rz-st">' + esc(T('rcMine')) + '</div>' + (mine.length ? mine.map(function (f) { return '<div class="sl-rowx"><button type="button" class="sl-row" data-act="pickfav" data-id="' + esc(f.id) + '" data-d="' + (foodDay || todayStr()) + '"><span class="m"><span class="nm">' + esc(f.n) + '</span><span class="tm">' + esc(T('per100', { k: f.k })) + (f.recipe ? ' · ' + f.recipe.portions + ' ' + (lang === 'ru' ? 'порц.' : 'porsiya') : '') + '</span></span></button>' + (f.recipe ? '<button type="button" class="sl-edit" data-act="rcedit" data-id="' + esc(f.id) + '" aria-label="' + esc(T('rcEdit') + ': ' + f.n) + '">' + ico('pen') + '</button>' : '') + '</div>'; }).join('') : '<div class="rz-mut">' + esc(T('rcNoMine')) + '</div>') + '<button type="button" class="rz-btn ghost full" data-act="rcnew">' + esc(T('rcNew')) + '</button></section>';
  }

  /* ---------- oylik taqvim (Men) ---------- */
  var calYm = null;
  function stLabel(i, d, t) { return { pre: T('stPre'), none: T('stNone'), part: i.live ? T('stLive') : T('stPart'), near: T('stNear'), low: T('stLow'), high: T('stHigh') }[i.state]; }
  function calHtml() {
    var t = todayStr(), ym = calYm || Dt.monthOf(t), g = S.monthGrid(st, ym, t), p = Dt.parse(ym + '-01'), wd = lang === 'ru' ? ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] : ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'], sk = S.streak(st, t), start = S.trackStart(st);
    var st2 = { near: T('calNear'), low: T('calLow'), high: T('calHigh'), part: T('calPart'), none: T('calNone'), pre: T('calPre') };
    var h = '<section class="rz-card sl-cal" id="calCard"><div class="sl-wh"><b>' + ico('cal2') + esc(T('calT')) + '</b><button type="button" class="rz-x sl-info" data-act="calinfo" aria-label="ⓘ ' + esc(T('calInfoT')) + '">ⓘ</button></div><div class="rz-monthnav"><button type="button" data-act="calprev" aria-label="‹">' + ico('back') + '</button><b>' + esc(kit.monthName(p.m, true) + ' ' + p.y) + '</b><button type="button" data-act="calnext" aria-label="›"' + (ym >= Dt.monthOf(t) ? ' disabled' : '') + '>' + ico('chev') + '</button></div><div class="sl-calg" role="grid">';
    wd.forEach(function (w) { h += '<i>' + esc(w) + '</i>'; }); for (var i = 0; i < g.first; i++) h += '<span></span>';
    g.days.forEach(function (d) { var pre = d.state === 'pre'; h += '<button type="button" class="c ' + d.state + (d.d === t ? ' td' : '') + (d.d > t ? ' fut' : '') + '" data-act="calday" data-d="' + d.d + '" aria-label="' + esc(kit.dLabel(d.d) + ': ' + (d.live ? T('stLive') : st2[d.state])) + '"' + (d.d > t || pre ? ' disabled' : '') + '>' + d.n + '</button>'; });
    h += '</div><div class="sl-leg">' + ['near', 'low', 'high', 'part', 'none'].map(function (k) { return '<span><i class="c ' + k + '" aria-hidden="true"></i>' + esc(st2[k]) + ' · ' + esc(T('calDays', { n: g.counts[k] })) + '</span>'; }).join('') + '</div>';
    if (start) h += '<p class="rz-mut sm sl-cstart">' + esc(T('calStart', { d: kit.dLabel(start) })) + '</p>';
    h += '<div class="sl-streak"><b>' + ico('flame', 'sl-inl') + esc(sk ? T('calStreak', { n: sk }) : T('calStreak0')) + '</b></div>';
    var sj = G ? G.streakLine(jokeCtx()) : null; if (sj) { h += '<p class="rz-p sl-fact">' + esc(sj.text) + '</p>'; }
    return h + '</section>';
  }

  /* ---------- hazil sozlamalari, shahar ---------- */
  function jokesCardHtml() {
    var on = prefs().jokes !== false, cityId = prefs().city || 'toshkent', cn = masofa && G ? G.nodeOf(masofa, cityId) : null, t = todayStr(), x = S.dayOf(st, t);
    return '<section class="rz-card"><div class="rz-st">' + esc(T('jkT')) + '</div><div class="rz-seg"><button type="button" data-act="jktog" data-v="1"' + (on ? ' class="on"' : '') + '>' + esc(T('jkOn')) + '</button><button type="button" data-act="jktog" data-v="0"' + (!on ? ' class="on"' : '') + '>' + esc(T('jkOff')) + '</button></div>' +
      '<button type="button" class="rz-row" data-act="city"><span class="m"><b>' + esc(T('jkCity')) + '</b><span>' + esc(T('jkCityH')) + '</span></span><span class="v">' + esc(cn ? (lang === 'ru' ? cn.ru : cn.uz) : cityId) + '</span></button>' +
      '<label class="rz-chk"><input type="checkbox" id="jkParty"' + (x && x.party ? ' checked' : '') + '><span>' + esc(T('jkParty')) + '</span></label><p class="rz-priv">' + esc(T('jkNote')) + '</p></section>';
  }
  function openCity() {
    if (!masofa) { loadMasofa(); return; }
    var cur = prefs().city || 'toshkent';
    openSheet('city', shHead(T('cityPick')) + masofa.nodes.filter(function (n) { return n.region; }).map(function (n) { return '<button type="button" class="sl-row" data-act="citypick" data-id="' + n.id + '"><span class="m"><span class="nm">' + esc(lang === 'ru' ? n.ru : n.uz) + '</span></span>' + (n.id === cur ? ico('check', '', 2.6) : '') + '</button>'; }).join(''));
  }

  /* ---------- taklif (umumiy baza navbati): faqat nom, porsiya, kkal/makro, til — foydalanuvchi tasdiqlagandan keyin ---------- */
  function normKey(s) { return S.key(String(s || '')).replace(/\b(bitta|ta|dona|kosa|likop|porsiya|stakan|piyola|bolak|tilim|g|gr|ml)\b/g, '').replace(/\d+/g, '').replace(/\s+/g, ' ').trim(); }
  function sendTaklif(it) {
    if (!it || !it.ai || it.photo || navigator.onLine === false) return; var k = normKey(it.name), p = prefs(), sent = p.tkl || (p.tkl = {}); if (!k || sent[k] === todayStr()) return; sent[k] = todayStr();
    try { fetch('/api/kalkifit-taklif', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nom: it.name, porsiya: it.ptxt || '', kcal: it.kcal, o: it.p, y: it.f, u: it.c, til: isCyr() ? 'kirill' : lang, mijoz_id: cid() }), keepalive: true }).catch(function () {}); } catch (e) {}
  }

  /* ---------- rasm bilan qo'shish ---------- */
  function phHtml() {
    var h = shHead(T('phT')) + '<p class="rz-p sm">' + esc(T('phNote')) + '</p>';
    if (fd.busy) return h + '<div class="rz-empty"><div class="sl-spin" aria-hidden="true"></div><b>' + esc(T('phBusy')) + '</b></div>';
    if (fd.phErr) h += '<p class="rz-p warn">' + esc(fd.phErr) + '</p>';
    if (!fd.items.length) return h + '<div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="fback">' + esc(T('back')) + '</button><button type="button" class="rz-btn primary" data-act="fphoto">' + ico('cam') + ' ' + esc(T('phPick')) + '</button></div>';
    h += '<p class="rz-p sm">' + esc(T('phHint')) + '</p>' + itRows(fd.items);
    return h + '<div class="rz-fl">' + esc(T('pMeal')) + '</div>' + mealChips(fd.meal, 'fmeal3') + '<div class="rz-actions sl-sticky"><button type="button" class="rz-btn primary" data-act="txsave">' + esc(T('pwAll', { n: fd.items.length })) + '</button></div>';
  }
  function phRefresh() { if (kit.sheetKind() === 'add' && fd && fd.mode === 'photo') setSheet(phHtml()); }
  function phShrink(file, cb) {                     // mijozda 1024 px ga kichraytirish, JPEG 0,8
    var url = URL.createObjectURL(file), img = new Image();
    img.onload = function () { var s = Math.min(1, 1024 / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.max(1, Math.round(img.width * s)); c.height = Math.max(1, Math.round(img.height * s)); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); c.toBlob(function (b) { if (!b) return cb(null); var r = new FileReader(); r.onload = function () { cb(String(r.result).split(',')[1] || null); }; r.readAsDataURL(b); }, 'image/jpeg', 0.8); };
    img.onerror = function () { URL.revokeObjectURL(url); cb(null); }; img.src = url;
  }
  function phFile(file) {
    if (!file) return; if (!fd || kit.sheetKind() !== 'add') openAdd({}); fd.mode = 'photo'; fd.busy = true; fd.phErr = ''; fd.items = []; setSheet(phHtml());
    phShrink(file, function (b64) {
      if (!b64) { fd.busy = false; fd.phErr = T('phErr'); phRefresh(); return; }
      fetch('/api/kalkifit-rasm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ img: b64, til: isCyr() ? 'kirill' : lang, mijoz_id: cid() }) }).then(function (r) { return r.json().then(function (j) { return { s: r.status, j: j }; }); }).then(function (res) {
        fd.busy = false; if (res.s === 429) fd.phErr = T(res.j && res.j.sabab === 'sayt' ? 'phSite' : 'phLimit'); else if (res.s !== 200 || !res.j || !res.j.ovqatlar) fd.phErr = T('phErr'); else if (!res.j.ovqatlar.length) fd.phErr = T('phNone');
        else fd.items = res.j.ovqatlar.map(function (o) { return { name: o.nom, fid: null, food: null, ptxt: o.porsiya || '', est: true, ai: true, photo: true, unit: 'pc', qty: 1, g: o.g || 0, kcal: Math.round(o.kcal), p: o.o || 0, f: o.y || 0, c: o.u || 0, base: { g: o.g || 0, kcal: Math.round(o.kcal), p: o.o || 0, f: o.y || 0, c: o.u || 0 } }; }); phRefresh();
      }).catch(function () { fd.busy = false; fd.phErr = T('phErr'); phRefresh(); });
    });
  }
  function phSetOffline() { var off = navigator.onLine === false; $$('#phBtn').forEach(function (b) { b.disabled = off; b.title = off ? T('phOffline') : ''; b.setAttribute('aria-disabled', off); }); }

  /* ---------- vitamin va qo'shimchalar ---------- */
  var spQ = '';
  var LV_RANK = { strong: 3, moderate: 2, low: 1, not: 0 };
  function topLevel(ev) { return ev.reduce(function (a, e) { return LV_RANK[e.level] > LV_RANK[a] ? e.level : a; }, ev[0].level); }
  function spEvHtml(it) { var ev = it.ev && it.ev.length ? it.ev : [{ level: it.level }]; return '<div class="sl-evs" role="list">' + ev.map(function (e) { return '<div class="sl-ev" role="listitem">' + spLvl(e.level, e.tag && e.tag[lang]) + (e[lang] ? '<span>' + esc(e[lang]) + '</span>' : '') + '</div>'; }).join('') + '</div>'; }
  function spLvl(l, tag) { return '<span class="sl-lv ' + l + '"><i aria-hidden="true"></i>' + esc(T('spEvL', { t: tag || '', w: T('spW_' + l) })) + '</span>'; }       // «Dalil: yetishmovchilikda kuchli» kabi aniq yorliq
  function srcLabel(it) { return /harvard/i.test(it.srcName || it.src || '') ? T('srcHarvard') : T('srcNih'); }
  function spListHtml() {
    var h = shHead(T('spT')) + '<ol class="sl-rules">' + (supp && supp.rules && supp.rules[lang] ? supp.rules[lang] : T('spRules')).map(function (x) { return '<li>' + esc(x.replace(/^\d+\.\s*/, '')) + '</li>'; }).join('') + '</ol><p class="rz-p sm">' + esc(T('spH')) + ' ' + esc(T('spLvlH')) + ' ' + esc(T('spTop')) + '</p><div class="sl-search">' + ico('search') + '<input id="spQ" type="text" inputmode="search" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="' + esc(T('spSearch')) + '" value="' + esc(spQ) + '" aria-label="' + esc(T('spSearch')) + '"></div><div class="sl-res" id="spRes">' + spRows() + '</div>';
    return h + spDisc();
  }
  function spDisc() { return '<p class="rz-p sm sl-disc">' + ico('warn', 'sl-inl') + esc(supp && supp.disclaimer ? supp.disclaimer[lang] : '') + '</p>'; }
  function spRows() {
    if (suppState !== 2) return '<div class="rz-mut">' + esc(T(suppState === 0 ? 'spErr' : 'spLoading')) + '</div>';
    var q = S.key(spQ), list = supp.items.filter(function (it) { return !q || S.key(it[lang].name + ' ' + it.id).indexOf(q) > -1; });
    return list.length ? list.map(function (it) { return '<button type="button" class="sl-sp" data-act="spitem" data-id="' + esc(it.id) + '">' + catIcon(it.ic) + '<span class="m"><span class="nm">' + esc(it[lang].name) + '</span><span class="tm">' + esc(it[lang].line) + '</span>' + (it.warn ? '<span class="sl-warn">' + ico('warn', 'sl-inl') + esc(it.warn[lang]) + '</span>' : '') + spLvl(it.level, (function () { var g = (it.ev || []).filter(function (e) { return e.level === it.level; })[0]; return g && g.tag && g.tag[lang]; })()) + '</span></button>'; }).join('') : '<div class="rz-empty"><b>' + esc(T('spNone')) + '</b></div>';
  }
  function openSupp() { spQ = ''; openSheet('supp', spListHtml()); loadSupp(function () { if (kit.sheetKind() === 'supp') setSheet(spListHtml()); }); }
  function spCardHtml(it) {
    var L = it[lang], part = function (k, key) { return L[key] ? '<div class="sl-sec"><div class="rz-fl">' + esc(T(k)) + '</div><p class="rz-p">' + esc(L[key]) + '</p></div>' : ''; };
    var prot = it.id === 'protein' ? '<p class="rz-p sl-fact">' + ico('muscle', 'sl-inl') + esc(T('spProt', { a: Math.round(S.sumEntries((S.dayOf(st, todayStr()) || { food: [] }).food).p), b: planNow().macros.p })) + '</p>' : '';
    return '<div class="rz-sh-h sl-ph"><button type="button" class="rz-x" data-act="spback" aria-label="' + esc(T('spBack')) + '">' + ico('back') + '</button><b>' + esc(L.name) + '</b><span></span></div><div class="sl-lvrow"><span class="rz-mut sm">' + esc(T('spLvl')) + '</span></div>' + spEvHtml(it) + (it.warn ? '<p class="sl-warn big">' + ico('warn', 'sl-inl') + esc(it.warn[lang]) + '</p>' : '') + part('spWhat', 'what') + part('spFood', 'food') + part('spWho', 'who') + part('spNot', 'not') + part('spCare', 'care') +
      (it.ul && it.ul[lang] ? '<div class="sl-ul"><b>' + ico('warn', 'sl-inl') + esc(T('spUl')) + '</b><p>' + esc(it.ul[lang]) + '</p></div>' : '') + prot +
      '<p class="rz-p sm">' + (it.src ? '<a class="rz-link" href="' + esc(it.src) + '" target="_blank" rel="noopener noreferrer">' + esc(T('spSrc', { s: srcLabel(it) })) + '</a>' : esc(T('spSrc', { s: '—' }))) + (it.src2 ? ' · <a class="rz-link" href="' + esc(it.src2) + '" target="_blank" rel="noopener noreferrer">2</a>' : '') + (it.srcs ? it.srcs.map(function (x) { return ' · <a class="rz-link" href="' + esc(x.u) + '" target="_blank" rel="noopener noreferrer">' + esc(x.l) + '</a>'; }).join('') : '') + ' · ' + esc(T('spChecked', { d: it.checked || supp.checked })) + '</p>' + spDisc();
  }

  /* ---------- tushuntirish panellari ---------- */
  function xr(sg, label, val, cls, unit) { return '<div class="rz-xr ' + (cls || '') + '"><span class="sg" aria-hidden="true">' + sg + '</span><span class="lb">' + esc(label) + '</span>' + (val == null ? '' : '<b>' + val + (unit === false ? '' : '<small> ' + T('kcal') + '</small>') + '</b>') + '</div>'; }
  function okBtn() { return '<div class="rz-actions"><button type="button" class="rz-btn primary" data-act="sheetclose">' + esc(T('close')) + '</button></div>'; }
  function openExplainKcal() {
    var t = todayStr(), pl = planNow(), x = S.dayOf(st, t) || { food: [], steps: 0 }, tot = S.sumEntries(x.food), b = S.dayBalance(pl.target, tot.kcal, x.steps, num(st.profile.height), S.currentWeight(st), st.profile.act);
    var h = shHead(T('xKcalT')) + '<div class="rz-xrows">' + xr('', T('xTarget'), fmt(pl.target)) + xr('+', T('xSteps') + (b.extraSteps ? ' (' + fmt(b.extraSteps) + ')' : ''), fmt(b.credit)) + xr('=', T('xLimit'), fmt(pl.target + b.credit), 'sum') + xr('−', T('xEaten'), fmt(tot.kcal)) + xr('=', T('xRem'), fmt(b.remaining), 'sum big') + '</div><p class="rz-p sm">' + esc(T('xWhyStep', { base: fmt(b.base) })) + '</p>';
    h += '<div class="rz-st" style="margin-top:6px">' + esc(T('xHowT')) + '</div><div class="rz-xrows">' + xr('', T('xBmr') + ' · ' + T('xBmrN'), fmt(pl.bmr)) + xr('×', T('xAct'), dec(pl.actK, 3), '', false) + xr('=', T('xTdee'), fmt(pl.tdee), 'sum');
    if (pl.delta) h += xr(pl.delta < 0 ? '−' : '+', T('xGoal') + ' (' + dec(Math.abs(pl.kgPerWeek), 2) + ' ' + KG() + '/' + (lang === 'ru' ? 'нед.' : 'hafta') + ')', fmt(Math.abs(pl.delta)));
    if (pl.floorApplied) h += xr('', T('xFloor'), fmt(pl.floorMin));
    h += xr('=', T('xTargetR'), fmt(pl.target), 'sum big') + '</div><p class="rz-p sm">' + esc(T('disc')) + '</p>' + okBtn();
    openSheet('xkcal', h);
  }
  function openExplainMacro() {
    var pl = planNow(), m = pl.macros, w = S.currentWeight(st);
    openSheet('xmacro', shHead(T('xMacroT')) + '<div class="rz-xrows">' + xr('', T('xProt', { pk: dec(m.pPerKg, 1), w: dec(w, 1), p: m.p }), null) + xr('', T('xFat', { f: m.f }), null) + xr('', T('xCarb', { c: m.c }), null) + '</div><p class="rz-p sm">' + esc(T('xMacroN')) + '</p><p class="rz-p sm">' + esc(T('rMacro', { p: m.p, f: m.f, c: m.c })) + '</p>' + okBtn());
  }
  function openExplainWater() { var pl = planNow(); openSheet('xwater', shHead(T('xWaterT')) + '<div class="rz-xrows">' + xr('', T('xWater', { w: dec(S.currentWeight(st), 1), ml: fmt(pl.water.ml), n: pl.water.glasses }), null) + '</div><p class="rz-p sm">' + esc(T('xWaterN')) + '</p>' + okBtn()); }
  function openExplainSteps() {
    var t = todayStr(), x = S.dayOf(st, t) || { steps: 0 }, h0 = num(st.profile.height), w = S.currentWeight(st), s = x.steps || 10000, km = S.distanceKm(s, h0), sc = Math.round(S.strideM(h0) * 1000) / 10;
    openSheet('xsteps', shHead(T('xStepT')) + '<div class="rz-xrows">' + xr('', T('xStride', { s: dec(sc, 1) }), null) + xr('', T('xDist', { n: fmt(s), s: dec(sc, 1), km: dec(km, 2) }), null) + xr('', T('xKc', { w: dec(w, 1), km: dec(km, 2), k: S.stepKcal(s, h0, w) }), null) + (function () { var bb = S.dayBalance(0, 0, x.steps || 0, h0, w, st.profile.act); return xr('', T('xStepBase', { base: fmt(bb.base), n: fmt(bb.extraSteps), k: fmt(bb.credit) }), null); })() + '</div><p class="rz-p sm">' + esc(T('xKcN')) + '</p><p class="rz-p sm">' + esc(T('xWhyStep', { base: fmt(S.stepBase(st.profile.act)) })) + '</p>' + okBtn());
  }
  function openExplainWeight() { openSheet('xweight', shHead(T('xWeightT')) + '<p class="rz-p">' + esc(T('xWeightN')) + '</p>' + okBtn()); }
  function openStepHelp() {
    var blk = function (k) { return '<div class="sl-help">' + ico('phone') + '<span>' + esc(T(k)) + '</span></div>'; };
    openSheet('help', shHead(T('hT')) + blk('hIos') + blk('hSam') + blk('hGoo') + '<p class="rz-p sm">' + esc(T('hNote')) + '</p>' + okBtn());
  }

  /* ---------- ovqat qo'shish (qidiruv → porsiya → saqlash) ---------- */
  var fd = null, CATS = ['o', 'n', 's', 'm', 'g', 'v', 'f', 'd', 'i', 'q', 'h', 'x'];
  function openAdd(o) {
    o = o || {}; fd = { date: o.date || todayStr(), meal: o.meal || S.mealByHour(new Date().getHours()), mode: 'search', q: '', cat: '', food: null, unit: null, qty: 1, editId: null, items: [], busy: false };
    openSheet('add', searchHtml()); catsInit(); loadDb(function (err) { if (fd && fd.mode === 'search') refreshRes(err); });
    if (o.food) pickFood(o.food);
  }
  function entUnitTxt(e) { var vv = vOf(e.unit); if (e.unit === 'g100') return fmt(e.g) + ' ' + T('gram'); if (vv) return qtyStr(e.qty) + ' ' + vName(vv); if (e.vn) return qtyStr(e.qty) + ' ' + e.vn; return qtyStr(e.qty) + ' ' + (e.unit && e.unit !== 'pc' ? unitName(e.unit) : unitName('porsiya')); }
  function lastEntries(limit) {                        // eng oxirgi yozuvlar (yangisi birinchi), har taomdan bittadan: [{e, d, k}]
    var out = [], seen = {}, days = Object.keys(st.days).sort().reverse(), from = Dt.addDays(todayStr(), -120);
    for (var i = 0; i < days.length && out.length < limit; i++) {
      if (days[i] < from) break; var l = st.days[days[i]].food;
      for (var j = l.length - 1; j >= 0 && out.length < limit; j--) { var e = l[j], k = e.fid ? (dbAlias[e.fid] || e.fid) : (e.name ? 'n:' + e.name : null); if (!k || seen[k]) continue; seen[k] = 1; out.push({ e: e, d: days[i], k: k }); }
    }
    return out;
  }
  var fdLM = {};
  function lastFor(key) { return key ? (fdLM[key] || null) : null; }
  function defPortionTxt(f) {
    var v = f.fam ? S.famVariant(f, S.famDefault(f), null) : f; if (!v || !v.u || !v.u.length) return ''; var u = defUnit(v), g = u === 'g100' ? 100 : (S.unitGrams(v, u) || 0); if (!(g > 0)) return '';
    return T('aDefOne', { x: u === 'g100' ? '100 ' + T('gram') : '1 ' + unitName(u), k: fmt(S.portion(v, g).kcal) });
  }
  function isSentence(q) { q = String(q || '').trim(); if (q.length < 6) return false; return /\d/.test(q) || /[,;+]/.test(q) || /(^|\s)(va|bilan|и|ва|ta|та)(\s|$)/i.test(q) || q.split(/\s+/).length >= 2; }
  function aiLineHtml() { var q = (fd && fd.q || '').trim(); return isSentence(q) ? '<button type="button" class="sl-ai" id="fdAi" data-act="fqai"><span>' + esc(T('aAiLine', { q: q })) + '</span></button>' : ''; }
  function recRow(r) {
    var e = r.e, f = e.fid ? foodById(e.fid) : null, base = f && f.al ? (foodById(f.al.f) || f) : f, nm = e.name || (base ? nameOf(base) : '?'), tx = entUnitTxt(e) + ' · ' + fmt(e.kcal) + ' ' + T('kcal');
    return '<div class="sl-rw"><button type="button" class="sl-rr" data-act="pickfood" data-id="' + esc(e.fid || '') + '"' + (e.fid ? '' : ' disabled') + '><span class="m"><span class="nm">' + esc(nm) + '</span><span class="tm">' + esc(tx) + '</span></span></button><button type="button" class="rz-x sl-plus" data-act="fquick" data-d="' + r.d + '" data-i="' + e.id + '" aria-label="' + esc(T('aQuickAdd') + ': ' + nm) + '">' + ico('plus', '', 2.4) + '</button></div>';
  }
  function moreHtml() {
    var row = function (act, ic, k) { return '<button type="button" class="sl-row" data-act="' + act + '">' + ico(ic) + '<span class="m"><span class="nm">' + esc(T(k)) + '</span></span>' + ico('chev', 'r') + '</button>'; };
    return '<div class="sl-more"><button type="button" class="sl-morebtn" data-act="fmore" aria-expanded="' + !!fd.more + '"><span>' + esc(T('aMoreT')) + '</span><i class="cv' + (fd.more ? ' open' : '') + '">▾</i></button>' + (fd.more ? '<div class="sl-morep">' + row('fcustom', 'plus', 'aCustom') + row('frecipe', 'book', 'aRecipe') + row('fbrowse', 'search', 'aCatsBtn') + row('yesam', 'help', 'yBtn') + row('fqsug', 'chat', 'aSugBtn') + '</div>' : '') + '</div>';
  }
  function catsHtml() {
    return '<div class="sl-catsw" id="catsW"><div class="sl-cats" id="catsRow" role="group" aria-label="' + esc(T('aCats')) + '">' + [''].concat(CATS).map(function (c) { return '<button type="button" class="rz-chip' + (fd.cat === c ? ' on' : '') + '" data-act="fcat" data-c="' + c + '" aria-pressed="' + (fd.cat === c) + '">' + esc(c ? T('cat_' + c) : T('all')) + '</button>'; }).join('') + '</div></div>';
  }
  function actsHtml() { return ''; }
  function searchHtml() {
    var off = navigator.onLine === false;
    return shHead(T('aT')) + '<div class="sl-sr"><div class="sl-search">' + ico('search') + '<input id="fdQ" type="text" inputmode="search" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="' + esc(T('aPh')) + '" value="' + esc(fd.q) + '" aria-label="' + esc(T('aT')) + '"></div><button type="button" class="sl-cam" id="phBtn" data-act="fphoto" aria-label="' + esc(T('phT')) + '"' + (off ? ' disabled aria-disabled="true" title="' + esc(T('phOffline')) + '"' : '') + '>' + ico('cam') + '</button></div><div id="fdAiW">' + aiLineHtml() + '</div>' + (fd.browse ? catsHtml() : '') + '<div class="sl-res" id="fdRes">' + resultsHtml() + '</div>';
  }
  /* kategoriya qatori: gorizontal scroll, chetlarda yumshoq soya, sichqoncha g'ildiragi va sudrab surish ishlaydi */
  function catsInit() {
    var w = $('#catsW'), r = $('#catsRow'); if (!w || !r || r._init) return; r._init = true;
    var upd = function () { w.classList.toggle('l', r.scrollLeft > 4); w.classList.toggle('r', r.scrollLeft < r.scrollWidth - r.clientWidth - 4); };
    r.addEventListener('scroll', upd, { passive: true }); upd(); setTimeout(upd, 300);
    r.addEventListener('wheel', function (e) { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { r.scrollLeft += e.deltaY; e.preventDefault(); } }, { passive: false });
    var drag = null;
    r.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; drag = { x: e.clientX, l: r.scrollLeft, moved: false }; });
    window.addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - drag.x; if (Math.abs(dx) > 4) { drag.moved = true; r.scrollLeft = drag.l - dx; } });
    window.addEventListener('pointerup', function () { if (drag && drag.moved) { r._swallow = true; setTimeout(function () { r._swallow = false; }, 0); } drag = null; });
    r.addEventListener('click', function (e) { if (r._swallow) { e.stopPropagation(); e.preventDefault(); } }, true);
    var on = r.querySelector('.rz-chip.on'); if (on && r.scrollWidth > r.clientWidth) r.scrollLeft = Math.max(0, on.offsetLeft - 40); upd();
  }
  function resRow(f) {
    var pk = f.fam && fd && fd.q ? S.famPick(f, fd.q) : null, key = f.fam ? f.fam.id : (dbAlias[f.id] || f.id), le = lastFor(key), sub = le ? T('aLastTime', { x: entUnitTxt(le.e) }) : defPortionTxt(f);
    return '<button type="button" class="sl-rr" data-act="pickfood" data-id="' + esc(f.id) + '"' + (pk ? ' data-pick="' + esc(JSON.stringify(pk)) + '"' : '') + '><span class="m"><span class="nm">' + esc(nameOf(f)) + (st.favs.indexOf(f.id) > -1 ? ' ' + ico('heart', 'fv') : '') + '</span>' + (sub ? '<span class="tm">' + esc(sub) + '</span>' : '') + '</span>' + ico('chev', 'r') + '</button>';
  }
  function resultsHtml() {
    if (dbState !== 2) return '<div class="rz-mut">' + esc(T('aLoading')) + '</div>';
    var foods = allFoods(), q = fd.q.trim(), list, h = '', le = lastEntries(200); fdLM = {}; le.forEach(function (r) { fdLM[r.k] = r; });
    if (q) { list = S.search(foods, q, srchOpts(40)); if (fd.cat) list = list.filter(function (f) { return f.t === fd.cat; }); }
    else if (fd.cat) list = foods.filter(function (f) { return f.t === fd.cat && !f.h; });
    else if (fd.browse) {                            // «Kategoriyalar bo'yicha ko'rish»: BUTUN baza guruhlar bo'yicha
      return CATS.map(function (c) { var l = foods.filter(function (f) { return f.t === c && !f.custom && !f.h; }); return l.length ? '<div class="rz-st grp">' + esc(T('cat_' + c)) + ' <small>' + l.length + '</small></div>' + l.map(resRow).join('') : ''; }).join('') + '<button type="button" class="sl-txtbtn" data-act="fbrowse">' + esc(T('back')) + '</button>';
    } else {                                         // birinchi ko'rinish: Oxirgilar → Saqlanganlar → Boshqa usullar
      var rec = le.slice(0, 5), fav = st.favs.map(foodById).filter(Boolean).slice(0, 5), sec = function (t, l) { return l.length ? '<div class="rz-st">' + esc(t) + '</div>' + l.join('') : ''; };
      var pop = rec.length ? [] : (function () { var r0 = st.recents.map(foodById).filter(Boolean).slice(0, 5); return r0.length ? r0 : foods.filter(function (f) { return f.t === 'o' && !f.custom && !f.h; }).slice(0, 6); })();
      return sec(T('aRecentT'), rec.map(recRow)) + sec(T('aPop'), pop.map(resRow)) + '<div class="rz-st">' + esc(T('aSavedT')) + '</div>' + tplBar() + fav.map(resRow).join('') + st.customFoods.map(resRow).join('') + moreHtml();
    }
    if (!list.length) return '<div class="rz-empty"><b>' + esc(T('aNone')) + '</b><span>' + esc(T('aNoneH')) + '</span>' + (q ? '<div class="sl-nact"><button type="button" class="rz-btn sm primary" data-act="fqai"' + (navigator.onLine === false ? ' disabled aria-disabled="true"' : '') + '>' + esc(T('aAiBtn')) + '</button><button type="button" class="rz-btn sm" data-act="fcustom">' + esc(T('aCustom')) + '</button><button type="button" class="rz-btn sm" data-act="fqsug">' + esc(T('aSugBtn')) + '</button></div>' : '') + '</div>';
    return list.map(resRow).join('');
  }
  function refreshRes(err) { var r = $('#fdRes'); if (r) r.innerHTML = err ? '<div class="rz-mut">' + esc(T('aNone')) + '</div>' : resultsHtml(); var w = $('#fdAiW'); if (w) w.innerHTML = aiLineHtml(); }
  function mealChips(sel, act) { return '<div class="rz-chips" role="group" aria-label="' + esc(T('pMeal')) + '">' + S.MEALS.map(function (m) { return '<button type="button" class="rz-chip' + (sel === m ? ' on' : '') + '" data-act="' + act + '" data-m="' + m + '" aria-pressed="' + (sel === m) + '">' + esc(mealName(m)) + '</button>'; }).join('') + '</div>'; }
  /* ---------- porsiya oynasi (bitta): qidiruvdan tanlash, saqlangan yozuv, AI matn/rasm qatorlari ---------- */
  function pwO() { return fd.mode === 'item' ? fd.items[fd.ix] : fd; }
  function pwBaseG(o) { return o.base ? (o.base.g || 0) : 0; }
  function vFillChips(o) {
    if (!vOf(o.unit)) return ''; var fl = o.vfill || 'tola';
    return '<div class="rz-fl">' + esc(T('vfT')) + '</div><div class="rz-chips" id="fdFill" role="group" aria-label="' + esc(T('vfT')) + '">' + ['yarim', 'tola', 'kop'].map(function (k) { return '<button type="button" class="rz-chip sm' + (fl === k ? ' on' : '') + '" data-act="vfill" data-f="' + k + '" aria-pressed="' + (fl === k) + '">' + esc(T('vf_' + k)) + '</button>'; }).join('') + '</div>';
  }
  function vkey(o) { var f = o && (o.fam || o.food); if (!f) return null; return f.fam ? f.fam.id : (dbAlias[f.id] || f.id); }          // «taom oilasi» kaliti: oila id yoki yakka taom id
  function vOf(u) { return u && String(u).indexOf('v:') === 0 ? S.vesselById(st, +String(u).slice(2)) : null; }
  function vName(v) { return v.name || T('vn_' + v.kind); }
  function vLabel(v, key) { return vName(v) + ' · ' + fmt(v.fam[key]) + ' ' + T('gram'); }
  function pwUg(o, u) { var vv = vOf(u); if (vv) return S.vessGrams(vv, vkey(o), o.vfill); if (u === 'g100') return 1; return o.food ? (S.unitGrams(o.food, u) || 0) : pwBaseG(o); }   // 1 birlik necha gramm
  function pwUnits(o) { if (!o.food) return ['pc'].concat(pwBaseG(o) > 0 ? ['g100'] : []); var l = o.food.u.map(function (u) { return u[0]; }), d = defUnit(o.food), vs = S.vesselsFor(st, vkey(o)).map(function (v) { return 'v:' + v.id; }); return vs.concat([d], l.filter(function (k) { return k !== d; })); }
  function pwUName(u) { var vv = vOf(u); if (vv) return vName(vv); return u === 'pc' ? unitName('porsiya') : (u === 'g100' ? T('pwGramm') : unitName(u)); }
  function pwGrams(o) { return o.unit === 'g100' ? o.qty : pwUg(o, o.unit) * o.qty; }
  function pwCalc(o) {
    var g = pwGrams(o); if (o.food) return S.portion(o.food, g);
    var b = o.base, m = o.unit === 'g100' ? (b.g > 0 ? o.qty / b.g : 1) : o.qty, r1 = function (x) { return Math.round(x * m * 10) / 10; };
    return { g: Math.round(g), kcal: Math.round(b.kcal * m), p: r1(b.p), f: r1(b.f), c: r1(b.c) };
  }
  function pwStep(o) { return o.unit === 'g100' ? 10 : 0.5; }
  function pwMax(o) { return o.unit === 'g100' ? 3000 : 50; }
  function pwInfo(o) {
    var g = pwGrams(o), ug = pwUg(o, o.unit); if (o.unit === 'g100') return T('pwNow', { g: fmt(g) });
    return (ug > 0 ? T('pwEq', { u: pwUName(o.unit), g: fmt(ug) }) + (g > 0 ? ' · ' : '') : '') + (g > 0 ? T('pwNow', { g: fmt(g) }) : '');
  }
  function pwQuick(o) { return [0.5, 1, 1.5, 2].map(function (v, i) { var q = o.unit === 'g100' ? v * 100 : v, on = Math.abs(o.qty - q) < 1e-6; return '<button type="button" class="rz-chip sm' + (on ? ' on' : '') + '" data-act="pwq" data-v="' + q + '" aria-pressed="' + on + '">' + ['½', '1', '1½', '2'][i] + '</button>'; }).join(''); }
  function pwSumQ(o) { return o.unit === 'g100' ? fmt(pwGrams(o)) + ' ' + T('gram') : qtyStr(o.qty) + ' ' + pwUName(o.unit); }
  function pwBody(o, noName) {
    var pt = pwCalc(o), approx = !!o.base;                             // «taxminiy» faqat bazada yo'q (AI/rasm) taom uchun; baza taomlariniki — faqat ⓘ Manba ichida
    var nm = o.fam ? nameOf(o.fam) : (o.food ? nameOf(o.food) : (o.name || '')), lb = o.fam && o.food ? S.famLabel(o.fam, o.food.vr, o.szid, lang) : '';
    var more = famChips(o) + vFillChips(o) + '<div class="rz-fl">' + esc(T('pwQuick')) + '</div><div class="rz-chips sl-pwq" id="fdQuick" role="group" aria-label="' + esc(T('pwQuick')) + '">' + pwQuick(o) + '</div><div class="sl-pwi" id="fdInfo">' + esc(pwInfo(o)) + '</div>' + (fd.mode === 'portion' || fd.mode === 'item' ? '<button type="button" class="rz-btn ghost sl-sw" data-act="pwswap">' + esc(T('pwSwap')) + '</button>' : '');
    return '<div class="sl-sum" aria-live="polite">' + (noName ? '' : '<b class="nm">' + esc(nm) + '</b>' + (lb ? ' · ' + esc(lb) : '') + ' · ') + '<span id="fdSumQ">' + esc(pwSumQ(o)) + '</span> · ' + (approx ? '≈ ' : '') + '<b id="fdKcal">' + fmt(pt.kcal) + '</b> ' + T('kcal') + '</div><div class="sl-mc" id="fdMac">' + esc(T('pMacro', { p: dec(pt.p, 0), f: dec(pt.f, 0), c: dec(pt.c, 0) })) + '</div>' +
      (approx ? '<p class="rz-p sm sl-ap">' + esc(T('pwApprox')) + '</p>' : '') +
      '<div class="rz-chips" id="fdUnits" role="group" aria-label="' + esc(T('pUnit')) + '">' + pwUnits(o).map(function (u) { var vv = vOf(u); return '<button type="button" class="rz-chip' + (vv ? ' sl-vc' : '') + (o.unit === u ? ' on' : '') + '" data-act="funit" data-u="' + u + '" aria-pressed="' + (o.unit === u) + '">' + esc(vv ? vLabel(vv, vkey(o)) : pwUName(u)) + '</button>'; }).join('') + (o.food ? '<button type="button" class="rz-chip sl-vnew" data-act="vnew">+ ' + esc(T('vNew')) + '</button>' : '') + '</div>' +
      '<div class="sl-qty"><button type="button" data-act="fqty" data-s="-1" aria-label="' + esc(T('qtyMinus')) + '">' + ico('minus', '', 2.4) + '</button><span class="pw-in"><input id="fdQty" type="text" inputmode="decimal" autocomplete="off" enterkeyhint="done" aria-label="' + esc(T('pwQty')) + '" value="' + esc(qtyStr(o.qty)) + '"><i id="fdQu">' + (o.unit === 'g100' ? esc(T('gram')) : '') + '</i></span><button type="button" class="rz-x sl-qp" data-act="fqty" data-s="1" aria-label="' + esc(T('qtyPlus')) + '">' + ico('plus', '', 2.4) + '</button></div>' +
      '<button type="button" class="sl-morebtn" data-act="pwmore" aria-expanded="' + !!o.pmore + '"><span>' + esc(T(o.fam ? 'pMoreT' : 'pMore2T')) + '</span><i class="cv' + (o.pmore ? ' open' : '') + '">▾</i></button><div class="sl-pwmore" id="pwMore"' + (o.pmore ? '' : ' hidden') + '>' + more + '</div>' +
      '<div class="sl-two"><button type="button" class="sl-txtbtn sl-src" data-act="pwsrc">ⓘ ' + esc(T('srcBtn')) + '</button></div>';
  }
  function fl(x) { return lang === 'ru' ? x.r : x.n; }
  function famChips(o) {                              // omillar chiplari: faqat kkal'ga sezilarli ta'sir qiladiganlar (>15%) + o'lcham
    if (!o.fam) return ''; var fm = o.fam.fam, h = '';
    fm.ax.forEach(function (a) { if (!a.s) return; h += '<div class="rz-fl">' + esc(fl(a)) + '</div><div class="rz-chips" role="group" aria-label="' + esc(fl(a)) + '">' + a.o.map(function (x) { var on = (o.sel[a.i] || a.d) === x.i; return '<button type="button" class="rz-chip' + (on ? ' on' : '') + '" data-act="fax" data-a="' + a.i + '" data-o="' + x.i + '" aria-pressed="' + on + '">' + esc(fl(x)) + '</button>'; }).join('') + '</div>'; });
    if (fm.sz) h += '<div class="rz-fl">' + esc(fl(fm.sz)) + '</div><div class="rz-chips" role="group" aria-label="' + esc(fl(fm.sz)) + '">' + fm.sz.o.map(function (x) { var on = (o.szid || fm.sz.d) === x.i; return '<button type="button" class="rz-chip' + (on ? ' on' : '') + '" data-act="fsz" data-o="' + x.i + '" aria-pressed="' + on + '">' + esc(fl(x)) + '</button>'; }).join('') + '</div>';
    return h;
  }
  function famRefresh(o) {                            // omil/o'lcham o'zgardi: kombinatsiya qayta, birlik saqlanadi (yo'q bo'lsa — standart)
    var prevG = pwGrams(o), keep = o.unit; o.food = S.famVariant(o.fam, o.sel, o.szid);
    if (!o.food.u.some(function (u) { return u[0] === o.unit; })) { o.unit = defUnit(o.food); o.qty = o.unit === 'g100' ? Math.round(prevG) || 100 : 1; }
    if (fd.mode === 'item') { o.ed = true; o.est = !!o.food.e; var lb = S.famLabel(o.fam, o.food.vr, o.szid, lang); o.name = nameOf(o.fam) + (lb ? ' · ' + lb : ''); o.vr = o.food.vr; o.sz = o.szid; }
    pwScreen();
  }
  function srcHtml(o) {                               // ⓘ Manba: masalliqlar, manba nomlari, «taxminiy» sababi
    var f = o.fam ? o.food : (o.food || null), rid = f && f.rc, ms = rid && dbMr[rid] ? dbMr[rid] : (f && f.ms) || null, un = f && f.b ? f.b : [];
    var t = ms ? (lang === 'ru' ? ms.r : ms.u) : T('srcNone'), us = un.length ? un.map(function (b) { return '1 ' + unitName(b.k) + ' ≈ ' + fmt(b.g) + ' ' + T('gram'); }).join(' · ') + ' — ' + T(un[0].s === 'a' ? 'srcUnitA' : 'srcUnitB') : '';
    return '<div class="rz-sh-h sl-ph"><button type="button" class="rz-x" data-act="pwswapx" aria-label="' + esc(T('back')) + '">' + ico('back') + '</button><b>' + esc(T('srcBtn')) + '</b><span></span></div>' +
      '<p class="rz-p"><b>' + esc(f ? nameOf(o.fam || f) : (o.name || '')) + '</b>' + ((o.fam && f.vr) ? ' · ' + esc(S.famLabel(o.fam, f.vr, o.szid, lang) || '') : '') + '</p>' +
      (!f ? '<p class="rz-p sl-ap">' + esc(T('srcAi')) + '</p>' : (f.e ? '<p class="rz-p sl-ap">' + esc(T(f.rc ? 'srcApprox' : 'srcApprox2')) + '</p>' : '')) + '<p class="rz-p">' + esc(t) + '</p>' + (f && f.k ? '<p class="rz-p sm">' + esc(T('srcPer100', { k: f.k }) + (o.fam ? ' · ' + T('famN', { n: o.fam.fam.N }) + ' · ' + T('famDef') : '')) + '</p>' : '') + (us ? '<p class="rz-p sm">' + esc(us) + '</p>' : '') +
      '<div class="rz-actions sl-sticky"><button type="button" class="rz-btn primary" data-act="pwswapx">' + esc(T('back')) + '</button></div>';
  }
  function itSync(it) {
    var pt = pwCalc(it); it.g = pt.g; it.kcal = pt.kcal; it.p = pt.p; it.f = pt.f; it.c = pt.c;
    if (it.ed || it.food) it.ptxt = it.unit === 'g100' ? fmt(pt.g) + ' ' + T('gram') : qtyStr(it.qty) + ' ' + pwUName(it.unit);
  }
  function pwUpdate(fromInput) {
    var o = pwO(), pt = pwCalc(o); if (fd.mode === 'item') { o.ed = true; itSync(o); }
    kit.setNum($('#fdKcal'), num($('#fdKcal').textContent.replace(/\s/g, '')), pt.kcal, { dur: 200 });
    $('#fdSumQ').textContent = pwSumQ(o); $('#fdMac').textContent = T('pMacro', { p: dec(pt.p, 0), f: dec(pt.f, 0), c: dec(pt.c, 0) });
    if (!fromInput) $('#fdQty').value = qtyStr(o.qty);
    $('#fdQu').textContent = o.unit === 'g100' ? T('gram') : ''; $('#fdInfo').textContent = pwInfo(o); $('#fdQuick').innerHTML = pwQuick(o);
    $$('[data-act=funit]').forEach(function (b) { var on = b.getAttribute('data-u') === o.unit; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  }
  function pwSetQty(o, q) { o.qty = Math.max(pwStep(o), Math.min(pwMax(o), Math.round(q * 100) / 100)); }
  function pwSetUnit(o, nu) {                          // birlik almashganda gramm (demak kkal) o'zgarmaydi
    var g = pwGrams(o), ug = pwUg(o, nu); o.unit = nu; if (vOf(nu)) { o.vfill = o.vfill || 'tola'; o.qty = 1; return; }
    if (g > 0 && ug > 0) o.qty = nu === 'g100' ? Math.round(g) : Math.round(g / ug * 100) / 100; else o.qty = nu === 'g100' ? 100 : 1;
    o.qty = Math.max(pwStep(o) / (nu === 'g100' ? 1 : 50), Math.min(pwMax(o), o.qty));
  }
  function pwSimilar(o) {
    var nm = o.food ? nameOf(o.food) : o.name, ws = S.key(nm).split(' ').filter(function (w) { return w.length >= 3; }), seen = {}, out = [];
    [nm].concat(ws).forEach(function (q) { if (q) S.search(allFoods(), q, srchOpts(12)).forEach(function (f) { if ((o.food && f.id === o.food.id) || seen[f.id]) return; seen[f.id] = 1; out.push(f); }); });
    if (out.length < 5 && o.food && o.food.t) {          // yetmasa — shu turdagi (meva, go'sht…) kaloriyasi yaqin taomlar
      allFoods().filter(function (f) { return f.t === o.food.t && f.id !== o.food.id && !seen[f.id]; }).sort(function (a, b) { return Math.abs(a.k - o.food.k) - Math.abs(b.k - o.food.k); }).forEach(function (f) { if (out.length < 5) { seen[f.id] = 1; out.push(f); } });
    }
    return out.slice(0, 5);
  }
  function pwSwapHtml(o) {
    var l = pwSimilar(o);
    return '<div class="rz-sh-h sl-ph"><button type="button" class="rz-x" data-act="pwswapx" aria-label="' + esc(T('back')) + '">' + ico('back') + '</button><b>' + esc(T('pwSwapT')) + '</b><span></span></div>' +
      (l.length ? l.map(function (f) { return '<button type="button" class="sl-row" data-act="pwsw" data-id="' + esc(f.id) + '"><span class="m"><span class="nm">' + esc(nameOf(f)) + '</span><span class="tm">' + esc(defPortionTxt(f)) + '</span></span></button>'; }).join('') : '<div class="rz-mut">' + esc(T('pwNoSim')) + '</div>');
  }
  function pwSwapTo(id) {
    var o = pwO(), f = foodById(id); if (!f) return; var g = pwGrams(o), has = function (u) { return f.u.some(function (x) { return x[0] === u; }); };
    o.food = f; delete o.base; if (f.fam) famOpen(o, f, S.famDefault(f)); else { o.fam = null; o.sel = null; }
    if (!(o.unit && o.unit !== 'pc' && has(o.unit))) { if (g > 0 && has('g100')) { o.unit = 'g100'; o.qty = Math.round(g); } else { o.unit = f.u[0][0]; o.qty = o.unit === 'g100' ? 100 : 1; } }
    if (fd.mode === 'item') { o.fid = f.id; o.name = nameOf(f); if (f.fam) { o.vr = o.food.vr; o.sz = o.szid; } o.ai = false; o.photo = false; o.est = !!f.e; o.ed = true; itSync(o); }
    pwScreen();
  }
  function pwScreen() { setSheet(fd.mode === 'item' ? itemHtml() : portionHtml()); }
  function itemHtml() {
    var it = fd.items[fd.ix];
    return '<div class="rz-sh-h sl-ph"><button type="button" class="rz-x" data-act="pwdone" aria-label="' + esc(T('back')) + '">' + ico('back') + '</button><b>' + esc(it.name) + '</b><span></span></div>' + pwBody(it, true) +
      '<div class="rz-actions sl-sticky"><button type="button" class="rz-btn primary" id="fsave" data-act="pwdone">' + esc(T('pwDone')) + '</button></div>';
  }
  function itemOpen(i, back) { fd.back = back; fd.ix = i; fd.mode = 'item'; var it = fd.items[i]; if (!it.unit) { it.unit = 'pc'; it.qty = 1; } setSheet(itemHtml()); }
  function itemBack() { var b = fd.back; fd.mode = b; if (b === 'photo') setSheet(phHtml()); else if (b === 'tpl') setSheet(tplHtml()); else setSheet(textHtml()); }

  /* ---------- «Odatdagi ovqatlarim» va «Kechagidek» ---------- */

  /* ---------- «Mening idishim»: o'z kosa/laganingiz (idish × taom oilasi) ---------- */
  var LIKOPCHA_G = 200;                                // likopcha (kichik likop) — alohida standart (lagan emas); tarozida hali tekshirilmagan (docs/tarozida-tekshirish.md, ixtiyoriy)
  function vStdG(o, kind) { if (kind === 'likopcha') return LIKOPCHA_G; var uk = S.VUNIT[kind] || defUnit(o.food), g = S.unitGrams(o.food, uk) || S.unitGrams(o.food, defUnit(o.food)) || 0; return g; }
  function vcGrams() {                                 // 2 yo'l: tarozida (ovqat bilan − bo'sh idish yoki to'g'ridan-to'g'ri ovqat grammi) / tarozisiz (standartga nisbatan)
    var vc = fd.vc, o = pwO(); if (vc.method === 'scale') { var d = num(vc.full) - num(vc.empty); return num(vc.full) > 0 && num(vc.empty) >= 0 && d > 0 ? Math.round(d) : Math.round(num(vc.direct)); }
    return Math.round(vStdG(o, vc.kind) * S.SCALE[vc.scale]);
  }
  function vcOpen(kind) {
    var o = pwO(); if (!o || !o.food) return; var du = defUnit(o.food), dk = kind || (du === 'kosa' ? 'kosa' : (du === 'piyola' ? 'piyola' : 'lagan'));
    fd.vcBack = fd.mode; fd.vc = { kind: dk, name: '', vid: null, method: 'scale', full: '', empty: '', direct: '', scale: 'ohshash' }; setSheet(vesselHtml());
  }
  function vesselHtml() {
    var vc = fd.vc, o = pwO(), key = vkey(o), kinds = S.VKINDS, h, link = vc.vid ? S.vesselById(st, vc.vid) : null;
    h = '<div class="rz-sh-h sl-ph"><button type="button" class="rz-x" data-act="vback" aria-label="' + esc(T('back')) + '">' + ico('back') + '</button><b>' + esc(T('vcT')) + '</b><span></span></div><p class="rz-p sm">' + esc(T('vcFor', { x: nameOf(o.fam || o.food) })) + '</p>';
    var ex = (st.vessels || []).filter(function (v) { return !(v.fam[key] > 0); });
    if (ex.length) h += '<div class="rz-fl">' + esc(T('vcLink')) + '</div><div class="rz-chips">' + ex.map(function (v) { return '<button type="button" class="rz-chip' + (vc.vid === v.id ? ' on' : '') + '" data-act="vlink" data-id="' + v.id + '" aria-pressed="' + (vc.vid === v.id) + '">' + esc(vName(v)) + '</button>'; }).join('') + '</div>';
    if (!link) h += '<div class="rz-fl">' + esc(T('vcKind')) + '</div><div class="rz-chips">' + kinds.map(function (k) { return '<button type="button" class="rz-chip' + (vc.kind === k ? ' on' : '') + '" data-act="vkind" data-k="' + k + '" aria-pressed="' + (vc.kind === k) + '">' + esc(T('vk_' + k)) + '</button>'; }).join('') + '</div>' +
      (vc.kind === 'custom' ? '<label class="rz-f" for="vcName"><span>' + esc(T('vcName')) + '</span><input id="vcName" type="text" maxlength="30" autocomplete="off" value="' + esc(vc.name) + '"></label>' : '');
    else h += '<p class="rz-p"><b>' + esc(vName(link)) + '</b></p>';
    h += '<div class="rz-fl">' + esc(T('vcHow')) + '</div><div class="rz-chips">' + ['scale', 'noscale'].map(function (m) { return '<button type="button" class="rz-chip' + (vc.method === m ? ' on' : '') + '" data-act="vmeth" data-m="' + m + '" aria-pressed="' + (vc.method === m) + '">' + esc(T(m === 'scale' ? 'vcScaleOn' : 'vcScaleOff')) + '</button>'; }).join('') + '</div>';
    if (vc.method === 'scale') h += '<p class="rz-p sm">' + esc(T('vcHint')) + '</p>' + numFld('vcFull', T('vcFull'), vc.full, '', 'decimal') + numFld('vcEmpty', T('vcEmpty'), vc.empty, '', 'decimal') + numFld('vcDirect', T('vcDirect'), vc.direct, '', 'decimal');
    else { var sg = vStdG(o, vc.kind); h += '<p class="rz-p">' + esc(T('vcStd', { k: T('vs_' + vc.kind), g: fmt(sg) })) + '</p><div class="rz-fl">' + esc(T('vcCompare')) + '</div><div class="rz-chips">' + ['kichik', 'ohshash', 'katta'].map(function (k) { return '<button type="button" class="rz-chip' + (vc.scale === k ? ' on' : '') + '" data-act="vscale" data-s="' + k + '" aria-pressed="' + (vc.scale === k) + '">' + esc(T('vc_' + k)) + '</button>'; }).join('') + '</div>'; }
    h += '<div class="sl-sticky sl-vbar"><div class="sl-vres" id="vcRes" aria-live="polite">' + vcResTxt() + '</div><div class="rz-actions"><button type="button" class="rz-btn primary" data-act="vsave">' + esc(T('vcSave')) + '</button></div></div>';
    return h;
  }
  function vcResTxt() { var g = vcGrams(); return g >= 10 ? T('vcRes', { g: fmt(g) }) : ''; }
  function vcSave() {
    var vc = fd.vc, o = pwO(), key = vkey(o), g = vcGrams(); if (!(g >= 10 && g <= 3000)) { toast(T('vcBad')); return; }
    var v; if (vc.vid) { if (!S.linkVessel(st, vc.vid, key, g)) { toast(T('vcBad')); return; } v = S.vesselById(st, vc.vid); }
    else { if (vc.kind === 'custom' && !String(vc.name).trim()) { flashEl($('#vcName')); return; } v = S.addVessel(st, vc.kind, vc.name, key, g); if (!v) { toast(T('vcMax')); return; } }
    save(); o.unit = 'v:' + v.id; o.qty = 1; o.vfill = 'tola'; fd.mode = fd.vcBack || 'portion'; fd.vc = null; pwScreen(); if (fd.mode === 'item') { o.ed = true; itSync(o); }
    toast(T('vSaved', { x: vLabel(v, key) }), null, true);
  }
  function vSugKind() { var du = fd.food ? defUnit(fd.food) : 'likop'; return du === 'kosa' ? 'kosa' : 'lagan'; }
  function vSugHtml() {                                // kashfiyot: idishli taomni 3-marta qo'shganda bir martalik taklif
    if (fd.editId != null || fd.mode !== 'portion' || !fd.food || fd.food.t !== 'o') return ''; var key = vkey(fd); if (!key || S.vesselsFor(st, key).length) return '';
    var du = defUnit(fd.food); if (du !== 'kosa' && du !== 'likop') return ''; var pr = prefs(); pr.vsug = pr.vsug || {};
    if (fd.vsugShown !== key) { if (pr.vsug[key]) return ''; var from = Dt.addDays(todayStr(), -60), cnt = 0; Object.keys(st.days).forEach(function (d) { if (d >= from) st.days[d].food.forEach(function (e) { if (e.fid && (dbAlias[e.fid] || e.fid) === key) cnt++; }); }); if (cnt < 2) return ''; pr.vsug[key] = 1; fd.vsugShown = key; save(); }
    return '<div class="sl-sug" id="vSug"><p>' + esc(T(du === 'kosa' ? 'vsugK' : 'vsugL')) + '</p><div class="rz-actions"><button type="button" class="rz-btn ghost sm" data-act="vsugno">' + esc(T('vsugNo')) + '</button><button type="button" class="rz-btn primary sm" data-act="vsugyes">' + esc(T('vsugYes')) + '</button></div></div>';
  }
  var vm = null;
  function vFams(v) { return Object.keys(v.fam).map(function (k) { var f = foodById(k); return (f ? nameOf(f) : k) + ' ' + fmt(v.fam[k]) + ' ' + T('gram'); }).join(' · '); }
  function vmHtml() {
    var l = st.vessels || [];
    return shHead(T('vmT')) + (l.length ? l.map(function (v) {
      return '<div class="sl-tr"><span class="m"><b>' + esc(vName(v)) + '</b><span>' + esc(vFams(v)) + '</span></span><button type="button" class="rz-x" data-act="vedit" data-id="' + v.id + '" aria-label="' + esc(T('vmEdit') + ': ' + vName(v)) + '">' + ico('pen') + '</button><button type="button" class="rz-x" data-act="vdel" data-id="' + v.id + '" aria-label="' + esc(T('del') + ': ' + vName(v)) + '">' + ico('x') + '</button></div>';
    }).join('') + '<p class="rz-p sm">' + esc(T('vmMax', { n: S.VESSEL_MAX })) + '</p>' : '<p class="rz-p">' + esc(T('vmEmpty')) + '</p><p class="rz-p sm">' + esc(T('vmGuide')) + '</p><button type="button" class="rz-btn primary full" data-act="tplgoadd">' + esc(T('tplAddFood')) + '</button>') + '<div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="sheetclose">' + esc(T('close')) + '</button></div>';
  }
  function vmOpen() { openSheet('vess', vmHtml()); }
  function vmEdit(id) {
    var v = S.vesselById(st, id); if (!v) return; vm = { id: id };
    setSheet('<div class="rz-sh-h sl-ph"><button type="button" class="rz-x" data-act="vmback" aria-label="' + esc(T('back')) + '">' + ico('back') + '</button><b>' + esc(T('vmEdit')) + '</b><span></span></div>' +
      '<label class="rz-f" for="vmName"><span>' + esc(T('vmName')) + '</span><input id="vmName" type="text" maxlength="30" autocomplete="off" value="' + esc(vName(v)) + '"></label><div class="rz-fl">' + esc(T('vmFam')) + '</div>' +
      Object.keys(v.fam).map(function (k, i) { var f = foodById(k); return numFld('vmg' + i, (f ? nameOf(f) : k) + ' (' + T('gram') + ')', String(v.fam[k]), '', 'numeric'); }).join('') + '<div class="rz-actions sl-sticky"><button type="button" class="rz-btn ghost danger" data-act="vdel" data-id="' + id + '">' + esc(T('del')) + '</button><button type="button" class="rz-btn primary" data-act="vedsave">' + esc(T('vcSave')) + '</button></div>');
  }
  function vmSave() {
    var v = vm && S.vesselById(st, vm.id); if (!v) return; var nm = $('#vmName').value.trim(), keys = Object.keys(v.fam), ng = {}, bad = false;
    keys.forEach(function (k, i) { var g = Math.round(num($('#vmg' + i).value)); if (g >= 10 && g <= 3000) ng[k] = g; else { bad = true; flashEl($('#vmg' + i)); } });
    if (bad) { toast(T('vcBad')); return; } if (!nm) { flashEl($('#vmName')); return; }
    v.fam = ng; v.name = nm === T('vn_' + v.kind) ? undefined : nm; if (v.kind === 'custom' && !v.name) v.name = nm; save(); setSheet(vmHtml()); toast(T('saved'), null, true);
  }
  function vmDel(id) {
    var r = S.removeVessel(st, id); if (!r) return; save(); if (kit.sheetKind() === 'vess') setSheet(vmHtml());
    toast(T('vmDel1'), function () { var l = st.vessels || (st.vessels = []); l.splice(Math.min(r.i, l.length), 0, r.v); save(); if (kit.sheetKind() === 'vess') setSheet(vmHtml()); });
  }
  var tm = null;
  function tplSuggest(m) { var k = ({ b: 'S', l: 'L', d: 'D', s: 'T' })[m]; return [T('tpl' + k + '0'), T('tpl' + k + '1'), T('tplS2')]; }
  function entryToTpl(e) {
    var f = e.fid ? foodById(e.fid) : null; return { fid: e.fid || null, n: f ? nameOf(f) : (e.name || ''), unit: e.unit, qty: e.qty, g: e.g, kcal: e.kcal, p: e.p, f: e.f, c: e.c, est: !!e.est, vr: e.vr, sz: e.sz, vn: e.vn, vf: e.vf };
  }
  var MEAL_EM = { b: '🍳', l: '🍲', d: '🌙', s: '🍎' };
  function tplTodayHtml(date) {                      // bugungi yozilgan bo'limlar: bir bosishda saqlash
    var x = S.dayOf(st, date), rows = (x ? S.MEALS : []).map(function (m) {
      var l = x.food.filter(function (e) { return e.meal === m; }); if (!l.length) return '';
      return '<div class="sl-tr"><span class="m"><b>' + MEAL_EM[m] + ' ' + esc(mealName(m)) + '</b><span>' + esc(T('tplTodayRow', { n: l.length, k: fmt(S.sumEntries(l).kcal) })) + '</span></span><button type="button" class="rz-btn sm" data-act="tplsave" data-m="' + m + '" data-d="' + date + '">' + esc(T('tplSaveS')) + '</button></div>';
    }).join('');
    return rows ? '<div class="rz-fl">' + esc(T('tplToday')) + '</div>' + rows : '<p class="rz-p">' + esc(T('tplNoToday')) + '</p><button type="button" class="rz-btn primary full" data-act="tplgoadd">' + esc(T('tplAddFood')) + '</button>';
  }
  function tplSugHtml() {                            // avtomatik taklif: tez-tez birga yeyiladigan taomlar
    var g = S.suggestTemplate(st, todayStr()); if (!g) return ''; tmSug = g;
    var names = g.ids.map(function (id) { var f = foodById(id); return f ? nameOf(f) : id; }).join(', ');
    return '<div class="sl-sug" id="tplSug"><p>' + esc(T('tplSugT', { x: names })) + '</p><div class="rz-actions"><button type="button" class="rz-btn ghost sm" data-act="tplsugno">' + esc(T('tplNo')) + '</button><button type="button" class="rz-btn primary sm" data-act="tplsugsave">' + esc(T('tplSaveS')) + '</button></div></div>';
  }
  var tmSug = null;
  function tplBar() {
    var yb = S.kechagidekOk(st, fd.date, fd.meal), l = st.tpls || [];
    return tplSugHtml() + '<div class="sl-tpl" id="tplBar" role="group" aria-label="' + esc(T('tplBar')) + '">' + (yb ? '<button type="button" class="rz-chip on" data-act="yday2">' + ico('undo') + ' ' + esc(T('tplYest')) + '</button>' : '') +
      l.map(function (t) { return '<button type="button" class="rz-chip" data-act="tplopen" data-id="' + t.id + '">' + esc(t.name) + '</button>'; }).join('') + (l.length ? '' : '<button type="button" class="rz-chip" data-act="tplhelp">' + ico('star') + ' ' + esc(T('tplBar')) + '</button>') + '</div>';
  }
  function tplHelpHtml() {
    return '<div class="rz-sh-h sl-ph"><button type="button" class="rz-x" data-act="fback" aria-label="' + esc(T('back')) + '">' + ico('back') + '</button><b>' + esc(T('tplBar')) + '</b><span></span></div><p class="rz-p">' + esc(T('tplEmpty')) + '</p>' + tplSugHtml() + tplTodayHtml(fd.date);
  }
  function tplToItems(list) {                       // shablon/kecha yozuvlari → porsiya oynasi qatorlari
    return list.map(function (x) {
      var f = x.fid ? foodById(x.fid) : null, vr = x.vr || null, fam = null;
      if (f && f.al) { var bf = foodById(f.al.f); if (bf) { vr = vr || f.al.v; f = bf; } }
      if (f && f.fam) { fam = f; f = S.famVariant(fam, S.famSelOf(fam, vr), x.sz || null); }
      var ux = x.unit, qty = x.qty > 0 ? x.qty : 1, vkx = f ? (fam ? fam.fam.id : f.id) : null;
      if (ux && String(ux).indexOf('v:') === 0) { var vv = S.vesselById(st, +String(ux).slice(2)); if (!(vv && vkx && vv.fam[vkx] > 0)) { ux = 'g100'; qty = x.g > 0 ? Math.round(x.g) : 100; } }       // idish o'chirilgan: saqlangan gramm bilan
      var ok = f && (vOf(ux) || f.u.some(function (u) { return u[0] === ux; }));
      if (ok) { if (ux === 'g100' && qty < 5 && x.g > 5) qty = x.g; var it = { name: nameOf(fam || f), fid: (fam || f).id, food: f, unit: ux, qty: qty, est: !!f.e, ai: false, vfill: vOf(ux) ? (x.vf || 'tola') : undefined }; if (fam) { it.fam = fam; it.sel = S.famSelOf(fam, vr); it.szid = x.sz || fam.fam.sz && fam.fam.sz.d || null; it.vr = f.vr; it.sz = f.sz; var lb = S.famLabel(fam, f.vr, it.szid, lang); if (lb) it.name += ' · ' + lb; } itSync(it); return it; }
      var m = /^(.*?)\s*\(([^)]*)\)\s*$/.exec(x.n || ''), nm = m ? m[1] : (x.n || '?'), it2 = { name: nm, fid: null, food: null, unit: 'pc', qty: 1, est: true, ai: false, ptxt: m ? m[2] : '', base: { g: x.g || 0, kcal: x.kcal, p: x.p || 0, f: x.f || 0, c: x.c || 0 } };
      it2.g = x.g || 0; it2.kcal = x.kcal; it2.p = x.p || 0; it2.f = x.f || 0; it2.c = x.c || 0; return it2;
    });
  }
  function tplHtml() {
    var on = fd.items.filter(function (i) { return !i.off; }).length;
    return '<div class="rz-sh-h sl-ph"><button type="button" class="rz-x" data-act="fback" aria-label="' + esc(T('back')) + '">' + ico('back') + '</button><b>' + esc(fd.tplT || '') + '</b><span></span></div>' + itRows(fd.items, true) +
      '<div class="rz-fl">' + esc(T('pMeal')) + '</div>' + mealChips(fd.meal, 'fmeal3') + '<p class="rz-p sm">' + esc(T('tHelp')) + '</p>' +
      '<div class="rz-actions sl-sticky"><button type="button" class="rz-btn primary" data-act="txsave"' + (on ? '' : ' disabled') + '>' + esc(T('tplAdd', { n: on })) + '</button></div>';
  }
  function tplShow(title, raw) {
    fd.mode = 'tpl'; fd.tplT = title; var go = function () { fd.items = tplToItems(raw); setSheet(tplHtml()); };
    if (dbState === 2) go(); else loadDb(function () { if (fd && kit.sheetKind() === 'add') go(); });
  }
  function tplNameHtml() {
    return shHead(T('tplSave1')) + '<div class="rz-fl">' + esc(T('tplNameT')) + '</div><div class="rz-chips sl-tsg">' + tplSuggest(tm.m).map(function (n) { return '<button type="button" class="rz-chip" data-act="tplname" data-n="' + esc(n) + '">' + esc(n) + '</button>'; }).join('') + '</div>' +
      '<label class="rz-f" for="tplNm"><span>' + esc(T('tplNameIn')) + '</span><input id="tplNm" type="text" maxlength="40" autocomplete="off" enterkeyhint="done" value=""></label><div class="rz-actions sl-sticky"><button type="button" class="rz-btn primary" data-act="tplsave2">' + esc(T('save')) + '</button></div>';
  }
  function tplSaveAs(name) {
    var x = S.dayOf(st, tm.d), list = tm.items || (x ? x.food.filter(function (e) { return e.meal === tm.m; }) : []);
    var t = S.addTemplate(st, name, list.map(entryToTpl), tm.m); if (!t) { toast(T('tplFull')); return; }
    var back = tm.back; vib();
    if (back === 'tpls') { save(); setSheet(tplsHtml()); render(); }
    else if (back === 'add') { save(); render(); fd.mode = 'search'; fd.food = null; setSheet(searchHtml()); catsInit(); refreshRes(dbState === 0); }
    else { kit.closeSheet(); commit(); }
    toast(T('tplSaved', { x: t.name }), null, true);
  }
  function tplStartSave(m, d, items) {
    var ctx = kit.sheetKind() === 'tpls' ? 'tpls' : (kit.sheetKind() === 'add' ? 'add' : null);
    if ((st.tpls || []).length >= S.TPL_MAX) { toast(T('tplFull')); return; }
    tm = { m: m, d: d, items: items || null, back: ctx }; if (ctx) setSheet(tplNameHtml()); else openSheet('mmenu', tplNameHtml());
  }
  function tplsHtml() {
    var l = st.tpls || [];
    return shHead(T('tplMine')) + (l.length ? l.map(function (t, i) {
      return '<div class="sl-tr"><span class="m"><b>' + esc(t.name) + '</b><span>' + esc(T('tplCnt', { n: t.items.length, k: fmt(S.tplKcal(t)) })) + '</span></span>' +
        '<button type="button" class="rz-x" data-act="tplup" data-id="' + t.id + '" aria-label="' + esc(T('tplUp') + ': ' + t.name) + '"' + (i === 0 ? ' disabled' : '') + '>' + ico('chev', 'up') + '</button>' +
        '<button type="button" class="rz-x" data-act="tpldn" data-id="' + t.id + '" aria-label="' + esc(T('tplDown') + ': ' + t.name) + '"' + (i === l.length - 1 ? ' disabled' : '') + '>' + ico('chev', 'dn') + '</button>' +
        '<button type="button" class="rz-x" data-act="tplren" data-id="' + t.id + '" aria-label="' + esc(T('tplRen') + ': ' + t.name) + '">' + ico('pen') + '</button>' +
        '<button type="button" class="rz-x" data-act="tpldel" data-id="' + t.id + '" aria-label="' + esc(T('del') + ': ' + t.name) + '">' + ico('x') + '</button></div>';
    }).join('') : '<p class="rz-p">' + esc(T('tplEmpty')) + '</p>') + tplSugHtml() + (l.length ? '' : tplTodayHtml(todayStr())) + '<div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="sheetclose">' + esc(T('close')) + '</button></div>';
  }
  function tplsOpen() { openSheet('tpls', tplsHtml()); }
  function famOpen(o, f, sel, szid) {                // oila: o.fam (oila taomi), o.sel (omillar), o.szid (o'lcham); o.food — tanlangan kombinatsiya (oddiy taom ko'rinishi)
    o.fam = f; o.sel = sel; o.szid = szid || (f.fam.sz ? f.fam.sz.d : null); o.food = S.famVariant(f, o.sel, o.szid);
  }
  function defUnit(food) { var d = (food.b || []).filter(function (x) { return x.d; })[0]; return d && food.u.some(function (u) { return u[0] === d.k; }) ? d.k : food.u[0][0]; }
  function pickFood(id, pick) {
    var f = foodById(id); if (!f) { loadDb(function () { pickFood(id, pick); }); return; }
    fd.fam = null; fd.sel = null; fd.szid = null; fd.favId = null;
    if (f.al) { var bf = foodById(f.al.f); if (bf) { fd.favId = f.id; pick = S.famSelOf(bf, f.al.v); f = bf; } }
    if (f.fam) { famOpen(fd, f, Object.assign(S.famDefault(f), pick || {})); }
    else fd.food = f;
    fd.base = null; fd.mode = 'portion'; fd.unit = defUnit(fd.food); fd.qty = fd.unit === 'g100' ? 100 : 1; fd.editId = null; fd.vfill = 'tola'; fd.vsugShown = null;
    var vs0 = S.vesselsFor(st, vkey(fd)); if (vs0.length) { fd.unit = 'v:' + vs0[0].id; fd.qty = 1; }             // shu oila uchun «Mening idishim» bor — oldindan tanlangan
    var le = lastFor(vkey(fd)); if (le) pwApplyLast(le.e, pick);
    setSheet(portionHtml());
  }
  function pwApplyLast(e, pick) {                        // shu taomning OXIRGI porsiyasi (va omillari) — boshlang'ich qiymat
    if (fd.fam && !pick) famOpen(fd, fd.fam, S.famSelOf(fd.fam, e.vr || null), e.sz || null);
    var ok = vOf(e.unit) ? S.vesselsFor(st, vkey(fd)).some(function (v) { return 'v:' + v.id === e.unit; }) : fd.food.u.some(function (u) { return u[0] === e.unit; });
    if (!ok) return; fd.unit = e.unit; fd.qty = e.qty > 0 ? e.qty : 1; if (e.unit === 'g100' && e.qty < 5 && e.g > 5) fd.qty = e.g; if (vOf(e.unit)) fd.vfill = e.vf || 'tola';
  }
  function quickAdd(d, id) {                             // Oxirgilar [+]: oxirgi porsiya bilan shu zahoti (1 bosish)
    var x = S.dayOf(st, d), e = x && x.food.filter(function (y) { return y.id === id; })[0]; if (!e) return; var o = {};
    ['fid', 'name', 'unit', 'qty', 'g', 'kcal', 'p', 'f', 'c', 'est', 'vr', 'sz', 'vn', 'vf'].forEach(function (k) { if (e[k] != null) o[k] = e[k]; }); o.meal = fd.meal; o.ts = nowTs();
    var date = fd.date, it = S.addFood(st, date, o), f = e.fid ? foodById(e.fid) : null, nm = e.name || (f ? nameOf(f.al ? (foodById(f.al.f) || f) : f) : '');
    kit.closeSheet(); commit(); vib(); toast(T('aAdded', { x: nm + ' · ' + entUnitTxt(e) }), function () { rowOut(it.id, function () { S.removeFood(st, date, it.id); commit(); }); }, true); afterWater(); jokeAfter('food');
  }
  function portionHtml() {
    var f = fd.food, fav = f && st.favs.indexOf(f.id) > -1, nm = f ? nameOf(f) : (fd.name || '');
    return '<div class="rz-sh-h sl-ph"><button type="button" class="rz-x" data-act="fback" aria-label="' + esc(T('back')) + '">' + ico('back') + '</button><b>' + esc(T('aT')) + '</b>' + (f && !f.custom ? '<button type="button" class="rz-x' + (fav ? ' fav' : '') + '" data-act="ffav" aria-label="' + esc(T('aFav')) + '" aria-pressed="' + fav + '">' + ico('heart') + '</button>' : (f ? '<button type="button" class="rz-x' + (fav ? ' fav' : '') + '" data-act="ffav" aria-label="' + esc(T('aFav')) + '" aria-pressed="' + fav + '">' + ico('heart') + '</button>' : '<span></span>')) + '</div>' +
      vSugHtml() + pwBody(fd) + mealChips(fd.meal, 'fmeal') +
      '<div class="rz-actions sl-sticky">' + (fd.editId != null ? '<button type="button" class="rz-btn ghost danger" data-act="fdel">' + esc(T('del')) + '</button>' : '') + '<button type="button" class="rz-btn primary" id="fsave" data-act="fsave">' + esc(T(fd.editId != null ? 'pSave' : 'pAddBtn')) + '</button></div>';
  }
  function fSave() {
    var f = fd.food, pt = pwCalc(fd);
    if (fd.editId != null) {
      var x = S.dayOf(st, fd.date), e = x && x.food.filter(function (y) { return y.id === fd.editId; })[0];
      if (e) {
        e.meal = fd.meal; e.g = pt.g; e.kcal = pt.kcal; e.p = pt.p; e.f = pt.f; e.c = pt.c;
        if (f) { e.fid = f.id; e.name = f.custom ? f.n : null; e.unit = fd.unit; e.qty = fd.qty; e.est = !!f.e; var ev = vOf(fd.unit); if (ev) { e.vn = vName(ev); e.vf = fd.vfill || 'tola'; } else { delete e.vn; delete e.vf; } if (fd.fam) { e.vr = f.vr; if (fd.fam.fam.sz) e.sz = fd.szid; else delete e.sz; } else { delete e.vr; delete e.sz; } } else { e.unit = null; e.qty = 1; }
      }
      kit.closeSheet(); commit(); vib(); toast(T('saved'), null, true); return;
    }
    var it = S.addFood(st, fd.date, { fid: f.id, name: f.custom ? f.n : null, meal: fd.meal, unit: fd.unit, qty: fd.qty, g: pt.g, kcal: pt.kcal, p: pt.p, f: pt.f, c: pt.c, est: !!f.e, ts: nowTs(), vr: fd.fam ? f.vr : null, sz: fd.fam && fd.fam.fam.sz ? fd.szid : null, vn: vOf(fd.unit) ? vName(vOf(fd.unit)) : null, vf: vOf(fd.unit) ? (fd.vfill || 'tola') : null });
    var date = fd.date; kit.closeSheet(); commit(); vib(); toast(T('saved'), function () { rowOut(it.id, function () { S.removeFood(st, date, it.id); commit(); }); }, true);
    afterWater(); jokeAfter('food');
  }
  function rowOut(id, cb) { var el = $('.sl-row[data-id="' + id + '"]'); if (el && !reduce) { el.classList.add('rz-gone'); setTimeout(cb, 230); } else cb(); }
  function openEdit(date, id) {
    var x = S.dayOf(st, date), e = x && x.food.filter(function (y) { return y.id === id; })[0]; if (!e) return;
    var f = e.fid ? foodById(e.fid) : null, vr = e.vr || null;
    if (f && f.al) { var bf = foodById(f.al.f); if (bf) { vr = vr || f.al.v; f = bf; } }       // eski id (alias) → oila + shu omillar oldindan tanlangan
    fd = { date: date, meal: e.meal, mode: 'portion', q: '', cat: '', food: f, unit: e.unit, qty: e.qty, editId: id, items: [], name: e.name || '' };
    if (f && f.fam) famOpen(fd, f, S.famSelOf(f, vr), e.sz || null);
    fd.vfill = e.vf || 'tola';
    var unitOk = fd.food && (vOf(e.unit) ? S.vesselsFor(st, vkey(fd)).some(function (v) { return 'v:' + v.id === e.unit; }) : fd.food.u.some(function (u) { return u[0] === e.unit; }));
    if (unitOk) {
      if (e.unit === 'g100' && e.qty < 5 && e.g > 5) fd.qty = e.g;
      var ug = pwUg(fd, e.unit);                         // birlik grammi o'zgargan bo'lsa saqlangan gramm asos: kkal o'zgarmaydi
      if (e.unit !== 'g100' && ug > 0 && e.g > 0 && Math.abs(ug * fd.qty - e.g) > Math.max(1.5, e.g * 0.01)) fd.qty = Math.max(0.01, Math.round(e.g / ug * 100) / 100);
      openSheet('add', '', { noFocus: true }); setSheet(portionHtml()); return;
    }
    fd.food = null; fd.fam = null; fd.unit = 'pc'; fd.qty = 1; fd.est = true;                    // baza topilmadi / AI yozuvi: shu yozuvning o'zi asos (×porsiya)
    fd.base = { g: e.g || 0, kcal: e.kcal, p: e.p || 0, f: e.f || 0, c: e.c || 0 };
    openSheet('add', '', { noFocus: true }); setSheet(portionHtml());
  }
  function fDelete() { var d = fd.date, id = fd.editId; kit.closeSheet(); rowOut(id, function () { var rm = S.removeFood(st, d, id); commit(); toast(T('del1'), function () { S.restoreFood(st, d, rm); commit(); }); }); }

  /* ---------- o'z taomim ---------- */
  function numFld(id, label, val, ph, mode) { return '<label class="rz-f" for="' + id + '"><span>' + esc(label) + '</span><input id="' + id + '" type="text" inputmode="' + (mode || 'decimal') + '" autocomplete="off" placeholder="' + esc(ph || '') + '" value="' + esc(val || '') + '"></label>'; }
  function openCustom(name) {
    fd.mode = 'custom'; var sugNote = fd.suggest ? '<p class="rz-p sm">' + esc(T('aSugNote')) + '</p>' : '';
    setSheet(shHead(T('cT')) + '<label class="rz-f" for="cuName"><span>' + esc(T('cName')) + '</span><input id="cuName" type="text" maxlength="60" value="' + esc(name || '') + '" placeholder="' + esc(T('cName')) + '"></label>' + numFld('cuK', T('cKcal'), '', '0', 'numeric') + numFld('cuG', T('cG'), '', '', 'numeric') + numFld('cuP', T('cP'), '', '') + numFld('cuF', T('cF'), '', '') + numFld('cuC', T('cC'), '', '') + sugNote +
      '<div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="fback">' + esc(T('back')) + '</button><button type="button" class="rz-btn primary" data-act="cusave">' + esc(T('save')) + '</button></div>');
  }
  function cuSave() {
    var name = $('#cuName').value.trim(), k = num($('#cuK').value), g = num($('#cuG').value) || 100, m = 100 / g;
    if (!name) { flashEl($('#cuName')); return; } if (!(k > 0)) { flashEl($('#cuK')); return; }
    var f = S.addCustom(st, { name: name, k: k * m, p: num($('#cuP').value) * m, f: num($('#cuF').value) * m, c: num($('#cuC').value) * m, g: g }); if (!f) return; save();
    if (fd.suggest) { fd.suggest = false; sendTaklif({ name: name, ptxt: fmt(g) + ' ' + T('gram'), kcal: k, p: num($('#cuP').value), f: num($('#cuF').value), c: num($('#cuC').value), ai: true }); }
    fd.food = f; fd.mode = 'portion'; fd.unit = f.u[0][0]; fd.qty = 1; setSheet(portionHtml());
  }

  /* ---------- matn bilan qo'shish (lokal + AI) ---------- */
  function openText(date, keep) {
    fd = keep && fd ? fd : { date: date || todayStr(), meal: S.mealByHour(new Date().getHours()), q: '', cat: '', items: [] };
    if (date) fd.date = date; if (!fd.date) fd.date = todayStr(); fd.mode = 'text'; fd.items = []; fd.missing = []; fd.busy = false; fd.txt = '';
    if (kit.sheetKind() === 'add') setSheet(textHtml()); else openSheet('add', textHtml()); loadDb();
  }
  function textHtml() {
    var offline = navigator.onLine === false, items = fd.items;
    var h = shHead(T('tT')) + '<input id="txQ" class="sl-ta" type="text" autocomplete="off" autocapitalize="off" enterkeyhint="done" placeholder="' + esc(T('tPh')) + '" aria-label="' + esc(T('tT')) + '" value="' + esc(fd.txt || '') + '"><div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="fback">' + esc(T('back')) + '</button><button type="button" class="rz-btn primary" data-act="txgo">' + esc(T('tGo')) + '</button></div><div id="txOut">' + textOut() + '</div>';
    return h;
  }
  function itRows(items, tpl) {
    return items.map(function (it, i) { var ap = it.ai || (it.base && !it.food); return '<div class="sl-ti' + (tpl && it.off ? ' off' : '') + '">' + (tpl ? '<button type="button" class="sl-chk' + (it.off ? '' : ' on') + '" data-act="tplchk" data-i="' + i + '" role="checkbox" aria-checked="' + !it.off + '" aria-label="' + esc(T('tplChk') + ': ' + it.name) + '">' + ico('check', '', 3) + '</button>' : '') + '<button type="button" class="sl-tib" data-act="itedit" data-i="' + i + '" aria-label="' + esc(T('pwEditRow', { x: it.name })) + '"><span class="m"><span class="nm">' + esc(it.name) + '</span><span class="tm">' + esc(it.ptxt || '') + (it.ai ? ' · ' + esc(it.photo ? T('phApprox') : T('tAiTag')) : (ap ? ' · ' + esc(T('aEst')) : '')) + '</span></span><b>' + (ap ? '≈ ' : '') + fmt(it.kcal) + '<small> ' + T('kcal') + '</small></b>' + ico('pen', 'sl-pen') + '</button>' + (tpl ? '' : '<button type="button" class="rz-x" data-act="txdel" data-i="' + i + '" aria-label="' + esc(T('del')) + '">' + ico('x') + '</button>') + '</div>'; }).join('');
  }
  function textOut() {
    var items = fd.items, h = '', offline = navigator.onLine === false;
    if (fd.parsed && !items.length && !(fd.missing || []).length) h += '<div class="rz-mut">' + esc(T('tEmpty')) + '</div>';
    h += itRows(items);
    if ((fd.missing || []).length) {
      h += '<p class="rz-p warn">' + esc(T('tMiss', { x: fd.missing.join(', ') })) + '</p>';
      h += offline ? '<p class="rz-p sm">' + esc(T('tOffline')) + '</p>' : '<button type="button" class="rz-btn ghost full" data-act="txai"' + (fd.busy ? ' disabled' : '') + '>' + esc(fd.busy ? T('tAiBusy') : T('tAi')) + '</button><p class="rz-p sm">' + esc(T('tAiNote')) + '</p>';
    }
    if (fd.aiErr) h += '<p class="rz-p warn">' + esc(T(fd.aiErr === 'busy' ? 'tAiSite' : 'tAiErr')) + '</p>';
    if (items.length) h += '<div class="rz-fl">' + esc(T('pMeal')) + '</div>' + mealChips(fd.meal, 'fmeal3') + '<p class="rz-p sm">' + esc(T('tHelp')) + (items.some(function (x) { return x.ai; }) ? ' ' + esc(T('tkNote')) : '') + '</p><div class="rz-actions sl-sticky"><button type="button" class="rz-btn primary" data-act="txsave">' + esc(T('pwAll', { n: items.length })) + '</button></div>';
    return h;
  }
  function txRefresh() { var o = $('#txOut'); if (o) o.innerHTML = textOut(); }
  function txGo() {
    fd.txt = $('#txQ').value; var run = function () {
      var r = S.parseText(fd.txt, allFoods(), { recents: st.recents, favs: st.favs, freq: S.freqMap(st, todayStr(), 30, dbAlias), vessels: st.vessels }); fd.parsed = true; fd.aiErr = false;
      fd.items = r.items.map(function (x) { var it = { name: nameOf(x.fam || x.food), fid: x.fid, food: x.food, unit: x.unit, qty: x.unit === 'g100' ? Math.round(x.g) : x.qty, est: x.est, ai: false, vfill: x.vfill }; if (x.fam) { it.fam = x.fam; it.sel = x.sel; it.szid = x.szid; it.vr = x.vr; it.sz = x.sz; var lb = S.famLabel(x.fam, x.vr, x.szid, lang); if (lb) it.name += ' · ' + lb; } itSync(it); return it; });
      fd.missing = r.missing; txRefresh();
    };
    if (dbState === 2) run(); else loadDb(function () { run(); });
  }
  function cid() { try { var c = lsGet(LS_CID); if (!c) { c = (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (ch) { var r = Math.random() * 16 | 0; return (ch === 'x' ? r : (r & 3 | 8)).toString(16); })); localStorage.setItem(LS_CID, c); } return c; } catch (e) { return ''; } }
  function aiItem(o) {                               // AI javobini bazaga moslash: nom + porsiya → eng yaqin taom/oila/birikma; kkal AI bilan ±50…160% ichida bo'lsa baza qiymati (aks holda AI «taxminiy»)
    try {
      var r = S.parseText(String(o.porsiya || '') + ' ' + String(o.nom || '').split(' · ')[0], allFoods(), { recents: st.recents, favs: st.favs, freq: S.freqMap(st, todayStr(), 30, dbAlias), vessels: st.vessels });
      if (r.items.length !== 1 || r.missing.length) return null; var x = r.items[0], pt = S.portion(x.food, x.g);
      if (!o.fid && !(o.kcal > 0 && pt.kcal >= o.kcal * 0.5 && pt.kcal <= o.kcal * 1.6)) return null;
      var it = { name: nameOf(x.fam || x.food), fid: x.fid, food: x.food, unit: x.unit, qty: x.unit === 'g100' ? Math.round(x.g) : x.qty, est: x.est, ai: false, fromAi: true, vfill: x.vfill };
      if (x.fam) { it.fam = x.fam; it.sel = x.sel; it.szid = x.szid; it.vr = x.vr; it.sz = x.sz; var lb = S.famLabel(x.fam, x.vr, x.szid, lang); if (lb) it.name += ' · ' + lb; } itSync(it); return it;
    } catch (e) { return null; }
  }
  function txAi() {
    if (fd.busy || !fd.missing.length) return; fd.busy = true; fd.aiErr = false; txRefresh();
    var body = { matn: fd.missing.join(', ').slice(0, 300), til: isCyr() ? 'kirill' : lang, mijoz_id: cid() };
    fetch('/api/kalkifit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); }).then(function (res) {
      fd.busy = false; if (!res.ok || !res.j || !res.j.ovqatlar) { fd.aiErr = res.j && res.j.sabab === 'sayt' ? 'busy' : true; txRefresh(); return; }
      res.j.ovqatlar.forEach(function (o) { var m = aiItem(o); if (m) { fd.items.push(m); return; } fd.items.push({ name: o.nom, fid: null, food: null, unit: 'pc', qty: 1, g: o.g || 0, kcal: Math.round(o.kcal), p: o.o, f: o.y, c: o.u, est: true, ai: true, ptxt: o.porsiya || '', base: { g: o.g || 0, kcal: Math.round(o.kcal), p: o.o || 0, f: o.y || 0, c: o.u || 0 } }); });
      fd.missing = []; txRefresh();
    }).catch(function () { fd.busy = false; fd.aiErr = true; txRefresh(); });
  }
  function txSave() {
    var list = fd.items.filter(function (i) { return !i.off; }), n = list.length, date = fd.date, ids = []; if (!n) return;
    list.forEach(function (it) {
      sendTaklif(it); var db1 = !!it.food, e = S.addFood(st, date, { vr: it.vr, sz: it.sz, vn: vOf(it.unit) ? vName(vOf(it.unit)) : null, vf: vOf(it.unit) ? (it.vfill || 'tola') : null, fid: it.fid || null, name: it.fid ? (it.food && it.food.custom ? it.name : null) : it.name, meal: fd.meal, unit: db1 ? it.unit : null, qty: db1 ? it.qty : 1, g: it.g, kcal: it.kcal, p: it.p, f: it.f, c: it.c, est: it.est, ts: nowTs() });
      ids.push(e.id); if (!it.fid) e.name = it.name + (it.ptxt ? ' (' + it.ptxt + ')' : '');
    });
    kit.closeSheet(); commit(); vib(); toast(T('saved') + ': ' + n, function () { ids.forEach(function (id) { S.removeFood(st, date, id); }); commit(); }, true);
  }

  /* ---------- qadam ---------- */
  var sp = null;
  function openSteps(date, goal) {
    date = date || todayStr(); var cur = goal ? st.stepGoal : (S.dayOf(st, date) || { steps: 0 }).steps;
    sp = { date: date, val: '', goal: !!goal, cur: cur };
    openSheet('steps', shHead(goal ? T('stGoalSet') : (date === todayStr() ? T('stepsT') : T('stepsOf', { d: kit.dLabel(date) }))) + '<p class="rz-p sm">' + esc(goal ? '' : T('stEnter')) + '</p><div class="rz-amt" id="spAmt"><span id="spNum">0</span></div><p class="rz-mut sm" id="spHint">' + (cur ? esc(fmt(cur)) : '') + '</p>' + kit.padHtml('int000') + '<div class="rz-actions"><button type="button" class="rz-btn primary" id="spSave" data-act="spsave" disabled>' + esc(T('save')) + '</button></div>');
  }
  function spUpdate() { $('#spNum').textContent = sp.val ? fmt(+sp.val) : '0'; $('#spSave').disabled = !sp.val; }
  function afterWater() { /* qadam/suv/ovqat saqlangach sokin bayram tekshiruvi */ var t = todayStr(), x = S.dayOf(st, t); if (!x) return; var p = prefs(); if (!p.cel || p.cel.d !== t) p.cel = { d: t }; var pl = planNow();
    if (x.water >= pl.water.glasses && !p.cel.w) { p.cel.w = 1; save(); celebrate('wCard', T('wDone')); }
    if (x.steps >= st.stepGoal && !p.cel.s) { p.cel.s = 1; save(); celebrate('kcalBtn', T('sGoalDone')); } }
  function celebrate(id, msg) { setTimeout(function () { var el = document.getElementById(id) && $('#' + id); if (el) { el.classList.remove('glow'); void el.offsetWidth; el.classList.add('glow'); } toast(msg, null, true); vib(25); }, 350); }
  function spSave() {
    var v = +sp.val; if (sp.goal) { st.stepGoal = Math.max(1000, Math.min(100000, v)); } else S.setSteps(st, sp.date, v);
    kit.closeSheet(); commit(); vib(); toast(T('saved'), null, true); if (!sp.goal) afterWater();
  }

  /* ---------- vazn ---------- */
  var wf = null;
  function openWeight() {
    wf = { val: dec(S.currentWeight(st), 1) };
    openSheet('weight', shHead(T('wtT')) + '<div class="rz-amt" id="wfAmt"><span id="wfNum">' + esc(wf.val) + '</span><small> ' + KG() + '</small></div>' + kit.padHtml('dec') + kit.dpHtml('wfDate', T('wDay'), todayStr(), 'past', null, todayStr()) + '<div class="rz-actions"><button type="button" class="rz-btn primary" data-act="wfsave">' + esc(T('save')) + '</button></div>');
    wf.val = '';
  }
  function wfSave() {
    var kg = num(wf.val.replace(',', '.')), d = kit.dpGet('wfDate') || todayStr(); if (!S.addWeight(st, d, kg)) { flashEl($('#wfAmt')); return; }
    st.profile.weight = S.currentWeight(st); kit.closeSheet(); commit(); vib(); toast(T('saved'), null, true);
  }

  /* ---------- profil tahriri ---------- */
  var pe = null;
  function openProfile() {
    var p = st.profile; pe = { sex: p.sex, preg: p.preg, act: p.act, goal: p.goal };
    openSheet('prof', profHtml(p));
  }
  function profHtml(p) {
    var lock = S.restrictions({ age: num(p.age), sex: pe.sex, preg: pe.preg, weight: num(p.weight), height: num(p.height) }).keepOnly;
    return shHead(T('meEdit')) + '<div class="rz-fl">' + esc(T('pfSex')) + '</div><div class="rz-seg"><button type="button" data-act="pesex" data-v="m"' + (pe.sex === 'm' ? ' class="on"' : '') + '>' + esc(T('male')) + '</button><button type="button" data-act="pesex" data-v="f"' + (pe.sex === 'f' ? ' class="on"' : '') + '>' + esc(T('female')) + '</button></div>' +
      (pe.sex === 'f' ? '<label class="rz-chk"><input type="checkbox" id="peP"' + (pe.preg ? ' checked' : '') + '><span>' + esc(T('preg')) + '</span></label>' : '') +
      numFld('peA', T('pfAge'), p.age, '', 'numeric') + numFld('peH', T('pfH'), p.height, '', 'numeric') + numFld('peW', T('pfW'), dec(num(p.weight), 1), '') + numFld('peG', T('meGoalW'), p.goalWeight ? dec(p.goalWeight, 1) : '', '') +
      '<div class="rz-fl">' + esc(T('pfAct')) + '</div><div class="rz-chips">' + [1, 2, 3, 4, 5].map(function (a) { return '<button type="button" class="rz-chip' + (pe.act === a ? ' on' : '') + '" data-act="peact" data-v="' + a + '">' + esc(T('a' + a)) + '</button>'; }).join('') + '</div>' +
      '<div class="rz-fl">' + esc(T('pfGoal')) + '</div><div class="rz-chips">' + ['keep', 'slow', 'lose', 'gain'].map(function (g) { var off = lock && g !== 'keep'; return '<button type="button" class="rz-chip' + (pe.goal === g ? ' on' : '') + (off ? ' off' : '') + '" data-act="pegoal" data-v="' + g + '"' + (off ? ' aria-disabled="true"' : '') + '>' + esc(T('g' + g)) + '</button>'; }).join('') + '</div>' + (lock ? '<p class="rz-p warn">' + esc(T('gLocked')) + '</p>' : '') +
      '<div class="rz-actions"><button type="button" class="rz-btn primary" data-act="pesave">' + esc(T('save')) + '</button></div>';
  }
  function peRead() { var p = {}; var e = $('#peA'); if (!e) return null; p.age = num($('#peA').value); p.height = num($('#peH').value); p.weight = num($('#peW').value); p.goalWeight = num($('#peG').value) || null; if ($('#peP')) pe.preg = $('#peP').checked; return p; }
  function peRepaint() { var cur = peRead() || {}; var p = Object.assign({}, st.profile, cur); var sh = $('#rzSheet'); var keep = sh.scrollTop; setSheet(profHtml(p)); sh.scrollTop = keep; }
  function peSave() {
    var r = peRead(), np = { sex: pe.sex, preg: pe.sex === 'f' && pe.preg, age: r.age, height: r.height, weight: r.weight, act: pe.act, goal: pe.goal, goalWeight: r.goalWeight };
    var er = S.validate(np); if (er.age) return flashEl($('#peA')); if (er.height) return flashEl($('#peH')); if (er.weight) return flashEl($('#peW'));
    st.profile = np; var d = todayStr(); if (st.weights.length === 0 || Math.abs(S.currentWeight(st) - np.weight) > 0.04) S.addWeight(st, d, np.weight);
    kit.closeSheet(); heroPrev = null; commit(); vib(); toast(T('pfSaved', { x: fmt(planNow().target) }), null, true);
  }

  /* ---------- ulashish kartasi (canvas → rasm) ---------- */
  function shareStats() {
    var t = todayStr(), from = Dt.addDays(t, -29), days = 0, steps = 0;
    Object.keys(st.days).forEach(function (d) { if (d >= from && d <= t) { var x = st.days[d]; if (x.food.length || x.steps > 0 || x.water > 0) days++; steps += x.steps || 0; } });
    var ws = st.weights.filter(function (w) { return w.d >= from && w.d <= t; }), dw = ws.length > 1 ? Math.round((ws[ws.length - 1].kg - ws[0].kg) * 10) / 10 : null;
    return { days: days, steps: steps, km: Math.round(S.distanceKm(steps, num(st.profile.height)) * 10) / 10, dw: dw };
  }
  function drawShare(sel) {
    var cv = document.createElement('canvas'); cv.width = 1080; cv.height = 1350; var c = cv.getContext('2d'), s = shareStats(), F = 'system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif';
    var g = c.createLinearGradient(0, 0, 1080, 1350); g.addColorStop(0, '#0E3B2E'); g.addColorStop(1, '#1E7A4A'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1350);
    c.fillStyle = 'rgba(255,255,255,.07)'; c.beginPath(); c.arc(920, 160, 320, 0, 7); c.fill(); c.beginPath(); c.arc(120, 1240, 260, 0, 7); c.fill();
    c.fillStyle = '#FFB38F'; c.font = '800 54px ' + F; c.fillText('KalkiFit', 90, 150); c.fillStyle = 'rgba(255,255,255,.8)'; c.font = '600 38px ' + F; c.fillText(T('shWin'), 90, 210);
    c.fillStyle = '#fff'; c.font = '800 68px ' + F; c.fillText(T('shTitle'), 90, 330);
    var rows = []; if (sel.days) rows.push([String(s.days), T('shDaysV')]); if (sel.steps) rows.push([fmt(s.steps), T('shStepsV')]); if (sel.km) rows.push([dec(s.km, 1), T('shKmV')]); if (sel.w && s.dw != null) rows.push([(s.dw > 0 ? '+' : '') + dec(s.dw, 1), T('shWV')]);
    var y = 470; rows.forEach(function (r) { c.fillStyle = '#fff'; c.font = '800 150px ' + F; c.fillText(r[0], 90, y); var w = c.measureText(r[0]).width; c.fillStyle = 'rgba(255,255,255,.85)'; c.font = '600 46px ' + F; c.fillText(r[1], 90 + w + 28, y); y += 210; });
    if (!rows.length) { c.fillStyle = 'rgba(255,255,255,.8)'; c.font = '600 44px ' + F; c.fillText(T('shNone'), 90, 480); }
    c.fillStyle = 'rgba(255,255,255,.85)'; c.font = '700 40px ' + F; c.fillText('kalki.uz/kalkifit', 90, 1260);
    return cv;
  }
  var shSel = { days: true, steps: true, km: true, w: false };
  function openShare() {
    var s = shareStats(), chk = function (k, key, extra) { return '<label class="rz-chk"><input type="checkbox" data-sh="' + key + '"' + (shSel[key] ? ' checked' : '') + (extra ? ' disabled' : '') + '><span>' + esc(T(k)) + '</span></label>'; };
    openSheet('share', shHead(T('shT')) + '<p class="rz-p sm">' + esc(T('shH')) + '</p>' + chk('shDays', 'days') + chk('shSteps', 'steps') + chk('shKm', 'km') + chk('shWeight', 'w', s.dw == null) + '<div class="sl-cvw"><canvas id="shCv" width="1080" height="1350" role="img" aria-label="' + esc(T('shT')) + '"></canvas></div><div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="shdl">' + esc(T('shDl')) + '</button><button type="button" class="rz-btn primary" data-act="shgo">' + ico('share') + ' ' + esc(T('shGo')) + '</button></div>');
    shPaint();
  }
  function shPaint() { var cv = $('#shCv'); if (!cv) return; var src = drawShare(shSel); cv.getContext('2d').drawImage(src, 0, 0); }
  function shBlob(cb) { drawShare(shSel).toBlob(cb, 'image/png'); }
  function shGo(dl) {
    shBlob(function (b) {
      if (!b) return; var f; try { f = new File([b], 'kalkifit.png', { type: 'image/png' }); } catch (e) { f = null; }
      if (!dl && f && navigator.canShare && navigator.canShare({ files: [f] })) { navigator.share({ files: [f], title: 'KalkiFit' }).catch(function () {}); return; }
      var a = document.createElement('a'), u = URL.createObjectURL(b); a.href = u; a.download = 'kalkifit.png'; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(u); a.remove(); }, 500);
    });
  }

  /* ---------- eksport / import / o'chirish ---------- */
  function doExport() {
    st.lastBackup = Date.now(); save(); var txt = S.exportState(st);
    try { var a = document.createElement('a'), u = URL.createObjectURL(new Blob([txt], { type: 'application/json' })); a.href = u; a.download = bk.fileName(); document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(u); a.remove(); }, 500); } catch (e) {}
    render(); toast(T('expDone'), null, true);
  }
  function doImport() {
    var inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'application/json,.json'; inp.style.display = 'none';
    inp.onchange = function () { var f = inp.files && inp.files[0]; if (!f) return; var r = new FileReader(); r.onload = function () { var res = S.importState(String(r.result)); if (!res.ok) { toast(T('impBad')); return; } confirmBox(T('impT'), T('impAsk'), function () { res.state.prefs = res.state.prefs || {}; res.state.setup = true; st = res.state; seenFood = null; heroPrev = null; commit(); toast(T('impOk'), null, true); }); }; r.readAsText(f); inp.remove(); };
    document.body.appendChild(inp); inp.click();
  }
  function confirmBox(title, text, yes, step2) {
    openSheet('confirm', shHead(title) + '<p class="rz-p">' + esc(text) + '</p><div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="sheetclose">' + esc(T('cancel')) + '</button><button type="button" class="rz-btn primary danger" id="cfGo">' + esc(T('confirm')) + '</button></div>');
    $('#cfGo').onclick = function () { kit.closeSheet(); if (step2) setTimeout(function () { confirmBox(title, step2, yes); }, 300); else yes(); };
  }
  function wipe() { confirmBox(T('sDel'), T('delAsk1'), function () { try { localStorage.removeItem(LS); localStorage.removeItem(OLD[LS]); } catch (e) {} st = S.emptyState(); st.prefs = {}; view = 'today'; ob = null; seenFood = null; heroPrev = null; render(); toast(T('deleted')); }, T('delAsk2')); }

  /* ---------- yo'l-yo'riq va "ilova haqida" ---------- */
  var TIPS = [{ sel: '#kcalBtn', key: 'tip1', pos: 'below' }, { sel: '#rzFab', key: 'tip2', pos: 'above', round: true }, { sel: '.rz-tab[data-v=results]', key: 'tip3', pos: 'above' }];
  function tipsStart() { kit.tipsStart(TIPS, function () { prefs().tipsDone = true; save(); var f = $('#rzFab'); if (f) try { f.focus({ preventScroll: true }); } catch (e) {} }); }
  function aboutOpen(on) {
    document.body.classList.toggle('rz-aboutopen', !!on); var a = document.getElementById('rzAbout'); if (!a) return;
    if (on) { a.scrollTop = 0; var b = document.getElementById('rzAboutBack'); if (b) try { b.focus({ preventScroll: true }); } catch (e) {} } else { var m = $('#rzMain'); if (m) try { m.focus({ preventScroll: true }); } catch (e) {} }
  }

  /* ---------- onboarding: bir savol — bir ekran ---------- */
  var OBF = { 2: 'age', 3: 'height', 4: 'weight' };
  function obNew() {
    ob = { step: 1, sex: '', preg: false, age: '', height: '', weight: '', act: 0, goal: '', anim: null };
    try {
      var imp = JSON.parse(lsGet(LS_IMPORT) || 'null');
      if (imp && typeof imp === 'object') {
        ob.sex = imp.sex === 'f' ? 'f' : (imp.sex === 'm' ? 'm' : ''); ob.age = imp.age ? String(Math.round(num(imp.age))) : ''; ob.height = imp.height ? String(Math.round(num(imp.height))) : ''; ob.weight = imp.weight ? String(num(imp.weight)).replace('.', ',') : '';
        ob.act = S.ACT[imp.act] ? +imp.act : 0; ob.goal = S.GOAL_DELTA[imp.goal] != null ? imp.goal : '';
        var er = S.validate(obProfile()); ob.step = !ob.sex ? 1 : er.age ? 2 : er.height ? 3 : er.weight ? 4 : !ob.act ? 5 : !ob.goal ? 6 : 7;
      }
    } catch (e) {}
  }
  function obProfile() { return { sex: ob.sex, preg: ob.sex === 'f' && ob.preg, age: num(ob.age), height: num(ob.height), weight: num(ob.weight), act: ob.act, goal: ob.goal || 'keep', goalWeight: null }; }
  function optBtn(act, v, title, sub, on, off) { return '<button type="button" class="rz-opt big' + (on ? ' on' : '') + (off ? ' off' : '') + '" data-act="' + act + '" data-v="' + v + '" aria-pressed="' + !!on + '"' + (off ? ' aria-disabled="true"' : '') + '><b>' + esc(title) + '</b>' + (sub ? '<span>' + esc(sub) + '</span>' : '') + '</button>'; }
  function showOnb() {
    var el = $('#rzOnb'); if (!ob) obNew();
    var s = ob.step, an = ob.anim, foot = ''; ob.anim = null;
    var h = '<div class="rz-ob-top">' + (s > 1 ? '<button type="button" class="rz-x" data-act="obback" aria-label="' + esc(T('back')) + '">' + ico('back') + '</button>' : '<span></span>') + '<div class="rz-dots">' + [1, 2, 3, 4, 5, 6].map(function (i) { return '<i class="' + (i === s ? 'on' : (i < s ? 'done' : '')) + '"></i>'; }).join('') + '</div><span></span></div><div class="rz-ob-body' + (an ? ' in-' + an : '') + '">';
    if (s === 1) { h += '<h2 class="rz-q">' + esc(T('o1q')) + '</h2>' + optBtn('obsex', 'm', T('male'), '', ob.sex === 'm') + optBtn('obsex', 'f', T('female'), '', ob.sex === 'f') + bk.restoreLink() + (ob.sex === 'f' ? '<label class="rz-chk" style="margin-top:12px"><input type="checkbox" id="obPreg"' + (ob.preg ? ' checked' : '') + '><span>' + esc(T('preg')) + '</span></label>' : ''); foot = ob.sex ? 'next' : 'next0'; }
    if (OBF[s]) { var f = OBF[s], unit = f === 'age' ? (lang === 'ru' ? 'лет' : 'yosh') : (f === 'height' ? (lang === 'ru' ? 'см' : 'sm') : (lang === 'ru' ? 'кг' : 'kg'));
      h += '<h2 class="rz-q">' + esc(T('o' + s + 'q')) + '</h2>' + ((s === 2 || s === 4) ? '<p class="rz-p">' + esc(T('o' + s + 'h')) + '</p>' : '') + '<div class="rz-amt sl-obamt" id="obAmt"><span id="obNum">' + (ob[f] ? esc(ob[f]) : '0') + '</span><small> ' + unit + '</small></div><p class="rz-p warn" id="obErr" hidden></p>' + kit.padHtml(f === 'weight' ? 'dec' : 'int'); foot = 'next'; }
    if (s === 5) { h += '<h2 class="rz-q">' + esc(T('o5q')) + '</h2>' + [1, 2, 3, 4, 5].map(function (a) { return optBtn('obact', a, T('a' + a), T('a' + a + 'h'), ob.act === a); }).join(''); foot = ob.act ? 'next' : 'next0'; }
    if (s === 6) { var lock = S.restrictions(obProfile()).keepOnly; h += '<h2 class="rz-q">' + esc(T('o6q')) + '</h2>' + ['keep', 'slow', 'lose', 'gain'].map(function (g) { return optBtn('obgoal', g, T('g' + g), T('g' + g + 'H'), (ob.goal === g) || (lock && g === 'keep' && !ob.goal), lock && g !== 'keep'); }).join('') + (lock ? '<p class="rz-p warn">' + esc(T('gLocked')) + '</p>' : ''); foot = (ob.goal || lock) ? 'next' : 'next0'; }
    if (s === 7) {
      var pr = obProfile(); if (S.restrictions(pr).keepOnly) pr.goal = 'keep'; var pl = S.plan(pr);
      var why = pl.goal === 'keep' ? T('rWhyKeep', { tdee: fmt(pl.tdee) }) : T(pl.goal === 'gain' ? 'rWhyGain' : 'rWhyLose', { tdee: fmt(pl.tdee), kg: dec(Math.abs(pl.kgPerWeek), 2), d: fmt(Math.abs(pl.target - pl.tdee)) });
      h += '<div class="sl-res7"><p class="rz-fl" style="text-align:center">' + esc(T('rT')) + '</p><div class="sl-big" aria-live="polite"><b id="obTarget">' + fmt(pl.target) + '</b><small> ' + T('kcal') + '</small></div><p class="rz-p">' + esc(why) + '</p>' +
        (pl.floorApplied ? '<p class="rz-p warn">' + esc(T('rFloor', { min: fmt(pl.floorMin), kg: dec(Math.abs(pl.kgPerWeek), 2) })) + '</p>' : '') +
        pl.notes.filter(function (n) { return n !== 'floor'; }).map(function (n) { return '<p class="rz-p warn">' + esc(T(n === 'preg' ? 'pregN' : n)) + '</p>'; }).join('') + (pl.doctor ? '<p class="rz-p warn"><b>' + esc(T('rDoc')) + '</b></p>' : '') +
        '<p class="rz-p">' + esc(T('rMacro', { p: pl.macros.p, f: pl.macros.f, c: pl.macros.c })) + '<br>' + esc(T('rWater', { n: pl.water.glasses, ml: fmt(pl.water.ml) })) + '</p><p class="rz-p sm">' + esc(T('disc')) + '</p></div>'; foot = 'start';
    }
    h += '</div>' + (foot === 'next' || foot === 'next0' ? '<div class="rz-ob-foot"><button type="button" class="rz-btn primary" data-act="obnext"' + (foot === 'next0' ? ' disabled' : '') + '>' + esc(s === 6 ? T('next') : T('next')) + '</button></div>' : '') + (foot === 'start' ? '<div class="rz-ob-foot"><button type="button" class="rz-btn primary" data-act="obstart">' + esc(T('start')) + '</button></div>' : '');
    el.innerHTML = h; el.hidden = false; el.classList.remove('out');
    if (s === 7) kit.setNum($('#obTarget'), 0, planOfOb().target, { dur: 700 });
  }
  function planOfOb() { var pr = obProfile(); if (S.restrictions(pr).keepOnly) pr.goal = 'keep'; return S.plan(pr); }
  function obGo(step, an) { ob.step = step; ob.anim = an; showOnb(); }
  function obNext() {
    var s = ob.step;
    if (s === 1) { obGo(2, 'f'); return; }
    if (OBF[s]) { var f = OBF[s], er = S.validate(Object.assign({ sex: 'm', act: 1, goal: 'keep', age: 30, height: 170, weight: 70 }, (function () { var o = {}; o[f] = num(ob[f]); return o; })())); if (er[f] || !ob[f]) { var e = $('#obErr'); e.textContent = T(f === 'age' ? 'errAge' : (f === 'height' ? 'errHeight' : 'errWeight')); e.hidden = false; flashEl($('#obAmt')); vib(30); return; } obGo(s + 1, 'f'); return; }
    if (s === 5) { obGo(6, 'f'); return; }
    if (s === 6) { if (!ob.goal) ob.goal = 'keep'; obGo(7, 'f'); return; }
  }
  function obStart() {
    var pr = obProfile(), n = S.emptyState(); if (S.restrictions(pr).keepOnly) pr.goal = 'keep'; n.prefs = {}; n.profile = pr; n.setup = true; n.created = Date.now(); n.trackStart = todayStr(); S.addWeight(n, todayStr(), pr.weight);
    st = n; try { localStorage.removeItem(LS_IMPORT); localStorage.removeItem(OLD[LS_IMPORT]); } catch (e) {} ob = null; seenFood = null; heroPrev = null; save(); loadDb();
    var el = $('#rzOnb'); el.classList.add('out');
    wait(function () { el.hidden = true; el.classList.remove('out'); view = 'today'; enterNext = true; render(); window.scrollTo(0, 0); if (location.hash === '#boshlash') history.replaceState(null, '', location.pathname + location.search); }, 260);
  }

  /* ---------- suv ---------- */
  function openFab() {
    openSheet('fab', shHead(T('fabMenuT')) + '<div class="sl-fabg">' + [['fabfood', 'food', 'fabFood'], ['fabwater', 'drop', 'fabWater'], ['fabsteps', 'steps', 'fabSteps'], ['fabweight', 'scale', 'fabWeight']].map(function (a) { return '<button type="button" class="sl-fabt" data-act="' + a[0] + '">' + ico(a[1]) + '<span>' + esc(T(a[2])) + '</span></button>'; }).join('') + '</div>');
  }
  function waterSheetHtml() {
    var t = todayStr(), x = S.dayOf(st, t) || { water: 0 }, pl = planNow(), glasses = pl.water.glasses, wl = Math.min(glasses, x.water), h = shHead(T('wOpenT')) + '<div class="sl-glasses" role="group" aria-label="' + esc(T('wT')) + '">';
    for (var i = 0; i < glasses; i++) h += '<button type="button" class="sl-glass' + (i < wl ? ' on' : '') + '" data-act="glass" data-i="' + i + '" data-d="' + (i < wl ? 1 : 0) + '" aria-pressed="' + (i < wl) + '" aria-label="' + (i + 1) + '">' + glassSvg() + '</button>';
    return h + '</div><p class="rz-p sm" id="wsTxt">' + esc(T('wOf', { n: wl, m: glasses }) + ' · ' + fmt(x.water * S.GLASS_ML) + ' ' + ML()) + '</p><p class="rz-mut sm">' + esc(T('wHint')) + '</p><div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="xwater">' + esc(T('hHow')) + '</button><button type="button" class="rz-btn" data-act="sheetclose">' + esc(T('close')) + '</button></div>';
  }
  function openWaterSheet() { openSheet('water', waterSheetHtml(), { noFocus: true }); }
  function glassTap(i) {
    var t = todayStr(), x = S.ensureDay(st, t), pl = planNow(), n = (x.water === i + 1) ? i : i + 1; S.setWater(st, t, n); save();
    $$('.sl-glass').forEach(function (g, j) { var on = j < Math.min(n, pl.water.glasses); g.classList.toggle('on', on); g.setAttribute('aria-pressed', on); });
    var w = $('#wTxt'); if (w) w.textContent = T('wCard', { a: fmt(n * S.GLASS_ML), b: fmt(pl.water.glasses * S.GLASS_ML) }); var ws = $('#wsTxt'); if (ws) ws.textContent = T('wOf', { n: Math.min(n, pl.water.glasses), m: pl.water.glasses }) + ' · ' + fmt(n * S.GLASS_ML) + ' ' + ML(); vib(10); afterWater(); jokeAfter('water');
  }

  /* ---------- hodisalar ---------- */
  root.addEventListener('click', function (e) {
    var lmenu = $('#rzLangMenu'), el = e.target.closest('[data-act]');
    if (!el) { if (lmenu && !lmenu.hidden && !e.target.closest('.rz-langwrap')) lmenu.hidden = true; return; }
    var a = el.getAttribute('data-act');
    if (a !== 'langmenu' && lmenu) lmenu.hidden = true;
    if (kit.act(a, el)) return;
    switch (a) {
      case 'tab': kit.hideToast(); if (view !== viewOf(el.getAttribute('data-v'))) { view = viewOf(el.getAttribute('data-v')); enterNext = true; var mm = $('#rzMain'); if (mm) mm.scrollTop = 0; } render(); break;
      case 'add': openAdd({ date: view === 'diary' && foodDay ? foodDay : todayStr() }); break;
      case 'fab': openFab(); break;
      case 'fabfood': openAdd({ date: view === 'diary' && foodDay ? foodDay : todayStr() }); break;
      case 'fabwater': openWaterSheet(); break;
      case 'fabsteps': openSteps(todayStr()); break;
      case 'fabweight': openWeight(); break;
      case 'wopen': openWaterSheet(); break;
      case 'wadd': { var t9 = todayStr(), x9 = S.ensureDay(st, t9); S.setWater(st, t9, x9.water + 1); commit(); vib(10); afterWater(); jokeAfter('water'); break; }
      case 'theme': { prefs().theme = el.getAttribute('data-t'); save(); applyTheme(); render(); break; }
      case 'xkcal': openExplainKcal(); break; case 'xmacro': openExplainMacro(); break; case 'xwater': openExplainWater(); break; case 'xsteps': openExplainSteps(); break; case 'xweight': openExplainWeight(); break; case 'stephelp': openStepHelp(); break;
      case 'glass': glassTap(+el.getAttribute('data-i')); break;
      case 'addsteps': openSteps(todayStr()); break; case 'editsteps': openSteps(el.getAttribute('data-d')); break; case 'stepgoal': openSteps(null, true); break;
      case 'key': {
        var k = el.getAttribute('data-k'), ks = kit.sheetKind();
        if (ob && !$('#rzOnb').hidden && OBF[ob.step]) { var f = OBF[ob.step]; ob[f] = kit.padApply(ob[f], k, { max: 3, dec: f === 'weight' ? 1 : 0 }); $('#obNum').textContent = ob[f] || '0'; $('#obErr').hidden = true; vib(5); }
        else if (ks === 'steps') { sp.val = kit.padApply(sp.val, k, { max: 6 }); spUpdate(); vib(5); }
        else if (ks === 'weight') { wf.val = kit.padApply(wf.val, k, { max: 3, dec: 1 }); $('#wfNum').textContent = wf.val || '0'; vib(5); }
        break; }
      case 'spsave': spSave(); break; case 'addweight': openWeight(); break; case 'wfsave': wfSave(); break;
      case 'editprof': openProfile(); break;
      case 'pesex': { peRead(); pe.sex = el.getAttribute('data-v'); if (pe.sex === 'm') pe.preg = false; peRepaint(); break; }
      case 'peact': peRead(); pe.act = +el.getAttribute('data-v'); peRepaint(); break;
      case 'pegoal': if (el.getAttribute('aria-disabled') !== 'true') { peRead(); pe.goal = el.getAttribute('data-v'); peRepaint(); } break;
      case 'pesave': peSave(); break;
      case 'share': openShare(); break; case 'shgo': shGo(false); break; case 'shdl': shGo(true); break;
      case 'dayend': { var t0 = todayStr(), r0 = S.finishDay(st, t0, t0); if (r0.why === 'empty') break; commit(); toast(T(r0.ok ? 'deDone' : 'deLow'), function () { if (st.days[t0]) delete st.days[t0].done; commit(); }, r0.ok); break; }
      case 'export': doExport(); break; case 'import': bk.restoreSheet(); break; case 'wipe': wipe(); break;
      case 'tips': prefs().tipsDone = false; save(); view = 'today'; enterNext = true; var m0 = $('#rzMain'); if (m0) m0.scrollTop = 0; render(); break;
      case 'about': aboutOpen(true); break;
      case 'hide': prefs()['h_' + el.getAttribute('data-k')] = Date.now(); commit(); break;
      case 'hideweek': prefs().weekHide = todayStr(); commit(); break;
      case 'font': { var big = el.getAttribute('data-f') === 'b'; document.documentElement.classList.toggle('fs-big', big); try { if (big) localStorage.setItem('kalki_fs', 'big'); else localStorage.removeItem('kalki_fs'); } catch (x) {} render(); break; }
      case 'langmenu': lmenu.hidden = !lmenu.hidden; break;
      case 'lang': { var l = el.getAttribute('data-l'), tgt = document.getElementById(l === 'cyr' ? 'langCyr' : (l === 'ru' ? 'langRu' : 'langUz')); if (tgt) tgt.click(); break; }
      case 'dprev': foodDay = Dt.addDays(foodDay || todayStr(), -1); render(); break;
      case 'dnext': if ((foodDay || todayStr()) < todayStr()) { foodDay = Dt.addDays(foodDay || todayStr(), 1); render(); } break;
      case 'addto': openAdd({ meal: el.getAttribute('data-m'), date: el.getAttribute('data-d') }); break;
      case 'addtext': openText(el.getAttribute('data-d')); break;
      case 'pickfav': openAdd({ date: el.getAttribute('data-d'), food: el.getAttribute('data-id') }); break;
      case 'editfood': openEdit(el.getAttribute('data-d'), +el.getAttribute('data-id')); break;
      case 'pickfood': { var pk0 = el.getAttribute('data-pick'); pickFood(el.getAttribute('data-id'), pk0 ? JSON.parse(pk0) : null); break; }
      case 'fcat': fd.cat = el.getAttribute('data-c'); $$('.sl-cats .rz-chip').forEach(function (b) { var on = b === el; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); }); refreshRes(); break;
      case 'ftext': openText(null, true); break;
      case 'calinfo': openSheet('calinfo', shHead(T('calInfoT')) + '<p class="rz-p">' + esc(T('calNote')) + '</p><p class="rz-p sm">' + esc(T('deHint')) + '</p>' + okBtn()); break;
      case 'fquick': quickAdd(el.getAttribute('data-d'), +el.getAttribute('data-i')); break;
      case 'fmore': fd.more = !fd.more; refreshRes(); break;
      case 'fbrowse': fd.browse = !fd.browse; fd.cat = ''; fd.q = ''; setSheet(searchHtml()); catsInit(); break;
      case 'pwmore': { var o8 = pwO(); o8.pmore = !o8.pmore; var pm = $('#pwMore'); if (pm) pm.hidden = !o8.pmore; el.setAttribute('aria-expanded', !!o8.pmore); var cv = el.querySelector('.cv'); if (cv) cv.classList.toggle('open', !!o8.pmore); break; }
      case 'fqai': { var q0 = fd.q; openText(null, true); fd.txt = q0; setSheet(textHtml()); txGo(); setTimeout(function () { if (fd && fd.missing && fd.missing.length && navigator.onLine !== false) txAi(); }, 80); break; }
      case 'fqsug': { var q1 = fd.q; fd.suggest = true; openCustom(q1); break; }
      case 'fcustom': { var qv = $('#fdQ'); openCustom(qv ? qv.value : ''); break; }
      case 'cusave': cuSave(); break;
      case 'fback': if (fd.editId != null) kit.closeSheet(); else { fd.mode = 'search'; fd.food = null; setSheet(searchHtml()); catsInit(); refreshRes(dbState === 0); } break;
      case 'ffav': { var on = S.toggleFav(st, fd.favId || fd.food.id); save(); var b = $('[data-act=ffav]'); b.classList.toggle('fav', on); b.setAttribute('aria-pressed', on); toast(T(on ? 'favOn' : 'favOff')); break; }
      case 'funit': { var o1 = pwO(), nu = el.getAttribute('data-u'), wasV = !!vOf(o1.unit); if (nu !== o1.unit) pwSetUnit(o1, nu); if (wasV || vOf(nu)) pwScreen(); else pwUpdate(); break; }
      case 'fqty': { var o2 = pwO(); pwSetQty(o2, o2.qty + (+el.getAttribute('data-s')) * pwStep(o2)); pwUpdate(); vib(5); break; }
      case 'fmeal': fd.meal = el.getAttribute('data-m'); $$('[data-act=fmeal]').forEach(function (b) { var on3 = b === el; b.classList.toggle('on', on3); b.setAttribute('aria-pressed', on3); }); break;
      case 'fmeal2': { var x2 = S.dayOf(st, fd.date), e2 = x2 && x2.food.filter(function (y) { return y.id === fd.editId; })[0]; if (e2) { e2.meal = el.getAttribute('data-m'); save(); kit.closeSheet(); render(); } break; }
      case 'fmeal3': fd.meal = el.getAttribute('data-m'); $$('[data-act=fmeal3]').forEach(function (b) { var on4 = b === el; b.classList.toggle('on', on4); b.setAttribute('aria-pressed', on4); }); break;
      case 'fsave': fSave(); break; case 'fdel': fDelete(); break;
      case 'txgo': txGo(); break; case 'txai': txAi(); break; case 'txsave': txSave(); break;
      case 'txdel': fd.items.splice(+el.getAttribute('data-i'), 1); txRefresh(); break;
      case 'yesam': openYesam(); break;
      case 'ypick': yPick(el.getAttribute('data-id')); break;
      case 'yback': yd.food = null; setSheet(ySearchHtml()); yRefresh(); break;
      case 'yunit': { var yu = el.getAttribute('data-u'); if ((yu === 'g100') !== (yd.unit === 'g100')) yd.qty = yu === 'g100' ? 100 : 1; yd.unit = yu; $$('[data-act=yunit]').forEach(function (b) { var on = b === el; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); }); yUpdate(); break; }
      case 'yqty': { var ys = yd.unit === 'g100' ? 25 : 0.5, yq = yd.qty + (+el.getAttribute('data-s')) * ys; yd.qty = Math.max(ys, Math.min(yd.unit === 'g100' ? 3000 : 50, Math.round(yq * 100) / 100)); yUpdate(); vib(5); break; }
      case 'fphoto': if (navigator.onLine !== false) { var pin = $('#phIn'); if (pin) { pin.value = ''; pin.click(); } } break;
      case 'itedit': itemOpen(+el.getAttribute('data-i'), fd.mode === 'photo' ? 'photo' : (fd.mode === 'tpl' ? 'tpl' : 'text')); break;
      case 'pwdone': itemBack(); break;
      case 'pwq': { var o3 = pwO(); pwSetQty(o3, +el.getAttribute('data-v')); pwUpdate(); vib(5); break; }
      case 'pwswap': loadDb(function () { setSheet(pwSwapHtml(pwO())); }); break;
      case 'pwswapx': pwScreen(); break;
      case 'vfill': { var o8 = pwO(); o8.vfill = el.getAttribute('data-f'); if (fd.mode === 'item') { o8.ed = true; itSync(o8); } pwScreen(); break; }
      case 'vnew': vcOpen(); break;
      case 'vsugyes': vcOpen(vSugKind()); break;
      case 'vsugno': fd.vsugShown = null; pwScreen(); break;
      case 'vback': pwScreen(); break;
      case 'vkind': fd.vc.kind = el.getAttribute('data-k'); fd.vc.vid = null; setSheet(vesselHtml()); break;
      case 'vlink': { var lv = S.vesselById(st, +el.getAttribute('data-id')); if (lv) { fd.vc.vid = lv.id; fd.vc.kind = lv.kind; } setSheet(vesselHtml()); break; }
      case 'vmeth': fd.vc.method = el.getAttribute('data-m'); setSheet(vesselHtml()); break;
      case 'vscale': fd.vc.scale = el.getAttribute('data-s'); setSheet(vesselHtml()); break;
      case 'vsave': vcSave(); break;
      case 'vessels': vmOpen(); break;
      case 'rcmine': openSheet('rcmine', shHead(T('rcMine')) + rcMineHtml() + '<div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="sheetclose">' + esc(T('close')) + '</button></div>'); break;
      case 'vedit': vmEdit(+el.getAttribute('data-id')); break;
      case 'vedsave': vmSave(); break;
      case 'vdel': vmDel(+el.getAttribute('data-id')); break;
      case 'vmback': setSheet(vmHtml()); break;
      case 'pwsrc': setSheet(srcHtml(pwO())); break;
      case 'fax': { var o6 = pwO(); if (o6.fam) { o6.sel[el.getAttribute('data-a')] = el.getAttribute('data-o'); famRefresh(o6); } break; }
      case 'fsz': { var o7 = pwO(); if (o7.fam) { o7.szid = el.getAttribute('data-o'); famRefresh(o7); } break; }
      case 'pwsw': pwSwapTo(el.getAttribute('data-id')); break;
      case 'phdel': fd.items.splice(+el.getAttribute('data-i'), 1); phRefresh(); break;
      case 'frecipe': case 'rcnew': openRecipe(); break;
      case 'rcedit': openRecipe(el.getAttribute('data-id')); break;
      case 'rcadd': rc.mode = 'ing'; rc.q = ''; setSheet(rcSearchHtml()); break;
      case 'rcback': rc.mode = 'main'; rc.name = ($('#rcName') ? $('#rcName').value : rc.name); setSheet(rcHtml()); break;
      case 'rcsearch': rc.mode = 'ing'; setSheet(rcSearchHtml()); break;
      case 'rcpick': { var rf = foodById(el.getAttribute('data-id')); if (rf) { rc.pick = rf; rc.g = 100; rc.mode = 'g'; setSheet(rcGramsHtml()); } break; }
      case 'rcg': rc.g = +el.getAttribute('data-g'); rcGUpdate(); break;
      case 'rcgq': rc.g = Math.max(5, Math.min(5000, rc.g + (+el.getAttribute('data-s')) * 25)); rcGUpdate(); vib(5); break;
      case 'rcaddgo': { var rp = rc.pick; rc.ings.push({ id: rp.id, name: rp.n, g: rc.g, k: rp.k, p: rp.p, f: rp.f, c: rp.c }); rc.mode = 'main'; setSheet(rcHtml()); break; }
      case 'rcdel': rc.name = ($('#rcName') ? $('#rcName').value : rc.name); rc.ings.splice(+el.getAttribute('data-i'), 1); setSheet(rcHtml()); break;
      case 'rcport': rc.portions = Math.max(1, Math.min(30, rc.portions + (+el.getAttribute('data-s')))); $('#rcPN').textContent = rc.portions; $('#rcOut').innerHTML = rcOutHtml(); break;
      case 'rcsave': rcSaveGo(); break;
      case 'rcremove': { var rid = rc.id, rnm = rc.name; kit.closeSheet(); confirmBox(T('rcDelete'), rnm, function () { S.removeCustom(st, rid); commit(); toast(T('rcDeleted')); }); break; }
      case 'calprev': case 'calnext': { var cp = Dt.parse((calYm || Dt.monthOf(todayStr())) + '-01'); calYm = Dt.monthOf(Dt.addMonthsDom(Dt.ymd(cp.y, cp.m, 1), a === 'calprev' ? -1 : 1, 1)); render(); break; }
      case 'calday': foodDay = el.getAttribute('data-d'); view = 'diary'; enterNext = true; render(); break;
      case 'jktog': prefs().jokes = el.getAttribute('data-v') === '1'; commit(); break;
      case 'city': openCity(); break;
      case 'citypick': prefs().city = el.getAttribute('data-id'); kit.closeSheet(); commit(); break;
      case 'supp': openSupp(); break;
      case 'tpls': tplsOpen(); break;
      case 'tplsave': tplStartSave(el.getAttribute('data-m'), el.getAttribute('data-d')); break;
      case 'tplhelp': fd.mode = 'tplhelp'; setSheet(tplHelpHtml()); break;
      case 'tplgoadd': if (kit.sheetKind() === 'add') { fd.mode = 'search'; setSheet(searchHtml()); catsInit(); refreshRes(dbState === 0); } else { kit.closeSheet(); setTimeout(function () { openAdd(); }, 250); } break;
      case 'tplsugsave': if (tmSug) tplStartSave(tmSug.meal, todayStr(), tmSug.entries); break;
      case 'tplsugno': { if (tmSug) { var pr = prefs(); (pr.tplNo || (pr.tplNo = [])).push(tmSug.key); save(); var sg = $('#tplSug'); if (sg) sg.parentNode.removeChild(sg); } break; }
      case 'tplname': tplSaveAs(el.getAttribute('data-n')); break;
      case 'tplsave2': { var tn = $('#tplNm').value.trim(); if (!tn) { flashEl($('#tplNm')); break; } tplSaveAs(tn); break; }
      case 'tplopen': { var tp = S.tplById(st, +el.getAttribute('data-id')); if (tp) tplShow(tp.name, tp.items); break; }
      case 'yday': { openAdd({ meal: el.getAttribute('data-m'), date: el.getAttribute('data-d') }); tplShow(T('tplYestT'), S.yesterdayEntries(st, fd.date, fd.meal).map(entryToTpl)); break; }
      case 'yday2': tplShow(T('tplYestT'), S.yesterdayEntries(st, fd.date, fd.meal).map(entryToTpl)); break;
      case 'tplchk': { var ti = fd.items[+el.getAttribute('data-i')]; if (ti) { ti.off = !ti.off; var sc = $('#rzSheet').scrollTop; setSheet(tplHtml()); $('#rzSheet').scrollTop = sc; } break; }
      case 'tplup': case 'tpldn': { S.moveTemplate(st, +el.getAttribute('data-id'), a === 'tplup' ? -1 : 1); save(); setSheet(tplsHtml()); break; }
      case 'tpldel': { var did = +el.getAttribute('data-id'), idx = (st.tpls || []).map(function (x) { return x.id; }).indexOf(did), rm = S.removeTemplate(st, did); if (rm) { save(); setSheet(tplsHtml()); toast(T('tplDel1'), function () { st.tpls.splice(Math.min(idx, st.tpls.length), 0, rm); save(); if (kit.sheetKind() === 'tpls') setSheet(tplsHtml()); }); } break; }
      case 'tplren': { var rt = S.tplById(st, +el.getAttribute('data-id')); if (rt) { tm = { rid: rt.id }; setSheet(shHead(T('tplRen')) + '<label class="rz-f" for="tplNm"><span>' + esc(T('tplNameT')) + '</span><input id="tplNm" type="text" maxlength="40" autocomplete="off" enterkeyhint="done" value="' + esc(rt.name) + '"></label><div class="rz-actions sl-sticky"><button type="button" class="rz-btn ghost" data-act="tplren0">' + esc(T('back')) + '</button><button type="button" class="rz-btn primary" data-act="tplren2">' + esc(T('save')) + '</button></div>'); } break; }
      case 'tplren0': setSheet(tplsHtml()); break;
      case 'tplren2': { var rn = $('#tplNm').value.trim(); if (!rn) { flashEl($('#tplNm')); break; } S.renameTemplate(st, tm.rid, rn); save(); setSheet(tplsHtml()); break; }
      case 'spitem': { var it = supp && supp.items.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; if (it) { setSheet(spCardHtml(it)); var shh = $('#rzSheet'); if (shh) shh.scrollTop = 0; } break; }
      case 'spback': setSheet(spListHtml()); break;
      case 'obsex': ob.sex = el.getAttribute('data-v'); if (ob.sex === 'm') ob.preg = false; showOnb(); break;
      case 'obact': ob.act = +el.getAttribute('data-v'); showOnb(); break;
      case 'obgoal': if (el.getAttribute('aria-disabled') !== 'true') { ob.goal = el.getAttribute('data-v'); showOnb(); } break;
      case 'obnext': obNext(); break; case 'obstart': obStart(); break;
      case 'obback': obGo(Math.max(1, ob.step - 1), 'b'); break;
    }
  });
  root.addEventListener('focusout', function (e) { if (e.target && e.target.id === 'fdQty' && fd) { var o5 = pwO(); if (o5) e.target.value = qtyStr(o5.qty); } });
  root.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target && e.target.id === 'fdQty') { e.preventDefault(); e.target.blur(); } });
  if (window.visualViewport) { var vv = window.visualViewport, vvf = function () { var kb = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)); root.style.setProperty('--kb', (kb > 80 ? kb : 0) + 'px'); }; vv.addEventListener('resize', vvf); vv.addEventListener('scroll', vvf); }
  root.addEventListener('input', function (e) { var t = e.target; if (fd && fd.vc && /^vc(Name|Full|Empty|Direct)$/.test(t.id)) { fd.vc[{ vcName: 'name', vcFull: 'full', vcEmpty: 'empty', vcDirect: 'direct' }[t.id]] = t.value; var rs = $('#vcRes'); if (rs) rs.textContent = vcResTxt(); } else if (t.id === 'fdQty') { var v = parseFloat(String(t.value).replace(',', '.')); if (v > 0) { var o4 = pwO(); o4.qty = Math.min(pwMax(o4), Math.round(v * 100) / 100); pwUpdate(true); } } else if (t.id === 'fdQ') { fd.q = t.value; clearTimeout(qTimer); qTimer = setTimeout(refreshRes, 120); } else if (t.id === 'ydQ') { yd.q = t.value; clearTimeout(qTimer); qTimer = setTimeout(yRefresh, 120); } else if (t.id === 'rcQ') { rc.q = t.value; var rr = $('#rcRes'); if (rr) rr.innerHTML = rcResults(); } else if (t.id === 'spQ') { spQ = t.value; var sr = $('#spRes'); if (sr) sr.innerHTML = spRows(); } else if (t.id === 'rcName') rc.name = t.value; });
  root.addEventListener('change', function (e) {
    var t = e.target;
    if (t.id === 'phIn') { var f0 = t.files && t.files[0]; if (f0) phFile(f0); } else if (t.id === 'jkParty') { S.ensureDay(st, todayStr()).party = t.checked; commit(); } else if (t.id === 'obPreg') ob.preg = t.checked; else if (t.id === 'peP') { pe.preg = t.checked; peRepaint(); } else if (t.hasAttribute && t.hasAttribute('data-sh')) { shSel[t.getAttribute('data-sh')] = t.checked; shPaint(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (document.body.classList.contains('rz-aboutopen')) aboutOpen(false); else if (kit.sheetKind()) kit.closeSheet(); else { var lm = $('#rzLangMenu'); if (lm) lm.hidden = true; }
  });
  var lastDay = Dt.today();
  document.addEventListener('visibilitychange', function () { if (!document.hidden && st && st.setup) { var d = Dt.today(); if (d !== lastDay) { lastDay = d; heroPrev = null; foodDay = null; render(); } } });
  try { var rootScr = document.documentElement.getAttribute('data-script'); new MutationObserver(function () { var scr = document.documentElement.getAttribute('data-script'); if (langNow() !== lang || scr !== rootScr) { rootScr = scr; render(); } }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'data-lang', 'data-script'] }); } catch (e) {}

  /* ---------- ishga tushirish ---------- */
  function init() {
    st = load(); applyTheme(); shell();
    try { if ((window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true) document.body.classList.add('rz-standalone'); } catch (e) {}
    var ab = document.getElementById('rzAbout');
    if (ab && !document.getElementById('rzAboutBar')) {
      var bar = document.createElement('div'); bar.className = 'rz-about-bar'; bar.id = 'rzAboutBar'; bar.innerHTML = '<button type="button" class="rz-btn sm" id="rzAboutBack"></button>';
      ab.insertBefore(bar, ab.firstChild); bar.firstChild.addEventListener('click', function () { aboutOpen(false); });
    }
    render(); inst.gate();
    if (st.setup) { loadMasofa(); loadDb(function () { if (view === 'today' && !kit.sheetKind()) render(); }); }
    window.addEventListener('offline', phSetOffline); window.addEventListener('online', phSetOffline);
    var hv = viewOf(location.hash); if (hv && st.setup) { view = hv; render(); }
    if (location.hash === '#qoshish' && st.setup) openAdd({});
    if (location.hash === '#haqida') aboutOpen(true);
    window.__kalkifit = { get state() { return st; }, render: render, S: S };
    // pwa-install.js (KalkiPwa: iPhone ko'rsatmasi, Android o'rnatish) shu skriptdan KEYIN yuklanadi — sahifa yuklangach "o'rnatish" kartasi uchun qayta chizamiz
    if (document.readyState !== 'complete') window.addEventListener('load', function () { if (st && st.setup && view === 'today' && !kit.sheetKind() && !kit.tipsOn()) render(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
