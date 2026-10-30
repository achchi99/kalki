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
      obLater: 'Keyinroq', obLater2: "Keyinroq — o'rtacha me'yor bilan boshlash", txChip: 'Taxminiy · Aniqlashtirish', txP: "Me'yoringiz taxminiy", obYq2: "Yemaydigan narsangiz bormi?", obYh2: 'Belgilangan taomlar sizga taklif qilinmaydi. Hech narsa tanlamasangiz ham bo\'ladi.', obYno: "Yo'q, hammasini yeyman", obYgo: 'Davom etish', txT: "Me'yoringiz taxminiy — 30 soniyada aniqlashtiring", txBtn: 'Aniqlashtirish', sldMinus: 'Kamaytirish', sldPlus: "Ko'paytirish", sldEdit: 'Aniq qiymatni yozish',
      appName: 'KalkiFit', navToday: 'Bugun', navFood: 'Ovqat', navSteps: 'Qadam', navMe: 'Men', add: "Ovqat qo'shish", kcal: 'kkal', gram: 'g', km: 'km',
      today: 'Bugun', apkT: 'Android ilovasini yuklab olish', apkH: "Telefoningizga o'rnatiladigan ilova (APK)", jClose: 'Yopish (bugun uchun)', yesterday: 'Kecha', back: 'Orqaga', next: 'Keyingi', start: 'Boshlash', save: 'Saqlash', cancel: 'Bekor qilish', del: "O'chirish", close: 'Yopish', confirm: 'Tasdiqlash', later: 'Keyinroq', saved: 'Saqlandi', del1: "Yozuv o'chirildi",
      mealb: 'Nonushta', meall: 'Tushlik', mealds: 'Kechki ovqat', mealss: 'Tamaddi', meald: 'Kechki ovqat', meals: 'Tamaddi',
      o1q: 'Jinsingiz?', male: 'Erkak', female: 'Ayol', preg: 'Homiladorman yoki emizikli onaman', o2q: 'Yoshingiz nechida?', o2h: "Faqat kunlik me'yorni hisoblash uchun.", o3q: "Bo'yingiz necha sm?", o4q: 'Vazningiz necha kg?', o4h: 'Lineykani suring yoki − / + bosing. Taxminiy qiymat ham bo\'ladi.', o3h: 'Lineykani suring yoki − / + bosing.',
      o5q: "Kuningiz qanday o'tadi?", o6q: 'Maqsadingiz?', errAge: '10 dan 100 gacha yozing', errHeight: '120 dan 230 gacha yozing', errWeight: '30 dan 250 gacha yozing',
      a1: "Ko'proq o'tiraman", a1h: "Ofis yoki uyda ishlayman, kam yuraman", a2: 'Yengil faol', a2h: "Ozgina yuraman yoki haftada 1–2 mashq", a3: "O'rtacha faol", a3h: 'Haftada 3–5 mashq', a4: 'Juda faol', a4h: 'Deyarli har kuni mashq', a5: "Og'ir jismoniy mehnat", a5h: "Kun bo'yi oyoqda, og'ir ish",
      gkeep: 'Vaznni saqlash', gkeepH: "Hozirgi vaznni ushlab turish", gslow: 'Sekin kamaytirish', gslowH: 'Haftasiga ≈ 0,25 kg', glose: 'Kamaytirish', gloseH: 'Haftasiga ≈ 0,5 kg', ggain: "Ko'paytirish", ggainH: 'Haftasiga ≈ 0,25 kg', gLocked: "Sizning holatingizda faqat vaznni saqlash rejimi hisoblanadi.",
      rT: "Sizning kunlik me'yoringiz", rWhyKeep: 'Siz kuniga taxminan {tdee} kkal sarflaysiz. Vaznni saqlash uchun shuncha yeyish kifoya.', rWhyLose: 'Siz kuniga taxminan {tdee} kkal sarflaysiz. Haftasiga ≈ {kg} kg kamaytirish uchun {d} kkal kam yeysiz.', rWhyGain: "Siz kuniga taxminan {tdee} kkal sarflaysiz. Haftasiga ≈ {kg} kg ko'paytirish uchun {d} kkal ko'p yeysiz.",
      rFloor: "Kamaytirish tezligi xavfsiz chegaraga ({min} kkal) moslandi, shuning uchun haftasiga ≈ {kg} kg.", rDoc: "Shifokor bilan maslahatlashing. Bu hisob faqat vaznni saqlash uchun.", under18: "18 yoshdan kichiklar uchun dieta hisoblanmaydi.", pregN: "Homiladorlik va emizish davrida dieta hisoblanmaydi.", lowBmi: "Vazningiz me'yordan past (BMI < 18,5): dieta hisoblanmaydi.",
      disc: "Taxminiy hisob — tibbiy maslahat emas.", rMacro: 'Oqsil {p} g · yog\' {f} g · uglevod {c} g', rWater: 'Suv: {n} stakan ({ml} ml)',
      ringOf: '/ {t} kkal', remLbl: 'Yana yeyish mumkin', overLbl: "Me'yordan ko'p", stepPlus: 'Qadamlar hisobiga +{c} kkal', hHow: 'Bu raqam qanday hisoblanadi?', limitParts: "{t} me'yor + {c} qadamlardan", tAiSite: "AI bugun juda band — ovqatni qidiruv orqali qo'shing (u internetsiz ham ishlaydi). Ertaga AI yana ishlaydi.", phSite: "Rasm tahlili bugun juda band — ovqatni matn yoki qidiruv bilan qo'shing. Ertaga yana ishlaydi.", hEmpty: "Birinchi ovqatni yozing — «Yedingiz» va «Qoldi» shu yerda yangilanadi.", stEmpty: "Qadamlar avtomatik sanalgach, ustunlar shu yerda o'sadi.",
      mP: 'Oqsil', mF: "Yog'", mC: 'Uglevod', wT: 'Suv', wOf: '{n} / {m} stakan', wSplit: 'Suv {w} · Ichimliklar {d}', wDrinkNote: 'Choy, qahva, sut va sharbat ham suv hisobiga kiradi.', wListT: 'Ichimliklar va suyuq taomlar', wHint: 'Stakanga bosing', wDone: "Suv me'yori bajarildi", sT: 'Qadam', sAdd: 'Qadam kiritish', sNone: "Bugun hali qadam yo'q", sGoalDone: 'Qadam maqsadi bajarildi',
      addMeal: "+ Qo'shish", emptyMeal: "Hali yo'q",
      aT: "Ovqat qo'shish", aFav: 'Sevimli', aPop: 'Mashhur', aNone: 'Topilmadi', aText: 'Matn bilan qo\'shish', aLoading: 'Baza yuklanmoqda…', aEst: 'taxminiy', per100: '{k} kkal / 100 g', all: 'Hammasi',
      pwGramm: 'gramm', pwEq: '1 {u} ≈ {g} g', pwNow: 'hozir {g} g', pwQty: 'Miqdor', pwQuick: 'Tez tanlash', pwSwap: 'Taomni almashtirish', pwSwapT: "O'xshash taomlar", pwNoSim: "O'xshash taom topilmadi", pwDone: 'Tayyor', pwApprox: "Taxminiy qiymat — porsiyani o'zingizga moslang.", pwAll: "Hammasini qo'shish ({n})", pwEditRow: "{x} — porsiyani o'zgartirish", tplMore: 'Ovqat amallari', tplSave1: 'Shu ovqatni saqlash', tplSaveH: 'Odatdagi ovqat sifatida', tplNameT: 'Nomi', tplNameIn: "Yoki o'zingiz yozing", tplSaved: 'Saqlandi: {x}', tplFull: "12 ta to'ldi — Men → «Odatdagi ovqatlarim»dan keraksizini o'chiring.", tplMine: 'Odatdagi ovqatlarim', tplMineH: 'Tez-tez yeydiganlaringiz', tplEmpty: "Tez-tez yeydigan ovqatingizni bir marta saqlang — keyin bir bosishda qo'shiladi.", tplYest: 'Kechagidek', tplYestT: 'Kecha yegan ovqatlar', tplAdd: "Qo'shish ({n})", tplRen: "Nomini o'zgartirish", tplDel1: "Odatdagi ovqat o'chirildi", tplUp: 'Yuqoriga', tplDown: 'Pastga', tplCnt: '{n} ta · {k} kkal', tplChk: 'Tanlash', tplS0: 'Uy nonushtasi', tplS1: 'Ishdagi nonushta', tplS2: 'Mashqdan keyin', tplL0: 'Uy tushligi', tplL1: 'Ishdagi tushlik', tplD0: 'Uy kechki ovqati', tplD1: 'Yengil kechki ovqat', tplT0: 'Tamaddi', tplT1: 'Ishdagi tamaddi', tplSaveS: 'Saqlash', tplToday: 'Bugun yozilganlar', tplTodayRow: '{n} ta taom · {k} kkal', tplNoToday: 'Avval ovqat yozing, keyin uni shu yerda bir bosishda saqlaysiz.', tplAddFood: "Ovqat qo'shish", tplSugT: 'Siz tez-tez yeysiz: {x} — saqlaymi?', tplNo: "Yo'q", tplHint: "Bir marta saqlang — keyin bir bosishda qo'shiladi.", famN: '{n} xil', famDef: 'odatiy tanlov', srcBtn: 'Manba', srcNone: "Bu taom uchun manba yozuvi yo'q.", srcApprox: "Retsept o'rtacha uy taomiga asoslangan, ±15% farq bo'lishi mumkin.", srcApprox2: "Qiymat mavjud jadvallarga asoslangan, ±15% farq bo'lishi mumkin.", srcAi: "Bu qiymatni AI taxmin qildi — aniq emas.", srcUnitB: "birlik grammi mavjud baza qiymati (tarozida hali tekshirilmagan)", srcUnitA: "birlik grammi o'xshash taomdan olingan taxmin", vNew: 'Mening idishim', vfT: "Ichiga to'ldirish", vf_yarim: 'Yarim', vf_tola: "To'la", vf_kop: "Ko'p", vk_kosa: 'Kosa', vk_lagan: 'Lagan', vk_piyola: 'Piyola', vk_likopcha: 'Likopcha', vk_custom: "O'zim yozaman", vn_kosa: 'Mening kosam', vn_lagan: 'Mening laganim', vn_piyola: 'Mening piyolam', vn_likopcha: 'Mening likopcham', vn_custom: 'Mening idishim', vs_kosa: 'Odatiy kosa', vs_lagan: 'Odatiy lagan', vs_piyola: 'Odatiy piyola', vs_likopcha: 'Odatiy likopcha', vs_custom: 'Odatiy porsiya', vcT: 'Mening idishim', vcFor: '«{x}» uchun', vcLink: 'Boshqa idishlaringiz', vcKind: 'Idish turi', vcName: 'Idish nomi', vcHow: 'Hajmini qanday aniqlaymiz?', vcScaleOn: 'Tarozida tortdim', vcScaleOff: "Tarozim yo'q", vcHint: "Idishni bo'sh torting, keyin ovqat bilan — farqi ovqatingiz.", vcFull: 'Ovqat bilan vazn (g)', vcEmpty: "Bo'sh idish vazni (g)", vcDirect: "Yoki to'g'ridan-to'g'ri ovqat grammi", vcRes: 'Ovqat: {g} g', vcStd: '{k} ≈ {g} g', vcCompare: 'Sizning idishingiz standartga nisbatan?', vc_kichik: 'Kichikroq (×0,75)', vc_ohshash: "Shunga o'xshash (×1)", vc_katta: 'Kattaroq (×1,3)', vcSave: 'Saqlash', vcBad: "Gramm 10 dan 3000 gacha bo'lsin", vcMax: "Ko'pi bilan 20 ta idish. Keraksizini Men → «Mening idishlarim»dan o'chiring.", vSaved: 'Saqlandi: {x}', vmT: 'Mening idishlarim', vmH: "O'z kosa va laganlaringiz", vmEmpty: "O'z kosangizni bir marta belgilang — keyin hisob aniqroq bo'ladi.", vmGuide: "Ovqat qo'shayotganda porsiya oynasida «+ Mening idishim» ni bosing.", vmMax: "Ko'pi bilan {n} ta idish.", vmDel1: "Idish o'chirildi", vmEdit: 'Tahrirlash', vmName: 'Nomi', vmFam: 'Taomlar', vsugL: 'Har safar laganingizdan yeysizmi? Uni bir marta belgilang.', vsugK: 'Har safar kosangizdan yeysizmi? Uni bir marta belgilang.', vsugYes: 'Belgilash', vsugNo: 'Keyin', navDiary: 'Kundalik', navResults: 'Natijalar', navProfile: 'Profil', navAdd: "Qo'shish", diaryT: 'Kundalik', resT: 'Natijalar', profT: 'Profil', todayDate: 'Bugun, {d}', cEaten: 'Yedingiz', cGoal: 'Maqsad', cLeft: 'Qoldi', cOver: '{x} kkal ortiqcha yedingiz', cNote: "Kiritilgan ovqatlar bo'yicha", mainAdd: "Qo'shish", wCard: '{a} / {b} ml', wAdd: '+250', sCard: '{n} qadam', sEnter: 'Kiritish', sNoneC: 'Bugun kiritilmagan', macroRow: "Oqsil · Yog' · Uglevod", fabMenuT: "Nimani qo'shamiz?", fabFood: 'Ovqat', fabWater: 'Suv', fabSteps: 'Qadam', fabWeight: 'Vazn', wOpenT: 'Suv', themeT: 'Mavzu', thAuto: 'Avto', thLight: 'Och', thDark: "Qorong'i", profData: "Maqsad va ma'lumotlar", resWeekT: 'Hafta xulosasi', resMore: 'Batafsil', diaryAdd: "Shu kunga ovqat qo'shish", profBackup: 'Zaxira va ko\'chirish', calInfoT: 'Taqvim qanday hisoblanadi?', hStreak: '{n} kun', cBurn: 'Yoqildi', vLeft: 'Qoldi', vAria: '{k} kkal yana yeyishingiz mumkin', vAriaO: '{k} kkal ortiqcha yedingiz', wAdd2: '+250 ml', sTap: 'Qadam kiriting', wRowT: 'Vazn: {x} kg', wRowW: 'Haftada {d} kg', avL: 'K',
      mlPct: '{n} ta · kunning {p}%', mlMore: 'Yana {n} ta · {x}', mlEmpty: "Hali yo'q — qo'shish uchun bosing",
      mealAdd_b: "Nonushtani qo'shish", mealAdd_l: "Tushlikni qo'shish", mealAdd_d: "Kechki ovqatni qo'shish", mealAdd_s: "Tamaddini qo'shish", mealS_b: 'Nonushta', mealS_l: 'Tushlik', mealS_d: 'Kechki', mealS_s: 'Tamaddi',
      pCta_b: "Nonushtaga qo'shish · {k} kkal", pCta_l: "Tushlikka qo'shish · {k} kkal", pCta_d: "Kechki ovqatga qo'shish · {k} kkal", pCta_s: "Tamaddiga qo'shish · {k} kkal", pCtaE: 'Saqlash · {k} kkal',
      aCnt: '{n} taom · {k} kkal', pTypeT: 'Turi va hajmi', pChange: "O'zgartirish", pCloseL: 'Yopish', pMealT: 'Ovqat vaqti', aDone: "Qo'shildi", pManba: 'Manba',
      aDefOne: '{x} ≈ {k} kkal', aQuickAdd: "Qo'shish", aAdded: "Qo'shildi: {x}", pAddBtn: "Qo'shish", pMoreT: "Turi va hajmini aniqlashtirish", pMore2T: 'Boshqa sozlamalar', srcPer100: '{k} kkal / 100 g', nbSee: "Ko'rish", nbClose: 'Yopish', pUnit: 'Qancha?', pMeal: 'Qaysi ovqat?', pSave: 'Saqlash', pEstNote: "Taxminiy qiymat: aniq retsept va porsiyaga qarab o'zgaradi.", pEdit: 'Ovqatni tahrirlash', pMacro: "oqsil {p} · yog' {f} · uglevod {c}", favOn: 'Sevimlilarga qo\'shildi', favOff: 'Sevimlilardan olindi',
      cT: "O'z taomim", cName: 'Nomi', cKcal: 'Necha kkal? (bir porsiyada)', cG: "Porsiya og'irligi, g (ixtiyoriy)", cP: 'Oqsil, g (ixtiyoriy)', cF: "Yog', g (ixtiyoriy)", cC: 'Uglevod, g (ixtiyoriy)',
      tT: "Matn bilan qo'shish", tPh: 'Masalan: 1 kosa osh, 2 somsa, choy shakar bilan', tGo: 'Aniqlash', tMiss: 'Topilmadi: {x}', tAi: 'AI bilan aniqlash', tAiNote: "Bu matn AI xizmatiga yuboriladi (profil, vazn va tarix yuborilmaydi).", tAiBusy: 'Aniqlanmoqda…', tAiErr: "AI hozir ishlamayapti. Qo'lda qo'shing.", tOffline: "Internet yo'q — AI ishlamaydi. Topilganlarini saqlashingiz mumkin.", tSave: '{n} ta ovqatni saqlash', tAiTag: 'AI taxmini', tHelp: "Faqat siz tasdiqlaganingizda saqlanadi.", tEmpty: 'Hech narsa topilmadi',
      fT: 'Ovqat', fDay: 'Kun', fAddText: "Matn bilan qo'shish", fFavs: 'Sevimlilar', fNoFavs: "Sevimli ovqatlar yo'q. Ovqat qo'shayotganda yurakchani bosing.",
      stT: 'Qadam', stGoal: 'Maqsad: {x}', stEnter: 'Telefondagi jami qadamni yozing', stWhere: 'Qadam sonini qayerdan topaman?', stWeek: 'Oxirgi 7 kun', stCmp: "Bu {km} km — {route} yo'lining {pct}%", stCmpFull: 'Bu taxminan {route} masofasi ({km} km) dan ko\'proq', stMonth: 'Shu oy', stGoalSet: 'Kunlik qadam maqsadi', stDayEdit: '{d} kuni qadami', stTotal: 'Jami: {n} qadam · {km} km · {k} kkal', stNoRank: 'Bu faqat o\'zingiz uchun — reyting yo\'q.',
      hT: 'Qadam sonini qayerdan topaman?', hIos: "iPhone: «Salomatlik» (Health) ilovasi → Ko'rish → Qadamlar", hSam: 'Samsung: Samsung Health → bosh sahifa → Qadamlar', hGoo: 'Android: Google Fit → bosh sahifa → Qadamlar', hNote: "Jami qadamni yozing — ilova masofa va kaloriyani o'zi hisoblaydi.",
      meT: 'Men', meProf: 'Profil', meEdit: 'Tahrirlash', meW: 'Vazn', meAddW: "Vazn qo'shish", meAvg: '7 kunlik o\'rtacha: {x} kg', meAvgH: "Bir kunlik tebranish muhim emas — o'rtacha chiziqqa qarang.", meNoW: "Vazn yozilmagan", meGoalW: "Maqsad vazni, kg (ixtiyoriy)", meProg: "Maqsadgacha {x} kg qoldi", meDelta: 'Boshlanishdan {x} kg', meShare: 'Natijamni ulashish',
      pfAge: 'Yosh', pfH: "Bo'y, sm", pfW: 'Vazn, kg', pfAct: 'Faollik', pfGoal: 'Maqsad', pfSex: 'Jins', pfSaved: "Me'yor yangilandi: {x} kkal",
      wtT: 'Vaznni yozish', wDay: 'Qaysi kun?',
      kcBtn: 'Kunni ulashish', kcT: 'Kun kartasi', kcH: "Rasmda faqat kun natijasi bor — vazn va shaxsiy ma'lumot yo'q.", kcGo: 'Ulashish', kcGoal: 'maqsad', kcKcal: 'kkal', kcSteps: 'Qadam', kcTop: 'Kunning asosiy taomi', shT: 'Natijamni ulashish', shH: "Faqat o'zingiz tanlagan raqamlar rasmga tushadi.", shDays: 'Kunlar', shSteps: 'Qadam', shKm: 'Masofa', shWeight: "Vazn o'zgarishi", shGo: 'Rasmni ulashish', shDl: 'Rasmni yuklab olish', shTitle: 'Mening natijam', shWin: 'Oxirgi 30 kun', shDaysV: 'kun yozdim', shStepsV: 'qadam', shKmV: 'km yurdim', shWV: 'kg', shNone: 'Hech narsa tanlanmagan',
      sExp: 'Zaxira nusxa olish', sImp: 'Zaxira nusxadan tiklash', sDel: "Hammasini o'chirish", sLang: 'Til', sFont: "Shrift o'lchami", fN: 'Oddiy', fB: 'Katta', sTips: "Yo'l-yo'riqni qayta ko'rish", sAbout: 'Ilova haqida', priv: "Ma'lumotlaringiz faqat shu qurilmada saqlanadi.", med: "Bu tibbiy maslahat emas. Taxminiy hisob: sog'liq masalasida shifokor bilan maslahatlashing.",
      expDone: 'Zaxira nusxa saqlandi', impT: 'Zaxira nusxadan tiklash', impAsk: "Hozirgi ma'lumot zaxira nusxadagi bilan almashtiriladi. Davom etasizmi?", impOk: 'Tiklandi', impBad: "Zaxira nusxa fayli noto'g'ri", delAsk1: "Hamma ma'lumot o'chiriladi.", delAsk2: "Aniq o'chiraymi? Qaytarib bo'lmaydi.", deleted: "Hammasi o'chirildi",
      xKcalT: "Bu raqam qanday hisoblanadi?", xTarget: "Kunlik me'yor", xLimit: "Bugungi me'yor", xEaten: 'Yeyilgan', xSteps: 'Odatiydan ortiq qadamlar', xRem: 'Yana yeyish mumkin', xWhyStep: "Faollik darajangizdagi odatiy qadam soni ({base}) me'yorga allaqachon kiritilgan. Faqat undan ORTIQ qadamlar uchun to'liq sof kaloriya qo'shiladi: (3,5 − 1) × vazn × (masofa ÷ 5 km/soat). Chegaradan kam bo'lsa 0 qo'shiladi — me'yor kamaymaydi.", xHowT: "Me'yor qanday chiqdi?", xBmr: 'Tinch holatdagi sarf (BMR)', xBmrN: 'Mifflin–St Jeor formulasi', xAct: 'Faollik koeffitsienti', xTdee: 'Kunlik sarf (TDEE)', xGoal: 'Maqsad uchun farq', xFloor: "Pastki xavfsiz chegara", xTargetR: "Kunlik me'yor",
      xMacroT: 'Qanday hisoblangan?', xProt: 'Oqsil: {pk} g/kg × {w} kg = {p} g', xFat: "Yog': kaloriyaning 27,5% i ÷ 9 = {f} g", xCarb: "Uglevod: qolgan kaloriya ÷ 4 = {c} g", xMacroN: 'Oqsil mushaklarni saqlaydi, yog\' va uglevod energiya beradi.',
      xWaterT: 'Suv me\'yori', xWater: '33 ml × {w} kg = {ml} ml ÷ 250 ml = {n} stakan', xWaterN: 'Issiq kunlarda va mashq qilganda ko\'proq ichsangiz bo\'ladi.',
      xStepT: 'Qadam qanday hisoblanadi?', xStride: "Qadam uzunligi: bo'y × 0,414 = {s} sm", xDist: 'Masofa: {n} qadam × {s} sm = {km} km', xKc: 'Kaloriya: 3,5 × {w} kg × ({km} km ÷ 5 km/soat) = {k} kkal', xKcN: "Yurish tezligi 5 km/soat deb olingan (oddiy yurish). Hisob taxminiy.",
      xWeightT: "Vazn yorlig'i nimani bildiradi?", xWeightN: "1 ta o'lchov — «Birinchi o'lchov». 2–6 ta bo'lsa — oxirgi 7 kundagi o'lchovlar o'rtachasi. 7 kundan ko'p tarix bo'lsa — 7 kunlik o'rtacha va oldingi 7 kunga nisbatan trend. Vazn kun davomida 1–2 kg tebranadi, shu sababli bitta o'lchovga qarab xulosa qilmang.",
      tip1: "Bu yerda bugun nechta kkal yeganingiz va qancha qolgani ko'rinadi. Ovqat yozsangiz «Qoldi» kamayadi.", tip2: "«Ovqat qo'shish» tugmasi — qidiring, porsiyani tanlang, qo'shing. Odatda 3 ta bosish yetadi.", tip3: "«Tarix»da kunlar, taqvim, vazn, hafta xulosasi va qadam tarixi bor — ilova qadamdan masofa va kaloriyani o'zi hisoblaydi.",
      wkT: "O'tgan hafta", wkAvgK: "To'liq kunlarda o'rtacha: {x} kkal/kun", wkAvgS: "O'rtacha qadam: {x}", wkW: "Vazn (7 kunlik o'rtacha): {a} → {b} kg", wkDays: "7 kundan {n} tasi to'liq", wkNone: "Ma'lumot kam",
      nudgeInstall: "Ilovani bosh ekranga qo'shing — tezroq ochiladi va ma'lumot saqlanadi.", nudgeInstallBtn: "O'rnatish", nudgeIos: "iPhone'da: Safari'da «Ulashish» → «Bosh ekranga qo'shish». Aks holda Safari ma'lumotni o'chirib yuborishi mumkin.", nudgeBackup: "Haftalik zaxira vaqti — ma'lumot faqat shu qurilmada.", nudgeBackupBtn: 'Telegramga yuborish',
      qtyMinus: 'Kamaytirish', qtyPlus: "Ko'paytirish", aboutBack: 'Orqaga', errAmt: 'Raqamni kiriting', stepsT: 'Bugungi qadam', stepsOf: '{d} kuni qadami',
      units: { g100: 'g', kosa: 'kosa', likop: 'lagan', dona: 'dona', bolak: "bo'lak", stakan: 'stakan', qoshiq: 'osh qoshiq', choyq: 'choy qoshiq', piyola: 'piyola', porsiya: 'porsiya', hovuch: 'hovuch', tilim: 'tilim', shisha: 'shisha', six: 'six', skup: 'skup', shisha05: 'shisha (0,5 l)', shisha1: 'shisha (1 l)', shisha15: 'shisha (1,5 l)', banka: 'banka', shar: 'shar', paket: 'paket', plitka: 'plitka', ryumka: 'ryumka', bokal: 'bokal', bog: "bog'", barg: 'barg', qadoq: 'qadoq' }
    },
    ru: {
      obLater: 'Позже', obLater2: 'Позже — начать со средней нормой', txChip: 'Примерно · Уточнить', txP: 'Норма примерная', obYq2: 'Есть что-то, что вы не едите?', obYh2: 'Отмеченное вам предлагаться не будет. Можно ничего не выбирать.', obYno: 'Нет, ем всё', obYgo: 'Продолжить', txT: 'Ваша норма примерная — уточните за 30 секунд', txBtn: 'Уточнить', sldMinus: 'Уменьшить', sldPlus: 'Увеличить', sldEdit: 'Ввести точное значение',
      appName: 'KalkiFit', navToday: 'Сегодня', navFood: 'Еда', navSteps: 'Шаги', navMe: 'Я', add: 'Добавить еду', kcal: 'ккал', gram: 'г', km: 'км',
      today: 'Сегодня', apkT: 'Скачать приложение для Android', apkH: 'Приложение для установки на телефон (APK)', jClose: 'Закрыть (на сегодня)', yesterday: 'Вчера', back: 'Назад', next: 'Далее', start: 'Начать', save: 'Сохранить', cancel: 'Отмена', del: 'Удалить', close: 'Закрыть', confirm: 'Подтвердить', later: 'Позже', saved: 'Сохранено', del1: 'Запись удалена',
      mealb: 'Завтрак', meall: 'Обед', mealds: 'Ужин', mealss: 'Перекус', meald: 'Ужин', meals: 'Перекус',
      o1q: 'Ваш пол?', male: 'Мужской', female: 'Женский', preg: 'Я беременна или кормлю грудью', o2q: 'Сколько вам лет?', o2h: 'Только для расчёта дневной нормы.', o3q: 'Ваш рост в сантиметрах?', o4q: 'Ваш вес в килограммах?', o4h: 'Двигайте линейку или нажимайте − / +. Примерное значение тоже подойдёт.', o3h: 'Двигайте линейку или нажимайте − / +.',
      o5q: 'Как проходит ваш день?', o6q: 'Ваша цель?', errAge: 'Введите от 10 до 100', errHeight: 'Введите от 120 до 230', errWeight: 'Введите от 30 до 250',
      a1: 'Больше сижу', a1h: 'Работаю в офисе или дома, мало хожу', a2: 'Слегка активный', a2h: 'Немного хожу или 1–2 тренировки в неделю', a3: 'Умеренно активный', a3h: '3–5 тренировок в неделю', a4: 'Очень активный', a4h: 'Тренировки почти каждый день', a5: 'Тяжёлый физический труд', a5h: 'Весь день на ногах, тяжёлая работа',
      gkeep: 'Сохранить вес', gkeepH: 'Удерживать текущий вес', gslow: 'Медленно снижать', gslowH: '≈ 0,25 кг в неделю', glose: 'Снижать', gloseH: '≈ 0,5 кг в неделю', ggain: 'Набирать', ggainH: '≈ 0,25 кг в неделю', gLocked: 'В вашем случае считается только режим сохранения веса.',
      rT: 'Ваша дневная норма', rWhyKeep: 'Вы тратите примерно {tdee} ккал в день. Чтобы сохранить вес, достаточно столько и есть.', rWhyLose: 'Вы тратите примерно {tdee} ккал в день. Чтобы терять ≈ {kg} кг в неделю, нужно есть на {d} ккал меньше.', rWhyGain: 'Вы тратите примерно {tdee} ккал в день. Чтобы набирать ≈ {kg} кг в неделю, нужно есть на {d} ккал больше.',
      rFloor: 'Темп снижения приведён к безопасной границе ({min} ккал), поэтому ≈ {kg} кг в неделю.', rDoc: 'Проконсультируйтесь с врачом. Этот расчёт только для сохранения веса.', under18: 'Для лиц младше 18 лет диета не рассчитывается.', pregN: 'Во время беременности и кормления диета не рассчитывается.', lowBmi: 'Ваш вес ниже нормы (ИМТ < 18,5): диета не рассчитывается.',
      disc: 'Приблизительный расчёт — не медицинская рекомендация.', rMacro: 'Белки {p} г · жиры {f} г · углеводы {c} г', rWater: 'Вода: {n} стаканов ({ml} мл)',
      ringOf: '/ {t} ккал', remLbl: 'Ещё можно съесть', overLbl: 'Больше нормы', stepPlus: 'За счёт шагов +{c} ккал', hHow: 'Как считается это число?', limitParts: '{t} норма + {c} за шаги', tAiSite: 'ИИ сегодня перегружен — добавьте еду через поиск (он работает и без интернета). Завтра ИИ снова заработает.', phSite: 'Анализ фото сегодня перегружен — добавьте еду текстом или через поиск. Завтра снова заработает.', hEmpty: 'Запишите первую еду — «Съели» и «Осталось» обновятся здесь.', stEmpty: 'Когда шаги посчитаются автоматически, столбики вырастут здесь.',
      mP: 'Белки', mF: 'Жиры', mC: 'Углеводы', wT: 'Вода', wOf: '{n} / {m} стаканов', wSplit: 'Вода {w} · Напитки {d}', wDrinkNote: 'Чай, кофе, молоко и сок тоже входят в дневной счёт воды.', wListT: 'Напитки и жидкие блюда', wHint: 'Нажимайте на стакан', wDone: 'Норма воды выполнена', sT: 'Шаги', sAdd: 'Ввести шаги', sNone: 'Сегодня шагов ещё нет', sGoalDone: 'Цель по шагам выполнена',
      addMeal: '+ Добавить', emptyMeal: 'Пока пусто',
      aT: 'Добавить еду', aFav: 'Избранное', aPop: 'Популярное', aNone: 'Не найдено', aText: 'Добавить текстом', aLoading: 'Загрузка базы…', aEst: 'примерно', per100: '{k} ккал / 100 г', all: 'Все',
      pwGramm: 'грамм', pwEq: '1 {u} ≈ {g} г', pwNow: 'сейчас {g} г', pwQty: 'Количество', pwQuick: 'Быстрый выбор', pwSwap: 'Заменить блюдо', pwSwapT: 'Похожие блюда', pwNoSim: 'Похожих блюд не найдено', pwDone: 'Готово', pwApprox: 'Примерное значение — подгоните порцию под себя.', pwAll: 'Добавить всё ({n})', pwEditRow: '{x} — изменить порцию', tplMore: 'Действия с приёмом пищи', tplSave1: 'Сохранить этот приём', tplSaveH: 'Как привычную еду', tplNameT: 'Название', tplNameIn: 'Или впишите своё', tplSaved: 'Сохранено: {x}', tplFull: 'Заполнено 12 — удалите ненужное в «Я» → «Привычная еда».', tplMine: 'Привычная еда', tplMineH: 'То, что вы едите часто', tplEmpty: 'Сохраните то, что часто едите, один раз — потом добавляйте в одно касание.', tplYest: 'Как вчера', tplYestT: 'Что вы ели вчера', tplAdd: 'Добавить ({n})', tplRen: 'Переименовать', tplDel1: 'Привычная еда удалена', tplUp: 'Выше', tplDown: 'Ниже', tplCnt: '{n} шт. · {k} ккал', tplChk: 'Выбрать', tplS0: 'Домашний завтрак', tplS1: 'Завтрак на работе', tplS2: 'После тренировки', tplL0: 'Домашний обед', tplL1: 'Обед на работе', tplD0: 'Домашний ужин', tplD1: 'Лёгкий ужин', tplT0: 'Перекус', tplT1: 'Перекус на работе', tplSaveS: 'Сохранить', tplToday: 'Записано сегодня', tplTodayRow: '{n} шт. · {k} ккал', tplNoToday: 'Сначала запишите еду — потом здесь её можно сохранить в одно касание.', tplAddFood: 'Добавить еду', tplSugT: 'Вы часто едите: {x} — сохранить?', tplNo: 'Нет', tplHint: 'Сохраните один раз — потом добавляйте в одно касание.', famN: '{n} вид.', famDef: 'обычный вариант', srcBtn: 'Источник', srcNone: 'Для этого блюда нет записи об источнике.', srcApprox: 'Рецепт основан на среднем домашнем блюде, возможно отклонение ±15%.', srcApprox2: 'Значение основано на существующих таблицах, возможно отклонение ±15%.', srcAi: 'Это значение оценил ИИ — оно неточное.', srcUnitB: 'граммы единицы — существующее значение базы (на весах пока не проверено)', srcUnitA: 'граммы единицы — оценка по похожему блюду', vNew: 'Моя посуда', vfT: 'Насколько наполнена', vf_yarim: 'Половина', vf_tola: 'Полная', vf_kop: 'С горкой', vk_kosa: 'Миска', vk_lagan: 'Лаган', vk_piyola: 'Пиала', vk_likopcha: 'Тарелочка', vk_custom: 'Своя (впишу название)', vn_kosa: 'Моя миска', vn_lagan: 'Мой лаган', vn_piyola: 'Моя пиала', vn_likopcha: 'Моя тарелочка', vn_custom: 'Моя посуда', vs_kosa: 'Обычная миска', vs_lagan: 'Обычный лаган', vs_piyola: 'Обычная пиала', vs_likopcha: 'Обычная тарелочка', vs_custom: 'Обычная порция', vcT: 'Моя посуда', vcFor: 'для «{x}»', vcLink: 'Другая ваша посуда', vcKind: 'Вид посуды', vcName: 'Название', vcHow: 'Как определим объём?', vcScaleOn: 'Взвесил(а)', vcScaleOff: 'Весов нет', vcHint: 'Взвесьте пустую посуду, затем с едой — разница и есть ваша еда.', vcFull: 'Вес с едой (г)', vcEmpty: 'Вес пустой посуды (г)', vcDirect: 'Или сразу вес еды (г)', vcRes: 'Еда: {g} г', vcStd: '{k} ≈ {g} г', vcCompare: 'Ваша посуда по сравнению со стандартной?', vc_kichik: 'Меньше (×0,75)', vc_ohshash: 'Такая же (×1)', vc_katta: 'Больше (×1,3)', vcSave: 'Сохранить', vcBad: 'Вес от 10 до 3000 г', vcMax: 'Не больше 20 штук. Удалите лишнее в «Я» → «Моя посуда».', vSaved: 'Сохранено: {x}', vmT: 'Моя посуда', vmH: 'Ваши миски и лаганы', vmEmpty: 'Отметьте свою миску один раз — и расчёт станет точнее.', vmGuide: 'При добавлении еды в окне порции нажмите «+ Моя посуда».', vmMax: 'Не больше {n} штук.', vmDel1: 'Посуда удалена', vmEdit: 'Изменить', vmName: 'Название', vmFam: 'Блюда', vsugL: 'Вы всегда едите из своего лагана? Отметьте его один раз.', vsugK: 'Вы всегда едите из своей миски? Отметьте её один раз.', vsugYes: 'Отметить', vsugNo: 'Позже', navDiary: 'Дневник', navResults: 'Итоги', navProfile: 'Профиль', navAdd: 'Добавить', diaryT: 'Дневник', resT: 'Итоги', profT: 'Профиль', todayDate: 'Сегодня, {d}', cEaten: 'Съели', cGoal: 'Цель', cLeft: 'Осталось', cOver: '{x} ккал сверх нормы', cNote: 'По внесённым блюдам', mainAdd: 'Добавить', wCard: '{a} / {b} мл', wAdd: '+250', sCard: '{n} шагов', sEnter: 'Ввести', sNoneC: 'Сегодня не введено', macroRow: 'Белки · Жиры · Углеводы', fabMenuT: 'Что добавим?', fabFood: 'Еда', fabWater: 'Вода', fabSteps: 'Шаги', fabWeight: 'Вес', wOpenT: 'Вода', themeT: 'Тема', thAuto: 'Авто', thLight: 'Светлая', thDark: 'Тёмная', profData: 'Цель и данные', resWeekT: 'Итоги недели', resMore: 'Подробнее', diaryAdd: 'Добавить еду на этот день', profBackup: 'Резервная копия и перенос', calInfoT: 'Как считается календарь?', hStreak: '{n} дн.', cBurn: 'Сожжено', vLeft: 'Осталось', vAria: 'Ещё можно съесть {k} ккал', vAriaO: 'Съедено на {k} ккал сверх нормы', wAdd2: '+250 мл', sTap: 'Введите шаги', wRowT: 'Вес: {x} кг', wRowW: 'За неделю {d} кг', avL: 'К',
      mlPct: '{n} шт. · {p}% дня', mlMore: 'Ещё {n} · {x}', mlEmpty: 'Пока пусто — нажмите, чтобы добавить',
      mealAdd_b: 'Добавить завтрак', mealAdd_l: 'Добавить обед', mealAdd_d: 'Добавить ужин', mealAdd_s: 'Добавить перекус', mealS_b: 'Завтрак', mealS_l: 'Обед', mealS_d: 'Ужин', mealS_s: 'Перекус',
      pCta_b: 'Добавить в завтрак · {k} ккал', pCta_l: 'Добавить в обед · {k} ккал', pCta_d: 'Добавить в ужин · {k} ккал', pCta_s: 'Добавить в перекус · {k} ккал', pCtaE: 'Сохранить · {k} ккал',
      aCnt: '{n} блюд · {k} ккал', pTypeT: 'Вид и размер', pChange: 'Изменить', pCloseL: 'Закрыть', pMealT: 'Приём пищи', aDone: 'Добавлено', pManba: 'Источник',
      aDefOne: '{x} ≈ {k} ккал', aQuickAdd: 'Добавить', aAdded: 'Добавлено: {x}', pAddBtn: 'Добавить', pMoreT: 'Уточнить вид и размер', pMore2T: 'Другие настройки', srcPer100: '{k} ккал / 100 г', nbSee: 'Смотреть', nbClose: 'Закрыть', pUnit: 'Сколько?', pMeal: 'Какой приём пищи?', pSave: 'Сохранить', pEstNote: 'Значение примерное: зависит от рецепта и порции.', pEdit: 'Изменить запись', pMacro: 'белки {p} · жиры {f} · углеводы {c}', favOn: 'Добавлено в избранное', favOff: 'Убрано из избранного',
      cT: 'Моё блюдо', cName: 'Название', cKcal: 'Сколько ккал? (в одной порции)', cG: 'Вес порции, г (по желанию)', cP: 'Белки, г (по желанию)', cF: 'Жиры, г (по желанию)', cC: 'Углеводы, г (по желанию)',
      tT: 'Добавить текстом', tPh: 'Например: 1 миска плова, 2 самсы, чай с сахаром', tGo: 'Распознать', tMiss: 'Не найдено: {x}', tAi: 'Определить с помощью ИИ', tAiNote: 'Этот текст будет отправлен сервису ИИ (профиль, вес и история не отправляются).', tAiBusy: 'Определяю…', tAiErr: 'ИИ сейчас недоступен. Добавьте вручную.', tOffline: 'Нет интернета — ИИ не работает. Найденное можно сохранить.', tSave: 'Сохранить: {n}', tAiTag: 'оценка ИИ', tHelp: 'Сохраняется только после вашего подтверждения.', tEmpty: 'Ничего не найдено',
      fT: 'Еда', fDay: 'День', fAddText: 'Добавить текстом', fFavs: 'Избранное', fNoFavs: 'Избранного нет. Нажмите на сердечко при добавлении еды.',
      stT: 'Шаги', stGoal: 'Цель: {x}', stEnter: 'Введите общее число шагов с телефона', stWhere: 'Где посмотреть число шагов?', stWeek: 'Последние 7 дней', stCmp: 'Это {km} км — {pct}% пути {route}', stCmpFull: 'Это больше расстояния {route} (≈ {km} км)', stMonth: 'За этот месяц', stGoalSet: 'Дневная цель по шагам', stDayEdit: 'Шаги за {d}', stTotal: 'Всего: {n} шагов · {km} км · {k} ккал', stNoRank: 'Это только для вас — никаких рейтингов.',
      hT: 'Где посмотреть число шагов?', hIos: 'iPhone: приложение «Здоровье» → Обзор → Шаги', hSam: 'Samsung: Samsung Health → главная → Шаги', hGoo: 'Android: Google Fit → главная → Шаги', hNote: 'Введите общее число шагов — расстояние и калории приложение посчитает само.',
      meT: 'Я', meProf: 'Профиль', meEdit: 'Изменить', meW: 'Вес', meAddW: 'Записать вес', meAvg: 'Среднее за 7 дней: {x} кг', meAvgH: 'Колебания за один день не важны — смотрите на линию среднего.', meNoW: 'Вес не записан', meGoalW: 'Желаемый вес, кг (по желанию)', meProg: 'До цели осталось {x} кг', meDelta: 'С начала: {x} кг', meShare: 'Поделиться результатом',
      pfAge: 'Возраст', pfH: 'Рост, см', pfW: 'Вес, кг', pfAct: 'Активность', pfGoal: 'Цель', pfSex: 'Пол', pfSaved: 'Норма обновлена: {x} ккал',
      wtT: 'Записать вес', wDay: 'За какой день?',
      kcBtn: 'Поделиться днём', kcT: 'Карточка дня', kcH: 'На картинке только итог дня — без веса и личных данных.', kcGo: 'Поделиться', kcGoal: 'цель', kcKcal: 'ккал', kcSteps: 'Шаги', kcTop: 'Главное блюдо дня', shT: 'Поделиться результатом', shH: 'На картинку попадут только выбранные вами цифры.', shDays: 'Дни', shSteps: 'Шаги', shKm: 'Расстояние', shWeight: 'Изменение веса', shGo: 'Поделиться картинкой', shDl: 'Скачать картинку', shTitle: 'Мой результат', shWin: 'Последние 30 дней', shDaysV: 'дн. вёл записи', shStepsV: 'шагов', shKmV: 'км пройдено', shWV: 'кг', shNone: 'Ничего не выбрано',
      sExp: 'Сделать резервную копию', sImp: 'Восстановить из резервной копии', sDel: 'Удалить всё', sLang: 'Язык', sFont: 'Размер шрифта', fN: 'Обычный', fB: 'Крупный', sTips: 'Показать подсказки снова', sAbout: 'О приложении', priv: 'Ваши данные хранятся только на этом устройстве.', med: 'Это не медицинская рекомендация. Расчёт приблизительный: по вопросам здоровья консультируйтесь с врачом.',
      expDone: 'Резервная копия сохранена', impT: 'Восстановление из резервной копии', impAsk: 'Текущие данные будут заменены данными из резервной копии. Продолжить?', impOk: 'Восстановлено', impBad: 'Неверный файл резервной копии', delAsk1: 'Все данные будут удалены.', delAsk2: 'Точно удалить? Вернуть нельзя.', deleted: 'Всё удалено',
      xKcalT: 'Как считается это число?', xTarget: 'Дневная норма', xLimit: 'Норма на сегодня', xEaten: 'Съедено', xSteps: 'Шаги сверх обычного', xRem: 'Ещё можно съесть', xWhyStep: 'Обычное число шагов для вашего уровня активности ({base}) уже учтено в норме. Прибавляются калории только за шаги СВЕРХ этого порога, полностью и «чистыми»: (3,5 − 1) × вес × (расстояние ÷ 5 км/ч). Если шагов меньше порога — прибавляется 0, норма не уменьшается.', xHowT: 'Как получилась норма?', xBmr: 'Расход в покое (BMR)', xBmrN: 'формула Миффлина — Сан-Жеора', xAct: 'Коэффициент активности', xTdee: 'Дневной расход (TDEE)', xGoal: 'Разница для цели', xFloor: 'Нижняя безопасная граница', xTargetR: 'Дневная норма',
      xMacroT: 'Как посчитано?', xProt: 'Белки: {pk} г/кг × {w} кг = {p} г', xFat: 'Жиры: 27,5% калорий ÷ 9 = {f} г', xCarb: 'Углеводы: остаток калорий ÷ 4 = {c} г', xMacroN: 'Белок сохраняет мышцы, жиры и углеводы дают энергию.',
      xWaterT: 'Норма воды', xWater: '33 мл × {w} кг = {ml} мл ÷ 250 мл = {n} стаканов', xWaterN: 'В жару и при тренировках можно пить больше.',
      xStepT: 'Как считаются шаги?', xStride: 'Длина шага: рост × 0,414 = {s} см', xDist: 'Расстояние: {n} шагов × {s} см = {km} км', xKc: 'Калории: 3,5 × {w} кг × ({km} км ÷ 5 км/ч) = {k} ккал', xKcN: 'Скорость ходьбы принята 5 км/ч (обычная ходьба). Расчёт приблизительный.',
      xWeightT: 'Что означает подпись под весом?', xWeightN: 'Одно измерение — «Первое измерение». 2–6 измерений — среднее за последние 7 дней. Если истории больше 7 дней — среднее за 7 дней и тренд относительно предыдущих 7 дней. Вес в течение дня колеблется на 1–2 кг, поэтому не делайте выводов по одному измерению.',
      tip1: 'Здесь видно, сколько ккал вы съели сегодня и сколько осталось. Записываете еду — «Осталось» уменьшается.', tip2: 'Кнопка «Добавить еду» — найдите блюдо, выберите порцию, добавьте. Обычно хватает 3 нажатий.', tip3: 'В «Истории» — дни, календарь, вес, итоги недели и история шагов; по шагам приложение само считает расстояние и калории.',
      wkT: 'Прошлая неделя', wkAvgK: 'В полные дни в среднем: {x} ккал/день', wkAvgS: 'В среднем шагов: {x}', wkW: 'Вес (среднее за 7 дней): {a} → {b} кг', wkDays: '{n} из 7 дней полные', wkNone: 'Мало данных',
      nudgeInstall: 'Добавьте приложение на главный экран — открывается быстрее, данные надёжнее.', nudgeInstallBtn: 'Установить', nudgeIos: 'На iPhone: в Safari «Поделиться» → «На экран «Домой»». Иначе Safari может удалить данные.', nudgeBackup: 'Пора сделать недельную копию — данные хранятся только на этом устройстве.', nudgeBackupBtn: 'Отправить в Telegram',
      qtyMinus: 'Меньше', qtyPlus: 'Больше', aboutBack: 'Назад', errAmt: 'Введите число', stepsT: 'Шаги за сегодня', stepsOf: 'Шаги за {d}',
      units: { g100: 'г', kosa: 'миска', likop: 'тарелка', dona: 'шт.', bolak: 'кусок', stakan: 'стакан', qoshiq: 'ст. ложка', choyq: 'ч. ложка', piyola: 'пиала', porsiya: 'порция', hovuch: 'горсть', tilim: 'ломтик', shisha: 'бутылка', six: 'шампур', skup: 'мерная ложка', shisha05: 'бутылка (0,5 л)', shisha1: 'бутылка (1 л)', shisha15: 'бутылка (1,5 л)', banka: 'банка', shar: 'шарик', paket: 'пачка', plitka: 'плитка', ryumka: 'рюмка', bokal: 'бокал', bog: 'пучок', barg: 'лист', qadoq: 'упаковка' }
    }
  };
  /* ---------- 2-bosqich matnlari: hazillar, "Buni yesam-chi?", retsept, taqvim, rasm, qo'shimchalar ---------- */
  Object.assign(D.uz, {
    jkT: 'Maslahat va hazil', perPortion: 'kkal / porsiya', spUl: 'Yuqori chegara (UL)', jkOn: 'Yoqilgan', jkOff: "O'chirilgan", jkCity: 'Shahringiz', jkCityH: 'Masofa taqqoslashlari shu shahardan boshlanadi', jkParty: "Bugun to'y yoki bayram kuni", jkNote: "Qiziqarli gaplar faqat ovqat, qadam va kundalik hayot ustidan — vazn va tana haqida gap yo'q.",
    stRouteF: "Bu {km} km — {route} masofasi ({rk} km) dan ko'proq", stRouteP: "Bu {km} km — {route} yo'lining {pct}%", cityPick: 'Shaharni tanlang',
    yT: 'Buni yesam-chi?', yBtn: 'Buni yesam-chi?', yPh: 'Qaysi ovqat? (somsa, osh, kola…)', yPick: 'Ovqatni tanlang — nima bo\'lishini ko\'ring', yRem: "Bugun me'yordan qoladi: {x} kkal", yAfterOk: 'Yesangiz: {x} kkal qoladi', yAfterOver: "Yesangiz: me'yordan {x} kkal oshadi", yWalk: 'Yoqish uchun: ≈ {min} daqiqa yurish (≈ {steps} qadam)', yNoSave: "Hech narsa saqlanmaydi — faqat oqibatni ko'rsatadi.", yAdd: 'Yeyman — yozib qo\'yish',
    rcT: "O'z taomim (retsept)", rcName: 'Taom nomi', rcNamePh: "masalan, Onamning oshi", rcIng: 'Masalliqlar', rcAdd: "+ Masalliq qo'shish", rcNoIng: "Hali masalliq yo'q", rcPortions: 'Necha porsiya chiqadi?', rcPer: 'Bir porsiya: {k} kkal', rcPerMac: "oqsil {p} · yog' {f} · uglevod {c} · {g} g", rcTotal: 'Hammasi: {g} g · {k} kkal', rcSave: 'Saqlash', rcSaved: "«{n}» saqlandi — endi qidiruvda chiqadi", rcPickIng: 'Masalliqni tanlang', rcGrams: 'Necha gramm?', rcAddIng: "Qo'shish", rcMine: 'Mening taomlarim', rcNoMine: "Hali retsept yo'q", rcDelete: "Taomni o'chirish", rcDeleted: "Taom o'chirildi", rcEdit: 'Retseptni tahrirlash', rcNew: "+ Retsept qo'shish", rcMineH: "Masalliqlarni gramm bilan yozing — bir porsiya kkal va makro o'zi hisoblanadi.", rcQ: 'Masalliq nomi', aRecipe: 'Retsept',
    calT: 'Oylik taqvim', calNear: 'Maqsadga yaqin', calLow: 'Pastroq', calHigh: 'Yuqoriroq', calPart: 'Qisman / davom etmoqda', calNone: "Ma'lumot yo'q", calPre: 'Kuzatuv boshlanmagan', calStart: 'Kuzatuv boshlangan: {d}', stNone: "Ma'lumot yo'q", stLive: 'Kun davom etmoqda', stPart: 'Qisman yozilgan', stNear: 'Maqsadga yaqin', stLow: 'Pastroq', stHigh: 'Yuqoriroq', stPre: 'Kuzatuv boshlanmagan', stFull: "To'liq kun", deBtn: 'Kunni yakunlash', deHint: "Hamma ovqatni yozgan bo'lsangiz, kunni yakunlang — statistika faqat to'liq kunlardan hisoblanadi.", deDone: 'Kun yakunlandi', deLow: "Kun yakunlandi, lekin yozuv maqsadning yarmidan kam — «qisman» bo'lib qoladi", deDoneL: 'Kun yakunlandi ✓', wFirst: "Birinchi o'lchov", wLast: "Oxirgi o'lchov", wAvgN: "Oxirgi 7 kundagi {n} ta o'lchov o'rtachasi: {x} kg", wTrend: "7 kunlik o'rtacha (trend): {x} kg", wTrendD: 'oldingi 7 kunga nisbatan {d} kg', wkNoFull: "To'liq kun yo'q — o'rtacha hisoblanmadi", xStepBase: "Odatiy chegara: {base} qadam. Bugun ortig'i: {n} qadam → +{k} kkal (sof)", calStreak: '{n} kun ketma-ket yozdingiz', calStreak0: "Seriya hali yo'q — bugun yozilsa boshlanadi", calNote: "Faqat to'liq kunlar (yakunlangan yoki o'tib ketgan, yozuv maqsadning ≥50% i) maqsad bilan solishtiriladi. Ranglar baho emas.", calDays: '{n} kun', calOpen: 'Kunni ochish',
    phPerm: "Kameraga ruxsat berilmadi. Telefon sozlamalarida KalkiFit uchun kamerani yoqing yoki rasmni galereyadan tanlang.", phErrPick: "Rasm olinmadi. Boshqa usulni sinab ko'ring.", phFile: 'Fayllardan', phWhy: "Rasm ovqat tanishga yuboriladi",
    aiLeft: "Bugungi AI so'rovlari: {n} tadan {q} ta qoldi.", aiLimit: "Bugungi {n} ta AI so'rov ishlatildi. Ertaga yana urinib ko'ring.", phNotIt: 'Bu emasmi?', phFind: 'Boshqasini qidirish', phFindPh: 'Taom nomini yozing', phFindT: 'Bazadan qidirish', phDb: 'bazadan', phAiKcal: 'AI taxmini ±30%',
    phErrFmt: "Rasm o'qilmadi. Boshqa rasm tanlang yoki qayta suratga oling.", phErrBig: "Rasm juda katta. Boshqa rasm tanlang.", phErrNet: "Internet yo'q yoki aloqa uzildi. Ulanishni tekshirib, qayta urinib ko'ring.", phErrTime: "Javob kechikdi. Qayta urinib ko'ring.", phErrSrv: "Server xatosi. Birozdan keyin qayta urinib ko'ring.",
    phBtn: 'Rasm', phGal: 'Galereyadan', phCam: 'Rasmga olish', phT: "Rasm bilan qo'shish", phNote: 'Rasm AI xizmatiga yuboriladi va saqlanmaydi.', phBusy: 'Rasm tahlil qilinmoqda…', phErr: "Rasmni aniqlab bo'lmadi. Qo'lda qo'shing.", phLimit: "Bugungi rasm limiti tugadi (kuniga 10 ta). Ertaga urinib ko'ring.", phOffline: "Internet yo'q — rasm tugmasi o'chiq", phApprox: 'taxminiy ±30%', phScale: 'Porsiyani tuzating', phNone: 'Rasmda ovqat topilmadi. Boshqa rasm yoki matn bilan urinib ko\'ring.', phSave: '{n} ta ovqatni saqlash', phHint: 'Natijani ko\'rib, porsiyani tuzatib tasdiqlang.', phPick: 'Kamera yoki galereya', tkNote: "Tasdiqlasangiz, ovqat nomi va kkal (shaxsiy ma'lumotsiz) umumiy bazaga taklif sifatida yuboriladi.",
    spT: 'Vitamin va qo\'shimchalar: kerakmi?', spCardT: 'Vitamin va BAD — kerakmi?', spH: "Ko'pchilikka kerak emas — avval ovqatni ko'ring.", spSearch: 'Qidirish (D vitamini, kreatin…)', spWhat: 'Nima va nima uchun kerak', spFood: 'Ovqatdan qayerdan olinadi', spWho: 'Kim uchun?', spNot: 'Qachon kerak emas?', spCare: "Ehtiyot bo'ling", spLvl: 'Dalil kuchi', spLvl_strong: 'Kuchli', spLvl_moderate: "O'rtacha", spLvl_low: 'Kam', spLvl_not: "Tavsiya etilmaydi", spEvL: 'Dalil: {t} {w}', spW_strong: 'kuchli', spW_moderate: "o'rtacha", spW_low: 'kam', spW_not: 'tavsiya etilmaydi', spTop: "Ro'yxatda — eng yuqori guruh bahosi; kartada hammasi.", spLvlH: "Foydasi haqidagi dalil kuchi (ma'lum guruhlar uchun).", spSrc: 'Manba: {s}', spChecked: 'Tekshirilgan: {d}', spProt: 'Bugun oqsil: {a} / {b} g', spNone: 'Topilmadi', spLoading: 'Yuklanmoqda…', spErr: "Ma'lumot yuklanmadi. Internetni tekshiring.", spRules: ["1. Avval ovqat.", "2. Tahlil bilan aniqlang.", "3. Ko'pi zararli bo'lishi mumkin."], spBack: 'Ro\'yxatga', srcNih: "NIH (AQSh Milliy sog'liqni saqlash institutlari), Qo'shimchalar idorasi", srcHarvard: "Harvard sog'liqni saqlash maktabi (Nutrition Source)"
  });
  Object.assign(D.ru, {
    jkT: 'Советы и шутки', perPortion: 'ккал / порция', spUl: 'Верхняя граница (UL)', jkOn: 'Включены', jkOff: 'Выключены', jkCity: 'Ваш город', jkCityH: 'Сравнения расстояний начинаются с этого города', jkParty: 'Сегодня свадьба или праздник', jkNote: 'Забавные фразы — только про еду, шаги и быт: про вес и тело — никогда.',
    stRouteF: 'Это {km} км — больше, чем путь {route} ({rk} км)', stRouteP: 'Это {km} км — {pct}% пути {route}', cityPick: 'Выберите город',
    yT: 'А если я это съем?', yBtn: 'А если я это съем?', yPh: 'Какая еда? (самса, плов, кола…)', yPick: 'Выберите еду — посмотрите, что будет', yRem: 'Сегодня до нормы остаётся: {x} ккал', yAfterOk: 'Если съесть: останется {x} ккал', yAfterOver: 'Если съесть: выше нормы на {x} ккал', yWalk: 'Чтобы сжечь: ≈ {min} мин ходьбы (≈ {steps} шагов)', yNoSave: 'Ничего не сохраняется — только показывает последствия.', yAdd: 'Съем — записать',
    rcT: 'Моё блюдо (рецепт)', rcName: 'Название блюда', rcNamePh: 'например, мамин плов', rcIng: 'Ингредиенты', rcAdd: '+ Добавить ингредиент', rcNoIng: 'Ингредиентов пока нет', rcPortions: 'Сколько порций получится?', rcPer: 'Одна порция: {k} ккал', rcPerMac: 'белки {p} · жиры {f} · углеводы {c} · {g} г', rcTotal: 'Всего: {g} г · {k} ккал', rcSave: 'Сохранить', rcSaved: '«{n}» сохранено — теперь найдётся в поиске', rcPickIng: 'Выберите ингредиент', rcGrams: 'Сколько граммов?', rcAddIng: 'Добавить', rcMine: 'Мои блюда', rcNoMine: 'Рецептов пока нет', rcDelete: 'Удалить блюдо', rcDeleted: 'Блюдо удалено', rcEdit: 'Изменить рецепт', rcNew: '+ Добавить рецепт', rcMineH: 'Впишите ингредиенты в граммах — ккал и БЖУ порции посчитаются сами.', rcQ: 'Название ингредиента', aRecipe: 'Рецепт',
    calT: 'Календарь месяца', calNear: 'Близко к цели', calLow: 'Ниже цели', calHigh: 'Выше цели', calPart: 'Частично / день идёт', calNone: 'Нет данных', calPre: 'Наблюдение не начато', calStart: 'Наблюдение начато: {d}', stNone: 'Нет данных', stLive: 'День продолжается', stPart: 'Частично записано', stNear: 'Близко к цели', stLow: 'Ниже цели', stHigh: 'Выше цели', stPre: 'Наблюдение не начато', stFull: 'Полный день', deBtn: 'Завершить день', deHint: 'Если записали всю еду — завершите день: статистика считается только по полным дням.', deDone: 'День завершён', deLow: 'День завершён, но записано меньше половины цели — он останется «частичным»', deDoneL: 'День завершён ✓', wFirst: 'Первое измерение', wLast: 'Последнее измерение', wAvgN: 'Среднее за последние 7 дней по {n} измерениям: {x} кг', wTrend: 'Среднее за 7 дней (тренд): {x} кг', wTrendD: 'по сравнению с предыдущими 7 днями {d} кг', wkNoFull: 'Нет полных дней — среднее не посчитано', xStepBase: 'Обычный порог: {base} шагов. Сегодня сверх него: {n} шагов → +{k} ккал (чистыми)', calStreak: 'Записи подряд: {n} дн.', calStreak0: 'Серии пока нет — начнётся, как только появится запись сегодня', calNote: 'Только полные дни (завершённые или прошедшие, записано ≥50% цели) сравниваются с целью. Цвета — не оценка.', calDays: '{n} дн.', calOpen: 'Открыть день',
    phPerm: 'Нет доступа к камере. Включите камеру для KalkiFit в настройках телефона или выберите фото из галереи.', phErrPick: 'Не удалось получить фото. Попробуйте другой способ.', phFile: 'Из файлов', phWhy: 'Фото отправляется для распознавания еды',
    aiLeft: 'AI-запросов на сегодня: осталось {q} из {n}.', aiLimit: 'Сегодняшние AI-запросы ({n}) использованы. Попробуйте завтра.', phNotIt: 'Не то?', phFind: 'Найти другое', phFindPh: 'Введите название блюда', phFindT: 'Поиск по базе', phDb: 'из базы', phAiKcal: 'оценка ИИ ±30%',
    phErrFmt: 'Фото не удалось прочитать. Выберите другое или снимите заново.', phErrBig: 'Фото слишком большое. Выберите другое.', phErrNet: 'Нет интернета или связь прервалась. Проверьте соединение и попробуйте снова.', phErrTime: 'Ответ задержался. Попробуйте ещё раз.', phErrSrv: 'Ошибка сервера. Попробуйте чуть позже.',
    phBtn: 'Фото', phGal: 'Из галереи', phCam: 'Сделать фото', phT: 'Добавить по фото', phNote: 'Фото отправляется сервису ИИ и не сохраняется.', phBusy: 'Анализирую фото…', phErr: 'Не удалось распознать фото. Добавьте вручную.', phLimit: 'Лимит фото на сегодня исчерпан (10 в день). Попробуйте завтра.', phOffline: 'Нет интернета — кнопка фото отключена', phApprox: 'примерно ±30%', phScale: 'Поправьте порцию', phNone: 'На фото не найдено еды. Попробуйте другое фото или текст.', phSave: 'Сохранить: {n}', phHint: 'Проверьте результат, поправьте порцию и подтвердите.', phPick: 'Камера или галерея', tkNote: 'Если подтвердите, название блюда и ккал (без личных данных) отправятся в общую базу как предложение.',
    spT: 'Витамины и добавки: нужны ли?', spCardT: 'БАД и витамины — нужны ли?', spH: 'Большинству не нужны — сначала посмотрите на питание.', spSearch: 'Поиск (витамин D, креатин…)', spWhat: 'Что это и зачем', spFood: 'Где взять из еды', spWho: 'Для кого?', spNot: 'Когда не нужно?', spCare: 'Осторожно', spLvl: 'Сила доказательств', spLvl_strong: 'Сильная', spLvl_moderate: 'Средняя', spLvl_low: 'Слабая', spLvl_not: 'Не рекомендуется', spEvL: 'Доказательства {t}: {w}', spW_strong: 'сильные', spW_moderate: 'средние', spW_low: 'слабые', spW_not: 'не рекомендуется', spTop: 'В списке — оценка самой сильной группы; в карточке все.', spLvlH: 'Насколько доказана польза (для определённых групп).', spSrc: 'Источник: {s}', spChecked: 'Проверено: {d}', spProt: 'Белок сегодня: {a} / {b} г', spNone: 'Не найдено', spLoading: 'Загрузка…', spErr: 'Данные не загрузились. Проверьте интернет.', spRules: ['1. Сначала еда.', '2. Уточните анализом.', '3. Лишнее может навредить.'], spBack: 'К списку', srcNih: 'NIH (Национальные институты здоровья США), Управление по пищевым добавкам', srcHarvard: 'Гарвардская школа общественного здравоохранения (Nutrition Source)'
  });
  Object.assign(D.uz, {
    bkT: 'Baliq kuni eslatmasi', bkH: "Haftada bir marta — {d} kuni, 11:00 da. Boshqa xabar yuborilmaydi.", bkOn: 'Yoqish', bkOff: "O'chirish", bkIsOn: 'Yoqilgan: {d} kuni, 11:00 da.', bkIos: "Avval ilovani Bosh ekranga qo'shing (Safari: Ulashish → «Bosh ekranga qo'shish»), keyin eslatmani shu yerdan yoqing.", bkDenied: "Brauzerda bildirishnomalar o'chirilgan. Sayt sozlamalaridan ruxsat bering.", bkNA: "Bu brauzer yoki qurilmada bildirishnomalar mavjud emas. Baliq kuni ilova ichida eslatma ko'rsatiladi.", bkErr: "Yoqib bo'lmadi. Keyinroq urinib ko'ring.",
    fcT: 'Bugun baliq kuni', bkT2: 'Baliq kuni', bkLine: 'Haftada bir kun eslatamiz. Qaysi kun?', bkIos2: "Avval Bosh ekranga qo'shing: Ulashish → «Bosh ekranga»", bkDen2: "Bildirishnomalar o'chiq — brauzer sozlamasidan yoqing", bkDen3: "Bildirishnomalar o'chiq — telefon sozlamasidan yoqing", bkNA2: "Bu qurilmada eslatma yo'q — Bugun ekranida ko'rsatamiz", bkAsk: 'Haftalik baliq kuni eslatmasini yoqasizmi?', bkAskH: "Haftada bitta xabar, baliq kuni 11:00 da. Istalgan payt o'chirasiz.", bkNo: 'Hozir emas', bkOk: 'Tushunarli', bkMsg: "Bugun baliq kuni 🐟 — yaqin kafedan buyurtma qilasizmi yoki uyda pishirasizmi?", bkBtn: 'Baliq kuni', bkNever: "Bundan keyin ko'rsatma", bkDone: 'Yoqildi: baliq kuni 11:00 da eslatamiz.', bkDoneOff: "Eslatma o'chirildi.",  
    qaT: 'Qadamlaringizni avtomatik sanaymizmi?', qaH: "Qadamlar Health Connect (Google Fit va boshqalar) yoki telefon sensoridan olinadi. Joylashuv olinmaydi.", qaYes: 'Ruxsat berish', qaLater: 'Keyinroq', qaBadge: 'Avtomatik', qaRow: 'Qadamni avtomatik sanash', qaRowH: "Health Connect (Google Fit, Samsung Health va boshqalar) yoki telefon sensoridan. GPS ishlatilmaydi, ma'lumot telefoningizda qoladi.", qaSrc_hc: 'Health Connect', qaSrc_sensor: 'Telefon sensori', qaConnT: 'Qadamlarni ulash', qaConn1: "1/2 — Health Connect'ni o'rnating, keyin shu yerga qayting.", qaConn2: "2/2 — «Ruxsat berish»ni bosing.", qaConnOne: "«Ruxsat berish»ni bosing — qadamlar o'zi keladi.", qaSkipHc: "O'rnatmasdan — faqat telefon sensori", qaNone: 'Qadamlar hali kelmayapti', qaFit: "Google Fit'ni o'rnatish", qaFitH: "Google Fit qadamni sanaydi va Health Connect'ga yozadi.", qaNoSensor: "Telefoningizda qadam sensori yo'q — qadamni Google Fit sanaydi.", diagT: 'Diagnostika', diagCopy: 'Nusxalash', diagOk: 'Nusxa olindi', qaFix: "Qo'lda tuzatish", qaHcInst: "Health Connect'ni o'rnatish", qaHcInstH: "Google Fit va boshqa ilovalardagi qadamlar shu orqali keladi.", qaOnT: 'Qadam endi avtomatik sanaladi', qaDenied: "Ruxsat berilmadi. Health Connect yoki telefon sozlamalarida KalkiFit'ga qadamlarni o'qishga ruxsat bering.", qaExtra: "Telefonsiz yurgan qadamlaringizni qo'shing. Avtomatik sanalgani ({a}) o'zgarmaydi.", qaExtraNow: "Qo'shilgan: {m}", qaAdd: "Qo'shish", qaClear: "Qo'shilganini tozalash",
    mealAddS: "Qo'shish", cEaten2: "iste'mol", cGoal2: 'maqsad', cBurn2: 'yoqildi', stWrite: 'Yozish', stkQ: "Kun qanday hisoblanadi?", stkT: 'Ketma-ket kunlar', stkB: "Ketma-ket {n} kun ovqat yozdingiz. Kun hisobga olinishi uchun kamida bitta ovqat yozilgan bo'lishi kerak. Bugun hali yozilmagan bo'lsa ham, seriya kechagacha saqlanadi.", wkTap: "Kunni ochish", mealRepT: 'Takrorlash', mealRepD: "Shu ovqatdagi hamma taomni bugunga yana qo'shadi.", mealRepH: "Taomni uzun bosing — «Takrorlash»", mealEmptyD: 'Hali yozilmadi', histT: 'Tarix', navHist: 'Tarix', histDays: 'Kunlar', histRes: 'Natijalar', orWord: "O'rniga:", orLine: "O'rniga: {n} — {d}", orMore: 'Boshqa variantlar', orLess: 'Yopish', orP_up: 'oqsil +{x} g', orP_down: 'oqsil −{x} g', orP_same: 'oqsil deyarli bir xil', orF: "yog' {x} g", orK: '{x} kkal',
    orSet: "O'rinbosar takliflari", orSetH: "Porsiya oynasida o'xshash, oqsilga boyroq yoki yog'i kamroq taom taklif qilinadi", orOn: 'Yoqilgan', orOff: "O'chirilgan",
    orbT: 'Oqsil manbalari', orbEmpty: "3 kun yozgandan keyin shu yerda oqsil qaysi manbadan kelayotgani ko'rinadi.", orbSent: 'Bu hafta oqsilning {x}% i {s}. Baliq {n}.', orbTimes: '{n} marta',
    orb_qizil: "Qizil go'sht", orb_tovuq: 'Tovuq', orb_baliq: 'Baliq', orb_sut: 'Tuxum va sut', orb_dukkak: 'Dukkaklilar',
    orbA_qizil: "qizil go'shtdan", orbA_tovuq: 'tovuqdan', orbA_baliq: 'baliqdan', orbA_sut: 'tuxum va sut mahsulotlaridan', orbA_dukkak: 'dukkaklilardan', orbAria: 'Oqsil manbalari: {x}'
  });
  Object.assign(D.ru, {
    bkT: 'Напоминание о рыбном дне', bkH: 'Раз в неделю — в {d}, в 11:00. Других уведомлений не будет.', bkOn: 'Включить', bkOff: 'Выключить', bkIsOn: 'Включено: в {d}, в 11:00.', bkIos: 'Сначала добавьте приложение на экран «Домой» (Safari: Поделиться → «На экран Домой»), затем включите напоминание здесь.', bkDenied: 'В браузере уведомления отключены. Разрешите их в настройках сайта.', bkNA: 'В этом браузере или на этом устройстве уведомления недоступны. В рыбный день напоминание покажем внутри приложения.', bkErr: 'Не удалось включить. Попробуйте позже.',
    fcT: 'Сегодня рыбный день', bkT2: 'Рыбный день', bkLine: 'Напомним раз в неделю. В какой день?', bkIos2: 'Сначала добавьте на экран «Домой»: Поделиться → «На экран Домой»', bkDen2: 'Уведомления выключены — включите в настройках браузера', bkDen3: 'Уведомления выключены — включите в настройках телефона', bkNA2: 'Здесь уведомлений нет — покажем на экране «Сегодня»', bkAsk: 'Включить еженедельное напоминание о рыбном дне?', bkAskH: 'Одно уведомление в неделю, в рыбный день в 11:00. Отключить можно в любой момент.', bkNo: 'Не сейчас', bkOk: 'Понятно', bkMsg: 'Сегодня рыбный день 🐟 — закажете в ближайшем кафе или приготовите дома?', bkBtn: 'Рыбный день', bkNever: 'Больше не показывать', bkDone: 'Включено: напомним в рыбный день в 11:00.', bkDoneOff: 'Напоминание выключено.',  
    qaT: 'Считать шаги автоматически?', qaH: 'Шаги берутся из Health Connect (Google Fit и другие) или датчика телефона. Местоположение не используется.', qaYes: 'Разрешить', qaLater: 'Позже', qaBadge: 'Авто', qaRow: 'Автоматический подсчёт шагов', qaRowH: 'Из Health Connect (Google Fit, Samsung Health и другие) или датчика телефона. Без GPS, данные остаются на телефоне.', qaSrc_hc: 'Health Connect', qaSrc_sensor: 'Датчик телефона', qaConnT: 'Подключить шаги', qaConn1: '1/2 — Установите Health Connect и вернитесь сюда.', qaConn2: '2/2 — Нажмите «Разрешить».', qaConnOne: 'Нажмите «Разрешить» — шаги будут приходить сами.', qaSkipHc: 'Без установки — только датчик телефона', qaNone: 'Шаги пока не приходят', qaFit: 'Установить Google Fit', qaFitH: 'Google Fit считает шаги и записывает их в Health Connect.', qaNoSensor: 'В телефоне нет датчика шагов — шаги посчитает Google Fit.', diagT: 'Диагностика', diagCopy: 'Копировать', diagOk: 'Скопировано', qaFix: 'Исправить вручную', qaHcInst: 'Установить Health Connect', qaHcInstH: 'Через него приходят шаги из Google Fit и других приложений.', qaOnT: 'Теперь шаги считаются автоматически', qaDenied: 'Разрешение не дано. В Health Connect или настройках телефона разрешите KalkiFit читать шаги.', qaExtra: 'Добавьте шаги, пройденные без телефона. Автоматический счёт ({a}) не изменится.', qaExtraNow: 'Добавлено: {m}', qaAdd: 'Добавить', qaClear: 'Очистить добавленное',
    mealAddS: 'Добавить', cEaten2: 'съедено', cGoal2: 'цель', cBurn2: 'сожжено', stWrite: 'Ввести', stkQ: 'Как считаются дни?', stkT: 'Дни подряд', stkB: 'Вы записывали еду {n} дн. подряд. День засчитывается, если записано хотя бы одно блюдо. Если сегодня ещё нет записей, серия сохраняется до вчерашнего дня.', wkTap: 'Открыть день', mealRepT: 'Повторить', mealRepD: 'Добавит на сегодня все блюда этого приёма пищи ещё раз.', mealRepH: 'Нажмите на приём пищи и удерживайте — «Повторить»', mealEmptyD: 'Пока не записано', histT: 'История', navHist: 'История', histDays: 'Дни', histRes: 'Итоги', orWord: 'Вместо:', orLine: 'Вместо: {n} — {d}', orMore: 'Другие варианты', orLess: 'Свернуть', orP_up: 'белка +{x} г', orP_down: 'белка −{x} г', orP_same: 'белка почти столько же', orF: 'жира {x} г', orK: '{x} ккал',
    orSet: 'Подсказки-замены', orSetH: 'В окне порции предлагается похожее блюдо с большим количеством белка или меньшим — жира', orOn: 'Включено', orOff: 'Выключено',
    orbT: 'Источники белка', orbEmpty: 'После 3 дней записей здесь будет видно, из чего складывается белок.', orbSent: 'На этой неделе {x}% белка — {s}. Рыба: {n}.', orbTimes: '{n}',
    orb_qizil: 'Красное мясо', orb_tovuq: 'Курица', orb_baliq: 'Рыба', orb_sut: 'Яйца и молочное', orb_dukkak: 'Бобовые',
    orbA_qizil: 'из красного мяса', orbA_tovuq: 'из курицы', orbA_baliq: 'из рыбы', orbA_sut: 'из яиц и молочных продуктов', orbA_dukkak: 'из бобовых', orbAria: 'Источники белка: {x}'
  });
  var root = document.getElementById('rzApp');
  var st = null, view = 'today', lang = langNow(), enterNext = true, foodDay = null, db = null, dbState = 0, heroPrev = null, seenFood = null, ob = null, reduce = false;
  function langNow() { return document.documentElement.lang === 'ru' ? 'ru' : 'uz'; }
  function isCyr() { return document.documentElement.getAttribute('data-script') === 'cyr'; }
  Object.assign(D.uz, { updT: 'Yangi versiya tayyor', updGo: 'Yangilash', updLater: 'Keyinroq', moreWays: 'Boshqa usullar', sMine: "Mening ma'lumotlarim", pFoot: "Ma'lumot faqat shu qurilmada. Tibbiy maslahat emas.", sRem: 'Eslatmalar', sLangT: "Til va ko'rinish", profBackup: "Ma'lumotlarni saqlash", sHow: 'Qanday ishlaydi?', hEmpty: "Birinchi ovqatni qo'shing",     fuT: 'Foydali' });
  Object.assign(D.ru, { updT: 'Готова новая версия', updGo: 'Обновить', updLater: 'Позже', moreWays: 'Другие способы', sMine: 'Мои данные', pFoot: 'Данные только на этом устройстве. Не медицинский совет.', sRem: 'Напоминания', sLangT: 'Язык и вид', profBackup: 'Сохранение данных', sHow: 'Как это работает?', hEmpty: 'Добавьте первую еду',     fuT: 'Полезное' });
  Object.assign(D.uz, { hkTitle: 'Haftangiz', hkCardS: "{n} kun yozildi · o'rtacha {k} kkal", hkCard0: "Hafta endi boshlanmoqda — ko'rib qo'ying", hkHi: 'Sizning haftangiz', hkDays: '7 kundan {n} kuni ovqat yozdingiz', hkEmpty: "Bu hafta yozuv yo'q. Ertaga bitta ovqat yozing — keyingi hafta chiroyli xulosa chiqadi.", hkKcalT: 'Kaloriya', hkNearT: "kun maqsadga yaqin bo'ldi", hkAvg: "O'rtacha {x} kkal/kun · maqsad {g}", hkFew: "Hali ma'lumot kam — har kuni bitta ovqat yozing, grafik to'ladi.",
    hkWaterU: "ml suv — kuniga o'rtacha", hkStepsU: 'qadam — jami', hkMoveT: 'Suv va harakat', hkBestT: 'Eng yaxshi kun', hkStreakU: 'kun ketma-ket yozdingiz', hkFoodT: "Eng ko'p yeyilgan", hkWt: 'Vazn (faqat sizga ko\'rinadi): {d} kg', hkTipT: 'Keyingi haftaga maslahat', hkShare: 'Ulashish', hkClose: 'Yopish', hkAvgT: "o'rtacha kkal/kun", hkNearS: 'maqsadga yaqin kunlar' });
  Object.assign(D.ru, { hkTitle: 'Ваша неделя', hkCardS: 'Записано дней: {n} · в среднем {k} ккал', hkCard0: 'Неделя только начинается — загляните', hkHi: 'Ваша неделя', hkDays: 'Еда записана {n} из 7 дней', hkEmpty: 'На этой неделе записей нет. Запишите завтра одну еду — через неделю будет красивый итог.', hkKcalT: 'Калории', hkNearT: 'дн. около цели', hkAvg: 'В среднем {x} ккал/день · цель {g}', hkFew: 'Пока мало данных — записывайте хотя бы одну еду в день, и график заполнится.',
    hkWaterU: 'мл воды — в среднем в день', hkStepsU: 'шагов — всего', hkMoveT: 'Вода и движение', hkBestT: 'Лучший день', hkStreakU: 'дн. подряд с записями', hkFoodT: 'Чаще всего ели', hkWt: 'Вес (видите только вы): {d} кг', hkTipT: 'Совет на следующую неделю', hkShare: 'Поделиться', hkClose: 'Закрыть', hkAvgT: 'ккал/день в среднем', hkNearS: 'дней около цели' });
  Object.assign(D.uz, { pgMen: 'Men', pgSet: 'Sozlamalar', pgImk: 'Imkoniyatlar', pgApp: 'Ilova', pgAcc: 'Hisob va zaxira', sIntro: "Tanishtiruvni qayta ko'rish", ftOpen: 'Ochish',
    ft_ovoz: "Ovoz bilan qo'shish", ft_ovozH: "Ayting — ro'yxat o'zi tuziladi", ft_rasm: "Rasm bilan qo'shish", ft_rasmH: 'Taom va porsiya rasmdan aniqlanadi', ft_menyu: 'Menyudan tanlash', ft_menyuH: 'Kafe menyusidan maqsadga mos taomlar',
    ft_yeymiz: 'Nima yesam ekan?', ft_yeymizH: "Uyda tez va sog'lom (60+ retsept), kafe yoki buyurtma", ft_retsept: 'Retseptni yengillashtirish', ft_retseptH: "Ta'mi qoladi, kaloriyasi kamayadi", ft_odatdagi: 'Odatdagi ovqatlarim', ft_odatdagiH: "Bir bosishda qo'shish",
    ft_idishlar: 'Mening idishlarim', ft_idishlarH: "O'z kosa va laganingiz bilan aniqroq", ft_yesam: 'Buni yesam-chi?', ft_yesamH: "Yeyishdan oldin kunga ta'sirini ko'ring", ft_hafta: 'Haftangiz', ft_haftaH: 'Hafta xulosasi qisqa hikoyada',
    ftBtn: 'Imkoniyatlar', ftSub: 'KalkiFit nimalar qila oladi', ftNew: 'tayyor', ftIntro: "Tanishtiruvni qayta ko'rish", ftG_tez: "Tez qo'shish", ftG_natija: 'Natijalar', ftG_yemak: 'Ovqat tanlash', ftG_mening: 'Mening', ftG_soglik: "Sog'liq", ftS_ovoz: 'Ovoz', ftS_rasm: 'Rasm', ftS_menyu: 'Menyu', ft_kunkarta: 'Kun yakuni kartasi', ft_kunkartaH: 'Natijani rasm qilib ulashing', ft_ulashish: 'Natijamni ulashish', ft_ulashishH: "Faqat o'zingiz tanlagan raqamlar", ft_supp: "Vitaminlar va qo'shimchalar", ft_suppH: 'Nima kerak, nima shart emas' });
  Object.assign(D.ru, { pgMen: 'Обо мне', pgSet: 'Настройки', pgImk: 'Возможности', pgApp: 'Приложение', pgAcc: 'Аккаунт и резервная копия', sIntro: 'Посмотреть знакомство снова', ftOpen: 'Открыть',
    ft_ovoz: 'Добавить голосом', ft_ovozH: 'Скажите — список составится сам', ft_rasm: 'Добавить по фото', ft_rasmH: 'Блюдо и порция определяются по фото', ft_menyu: 'Выбор по меню', ft_menyuH: 'Блюда из меню кафе под вашу цель',
    ft_yeymiz: 'Что бы мне съесть?', ft_yeymizH: 'Дома быстро и полезно (60+ рецептов), кафе или заказ', ft_retsept: 'Облегчить рецепт', ft_retseptH: 'Вкус остаётся, калорий меньше', ft_odatdagi: 'Мои обычные приёмы пищи', ft_odatdagiH: 'Частое — в одно нажатие',
    ft_idishlar: 'Моя посуда', ft_idishlarH: 'Своя тарелка и ляган — точнее расчёт', ft_yesam: 'А если съесть это?', ft_yesamH: 'Посмотрите итог до того, как съесть', ft_hafta: 'Ваша неделя', ft_haftaH: 'Итоги недели короткой историей',
    ftBtn: 'Возможности', ftSub: 'Что умеет KalkiFit', ftNew: 'готово', ftIntro: 'Посмотреть знакомство снова', ftG_tez: 'Быстро добавить', ftG_natija: 'Итоги', ftG_yemak: 'Выбор еды', ftG_mening: 'Моё', ftG_soglik: 'Здоровье', ftS_ovoz: 'Голос', ftS_rasm: 'Фото', ftS_menyu: 'Меню', ft_kunkarta: 'Карточка итога дня', ft_kunkartaH: 'Поделитесь итогом дня картинкой', ft_ulashish: 'Поделиться результатом', ft_ulashishH: 'Только выбранные вами цифры', ft_supp: 'Витамины и добавки', ft_suppH: 'Что нужно, а что необязательно' });
  Object.assign(D.uz, { apPh: 'Taom nomini yozing…',  tdMeals: 'Bugungi ovqatlar', tdEmpty: "Bugun hali ovqat yozilmagan. Pastdagi «Qo'shish» tugmasini bosing — nomini yozing, ayting yoki suratga oling.",
    fwTry: "Sinab ko'rish",
    fw_ovoz: "Ovoz bilan qo'shing", fw_ovozH: "Ayting: «bir kosa sho'rva va non» — ro'yxat o'zi tuziladi.", fw_rasm: 'Taomni suratga oling', fw_rasmH: 'Rasmdan taom va porsiya aniqlanadi, kaloriya bazadan olinadi.', fw_menyu: 'Kafe menyusidan tanlang', fw_menyuH: 'Menyuni suratga oling — maqsadingizga mos taomlar ko\'rsatiladi.',
    fw_yeymiz: 'Nima yeyishni bilmayapsizmi?', fw_yeymizH: "«Nima yesam ekan?» uyda tez tayyorlanadigan, kafe yoki buyurtmadan mos taomni topadi.", fw_hafta: 'Haftangizni ko\'ring', fw_haftaH: 'Har yakshanba hafta xulosasi qisqa hikoya bo\'lib chiqadi.', fw_kunkarta: 'Kuningizni ulashing', fw_kunkartaH: "Kun natijasi chiroyli rasm bo'ladi — vazn va shaxsiy ma'lumotsiz.", fw_google: "Ma'lumotingizni saqlang", fw_googleH: 'Google bilan kirsangiz, telefon almashsa ham hammasi qoladi.' });
  Object.assign(D.ru, { apPh: 'Название блюда…',  tdMeals: 'Еда за сегодня', tdEmpty: 'Сегодня еда ещё не записана. Нажмите «Добавить» внизу — напишите название, скажите или сфотографируйте.',
    fwTry: 'Попробовать',
    fw_ovoz: 'Добавляйте голосом', fw_ovozH: 'Скажите: «тарелка супа и хлеб» — список составится сам.', fw_rasm: 'Сфотографируйте блюдо', fw_rasmH: 'По фото определяются блюдо и порция, калории — из базы.', fw_menyu: 'Выбирайте по меню кафе', fw_menyuH: 'Сфотографируйте меню — покажем блюда под вашу цель.',
    fw_yeymiz: 'Не знаете, что поесть?', fw_yeymizH: '«Что бы мне съесть?» подберёт быстрое блюдо дома, в кафе или с доставкой.', fw_hafta: 'Посмотрите свою неделю', fw_haftaH: 'Каждое воскресенье — итоги недели короткой историей.', fw_kunkarta: 'Поделитесь днём', fw_kunkartaH: 'Итог дня станет красивой картинкой — без веса и личных данных.', fw_google: 'Сохраните данные', fw_googleH: 'Войдите через Google — при смене телефона всё сохранится.' });
  Object.assign(D.uz, { ovLeft: 'Bugun {q} ta ovozli kiritish qoldi ({n} tadan).', ovLimit: "Bugungi ovozli kiritish tugadi, yozib qo'shing" });
  Object.assign(D.ru, { ovLeft: 'Сегодня осталось голосовых вводов: {q} из {n}.', ovLimit: 'Сегодняшний голосовой ввод закончился, добавьте текстом' });
  Object.assign(D.uz, { qaOnPill: 'Yoqish', qaOnBtn: 'Qadamni yoqish', qaNoSensorS: "Bu telefonda qadam sensori yo'q", qaOldApp: 'Qadam uchun ilovani yangilang', qaSetHint: "Ruxsat so'ralmasa: Telefon sozlamalari → Ilovalar → KalkiFit → Ruxsatlar → Jismoniy faollik.", qaRowS: 'Telefon sensori orqali', qaRowHc: 'Health Connect orqali', stWeb: 'Qadam ilovada avtomatik sanaladi' });
  Object.assign(D.ru, { qaOnPill: 'Включить', qaOnBtn: 'Включить шаги', qaNoSensorS: 'В этом телефоне нет датчика шагов', qaOldApp: 'Для шагов обновите приложение', qaSetHint: 'Если запрос не появляется: Настройки телефона → Приложения → KalkiFit → Разрешения → Физическая активность.', qaRowS: 'Через датчик телефона', qaRowHc: 'Через Health Connect', stWeb: 'Шаги считаются автоматически в приложении' });
  Object.assign(D.uz, { vMic: "Ovoz bilan qo'shish", vT: "Ovoz bilan qo'shish", vListen: 'Gapiring… Masalan: «bir piyola osh, ikki tilim non va choy»', vStop: "To'xtatish", vPriv: 'Ovoz saqlanmaydi: telefoningiz uni matnga aylantiradi, ilova faqat matnni oladi.', vAgain: 'Qayta gapirish', vText: 'Matn bilan yozish', vPrivS: 'Ovoz saqlanmaydi: qisqa yozuv faqat matnga aylantirish uchun yuboriladi.', vRec: 'Gapiring… tugatgach «Tayyor» yoki mikrofonni bosing (ko\'pi bilan 30 soniya).', vDone: 'Tayyor', vBusy: 'Ovoz tanilmoqda…', vErr_vaqt: "Ovoz tanilmadi. Qayta urinib ko'ring yoki yozib qo'shing.",
    vErr_ruxsat: 'Mikrofonga ruxsat berilmadi. Telefon sozlamalarida mikrofonni yoqing yoki matn bilan yozing.', vErr_jim: "Hech narsa eshitilmadi. Yana bir bor urinib ko'ring.", vErr_tarmoq: 'Ovozni tanish uchun internet kerak.', vErr_yoq: 'Bu qurilmada ovozni tanish ishlamayapti — matn bilan yozing.', vErr_xato: "Ovozni tanib bo'lmadi. Yana urinib ko'ring." });
  Object.assign(D.ru, { vMic: 'Добавить голосом', vT: 'Добавить голосом', vListen: 'Говорите… Например: «тарелка плова, два куска хлеба и чай»', vStop: 'Остановить', vPriv: 'Голос не сохраняется: телефон превращает его в текст, приложение получает только текст.', vAgain: 'Сказать ещё раз', vText: 'Написать текстом', vPrivS: 'Голос не сохраняется: короткая запись отправляется только для распознавания текста.', vRec: 'Говорите… затем нажмите «Готово» или микрофон (не дольше 30 секунд).', vDone: 'Готово', vBusy: 'Распознаём голос…', vErr_vaqt: 'Голос не распознан. Попробуйте ещё раз или добавьте текстом.',
    vErr_ruxsat: 'Нет доступа к микрофону. Включите микрофон в настройках телефона или напишите текстом.', vErr_jim: 'Ничего не слышно. Попробуйте ещё раз.', vErr_tarmoq: 'Для распознавания голоса нужен интернет.', vErr_yoq: 'На этом устройстве распознавание голоса не работает — напишите текстом.', vErr_xato: 'Не удалось распознать голос. Попробуйте ещё раз.' });
  /* ovqat qo'shish oqimi (maket: 3 ekran) */
  Object.assign(D.uz, { qT: 'Nima yedingiz?', qPhoto: 'Taom rasmi', qPhotoH: 'Suratga oling', qMenu: 'Kafe menyusi', qMenuH: 'Mosini tanlaymiz', qRecent: 'Yaqinda yeganlaringiz', qMine: 'meniki', qTpl: 'odatiy',
    qNone: 'Topilmadi', qOwn: "O'z taomimni qo'shish", qVoice: 'Ovoz bilan aytish', qAll: "Hammasini qo'shish: {x}", pFootAcc: "Ma'lumotlar akkauntingizda saqlanadi. Tibbiy maslahat emas.", qHalf: 'Yarim', qGram: 'Gramm', qProt: 'oqsil', qLeft: '{n} ta qoldi', qNoLeft: 'limit tugadi',
    pCta_b: "Nonushtaga qo'shish", pCta_l: "Tushlikka qo'shish", pCta_d: "Kechki ovqatga qo'shish", pCta_s: "Tamaddiga qo'shish", ft_taomlarim: 'Mening taomlarim', ft_taomlarimH: "O'zingiz qo'shgan taom va retseptlar" });
  Object.assign(D.ru, { qT: 'Что вы съели?', qPhoto: 'Фото блюда', qPhotoH: 'Сфоткайте', qMenu: 'Меню кафе', qMenuH: 'Подберём блюдо', qRecent: 'Недавно ели', qMine: 'моё', qTpl: 'обычное',
    qNone: 'Ничего не найдено', qOwn: 'Добавить своё блюдо', qVoice: 'Сказать голосом', qAll: 'Добавить всё: {x}', pFootAcc: 'Данные хранятся в вашем аккаунте. Не медицинский совет.', qHalf: '½', qGram: 'Грамм', qProt: 'белок', qLeft: 'осталось {n}', qNoLeft: 'лимит исчерпан',
    pCta_b: 'Добавить в завтрак', pCta_l: 'Добавить в обед', pCta_d: 'Добавить в ужин', pCta_s: 'Добавить в перекус', ft_taomlarim: 'Мои блюда', ft_taomlarimH: 'Блюда и рецепты, которые вы добавили' });
  Object.assign(D.uz, { hwReady: 'Haftangiz xulosasi tayyor', hwOpen: "Ko'rish", hwT: 'Hafta xulosasi', hwRange: '{a} – {b}', hwAvg: "O'rtacha: {x} kkal/kun", hwAvgG: 'maqsad {x}', hwNear: 'Maqsadga yaqin kunlar: {n} / 7', hwWater: "Suv: kuniga o'rtacha {x} ml", hwSteps: "Qadam: kuniga o'rtacha {x}", hwBest: 'Eng yaxshi kun: {d}', hwStreak: 'Ketma-ket yozilgan kunlar: {n}', hwTipT: 'Keyingi haftaga bitta maslahat',
    hwTip_log: "Har kuni kamida bitta ovqatni yozing — xulosa aniqroq bo'ladi.", hwTip_water: 'Har ovqatdan oldin bir stakan suv iching.', hwTip_steps: "Har kuni 15 daqiqa piyoda yuring — bu taxminan 1 500 qadam.", hwTip_over: 'Kechki ovqatni kichikroq likopchaga soling.', hwTip_protein: "Har ovqatga oqsil qo'shing: tuxum, tvorog, tovuq yoki dukkakli.", hwTip_keep: 'Shu tartibni yana bir hafta saqlang.',
    hwEmpty: "Bu hafta yozuv yo'q. Hechqisi yo'q — ertaga bitta ovqat yozing, keyingi yakshanba xulosa tayyor bo'ladi.", hwN: 'Haftalik xulosa', hwNH: 'Yakshanba 19:00 da hafta xulosasi', hwMsg: 'Haftangiz xulosasi tayyor' });
  Object.assign(D.ru, { hwReady: 'Итоги вашей недели готовы', hwOpen: 'Смотреть', hwT: 'Итоги недели', hwRange: '{a} – {b}', hwAvg: 'В среднем: {x} ккал/день', hwAvgG: 'цель {x}', hwNear: 'Дней около цели: {n} / 7', hwWater: 'Вода: в среднем {x} мл в день', hwSteps: 'Шаги: в среднем {x} в день', hwBest: 'Лучший день: {d}', hwStreak: 'Дней подряд с записями: {n}', hwTipT: 'Один совет на следующую неделю',
    hwTip_log: 'Записывайте хотя бы одну еду в день — итоги будут точнее.', hwTip_water: 'Выпивайте стакан воды перед каждым приёмом пищи.', hwTip_steps: 'Гуляйте 15 минут каждый день — это примерно 1 500 шагов.', hwTip_over: 'Кладите ужин на тарелку поменьше.', hwTip_protein: 'Добавляйте белок к каждой еде: яйцо, творог, курицу или бобовые.', hwTip_keep: 'Сохраните этот порядок ещё на неделю.',
    hwEmpty: 'На этой неделе записей нет. Ничего страшного — запишите завтра одну еду, и в следующее воскресенье итоги будут готовы.', hwN: 'Итоги недели', hwNH: 'В воскресенье в 19:00 — итоги недели', hwMsg: 'Итоги вашей недели готовы' });
  Object.assign(D.uz, { tlUnit: 'ta mahsulot', tlRes: '~{k} kkal qoldirilgan', tlNo: "Hali yo'q", tlOpen: 'Ochish', tlLess: "Yig'ish", tlGrpOpen: "alohida yozuvlarni ko'rish", tlGrpTot: 'Jami: {q} · {k} kkal', tlGrpDel: "O'chirish",
    cmDays: 'Yozilgan kun', cmAvg: "O'rtacha, kkal", cmWt: 'Vazn', cmNear: 'Maqsadda', cmLow: 'Kamroq', cmHigh: "Ko'proq", cmPart: 'Qisman',
    stcN: '{n} kun ketma-ket', stcN1: 'Seriya boshlandi', stcN1s: 'Bugun 1-kun. Ertaga ham yozing!', stc0: "Seriya hali yo'q", stcRec: 'Rekordingiz — {n} kun. Davom eting!', stcBest: 'Rekord: {n} kun', stc0b: 'Rekord: {n} kun. Bugun yozing — yangi seriya boshlanadi', stc0s: 'Bugun yozing — seriya boshlanadi', stcWk: 'Oxirgi 7 kun: {n} kun yozilgan' });
  Object.assign(D.ru, { tlUnit: 'продуктов', tlRes: '~{k} ккал отложено', tlNo: 'Пока нет', tlOpen: 'Открыть', tlLess: 'Свернуть', tlGrpOpen: 'показать отдельные записи', tlGrpTot: 'Всего: {q} · {k} ккал', tlGrpDel: 'Удалить',
    cmDays: 'Записано дней', cmAvg: 'В среднем, ккал', cmWt: 'Вес', cmNear: 'В цель', cmLow: 'Меньше', cmHigh: 'Больше', cmPart: 'Частично',
    stcN: '{n} дн. подряд', stcN1: 'Серия началась', stcN1s: 'Сегодня 1-й день. Запишите и завтра!', stc0: 'Серии пока нет', stcRec: 'Ваш рекорд — {n} дн. Продолжайте!', stcBest: 'Рекорд: {n} дн.', stc0b: 'Рекорд: {n} дн. Запишите сегодня — начнётся новая серия', stc0s: 'Запишите сегодня — серия начнётся', stcWk: 'Последние 7 дней: записано {n}' });
  /* v67: «Yorliqdan qo'shish» / «Qo'lda kiritish» */
  Object.assign(D.uz, { pwChain: "Taxminiy — tarmoq rasmiy qiymat e'lon qilmagan. Menyudagi og'irlik va tarkib bo'yicha hisoblandi.", qApprox: 'taxminiy' });
  Object.assign(D.ru, { pwChain: 'Примерно — сеть не публикует официальные значения. Рассчитано по весу и составу из меню.', qApprox: 'примерно' });
  Object.assign(D.uz, { lbT: "Yorliqdan qo'shish", lbManT: "Qo'lda kiritish", lbPickH: "Qadoqdagi «Ozuqaviy qiymat» jadvalini suratga oling: kkal, oqsil, yog' va uglevod raqamlari aniq ko'rinsin. Raqamlarni o'qiymiz — siz tekshirasiz.",
    lbShot: "Yorliqni suratga olish", lbMan: "Qo'lda kiritaman", lbLeft: "Bugun yana {q} ta surat (taom rasmi bilan umumiy, {n} tadan).", lbBusy: "Yorliq o'qilyapti…",
    lbNone: "Yorliqdagi raqamlarni o'qib bo'lmadi. Jadvalni yaqinroq va tekis suratga oling yoki qo'lda kiriting.", lbAiOk: "Yorliqdan o'qildi — raqamlarni qadoq bilan solishtirib chiqing.",
    lbNamePh: 'masalan, Nestle yogurt qulupnayli', lbBasis: 'Qiymatlar', lbB100: '100 g uchun', lbBp: '1 porsiya uchun', lbKcal: 'Kkal (100 g da)', lbP: 'Oqsil, g', lbF: "Yog', g", lbC: 'Uglevod, g',
    lbPack: "Qadoq og'irligi, g (ixtiyoriy)", lbWarn: "Raqamlar bir-biriga mos emas: oqsil×4 + yog'×9 + uglevod×4 ≈ {a} kkal, yozilgani {k} kkal. Yorliqni qayta tekshiring.",
    lbShare: "Boshqalarga ham yordam bering: mahsulot nomi va raqamlarini (rasmsiz, anonim) umumiy bazaga taklif qilish",
    qNoneLbl: "Topilmadimi? Qadoq yorlig'ini suratga oling", qNoneLblH: "Raqamlarni o'qiymiz, siz tekshirasiz — taom «Mening taomlarim»ga tushadi.", qLblTip: "Maslahat: bir marta qo'shgan taomingiz keyingi safar qidiruvda birinchi chiqadi.",
    qLblLink: "Qadoqli mahsulot? Yorlig'idan qo'shing", ft_yorliq: "Yorliqdan qo'shish", ft_yorliqH: "Qadoqli mahsulot: yorliqni suratga oling yoki raqamlarni yozing", rcLbl: "Yorliqdan qo'shish" });
  Object.assign(D.ru, { lbT: 'Добавить по этикетке', lbManT: 'Ввести вручную', lbPickH: 'Сфотографируйте таблицу «Пищевая ценность» на упаковке: чтобы были чётко видны ккал, белки, жиры и углеводы. Цифры прочитаем мы — проверите вы.',
    lbShot: 'Сфотографировать этикетку', lbMan: 'Введу вручную', lbLeft: 'Сегодня ещё {q} фото (общий лимит с фото блюда, из {n}).', lbBusy: 'Читаем этикетку…',
    lbNone: 'Не удалось прочитать цифры на этикетке. Сфотографируйте таблицу ближе и ровнее или введите вручную.', lbAiOk: 'Прочитано с этикетки — сверьте цифры с упаковкой.',
    lbNamePh: 'например, йогурт Nestle клубничный', lbBasis: 'Значения', lbB100: 'на 100 г', lbBp: 'на 1 порцию', lbKcal: 'Ккал (на 100 г)', lbP: 'Белки, г', lbF: 'Жиры, г', lbC: 'Углеводы, г',
    lbPack: 'Вес упаковки, г (по желанию)', lbWarn: 'Цифры не сходятся: белки×4 + жиры×9 + углеводы×4 ≈ {a} ккал, а указано {k} ккал. Проверьте этикетку ещё раз.',
    lbShare: 'Помочь другим: отправить название и цифры продукта (без фото, анонимно) в общую базу',
    qNoneLbl: 'Не нашли? Сфотографируйте этикетку', qNoneLblH: 'Цифры прочитаем мы, проверите вы — продукт попадёт в «Мои блюда».', qLblTip: 'Совет: добавленный один раз продукт в следующий раз будет первым в поиске.',
    qLblLink: 'Продукт в упаковке? Добавьте по этикетке', ft_yorliq: 'Добавить по этикетке', ft_yorliqH: 'Продукт в упаковке: сфотографируйте этикетку или введите цифры', rcLbl: 'Добавить по этикетке' });
  var LM = {          // v51: yagona me'yor modeli — ish turi (Android), qadam krediti, adaptiv me'yor, (i) tushuntirish
    uz: { jobQ: 'Ishingiz qanday?', jobH: "Yurishni ilova o'zi sanaydi — bu yerda faqat ish turini tanlang.", job_sit: "O'tirib ishlayman", job_sitH: 'Ofis, uy, haydovchi', job_stand: 'Tik turib / yurib ishlayman', job_standH: "Sotuvchi, oshpaz, o'qituvchi", job_heavy: "Og'ir jismoniy mehnat", job_heavyH: "Qurilish, dala, yuk tashish", jobRow: 'Ish turi',
      jbCardT: "Qadamni ilova o'zi sanaydi — me'yoringizni aniqroq hisoblaylik", jbCardB: 'Hisoblash', jbOld: "Hozirgi me'yor", jbNew: "Yangi me'yor", jbNewS: "+ qadam: bugun +{c} kkal", jbOk: 'Tasdiqlash', jbDone: "Me'yor yangilandi: qadam endi ikki marta hisoblanmaydi",
      adT: "Kuzatuvlarga ko'ra kunlik sarfingiz ~{x} kkal. Me'yorni {n} kkal ga yangilaymizmi?", adYes: 'Ha', adNo: 'Hozir emas', adOn: "Me'yor yangilandi", pfCorr: 'Shaxsiy tuzatish {c} kkal', pfCorrOff: 'Standart hisobga qaytish', pfCorrDone: 'Standart hisobga qaytildi',
      xRest: 'Tinch holatda sarf', xLifeJ: 'Kundalik hayot · {j}', xLifeA: 'Kundalik hayot va faollik', xStepX: "Ortiqcha qadam ({s} qadam, bazangiz {b})", xCorrL: 'Shaxsiy tuzatish', xGoalL: 'Ozish uchun', xGoalG: 'Vazn olish uchun', xFloorA: 'Pastki chegaragacha', xLimitR: "Kunlik me'yor",
      xCredJob: "Qadam: faqat bugun haqiqatda qilingani, bazangizdan ({b}) ortig'i qo'shiladi — ehtiyot uchun 0,7 bilan, kuniga ko'pi bilan 500 kkal.", xCredOff: "Faollik darajangiz yurishni o'z ichiga oladi — qadam alohida qo'shilmaydi.", xCredAsk: "Qadam hozircha qo'shilmaydi: faollik darajangiz yurishni o'z ichiga oladi. Ish turini tanlasangiz, ortiqcha qadam qo'shiladi.", xNoCred: "Qadam me'yorga qo'shilmaydi (faollik darajangiz ichida)." },
    ru: { jobQ: 'Какая у вас работа?', jobH: 'Шаги приложение считает само — здесь выберите только тип работы.', job_sit: 'Сидячая работа', job_sitH: 'Офис, дом, водитель', job_stand: 'Стоя / на ногах', job_standH: 'Продавец, повар, учитель', job_heavy: 'Тяжёлый физический труд', job_heavyH: 'Стройка, поле, погрузка', jobRow: 'Тип работы',
      jbCardT: 'Шаги приложение считает само — давайте уточним вашу норму', jbCardB: 'Рассчитать', jbOld: 'Текущая норма', jbNew: 'Новая норма', jbNewS: '+ шаги: сегодня +{c} ккал', jbOk: 'Подтвердить', jbDone: 'Норма обновлена: шаги больше не считаются дважды',
      adT: 'По наблюдениям ваш дневной расход ~{x} ккал. Обновить норму до {n} ккал?', adYes: 'Да', adNo: 'Не сейчас', adOn: 'Норма обновлена', pfCorr: 'Личная поправка {c} ккал', pfCorrOff: 'Вернуть стандартный расчёт', pfCorrDone: 'Возвращён стандартный расчёт',
      xRest: 'Расход в покое', xLifeJ: 'Повседневная жизнь · {j}', xLifeA: 'Повседневная жизнь и активность', xStepX: 'Шаги сверх базы ({s} шагов, ваша база {b})', xCorrL: 'Личная поправка', xGoalL: 'Для похудения', xGoalG: 'Для набора', xFloorA: 'До нижней границы', xLimitR: 'Дневная норма',
      xCredJob: 'Шаги: учитываются только реально пройденные сегодня сверх вашей базы ({b}) — с осторожным коэффициентом 0,7, не больше 500 ккал в день.', xCredOff: 'Ваш уровень активности уже включает ходьбу — шаги отдельно не добавляются.', xCredAsk: 'Пока шаги не добавляются: ваш уровень активности включает ходьбу. Выберите тип работы — и шаги сверх базы будут учитываться.', xNoCred: 'Шаги не добавляются к норме (уже в уровне активности).' }
  };
  var LK = {          // v52: veb → ilova / bosh ekran, akkaunt kartalari (bir martalik, yopsa 14 kun)
    uz: { wcIlT: "Ilovani o'rnating — qadam avtomatik, eslatmalar", wcIlS: "Android ilovasida qadamni telefon o'zi sanaydi va eslatmalar keladi.", wcIlB: "O'rnatish", wcEkT: "Bosh ekranga qo'shing", wcEkS: "KalkiFit ilova kabi bir bosishda ochiladi.", wcEkB: "Qanday?", wcLater: 'Keyinroq',
      wcEkSh: "Bosh ekranga qo'shish", wcEk1: "Pastdagi «Ulashish» tugmasini bosing (kvadrat va yuqoriga strelka).", wcEk2: "«Bosh ekranga qo'shish» → «Qo'shish»ni bosing.", wcEkN: "Bosh ekrandagi ilova ma'lumotni alohida saqlaydi. Avval nusxalang — ilovani ochganda «Ko'chirish»ni bosasiz.", wcEkCp: "Ma'lumotlarimni nusxalash", wcEkOk: 'Tushunarli',
      vHeard: 'Siz aytdingiz:', vEditTx: 'Matnni tuzatish',
      ftG_bilim: 'Bilim', ft_afsona: 'Afsona yoki haqiqat?', ft_afsonaH: "1 daqiqalik o'yin: ozish haqidagi afsonalarni toping",
      akCT: "Ma'lumotlaringiz yo'qolmasin — Google bilan saqlang", akCS: "Telefon almashsa yoki brauzer tozalansa ham yozuvlaringiz qoladi.", akCB: 'Saqlash' },
    ru: { wcIlT: 'Установите приложение — шаги сами, напоминания', wcIlS: 'В приложении для Android шаги считает телефон и приходят напоминания.', wcIlB: 'Установить', wcEkT: 'Добавьте на главный экран', wcEkS: 'KalkiFit будет открываться в одно касание, как приложение.', wcEkB: 'Как?', wcLater: 'Позже',
      wcEkSh: 'Добавить на главный экран', wcEk1: 'Нажмите «Поделиться» внизу (квадрат со стрелкой вверх).', wcEk2: 'Выберите «На экран «Домой»» → «Добавить».', wcEkN: 'Приложение на главном экране хранит данные отдельно. Сначала скопируйте их — в приложении нажмёте «Перенести».', wcEkCp: 'Скопировать мои данные', wcEkOk: 'Понятно',
      vHeard: 'Вы сказали:', vEditTx: 'Исправить текст',
      ftG_bilim: 'Знания', ft_afsona: 'Миф или правда?', ft_afsonaH: 'Игра на минуту: найдите мифы о похудении',
      akCT: 'Чтобы данные не потерялись — сохраните через Google', akCS: 'Записи останутся, даже если смените телефон или очистите браузер.', akCB: 'Сохранить' }
  };
  var LX = {          // v55: mashg'ulot, qo'lda qadam (iPhone/veb), kunlik balans
    uz: { exT: "Mashg'ulot", exAdd: "+ Qo'shish", exQ: "Qanday mashg'ulot?", exDur: 'Qancha vaqt?', exLv: "Qanchalik og'ir?", lv0: 'Yengil', lv1: "O'rtacha", lv2: "Og'ir", exMin: '{n} daq', exMinA: '{n} daqiqa',
      exStepN: "Bu mashg'ulotdagi qadamlar ham sanalgan — kaloriya ikki marta qo'shilmaydi.",
      exHeavy: "Ishingiz og'ir jismoniy — ish vaqtidagi mehnat me'yoringizda bor. Faqat ishdan tashqari ishni qo'shing.", exSave: "Qo'shish", exUpd: 'Saqlash', exDel: "O'chirish", exDone: "Mashg'ulot qo'shildi", exGone: "Mashg'ulot o'chirildi", exNone: "Hali yo'q",
      ex_yugurish: 'Yugurish', ex_zal: 'Zal (kuch)', ex_velosiped: 'Velosiped', ex_futbol: 'Futbol', ex_suzish: 'Suzish', ex_uyda: 'Uyda mashq', ex_raqs: 'Raqs', ex_yoga: "Yoga, cho'zilish", ex_kurash: 'Kurash, boks', ex_voleybol: 'Voleybol, basketbol', ex_ogir: "Og'ir jismoniy ish", ex_boshqa: 'Boshqa',
      exS_yugurish: 'Yugurish', exS_zal: 'Zal', exS_velosiped: 'Velosiped', exS_futbol: 'Futbol', exS_suzish: 'Suzish', exS_uyda: 'Uyda', exS_raqs: 'Raqs', exS_yoga: 'Yoga', exS_kurash: 'Boks', exS_voleybol: 'Voleybol', exS_ogir: "Og'ir ish", exS_boshqa: 'Boshqa',
      stIn: "+ Qo'lda kiritish", stInT: 'Qadamni kiritish', stInH: "iPhone: «Salomatlik» (Health) ilovasi → «Qadamlar» bo'limidagi kunlik sonni yozing.", stInL: 'Qadam soni', stD0: 'Bugun', stD1: 'Kecha', stInSave: 'Saqlash', stNone: 'Bugun qadam kiritilmadi', stInDone: 'Qadam saqlandi', aeL: "Soatingiz bor bo'lsa — «Активная энергия», kkal (ixtiyoriy)", aeH: "Salomatlik → Faollik → «Активная энергия». Kiritsangiz, qadam va mashg'ulot o'rniga shu hisoblanadi.",
      khAe: 'Soat · aktiv {a}', khAeS: "kundalik harakatdan ({b}) ortig'i × 0,7; qadam va mashg'ulot shu ichida", khDev: "Soatingiz ma'lumoti bo'yicha", khDevS: "soat sarfi {d} kkal — hisobdan 10%+ kam, kamini oldik",
      hcEon: "⌚ Soatingiz bormi? Sarfini ulash", hcEok: "Soat ulandi: kun oxirida hisob bilan solishtiriladi", hcEno: 'Ruxsat berilmadi', hcEold: 'Buning uchun ilovani yangilang (1.0.7)', hcEis: "⌚ Soat ulangan: kun oxirida sarfi solishtiriladi",
      xAeX: 'Soat: aktiv energiya {a} − kundalik {b}, × 0,7', xDevX: "Soatingiz ma'lumoti bo'yicha (sarf {d})", kcAe: "soat bo'yicha",
      lmT: "Kunlik me'yoringiz yangilandi: {a} → {b} kkal", lmH: "Hisobni ehtiyotkorroq qildik: o'tirib ishlaydiganlar va juda ko'p qadamli kunlar uchun qo'shimcha biroz kamaydi. Maqsad — bilmasdan vazn olmaslik.", lmOk: 'Tushunarli',
      jobHw: "Qadamni o'zingiz kiritasiz — bu yerda faqat ish turini tanlang. Qadam kiritmagan kunlar yurish qo'shilmaydi.",
      blEat: 'yedingiz', blSpend: 'sarfladingiz', blBal: 'balans', blLose: 'Bugun ozish tomonda — reja: {p} kkal', blOver: 'Bugun ortiqcha: +{b} kkal', blGain: 'Bugun vazn olish tomonda — reja: +{p} kkal', blUnder: 'Bugun kamroq: {b} kkal', blKeep: 'Bugun muvozanatda — reja: 0',
      
      blNote: "Hisob taxminiy. Tinch holat va kundalik hayot — kunlik to'liq qiymat, qadam va mashg'ulot — hozirgacha kiritilgani.", blK70: "Sarf to'liq ko'rsatiladi, yeyish limitiga uning 70% i qo'shiladi — ehtiyot uchun.", 
      hkEx: "Mashg'ulot: {n} kun, {m} daqiqa · ~{k} kkal sarf",
      stEmptyW: 'Qadamni kiriting',
      kcHisob: 'Hisob', kcOpenA: 'Hisobni ochish', kcInfoA: 'Qanday hisoblangan?',
      exTurL: 'Tur', exDurL: 'Davomiyligi', exMinus: '5 daqiqa kamroq', exPlus: '5 daqiqa ko\'proq', lvD0: 'Bemalol gaplasha olasiz', lvD1: "Nafas tezlashadi, gaplashsa bo'ladi", lvD2: 'Gaplashish qiyin, terlaysiz', exBurnT: 'Yoqasiz', exMoreT: "Qo'shimcha yeyish",
      vL1: 'kkal yana', vL2: 'yeyishingiz mumkin', vO1: 'kkal ortiqcha', vO2: 'yedingiz', kcAte: 'Yedingiz', kcStep: 'Yurganingiz uchun', kcEx: "Mashg'ulot uchun", kcMove: 'Harakat uchun', 
      khT: '{k} kkal qanday chiqdi?', khTo: '{k} kkal ortiqcha — qanday chiqdi?', khSub: 'Bugun uchun hisob', khNorm: "Kunlik me'yoringiz", khNormL: 'ozish uchun hisoblangan', khNormK: 'vaznni saqlash uchun', khNormG: 'vazn olish uchun',
      khStep: 'Qadam · {n}', khStepS: "yurganingiz uchun qo'shildi", khStep0: "bugun hali yo'q", khStepIn: "odatiy yurish me'yor ichida", khOff: "me'yorga qo'shilmadi", khEx: "Mashg'ulot", khExS: "{m} daqiqa — qo'shildi", khEx0: "bugun hali yo'q",
      khAte: 'Yedingiz', khAteS: '{n} ta ovqat', khAte0: 'hali hech narsa', khRem: 'Yana yeyishingiz mumkin', khOver: 'Ortiqcha yedingiz',
      khWkL: "Shu raqamdan oshmasangiz — rejaga ko'ra haftasiga ~{x} kg ozasiz.", khWkK: 'Shu raqamdan oshmasangiz — vazningiz saqlanadi.', khWkG: "Shu raqamgacha yesangiz — rejaga ko'ra haftasiga ~{x} kg vazn olasiz.", khOverN: "Hech gap yo'q — ertaga odatdagidek davom eting.", khHow: "Me'yor qanday hisoblangan?",
      exMore0: "Me'yorga qo'shilishi uchun ish turini tanlang", exWhy: "Hisob taxminiy — ehtiyot uchun yoqilgan kaloriyaning bir qismigina qo'shiladi.", exWhyA: 'Nega shuncha?', exEmpty: 'Futbol, zal, yugurish…', exMinW: 'daqiqa', exTodayT: "Bugungi mashg'ulotlar",
      m4P: 'oqsil', m4F: "yog'", m4C: 'uglevod', tplSaveR: 'Odatdagilarga saqlash',
      
      
      xExX: "Mashg'ulot ({n} daq, 70%)", xCredQm: "Bugun qadam kiritilmadi — kundalik hayot ish turi bo'yicha, yurish qo'shilmagan." },
    ru: { exT: 'Тренировка', exAdd: '+ Добавить', exQ: 'Какая тренировка?', exDur: 'Сколько времени?', exLv: 'Насколько тяжело?', lv0: 'Легко', lv1: 'Средне', lv2: 'Тяжело', exMin: '{n} мин', exMinA: '{n} минут',
      exStepN: 'Шаги на этой тренировке тоже посчитаны — калории не добавятся дважды.',
      exHeavy: 'У вас тяжёлая физическая работа — труд в рабочее время уже в норме. Добавляйте только то, что вне работы.', exSave: 'Добавить', exUpd: 'Сохранить', exDel: 'Удалить', exDone: 'Тренировка добавлена', exGone: 'Тренировка удалена', exNone: 'Пока нет',
      ex_yugurish: 'Бег', ex_zal: 'Зал (силовая)', ex_velosiped: 'Велосипед', ex_futbol: 'Футбол', ex_suzish: 'Плавание', ex_uyda: 'Тренировка дома', ex_raqs: 'Танцы', ex_yoga: 'Йога, растяжка', ex_kurash: 'Борьба, бокс', ex_voleybol: 'Волейбол, баскетбол', ex_ogir: 'Тяжёлая физическая работа', ex_boshqa: 'Другое',
      exS_yugurish: 'Бег', exS_zal: 'Зал', exS_velosiped: 'Велосипед', exS_futbol: 'Футбол', exS_suzish: 'Плавание', exS_uyda: 'Дома', exS_raqs: 'Танцы', exS_yoga: 'Йога', exS_kurash: 'Бокс', exS_voleybol: 'Волейбол', exS_ogir: 'Тяжёлый труд', exS_boshqa: 'Другое',
      stIn: '+ Ввести вручную', stInT: 'Ввести шаги', stInH: 'iPhone: приложение «Здоровье» (Health) → «Шаги» — впишите число за день.', stInL: 'Количество шагов', stD0: 'Сегодня', stD1: 'Вчера', stInSave: 'Сохранить', stNone: 'Сегодня шаги не введены', stInDone: 'Шаги сохранены', aeL: 'Есть часы — «Активная энергия», ккал (необязательно)', aeH: 'Здоровье → Активность → «Активная энергия». Если введёте — считаем по ней вместо шагов и тренировок.',
      khAe: 'Часы · активная {a}', khAeS: 'сверх обычного движения ({b}) × 0,7; шаги и тренировки уже внутри', khDev: 'По данным ваших часов', khDevS: 'расход по часам {d} ккал — на 10%+ меньше расчёта, берём меньшее',
      hcEon: '⌚ Есть часы? Подключить расход', hcEok: 'Часы подключены: вечером сверим с расчётом', hcEno: 'Доступ не дан', hcEold: 'Для этого обновите приложение (1.0.7)', hcEis: '⌚ Часы подключены: вечером сверяем расход',
      xAeX: 'Часы: активная энергия {a} − обычная {b}, × 0,7', xDevX: 'По данным часов (расход {d})', kcAe: 'по часам',
      lmT: 'Дневная норма обновилась: {a} → {b} ккал', lmH: 'Расчёт стал осторожнее: для сидячей работы и для дней с очень большим числом шагов прибавка чуть меньше. Цель — не набирать вес незаметно.', lmOk: 'Понятно',
      jobHw: 'Шаги вы вводите сами — здесь выберите только тип работы. В дни без шагов ходьба не добавляется.',
      blEat: 'съели', blSpend: 'потратили', blBal: 'баланс', blLose: 'Сегодня вы в минусе — план: {p} ккал', blOver: 'Сегодня с избытком: +{b} ккал', blGain: 'Сегодня в плюсе для набора — план: +{p} ккал', blUnder: 'Сегодня меньше: {b} ккал', blKeep: 'Сегодня баланс — план: 0',
      
      blNote: 'Расчёт примерный. Покой и повседневная жизнь — за полный день, шаги и тренировки — внесённые на сейчас.', blK70: 'Расход показан полностью, а к лимиту еды добавляется 70% — для осторожности.', 
      hkEx: 'Тренировки: {n} дн., {m} мин · ~{k} ккал расхода',
      stEmptyW: 'Введите шаги',
      kcHisob: 'Расчёт', kcOpenA: 'Открыть расчёт', kcInfoA: 'Как это рассчитано?',
      exTurL: 'Тип', exDurL: 'Длительность', exMinus: 'На 5 минут меньше', exPlus: 'На 5 минут больше', lvD0: 'Можно свободно разговаривать', lvD1: 'Дыхание учащается, поговорить можно', lvD2: 'Говорить трудно, вспотеете', exBurnT: 'Сожжёте', exMoreT: 'Можно съесть ещё',
      vL1: 'ккал ещё', vL2: 'можно съесть', vO1: 'ккал сверх', vO2: 'нормы', kcAte: 'Съели', kcStep: 'За ходьбу', kcEx: 'За тренировку', kcMove: 'За движение', 
      khT: 'Откуда {k} ккал?', khTo: 'Откуда {k} ккал сверх нормы?', khSub: 'Расчёт на сегодня', khNorm: 'Ваша дневная норма', khNormL: 'рассчитана для похудения', khNormK: 'для поддержания веса', khNormG: 'для набора веса',
      khStep: 'Шаги · {n}', khStepS: 'добавлено за ходьбу', khStep0: 'сегодня пока нет', khStepIn: 'обычная ходьба уже в норме', khOff: 'не добавлено к норме', khEx: 'Тренировка', khExS: '{m} мин — добавлено', khEx0: 'сегодня пока нет',
      khAte: 'Съели', khAteS: 'приёмов пищи: {n}', khAte0: 'пока ничего', khRem: 'Можно ещё съесть', khOver: 'Съедено сверх нормы',
      khWkL: 'Если не превышать это число — по плану минус ~{x} кг в неделю.', khWkK: 'Если не превышать это число — вес сохранится.', khWkG: 'Если съесть до этого числа — по плану плюс ~{x} кг в неделю.', khOverN: 'Ничего страшного — завтра продолжайте как обычно.', khHow: 'Как рассчитана норма?',
      exMore0: 'Чтобы добавить к норме, выберите тип работы', exWhy: 'Расчёт примерный — для надёжности добавляется только часть сожжённых калорий.', exWhyA: 'Почему столько?', exEmpty: 'Футбол, зал, бег…', exMinW: 'минут', exTodayT: 'Тренировки за сегодня',
      m4P: 'белок', m4F: 'жиры', m4C: 'углеводы', tplSaveR: 'Сохранить в привычные',
      
      
      xExX: 'Тренировка ({n} мин, 70%)', xCredQm: 'Сегодня шаги не введены — повседневная жизнь по типу работы, ходьба не добавлена.' }
  };
  ['uz', 'ru'].forEach(function (l) { var x = LM[l]; for (var k in x) if (D[l][k] == null) D[l][k] = x[k]; x = LK[l]; for (k in x) if (D[l][k] == null) D[l][k] = x[k]; x = LX[l]; for (k in x) if (D[l][k] == null) D[l][k] = x[k]; });
  var TT = {          // v48: «Mening tartibim» + «Oqsil maqsadi» matnlari (ЎЗ — translit); «halol» so'zi yo'q
    uz: { ttQ: "Qachon ko'proq yeysiz?", ttSub: "Shunga qarab kaloriyangizni nonushta, tushlik va kechki ovqatga bo'lib beramiz.", tt_std: "Kun bo'yi teng", tt_kech: "Kechqurun ko'proq", tt_nobf: 'Nonushta qilmayman', tt_erkin: "Farqi yo'q — bo'lmasin",
      ttL_b: 'nonushta', ttL_l: 'tushlik', ttL_d: 'kechki', ttL_s: 'tamaddi', ttCardT: "Kechqurun ko'proq yeysizmi?", ttCardS: "Kaloriyani shunga moslab bo'lib beramiz",
      ttSave: 'Saqlash', ttHint: "Raqamlar — sizning kunlik {k} kkal me'yoringizdan", ttRow: 'Kun tartibi', ft_tartib: 'Kun tartibi', ft_tartibH: "Kaloriyani ovqatlarga bo'lish",
      mlD_b: 'nonushtaga', mlD_l: 'tushlikka', mlD_d: 'kechki ovqatga', mlD_s: 'tamaddiga', mlA_b: 'nonushta', mlA_l: 'tushlik', mlA_d: 'kechki ovqat', mlA_s: 'tamaddi',
      ttS_l: 'Tushlik', ttS_d: 'Kechki', mbOf: '{e} / {b} kkal', mbLeft: 'Sizga {k} kkal qoldirilgan', mbNow: 'hozir', mbNote: "{x}dan tejalgan {k} kkal {m} o'tdi", mbTook: '+{k} kkal {m}dan olindi', mbAnd: ' va ',
      prDone2: 'Oqsil maqsadi bajarildi ✓', prTipD: "Oqsilga yana ~{p} g — masalan, {g} g {f}", prTipD0: 'Oqsilga yana ~{p} g', xFatLow: "Bugun yog' kaloriyaning 20% idan kam — biroz yong'oq, yog' yoki baliq qo'shing.",
      prT: 'Oqsil', prTip: '{m} ~{p} g qoldi — masalan, {g} g {f}.', prTip0: '{m} ~{p} g qoldi.', prTipE: 'Bugun yana ~{p} g — masalan, {g} g {f}.', prTipE0: 'Bugun yana ~{p} g.', prDone: 'Bugungi oqsil maqsadiga yetdingiz ✓',
      prFat: "yog' · 20%+ ✓", prFatLow: "yog' · 20% dan kam — biroz qo'shing", prFat0: "yog'", prCarb: 'uglevod · erkin',
      pgRow: 'Oqsil maqsadi', pgAuto: 'avtomatik', pgT: 'Oqsil maqsadi', pgH: "Oqsil to'q tutadi va ozishda mushakni saqlaydi. Ozish va vazn olishda 1,6 g/kg, saqlashda 1,2 g/kg.", pgAutoV: 'Avtomatik: {g} g ({k} g/kg × {w} kg)', pgReset: 'Avtomatik',
      pfHi: 'Xush kelibsiz 👋', pfEditName: "Ismni o'zgartirish", pfYou: 'Profilingiz', pfAddName: 'Ismingizni yozing', pfGoalT: 'Maqsad: {g} kg gacha', pfNow: 'Hozir {w} kg', pfGoalAdd: "Maqsad vaznini qo'shing", pfSexM: 'Erkak', pfSexF: 'Ayol', pfSexL: 'jins', pfAgeL: 'yosh', pfHL: "bo'y, sm", pfWL: 'vazn, kg', pfNormS: "Kunlik me'yoringiz · {g}", pfDay: 'kun', pfGrpFood: 'Ovqatlanish', pfYmNone: "Yo'q", pfYmN: '{n} ta',
      gS_keep: 'saqlash', gS_slow: 'sekin ozish', gS_lose: 'ozish', gS_gain: 'vazn olish',
      hkProt: 'Bu hafta {n} kun oqsil maqsadiga yetdingiz', nyStMeal: '{m} {k} kkal va {p} g oqsil qoldi', nyStMealK: '{m} {k} kkal qoldi' },
    ru: { ttQ: 'Когда вы едите больше?', ttSub: 'Так мы разделим ваши калории на завтрак, обед и ужин.', tt_std: 'Ровно весь день', tt_kech: 'Вечером больше', tt_nobf: 'Не завтракаю', tt_erkin: 'Без разницы — не делить',
      ttL_b: 'завтрак', ttL_l: 'обед', ttL_d: 'ужин', ttL_s: 'перекус', ttCardT: 'Вечером едите больше?', ttCardS: 'Разделим калории под ваш режим',
      ttSave: 'Сохранить', ttHint: 'Цифры — от вашей дневной нормы {k} ккал', ttRow: 'Режим питания', ft_tartib: 'Режим питания', ft_tartibH: 'Деление калорий по приёмам пищи',
      mlD_b: 'на завтрак', mlD_l: 'на обед', mlD_d: 'на ужин', mlD_s: 'на перекус', mlA_b: 'завтрака', mlA_l: 'обеда', mlA_d: 'ужина', mlA_s: 'перекуса',
      ttS_l: 'Обед', ttS_d: 'Ужин', mbOf: '{e} / {b} ккал', mbLeft: 'Вам оставлено {k} ккал', mbNow: 'сейчас', mbNote: '{k} ккал, сэкономленные с {x}, перешли {m}', mbTook: '+{k} ккал взяли из {m}', mbAnd: ' и ',
      prDone2: 'Цель по белку выполнена ✓', prTipD: 'Белка ещё ~{p} г — например, {g} г: {f}', prTipD0: 'Белка ещё ~{p} г', xFatLow: 'Сегодня жиров меньше 20% калорий — добавьте немного орехов, масла или рыбы.',
      prT: 'Белок', prTip: '{m} осталось ~{p} г — например, {g} г: {f}.', prTip0: '{m} осталось ~{p} г.', prTipE: 'Сегодня ещё ~{p} г — например, {g} г: {f}.', prTipE0: 'Сегодня ещё ~{p} г.', prDone: 'Цель по белку на сегодня выполнена ✓',
      prFat: 'жиры · 20%+ ✓', prFatLow: 'жиры · меньше 20% — добавьте немного', prFat0: 'жиры', prCarb: 'углеводы · свободно',
      pgRow: 'Цель по белку', pgAuto: 'авто', pgT: 'Цель по белку', pgH: 'Белок дольше насыщает и сохраняет мышцы при похудении. Для похудения и набора — 1,6 г/кг, для поддержания — 1,2 г/кг.', pgAutoV: 'Авто: {g} г ({k} г/кг × {w} кг)', pgReset: 'Авто',
      pfHi: 'Привет 👋', pfEditName: 'Изменить имя', pfYou: 'Ваш профиль', pfAddName: 'Напишите имя', pfGoalT: 'Цель: до {g} кг', pfNow: 'Сейчас {w} кг', pfGoalAdd: 'Добавьте целевой вес', pfSexM: 'Муж.', pfSexF: 'Жен.', pfSexL: 'пол', pfAgeL: 'возраст', pfHL: 'рост, см', pfWL: 'вес, кг', pfNormS: 'Ваша дневная норма · {g}', pfDay: 'день', pfGrpFood: 'Питание', pfYmNone: 'Нет', pfYmN: '{n}',
      gS_keep: 'поддержание', gS_slow: 'медленное похудение', gS_lose: 'похудение', gS_gain: 'набор веса',
      hkProt: 'На этой неделе вы {n} дн. добрали норму белка', nyStMeal: '{m} осталось {k} ккал и {p} г белка', nyStMealK: '{m} осталось {k} ккал' }
  };
  ['uz', 'ru'].forEach(function (l) { var x = TT[l]; for (var k in x) if (D[l][k] == null) D[l][k] = x[k]; });
  if (window.KalkiPlato) ['uz', 'ru'].forEach(function (l) { var x = KalkiPlato.TX[l]; for (var k in x) if (D[l][k] == null) D[l][k] = x[k]; });          // «Nega sekin ozyapman?» matnlari — modulda
  function T(k, o) { var s = (D[lang] && D[lang][k] != null) ? D[lang][k] : D.uz[k]; if (typeof s === 'string' && o) s = s.replace(/\{(\w+)\}/g, function (m, x) { return o[x] != null ? o[x] : m; }); return s; }
  var kit = RzKit.create({ root: root, K: Dt, t: function (k) { return T(k); }, lang: langNow, isCyr: isCyr });
  /* Funksiya oynasi (Ovqat qo'shish, Bugun nima yeymiz?, Retsept, Suv, Tez-tez, Idish, Mening taomlarim) yopilganda DOIM Bugun'ga qaytadi (o'tgan kunga yozilayotgan «Ovqat qo'shish» bundan mustasno) */
  var FUNC_KINDS = ['add', 'yeymiz', 'fish', 'retsept', 'tpls', 'vess', 'rcmine', 'recipe', 'water'], _cs0 = kit.closeSheet;
  kit.closeSheet = function () { try { if (typeof VO !== 'undefined' && VO && typeof fd !== 'undefined' && fd && fd.mode === 'voice') voiceCancel(); } catch (e) {} var k = kit.sheetKind(), past = k === 'add' && typeof fd !== 'undefined' && fd && fd.date && fd.date !== todayStr(); _cs0(); if (FUNC_KINDS.indexOf(k) > -1 && !past && view !== 'today') { view = 'today'; enterNext = true; var m0 = $('#rzMain'); if (m0) m0.scrollTop = 0; render(); } };
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
  function baseOf(f) { return f && f.al ? (foodById(f.al.f) || f) : f; }
  function isLiq(f) { f = baseOf(f); return !!(f && f.t === 'i'); }          // ichimlik (bazada «i» turi): gramm o'rniga ml / l (1 ml ≈ 1 g)
  function amtG(g, f) { g = Math.round(num(g)); if (isLiq(f)) return g >= 1000 ? String(Math.round(g / 100) / 10).replace('.', ',') + ' ' + (lang === 'ru' ? 'л' : 'l') : fmt(g) + ' ' + ML(); return fmt(g) + ' ' + T('gram'); }
  function gWord(f) { return isLiq(f) ? ML() : T('gram'); }
  function openSheet(kind, html, o) { kit.openSheet(kind, html, o || { noFocus: true }); if (SL) SL.mount($('#rzSheet')); sheetFull(); }
  function sheetFull() { var sh = $('#rzSheet'); if (sh) sh.classList.toggle('kq-full', kit.sheetKind() === 'add' && !!fd && fd.mode === 'search' && !!fd.q.trim()); }          // qo'shish: 1-ekran — kontent balandligida, natijalar (2-ekran) — to'liq balandlik
  function setSheet(html) { var sh = $('#rzSheet'); sh.innerHTML = '<div class="rz-grab" aria-hidden="true"><i></i></div>' + html; kit.dpInit(); if (SL) SL.mount(sh); sheetFull(); }
  function mealName(m) { return T('meal' + (m === 'd' ? 'd' : m)); }
  function isNativeApp() { try { return !!(window.KalkiNative && KalkiNative.isApp()); } catch (e) { return false; } }
  function nameOf(f) { return lang === 'ru' && f.r ? f.r : f.n; }
  function unitName(u) { return (D[lang].units && D[lang].units[u]) || D.uz.units[u] || u; }
  function qtyStr(q) { return dec(q, 2).replace(/,00$/, ''); }
  function unitLabel(f, u) { var g = S.unitGrams(f, u); return u === 'g100' ? '100 ' + unitName('g100') : '1 ' + unitName(u) + ' · ' + g + ' ' + (f && f.t === 'i' ? ML() : T('gram')); }      // ichimlik: 1 ml ≈ 1 g
  function portionText(e) { if (e.pt && !e.fid) return e.pt; if (e.unit && String(e.unit).indexOf('v:') === 0) return qtyStr(e.qty) + ' ' + (e.vn || T('vn_lagan')) + (e.vf && e.vf !== 'tola' ? ' · ' + T('vf_' + e.vf) : ''); if (e.unit === 'g100') return amtG(e.g, e.fid ? foodById(e.fid) : null); if (e.unit) return qtyStr(e.qty) + ' ' + unitName(e.unit); return e.g ? amtG(e.g, e.fid ? foodById(e.fid) : null) : ''; }

  /* ---------- baza (lazy) ---------- */
  var dbWaiters = [];
  var dbMr = {}, dbAlias = {};
  /* v67: admin umumiy bazaga qo'shgan YORLIQ takliflari (GET /api/kalkifit-yorliq, manba «yorliq (foydalanuvchi)») — kesh localStorage'da (tarmoqsiz ham), bazaga qo'shiladi (id takrorlanmaydi) */
  var LS_YQ = 'kalki_fit_yq', yqDone = false;
  function yqCache() { try { var j = JSON.parse(localStorage.getItem(LS_YQ) || 'null'); return j && Array.isArray(j.t) ? j.t : []; } catch (e) { return []; } }
  function yqAdd(list) {
    if (!db || !list || !list.length) return 0; var have = {}, n = 0; db.forEach(function (f) { have[f.id] = 1; });
    S.normFoods(list).forEach(function (f) { if (!f.id || have[f.id] || !f.n || !(f.k >= 0) || !Array.isArray(f.u)) return; f.yq = 1; db.push(f); have[f.id] = 1; n++; }); return n;
  }
  function yqFetch() {
    if (yqDone || KD.on || !window.fetch || navigator.onLine === false) return; yqDone = true;
    fetch('/api/kalkifit-yorliq').then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      if (!j || !Array.isArray(j.taomlar)) return; try { localStorage.setItem(LS_YQ, JSON.stringify({ t: j.taomlar.slice(0, 2000) })); } catch (e) {}
      if (yqAdd(j.taomlar)) { S.buildIndex(db); dbAlias = S.aliasMap(db); }
    }).catch(function () {});
  }
  function loadDb(cb) {
    if (dbState === 2) { cb && cb(); return; }
    if (cb) dbWaiters.push(cb);
    if (dbState === 1) return; dbState = 1;
    fetch('/data/ovqatlar.json').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) { db = S.normFoods(j.foods); yqAdd(yqCache()); S.buildIndex(db); yqFetch(); dbMr = j.mr || {}; dbAlias = S.aliasMap(db); dbState = 2; var w = dbWaiters; dbWaiters = []; w.forEach(function (f) { f(); }); })
      .catch(function () { dbState = 0; var w = dbWaiters; dbWaiters = []; w.forEach(function (f) { f(true); }); });
  }
  var jokeBoot = false, qTimer = null;                                 // qidiruv: har harfda emas, 120 ms kutib
  function srchOpts(limit) { return { recents: st.recents, favs: st.favs.concat(st.favs.map(function (i) { return dbAlias[i]; }).filter(Boolean)), freq: S.freqMap(st, todayStr(), 30, dbAlias), limit: limit }; }      // tenglikda: oxirgi 30 kunda ko'p yeyilgan + sevimlilar
  function allFoods() { return (db || []).concat(st.customFoods || []); }
  function foodById(id) { var l = allFoods(); for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }

  /* ---------- saqlash ---------- */
  var loadDirty = false;                             // migratsiya yangi maydon (kuzatuv boshi) qo'shdi — bir marta saqlanadi (zaxira/ko'chirish kodi bilan bir xil bo'lsin)
  function load() {
    try { var raw = lsGet(LS); if (raw) { var o0 = JSON.parse(raw), s = S.migrate(o0); if (s) { if (!s.prefs) s.prefs = {}; if ((s.setup && o0 && !o0.trackStart) || (s.profile && !(o0.prefs && o0.prefs.tm50))) loadDirty = true; return s; } } } catch (e) {}
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
    trend: 'M3 17l5-5 4 4 8-8 M15 8h5v5', cake: 'M4 21h16 M5 21v-7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7 M5 16c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0 M12 12V8 M12 5.5c.8-.8.8-1.7 0-2.5-.8.8-.8 1.7 0 2.5z', ruler: 'M4 16L16 4l4 4L8 20z M8 12l2 2 M11 9l1.5 1.5 M14 6l2 2', cup: 'M5 9h12v5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5V9z M17 11h1.5a2.5 2.5 0 0 1 0 5H17 M9 3c-.8 1 .8 2 0 3 M13 3c-.8 1 .8 2 0 3', spark: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z', info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 11v6 M12 7.500v.500', grid: 'M6 4h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M15 4h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M6 13h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2z M15 13h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2z', today: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z', food: 'M7 3v8 M4 3v5a3 3 0 0 0 6 0V3 M7 11v10 M17 21V3c-2.2 1.5-3.5 4-3.5 7.5 0 2 1.2 3 3.5 3', steps: 'M7 20c-1.5 0-2.5-1.2-2.5-3 0-2 1-3.5 2.5-3.5S9.5 15 9.5 17c0 1.8-1 3-2.5 3z M16 13c-1.5 0-2.5-1.2-2.5-3 0-2 1-3.5 2.5-3.5s2.5 1.5 2.5 3.5c0 1.8-1 3-2.5 3z',
    me: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6', drop: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z', heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z', search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M21 21l-5-5',
    minus: 'M5 12h14', pen: 'M4 20h4L19 9l-4-4L4 16v4z M13 7l4 4', share: 'M12 3v12 M7 8l5-5 5 5 M5 14v6h14v-6', text: 'M5 6h14 M5 12h14 M5 18h9', shield: 'M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z', rep: 'M4 4v6h6 M20 20v-6h-6 M5 15a8 8 0 0 0 14 3 M19 9A8 8 0 0 0 5 6',
    chart: 'M4 20V10 M10 20V4 M16 20v-7 M22 20H2',
    scale: 'M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M9 9a4 4 0 0 1 6 0 M12 12l1.5-2', phone: 'M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z M11 18h2', flame: 'M12 22c4 0 7-3 7-7 0-3-2-5.5-3.5-7-.3 2-1.5 3.5-3 4 .5-3-1-6.5-4-8 .5 3-1.5 5-3 7S4 13.5 5 16c.8 3.5 3.5 6 7 6z'
  });
  function segHtml(label, items, extra) {            // BITTA segment komponenti (Til, Mavzu, Shrift, Hazil, Jins, Ovqat vaqti): tanlangani — accent fon; role=radiogroup/radio + aria-checked
    return '<div class="sl-seg" role="radiogroup" aria-label="' + esc(label) + '"' + (extra || '') + '>' + items.map(function (i) { return '<button type="button" role="radio" aria-checked="' + !!i.on + '" class="' + (i.on ? 'on' : '') + '" ' + i.attrs + '>' + esc(i.text) + '</button>'; }).join('') + '</div>';
  }
  function catIcon(c, big) { return '<span class="sl-ci' + (big ? ' big' : '') + '">' + ico(c) + '</span>'; }

  /* ---------- qobiq ---------- */
  function shell() {
    var tab = function (v, ic, k) { return '<button type="button" class="rz-tab" data-act="tab" data-v="' + v + '">' + ico(ic) + '<span class="l" data-k="' + k + '"></span><span class="s" data-k="' + k + '"></span></button>'; };
    root.innerHTML =
      '<div class="rz-top">' + (isNativeApp() ? '' : '<a class="rz-logo" href="./" data-cyr="skip">Kalki<span>.uz</span></a>') + '<div class="rz-title" id="rzTitle"></div>' +          // Android ilovasida «Kalki.uz» havolasi yo'q
      '<div class="rz-langwrap"><button type="button" class="rz-lang" id="rzLang" data-act="langmenu" aria-label="Til / Язык" data-cyr="skip">' + ico('lang', '', 2) + '<span id="rzLangTxt">UZ</span></button>' +
      '<div class="rz-langmenu" id="rzLangMenu" hidden data-cyr="skip"><button type="button" data-act="lang" data-l="uz">UZ</button><button type="button" data-act="lang" data-l="cyr">ЎЗ</button><button type="button" data-act="lang" data-l="ru">RU</button></div></div></div>' +
      '<main class="rz-main" id="rzMain" tabindex="-1"></main>' +
      '<div class="sl-addbar" id="rzAddBar" hidden><button type="button" class="sl-main" id="mainAdd" data-act="add">' + ico('plus', '', 2.5) + '<span data-k="mainAdd"></span></button></div>' +          // Bugun: bitta katta «Qo'shish» — aylantiriladigan maydondan TASHQARIDA (kontent tugma ostida qolmaydi)
      '<nav class="rz-nav" aria-label="' + esc(T('appName')) + '">' + tab('today', 'today', 'navToday') + tab('history', 'cal2', 'navHist') + tab('profile', 'me', 'navProfile') +
      '<button type="button" class="rz-fab" id="rzFab" data-act="fab" aria-label="' + esc(T('navAdd')) + '">' + ico('plus', '', 2.6) + '<span class="fl" data-k="navAdd"></span></button></nav>' +          // Tarix: aylantiriladigan maydondan TASHQARIDA (v47: kontent ustiga tushmaydi) +
      kit.shellHtml() + '<input type="file" id="phIn" accept="image/*" hidden><div class="rz-onb" id="rzOnb" hidden></div><div class="rz-onb rz-intro" id="rzIntro" hidden></div>';
  }

  /* ---------- umumiy bo'laklar ---------- */
  function planNow() { var pl = S.planSt(st); if (st && st.weights && st.weights.length) { pl.protein = protNow(); pl.macros = S.macros(pl.target, S.currentWeight(st), pl.goal, pl.protein.g); } return pl; }          // oqsil maqsadi — trend vaznidan (Bugun kartasi va makro tafsiloti bir xil)
  /* ---------- taom rasmlari (assets/ovqat, 128/256 px WebP) va harfli tile ---------- */
  var IMGS = {};
  ['anor', 'ayron', 'banan', 'burger', 'chuchvara', 'dimlama', 'guruch', 'kartoshka-fri', 'lagmon', 'manti', 'mastava', 'moshxorda', 'navvot', 'norin', 'olivye', 'olma', 'osh', 'patir', 'pitsa', 'qatiq', 'qatlama', 'qovun', 'qovurdoq', 'qozon-kabob', 'shashlik', 'suzma', 'tarvuz', 'tuxum', 'uzum', 'xurmo'].forEach(function (k) { IMGS[k] = k; });
  var IMGMAP = { shurva: 'shorva', 'tovuq-shurva': 'shorva', choy: 'qora-choy', 'choy-shakar': 'qora-choy', 'choy-sut': 'qora-choy', 'yashil-choy': 'kok-choy', 'lavash-tovuq': 'lavash', 'lavash-mol': 'lavash', 'lavash-roll': 'lavash', hotdog: 'hot-dog', chakchak: 'chak-chak', achichuk: 'achchiq-chuchuk', 'tovuq-son': 'tovuq', 'tovuq-qov': 'tovuq', 'tuxum-qov': 'tuxum', 'tuxum-xom': 'tuxum', 'yengil-osh': 'osh', 'chuchvara-sho': 'chuchvara', 'shashlik-tovuq': 'shashlik', 'lagmon-qov': 'lagmon', 'kafe-tovuq-shashlik': 'shashlik', 'kafe-qoy-shashlik': 'shashlik', 'kafe-mol-shashlik': 'shashlik', 'kafe-lyulya': 'shashlik', 'kafe-baliq-shashlik': 'shashlik', 'kafe-jigar-kabob': 'shashlik', 'kafe-tandir-kabob': 'shashlik', 'kafe-jiz': 'shashlik', 'uy-tovuq-shashlik': 'shashlik', 'uy-lyulya': 'shashlik', 'kafe-tovuq-qanot': 'tovuq', 'kafe-tovuq-son-grill': 'tovuq', 'kafe-tandir-tovuq': 'tovuq', 'choyxona-osh': 'osh', 'mz-korovka-rojok': 'muzqaymoq-rojok', 'mz-korovka-eskimo-belgiya': 'eskimo', 'mz-korovka-eskimo': 'eskimo', 'mz-korovka-stakan-shokolad': 'plombir-vafli', 'mz-korovka-konteyner': 'muzqaymoq-briket', 'mz-bomba-konus': 'muzqaymoq-rojok', muzqaymoq: 'muzqaymoq-plombir', 'toy-oshi': 'osh', 'samarqand-oshi': 'osh', 'fargona-oshi': 'osh', 'buxoro-oshi': 'osh', 'kafe-lagmon-tovuq': 'lagmon', 'kafe-lagmon-qoy': 'lagmon', 'kafe-mastava': 'mastava', 'kafe-moshxorda': 'moshxorda', 'kafe-chuchvara-shorva': 'chuchvara', 'kafe-shurva': 'shorva', 'kafe-tovuq-shurva': 'shorva', 'uy-tovuq-shurva': 'shorva', 'doner': 'lavash', 'uy-lavash-tovuq': 'lavash', 'hotdog-mol': 'hot-dog', 'hotdog-tovuq': 'hot-dog', 'omlet-sabzavot': 'tuxum' };
  Object.keys(IMGMAP).forEach(function (k) { IMGS[k] = IMGMAP[k]; });
  /* rasmsiz edi (v44 tekshiruvi): yaqin mavjud rasm — variant/alias va o'xshash taom */
  var IMG2 = { 'tvister': 'lavash', 'tvister-grill': 'lavash', 'kesadilya': 'lavash', 'tovuq-burger-grill': 'burger', 'choy-limon': 'qora-choy', 'otli-choy': 'kok-choy', 'guruch-shurva': 'shorva', 'tovuq-bulon': 'shorva', 'besh-don-shurva': 'moshxorda', 'ganfan': 'guruch', 'tuxum-sarigi': 'tuxum', 'tuxum-oqi': 'tuxum', 'hotdog-shashlik': 'hot-dog', 'sezar-roll': 'lavash', 'toshkent-salat': 'olivye', 'kok-olma': 'olma', 'dolma-uzum': 'dolma', 'kartoshka-qov': 'kartoshka-qovurdoq', omlet: 'tuxum-boltunya', 'non-oq': 'baget', 'sut-yogsiz': 'sut', tvorog9: 'tvorog', tvorog0: 'tvorog', tvorog18: 'tvorog', 'yogurt-meva': 'yogurt-meva', 'qatiq-yogsiz': 'qatiq', 'tunets-suv': 'tunets', 'tuxum-qov-yogsiz': 'tuxum', 'kotleta-kiyev': 'kotlet', makaron: 'spagetti', 'makaron-xom': 'spagetti', 'makaron-pishgan2': 'spagetti', 'makaron-yangi': 'spagetti', 'lapsha-tuxum': 'spagetti', 'guruch-xom': 'guruch', 'guruch-jigarrang': 'guruch', 'guruch-yovvoyi': 'guruch', bulgur: 'turk-bulgur', 'kartoshka-duxovka': 'turk-kumpir', 'kofe-3in1': 'kofe-3v1', latte: 'kofe-latte', kapuchino: 'kofe-sutli', 'sharbat-apelsin': 'sharbat-meva', 'sharbat-anor': 'sharbat-meva', 'sharbat-uzum': 'sharbat-meva', 'burger-katta': 'burger', 'pitsa-pepperoni': 'pitsa', 'pitsa-4': 'pitsa-pishloq', 'shokolad-qora': 'shokolad-plitka', chizkeyk: 'chizkeyk', 'bulochka-shokolad': 'kruassan', napoleon: 'tort-shokolad', medovik: 'tort-shokolad' };
  Object.keys(IMG2).forEach(function (k) { if (!IMGS[k]) IMGS[k] = IMG2[k]; });
  /* rasmi hali yo'q mahsulotlar (sabzavot, meva, yorma, sous…) — harf o'rniga TURI bo'yicha ikonka (data/ovqatlar.json `t`) */
  var TYPE_ICO = { v: 'kVeg', f: 'kFruit', d: 'kFruit', g: 'kGrain', x: 'kSauce', s: 'kMilk', m: 'kGosht', i: 'kDrink', h: 'kDesert', q: 'kFast', o: 'kShorva', n: 'kBread' };
  /* IKONKA-XARITA:BOSH — tools/ikonka-ula.js yozadi (data/ikonka-reja.txt + assets/ovqat dagi fayllar bo'yicha); qo'lda tahrir qilinmaydi */
  var IKX = {"achchiq-qalampir":"achchiq-qalampir","activia":"yogurt","adrenaline":"energetik","agusha-tvorog":"tvorog","alpen-gold":"shokolad-plitka","alpen-gold-maxfun":"shokolad-plitka","alpen-gold-oreo":"shokolad-plitka","aminokislota":"aminokislota","apelsin-gazli":"fanta","aralash-yongoq":"aralash-yongoq","aroq":"aroq","asal":"asal","bagel":"bagel","baget":"baget","baliq-dimlama":"baliq-dimlama","baliq-kotlet":"kotlet","baliq-panirovka":"baliq-panirovka","baliq-qov":"baliq-qovurilgan","baliq-shurva":"baliq-uxa","baqlajon":"baqlajon","baqlajon-qaynatilgan":"baqlajon","barni":"barni","bedana":"bedana","bedana-tuxum":"bedana-tuxum","belvita":"pechenye-suli","belyashi":"chebureki","beshbarmoq":"beshbarmoq","big-mac":"big-mac","biskvit":"biskvit","biskvit-oq":"biskvit","blin":"blin","bodom":"bodom","bodom-qovurilgan":"bodom","bodom-sut":"bodom-sut","bodring":"bodring","boglirsoq":"chak-chak-ikki","borsch":"borsch","brauni":"brauni","braziliya-yongogi":"braziliya-yongogi","brokkoli":"brokkoli","brokkoli-qaynatilgan":"brokkoli","bulochka":"bulochka","bulochka-darchin":"bulochka-darchin","burger-bulochka":"bulochka","burn":"energetik","burrito":"burrito","buzoq":"mol-tosh","buzoq-qiyma":"qiyma","chalop":"chalop","chalpak":"yupqa","chebureki":"chebureki","cheetos":"chips-nachos","chili-konkarne":"burrito","chips":"chips","chips-nachos":"chips-nachos","chizburger":"chizburger","choko-pie":"choko-pie","chortan":"chortan","choy-asal":"choy-shakarli","choy-limon-shakar":"choy-shakarli","choy-navvot":"choy-shakarli","choy-shakar1":"choy-shakarli","choy-shakar2":"choy-shakarli","choy-sut-shakar":"choy-sutli","chudo-tvorojok":"tvorog","chupa-chups":"ledenets","coca-cola":"kola","coca-cola-zero":"kola","danissimo":"tvorog","dimlama-tovuq":"dimlama-tovuq","dolma":"dolma","domik-qaymoq":"qaymoq","donut":"donut","donut-glazur":"donut","doshirak-pishloq":"ramen","dumba":"dumba","echki":"echki","ehrmann-desert":"yogurt","ehrmann-kokteyl":"yogurt","ehrmann-protein":"yogurt","ekler":"ekler","energetik":"energetik","espresso":"kofe","falafel":"falafel","fanta":"fanta","fanta-zero":"fanta","ferrero-rocher":"konfet","fitkit-cake":"protein-pechenye","flash-up":"energetik","forel":"forel","funduk":"funduk","funduk-qovurilgan":"funduk","fuze-tea":"choy-sovuq","geyner":"geyner","gorilla":"energetik","gosht-dimlangan-konserva":"dimlama-konserva","gosht-quritilgan":"jerki","goshtli-non":"goshtli-non","granola":"granola","granola-batonchik":"granola-batonchik","granola-uy":"granola","grechka":"grechka","grechka-gosht":"grechka-gosht","grechka-xom":"grechka","grilyazh":"konfet","gulkaram":"gulkaram","gulkaram-qaynatilgan":"gulkaram","gulyash":"jarkop","gumma":"pirojki","guruch-lapsha":"guruch-lapsha","guruch-qovurilgan":"qovurilgan-guruch","guruch-xlebets":"xlebets","halim":"halim","haribo":"jele-konfet","hasip":"hasip","holva-kunjut":"holva-tahin","ikra":"ikra","ikra-baqlajon":"ikra-sabzavot","ikra-qovoqcha":"ikra-sabzavot","inmarko-eskimo":"eskimo","iriska":"iriska","issiq-shokolad":"issiq-shokolad","j7-apelsin":"sharbat-meva","jarkop":"jarkop","jele-konfet":"jele-konfet","jigar":"jigar-mol","jigar-kabob":"jigar-kabob","jigar-qovurma":"jigar-qovurma","jiz":"jiz","kafe-baliq-shurva":"baliq-uxa","kafe-kabob":"kabob-mol-qoy","kafe-kartoshka-shurva":"kartoshka-shurva","kafe-losos-steyk":"losos-steyk","kafe-qovurga":"qovurga-grill","kafe-sabzavot-shashlik":"sabzavot-shashlik","kafe-sazan-qovurma":"baliq-qovurma","kakao":"issiq-shokolad","kalmar":"kalmar","karam":"karam","karam-qaynatilgan":"karam","karam-salat":"salat-sabzavot","karamel":"ledenets","kartoshka":"kartoshka","kartoshka-qovurma":"kartoshka-qovurdoq","kartoshka-xom":"kartoshka","kashtan":"kashtan","kedr-yongogi":"kedr","kefir":"kefir","kefir-qulupnay":"kefir","keks":"biskvit","keks-darchin":"biskvit","kepak-non":"non-bugdoy","keshyu":"keshyu","kesma":"shurva-lapsha","kinder-bueno":"kinder-bueno","kinder-shokolad":"shokolad-plitka","kinoa":"kinoa","kirieshki":"suxari","kitkat":"kitkat","kofe":"kofe","kofe#3in1":"kofe-3v1","kofe#kapuchino":"kofe-latte","kofe#latte":"kofe-latte","kok-choy-shakar":"choy-kok-shakar","kok-chuchvara":"kok-chuchvara","kokos-batonchik":"kokos-batonchik","kokos-qirindi":"kokos-qirindi","kokos-suvi":"kokos-suvi","kola":"kola","kolbasa":"kolbasa","kolbasa-dudlangan":"kolbasa","kompot":"kompot","konfet":"konfet","konyak":"konyak","koreys-sabzi":"koreys-sabzi","kornfleks":"kornfleks","kotlet":"kotlet","kozinak":"kozinak","krab":"krab","krab-salat":"krab-tayoq","krab-tayoq":"krab-tayoq","kraker":"kraker","krem-pishloq":"krem-pishloq","krendel":"krendel","krevetka":"krevetka","krevetka-panirovka":"krevetka-panirovka","kruassan":"kruassan","kungaboqar":"pista","kungaboqar-qovurilgan":"kungaboqar-yadro","kunjut":"kungaboqar-yadro","kunjut-qovurilgan":"kungaboqar-yadro","kurka":"kurka","kurka-kokrak":"kurka","kurka-qiyma":"qiyma","kuskus":"kuskus","kvas":"kvas","lavash-non":"lavash-yupqa","lavlagi-salat":"vinegret","lays":"chips","lazanya":"lazanya","ledenets":"ledenets","limon-sharbat":"limon-suvi","limonad":"limonad","limonad-limon":"limonad-uy","lion":"snickers","lipton-ice-tea":"choy-sovuq","losos":"losos-steyk","losos-dudlangan":"losos-dudlangan","lotus-biscoff":"pechenye-qumli","loviya":"loviya","loviya-oq":"loviya","loviya-qora":"loviya-qora","loviya-shurva":"loviya-shurva","lyulya":"lyulya","maffin":"maffin","makadamiya":"makadamiya","makaron-gosht":"spagetti","makkajoxori":"makkajoxori","makkajoxori-botqa":"makkajoxori-botqa","mampar":"mampar","manka":"manka","margarin":"sariyog","marmelad":"marmelad","mars":"mars","marshmallow":"marshmallow","merci":"konfet","mevali-ichimlik":"mevali-ichimlik","midiya":"midiya","milka":"shokolad-plitka","milka-funduk":"shokolad-plitka","milky-way":"mars","mintay":"baliq-qovurilgan","mirinda":"fanta","mishka-kosolapiy":"konfet","mms":"mms","mms-yongoq":"mms","mol-buyrak":"buyrak","mol-gosht":"mol-gosht","mol-jigar-dim":"jigar-mol","mol-jigar-qov":"jigar-mol","mol-kotlet-grill":"kotlet","mol-miya":"miya","mol-qaynatilgan":"mol-gosht","mol-qiyma":"qiyma","mol-til":"til","mol-tosh":"mol-tosh","mol-yurak":"yurak","monster":"energetik","mosh":"mosh","moshkichiri":"moshkichiri","moshxorda-gostsiz":"moshxorda-goshtsiz","motsarella":"motsarella","murabbo":"murabbo","muzqaymoq":"muzqaymoq-plombir","muzqaymoq-eskimo":"eskimo","mz-eskimo-glazur":"eskimo","mz-eskimo-yongoq":"eskimo","mz-konus-shokolad":"muzqaymoq-rojok","mz-konus-sundae":"muzqaymoq-rojok-sous","mz-light":"muzqaymoq-plombir","mz-makflurri":"makflurri","mz-meva-bar":"muzli","mz-muzli":"muzli","mz-plombir-briket":"muzqaymoq-briket","mz-plombir-stakan":"muzqaymoq-plombir","mz-plombir-vafli":"plombir-vafli","mz-qulupnay":"muzqaymoq-qulupnay","mz-rojok":"muzqaymoq-rojok","mz-sendvich":"muzqaymoq-briket","mz-shakarsiz":"muzqaymoq-plombir","mz-shokolad":"muzqaymoq-shokolad","mz-shokolad-light":"muzqaymoq-shokolad","mz-shokolad-plombir":"muzqaymoq-shokolad","mz-sorbet":"sorbet","mz-stakancha":"plombir-vafli","mz-sundae":"sundae","mz-vafli-briket":"muzqaymoq-briket","mz-vafli-stakan":"vafli-stakancha","mz-vanil":"muzqaymoq-plombir","mz-yogurt":"muzlatilgan-yogurt","mz-yogurt-shokolad":"muzlatilgan-yogurt","mz-yumshoq":"muzqaymoq-yumshoq","nachos-pishloq":"nachos","naggets":"naggets","nektar-mango":"nektar-mango","nektar-nok":"nektar-nok","nektar-orik":"nektar-shaftoli","nektar-shaftoli":"nektar-shaftoli","nesquik":"issiq-shokolad","non-bugdoy":"non-bugdoy","non-jovdar":"non-qora","non-pita":"pita","non-qora":"non-qora","noxat":"noxat","noxat-pallali":"noxat","noxat-ragu":"noxat-ragu","nuga":"nuga","nutella":"nutella","okroshka":"chalop","okun":"chortan","on-whey":"sport-protein-kukun","ordak":"ordak","osh-tovuq":"osh-tovuq","ot-gosht":"ot-gosht","pahta":"kefir","pankeyk":"pankeyk","parvarda":"parvarda","pastila-meva":"pastila","paxlava":"paxlava","pechenye":"pechenye-qumli","pechenye-anjir":"pechenye-anjir","pechenye-molochnoe":"pechenye-qumli","pechenye-oreo":"pechenye-oreo","pechenye-qumli":"pechenye-qumli","pechenye-sariyog":"pechenye-qumli","pechenye-shokolad":"pechenye-chip","pechenye-suli":"pechenye-suli","pechenye-zanjabil":"pechenye-zanjabil","pekan":"pekan","pelmeni":"pelmeni","pepsi":"kola","pepsi-zero":"kola","perlovka":"perlovka","pirog-olcha":"pirog-olcha","pirog-olma":"pirog-olma","pirog-qovoq":"pirog-qovoq","pirojki":"pirojki","pirojnoe-pishloq":"sloyka","pishloq":"pishloq-qattiq","pishloq-chedder":"pishloq-qattiq","pishloq-echki":"pishloq-echki","pishloq-eritilgan":"krem-pishloq","pishloq-feta":"pishloq-brynza","pishloq-gauda":"pishloq-qattiq","pishloq-hochland":"krem-pishloq","pishloq-kok":"pishloq-kok","pishloq-parmezan":"parmezan","pishloq-rikotta":"rikotta","pishloq-shveytsar":"pishloq-qattiq","pishloq-yumshoq":"pishloq-brynza","pista":"pistachio","pista-pistachio-tuzli":"pistachio","pista-qovurilgan":"pista","pita-chips":"pita-chips","pitsa-pishloq":"pitsa-pishloq","pivo":"pivo","pivo-yengil":"pivo","piyoz":"piyoz","piyoz-halqa":"piyoz-halqa","pomidor":"pomidor","popkorn":"popkorn","popkorn-karamel":"popkorn-karamel","popkorn-sariyog":"popkorn","popkorn-yogsiz":"popkorn","president-brinza":"pishloq-brynza","president-pishloq":"krem-pishloq","president-smetana":"smetana","pringles":"chips-pringles","protein-bar":"protein-batonchik","protein-bar-40":"protein-batonchik","protein-bar-60":"protein-batonchik","protein-izolyat":"sport-protein-kukun","protein-kazein":"sport-protein-kukun","protein-kokteyl-tayyor":"protein-kokteyl","protein-kukun":"sport-protein-kukun","protein-pechenye":"protein-pechenye","protein-rex":"protein-batonchik","protein-rex-tiramisu":"protein-batonchik","pryanik":"pryanik","qahva-shakar":"kofe","qahva-sovuq":"kofe-muzli","qahva-sutli":"kofe-sutli","qahva-sutli-shakar":"kofe-sutli","qalampir":"qalampir","qalampir-dolma":"qalampir-dolma","qalampir-qizil":"qalampir","qand":"qand","qatiq-salat":"salat-qatiq","qaymoq":"qaymoq","qaymoq-10":"qaymoq","qaymoq-kukun":"qaymoq","qaymoq-yogli":"qaymoq","qaynatma-baliq":"baliq-uxa","qazi":"qazi","qizil-baliq-konserva":"qizil-baliq-konserva","qorin":"qorin","qovoq":"qovoq","qovoq-qaynatilgan":"qovoq","qovoq-urugi":"kungaboqar-yadro","qovoq-urugi-qovurilgan":"kungaboqar-yadro","qoy-buyrak":"buyrak","qoy-gosht":"qoy-gosht","qoy-jigar-qov":"jigar-mol","qoy-kabob-bolak":"kabob-mol-qoy","qoy-kurak":"mol-tosh","qoy-miya":"miya","qoy-opka":"opka","qoy-qiyma":"qiyma","qoy-son":"qoy-gosht","qoy-til":"til","qoy-yogsiz-dim":"qoy-gosht","qoy-yurak":"yurak","qoymoq":"qoymoq","qurt":"qurt","qushtili":"qushtili","quyon":"quyon","raf":"kofe-latte","raffaello":"konfet","ramen":"ramen","red-bull":"energetik","red-bull-zero":"energetik","rich-sharbat":"sharbat-ananas","roshen-karamel":"ledenets","roshen-shokolad":"shokolad-plitka","sabzavot-ragu":"sabzavot-ragu","sabzi":"sabzi","sabzi-qaynatilgan":"sabzi","sabzi-sharbat":"sharbat-sabzi","salat-sabzavot":"salat-sabzavot","sardina":"sardina","sarimsoq":"sarimsoq","sariyog":"sariyog","sariyogli-sut":"sut","sazan-duxovka":"sazan-duxovka","sazan-grill":"sazan-duxovka","sazan-qovurma":"baliq-qovurma","sdoba":"bulochka","seld":"seld","seld-dudlangan":"seld","sendvich":"sendvich","sendvich-baget":"sendvich","sendvich-baliq":"sendvich-baliq","sendvich-mol":"sendvich","sendvich-tovuq":"sendvich","sendvich-tunets":"sendvich","sezar-salat":"sezar-salat","sgushyonka":"sgushyonka","shakar":"shakar","sharbat-ananas":"sharbat-ananas","sharbat-greypfrut":"sharbat-greypfrut","sharbat-klyukva":"sharbat-olcha","sharbat-olcha":"sharbat-olcha","sharbat-olma":"sharbat-meva","sharbat-olxori":"sharbat-olxori","shirguruch":"shirguruch","shivit-oshi":"shivit-oshi","shokolad-bodom":"shokolad-bodom","shokolad-oq":"shokolad-oq","shokolad-shirin":"shokolad-plitka","shokolad-sut":"shokolad-plitka","shokoladli-sut":"shokoladli-sut","shovla":"shovla","shtrudel":"shtrudel","shurva-mol-sabzavot":"shurva-mol","shurva-pomidor":"shurva-pomidor","shurva-qoziqorin":"shurva-qoziqorin","shurva-tovuq-lapsha":"shurva-lapsha","sirniki":"sirniki","sirok":"sirok","sirok-glazur2":"sirok","skumbriya":"skumbriya","sloyka":"sloyka","smetana":"smetana","smuzi":"smuzi","smuzi-mango":"smuzi","snickers":"snickers","snickers-krisper":"snickers","snickers-oq":"snickers","solyanka":"shurva-mol","sosiska":"sosiska","sovuq-choy":"choy-sovuq","soya-pishgan":"loviya","soya-sut":"bodom-sut","spagetti-bolonez":"spagetti","sport-izotonik":"izotonik","sport-izotonik-zero":"izotonik","sport-snickers-marathon":"sport-batonchik","sprite":"limonad","sprite-zero":"limonad","steyk":"steyk","suli":"suli-botqa","suli-quruq":"suli-xom","suli-sutli":"shirguruch","suli-xom":"suli-xom","sumalak":"sumalak","sut":"sut","sut-kokteyl":"sut-kokteyl","sut-kukun":"sut-kukun","sut-oshi":"shurva-lapsha","sut-quyultirilgan":"sut-quyultirilgan","suv":"suv","suxari":"suxari","suzma-salat":"salat-qatiq","tako":"tako","tandir-gosht":"tandir-gosht","tariq":"tariq","tariq-sutli":"shirguruch","tarxun":"limonad","tefteli":"tefteli","tilapiya":"baliq-qovurilgan","toblerone":"shokolad-plitka","toffifee":"konfet","tort":"tort-shokolad","tort#chizkeyk":"chizkeyk","tort-shokolad":"tort-shokolad","tortilya":"lavash-yupqa","tost":"tost","tovuq-boldir-qov":"tovuq-boldir","tovuq-boneless":"naggets","tovuq-grill":"tovuq-duxovka","tovuq-jigar":"jigar-tovuq","tovuq-jigar-qov":"jigar-tovuq","tovuq-kfc":"tovuq-kfc","tovuq-kokrak":"tovuq-kokrak","tovuq-kokrak-duxovka":"tovuq-kokrak-grill","tovuq-kokrak-qov":"tovuq-kokrak-grill","tovuq-kokrak-qozon":"tovuq-qozon","tovuq-kotlet":"kotlet","tovuq-oshqozon":"tovuq-oshqozon","tovuq-qanot":"tovuq-qanot","tovuq-qanot-qov":"tovuq-qanot","tovuq-qaynatilgan":"tovuq-kokrak","tovuq-shirin-nordon":"shirin-nordon-tovuq","tovuq-son-qozon":"tovuq-qozon","tovuq-soya":"shirin-nordon-tovuq","tovuq-yurak":"tovuq-yurak","tr-adana-kabob":"turk-adana","tr-asure":"turk-asure","tr-baklava":"turk-baklava","tr-bulgur-pilavi":"turk-bulgur","tr-cacik":"turk-cacik","tr-choy":"turk-choy","tr-choy-shakar":"turk-choy-shakar","tr-coban-salat":"turk-coban-salat","tr-doner-mol-lavash":"turk-doner-mol","tr-doner-mol-non":"turk-doner-non","tr-doner-tovuq-lavash":"turk-doner-tovuq","tr-ezogelin":"turk-ezogelin","tr-gozleme":"turk-gozleme","tr-irmik-helvasi":"turk-irmik-helvasi","tr-iskender":"turk-iskender","tr-kadayif":"turk-kadayif","tr-karniyarik":"turk-karniyarik","tr-kisir":"turk-kisir","tr-kofte":"turk-kofte","tr-kumpir":"turk-kumpir","tr-kunefe":"turk-kunefe","tr-kuru-fasulye":"turk-kuru-fasulye","tr-lahmajun":"turk-lahmajun","tr-lokma":"turk-lokma","tr-lokum":"turk-lokum","tr-manti":"turk-manti","tr-menemen":"turk-menemen","tr-mercimek":"turk-mercimek","tr-mucver":"turk-mucver","tr-patlican-salatasi":"turk-patlican","tr-pide-goshtli":"turk-pide-gosht","tr-pide-pishloqli":"turk-pide-pishloq","tr-pisi":"turk-pisi","tr-qahva":"turk-qahva","tr-qahva-shakar":"turk-qahva","tr-revani":"turk-revani","tr-sigara-boregi":"turk-sigara-boregi","tr-simit":"turk-simit","tr-su-boregi":"turk-su-boregi","tr-sutlac":"turk-sutlac","tr-tavuk-sis":"turk-tavuk-sis","tr-tulumba":"turk-tulumba","tr-urfa-kabob":"turk-urfa","treska":"baliq-qovurilgan","tuc":"kraker","tunets":"tunets","tunets-yog":"tunets","tushonka":"dimlama-konserva","tuxum-barak":"tuxum-barak","tuxum-qov-aralash":"tuxum-boltunya","tvorog-donador":"tvorog","tvorog-zapekanka":"sirniki","tvorog5":"tvorog","twix":"twix","ugra-osh":"ugra-osh","unash":"unash","uy-qoy-duxovka":"qoy-duxovka","uy-tovuq-duxovka":"tovuq-duxovka","vafli":"vafli-belgiya","vafli-belgiya":"vafli-belgiya","vafli-vanil":"vafli-vanil","valio-tvorog":"tvorog","valio-yogurt":"yogurt","vareniki":"vareniki","vatrushka":"bulochka","vinegret":"vinegret","vino":"vino","vino-oq":"vino","vino-shirin":"vino","xalva":"holva-tahin","xonim":"xonim","yasmiq":"yasmiq","yasmiq-shurva":"yasmiq-shurva","yasmiq-tovuq":"yasmiq-shurva","yerfistiq":"yeryongoq","yerfistiq-tuzli":"yeryongoq","yeryongoq-pasta":"yeryongoq-pasta","yogurt-meva2":"yogurt-meva","yogurt-tabiiy":"yogurt","yogurt-vanil":"yogurt","yogurt-yunon":"yogurt","yongoq":"yongoq-grek","yongoq-mevali-aralash":"aralash-yongoq","yupqa":"yupqa","zefir":"marshmallow"};
  /* IKONKA-XARITA:OXIR */
  /* v67: fast-food TARMOG'I taomlari (id: tm-<tarmoq>-<tur>-…) — tur bo'yicha mavjud ikonka */
  var TM_ICO = { lavash: 'lavash', shaurma: 'lavash', tvister: 'lavash', donar: 'turk-doner-non', burger: 'burger', chizburger: 'chizburger', hotdog: 'hot-dog', sendvich: 'sendvich', fri: 'kartoshka-fri', naggets: 'naggets', strips: 'naggets', qanot: 'tovuq-qanot', pitsa: 'pitsa-pishloq' };
  function imgFile(fid, vr) {
    if (!fid) return null; var tmx = /^tm-[a-z]+-([a-z]+)-/.exec(fid); if (tmx && TM_ICO[tmx[1]]) return TM_ICO[tmx[1]]; var k = dbAlias[fid] || fid; var xv = vr && IKX[k + '#' + vr]; if (xv) return xv;
    if (String(fid).indexOf('somsa') === 0 || k === 'somsa') return (fid === 'somsa-qovoq' || /qovoq/.test(vr || '')) ? 'somsa-qovoq' : 'somsa-gosht';
    if (k === 'non') return vr === 'buxanka' ? null : (vr === 'patir' ? 'patir' : (vr === 'qatlama' ? 'qatlama' : 'obi-non'));
    if (fid === 'non-oq' || fid === 'non-qora') return IKX[fid] || null;
    return IMGS[fid] || IMGS[k] || IKX[fid] || IKX[k] || null;
  }
  var KAT_ICO = { salat: 'kSalat', shorva: 'kShorva', issiq: 'kGosht', zakuska: 'kZakuska', desert: 'kDesert' };          // ikonkasi yo'q taom: bosh harf o'rniga toifa ikonkasi (menyudan qo'shilganlar — e.ikat)
  function tileFile(file, name, px, hi) {             // rasm fayli nomi bo'yicha (retseptlar: data/uyda-pp.json `ic`); fayl bo'lmasa — oddiy tile
    if (!file) return tileHtml(null, null, name, px, hi); var sz = '--s:' + px + 'px';
    return '<span class="sl-tile" style="' + sz + '"><img src="/assets/ovqat/' + file + (hi ? '-256' : '-128') + '.webp"' + (hi ? '' : ' srcset="/assets/ovqat/' + file + '-128.webp 1x, /assets/ovqat/' + file + '-256.webp 2x"') + ' alt="" width="' + px + '" height="' + px + '" loading="lazy" decoding="async"></span>';
  }
  function tileHtml(fid, vr, name, px, hi, kat) {
    var f = imgFile(fid, vr), sz = '--s:' + px + 'px';
    if (f) return '<span class="sl-tile" style="' + sz + '"><img src="/assets/ovqat/' + f + (hi ? '-256' : '-128') + '.webp"' + (hi ? '' : ' srcset="/assets/ovqat/' + f + '-128.webp 1x, /assets/ovqat/' + f + '-256.webp 2x"') + ' alt="" width="' + px + '" height="' + px + '" loading="lazy" decoding="async"></span>';
    var ik = Y && fid ? Y.iconFor(fid) : null; if (!ik && kat && KAT_ICO[kat]) ik = KAT_ICO[kat];
    if (!ik) { var fo = baseOf(fid ? foodById(fid) : null); ik = (fo && TYPE_ICO[fo.t]) || 'bowl'; }          // harf-zaglushka YO'Q: turi bo'yicha (yoki umumiy idish) ikonka
    if (ik) return '<span class="sl-tile sl-ti2" style="' + sz + '" aria-hidden="true">' + ico(ik) + '</span>';
    var h = 0, n = String(name || '?'); for (var i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) % 360;
    return '<span class="sl-tile sl-tl" style="' + sz + ';--h:' + h + '" aria-hidden="true"><b>' + esc(n.charAt(0).toUpperCase()) + '</b></span>';
  }
  var WDN = { uz: ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'], ru: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'] };
  function entryRow(e, date) {
    var f = e.fid ? foodById(e.fid) : null, base = f && f.al ? (foodById(f.al.f) || f) : f, name = base ? nameOf(base) : (e.name || '?'), isNew = seenFood && !seenFood[e.id], lb = '';
    if (f && f.fam && e.vr) lb = S.famLabel(f, e.vr, e.sz, lang) || '';
    return '<button type="button" class="sl-row' + (isNew ? ' rz-new' : '') + '" data-act="editfood" data-d="' + date + '" data-id="' + e.id + '"><span class="m"><span class="nm">' + esc(name) + '</span><span class="tm">' + esc(portionText(e) + (lb ? ' · ' + lb : '')) + (e.est && !e.fid ? ' · ' + esc(T('aEst')) : '') + '</span></span><span class="am">' + (e.est && !e.fid ? '≈ ' : '') + fmt(e.kcal) + '</span></button>';
  }
  /* bazada yo'q (rasm/AI, matn) yozuvi uchun ikonka: nomi bazadagi taomga mos kelsa, o'sha taom id'si (ifid) — kkal o'zgarmaydi, faqat rasm.
     Yangi yozuvda saqlash paytida qo'yiladi; eskilarida baza yuklangach bir marta topilib saqlanadi. */
  function foldNm(x) { return String(x || '').toLowerCase().replace(/[ʻʼ'’`‘]/g, '').replace(/ё/g, 'е').replace(/[^a-zа-яўқғҳ0-9]+/g, ' ').trim(); }
  function iconMatch(nom) {
    if (dbState !== 2) return null; var q = String(nom || '').split(/[(·,]/)[0].trim(); if (q.length < 3) return null;
    try { var r = S.search(allFoods(), q, { limit: 3 }), b = foldNm(q); for (var i = 0; i < r.length; i++) { var f = r[i]; if (!f || f.custom || !imgFile(f.id, null)) continue; var a = foldNm(f.n), c = foldNm(f.r); if (a === b || c === b || a.indexOf(b + ' ') === 0 || c.indexOf(b + ' ') === 0 || b.indexOf(a + ' ') === 0 || (c && b.indexOf(c + ' ') === 0)) return f.id; } } catch (e) {}
    return null;
  }
  function lev1(a, b) { if (a === b) return 0; if (Math.abs(a.length - b.length) > 1) return 2; var i = 0, j = 0, d = 0; while (i < a.length && j < b.length) { if (a[i] === b[j]) { i++; j++; continue; } if (++d > 1) return 2; if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; } } return d + (a.length - i) + (b.length - j); }
  function menuMatch(nom) {                         // «Menyudan tanlash»: menyu nomi → bazadagi taom. 1) to'liq/so'z boshi mosligi; 2) birinchi 1–2 so'z (rus menyusi: «Борщ с говядиной» → Borsh), bitta harf farqi (borsch/borsh). Bo'lim mosligini KalkiMenyu.plan tekshiradi.
    if (dbState !== 2) return null; var q = String(nom || '').split(/[(·,]/)[0].trim(); if (q.length < 3) return null;
    var foods = allFoods(), b = foldNm(q), firstW = function (x) { return foldNm(x).split(' ')[0] || ''; };
    var ok = function (f, bb) { var a = foldNm(f.n), c = foldNm(f.r); return a === bb || c === bb || a.indexOf(bb + ' ') === 0 || c.indexOf(bb + ' ') === 0 || bb.indexOf(a + ' ') === 0 || (c && bb.indexOf(c + ' ') === 0) || (f.a || []).some(function (x) { return foldNm(x) === bb; }); };
    try {
      var r = S.search(foods, q, { limit: 3 }); for (var i = 0; i < r.length; i++) if (r[i] && !r[i].custom && ok(r[i], b)) return r[i];
      var ws = b.split(' ').filter(function (w) { return w.length >= 3; });
      for (var n = Math.min(2, ws.length); n >= 1; n--) {
        var qq = ws.slice(0, n).join(' '); if (qq.length < 4) continue; var rr = S.search(foods, qq, { limit: 3 });
        for (var k = 0; k < rr.length; k++) { var f = rr[k]; if (!f || f.custom) continue; if (ok(f, qq)) return f;
          if (n === 1 && k === 0 && qq.length >= 5 && [f.n, f.r].concat(f.a || []).some(function (x) { return lev1(firstW(x), qq) <= 1; })) return f; }
      }
    } catch (e) {}
    return null;
  }
  function iconFid(e) { if (!e || e.fid) return null; if (e.ifid !== undefined) return e.ifid; if (dbState !== 2) return null; e.ifid = iconMatch(e.name) || ''; save(); return e.ifid; }

  /* ---------- «Mening tartibim» + «Oqsil maqsadi» (v48; maket ~/tartib-maket.html; hisob — S.mealBudgets / S.protein; manbalar — docs/tartib.md) ---------- */
  var TT_MODES = ['std', 'kech', 'nobf', 'erkin'], TT_IC = { std: 'mlBowl', kech: 'mlMoon', nobf: 'cup', erkin: 'spark' }, TT_C = { std: 'gr', kech: 'bl', nobf: 'ye', erkin: 'pu' };
  var PROT_EX = ['tovuq-kokrak', 'tvorog5', 'mol-qaynatilgan', 'kurka-kokrak', 'tunets-suv', 'krevetka', 'tovuq-qaynatilgan', 'losos'];          // oqsil misoli: oddiy, bazadagi taomlar (kunga qarab almashadi)
  function ttMode() { return S.tartibOf(st && st.profile); }
  function ttName(m) { return T('tt_' + m); }
  function protKg() { var kg = S.currentWeight(st); try { if (window.KalkiPlato && st.weights.length) { var sm = KalkiPlato.summary(st.weights, todayStr(), 0, Dt); if (sm) kg = sm.kg; } } catch (e) {} return kg; }          // trend vazni (bor bo'lsa)
  function protNow() { return S.protein(st.profile, protKg()); }
  function nowMin() { var d = new Date(); return d.getHours() * 60 + d.getMinutes(); }
  function mbOf(date) {                               // bugungi ovqat budjetlari (o'tgan kunlarda — yo'q); kunlik limit: me'yor + ortiqcha qadam krediti (halqadagi bilan bir xil)
    var t = todayStr(); if (date !== t || ttMode() === 'erkin') return null;
    var x = S.dayOf(st, t) || { food: [], steps: 0 }, pl = planNow(), pr = st.profile, ea = {}; S.MEALS.forEach(function (m) { ea[m] = S.sumEntries(x.food.filter(function (e) { return e.meal === m; })).kcal; });
    var r = S.mealBudgets({ limit: S.dayPlan(st, t).limit, mode: ttMode(), eaten: ea, min: nowMin() });
    return r.meals && !r.dayOver ? r : null;          // kunlik jami oshsa — budjetlar ko'rsatilmaydi (oddiy holat)
  }
  function ttTilesHtml(m, lim) {                       // v50: foiz/chiziq o'rniga — shu odamning REAL kunlik me'yoridan kkal (nonushtasizda nonushta «—» xira)
    var x = S.mealSplit(lim, m); if (!x) return '';
    return '<span class="tt-ex">' + S.MEALS.map(function (k) { var z = S.TARTIB[m][k] === 0; return '<span class="' + (z ? 'z' : '') + '"><b>' + (z ? '—' : fmt(x[k])) + '</b>' + esc(T('ttL_' + k)) + '</span>'; }).join('') + '</span>';
  }
  function ttOptsHtml(sel, act) {
    var lim = planNow().target;
    return '<div class="tt-opts" role="radiogroup" aria-label="' + esc(T('ttQ')) + '">' + TT_MODES.map(function (m) {
      var on = m === sel;
      return '<button type="button" class="tt-opt' + (on ? ' on' : '') + '" role="radio" aria-checked="' + on + '" data-act="' + act + '" data-k="' + m + '"><span class="tt-oh"><span class="sl-ci fc-' + TT_C[m] + '">' + ico(TT_IC[m]) + '</span><span class="m"><b>' + esc(ttName(m)) + '</b></span><span class="tt-rd" aria-hidden="true"></span></span>' + ttTilesHtml(m, lim) + '</button>';
    }).join('') + '</div>';
  }
  var tv = null;
  function ttSheetHtml() { return shHead(T('ttQ')) + '<p class="rz-p tt-sub">' + esc(T('ttSub')) + '</p>' + ttOptsHtml(tv.sel, 'ttpick') + '<div class="rz-actions"><button type="button" class="rz-btn primary" data-act="ttsave">' + esc(T('ttSave')) + '</button></div><p class="rz-mut sm tt-hint">' + esc(T('ttHint', { k: fmt(planNow().target) })) + '</p>'; }
  function openTartib() { tv = { sel: ttMode() }; if (ftOpenNow()) closeFeats(true); openSheet('tartib', ttSheetHtml()); }
  function ttSet(m, from) { if (!S.TARTIB.hasOwnProperty(m)) return; st.profile.tartib = m; prefs().ttAsked = 1; stEv('tartib_tanlandi', m); save(); }
  function ttCardHtml() {                              // mavjud foydalanuvchilarga BIR MARTA (yopsa qaytmaydi): «Qanday ovqatlanasiz?»
    if (!st || !st.setup || st.profile.tartib || prefs().ttAsked || appDays() < 5) return '';          // v50: faqat 5+ kun ishlatgan va kamida 3 kun ovqat yozganlarga
    var nd = 0; Object.keys(st.days).forEach(function (d) { var x = st.days[d]; if (x && x.food && x.food.length) nd++; }); if (nd < 3) return '';
    return '<section class="rz-card tt-card" id="ttCard"><button type="button" class="tt-cb" data-act="ttopen"><span class="sl-ci fc-bl">' + ico('mlMoon') + '</span><span class="m"><b>' + esc(T('ttCardT')) + '</b><span>' + esc(T('ttCardS')) + '</span></span>' + ico('chev', 'r') + '</button><button type="button" class="rz-x tt-cx" data-act="ttno" aria-label="' + esc(T('close')) + '">' + ico('x') + '</button></section>';
  }
  /* oqsil kartasi (BJU qatori shu yerga birlashdi): «Oqsil 62 / 110 g», ko'k chiziq, maslahat (hozirgi/keyingi ovqat vaqtiga qolgan oqsil + bazadan misol), yog' va uglevod plitkalari */
  function protEx(need) {
    if (dbState !== 2 || need < 10) return null; var d = Dt.daysBetween('2026-01-01', todayStr()), n = PROT_EX.length;
    for (var i = 0; i < n; i++) { var f = foodById(PROT_EX[(d + i) % n]); if (!f || !(f.p > 5)) continue; var ri = rI(f); if (ri.pork || ri.hit.length) continue; var g = Math.min(250, Math.max(50, Math.round(need / f.p * 100 / 10) * 10)); /* oddiy porsiya chegarasida */ return { g: g, n: nameOf(f).replace(/\s*\(.*\)\s*$/, '').toLowerCase() }; }
    return null;
  }
  function protShare(tot, pg, mb) {                   // qolgan oqsil → hozirgi (yoki keyingi) ovqat vaqtiga, qolgan kkal budjeti ulushida; erkin tartibda — kunlik
    var left = Math.round(pg.g - tot.p), m = null, part = left; if (left <= 0 || !mb) return { m: null, part: Math.max(0, left), left: left };
    var now = mb.now || mealNow(), rest = S.MEALS.filter(function (k) { return mb.meals[k].state !== 'past' && mb.meals[k].budget > 0; }); m = rest.indexOf(now) > -1 ? now : rest[0];
    if (m) { var sum = rest.reduce(function (a, k) { return a + mb.meals[k].left; }, 0); part = sum > 0 ? Math.max(5, Math.round(left * mb.meals[m].left / sum / 5) * 5) : left; }
    return { m: m, part: part, left: left };
  }
  /* «Oqsil maqsadi» oynasi: avtomatik (1,6 / 1,2 g/kg) yoki qo'lda 60–250 g (10 g qadam) */
  var pgv = null;
  function pgSheetHtml() {
    var a = S.protein(Object.assign({}, st.profile, { protG: null }), protKg());
    return shHead(T('pgT')) + '<p class="rz-p">' + esc(T('pgH')) + '</p><div class="sl-stp pg-stp"><button type="button" class="sl-pill" data-act="pgm" data-d="-10" aria-label="−10 g"' + (pgv.g <= 60 ? ' disabled' : '') + '>' + ico('minus') + '</button><b id="pgVal">' + pgv.g + ' g</b><button type="button" class="sl-pill" data-act="pgm" data-d="10" aria-label="+10 g"' + (pgv.g >= 250 ? ' disabled' : '') + '>' + ico('plus') + '</button></div>' +
      '<p class="rz-mut sm pg-auto">' + esc(T('pgAutoV', { g: a.auto, k: dec(a.perKg, 1), w: dec(a.ref, 1) })) + '</p><div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="pgauto">' + esc(T('pgReset')) + '</button><button type="button" class="rz-btn primary" data-act="pgsave">' + esc(T('ttSave')) + '</button></div>';
  }
  function openProtG() { pgv = { g: protNow().g }; openSheet('protg', pgSheetHtml()); }

  function protDays(days) { var n = 0; (days || []).forEach(function (d) { var x = S.dayOf(st, d); if (x && x.food && x.food.length >= 2 && S.sumEntries(x.food).p >= protNow().g) n++; }); return n; }
  function protStat() {                               // anonim: kecha oqsil maqsadiga yetildimi (kuniga bitta hodisa; faqat yozuv bo'lgan kun)
    var y = Dt.addDays(todayStr(), -1), pr = prefs(); if (!st || !st.setup || pr.oqK === y) return; var x = S.dayOf(st, y); pr.oqK = y; save(); if (!x || !x.food || x.food.length < 2) return;
    stEv('oqsil_kun', S.sumEntries(x.food).p >= protNow().g ? 'ha' : 'yoq'); stEv('tartib_kun', ttMode());
  }
  /* v63 (maket ~/tarix-maket.html): «Bugungi ovqatlar» — VAQT CHIZIG'I. Chapda gradient chiziq + ovqat vaqti nuqtasi; to'lgan karta: ikonka, nom, «08:10 · 4 ta mahsulot» (birinchi yozuv vaqti), o'ngda mini halqa (52 px, ichida kkal;
     to'lishi = shu ovqat budjeti — «Kun tartibi» bo'lmasa kunlik limitdan ulush) va «+»; mahsulot qatori: rasm, nom, miqdor (2-qator), kkal.
     BIR XIL mahsulot (taom + variant + o'lcham) bir ovqat vaqtida bitta qatorga birlashadi («Olma ×3», miqdor/kkal yig'indisi) — faqat KO'RINISH, yozuvlar o'zgarmaydi; bosilsa alohida yozuvlar ro'yxati (tahrir/o'chirish).
     > 4 qator — yig'ilgan (ustma-ust rasmlar + «Ochish ›»). Bo'sh ovqat vaqti — ixcham qator: ikonka, nom, «~900 kkal qoldirilgan» / «Hali yo'q», «↺ Kechagidek», «+». */
  var ML_IC = { b: 'mlSun', l: 'mlBowl', d: 'mlMoon', s: 'mlSnack' }, mlOpen = {}, ML_FULL = 4;
  function two(n) { return (n < 10 ? '0' : '') + n; }
  function plRu(n, a, b, c) { var m = n % 100, k = n % 10; return m > 10 && m < 15 ? c : k === 1 ? a : k > 1 && k < 5 ? b : c; }
  function cntTxt(n) { return n + ' ' + (lang === 'ru' ? plRu(n, 'продукт', 'продукта', 'продуктов') : T('tlUnit')); }
  function mealTime(list, date) {                    // birinchi yozuv vaqti: faqat shu kunning o'zida yozilgan bo'lsa (keyin qo'shilgan eski kun yozuvi soxta vaqt ko'rsatmasin)
    var t = 0; list.forEach(function (e) { var ts = +e.ts; if (ts > 1e11 && (!t || ts < t)) t = ts; }); if (!t) return '';
    var d = new Date(t); return Dt.ymd(d.getFullYear(), d.getMonth() + 1, d.getDate()) === date ? two(d.getHours()) + ':' + two(d.getMinutes()) : '';
  }
  function mlName(e) { var f = e.fid ? foodById(e.fid) : null, base = baseOf(f); return base ? nameOf(base) : (e.name || '?'); }
  function mlQty(e) { var f = e.fid ? foodById(e.fid) : null, lb = f && f.fam && e.vr ? (S.famLabel(f, e.vr, e.sz, lang) || '') : '', q = portionText(e); return q + (lb ? ' · ' + lb : ''); }
  function mlGroups(list) {                          // bir xil mahsulotlar → bitta qator (birinchi paydo bo'lish tartibida)
    var out = [], idx = {};
    list.forEach(function (e) { var k = (e.fid || ('n:' + String(e.name || '').toLowerCase())) + '|' + (e.vr || '') + '|' + (e.sz || ''); if (idx[k] == null) { idx[k] = out.length; out.push({ es: [] }); } out[idx[k]].es.push(e); });
    return out;
  }
  function mlGroupQty(es) {                          // birlashgan miqdor: bir xil birlik — qty yig'indisi; aks holda gramm yig'indisi; matnli porsiya — «a + b»
    var e0 = es[0], g = 0, q = 0; es.forEach(function (e) { g += num(e.g); q += num(e.qty); });
    if (!e0.fid && e0.pt) return es.map(portionText).join(' + ');
    var same = e0.unit && e0.unit !== 'g100' && es.every(function (e) { return e.unit === e0.unit; });
    return mlQty(same ? Object.assign({}, e0, { qty: q, g: g }) : Object.assign({}, e0, { unit: 'g100', g: g, pt: null }));
  }
  function mlRow(e, date) {
    var isNew = seenFood && !seenFood[e.id], q = mlQty(e), name = mlName(e);
    return '<div class="ml-sw" data-id="' + e.id + '"><span class="ml-del" aria-hidden="true">' + ico('trash') + '</span><button type="button" class="sl-row ml-r' + (isNew ? ' rz-new' : '') + '" data-act="editfood" data-d="' + date + '" data-id="' + e.id + '">' + tileHtml(e.fid || iconFid(e), e.vr, name, 36, false, e.ikat) +
      '<span class="ml-t"><span class="nm">' + esc(name) + '</span>' + (q ? '<span class="tm">' + esc(q) + '</span>' : '') + '</span><span class="am">' + (e.est && !e.fid ? '≈ ' : '') + fmt(e.kcal) + '</span></button></div>';
  }
  function mlGroupRow(g, date) {
    if (g.es.length === 1) return mlRow(g.es[0], date);
    var e0 = g.es[0], name = mlName(e0), kc = 0, est = false, isNew = false; g.es.forEach(function (e) { kc += num(e.kcal); if (e.est && !e.fid) est = true; if (seenFood && !seenFood[e.id]) isNew = true; });
    return '<div class="ml-gw"><button type="button" class="sl-row ml-r ml-g' + (isNew ? ' rz-new' : '') + '" data-act="mlgrp" data-d="' + date + '" data-ids="' + g.es.map(function (e) { return e.id; }).join(',') + '" aria-label="' + esc(name + ' ×' + g.es.length + '. ' + T('tlGrpOpen')) + '">' + tileHtml(e0.fid || iconFid(e0), e0.vr, name, 36, false, e0.ikat) +
      '<span class="ml-t"><span class="nm">' + esc(name) + '<span class="x2">×' + g.es.length + '</span></span><span class="tm">' + esc(mlGroupQty(g.es)) + '</span></span><span class="am">' + (est ? '≈ ' : '') + fmt(kc) + '</span></button></div>';
  }
  var ringPend = {};
  function mlRing(key, frac, kcal, m, label) {              // mini halqa: ringMem — qiymat o'zgarsa yoki ekran ochilganda 0 dan to'ladi (animatsiya vaqtida qayta chizilsa ham bir xil HTML — tugamasdan uzilmaydi)
    var C = 2 * Math.PI * 22, o1 = C * (1 - Math.max(0, Math.min(1, frac))), prev = ringMem[key], o0 = prev == null ? C : prev, anim = !reduce && Math.abs(o0 - o1) > 0.5;
    if (anim) { if (ringPend[key] !== o1) { ringPend[key] = o1; setTimeout(function () { if (ringPend[key] === o1) { ringMem[key] = o1; delete ringPend[key]; } }, 1100); } } else ringMem[key] = o1;
    return '<span class="ml-k ml-' + m + '" role="img" aria-label="' + esc(label || (fmt(kcal) + ' ' + T('kcal'))) + '"><svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="22" class="bg"/><circle cx="26" cy="26" r="22" class="fg' + (anim ? ' anim' : '') + '" style="stroke-dasharray:' + C.toFixed(1) + ';stroke-dashoffset:' + o1.toFixed(1) + ';--o0:' + o0.toFixed(1) + ';--o1:' + o1.toFixed(1) + '"/></svg><b class="k">' + Math.round(kcal) + '</b></span>';
  }
  function mealsHtml(date) {
    var x = S.dayOf(st, date) || { food: [] }, limit = Math.max(1, S.dayPlan(st, date).limit || 1), h = '<section class="sl-meals tl">', mb = mbOf(date), nobf = ttMode() === 'nobf', mx = 0;
    S.MEALS.forEach(function (m) {
      var list = x.food.filter(function (e) { return e.meal === m; }), sum = S.sumEntries(list).kcal, yb = S.kechagidekOk(st, date, m), ic = '<span class="ml-ic ml-' + m + '" aria-hidden="true">' + ico(ML_IC[m]) + '</span>', dot = '<span class="tl-dot ml-' + m + '" aria-hidden="true"></span>';
      var bm = mb ? mb.meals[m] : null, isNow = !!(mb && mb.now === m), tag = isNow ? '<span class="ml-now">' + esc(T('mbNow')) + '</span>' : '', nc = isNow ? ' now' : '', sty = ' style="--mx:' + (mx++) + '"';          // v48: ovqat vaqti budjeti («Mening tartibim»)
      if (!list.length && nobf && m === 'b') return;          // «Nonushta qilmayman»: bo'sh nonushta kartasi ham chiqmaydi
      if (!list.length) {
        var sub = bm ? T('tlRes', { k: fmt(Math.round((isNow && bm.left > 0 ? bm.left : bm.budget) / 50) * 50) }) : T('tlNo');
        h += '<section class="sl-meal ml tl-m empty' + nc + '" data-m="' + m + '"' + sty + '>' + dot + '<button type="button" class="ml-empty" data-act="addto" data-m="' + m + '" data-d="' + date + '" aria-label="' + esc(T('mealAdd_' + m)) + '">' + ic + '<span class="m"><b>' + esc(mealName(m)) + tag + '</b><span>' + esc(sub) + '</span></span></button>' +
          '<span class="ml-ac">' + (yb ? '<button type="button" class="ml-yb" data-act="yday" data-m="' + m + '" data-d="' + date + '">' + ico('undo') + '<span>' + esc(T('tplYest')) + '</span></button>' : '') + '<button type="button" class="ml-add" data-act="addto" data-m="' + m + '" data-d="' + date + '" aria-label="' + esc(T('add') + ': ' + mealName(m)) + '">' + ico('plus', '', 2.4) + '</button></span></section>'; return;
      }
      var gs = mlGroups(list), key = date + m, open = mlOpen[key] || gs.length <= ML_FULL, tm = mealTime(list, date), frac = bm ? (bm.budget > 0 ? bm.eaten / bm.budget : 1) : sum / limit;
      var subTxt = (tm ? '<span class="ti">' + esc(tm) + ' ·</span> ' : '') + '<span class="ct">' + esc(cntTxt(gs.length)) + '</span>', took = bm && bm.over > 0 && mb.took[m] ? '<span class="ml-bs">' + esc(T('mbTook', { k: fmt(bm.over), m: T('mlA_' + mb.took[m].to) })) + '</span>' : '';
      var body;
      if (open) body = '<div class="sl-ents ml-rows">' + gs.map(function (g) { return mlGroupRow(g, date); }).join('') + (gs.length > ML_FULL ? '<button type="button" class="ml-more ml-less" data-act="mlless" data-m="' + m + '" data-d="' + date + '"><span>' + esc(T('tlLess')) + '</span>' + ico('chev', 'u') + '</button>' : '') + '</div>';
      else body = '<button type="button" class="ml-stack" data-act="mlmore" data-m="' + m + '" data-d="' + date + '" aria-label="' + esc(mealName(m) + ': ' + T('tlOpen')) + '"><span class="stk" aria-hidden="true">' + gs.slice(0, 4).map(function (g) { var e = g.es[0]; return '<i>' + tileHtml(e.fid || iconFid(e), e.vr, mlName(e), 34, false, e.ikat) + '</i>'; }).join('') + (gs.length > 4 ? '<i class="mo">+' + (gs.length - 4) + '</i>' : '') + '</span><em>' + esc(T('tlOpen')) + ' ›</em></button>';
      h += '<section class="sl-meal ml tl-m' + nc + '" data-m="' + m + '"' + sty + '>' + dot + '<div class="sl-mh ml-h" data-m="' + m + '" data-d="' + date + '">' + ic + '<span class="m"><b>' + esc(mealName(m)) + tag + '</b><span class="ml-sub">' + subTxt + '</span>' + took + '</span>' +
        mlRing('ml:' + date + m, frac, sum, m, bm ? T('mbOf', { e: fmt(bm.eaten), b: fmt(bm.budget) }) : '') + '<button type="button" class="ml-add" data-act="addto" data-m="' + m + '" data-d="' + date + '" aria-label="' + esc(T('add') + ': ' + mealName(m)) + '">' + ico('plus', '', 2.4) + '</button></div>' + body + '</section>';
    });
    if (mb && mb.note && mb.now) { var fr = mb.note.from.map(function (k) { return T('mlA_' + k); }), xs = fr.join(T('mbAnd')); h += '<p class="ml-note" id="mbNote">' + esc(T('mbNote', { x: lang === 'ru' ? xs : xs.charAt(0).toUpperCase() + xs.slice(1), k: fmt(mb.note.k), m: T('mlD_' + mb.now) })) + '</p>'; }          // «Nonushta va tushlikdan tejalgan 100 kkal kechki ovqatga o'tdi» (≥ 50 kkal)
    return h + '</section>';
  }
  /* bir xil mahsulotlar ro'yxati (birlashgan qator bosilganda): har yozuv alohida — tahrirlash yoki o'chirish */
  function mlGrpHtml(date, ids) {
    var x = S.dayOf(st, date), es = (x ? x.food : []).filter(function (e) { return ids.indexOf(e.id) > -1; }); if (!es.length) return '';
    var kc = 0; es.forEach(function (e) { kc += num(e.kcal); });
    return shHead(mlName(es[0]) + ' ×' + es.length) + '<p class="rz-p sm rz-mut">' + esc(T('tlGrpTot', { q: mlGroupQty(es), k: fmt(kc) })) + '</p><div class="ml-gl" data-d="' + date + '" data-ids="' + es.map(function (e) { return e.id; }).join(',') + '">' + es.map(function (e) {
      var q = mlQty(e); return '<div class="ml-gr"><button type="button" class="sl-row ml-r" data-act="editfood" data-d="' + date + '" data-id="' + e.id + '">' + tileHtml(e.fid || iconFid(e), e.vr, mlName(e), 36, false, e.ikat) + '<span class="ml-t"><span class="nm">' + esc(q || mlName(e)) + '</span></span><span class="am">' + (e.est && !e.fid ? '≈ ' : '') + fmt(e.kcal) + '</span></button><button type="button" class="ml-gx" data-act="mlgdel" data-d="' + date + '" data-id="' + e.id + '" aria-label="' + esc(T('tlGrpDel') + ': ' + (q || mlName(e))) + '">' + ico('trash') + '</button></div>'; }).join('') + '</div>' + okBtn();
  }
  /* chapga surish → o'chirish (Bekor qilish bilan); vertikal aylantirish xalaqit bermaydi */
  (function () {
    var sw = null;
    root.addEventListener('touchstart', function (e) { var r = e.target.closest && e.target.closest('.ml-sw'); if (!r || e.touches.length !== 1) { sw = null; return; } sw = { el: r, b: r.querySelector('.ml-r'), x: e.touches[0].clientX, y: e.touches[0].clientY, on: false, dx: 0 }; }, { passive: true });
    root.addEventListener('touchmove', function (e) {
      if (!sw) return; var dx = e.touches[0].clientX - sw.x, dy = e.touches[0].clientY - sw.y;
      if (!sw.on) { if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { sw = null; return; } if (dx < -10 && Math.abs(dx) > Math.abs(dy)) { sw.on = true; sw.el.classList.add('drag'); } else return; }
      if (e.cancelable) e.preventDefault(); sw.dx = Math.min(0, dx); sw.b.style.transform = 'translateX(' + Math.max(-160, sw.dx) + 'px)'; sw.el.classList.toggle('arm', sw.dx < -80);
    }, { passive: false });
    var end = function () {
      if (!sw) return; var s0 = sw; sw = null; if (!s0.on) return; s0.el.classList.remove('drag', 'arm'); s0.b.addEventListener('click', function k(ev) { ev.stopPropagation(); ev.preventDefault(); s0.b.removeEventListener('click', k, true); }, true); setTimeout(function () { s0.b.style.transform = ''; }, 0);
      if (s0.dx < -80) { var id = +s0.el.getAttribute('data-id'), d = s0.b.getAttribute('data-d'); s0.el.classList.add('gone'); setTimeout(function () { var rm = S.removeFood(st, d, id); commit(); vib(); toast(T('del1'), function () { S.restoreFood(st, d, rm); commit(); }, true); }, reduce ? 0 : 200); }
    };
    root.addEventListener('touchend', end); root.addEventListener('touchcancel', end);
  })();
  function mealRepeatSheet(date, m) {
    var x = S.dayOf(st, date), n = x ? x.food.filter(function (e) { return e.meal === m; }).length : 0; if (!n) return;
    openSheet('mealrep', shHead(T('mealRepT') + ': ' + mealName(m)) + '<p class="rz-p">' + esc(T('mealRepD')) + '</p><div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="sheetclose">' + esc(T('cancel')) + '</button><button type="button" class="rz-btn primary" data-act="mealrep" data-m="' + m + '" data-d="' + date + '">' + esc(T('mealRepT')) + '</button></div>');
  }
  function mealRepeat(date, m) {
    var x = S.dayOf(st, date), t = todayStr(), added = []; if (!x) return;
    stEv('ovqat_qoshildi', 'odatdagi');
    x.food.filter(function (e) { return e.meal === m; }).forEach(function (e) { var c = {}; ['fid', 'name', 'pt', 'meal', 'unit', 'qty', 'g', 'kcal', 'p', 'f', 'c', 'est', 'vr', 'sz', 'vn', 'vf'].forEach(function (k) { if (e[k] != null) c[k] = e[k]; }); c.ts = nowTs(); added.push(S.addFood(st, t, c)); });
    kit.closeSheet(); commit(); vib(); toast(T('saved'), function () { added.forEach(function (it) { S.removeFood(st, t, it.id); }); commit(); }, true);
  }
  /* Android ilovasi: yangi versiya (/ilova/versiya.json) — ilova tilida, mavzuga mos karta; «Keyinroq» → 3 kun ko'rinmaydi.
     Faqat ilova build ≥ 5 (1.0.3+) bo'lsa: eski ilovalarda native banner bor edi (ikki marta chiqmasin). */
  var upd = null, UPD_KEY = 'kalki_upd_later', UPD_DAYS = 3;
  function updLater() { try { return JSON.parse(localStorage.getItem(UPD_KEY) || 'null'); } catch (e) { return null; } }
  function updCheck() {
    var N = window.KalkiNative; if (!N || !N.isApp() || !N.appInfo) return;
    N.appInfo().then(function (a) {
      if (a && a.version) { var pv = lsGet('kalki_app_ver'); if (pv && pv !== a.version) stEv('ilova_yangilandi', a.version); try { localStorage.setItem('kalki_app_ver', a.version); } catch (e) {} appVer = a.version + ' (' + a.build + ')'; if (view === 'profile' && !kit.sheetKind()) render(); }
      if (!a || a.build < 5) return;
      fetch('/ilova/versiya.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (v) {
        if (!v || !(+v.versionCode > a.build) || !v.apk) return; var l = updLater(); if (l && l.c === +v.versionCode && Date.now() - (+l.t || 0) < UPD_DAYS * DAY_MS) return;
        upd = v; if (view === 'today' && !kit.sheetKind()) render();
      }).catch(function () {});
    });
  }
  function updCardHtml() { return upd ? '<section class="rz-card sl-upd" id="updCard"><b>' + esc(T('updT')) + '</b><span class="b"><button type="button" class="rz-btn sm primary" data-act="updgo">' + esc(T('updGo')) + '</button><button type="button" class="rz-btn sm ghost" data-act="updlater">' + esc(T('updLater')) + '</button></span></section>' : ''; }
  function lpTipOnce(x) {                            // «uzun bosing — Takrorlash» doimiy matn emas: birinchi yozuvdan keyin BIR MARTA kichik maslahat
    if (!x.food.length || prefs().lpTip || kit.sheetKind()) return; prefs().lpTip = 1; save();
    setTimeout(function () { if (view === 'today' && !kit.sheetKind()) toast(T('mealRepH')); }, 1200);
  }
  var lpTimer = 0, lpFired = false;
  function lpBind() {                                // taom kartasini uzun bosish (550 ms) → «Takrorlash»
    root.addEventListener('pointerdown', function (ev) {
      var h = ev.target.closest && ev.target.closest('.sl-mh[data-m]'); if (!h || ev.target.closest('button')) return; lpFired = false; clearTimeout(lpTimer);
      lpTimer = setTimeout(function () { lpFired = true; vib(10); mealRepeatSheet(h.getAttribute('data-d'), h.getAttribute('data-m')); }, 550);
    });
    ['pointerup', 'pointercancel', 'pointerleave', 'pointermove', 'scroll'].forEach(function (t) { root.addEventListener(t, function () { clearTimeout(lpTimer); }, true); });
  }
  function weekStripHtml(t) {                        // oxirgi 7 kun (kechagacha + bugun): bosilsa shu kun Tarix'da ochiladi
    var wd = lang === 'ru' ? ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] : ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'], h = '<div class="sl-week7" role="group" aria-label="' + esc(T('wkTap')) + '">';
    for (var i = 6; i >= 0; i--) { var d = Dt.addDays(t, -i), r = S.dayStatus(st, d, t), cls = { near: 'ok', low: 'lo', high: 'hi', part: 'pt', none: '', pre: '' }[r.state] || '';
      h += '<button type="button" class="wd' + (i === 0 ? ' on' : '') + '" data-act="wkday" data-d="' + d + '"' + (i === 0 ? ' aria-current="date"' : '') + ' aria-label="' + esc(kit.dLabel(d)) + '"><span class="w">' + wd[S.weekdayIdx(d)] + '</span><b>' + Dt.parse(d).d + '</b><i class="' + cls + '"></i></button>'; }
    return h + '</div>';
  }
  function markSeen() { seenFood = {}; Object.keys(st.days).forEach(function (d) { st.days[d].food.forEach(function (e) { seenFood[e.id] = 1; }); }); }
  var C = 2 * Math.PI * 86;
  function ringHtml(id, ratio0) { return '<svg class="sl-ring" viewBox="0 0 200 200" aria-hidden="true"><circle class="tr" cx="100" cy="100" r="86"/><circle class="pg" id="' + id + '" cx="100" cy="100" r="86" transform="rotate(-90 100 100)" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (C * (1 - ratio0)).toFixed(1) + '"/></svg>'; }
  function animRing(id, ratio) { var el = $('#' + id); if (!el) return; requestAnimationFrame(function () { requestAnimationFrame(function () { el.style.strokeDashoffset = (C * (1 - ratio)).toFixed(1); }); }); }
  function glassSvg() { return '<svg viewBox="0 0 24 28" aria-hidden="true"><path class="fill" d="M5.6 9h12.8l-1.3 14.6a1.6 1.6 0 0 1-1.6 1.4H8.5a1.6 1.6 0 0 1-1.6-1.4L5.6 9z"/><path class="ln" d="M4 4h16l-1.8 19.6A2.6 2.6 0 0 1 15.600 26H8.400a2.6 2.6 0 0 1-2.600-2.400L4 4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>'; }

  var bk = KalkiBackup.create({ app: 'kalkifit', autoSaved: function () { return akk.autoSaved(); }, fileBase: 'kalkifit', name: 'KalkiFit', kit: kit, lang: langNow, rowIcon: 'sl-ci', hasData: function () { return !!(st && st.setup); }, exportText: function () { return S.exportState(st); }, today: function () { return todayStr(); }, getLast: function () { return st.lastBackup || 0; }, setLast: function (t) { st.lastBackup = t; save(); }, created: function () { return st.created; }, dayCount: function () { return Object.keys(st.days).filter(function (d) { var x = st.days[d]; return x && ((x.food && x.food.length) || x.steps || x.water); }).length; }, pickFile: function () { doImport(); }, sig: function () { return JSON.stringify(st); }, root: root, importText: function (t) { return S.importState(t); }, applyState: function (ns) { ns.prefs = ns.prefs || {}; ns.setup = true; st = ns; seenFood = null; heroPrev = null; save(); }, onChange: function () { if (st && st.setup && !kit.sheetKind() && !kit.tipsOn()) render(); } });
  var akk = KalkiAkkaunt.create({ app: 'kalkifit', kit: kit, lang: langNow, bk: bk, rowIcon: 'sl-ci', hasData: function () { return !!(st && st.setup); }, isTrivial: function () { var e = function (x) { return !x || (Array.isArray(x) ? !x.length : !Object.keys(x).length); }; return !!(st && st.setup && !Object.keys(st.days || {}).some(function (d) { var x = st.days[d]; return x && ((x.food && x.food.length) || x.steps || x.water); }) && (st.weights || []).length <= 1 && e(st.customFoods) && e(st.favs) && e(st.tpls) && e(st.vessels)); }, onChange: function () { if (st && st.setup && !kit.sheetKind() && !kit.tipsOn()) render(); }, onOnb: function () { if (st && !st.setup && $('#rzOnb') && !$('#rzOnb').hidden && ob && ob.step === 1) showOnb(); } });
  var VIEW_ALIAS = { food: 'history', steps: 'history', me: 'profile', ovqat: 'history', qadam: 'history', men: 'profile', bugun: 'today', kundalik: 'history', natijalar: 'history', tarix: 'history', profil: 'profile', today: 'today', diary: 'history', results: 'history', history: 'history', profile: 'profile' };
  function viewOf(v) { return VIEW_ALIAS[String(v || '').replace(/^#/, '').toLowerCase()] || null; }       // eski nomlar/manzillar (#ovqat, #qadam, #men …) yangi joyga
  function goTab(v0, fn) { var v = viewOf(v0) || v0; if (view !== v) { var tb = $('[data-act=tab][data-v=' + v + ']'); if (tb) tb.click(); } setTimeout(fn, 480); return true; }
  var news = KalkiNews.create({ app: 'kalkifit', banner: true, kit: kit, lang: langNow, root: root, rowIcon: 'sl-ci', isSetup: function () { return !!(st && st.setup); }, onChange: function () { if (st && st.setup && !kit.sheetKind() && !kit.tipsOn()) render(); }, targets: {
    akkaunt: function (n) { return goTab('profile', function () { akk.load(true, function () { if (akk.enabled()) akk.act('akk'); }); }); },
    daychip: function (n) { return goTab('today', function () { n.highlight($('.sl-infob') || $('#kcalBtn')); }); },
    stepcalc: function (n) { return goTab('today', function () { n.highlight($('#kcalBtn')); }); },
    qadam: function (n) { return goTab('today', function () { n.highlight($('.sl-s') || $('#kcalBtn')); }); },
    search: function (n) { return goTab('today', function () { openAdd(); setTimeout(function () { n.highlight($('#fdQ')); }, 450); }); },
    portion: function (n) { return goTab('today', function () { openAdd(); pickFood('olma'); setTimeout(function () { n.highlight($('.sl-qty')); }, 500); }); },
    units: function (n) { return goTab('today', function () { openAdd(); pickFood('osh'); setTimeout(function () { n.highlight($('#fdUnits')); }, 500); }); },
    variants: function (n) { return goTab('today', function () { openAdd(); pickFood('somsa'); fd.pmore = true; pwScreen(); setTimeout(function () { n.highlight($('#pwMore .rz-chips') || $('.sl-morebtn')); }, 500); }); },
    theme: function (n) { return goTab('profile', function () { var b = $('[data-act=theme]'); n.highlight(b && b.parentNode); }); },
    jokes: function (n) { return goTab('profile', function () { var b = $('[data-act=jktog]'); n.highlight(b && b.parentNode); }); },
    history: function (n) { return goTab('history', function () { n.highlight($('#hkCard') || $('.sl-sec2') || $('#rzMain')); }); },
    vazn: function (n) { return goTab('history', function () { n.highlight($('.pl-w') || $('#rzMain')); }); },
    profil: function (n) { return goTab('profile', function () { n.highlight($('#pfHero') || $('#rzMain')); }); },
    bju: function (n) { return goTab('today', function () { var c = $('#bjuCard'); if (c && c.scrollIntoView) c.scrollIntoView({ block: 'center' }); n.highlight(c); }); },
    week7: function (n) { return goTab('today', function () { n.highlight($('.sl-week7')); }); },
    yeymiz: function (n) { return goTab('profile', function () { var b = $('[data-act=feat][data-fk=yeymiz]'); if (b && b.scrollIntoView) b.scrollIntoView({ block: 'center' }); n.highlight(b && b.closest('.sl-feat')); }); },          // Profil → Imkoniyatlar
    retsept: function (n) { return goTab('profile', function () { var b = $('[data-act=feat][data-fk=retsept]'); if (b && b.scrollIntoView) b.scrollIntoView({ block: 'center' }); n.highlight(b && b.closest('.sl-feat')); }); },          // v32: Profil → Imkoniyatlar
    yorliq: function (n) { return goTab('today', function () { openAdd(); openLbl('rasm'); }); },          // v67: «Yorliqdan qo'shish»
    imkoniyatlar: function (n) { return goTab('today', function () { n.highlight($('#ftBtn')); }); },
    bugun: function (n) { return goTab('today', function () { n.highlight($('#mainAdd')); }); },
    yemaydi: function (n) { return goTab('profile', function () { n.highlight($('#ynCard')); }); },
    supp: function (n) { return goTab('history', function () { n.highlight($('[data-act=supp]')); }); },
    mashq: function (n) { return goTab('today', function () { var c = $('.sl-act'); if (c) { if (c.scrollIntoView) c.scrollIntoView({ block: 'center' }); n.highlight(c); } }); },          // v55
    afsona: function (n) { return goTab('today', function () { var t = $('#afTz'); if (t) { if (t.scrollIntoView) t.scrollIntoView({ block: 'center' }); n.highlight(t); } else if (AF) AF.open({ from: 'feat' }); }); },          // v54
    fishday: function (n) { return goTab('profile', function () { var r = $('#pushRow') || $('[data-act=jktog]'); n.highlight(r && (r.id === 'pushRow' ? r : r.parentNode)); }); },
    cats: function (n) { return goTab('today', function () { openAdd(); setTimeout(function () { n.highlight($('#fdQ')); }, 450); }); },
    simple: function (n) { return goTab('today', function () { n.highlight($('#mainAdd')); }); },
    ovoz: function (n) { return goTab('today', function () { openAdd(); setTimeout(function () { n.highlight($('#micBtn') || $('#fdQ')); }, 450); }); },
    source: function (n) { return goTab('today', function () { openAdd(); pickFood('somsa'); setTimeout(function () { n.highlight($('.sl-src')); }, 500); }); },
    vessel: function (n) { return goTab('today', function () { openAdd(); pickFood('osh'); setTimeout(function () { n.highlight($('.sl-vnew')); }, 500); }); },
    templates: function (n) { return goTab('profile', function () { var b = $('[data-act=feat][data-fk=odatdagi]'); if (b && b.scrollIntoView) b.scrollIntoView({ block: 'center' }); n.highlight(b && b.closest('.sl-feat')); }); },
    dayend: function (n) { return goTab('today', function () { var b = $('#dayEnd') || $('#dayEndDone'); if (b) n.highlight(b); else { kit.toast(n.t('hDayEnd')); n.highlight($('.sl-meal') || $('#kcalBtn')); } }); } } });
  function backupJoke() { var l = G && G.pickLine && prefs().jokes !== false && hazilState === 2 ? G.pickLine(jokeCtx(false), 'backup', {}, 'backup') : null; if (l) saveQuiet(); return l ? l.text : ''; }
  function nudges() {
    var out = [], p = prefs(), now = Date.now(), hid = function (k) { return p['h_' + k] && now - p['h_' + k] < 7 * DAY_MS; };
    var he = hwDue(); if (he && p.hwSeen !== he && !hid('hafta')) out.push({ k: 'hafta', msg: T('hwReady'), btn: T('hwOpen'), act: 'hafta' });          // yakshanba 19:00 dan dushanba oxirigacha (vaqti cheklangan — birinchi)
    if (bk.remindDue() && !hid('backup')) out.push({ k: 'backup', msg: T('nudgeBackup'), joke: backupJoke(), btn: T('nudgeBackupBtn'), act: 'bktg' });
    return out;
  }
  function nudgeHtml(n) { return '<div class="rz-card nudge" data-nudge="' + n.k + '"><div class="t">' + esc(n.msg) + '</div>' + '<div class="b">' + (n.btn ? '<button type="button" class="rz-btn sm" data-act="' + n.act + '">' + esc(n.btn) + '</button>' : '') + '<button type="button" class="rz-btn sm ghost" data-act="hide" data-k="' + n.k + '">' + esc(T('later')) + '</button>' + (n.never ? '<button type="button" class="rz-btn sm ghost" data-act="' + n.never.act + '">' + esc(n.never.label) + '</button>' : '') + '</div></div>'; }
  /* v51: ish turi (Android, qadam bor) — onboarding, migratsiya kartasi, Profil; adaptiv me'yor taklifi */
  var JOBS = ['sit', 'stand', 'heavy'];
  function jobUi() { return (isNativeApp() && !!qaDetect()) || !!(st && st.prefs && st.prefs.qm != null); }          // v55: iPhone/veb — qo'lda qadam kiritgandan keyin
  function jobOpts(sel, act) { return JOBS.map(function (j) { return optBtn(act, j, T('job_' + j), T('job_' + j + 'H'), sel === j); }).join(''); }
  /* v52: veb → ilova (Android: APK sahifasi) / bosh ekran (iPhone: 2 qadam) — brauzerda 3+ kun, 5+ ovqat; akkauntsizlarga 5+ kun — «Google bilan saqlang». Bir martalik: bosilsa qaytmaydi, yopilsa 14 kun (ko'pi bilan 2 marta) */
  var CRD_WAIT = 14 * DAY_MS, crdSeen = {};
  function usedDays() { var d = 0, f = 0; Object.keys(st.days || {}).forEach(function (k) { var x = st.days[k]; if (x && x.food && x.food.length) { d++; f += x.food.length; } }); return { d: d, f: f }; }
  function crdDue(k) { var c = (prefs().crd || {})[k]; return !c || (!c.ok && (c.n || 0) < 2 && Date.now() - (c.t || 0) >= CRD_WAIT); }
  function crdMark(k, ok) { var p = prefs(); p.crd = p.crd || {}; var c = p.crd[k] || { n: 0 }; c.t = Date.now(); if (ok) c.ok = 1; else c.n = (c.n || 0) + 1; p.crd[k] = c; save(); stEv('karta', k + (ok ? '.bosildi' : '.yopildi')); }
  function crdShown(k) { if (!crdSeen[k]) { crdSeen[k] = 1; stEv('karta', k + '.korsatildi'); } }
  function crdHtml(k, t, sub, b) { crdShown(k); return '<section class="rz-card nudge crd" id="crd_' + k + '"><div class="t">' + esc(T(t)) + '</div><p class="inst-s">' + esc(T(sub)) + '</p><div class="b"><button type="button" class="rz-btn sm primary" data-act="crdgo" data-k="' + k + '">' + esc(T(b)) + '</button><button type="button" class="rz-btn sm ghost" data-act="crdno" data-k="' + k + '">' + esc(T('wcLater')) + '</button></div></section>'; }
  function webAppCard() {
    if (!st || !st.setup || statPlat() !== 'veb' || !inst.env || inst.installed() || isNativeApp()) return ''; var k = inst.env.kind === 'android' ? 'ilova' : (inst.env.kind === 'ios' && inst.env.browser === 'safari' ? 'ekran' : ''); if (!k || !crdDue(k)) return '';
    var u = usedDays(); if (u.d < 3 || u.f < 5) return '';
    return k === 'ilova' ? crdHtml('ilova', 'wcIlT', 'wcIlS', 'wcIlB') : crdHtml('ekran', 'wcEkT', 'wcEkS', 'wcEkB');
  }
  var akkAsk = false;
  function akkCard() { if (!st || !st.setup || (akk.loggedIn && akk.loggedIn()) || !crdDue('akkaunt') || usedDays().d < 5) return ''; if (!akk.enabled()) { if (!akkAsk && navigator.onLine !== false) { akkAsk = true; akk.load(false, function () { if (akk.enabled() && view === 'today' && !kit.sheetKind()) render(); }); } return ''; } return crdHtml('akkaunt', 'akCT', 'akCS', 'akCB'); }          // holat noma'lum — bir marta so'raladi (TTL bilan)
  function iosAddHtml() { return shHead(T('wcEkSh')) + '<ol class="sl-rules crd-steps"><li>' + esc(T('wcEk1')) + '</li><li>' + esc(T('wcEk2')) + '</li></ol><p class="rz-p sm">' + esc(T('wcEkN')) + '</p><div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="crdcopy">' + esc(T('wcEkCp')) + '</button><button type="button" class="rz-btn primary" data-act="sheetclose">' + esc(T('wcEkOk')) + '</button></div>'; }
  function crdGo(k) {
    crdMark(k, k !== 'akkaunt'); render();          // akkaunt: bosilsa 14 kun (kirmasa qayta eslatiladi); ilova/ekran — qaytmaydi
    if (k === 'ilova') { try { location.href = '/ilova?from=kalkifit'; } catch (e) {} return; }
    if (k === 'ekran') { openSheet('iosadd', iosAddHtml()); return; }
    akk.load(true, function () { if (akk.enabled()) akk.act('akk'); });
  }
  function jobCardHtml() {                             // mavjud Android foydalanuvchisi (qadam yoqilgan, ish turi yo'q) — bir martalik; tasdiqlamaguncha kredit 0 (ikki marta hisoblanmaydi)
    if (!st || !st.setup || st.profile.job || prefs().jobAsked || !jobUi() || !qaOn()) return '';
    return '<section class="rz-card tt-card jb-card" id="jbCard"><button type="button" class="tt-cb" data-act="jbopen"><span class="sl-ci fc-gr">' + ico('steps') + '</span><span class="m"><b>' + esc(T('jbCardT')) + '</b><span>' + esc(T('jbCardB')) + '</span></span></button><button type="button" class="rz-x tt-cx" data-act="jbno" aria-label="' + esc(T('close')) + '">' + ico('x') + '</button></section>';
  }
  var jv = null;
  function jobSheetHtml() {
    var t = todayStr(), old = S.dayPlan(st, t, 0).limit, st2 = { profile: Object.assign({}, st.profile, { job: jv.sel }), prefs: Object.assign({}, st.prefs, jv.web ? { qm: 'on' } : { qa: 'on' }), days: st.days, weights: st.weights }, nw = jv.sel ? S.dayPlan(st2, t) : null;
    return shHead(T('jobQ')) + '<p class="rz-p">' + esc(T(jv.web ? 'jobHw' : 'jobH')) + '</p><div class="jb-opts">' + jobOpts(jv.sel, 'jbpick') + '</div>' +
      (nw ? '<div class="rz-xrows jb-cmp">' + xr('', T('jbOld'), fmt(old)) + xr('→', T('jbNew'), fmt(nw.limit - nw.credit), 'sum') + '</div>' + (nw.credit ? '<p class="rz-p sm">' + esc(T('jbNewS', { c: fmt(nw.credit) })) + '</p>' : '') : '') +
      '<div class="rz-actions"><button type="button" class="rz-btn primary" data-act="jbok"' + (jv.sel ? '' : ' disabled') + '>' + esc(T('jbOk')) + '</button></div>';
  }
  function openJob(web) { jv = { sel: st.profile.job || null, web: web === true || !isNativeApp() }; openSheet('job', jobSheetHtml()); }          // v55: iPhone/veb — qo'lda qadam rejimi (qm)
  var adS = null;
  function adCardHtml() {                              // o'zini to'g'rilaydigan me'yor: taklif (avtomatik emas); 14 kunda bir marta
    if (!st || !st.setup || !window.KalkiPlato || !KalkiPlato.adapt) return ''; adS = KalkiPlato.adapt({ st: st, S: S, today: todayStr(), last: prefs().adT || 0 }); if (!adS) return '';
    return '<section class="rz-card ad-card" id="adCard"><p class="rz-p">' + esc(T('adT', { x: fmt(adS.actual), n: fmt(adS.limitNew) })) + '</p><div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="adno">' + esc(T('adNo')) + '</button><button type="button" class="rz-btn primary" data-act="adyes">' + esc(T('adYes')) + '</button></div></section>';
  }
  /* ===================== v55: mashg'ulot, qo'lda qadam (iPhone/veb), kunlik balans — hisob S.dayPlan da (docs/limit.md) ===================== */
  function exLabel(e) { return T('ex_' + e.t) + ' · ' + T('exMin', { n: e.min }); }
  function sgn(v) { return (v < 0 ? '−' : '+') + fmt(Math.abs(v)); }
  function exNow(t) { var w = S.currentWeight(st) || num(st.profile.weight); return function (e) { return S.exNet(e, w); }; }
  function exListHtml(d) {                             // Bugun / Tarix: tur · daqiqa · kkal; bosib tahrirlash, chapga surib o'chirish (bekor qilish bilan)
    var x = S.dayOf(st, d), l = x && x.ex || []; if (!l.length) return ''; var kc = exNow(d);
    return '<section class="sl-card sl-exl" aria-label="' + esc(T('exT')) + '">' + l.map(function (e) { return '<div class="sl-exw"><button type="button" class="sl-exr" data-act="exedit" data-id="' + esc(e.id) + '" data-d="' + d + '"><span class="ic" aria-hidden="true">' + S.EX[e.t].e + '</span><span class="m">' + esc(exLabel(e)) + ' · ' + esc(T('lv' + e.lv)) + '</span><b>+' + fmt(kc(e)) + '<small> ' + T('kcal') + '</small></b></button><span class="sl-exdel" aria-hidden="true">' + esc(T('exDel')) + '</span></div>'; }).join('') + '</section>';
  }
  /* v56 (maket ~/harakat-maket.html, ~/balans-variant.html — A «Ikki chiziq»): kartalar — sarlavha + kichik rangli «+», mini doira (58 px, ichida emoji), katta raqam + maqsad, rangli kkal yorlig'i */
  var ringMem = {}, balFirst = true, exPulse = false;
  function miniRing(key, frac, icon, cls) {
    var C = 2 * Math.PI * 25, o1 = C * (1 - Math.max(0, Math.min(1, frac))), prev = ringMem[key], o0 = prev == null ? C : prev, anim = !reduce && Math.abs(o0 - o1) > 0.5; ringMem[key] = o1;
    return '<span class="mini ' + cls + '" aria-hidden="true"><svg viewBox="0 0 58 58"><circle cx="29" cy="29" r="25" class="bg"/><circle cx="29" cy="29" r="25" class="fg' + (anim ? ' anim' : '') + '" style="stroke-dasharray:' + C.toFixed(1) + ';stroke-dashoffset:' + o1.toFixed(1) + ';--o0:' + o0.toFixed(1) + ';--o1:' + o1.toFixed(1) + '"/></svg><i>' + icon + '</i></span>';
  }
  function stepWebHtml(x, dp) {                        // iPhone/veb: qo'lda kiritish (Salomatlik ilovasidan)
    var n = x.steps || 0, g = st.stepGoal || 8000, late = new Date().getHours() >= 18, kc = dp.stepCredit || 0;          // v58: limitga qo'shilgan kredit (halqa chiplari bilan bir xil raqam)
    var foot = kc ? '<span class="chip c-bl">+' + fmt(kc) + ' ' + T('kcal') + '</span>' : '<span class="sl-abe">' + esc(n ? '' : (prefs().qm === 'on' && late ? T('stNone') : T('stEmptyW'))) + '</span>';
    return '<section class="sl-card sl-ab2 sl-s" data-st="web"><div class="ah"><b>' + esc(T('sT')) + '</b><button type="button" class="pl c-bl" data-act="stepin" aria-label="' + esc(T('stInT')) + '"><span>+</span></button></div><button type="button" class="mr' + (n >= 10000 ? ' w5' : '') + '" data-act="stepin" aria-label="' + esc(T('sT') + ': ' + fmt(n) + ' / ' + fmt(g)) + '">' + miniRing('s', n / g, '👟', 'c-bl') + '<span class="mv"><b id="sNum"' + (n ? '' : ' class="z"') + '>' + fmt(n) + '</b><small>/ ' + fmt(g) + '</small></span></button>' + foot + '</section>';
  }
  function exCardHtml(x, dp) {
    var l = x.ex || [], m = l.reduce(function (a, e) { return a + e.min; }, 0), k = dp.exCredit || 0,          // v58: limitga qo'shilgan kredit (halqa chiplari bilan bir xil)
      ic = l.length === 1 ? S.EX[l[0].t].e : '🏋️';          // 1 ta bo'lsa — tur ikonkasi
    var foot = k > 0 ? '<span class="chip c-pu">+' + fmt(k) + ' ' + T('kcal') + '</span>' : '<span class="sl-abe">' + esc(m ? '' : T('exEmpty')) + '</span>', pu = exPulse && !reduce; exPulse = false;
    return '<section class="sl-card sl-ab2 sl-exc' + (pu ? ' pulse' : '') + '"><div class="ah"><b>' + esc(T('exT')) + '</b><button type="button" class="pl c-pu" data-act="exadd" aria-label="' + esc(T('exQ')) + '"><span>+</span></button></div><button type="button" class="mr" data-act="exlist" aria-label="' + esc(T('exT') + ': ' + T('exMinA', { n: m })) + '">' + miniRing('e', m / EX_GOAL, ic, 'c-pu') + '<span class="mv"><b id="exNum"' + (m ? '' : ' class="z"') + '>' + m + '</b><small>' + esc(T('exMinW')) + '</small></span></button>' + foot + '</section>';
  }
  var EX_GOAL = 60;          // kunlik mashg'ulot doirasi — 60 daqiqa (bizning tanlov; JSST: haftasiga 150–300 daqiqa o'rtacha — docs/limit.md)
  /* v58 (maket ~/sodda-maket.html): halqa ostida — oddiy chiplar (Yedingiz; limitga HAQIQATAN qo'shilgan harakat krediti), birinchi 3 ochilishda xira izoh. «Hozirgacha sarf»/balans Bugun'da yo'q (S.dayBal — plato/admin uchun core'da) */
  var kcPulseT0 = 0;
  function kcPulseAttr() {                             // «i» — birinchi 3 kunda ekran ochilganda 3 marta yumshoq «nafas oladi» (2,4 s × 3), keyin tinch; qayta chizishda o'z vaqtidan davom etadi
    if (reduce || appDays() >= 3) return ''; var now = performance.now(); if (!kcPulseT0) kcPulseT0 = now; var el = (now - kcPulseT0) / 1000;
    return el < 7.2 ? ' data-pl="1" style="--pd:-' + el.toFixed(2) + 's"' : '';
  }
  function kcChipsHtml(eaten, t) {                     // v59 (maket ~/mashq2-maket.html): bitta ixcham bosiladigan qator «🍽 339 | 👟 +95 · Hisob ›»
    var dp = S.dayPlan(st, t), sc = dp.stepCredit || 0, ec = dp.exCredit || 0, ac = dp.aeCredit || 0, mv = sc + ec + ac, ic = ac > 0 ? '⌚' : sc > 0 ? '👟' : '⚽', aria = T('kcAte') + ' ' + fmt(eaten) + ' ' + T('kcal') + (mv > 0 ? ', ' + (ac > 0 ? T('kcAe') : T(sc > 0 && ec > 0 ? 'kcMove' : (sc > 0 ? 'kcStep' : 'kcEx')).toLowerCase()) + ' +' + fmt(mv) + ' ' + T('kcal') : '') + '. ' + T('kcOpenA');
    return '<button type="button" class="kc-row" id="kChips" data-act="xkcal" aria-label="' + esc(aria) + '"><span class="kc-it"><span aria-hidden="true">🍽</span> <b id="kNum">' + fmt(eaten) + '</b></span>' + (mv > 0 ? '<i class="kc-sep" aria-hidden="true"></i><span class="kc-it g"><span aria-hidden="true">' + ic + '</span> <b>+' + fmt(mv) + '</b></span>' : '') + '<em class="kc-go">' + esc(T('kcHisob')) + ' ›</em></button>';
  }
  function openKcalHow() {                             // halqa bosilganda: «N kkal qanday chiqdi?» — yig'indi = halqa raqami (S.dayPlan limiti − yeyilgan)
    var t = todayStr(), x = S.dayOf(st, t) || { food: [], ex: [], steps: 0 }, tot = S.sumEntries(x.food), dp = S.dayPlan(st, t), pl = planNow(), sc = dp.stepCredit || 0, ec = dp.exCredit || 0, ac = dp.aeCredit || 0, dc = dp.dev ? dp.dev.cut : 0, base = dp.limit - sc - ec - ac + dc, rem = dp.limit - tot.kcal, over = rem < 0;
    var g = st.profile.goal, exL = x.ex || [], exM = exL.reduce(function (a, e) { return a + e.min; }, 0), nf = (x.food || []).length;
    var row = function (ic, bg, lb, sub, v, cls) { return '<div class="hw-r"><span class="ic ' + bg + '" aria-hidden="true">' + ic + '</span><span class="m"><b>' + esc(lb) + '</b><small>' + esc(sub) + '</small></span><b class="v' + (cls ? ' ' + cls : '') + '">' + v + '</b></div>'; };
    var stepSub = !x.steps ? T('khStep0') : (sc > 0 ? T('khStepS') : (dp.job ? T('khStepIn') : T('khOff'))), exSub = !exL.length ? T('khEx0') : (ec > 0 ? T('khExS', { m: exM }) : T('khOff'));
    var h = shHead(T(over ? 'khTo' : 'khT', { k: fmt(Math.abs(rem)) })) + '<p class="rz-p sm rz-mut hw-sub">' + esc(T('khSub')) + '</p><div class="hw-rows" id="hwRows">' +
      row('🎯', 'y', T('khNorm'), T(g === 'lose' ? 'khNormL' : g === 'gain' ? 'khNormG' : 'khNormK'), fmt(base)) +
      (dp.ae ? row('⌚', 'b', T('khAe', { a: fmt(dp.ae) }), T('khAeS', { b: fmt(dp.aeBase) }), ac > 0 ? '+' + fmt(ac) : '0', ac > 0 ? 'g' : 'z') :          // v62: soat — qadam + mashg'ulot o'rniga (ikki marta emas)
      row('👟', 'b', x.steps ? T('khStep', { n: fmt(x.steps) }) : T('sT'), stepSub, sc > 0 ? '+' + fmt(sc) : '0', sc > 0 ? 'g' : 'z') +
      row('⚽', 'p', T('khEx'), exSub, ec > 0 ? '+' + fmt(ec) : '0', ec > 0 ? 'g' : 'z')) +
      (dc ? row('⌚', 'b', T('khDev'), T('khDevS', { d: fmt(dp.dev.total) }), '−' + fmt(dc)) : '') +
      row('🍽', 'o', T('khAte'), nf ? T('khAteS', { n: nf }) : T('khAte0'), tot.kcal ? '−' + fmt(tot.kcal) : '0') + '</div>' +
      '<div class="hw-res' + (over ? ' ov' : '') + '" id="hwRes"><span>' + esc(T(over ? 'khOver' : 'khRem')) + '</span><b>' + fmt(Math.abs(rem)) + '</b></div>' +
      '<p class="rz-p sm hw-tip">' + esc(over ? T('khOverN') : T(g === 'lose' ? 'khWkL' : g === 'gain' ? 'khWkG' : 'khWkK', { x: dec(Math.abs(pl.kgPerWeek || 0), 1) })) + '</p>' +
      (QA && st.profile.job ? (prefs().hcE === 'on' ? '<p class="rz-p sm rz-mut hw-dv" id="hcEis">' + esc(T('hcEis')) + '</p>' : '<button type="button" class="rz-link hw-how" id="hcEon" data-act="hcEon">' + esc(T('hcEon')) + ' ›</button>') : '') +          // v62: Android — soat sarfi (Health Connect, ixtiyoriy)
      '<button type="button" class="rz-link hw-how" data-act="xkform">' + esc(T('khHow')) + ' ›</button>' + okBtn();
    stEv('balans_ochildi'); openSheet('xkcal', h);
  }
  function openExList(re) {                            // mashg'ulot kartasi bosilsa: bugungi ro'yxat (tahrir, surib o'chirish) + qo'shish; re — ochiq oynani yangilash
    var t = todayStr(), l = exListHtml(t);
    (re ? function (k, h) { setSheet(h); } : openSheet)('exlist', shHead(T('exTodayT')) + (l || '<p class="rz-p rz-mut">' + esc(T('exEmpty')) + '</p>') + '<div class="rz-actions"><button type="button" class="rz-btn primary" data-act="exadd">' + esc(T('exAdd')) + '</button></div>');
  }
  /* mashg'ulot oynasi (v59, maket ~/mashq2-maket.html): tur to'ri → davomiylik (− 30 + / 15…90) → og'irlik kartalari → 2 natija plitkasi → qotgan panel «Qo'shish · 30 daq yugurish». Hammasi joyida yangilanadi (qayta chizilmaydi) */
  var exv = null;
  function openEx(id, d) {
    d = d || todayStr(); var x = S.dayOf(st, d), e = id && x && x.ex ? x.ex.filter(function (y) { return y.id === id; })[0] : null;
    exv = e ? { id: e.id, d: d, t: e.t, min: e.min, lv: e.lv } : { id: null, d: d, t: prefs().exLast || 'yugurish', min: 30, lv: 1 }; openSheet('mashq', exSheetHtml()); exApply();
  }
  function exSheetHtml() {
    var on = S.jobOn(st), edit = !!exv.id;
    return shHead(T('exQ')) + '<div class="rz-fl">' + esc(T('exTurL')) + '</div><div class="ex-grid" role="radiogroup" aria-label="' + esc(T('exTurL')) + '">' + S.EX_ORDER.map(function (k2) { return '<button type="button" class="ex-t" role="radio" aria-checked="false" data-act="ext" data-v="' + k2 + '"><span class="ic c-' + k2 + '" aria-hidden="true">' + S.EX[k2].e + '</span><span class="nm">' + esc(T('exS_' + k2)) + '</span><span class="ck" aria-hidden="true">✓</span></button>'; }).join('') + '</div>' +
      '<div class="rz-fl">' + esc(T('exDurL')) + '</div><div class="ex-dur2"><button type="button" class="ex-st" data-act="exstep" data-s="-5" aria-label="' + esc(T('exMinus')) + '">−</button><div class="v" role="status"><b id="exMinV">' + exv.min + '</b><small>' + esc(T('exMinW')) + '</small></div><button type="button" class="ex-st" data-act="exstep" data-s="5" aria-label="' + esc(T('exPlus')) + '">+</button></div>' +
      '<div class="rz-chips ex-dur">' + [15, 25, 30, 45, 60, 90].map(function (m) { return '<button type="button" class="rz-chip" data-act="exmin" data-v="' + m + '" aria-pressed="false">' + m + '</button>'; }).join('') + '</div>' +
      '<div class="rz-fl">' + esc(T('exLv')) + '</div><div class="ex-int" role="radiogroup" aria-label="' + esc(T('exLv')) + '">' + [0, 1, 2].map(function (l) { return '<button type="button" class="ex-in" role="radio" aria-checked="false" data-act="exlv" data-v="' + l + '"><span class="bars" aria-hidden="true">' + [0, 1, 2].map(function (b2) { return '<i' + (b2 <= l ? ' class="f"' : '') + ' style="height:' + [8, 14, 22][b2] + 'px"></i>'; }).join('') + '</span><span class="m"><b>' + esc(T('lv' + l)) + '</b><small>' + esc(T('lvD' + l)) + '</small></span></button>'; }).join('') + '</div>' +
      '<p class="rz-p sm warn" id="exHeavy" hidden>' + esc(T('exHeavy')) + '</p>' +
      '<div class="ex-res" id="exPrev"><div class="rs r1"><small><span aria-hidden="true">🔥</span> ' + esc(T('exBurnT')) + '</small><b>~<i id="exBurnN">0</i> <span class="u">' + T('kcal') + '</span></b></div>' +
      (on ? '<div class="rs r2"><small><span aria-hidden="true">🍽</span> ' + esc(T('exMoreT')) + '</small><b>+<i id="exMoreN">0</i> <span class="u">' + T('kcal') + '</span></b><button type="button" class="ex-why" data-act="exwhy" aria-label="' + esc(T('exWhyA')) + '" aria-expanded="false">' + ico('info') + '</button></div>' : '<div class="rs r2"><small><span aria-hidden="true">🍽</span> ' + esc(T('exMoreT')) + '</small><span class="n0">' + esc(T('exMore0')) + '</span></div>') + '</div>' +
      (on ? '<p class="ex-whyt" id="exWhy" hidden>' + esc(T('exWhy')) + '</p>' : '') +
      '<p class="rz-p sm ex-note" id="exStepN" hidden>' + esc(T('exStepN')) + '</p>' +
      '<div class="pw-bar">' + (edit ? '<button type="button" class="pw-del" data-act="exdel" aria-label="' + esc(T('exDel')) + '">' + ico('trash') + '</button>' : '') + '<button type="button" class="sl-main" id="exSaveB" data-act="exsave"></button></div>';
  }
  function exGain() {                                  // v58: shu mashg'ulot bugungi me'yorga aniq qancha qo'shadi (u bilan va usiz S.dayPlan farqi — 0,7, 800 chegarasi, qadam bilan ustma-ustlik hisobda)
    var d = exv.d, d0 = (st.days && st.days[d]) || {}, l = (d0.ex || []).filter(function (e) { return e.id !== exv.id; }), mk = function (ex) { var days = Object.assign({}, st.days); days[d] = Object.assign({}, d0, { ex: ex }); return S.dayPlan(Object.assign({}, st, { days: days }), d).limit; };
    return Math.max(0, mk(l.concat([{ id: '_p', t: exv.t, min: exv.min, lv: exv.lv, ts: 0 }])) - mk(l));
  }
  function exNum(el, v) { if (!el) return; kit.setNum(el, el._v == null ? null : el._v, v, { dur: 350 }); el._v = v; }
  function exApply(popKey) {                           // tanlov o'zgardi: faqat o'zgargan qismlar yangilanadi (sahifa/aylantirish joyida qoladi)
    if (!exv || kit.sheetKind() !== 'mashq') return;
    var w = S.currentWeight(st) || num(st.profile.weight), k = S.exNet(exv, w), on = S.jobOn(st), stepsOn = on && S.EX[exv.t].spm && (qaOn() || (S.dayOf(st, exv.d) || {}).steps > 0);
    $$('#rzSheet .ex-t').forEach(function (b) { var o = b.getAttribute('data-v') === exv.t; b.classList.toggle('on', o); b.setAttribute('aria-checked', o); if (o && popKey === exv.t) { b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); } });
    $$('#rzSheet .ex-in').forEach(function (b) { var o = +b.getAttribute('data-v') === exv.lv; b.classList.toggle('on', o); b.setAttribute('aria-checked', o); });
    $$('#rzSheet .ex-dur .rz-chip').forEach(function (b) { var o = +b.getAttribute('data-v') === exv.min; b.classList.toggle('on', o); b.setAttribute('aria-pressed', o); });
    var mv = $('#exMinV'); if (mv) mv.textContent = exv.min; var st$ = $$('#rzSheet .ex-st'); if (st$[0]) st$[0].disabled = exv.min <= 5; if (st$[1]) st$[1].disabled = exv.min >= 180;
    exNum($('#exBurnN'), k); if (on) exNum($('#exMoreN'), exGain());
    var hv = $('#exHeavy'); if (hv) hv.hidden = !(exv.t === 'ogir' && st.profile.job === 'heavy'); var sn = $('#exStepN'); if (sn) sn.hidden = !stepsOn;
    var nm = T('exS_' + exv.t).toLowerCase(), bt = $('#exSaveB'); if (bt) { var a = T(exv.id ? 'exUpd' : 'exSave'), b2 = T('exMin', { n: exv.min }) + (exv.t === 'boshqa' ? '' : ' ' + nm); bt.innerHTML = '<span class="ct">' + esc(a) + '<span> · ' + esc(b2) + '</span></span>'; }
  }
  function exBucket(m) { return m <= 15 ? 'd15' : (m <= 30 ? 'd30' : (m <= 60 ? 'd60' : (m <= 90 ? 'd90' : 'dx'))); }
  function exSave() {
    if (!exv) return; var d = exv.d, isNew = !exv.id; if (isNew) { S.addEx(st, d, exv); stEv('mashq_qoshildi', exv.t + '.' + exBucket(exv.min)); } else S.updEx(st, d, exv.id, exv);
    prefs().exLast = exv.t; exv = null; exPulse = isNew; kit.closeSheet(); heroPrev = null; commit(); vib(); toast(T('exDone'), null, true); if (isNew) jobAskOnce();
  }
  function exDel(id, d) {
    var rm = S.removeEx(st, d, id), lr = function () { if (kit.sheetKind() === 'exlist') openExList(1); }; if (!rm) return; exv = null; if (kit.sheetKind() === 'mashq') kit.closeSheet(); heroPrev = null; commit(); lr();          // ro'yxat oynasi ochiq bo'lsa — yangilanadi
    toast(T('exGone'), function () { S.restoreEx(st, d, rm); heroPrev = null; commit(); lr(); }, true);
  }
  function jobAskOnce() {                              // birinchi qadam/mashg'ulot: ish turi modeli (iPhone/veb — qo'lda; Android — tasdiqlanmagan bo'lsa)
    if (st.profile.job && S.jobOn(st)) return; if (isNativeApp()) { if (!st.profile.job && !prefs().jobAsked && qaOn()) setTimeout(openJob, 420); return; }
    if (prefs().qm == null) setTimeout(function () { openJob(true); }, 420);
  }
  /* qo'lda qadam (iPhone/veb; Android'da yo'q — avtomatik): bugun yoki kecha (oxirgi 2 kun) */
  var siv = null;
  function openStepIn() { siv = { d: todayStr() }; openSheet('stepin', stepInHtml(), { noFocus: false }); setTimeout(function () { var i = $('#siN'); if (i) try { i.focus(); } catch (e) {} }, 120); }
  function stepInHtml() {
    var t = todayStr(), y = Dt.addDays(t, -1), v = (S.dayOf(st, siv.d) || {}).steps || '';
    return shHead(T('stInT')) + '<p class="rz-p sm">' + esc(T('stInH')) + '</p><div class="rz-seg si-day" role="group">' + [[t, 'stD0'], [y, 'stD1']].map(function (o) { return '<button type="button" class="' + (siv.d === o[0] ? 'on' : '') + '" data-act="sid" data-v="' + o[0] + '" aria-pressed="' + (siv.d === o[0]) + '">' + esc(T(o[1])) + '</button>'; }).join('') + '</div>' +
      '<label class="rz-f" for="siN"><span>' + esc(T('stInL')) + '</span><input id="siN" type="number" inputmode="numeric" min="0" max="60000" step="1" value="' + esc(v) + '" placeholder="8 000"></label>' +
      (prefs().qm === 'on' || st.profile.job ? '<label class="rz-f si-ae" for="siAe"><span>' + esc(T('aeL')) + '</span><input id="siAe" type="number" inputmode="numeric" min="0" max="' + S.AE_MAX + '" step="1" value="' + esc((S.dayOf(st, siv.d) || {}).ae || '') + '" placeholder="650"></label><p class="rz-p sm rz-mut si-aeh">' + esc(T('aeH')) + '</p>' : '') +          // v62: iPhone soat — qadam + mashg'ulot krediti o'rniga
      '<div class="rz-actions"><button type="button" class="rz-btn primary" data-act="sisave">' + esc(T('stInSave')) + '</button></div>';
  }
  function stepInSave() {
    var i = $('#siN'), n = Math.max(0, Math.min(60000, Math.round(num(i && i.value)))), d = siv.d, first = prefs().qm == null; S.setSteps(st, d, n); var ae = $('#siAe'); if (ae) { S.setAe(st, d, ae.value); if (num(ae.value) > 0) stEv('aktiv_energiya'); } stEv('qadam_qolda', d === todayStr() ? 'bugun' : 'kecha');
    siv = null; kit.closeSheet(); heroPrev = null; commit(); vib(); toast(T('stInDone'), null, true); if (first && n > 0) jobAskOnce();
  }
  /* chapga surib o'chirish (mashg'ulot qatori) */
  (function () {
    var row = null, x0 = 0, y0 = 0, dx = 0, hz = null;
    document.addEventListener('pointerdown', function (e) { var b = e.target.closest && e.target.closest('.sl-exr'); if (!b) return; row = b; x0 = e.clientX; y0 = e.clientY; dx = 0; hz = null; row.style.transition = 'none'; }, true);
    document.addEventListener('pointermove', function (e) { if (!row) return; var mx = e.clientX - x0, my = e.clientY - y0; if (hz == null && (Math.abs(mx) > 8 || Math.abs(my) > 8)) hz = Math.abs(mx) > Math.abs(my); if (!hz) return; dx = Math.min(0, mx); row.style.transform = 'translateX(' + dx + 'px)'; row.parentNode.classList.toggle('del', dx < -70); }, true);
    var end = function () { if (!row) return; var r = row; row = null; r.style.transition = ''; if (hz && dx < -90) { r.parentNode.classList.add('gone'); r.style.transform = 'translateX(-110%)'; r.__sw = 1; setTimeout(function () { exDel(r.getAttribute('data-id'), r.getAttribute('data-d')); }, reduce ? 0 : 180); } else { r.style.transform = ''; r.parentNode.classList.remove('del'); if (hz) r.__sw = 1; } };
    document.addEventListener('pointerup', end, true); document.addEventListener('pointercancel', end, true);
  })();
  /* v54: «Afsona yoki haqiqat?» (assets/kalkifit-afsona.js, data/afsonalar.json) — Bugun'da «Kunning savoli» (ilovaning 3-kunidan), Imkoniyatlar → «Bilim» */
  var AF = window.KalkiAfsona ? KalkiAfsona.create({ root: root, lang: function () { return lang; }, state: function (v) { if (v !== undefined) st.afsona = v; return st.afsona; }, save: save, ev: stEv, go: afGo,
    share: function (cv, nm) { sharePng(cv, nm); }, reduce: function () { return !!reduce; }, today: todayStr, haptic: function (ok) { vib(ok ? 18 : 8); }, onClose: function () { if (view === 'today' && !kit.sheetKind()) render(); } }) : null;
  function afTeaser() {
    if (!AF || !st || !st.setup || !oneTimeOk() || Dt.daysBetween((function (d) { return Dt.ymd(d.getFullYear(), d.getMonth() + 1, d.getDate()); })(new Date(st.created || Date.now())), todayStr()) < 2) return '';          // birinchi 2 kunda yo'q
    if (!AF.ready()) { AF.load(function (d) { if (d && view === 'today' && !kit.sheetKind() && !AF.isOpen()) render(); }); return ''; }
    return AF.teaserHtml();
  }
  function afGo(k) {                                   // maslahat → ilovadagi joy
    if (k === 'tartib') return openTartib(); if (k === 'oqsil') return openProtG(); if (k === 'plato') return goTab('history', function () { openPlato(); });
    if (k === 'kcal') return goTab('today', function () { openExplainKcal(); }); if (k === 'search') return goTab('today', function () { openAdd({}); });
    if (k === 'suv') return goTab('today', function () { var w = $('#wCard'); if (w) { if (w.scrollIntoView) w.scrollIntoView({ block: 'center' }); flashEl(w); } });
    if (k === 'qadam') return goTab(stepCard() ? 'today' : 'history', function () { var c = $('.sl-s') || $('.sl-stepbig') || $('.sl-stepweb'); if (c) { if (c.scrollIntoView) c.scrollIntoView({ block: 'center' }); flashEl(c); } });
    if (k === 'vazn') return goTab('history', function () { var c = $('.pl-w') || $('#wtCard'); if (c) { if (c.scrollIntoView) c.scrollIntoView({ block: 'center' }); flashEl(c); } });
  }
  /* Bugun: halqa ostida ko'pi bilan BITTA karta — ilova yangilanishi › baliq kuni › (kun yakunida) eslatma taklifi › eslatma (zaxira, Haftangiz) › o'rnatish taklifi › «Yemaydigan narsangiz bormi?» › birinchi hafta maslahati */
  /* v62: me'yor formulasi ehtiyotkorroq bo'ldi — eski foydalanuvchida oxirgi 7 kun o'rtacha limiti > 8% o'zgarsa, bir martalik izoh (S.limShift) */
  function limChgHtml(t) {
    if (!st || !st.setup || (KD && KD.on)) return ''; var p = prefs();
    if (!p.limV62) { p.limV62 = 1; var r = S.limShift(st, t), old = !st.created || st.created < Date.now() - 864e5; if (old && Math.abs(r.pct) > 0.08) p.limShow = { a: r.old, b: r.cur }; save(); }
    var m = p.limShow; if (!m) return '';
    return '<section class="rz-card sl-lim" id="limCard"><b>' + esc(T('lmT', { a: fmt(m.a), b: fmt(m.b) })) + '</b><p class="rz-p sm">' + esc(T('lmH')) + '</p><div class="rz-actions"><button type="button" class="rz-btn sm ghost" data-act="xkcal">' + esc(T('kcHisob')) + '</button><button type="button" class="rz-btn sm primary" data-act="lmok">' + esc(T('lmOk')) + '</button></div></section>';
  }
  function slotHtml(t, x) {
    var u = updCardHtml(); if (u) return u; if (inst.isTop()) return '';
    var lm = limChgHtml(t); if (lm) return lm;          // ichki brauzer (Telegram va h.k.): o'rnatish kartasi ekran TEPASIDA (renderToday)
    if (fishDay(t)) return '<section class="rz-card sl-fishslot">' + fishChipHtml(t) + '</section>';          // baliq kuni — chip shu kartada (sarlavhada emas)
    if (x && x.done) { var po = pushOfferHtml(); if (po) return po; }          // kun yakunlangach — eslatma taklifi (bir marta, 30 kun so'ralmaydi)
    var nd = nudges(); if (nd.length) return nudgeHtml(nd[0]);          // vaqtga bog'liq eslatmalar (zaxira, yakshanba «Haftangiz») — bir martalik savol va maslahatdan oldin
    var wc = webAppCard(); if (wc) return wc;          // v52: veb → ilova / bosh ekran (o'rnatish kartasidan oldin: Android'da APK)
    var cr0 = prefs().crd || {}, ic = cr0.ekran || cr0.ilova ? '' : inst.cardHtml(); if (ic) return ic;          // v52: yangi karta ko'rilgan bo'lsa — eski o'rnatish kartasi takror so'ramaydi
    var kc = oneTimeOk() ? akkCard() : ''; if (kc) return kc;          // v52: akkauntsizlarga 5+ kun          // ilovani o'rnatish taklifi (bir martalik, rad etilsa qaytmaydi)
    var ac = oneTimeOk() ? adCardHtml() : ''; if (ac) return ac;          // v51: adaptiv me'yor taklifi
    var jc = oneTimeOk() ? jobCardHtml() : ''; if (jc) return jc;          // v51: Android — ish turi (ikki marta hisoblamaslik)
    var yq = Y && oneTimeOk() ? Y.yemayCard() : ''; if (yq) return yq;
    var tq = oneTimeOk() ? ttCardHtml() : ''; if (tq) return tq;          // «Qanday ovqatlanasiz?» — mavjud foydalanuvchiga bir marta
    return fwHtml(t) || afTeaser();          // v54: «Kunning savoli» — eng past ustuvorlik
  }
  /* ---------- BIRINCHI HAFTA MASLAHATLARI: kuniga bitta, «Sinab ko'rish» bilan; yopilsa yoki funksiya ishlatilsa — qaytmaydi, keyingisi ertaga ---------- */
  var FW = ['ovoz', 'rasm', 'menyu', 'yeymiz', 'hafta', 'kunkarta', 'google'];
  function used(k) { var p = prefs(); if (!p.used) p.used = {}; if (!p.used[k]) { p.used[k] = 1; save(); } }
  function fwOk(k) {                                   // shu qurilmada ishlaydimi
    if (k === 'ovoz') return micOk(); if (k === 'menyu') return !!(Y && Y.menuOpen && window.KalkiMenyu); if (k === 'yeymiz') return !!Y;
    if (k === 'google') return !!(akk.enabled() && akk.google && akk.google()); return true;
  }
  function fwCur(t) {
    if (!st || !st.setup || (KD && KD.on) || appDays() > 21) return null;
    var p = prefs(), f = p.fw || (p.fw = { x: [] }), u = p.used || {}, left = FW.filter(function (k) { return f.x.indexOf(k) < 0 && !u[k] && fwOk(k); });
    if (f.k && left.indexOf(f.k) > -1) return f.k;
    if (!left.length || f.d === t) return null;          // kuniga bitta: bugungisi hal bo'lgan bo'lsa — keyingisi ertaga
    f.k = left[0]; f.d = t; save(); return f.k;
  }
  var FW_IC = { ovoz: 'mic', rasm: 'cam', menyu: 'img', yeymiz: 'zfork', hafta: 'rep', kunkarta: 'share', google: 'cloud' };
  function fwHtml(t) {
    var k = fwCur(t); if (!k) return '';
    return '<section class="rz-card sl-fw" id="fwCard" data-fk="' + k + '"><span class="sl-fw-ic" aria-hidden="true">' + ico(FW_IC[k] || 'spark') + '</span><div class="m"><b>' + esc(T('fw_' + k)) + '</b><span>' + esc(T('fw_' + k + 'H')) + '</span><button type="button" class="rz-btn sm primary" data-act="fwtry" data-fk="' + k + '">' + esc(T('fwTry')) + '</button></div><button type="button" class="rz-x" data-act="fwx" data-fk="' + k + '" aria-label="' + esc(T('close')) + '">' + ico('x') + '</button></section>';
  }
  function fwDone(k) { var f = prefs().fw || (prefs().fw = { x: [] }); if (f.x.indexOf(k) < 0) f.x.push(k); if (f.k === k) f.k = null; save(); }
  function fwTry(k) { fwDone(k); render(); feat(k); }
  /* funksiyani ochish — birinchi hafta maslahati va Profil → «Imkoniyatlar» uchun yagona joy */
  function feat(k) {
    switch (k) {
      case 'yozish': openAdd({}); return;
      case 'ovoz': openAdd({}); if (micOk()) voiceStart(); else ovBoot(function () { if (kit.sheetKind() === 'add' && fd && fd.mode === 'search') { if (micOk()) voiceStart(); else toast(T(navigator.onLine === false ? 'vErr_tarmoq' : 'vErr_yoq')); } }); return;          // iPhone veb: server kaliti javobini kutadi
      case 'rasm': openAdd({}); act('fphoto'); return;
      case 'menyu': openAdd({}); if (Y && Y.menuOpen) Y.menuOpen('add'); return;
      case 'yeymiz': act('yedoor'); return;
      case 'retsept': act('rtopen'); return;
      case 'odatdagi': tplsOpen(); return;
      case 'taomlarim': rcmineOpen(); return;
      case 'yorliq': openAdd({}); openLbl('rasm'); return;
      case 'plato': openPlato(); return;
      case 'tartib': openTartib(); return;
      case 'idishlar': vmOpen(); return;
      case 'hafta': openWeek(null); return;
      case 'kunkarta': openDayCard(); return;
      case 'ulashish': openShare(); return;
      case 'supp': openSupp(); return;
      case 'afsona': if (AF) AF.open({ from: 'feat' }); return;
      case 'yesam': openYesam(); return;
      case 'tarix': goTab('history', function () {}); return;
      case 'google': goTab('profile', function () { var g = document.querySelector('[data-akkg], .akk-gnat, [data-act=akk]'); if (g && g.scrollIntoView) g.scrollIntoView({ block: 'center' }); }); return;
    }
  }
  function act(a, data) { var el = document.createElement('button'); el.setAttribute('data-act', a); Object.keys(data || {}).forEach(function (k) { el.setAttribute('data-' + k, data[k]); }); el.style.display = 'none'; root.appendChild(el); try { el.click(); } finally { if (el.parentNode) el.parentNode.removeChild(el); } }          // mavjud tugma amalini dasturiy chaqirish (bitta yo'l)
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
  function dayEndHtml(t, x) {                        // «Kunni yakunlash» — ovqatlar ro'yxati oxirida kichik matnli tugma (kun kartasi, eslatma taklifi — ikkinchi qavatda: Profil → Imkoniyatlar)
    if (!x.food.length) return ''; if (!x.done && x.food.length < 2 && new Date().getHours() < 19) return '';          // kechqurun (19:00 dan) yoki kamida 2 ta yozuvdan keyin
    if (x.done) return '<p class="sl-dayend done" id="dayEndDone">' + ico('check', 'sl-inl') + esc(T('deDoneL')) + '</p>';
    return '<p class="sl-dayend"><button type="button" class="sl-txtbtn" data-act="dayend" id="dayEnd" title="' + esc(T('deHint')) + '">' + esc(T('deBtn')) + '</button></p>';
  }

  /* v50: hazil — halqa kartasi ICHIDA, «iste'mol · maqsad» qatori OSTIDA (oqimda: kontentni suradi, halqani hech qachon yopmaydi); sariq fon, emoji, matn, ✕, ingichka vaqt chizig'i.
     8 s; barmoq tekkanda yoki ekranda ko'rinmasa — taymer to'xtaydi; ✕ — darhol. Paydo bo'lish: opacity + 8 px; yo'qolish: balandligi silliq yig'iladi. v41 qoidalari jokeAfter'da (kuniga ≤ 4, ≥ 60 s) */
  var jFlash = null, jT = 0, JK_MS = 8000, jkIO = null;
  function jkFrac() { return jFlash ? Math.max(0, Math.min(1, jFlash.rem / JK_MS)) : 0; }
  function jkRun() {
    var el = $('#jLine'); if (!jFlash || !el || jFlash.run || jFlash.hold) return; jFlash.run = true; jFlash.at = Date.now(); clearTimeout(jT); jT = setTimeout(jokeHide, jFlash.rem);
    var i = el.querySelector('.hz-bar i'); if (i) { i.style.transition = 'none'; i.style.transform = 'scaleX(' + jkFrac().toFixed(4) + ')'; void i.offsetWidth; i.style.transition = 'transform ' + jFlash.rem + 'ms linear'; i.style.transform = 'scaleX(0)'; }
  }
  function jkPause(why) {
    if (!jFlash) return; jFlash.hold = (jFlash.hold || 0) | why; if (!jFlash.run) return; jFlash.run = false; clearTimeout(jT); jFlash.rem = Math.max(0, jFlash.rem - (Date.now() - jFlash.at));
    var i = $('#jLine .hz-bar i'); if (i) { i.style.transition = 'none'; i.style.transform = 'scaleX(' + jkFrac().toFixed(4) + ')'; }
  }
  function jkResume(why) { if (!jFlash) return; jFlash.hold = (jFlash.hold || 0) & ~why; if (!jFlash.hold) jkRun(); }
  function jokeHide(now) {
    clearTimeout(jT); var e = $('#jLine'); jFlash = null; if (jkIO) { jkIO.disconnect(); jkIO = null; } if (!e) return;
    if (reduce || now) { if (e.parentNode) e.parentNode.removeChild(e); return; }
    e.style.height = e.offsetHeight + 'px'; void e.offsetWidth; e.classList.add('out'); e.style.height = '0px';          // balandligi silliq yig'iladi (sakramaydi)
    setTimeout(function () { if (e.parentNode) e.parentNode.removeChild(e); }, 320);
  }
  function jokeShow() {
    var big = $('.sl-big'), el = $('#jLine');
    if (jFlash && jFlash.pend) {                     // [+] bilan qo'shilganda varaq OCHIQ qoladi — hazil varaq yopilgach ko'rsatiladi (v35)
      if (kit.sheetKind() || ftOpenNow() || !big) { if (el && el.parentNode) el.parentNode.removeChild(el); if (Date.now() - jFlash.t0 > 180000) jFlash = null; return; }
      jFlash.pend = false; jFlash.rem = JK_MS;
    }
    if (!jFlash || jFlash.rem <= 0 || !big) { if (el && el.parentNode && !el.classList.contains('out')) el.parentNode.removeChild(el); return; }
    if (el && el.parentNode === big) return;          // allaqachon turibdi (qayta chizishda animatsiya takrorlanmaydi)
    if (el && el.parentNode) el.parentNode.removeChild(el);
    var fresh = !jFlash.seen; jFlash.seen = true;
    el = document.createElement('div'); el.className = 'hz-card' + (fresh && !reduce ? ' in' : ''); el.id = 'jLine'; el.setAttribute('role', 'status');
    el.innerHTML = '<span class="hz-e" aria-hidden="true"></span><span class="hz-m"><p class="hz-t">' + esc(jFlash.text) + '</p><span class="hz-bar" aria-hidden="true"><i></i></span></span><button type="button" class="hz-x" data-act="jkx" aria-label="' + esc(T('close')) + '">' + ico('x') + '</button>';
    var bb = big.querySelector('#kChips'); if (bb) big.insertBefore(el, bb); else big.appendChild(el);          // v58: hazil — halqa ostida, chiplardan oldin (v50 joyi)
    var hold = function (e) { if (e.target.closest && e.target.closest('.hz-x')) return; jkPause(1); }, rel = function () { jkResume(1); };
    el.addEventListener('pointerdown', hold); el.addEventListener('pointerup', rel); el.addEventListener('pointercancel', rel); el.addEventListener('pointerleave', rel);
    el.addEventListener('touchstart', hold, { passive: true }); el.addEventListener('touchend', rel); el.addEventListener('touchcancel', rel);
    if (jkIO) jkIO.disconnect(); jkIO = null;
    if (window.IntersectionObserver) { jkIO = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.intersectionRatio >= 0.5) jkResume(2); else jkPause(2); }); }, { root: $('#rzMain'), threshold: [0, 0.5, 1] }); /* ko'rinish — aylantiriladigan maydon ichida (pastki panel ostida emas) */ jkIO.observe(el); }
    jFlash.run = false; jkRun();
  }
  kit.onClose = function () { aiFEnd(false); if (jv && jv.web && !jv.ok && prefs().qm == null && st && st.setup) { prefs().qm = 'off'; save(); } jv = null; if (jFlash && jFlash.pend && view === 'today') jokeShow(); if (view === 'profile' && st && st.setup) setTimeout(function () { if (view === 'profile' && !kit.sheetKind()) render(); }, 0); };          // Profil: oynada o'zgargan qiymat (Yemaydiganlarim va h.k.) qatorda yangilansin
  function jkPrev() { var e = $('#jLine'); clearTimeout(jT); if (jkIO) { jkIO.disconnect(); jkIO = null; } if (e && e.parentNode) e.parentNode.removeChild(e); }          // yangi hazil — eskisi o'rniga          // varaq yopildi → kutayotgan hazil
  function jokeAfter(kind, p) {                     // hodisadan (ovqat/suv/qadam/vazn/kun yakuni) keyin hazil: toast YO'Q — oxirgi hazil Bugun'dagi qatorda keyingi hodisagacha (yoki kun almashguncha) turadi; kuniga ≤4 marta, oralig'i ≥60 s; hazil o'chirilgan bo'lsa — qator yo'q
    if (kind !== 'food' || !G || !G.eventLine || prefs().jokes === false) return;          // hazil FAQAT ovqat qo'shilgandan keyin, 4 soniya (doimiy qator yo'q)
    var pr = hazilStore(), t = todayStr(), now = Date.now(); if (!pr.jfl || pr.jfl.d !== t) pr.jfl = { d: t, n: 0, t: 0 }; if (pr.jfl.n >= 4 || now - (pr.jfl.t || 0) < 60000) return;
    if (kind === 'food') { var pf = prefs(); if (!pf.suvIntro && wInfo(t).drink > 0) { pf.suvIntro = 1; p = Object.assign({}, p || {}, { drink1: true }); save(); } }          // birinchi ichimlik → «ichimlik_suvga_qoshildi»
    var ctx = jokeCtx(true), l = G.eventLine(ctx, kind, p); if (!l || !l.text) return; pr.jfl.n++; pr.jfl.t = now; pr.last = { d: t, text: l.text }; saveQuiet();
    jkPrev(); jFlash = kit.sheetKind() ? { text: l.text, pend: true, t0: now, rem: 0 } : { text: l.text, rem: JK_MS }; if (view === 'today') jokeShow();          // varaq ochiq bo'lsa — yopilgach (kit.onClose)
  }
  function waveD(amp, ph) { var d = 'M0 ' + (amp * Math.sin(ph)).toFixed(1); for (var x = 6; x <= 480; x += 6) d += ' L' + x + ' ' + (amp * Math.sin(2 * Math.PI * x / 120 + ph)).toFixed(1); return d + ' L480 270 L0 270 Z'; }
  function tyOf(L) { return L <= 0 ? 245 : (L >= 1 ? 8 : Math.round((221 - 208 * L) * 10) / 10); }
  function vesselSvg(o) {                            // kaloriya «idishi»: maketdan aynan (to'lqin yo'li mk(), ikki qatlamli matn, animatsiya vaqtlari)
    var ty = o.ty, ty2 = ty - 6, fy = o.fromTy, fy2 = fy - 6, d1 = o.upd ? '1.2s' : '.95s', d2 = o.upd ? '1.3s' : '1.05s', rd = reduce;
    /* batareya (v57): SMIL animateTransform o'rniga CSS animatsiya — ko'tarilish `translate` da, chayqalish `transform` da (clipPath ichida <g> yo'q, shuning uchun ikkalasi bitta yo'lda).
       Chayqalish cheksiz emas: asl tezlikda boshlanib (3,2 s / 4,6 s davr), sekinlashib ~10 s da TO'XTAYDI (masofa davrga karrali — to'xtaganda shakl sakramaydi).
       Raqam/daraja o'zgarsa yangidan jonlanadi (swayKey), oddiy qayta chizishda o'z vaqt chizig'idan davom etadi (o.swEl). Ko'rinmasa — pauza (kv-tin), reduced-motion — statik. */
    var sw = o.swEl || 0, bg = o.begin || 0, cssA = function (r0, r1, rDur, w) {
      var a = 'translate:0 ' + r1 + 'px'; if (rd) return a;
      var an = ['kvRise ' + rDur + ' cubic-bezier(.22,1,.36,1) ' + (-bg).toFixed(2) + 's both'];
      if (sw < w.T) { if (w.n) an.push(w.a + ' ' + w.p + 's linear ' + (-sw).toFixed(2) + 's ' + w.n); an.push(w.b + ' ' + w.e + 's cubic-bezier(.33,.67,.67,1) ' + (w.p * w.n - sw).toFixed(2) + 's forwards'); }
      return a + ';--r0:' + r0 + 'px;--r1:' + r1 + 'px;animation:' + an.join(',');
    };
    var W1 = { a: 'kvSw1', b: 'kvSw1z', p: 3.2, n: 1, e: 6.4, T: 9.6 }, W2 = { a: 'kvSw2', b: 'kvSw2z', p: 4.6, n: 0, e: 9.2, T: 9.2 };          // e = 2 × davr: sekinlashuv boshida tezlik asl tezlikka teng (silliq)
    var capTxt = function (cls, a, c) {                 // yon yozuvlar («{n} kkal qoldi» kabi) — to'lqin ichida/ustida ikki rangli (mavjud naqsh)
      var cc = [].concat(c), y0 = cc.length > 1 ? 160 : 162;          // v58: ikki qator («kkal yana» / «yeyishingiz mumkin»)
      return (a ? '<text class="' + cls + '" x="120" y="82" text-anchor="middle" font-size="15" font-weight="500">' + esc(a) + '</text>' : '') + cc.map(function (l, i) { return '<text class="' + cls + '" x="120" y="' + (y0 + i * 18) + '" text-anchor="middle" font-size="15" font-weight="500">' + esc(l) + '</text>'; }).join('');
    };
    var numTxt = function (b, ids) {                     // markaziy raqam — BITTA qatlam, to'lqin GURUHIDAN KEYIN chiziladi (doim ustida, chiziq bilan kesilmaydi); halo CSS'da (.kv-sub.kv-n)
      return '<text class="kv-sub kv-n" x="120" y="132" text-anchor="middle" font-size="52" font-weight="800" letter-spacing="-1.5"' + ids + '>' + esc(b) + '</text>';
    };
    return '<svg class="sl-vsvg" width="240" height="240" viewBox="0 0 240 240" aria-hidden="true" focusable="false"><defs><linearGradient id="kfLiq" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" style="stop-color:var(--liq1)"/><stop offset="100%" style="stop-color:var(--liq2)"/></linearGradient><linearGradient id="kfRim" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" style="stop-color:var(--liq2)"/><stop offset="100%" style="stop-color:var(--liq1)"/></linearGradient><clipPath id="kfVessel"><circle cx="120" cy="120" r="104"/></clipPath>' +
      '<clipPath id="kfWave"><path class="kv-w" d="' + waveD(7, 0) + '" style="' + cssA(fy, ty, d1, W1) + '"/></clipPath></defs>' +
      '<circle cx="120" cy="120" r="115" fill="none" stroke="url(#kfRim)" stroke-width="3" opacity=".55"/><circle class="kv-vessel" cx="120" cy="120" r="104"/>' +
      '<g clip-path="url(#kfVessel)"><path class="kv-w kv-w2" d="' + waveD(9, 1.6) + '" style="fill:var(--liq3);' + cssA(fy2, ty2, d2, W2) + '" opacity=".45"/>' + capTxt('kv-sub', o.a, o.c) + '<g clip-path="url(#kfWave)"><rect x="0" y="0" width="240" height="240" fill="url(#kfLiq)"/>' + capTxt('kv-dk', o.a, o.c) + '</g>' + numTxt(o.b, ' id="kLeft" data-n="' + o.n + '"') + '</g></svg>';
  }
  var animRaf = 0, heroAnim = null, swayKey = null, swayT0 = 0, swayHid = 0;
  document.addEventListener('visibilitychange', function () {          // v57: ko'rinmasa to'lqin to'liq to'xtaydi; qaytganda vaqt chizig'i surilib davom etadi
    var h = document.visibilityState === 'hidden'; root.classList.toggle('kv-tin', h);
    if (h) swayHid = performance.now(); else if (swayHid) { swayT0 += performance.now() - swayHid; swayHid = 0; }
  });
  function animNum(from, to, dur) {
    var els = function () { return [$('#kLeft')]; }, set = function (n) { els().forEach(function (e) { if (e) e.textContent = fmt(n); }); };
    cancelAnimationFrame(animRaf); if (reduce || !(dur > 0) || from === to) { set(to); return; }
    var t0 = performance.now(); set(from); (function tick(t) { var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); set(Math.round(from + (to - from) * e)); if (k < 1) animRaf = requestAnimationFrame(tick); })(t0);
  }
  function routeShort(km) {
    if (!G || !masofa || !(km >= 1)) return ''; var rt = G.routeFor(masofa, prefs().city || 'toshkent', km), dest = lang === 'ru' ? 'до ' + (rt.to.ruGen || rt.to.ru) : rt.to.uz + 'gacha';
    return rt.type === 'full' ? dest : rt.pct + '% · ' + dest;
  }
  /* ---------- suv: ichimlik/suyuq taomlar (data/suv-ulush.json) ---------- */
  var suvState = 0;
  function loadSuv() { if (suvState) return; suvState = 1; loadJson('/data/suv-ulush.json', function (j) { S.setSuv(j); suvState = 2; if ((view === 'today' || view === 'history') && !kit.sheetKind()) render(); }, function () { suvState = 0; }); }
  function suvResolve() {                           // bazada yo'q yozuv (rasm/AI/retsept) nomi bazadagi ichimlik/suyuq taomga mos kelsa — e.sfid saqlanadi (bir marta); faqat suvFrom dan keyingi kunlar
    if (suvState !== 2 || dbState !== 2) return; var from = prefs().suvFrom, ch = false;
    Object.keys(st.days).forEach(function (d) { if (!from || d < from) return; st.days[d].food.forEach(function (e) { if (e.fid || e.sfid !== undefined) return; e.sfid = suvMatch(e.name) || ''; ch = true; }); });
    if (ch) save();
  }
  function suvMatch(nom) {
    var q = String(nom || '').split(/[(·,]/)[0].trim(); if (q.length < 3) return null;
    try { var r = S.search(allFoods(), q, { limit: 3 }), b = foldNm(q); for (var i = 0; i < r.length; i++) { var f = r[i]; if (!f || f.custom || !(S.suvShare({ fid: f.id }) > 0)) continue; var a = foldNm(f.n), c = foldNm(f.r); if (a === b || c === b || a.indexOf(b + ' ') === 0 || c.indexOf(b + ' ') === 0 || b.indexOf(a + ' ') === 0 || (c && b.indexOf(c + ' ') === 0)) return f.id; } } catch (e) {}
    return null;
  }
  function wInfo(d) { return S.waterInfo(st, d || todayStr()); }
  function drinkRowsHtml(wi) {                      // karta oynasi: «Choy 2 piyola — 500 ml» (bir xil taom va birlik qo'shiladi)
    var g = {}, order = []; wi.items.forEach(function (it) { var e = it.e, f = e.fid ? foodById(e.fid) : (e.sfid ? foodById(e.sfid) : null), base = f && f.al ? (foodById(f.al.f) || f) : f, nm = base ? nameOf(base) : String(e.name || '?').split(/\s*\(/)[0], k = (e.fid || e.sfid || nm) + '|' + (e.unit || 'g') + '|' + (e.vr || '');
      if (!g[k]) { g[k] = { nm: nm, qty: 0, g: 0, e: e, ml: 0 }; order.push(k); } g[k].qty += e.qty || 1; g[k].g += e.g || 0; g[k].ml += it.ml; });
    return order.map(function (k) { var o = g[k], pt = o.e.unit && o.e.unit !== 'g100' && String(o.e.unit).indexOf('v:') !== 0 ? qtyStr(o.qty) + ' ' + unitName(o.e.unit) : amtG(o.g, o.e.fid ? foodById(o.e.fid) : null); return '<div class="sl-wlr"><span class="m">' + esc(o.nm) + ' <small>' + esc(pt) + '</small></span><b>' + fmt(o.ml) + ' ' + ML() + '</b></div>'; }).join('');
  }
  function ftSeen(set) { try { if (set) localStorage.setItem('kalki_ft_anim', '1'); return !!localStorage.getItem('kalki_ft_anim'); } catch (e) { return set; } }          // qurilma belgisi (hisob/zaxiraga yozilmaydi — bulutga keraksiz yozuv bo'lmasin)
  document.addEventListener('animationend', function (e) { var t = e.target; if (t && t.id === 'ftBtn') { ftSeen(true); t.classList.remove('shine'); } });
  function ftBtnHtml() {                             // «Imkoniyatlar» tugmasi (maket): gradient, rangli ikonka kvadrati, imkoniyatlar soni (featList'dan); yaltirash — butun umr BIR marta
    var anim = !ftSeen() && !reduce; if (reduce) ftSeen(true);          // belgi yaltirash tugagach qo'yiladi (animationend), qayta chizilish uni uzib qo'ymasin
    return '<button type="button" class="ft-btn' + (anim ? ' shine' : '') + '" id="ftBtn" data-act="ftopen" aria-haspopup="dialog"><span class="ic"><svg viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><rect x="3" y="3" width="8" height="8" rx="2.5"/><rect x="13" y="3" width="8" height="8" rx="2.5" opacity=".75"/><rect x="3" y="13" width="8" height="8" rx="2.5" opacity=".75"/><rect x="13" y="13" width="8" height="8" rx="2.5"/></svg></span><b>' + esc(T('ftBtn')) + '</b><span class="n">' + featList().length + '</span></button>';
  }
  function renderToday() {
    if (!prefs().suvFrom) { prefs().suvFrom = todayStr(); save(); }          // yangi qoida bugundan; eski kunlar o'zgarmaydi
    loadSuv(); suvResolve();
    var t = todayStr(), pr = st.profile, pl = planNow(), x = S.dayOf(st, t) || { food: [], water: 0, steps: 0 }, tot = S.sumEntries(x.food), h0 = num(pr.height), w0 = S.currentWeight(st), wi = wInfo(t);
    var bal = S.dayBalance(st, t, tot.kcal), limit = bal.limit, ratio = Math.min(1, tot.kcal / Math.max(1, limit)), over = bal.remaining < 0, info = S.dayStatus(st, t, t);
    var glasses = pl.water.glasses, wmax = glasses * S.GLASS_ML, note = info.complete ? T('stFull') + ' · ' + stLabel(info, t, t) : T('cNote');
    var prev = heroPrev, n = over ? -bal.remaining : bal.remaining, ty = tyOf(over ? 1 : ratio), now0 = performance.now(), swK = n + '|' + ty;
    if (swK !== swayKey) { swayKey = swK; swayT0 = now0; }          // v57: raqam/daraja o'zgardi — to'lqin yangidan jonlanadi
    var swEl = (now0 - swayT0) / 1000, cont = !!(heroAnim && !reduce && now0 - heroAnim.t0 < heroAnim.dur && heroAnim.to === n && heroAnim.ty === ty);
    var fromTy = cont ? heroAnim.fromTy : (prev ? prev.ty : 250), upd = cont ? heroAnim.upd : (!!prev && prev.ty !== ty), el0 = cont ? (now0 - heroAnim.t0) / 1000 : 0, startN = prev ? prev.n : 0, curN = startN, durN = prev ? (prev.n !== n ? 1200 : 0) : 900;
    if (cont) { var kk = Math.min(1, (now0 - heroAnim.t0) / heroAnim.dur); curN = Math.round(heroAnim.from + (heroAnim.to - heroAnim.from) * (1 - Math.pow(1 - kk, 3))); durN = heroAnim.dur - (now0 - heroAnim.t0); startN = heroAnim.from; }
    var pct = Math.round(ratio * 100), wd = (WDN[lang === 'ru' ? 'ru' : 'uz'] || WDN.uz)[S.weekdayIdx(t)], sk = S.streak(st, t);
    var h = inst.isTop() ? inst.cardHtml() : '';
    h += '<div class="sl-hd2"><div class="t"><span class="d">' + esc(wd + ', ' + kit.dLabel(t)) + '</span><h2 class="rz-h sl-h1" id="todayHd">' + esc(T('navToday')) + '</h2></div>' + ftBtnHtml() + '</div>';          // har ekranda sarlavha bir joyda (rz-h)
    h += weekStripHtml(t);
    h += '<section class="sl-big' + (over ? ' ovr' : '') + '"><div class="kc-vw"><button type="button" class="sl-vessel" id="kcalBtn" data-act="xkcal" aria-label="' + esc(over ? T('vAriaO', { k: fmt(n) }) : T('vAria', { p: pct, k: fmt(n) })) + '">' + vesselSvg({ ty: ty, fromTy: fromTy, upd: upd, begin: el0, swEl: swEl, n: n, a: '', b: fmt(curN), c: over ? [T('vO1'), T('vO2')] : [T('vL1'), T('vL2')] }) + '</button><button type="button" class="kc-i" id="kcalI" data-act="xkcal" aria-label="' + esc(T('kcInfoA')) + '"' + kcPulseAttr() + '><span aria-hidden="true">i</span></button></div>' + (over ? '<p class="sl-over rz-sr" id="kOver">' + esc(T('cOver', { x: fmt(n) })) + '</p>' : '') +
      kcChipsHtml(tot.kcal, t) + taxChipHtml() + '</section>' ;
    h += slotHtml(t, x);          // halqa ostida BITTA karta (yangilanish / birinchi hafta maslahati / eslatma) — bo'lmasa hech narsa
    var stp = S.stepsStats(st, x.steps), rs = routeShort(stp.km), wiInfo = S.weightInfo(st, t);
    qaDetect(); var dpT = S.dayPlan(st, t); h += '<div class="sl-duo sl-act">' + (stepCard() ? stepCardHtml(x) : stepWebHtml(x, dpT)) + exCardHtml(x, dpT) + '</div>';          // v56: mashg'ulot ro'yxati — karta tafsilotida va Tarix'da (Bugun cho'zilmaydi)          // v55: qadam (Android — avtomatik, iPhone/veb — qo'lda) + mashg'ulot
    h += '<div class="sl-duo one"><section class="sl-card sl-w" id="wCard"><button type="button" class="sl-wb" data-act="wopen" aria-label="' + esc(T('wT')) + '"><span class="l">' + ico('drop') + esc(T('wT')) + '</span><span class="v" id="wTxt"><b>' + fmt(wi.ml) + '</b><small> / ' + fmt(wmax) + ' ' + ML() + '</small></span>' + (wi.drink > 0 ? '<span class="sl-wsplit" id="wSplit">' + esc(T('wSplit', { w: fmt(wi.manual), d: fmt(wi.drink) })) + '</span>' : '') + '</button><button type="button" class="sl-pill" data-act="wadd" aria-label="+250 ' + ML() + '">' + esc(T('wAdd2')) + '</button>' + ('<span class="sl-wbar" id="wBar" aria-hidden="true"><i style="width:' + Math.round(Math.min(1, wi.ml / Math.max(1, wmax)) * 100) + '%"></i></span>') + '</section>' +          // vebda (qadam kartasi yo'q) — ixcham bitta qator: ikonka · Suv · N / M ml · +250 ml, ostida ingichka progress
      '</div>';          // v55: suv — alohida ixcham qator (qadam va mashg'ulot yuqorida, ikki kichik karta)
    h += bjuHtml(tot, pl);          // v50: 3 ustunli BJU (oqsil birinchi, ko'k) + pastda bitta qator oqsil maslahati — suv/qadamdan keyin, ovqatlar ro'yxatidan oldin
    h += '<div class="sl-sec2 sl-sec2k"><h3>' + esc(T('tdMeals')) + '</h3><span class="sl-secv" id="mealTot"><b>' + fmt(tot.kcal) + '</b> / ' + fmt(dpT.limit) + ' ' + esc(T('kcal')) + '</span></div>' + (x.food.length ? '' : '<div class="rz-empty sl-tdempty"><p>' + esc(T('tdEmpty')) + '</p></div>') + mealsHtml(t) + dayEndHtml(t, x);

    setMain(h); markSeen(); fishSwim(t); lpTipOnce(x); jokeShow();
    animNum(curN, n, durN); if (!cont) heroAnim = (!reduce && durN > 0) || (!reduce && fromTy !== ty) ? { t0: now0, dur: prev ? 1200 : 900, from: startN, to: n, fromTy: fromTy, ty: ty, upd: upd } : null; heroPrev = { n: n, ty: ty };
    if (G && !jokeBoot) { jokeBoot = true; loadHazil(); loadMasofa(); if (appDays() >= 3) loadPush(function () { pushSync(); if ((view === 'today' || view === 'profile') && !kit.sheetKind()) render(); }); loadDb(function () { if (view === 'today' && !kit.sheetKind()) render(); }); }
  }

  /* ---------- KUNDALIK ---------- */
  function diaryHtml() {
    var t = todayStr(), d = foodDay || t, x = S.dayOf(st, d), tot = S.sumEntries(x ? x.food : []), pl = planNow();
    var lab = d === t ? T('today') : (d === Dt.addDays(t, -1) ? T('yesterday') : kit.dLabel(d));
    var h = '<section class="rz-card"><div class="rz-monthnav"><button type="button" data-act="dprev" aria-label="‹">' + ico('back') + '</button><b>' + esc(lab) + '</b><button type="button" data-act="dnext" aria-label="›"' + (d >= t ? ' disabled' : '') + '>' + ico('chev') + '</button></div><div class="sl-daysum"><b>' + fmt(tot.kcal) + '</b><small> / ' + fmt(pl.target) + ' ' + T('kcal') + '</small></div>' + dayChip(d) + '</section>';
    // v58: Tarix'da balans («sarf») qatori yo'q (Bugun soddalashdi)
    return h + mealsHtml(d) + exListHtml(d) + calHtml();          // v55: shu kungi mashg'ulotlar (tahrirlash, surib o'chirish)
  }

  /* ---------- NATIJALAR ---------- */
  function rowBtn(act, ic, t1, t2) { return '<button type="button" class="rz-row" data-act="' + act + '">' + catIcon(ic) + '<span class="m"><b>' + esc(t1) + '</b>' + (t2 ? '<span>' + esc(t2) + '</span>' : '') + '</span>' + ico('chev', 'r') + '</button>'; }
  function histResultsHtml() {
    loadMasofa(); var h = weightCardHtml();
    h += orbHtml() + stepsHtml() + '<section class="rz-card"><button type="button" class="rz-row" data-act="share"><span class="sl-ci">' + ico('share') + '</span><span class="m"><b>' + esc(T('meShare')) + '</b><span>' + esc(T('shH')) + '</span></span>' + ico('chev', 'r') + '</button></section>';
    return h;
  }
  function resultsAfter() {
    stepsAnim();
    var p = $('.sl-wchart .avg'); if (p && !reduce && !p.__a) { p.__a = 1; p.style.strokeDashoffset = '1'; requestAnimationFrame(function () { requestAnimationFrame(function () { p.style.strokeDashoffset = '0'; }); }); }
  }
  /* ---------- «Vazn trendi» + «Nega sekin ozyapman?» (assets/kalkifit-plato.js; maket ~/plato-maket.html). AI yo'q — hisob qurilmada, foydalanuvchining o'z yozuvlaridan ---------- */
  var PL = window.KalkiPlato || null, PL_ID = 7003, PL_PER = { p28: 28, p91: 91, all: 0 };
  function plPrefs() { var p = prefs(); if (!p.plato || typeof p.plato !== 'object') p.plato = {}; return p.plato; }          // yozish uchun (yaratadi)
  function plGet() { var p = prefs().plato; return p && typeof p === 'object' ? p : {}; }          // faqat o'qish — holatni o'zgartirmaydi
  function plSign(x, d) { return (x > 0 ? '+' : x < 0 ? '−' : '') + Math.abs(x).toFixed(d == null ? 1 : d).replace('.', ','); }          // «−2,0 kg» — doim belgilangan kasr
  function kg1(x) { return (Math.round(x * 10) / 10).toFixed(1).replace('.', ','); }          // «84,0» — trend vazni doim bitta kasr bilan
  function plAn() { return PL ? PL.analyze({ st: st, S: S, today: todayStr() }) : null; }
  function wTrendChart(sm) {
    var ser = sm.sub, all = sm.ser; if (ser.length < 2) return '';
    var W = 340, H = 150, pl = 10, pr = 10, pt = 14, pb = 22, d0 = ser[0].d, span = Math.max(1, Dt.daysBetween(d0, ser[ser.length - 1].d));
    var vs = ser.map(function (s) { return s.kg; }).concat(ser.map(function (s) { return s.t; })), mn = Math.min.apply(null, vs) - 0.4, mx = Math.max.apply(null, vs) + 0.4;
    var X = function (d) { return pl + (W - pl - pr) * Dt.daysBetween(d0, d) / span; }, Y = function (v) { return pt + (H - pt - pb) * (mx - v) / (mx - mn); };
    var line = ser.map(function (s, i) { return (i ? 'L' : 'M') + X(s.d).toFixed(1) + ' ' + Y(s.t).toFixed(1); }).join(' '), wa = sm.water, band = '';
    if (wa && wa.to >= d0 && !(prefs().plato && prefs().plato.water)) { var x1 = Math.max(0, X(wa.from < d0 ? d0 : wa.from) - 6), x2 = Math.min(W, X(wa.to) + 6); band = '<rect class="wb" x="' + x1.toFixed(1) + '" y="0" width="' + (x2 - x1).toFixed(1) + '" height="' + H + '"/><text class="wt" x="' + (x1 + 6).toFixed(1) + '" y="' + (H - 7) + '">' + esc(T('plWaterL')) + '</text>'; }
    var grid = [0.15, 0.5, 0.85].map(function (f) { var y = (pt + (H - pt - pb) * f).toFixed(1); return '<line x1="0" y1="' + y + '" x2="' + W + '" y2="' + y + '"/>'; }).join('');
    return '<svg class="sl-wchart pl-ch" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(T('plTrendT') + ': ' + dec(sm.kg, 1) + ' ' + KG()) + '">' + band + '<g class="gr">' + grid + '</g>' + ser.map(function (s) { return '<circle class="dot" cx="' + X(s.d).toFixed(1) + '" cy="' + Y(s.kg).toFixed(1) + '" r="3.5"/>'; }).join('') + (sm.span >= 6 ? '<path class="avg" d="' + line + '" pathLength="1"/>' : '') + '</svg>' + (all.length ? '' : '');
  }
  function weightCardHtml() {
    var cur = S.currentWeight(st), wi = S.weightInfo(st, todayStr()), gp = S.goalProgress(st), pk = plGet().per || 'p28', sm = PL && st.weights.length ? PL.summary(st.weights, todayStr(), PL_PER[pk], Dt) : null;
    var wjoke = G && prefs().jokes !== false ? G.weightLine(jokeCtx(false)) : null; if (wjoke) saveQuiet();
    var tr = !!(sm && sm.ser.length >= 2 && Dt.daysBetween(sm.ser[0].d, sm.ser[sm.ser.length - 1].d) >= 6), lose = PL && PL.isLose(st), good = sm && (lose ? sm.change < 0 : (st.profile.goal === 'gain' ? sm.change > 0 : Math.abs(sm.change) < 0.5));
    var per = st.weights.length > 1 ? '<div class="pl-per" role="group" aria-label="' + esc(T('plTrendT')) + '">' + ['p28', 'p91', 'all'].map(function (k) { return '<button type="button" class="pl-pc' + (k === pk ? ' on' : '') + '" data-act="wper" data-k="' + k + '" aria-pressed="' + (k === pk) + '">' + esc(T(k === 'p28' ? 'plP28' : k === 'p91' ? 'plP91' : 'plPAll')) + '</button>'; }).join('') + '</div>' : '';
    var h = '<section class="rz-card sl-weight pl-w"><div class="sl-wh"><b>' + ico('scale') + esc(tr ? T('plTrendT') : T('meW')) + '</b><button type="button" class="sl-wv" data-act="xweight">?</button></div>' + per;
    if (!st.weights.length) h += '<div class="rz-mut">' + esc(T('meNoW')) + '</div>';
    else if (tr) h += '<div class="sl-wbig"><b>' + kg1(sm.kg) + '</b><small> ' + KG() + ' · ' + esc(T('plTrend')) + '</small></div><div class="pl-chg' + (good ? ' ok' : '') + '" id="wLbl">' + esc(sm.perWeek != null ? T('plChg', { c: plSign(sm.change), w: plSign(sm.perWeek, 2) }) : T('plChg0', { c: plSign(sm.change) })) + '</div>';
    else h += '<div class="sl-wbig"><b>' + dec(cur, 1) + '</b><small> ' + KG() + '</small></div><div class="rz-mut" id="wLbl">' + esc(weightLabel(wi)) + '</div>';
    if (wjoke) h += '<p class="rz-p sl-fact">' + esc(wjoke.text) + '</p>';
    if (sm) { h += wTrendChart(sm); if (sm.sub.length >= 2) h += '<div class="pl-lg" aria-hidden="true"><span><i class="d"></i>' + esc(T('plDots')) + '</span>' + (tr && sm.span >= 6 ? '<span><i class="t"></i>' + esc(T('plLine')) + '</span>' : '') + '</div>'; }
    if (sm && sm.water && !plGet().water) h += '<div class="pl-note bl" id="plWater">' + ico('drop', 'pl-ni') + '<span>' + esc(T('plWater')) + '</span><button type="button" class="rz-x pl-nx" data-act="plwater" aria-label="' + esc(T('close')) + '">' + ico('x') + '</button></div>';
    else if (st.weights.length && PL && PL.fewWeighs(st.weights, todayStr(), Dt) && st.weights.length < 12) h += '<p class="rz-mut sm pl-tip">' + esc(T('plWeigh')) + '</p>';
    if (gp) h += '<div class="sl-gp"><div class="rz-bar thin" aria-hidden="true"><i style="transform:scaleX(' + gp.share + ')"></i></div><span>' + esc(gp.left > 0 ? T('meProg', { x: dec(gp.left, 1) }) : '✓') + '</span></div>';
    return h + '<button type="button" class="rz-btn primary full" data-act="addweight">' + esc(T('meAddW')) + '</button></section>' + platoCtaHtml();
  }
  function plCtaSub(a) {
    if (a.state === 'need') { var n = a.need; return n.weights ? T('plNeedW', { n: n.weights }) : n.food && n.food >= n.days ? T('plNeedF', { n: n.food }) : n.days ? T('plNeedD', { n: n.days }) : T('plNeedS', { n: n.span }); }
    if (a.state === 'fast') return T('plCtaFast'); if (a.state === 'fine') return T('plCtaOk');
    return a.reasons.length === 1 ? T('plCta1') : T('plCtaN', { n: a.reasons.length });
  }
  function platoCtaHtml() {
    var a = plAn(); if (!a || !a.show) return '';
    return '<button type="button" class="pl-cta' + (a.state === 'need' ? ' need' : '') + '" id="plCta" data-act="plato"><span class="ic" aria-hidden="true">?</span><span class="m"><b>' + esc(T('plQ')) + '</b><span>' + esc(plCtaSub(a)) + '</span></span>' + ico('chev', 'r') + '</button>';
  }
  function plReasonHtml(r, i) {
    var t, p, k, c = ['ac', 'ye', 'bl'][i] || 'bl';
    if (r.k === 'qadam') { t = T('plR_qadam'); p = T('plR_qadamP', { a: fmt(r.a), b: fmt(r.b) }); k = T('plKd', { k: fmt(r.kcal) }); }
    else if (r.k === 'yozilmagan') { t = r.m ? T('plR_yoz_' + r.m, { n: r.n }) : T('plR_yozLow', { n: r.low }); p = (r.m ? T('plR_yozP') + (r.low >= 3 ? T('plR_yozX', { n: r.low }) : '') : T('plR_yozPLow')); k = T('plDays', { n: r.m ? r.n : r.low, of: r.of }) + ' · ' + T('plKd', { k: fmt(r.kcal) }); }
    else if (r.k === 'mashq') { t = T('plR_mashq'); p = T('plR_mashqP', { d: fmt(r.diff), c: fmt(r.cred) }); k = T('plKd', { k: fmt(r.kcal) }); }
    else if (r.k === 'damolish') { t = T('plR_damolish'); p = T('plR_damolishP', { d: fmt(r.diff) }); k = T('plKd', { k: fmt(r.kcal) }); }
    else if (r.k === 'oqsil') { t = T('plR_oqsil', { g: r.g }); p = T('plR_oqsilP', { n: r.need }); k = T('plGr', { g: r.g, n: r.need }); }
    else if (r.k === 'porsiya') { t = T('plR_porsiya'); p = T('plR_porsiyaP'); k = T('plKd', { k: fmt(r.kcal) }); }
    else { t = T('plR_defitsit'); p = r.floor ? T('plR_defitsitF', { k: fmt(r.minK) }) : T('plR_defitsitP', { d: fmt(r.def) }); k = T('plR_defK', { d: fmt(r.def) }); }
    return '<div class="pl-cs" data-r="' + r.k + '"><span class="n c-' + c + '">' + (i + 1) + '</span><div><b>' + esc(t) + '</b><p>' + esc(p) + '</p><span class="k c-' + c + '">' + esc(k) + '</span></div></div>';
  }
  function plWeek() { return PL.weekKey(todayStr(), S); }
  function plChecks() { var pp = plGet(); return pp.wk === plWeek() && pp.c ? pp.c : {}; }          // o'qish: shu hafta belgilari
  function plCheckSet(k) { var pp = plPrefs(); if (pp.wk !== plWeek()) { pp.wk = plWeek(); pp.c = {}; } pp.c = pp.c || {}; pp.c[k] = !pp.c[k]; return pp.c[k]; }
  function platoHtml(a) {
    var h = shHead(T('plQ')), n = a.period ? a.period.days : PL.WIN;
    if (a.state === 'need') {
      var nd = a.need, L = []; if (nd.days) L.push(T('plNeedD', { n: nd.days })); if (nd.weights) L.push(T('plNeedW', { n: nd.weights })); else if (nd.span) L.push(T('plNeedS', { n: nd.span })); if (nd.food) L.push(T('plNeedF', { n: nd.food }));
      return h + '<p class="rz-p">' + esc(T('plNeedT')) + '</p><div class="pl-tr">' + L.map(function (x) { return '<div class="pl-ti">' + ico('cal2', 'pl-ni') + '<span>' + esc(x) + '</span></div>'; }).join('') + '</div><p class="rz-mut sm pl-ft">' + esc(T('plNeedH')) + '</p>' + plFoot() + okBtn();
    }
    h += '<p class="rz-mut pl-sub">' + esc(T('plSub', { n: n })) + '</p>';
    if (a.state === 'fast') return h + '<div class="pl-note ye">' + ico('scale', 'pl-ni') + '<span><b>' + esc(T('plFastT')) + '.</b> ' + esc(a.kind === 'low' ? T('plLow', { k: fmt(a.avgK) }) : T('plFast', { w: dec(a.rate, 1) })) + '</span></div><p class="rz-p sm">' + esc(T('plFastH')) + '</p><div class="rz-actions"><button type="button" class="rz-btn primary" data-act="plgoal">' + esc(T('plFastB')) + '</button></div>' + plFoot();
    var e = Math.abs(Math.min(0, a.expected)), r = Math.abs(Math.min(0, a.actual)), mx = Math.max(e, r, 0.1);
    h += '<div class="pl-cmp"><div><span class="rz-mut">' + esc(T('plExp')) + '</span><b>' + plSign(a.expected) + ' ' + KG() + '</b><div class="pl-bar"><i style="transform:scaleX(' + (e / mx).toFixed(3) + ')"></i></div></div><div><span class="rz-mut">' + esc(T('plAct')) + '</span><b class="ok">' + plSign(a.actual) + ' ' + KG() + '</b><div class="pl-bar ok"><i style="transform:scaleX(' + (r / mx).toFixed(3) + ')"></i></div></div></div>';
    if (a.state === 'fine') return h + '<div class="pl-note gr">' + ico('check', 'pl-ni') + '<span><b>' + esc(T('plOkT')) + '.</b> ' + esc(T('plOk')) + (a.perWeek != null ? ' ' + esc(T('plOkW', { w: plSign(a.perWeek, 2) })) : '') + '</span></div>' + plTriesHtml(a) + plFoot();
    h += '<div class="pl-note ye">' + ico('scale', 'pl-ni') + '<span>' + esc(a.gapKcal >= 50 ? T('plGap', { kg: dec(a.gapKg, 1), k: fmt(a.gapKcal) }) : T('plGap0')) + '</span></div>';
    h += '<h3 class="pl-lbl">' + esc(T('plRs')) + '</h3>' + a.reasons.map(plReasonHtml).join('');
    return h + plTriesHtml(a) + plFoot();
  }
  function plTriesHtml(a) {
    var c = plChecks(), on = !!plGet().rem;
    return '<h3 class="pl-lbl">' + esc(T('plTry')) + '</h3><div class="pl-tr">' + a.tries.map(function (k) { var v = !!c[k]; return '<button type="button" class="pl-ti' + (v ? ' on' : '') + '" data-act="pltry" data-k="' + k + '" role="checkbox" aria-checked="' + v + '"><span class="cb" aria-hidden="true">' + (v ? ico('check', '', 2.6) : '') + '</span><span>' + esc(T('plT_' + k)) + '</span></button>'; }).join('') + '</div>' +
      '<button type="button" class="rz-btn ' + (on ? 'ghost' : 'primary') + ' full pl-rem" data-act="plrem" aria-pressed="' + on + '">' + esc(on ? T('plRemOff') : T('plRem')) + '</button>';
  }
  function plFoot() {
    var o = !!(pv && pv.src);
    return '<p class="pl-ft">' + esc(T('plFoot')) + '</p><button type="button" class="pl-srcb" data-act="plsrc" aria-expanded="' + o + '">' + esc(T('plSrc')) + ' ' + ico('chev', o ? 'up' : 'dn') + '</button>' + (o ? '<ol class="pl-src">' + PL.SRC.map(function (k) { return '<li>' + esc(T(k)) + '</li>'; }).join('') + '</ol>' : '');
  }
  var pv = null, plA = null;
  function openPlato() {
    if (!PL) return; plA = plAn(); if (!plA || !plA.show) return; pv = { src: false };
    stEv('plato_ochildi', plA.state); if (plA.state === 'slow') plA.reasons.forEach(function (r) { stEv('plato_sabab', r.k); }); else if (plA.state === 'fast') stEv('plato_sabab', plA.kind); else if (plA.state === 'fine') stEv('plato_sabab', 'joyida');
    if (ftOpenNow()) closeFeats(true);
    openSheet('plato', platoHtml(plA));
  }
  function plRefresh() { if (kit.sheetKind() !== 'plato' || !plA) return; var sh = $('#rzSheet'), sc = sh.scrollTop; setSheet(platoHtml(plA)); sh.scrollTop = sc; }
  function plRemTxt() { var a = plA || plAn(); if (!a || !a.tries) return ''; var c = plChecks(), k = a.tries.filter(function (x) { return !c[x]; })[0]; return k ? T('plT_' + k) : ''; }
  function plResched() {
    if (!NAT || NS.perm !== 'granted') return; var pp = plGet(); if (!pp.rem) { NAT.notif.disable(PL_ID); return; }
    var x = plRemTxt(); if (!x) { NAT.notif.disable(PL_ID); return; }
    NAT.notif.schedule({ id: PL_ID, day: (S.weekdayIdx(todayStr()) + 1) % 7, hour: 12, title: 'KalkiFit', body: natTr(T('plRemToast', { x: x })), url: (lang === 'ru' ? '/ru/kalkifit' : '/kalkifit') + '?plato=1' }).catch(function () {});
  }
  function plBootRem() {                                // «Eslatib turilsin» (bildirishnoma bo'lmasa): ilova ochilganda kuniga bir marta — hali belgilanmagan birinchi ish
    if (!PL || !st.setup) return; var pp = plGet(); if (!pp.rem || pp.remD === todayStr() || !PL.isLose(st)) return; pp = plPrefs(); var x = plRemTxt(); if (!x) return;
    pp.remD = todayStr(); save(); setTimeout(function () { if (!kit.sheetKind()) toast(T('plRemToast', { x: x }), null, false, 6000); }, 1800);
  }
  function plHk() {                                    // «Haftangiz» ichida BIR MARTA: trend 14+ kun deyarli joyida yoki kutilganning yarmidan kam
    if (!PL || plGet().hk) return null; var a = plAn(); if (!a || !PL.stalled(a)) return null; return { t: T('plHk'), b: T('plHkB') };
  }
  /* ---------- TARIX (Kundalik + Natijalar birlashgan) ---------- */
  function secHead(k) { return '<div class="sl-sec2"><h3>' + esc(T(k)) + '</h3></div>'; }
  function renderHistory() {
    var sk = S.streak(st, todayStr()), h = '<h2 class="rz-h">' + esc(T('histT')) + '</h2>' + (sk >= 2 ? '<div class="sl-stkrow"><button type="button" class="sl-streak2" id="streakChip" data-act="streakinfo" aria-label="' + esc(T('hStreak', { n: sk }) + '. ' + T('stkQ')) + '">' + ico('flame') + esc(T('hStreak', { n: sk })) + '</button></div>' : '') + hkCardHtml() + '<section class="rz-card">' + rowBtn('supp', 'pill', T('spCardT'), T('spH')) + '</section>' + secHead('histDays') + diaryHtml() + secHead('histRes') + histResultsHtml();
    setMain(h); markSeen(); resultsAfter();
  }
  function stepsHtml() {
    var t = todayStr(), x = S.dayOf(st, t) || { steps: 0 }, stp = S.stepsStats(st, x.steps), ser = S.stepsSeries(st, t, 7), tot = S.stepsTotal(st, ser), mx = Math.max(st.stepGoal, Math.max.apply(null, ser.map(function (s) { return s.steps; })), 1), mon = S.monthSteps(st, Dt.monthOf(t));
    loadMasofa(); var dl = G && prefs().jokes !== false && masofa ? G.distLines(jokeCtx(false)) : null; if (dl && (dl.week || dl.month)) saveQuiet(); var jbox = function (l) { return '<p class="rz-p sl-fact">' + ico('flame', 'sl-inl') + esc(l.text) + '</p>'; }; var weekJoke = dl && dl.week ? jbox(dl.week) : routeFact(tot.km), monJoke = dl && dl.month ? jbox(dl.month) : routeFact(mon.km);
    if (!QA) return '<section class="rz-card sl-stepweb"><p class="rz-mut">' + ico('steps') + esc(T('stWeb')) + '</p></section>';
    var h = '<section class="rz-card sl-stepbig"><button type="button" class="sl-sn" data-act="xsteps"><span class="l">' + ico('steps') + esc(T('stepsT')) + '</span><b id="sNum">' + fmt(x.steps) + '</b><span class="u">' + (x.steps ? esc(stp.km.toString().replace('.', ',') + ' ' + T('km') + ' · ' + fmt(stp.kcal) + ' ' + T('kcal')) : esc(T('sNone'))) + '</span>' + qaSrcHtml() + '</button><div class="rz-bar thin" aria-hidden="true"><i style="transform:scaleX(' + Math.min(1, x.steps / st.stepGoal) + ')"></i></div><div class="rz-mut sm">' + esc(T('stGoal', { x: fmt(st.stepGoal) })) + '</div></section>';
    h += '<section class="rz-card"><div class="rz-st">' + esc(T('stWeek')) + '</div><div class="sl-chart" style="--g:' + (st.stepGoal / mx).toFixed(3) + '" role="img" aria-label="' + esc(T('stWeek')) + '">' + ser.map(function (s) { var wd = S.weekdayIdx(s.d), nm = D[lang] && (lang === 'ru' ? ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] : ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'])[wd]; return '<span class="b' + (s.d === t ? ' td' : '') + '" data-d="' + s.d + '" role="img" aria-label="' + esc(kit.dLabel(s.d) + ': ' + fmt(s.steps)) + '"><span class="v">' + (s.steps ? fmt(s.steps) : '') + '</span><span class="col"><i style="transform:scaleY(' + (s.steps / mx) + ')"></i></span><span class="d">' + esc(nm) + '</span></span>'; }).join('') + '</div>' +
      '<div class="sl-wtot"><b>' + esc(tot.km.toString().replace('.', ',') + ' ' + T('km')) + '</b><span>' + fmt(tot.steps) + ' · ' + fmt(tot.kcal) + ' ' + T('kcal') + '</span></div>' +
      (tot.steps ? weekJoke : '<p class="rz-mut">' + esc(T('stEmpty')) + '</p>') + '</section>';
    h += '<section class="rz-card"><div class="rz-st">' + esc(T('stMonth')) + '</div><div class="sl-wtot"><b>' + fmt(mon.steps) + '</b><span>' + esc(mon.km.toString().replace('.', ',') + ' ' + T('km') + ' · ' + fmt(mon.kcal) + ' ' + T('kcal')) + '</span></div>' + monJoke + '<button type="button" class="rz-row" data-act="stepgoal"><span class="m"><b>' + esc(T('stGoalSet')) + '</b></span><span class="v">' + fmt(st.stepGoal) + '</span></button><p class="rz-priv">' + esc(T('stNoRank')) + '</p></section>';
    return h;
  }
  function stepsAnim() { $$('.sl-chart .col i').filter(function (e) { if (e.__a) return false; e.__a = 1; return true; }).forEach(function (e, i) { var f = e.style.transform; e.style.transform = 'scaleY(0)'; setTimeout(function () { e.style.transform = f; }, reduce ? 0 : 60 + i * 50); }); }


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
  /* BITTA ro'yxat konfiguratsiyasi (Bugun → «Imkoniyatlar» chap paneli va Profil → «Imkoniyatlar»): { k: kalit, ic: ikonka, g: guruh, c: ikonka rangi, ok: mavjudmi, lim: limit turi }.
     Guruhlar tartibi FT_G; «tez» guruhi — rangli kartalar (ovoz/rasm/menyu), qolganlari ro'yxat. Yangi imkoniyat — shu yerga bitta qator + ft_<kalit>/ft_<kalit>H matnlari + feat() dagi case.
     Mavjud bo'lmagani (masalan menyu moduli yuklanmagan) ro'yxatga KIRMAYDI — to'rda bo'sh joy qolmaydi (ustunlar soni kartalar soniga teng) */
  var FT_G = ['tez', 'natija', 'yemak', 'mening', 'soglik', 'bilim'];
  function featList() {
    return [{ k: 'ovoz', ic: 'mic', g: 'tez', ok: micCan(), lim: 'ovoz' }, { k: 'rasm', ic: 'cam', g: 'tez', ok: true, lim: 'ai' }, { k: 'menyu', ic: 'menu', g: 'tez', ok: !!(Y && Y.menuOpen && window.KalkiMenyu), lim: 'ai' },
      { k: 'hafta', ic: 'bars', g: 'natija', c: 'pu', ok: true }, { k: 'kunkarta', ic: 'upload', g: 'natija', c: 'ye', ok: true }, { k: 'ulashish', ic: 'trend', g: 'natija', c: 'pu', ok: true },
      { k: 'plato', ic: 'qmark', g: 'natija', c: 'gr', ok: !!(window.KalkiPlato && KalkiPlato.isLose(st)) },
      { k: 'yeymiz', ic: 'zfork', g: 'yemak', c: 'ac', ok: !!Y }, { k: 'yesam', ic: 'qmark', g: 'yemak', c: 'ac', ok: true }, { k: 'retsept', ic: 'rspark', g: 'yemak', c: 'ac', ok: !!R },
      { k: 'odatdagi', ic: 'star', g: 'mening', c: 'gr', ok: true }, { k: 'taomlarim', ic: 'book', g: 'mening', c: 'gr', ok: true }, { k: 'yorliq', ic: 'lbl', g: 'mening', c: 'gr', ok: true }, { k: 'idishlar', ic: 'bowl', g: 'mening', c: 'gr', ok: true }, { k: 'tartib', ic: 'mlMoon', g: 'mening', c: 'bl', ok: true },
      { k: 'supp', ic: 'pill', g: 'soglik', c: 'bl', ok: true }, { k: 'afsona', ic: 'qmark', g: 'bilim', c: 'pu', ok: !!AF }].filter(function (x) { return x.ok; });
  }
  function featRow(x, cls) {                         // butun qator bosiladi, o'ngda «›»
    return '<button type="button" class="rz-row sl-feat' + (cls || '') + '" data-act="feat" data-fk="' + x.k + '" aria-label="' + esc(T('ft_' + x.k)) + '"><span class="sl-ci' + (x.c ? ' fc-' + x.c : '') + '">' + ico(x.ic) + '</span><span class="m"><b>' + esc(T('ft_' + x.k)) + (x.k === 'hafta' && hwDue() ? ' <i class="ft-new">' + esc(T('ftNew')) + '</i>' : '') + '</b><span>' + esc(T('ft_' + x.k + 'H')) + '</span></span>' + ico('chev', 'r') + '</button>';
  }
  function featsHtml() { return '<section class="rz-card sl-feats">' + featList().map(function (x) { return featRow(x); }).join('') + '</section>'; }          // Profil → «Imkoniyatlar» (guruhlar tartibida)
  /* Bugun → «Imkoniyatlar»: CHAPDAN chiqadigan panel (maket: ~/imkoniyatlar-maket.html). Ochish/yopish: tugma, ✕, fon, chapga surish, Escape, Android «orqaga» (nativeBack) */
  function ftLimTxt(x) {
    var q = x.lim === 'ovoz' ? ovq : x.lim === 'ai' ? aiq : null; if (!q) return '';
    return q.qoldi > 0 ? T('qLeft', { n: q.qoldi }) : T('qNoLeft');
  }
  function ftDrawerHtml() {
    var L = featList(), it = function (h, cls) { return h.replace(/^<(\w+) class="/, '<$1 class="it ' + (cls || '')); };
    var h = '<div class="ft-dh it"><div><h2 id="ftDrH">' + esc(T('ftBtn')) + '</h2><p>' + esc(T('ftSub')) + '</p></div><button type="button" class="ft-x" data-act="ftclose" aria-label="' + esc(T('close')) + '">' + ico('x') + '</button></div>';
    FT_G.forEach(function (g) {
      var xs = L.filter(function (x) { return x.g === g; }); if (!xs.length) return;
      h += '<h3 class="ft-sec it">' + esc(T('ftG_' + g)) + '</h3>';
      if (g === 'tez') h += '<div class="ft-qa" style="--n:' + xs.length + '">' + xs.map(function (x) { var lt = ftLimTxt(x); return '<button type="button" class="ft-t it ft-' + x.k + '" data-act="feat" data-fk="' + x.k + '" aria-label="' + esc(T('ft_' + x.k)) + '">' + ico(x.ic) + '<span class="m"><b>' + esc(T('ftS_' + x.k)) + '</b><small class="ft-lim' + (lt ? '' : ' e') + '">' + esc(lt) + '</small></span></button>'; }).join('') + '</div>';
      else h += '<div class="ft-grp it">' + xs.map(function (x) { return featRow(x); }).join('') + '</div>';
    });
    return h + (IN ? '<button type="button" class="ft-ft it" data-act="ftintro">' + esc(T('ftIntro')) + '</button>' : '');
  }
  var ftEl = null, ftTm = null, ftFocus = null;
  function ftOpenNow() { return !!(ftEl && ftEl.dr.classList.contains('op')); }
  function ftLimRefresh() { if (!ftOpenNow()) return; featList().forEach(function (x) { var el = ftEl.dr.querySelector('.ft-t[data-fk=' + x.k + '] .ft-lim'); if (el) { var t = ftLimTxt(x); el.textContent = t; el.classList.toggle('e', !t); } }); }
  function openFeats() {
    if (!ftEl) {
      var ov = document.createElement('div'), dr = document.createElement('aside'); ov.className = 'ft-ov'; ov.hidden = true; ov.setAttribute('data-act', 'ftclose');
      dr.className = 'ft-dr'; dr.id = 'ftDr'; dr.hidden = true; dr.setAttribute('role', 'dialog'); dr.setAttribute('aria-modal', 'true'); dr.setAttribute('aria-labelledby', 'ftDrH');
      root.appendChild(ov); root.appendChild(dr); ftEl = { ov: ov, dr: dr }; ftSwipe(dr);
    }
    clearTimeout(ftTm); var o = ftEl; o.dr.innerHTML = ftDrawerHtml(); o.dr.scrollTop = 0; o.dr.style.transform = ''; o.dr.classList.toggle('anim', !reduce);
    [].forEach.call(o.dr.querySelectorAll('.it'), function (e, i) { e.style.animationDelay = (60 + i * 35) + 'ms'; });
    ftFocus = document.activeElement; o.ov.hidden = false; o.dr.hidden = false; void o.dr.offsetWidth; o.ov.classList.add('op'); o.dr.classList.add('op'); document.documentElement.classList.add('ft-lock');
    setTimeout(function () { var x = o.dr.querySelector('.ft-x'); if (x && ftOpenNow()) try { x.focus({ preventScroll: true }); } catch (e) {} }, 60);
    if (!(KD && KD.on) && navigator.onLine !== false) { if (!aiq) aiPeek(); ovBoot(function () { if (!ftOpenNow()) return; var had = !!o.dr.querySelector('.ft-ovoz'); if (had !== micOk() && !micCan()) o.dr.innerHTML = ftDrawerHtml(); else ftLimRefresh(); }); }
  }
  function closeFeats(now) {
    if (!ftOpenNow()) return false; var o = ftEl; o.dr.classList.remove('op'); o.ov.classList.remove('op'); o.dr.style.transform = ''; document.documentElement.classList.remove('ft-lock');
    clearTimeout(ftTm); ftTm = setTimeout(function () { if (!ftOpenNow()) { o.dr.hidden = true; o.ov.hidden = true; o.dr.innerHTML = ''; } }, now || reduce ? 0 : 360);
    if (ftFocus && ftFocus.focus && document.contains(ftFocus) && !now) try { ftFocus.focus({ preventScroll: true }); } catch (e) {}
    return true;
  }
  function ftSwipe(dr) {                             // chapga surish: barmoqqa ergashadi; 70 px dan ko'p yoki tez surilsa — yopiladi. Vertikal aylantirish — brauzerniki (touch-action: pan-y)
    var s = null;
    dr.addEventListener('pointerdown', function (e) { if (e.pointerType === 'mouse') return; s = { x: e.clientX, y: e.clientY, t: Date.now(), on: false }; });
    dr.addEventListener('pointermove', function (e) { if (!s) return; var dx = e.clientX - s.x, dy = e.clientY - s.y; if (!s.on) { if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { s = null; return; } if (dx < -8 && Math.abs(dx) > Math.abs(dy)) s.on = true; else return; } dr.style.transition = 'none'; dr.style.transform = 'translateX(' + Math.min(0, dx) + 'px)'; });
    var end = function (e) { if (!s) return; var dx = (e.clientX || s.x) - s.x, on = s.on, v = dx / Math.max(1, Date.now() - s.t); s = null; dr.style.transition = ''; if (!on) return; if (dx < -70 || v < -0.5) closeFeats(); else dr.style.transform = ''; };
    dr.addEventListener('pointerup', end); dr.addEventListener('pointercancel', function () { if (s && s.on) { dr.style.transition = ''; dr.style.transform = ''; } s = null; });
  }
  /* v50: Profil (maket ~/profil-maket.html, 2-ekran): hero (gradient, avatar, «Salom 👋», maqsad progressi — trend vaznidan), 4 plitka (bosilsa — o'sha maydon), kunlik me'yor, «Ovqatlanish» guruhi.
     Animatsiyalar faqat ekran ochilganda bir marta (setMain o'zgarmagan bloklarni qayta qo'ymaydi); prefers-reduced-motion — o'chadi */
  function pfHeroHtml() {
    var pr = st.profile, nm = akk.name ? akk.name() : '', kg = protKg(), gw = num(pr.goalWeight), start = st.weights.length ? st.weights[0].kg : num(pr.weight), lin = !!(akk.loggedIn && akk.loggedIn());
    var h = '<section class="pf-hero" id="pfHero"><span class="pf-b1" aria-hidden="true"></span><span class="pf-b2" aria-hidden="true"></span><div class="pf-hr"><span class="pf-av" aria-hidden="true" data-cyr="skip">' + (nm ? esc(nm.trim().charAt(0).toUpperCase()) : ico('me')) + '</span><span class="pf-nm"><span>' + esc(T('pfHi')) + '</span>' +
      (nm ? (lin ? '<button type="button" class="pf-nmv" id="pfNmV" data-act="akkname" data-cyr="skip" aria-label="' + esc(T('pfEditName') + ': ' + nm) + '">' + esc(nm) + '</button>' : '<b data-cyr="skip">' + esc(nm) + '</b>') : lin ? '<button type="button" class="pf-nmb" data-act="akkname">' + esc(T('pfAddName')) + '</button>' : '<b>' + esc(T('pfYou')) + '</b>') + '</span><button type="button" class="pf-ed" data-act="editprof" aria-label="' + esc(T('meEdit')) + '">' + ico('pen') + '</button></div>';
    if (gw > 0) {
      var tot = start - gw, share = tot ? Math.max(0, Math.min(1, (start - kg) / tot)) : 1, ch = Math.round((kg - start) * 10) / 10, good = (pr.goal === 'gain') ? ch > 0 : ch < 0;
      h += '<div class="pf-goal"><div class="pf-gt"><span>' + esc(T('pfGoalT', { g: dec(gw, 1) })) + '</span><b>' + plSign(ch) + ' ' + KG() + (good ? ' ✓' : '') + '</b></div><div class="pf-gb" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(share * 100) + '"><i style="--w:' + (share * 100).toFixed(1) + '%"></i></div><div class="pf-gs"><span>' + dec(start, 1) + ' ' + KG() + '</span><span>' + esc(T('pfNow', { w: dec(kg, 1) })) + '</span><span>' + dec(gw, 1) + ' ' + KG() + '</span></div></div>';
    } else h += '<button type="button" class="pf-gadd" data-act="pftile" data-k="goal">' + ico('plus') + '<span>' + esc(T('pfGoalAdd')) + '</span></button>';
    return h + '</section>';
  }
  function pfTilesHtml() {
    var pr = st.profile, kg = protKg();
    return '<div class="pf-tiles">' + [['sex', 'me', T(pr.sex === 'f' ? 'pfSexF' : 'pfSexM'), T('pfSexL')], ['age', 'cake', String(pr.age), T('pfAgeL')], ['height', 'ruler', String(pr.height), T('pfHL')], ['weight', 'scale', dec(kg, 1), T('pfWL')]].map(function (x, i) {
      return '<button type="button" class="pf-ti" data-act="pftile" data-k="' + x[0] + '" style="--i:' + i + '"><span class="pf-tic" aria-hidden="true">' + ico(x[1]) + '</span><b>' + esc(x[2]) + '</b><span>' + esc(x[3]) + '</span></button>';
    }).join('') + '</div>';
  }
  function pfNormHtml() {
    var pl = planNow(), d = pl.target - pl.tdee, corr = pl.corr ? '<button type="button" class="pf-corr" data-act="corroff"><span>' + esc(T('pfCorr', { c: (pl.corr > 0 ? '+' : '−') + fmt(Math.abs(pl.corr)) })) + '</span><b>' + esc(T('pfCorrOff')) + '</b></button>' : '';
    return '<button type="button" class="pf-norm" data-act="xkcal"><span class="pf-nic" aria-hidden="true">' + ico('flame') + '</span><span class="m"><b>' + fmt(pl.target) + ' ' + esc(T('kcal')) + '</b><span>' + esc(T('pfNormS', { g: T('gS_' + pl.goal) })) + '</span></span>' + (d ? '<em class="' + (d < 0 ? 'neg' : 'pos') + '">' + (d < 0 ? '−' : '+') + fmt(Math.abs(d)) + '/' + esc(T('pfDay')) + '</em>' : '') + '</button>' + corr;
  }
  function pfFoodHtml() {
    var pg = protNow(), ym = Array.isArray(prefs().yemay) ? prefs().yemay.length : 0, row = function (act, ic, c, t, v) { return '<button type="button" class="rz-row pf-r" data-act="' + act + '"><span class="sl-ci fc-' + c + '" aria-hidden="true">' + ico(ic) + '</span><span class="m"><b>' + esc(t) + '</b></span><span class="v">' + esc(v) + '</span>' + ico('chev', 'r') + '</button>'; };
    return '<h3 class="sl-grp">' + esc(T('pfGrpFood')) + '</h3><section class="rz-card pf-grp">' + row('ttopen', 'mlMoon', 'bl', T('ttRow'), ttName(ttMode())) + row('protg', 'muscle', 'gr', T('pgRow'), pg.g + ' g') + (Y ? row('yqbel', 'shield', 'ac', T('ynT'), ym ? T('pfYmN', { n: ym }) : T('pfYmNone')) : '') + '</section>';
  }
  function pfField(k) {                              // plitka bosilsa — profil oynasi o'sha maydonga aylanadi
    openProfile(); var sel = { sex: '.rz-seg', age: '#peA', height: '#peH', weight: '#peW', goal: '#peG' }[k];
    setTimeout(function () { var e = sel && $('#rzSheet ' + sel); if (!e) return; var box = e.closest('[data-sld], .rz-f, .rz-seg') || e; try { box.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' }); } catch (x) {} if (k === 'goal' && e.focus) try { e.focus({ preventScroll: true }); } catch (x) {} box.classList.add('pf-hl'); setTimeout(function () { box.classList.remove('pf-hl'); }, 1400); }, 380);
  }
  function renderProfile() {
    if (PS.state === 0) loadPush(function () { if (view === 'profile' && !kit.sheetKind()) render(); });          // yangi foydalanuvchida kalit so'rovi faqat Profil ochilganda (boshqa joyda tarmoq so'rovi yo'q)
    var pr = st.profile, pl = planNow(), big = document.documentElement.classList.contains('fs-big'), curL = isCyr() ? 'cyr' : lang, th = themeNow();
    var row = function (act, ic, t1, t2) { return '<button type="button" class="rz-row" data-act="' + act + '">' + catIcon(ic) + '<span class="m"><b>' + esc(t1) + '</b>' + (t2 ? '<span>' + esc(t2) + '</span>' : '') + '</span>' + ico('chev', 'r') + '</button>'; };
    var seg = function (act, key, opts, cur, label) { return segHtml(label || '', opts.map(function (o) { return { attrs: 'data-act="' + act + '" data-' + key + '="' + o[0] + '"', on: cur === o[0], text: o[1] }; })); };
    var grp = function (k) { return '<h3 class="sl-grp">' + esc(T(k)) + '</h3>'; };          // Profil (v50): hero (ism, maqsad, 4 plitka, me'yor) → Ovqatlanish → Sozlamalar → Imkoniyatlar → Ilova → (eng pastda) Hisob va zaxira
    var h = '<h2 class="rz-h">' + esc(T('profT')) + '</h2>' + pfHeroHtml() + taxRowHtml() + pfTilesHtml() + pfNormHtml();          // v50: hero · plitkalar · me'yor          // ism: faqat kirgan foydalanuvchida (mehmonda blok yo'q)
    h += pfFoodHtml();          // «Ovqatlanish»: Kun tartibi · Oqsil maqsadi · Yemaydiganlarim
    h += grp('pgSet');
    h += '<section class="rz-card sl-remc" id="remCard" aria-label="' + esc(T('sRem')) + '"><div class="rz-st">' + esc(T('sRem')) + '</div>' + pushRowHtml(true) + hwRowHtml() + '</section>';
    var qr = qaRowHtml(); if (qr) h += '<section class="rz-card sl-qacard">' + qr + '</section>';
    h += '<section class="rz-card"><div class="rz-st">' + esc(T('sLangT')) + '</div>' + segHtml(T('sLang'), [{ attrs: 'data-act="lang" data-l="uz"', on: curL === 'uz', text: 'UZ' }, { attrs: 'data-act="lang" data-l="cyr"', on: curL === 'cyr', text: 'ЎЗ' }, { attrs: 'data-act="lang" data-l="ru"', on: curL === 'ru', text: 'RU' }], ' data-cyr="skip"') +
      '<div class="rz-st" style="margin-top:14px">' + esc(T('themeT')) + '</div>' + seg('theme', 't', [['auto', T('thAuto')], ['light', T('thLight')], ['dark', T('thDark')]], th, T('themeT')) +
      '<div class="rz-st" style="margin-top:14px">' + esc(T('sFont')) + '</div>' + segHtml(T('sFont'), [{ attrs: 'data-act="font" data-f="n"', on: !big, text: T('fN') }, { attrs: 'data-act="font" data-f="b"', on: big, text: T('fB') }]) + '</section>';
    h += jokesCardHtml();
    h += grp('pgImk') + featsHtml();
    h += grp('pgApp');
    h += '<section class="rz-card">' + (window.KalkiNative && KalkiNative.isAndroidBrowser() ? row('apk', 'download', T('apkT'), T('apkH')) : '') + row('intro', 'help', T('sIntro'), '') + news.row() + '<span class="rz-aboutrow">' + row('about', 'info', T('sAbout'), '') + '</span></section>';
    h += grp('pgAcc');
    h += '<section class="rz-card"><div class="rz-st">' + esc(T('profBackup')) + '</div>' + (inst.row() ? inst.row().html : '') + (akk.enabled() ? akk.rowHtml() + akk.more(bk.tgRow() + bk.cloudHtml() + akk.strictRow() + row('export', 'upload', T('sExp'), '') + row('import', 'download', T('sImp'), '') + bk.lastHtml()) + row('wipe', 'trash', T('sDel'), '') : bk.tgRow() + bk.cloudHtml() + akk.rowHtml() + row('export', 'upload', T('sExp'), '') + row('import', 'download', T('sImp'), '') + row('wipe', 'trash', T('sDel'), '') + bk.lastHtml()) + '</section>';
    h += '<p class="rz-priv">' + esc(T(akk.loggedIn && akk.loggedIn() ? 'pFootAcc' : 'pFoot')) + '</p>' + (appVer ? '<button type="button" class="sl-ver" data-act="vertap" data-cyr="skip">KalkiFit ' + esc(appVer) + '</button>' : '');
    setMain(h);
  }

  /* #rzMain: qayta chizishda faqat O'ZGARGAN bloklar almashtiriladi (bir xil kartalar joyida qoladi — animatsiya qayta o'ynamaydi, rasm qayta yuklanmaydi, «sakrash» yo'q).
     Bo'lim almashganda — to'liq. Taqqoslash elementning qo'yilgandagi HTML'i bilan (__h): keyin JS qo'shgan style/class farq hisoblanmaydi. */
  var mainView = '';
  function setMain(h) {
    var m = $('#rzMain'); if (!m) return;
    var tpl = document.createElement('template'); tpl.innerHTML = h; var nw = [].slice.call(tpl.content.children);
    nw.forEach(function (e) { e.__h = e.outerHTML; });
    if (mainView !== view || m.children.length === 0) { mainView = view; m.innerHTML = ''; nw.forEach(function (e) { m.appendChild(e); }); return; }
    var old = [].slice.call(m.children), j = 0;
    for (var i = 0; i < nw.length; i++) {
      var o = old[j];
      if (o && o.__h === nw[i].__h) { j++; continue; }
      var k = -1; for (var q = j + 1; q < Math.min(old.length, j + 4); q++) if (old[q].__h === nw[i].__h) { k = q; break; }
      if (k >= 0) { for (; j < k; j++) m.removeChild(old[j]); j++; continue; }          // eski blok(lar) yo'qoldi
      if (o && nw[i + 1] && o.__h === nw[i + 1].__h) { m.insertBefore(nw[i], o); continue; }          // yangi blok qo'shildi
      if (o) { m.replaceChild(nw[i], o); j++; } else m.appendChild(nw[i]);
    }
    for (; j < old.length; j++) if (old[j].parentNode === m) m.removeChild(old[j]);
    [].slice.call(m.childNodes).forEach(function (c) { if (c.nodeType !== 1) m.removeChild(c); });
  }
  function render() {
    lang = langNow();
    $$('[data-k]').forEach(function (e) { if (!e.closest('#rzMain, #rzSheet')) e.textContent = T(e.getAttribute('data-k')); });          // faqat statik qobiq (nav va h.k.); ekran ichidagi data-k (nudge, klaviatura) — boshqa ma'noda, morph'da saqlangan tugunlar buzilmasin
    var lt0 = isCyr() ? 'ЎЗ' : lang.toUpperCase(), lb0 = $('#rzLang'); if (lb0) lb0.setAttribute('aria-label', lt0 + ' · Til / Язык');
    var ab = document.getElementById('rzAboutBack'); if (ab) ab.textContent = T('aboutBack');
    var lockUi = function (on) { ['#rzMain', '.rz-nav'].forEach(function (q) { var e = $(q); if (e) { e.inert = on; if (on) e.setAttribute('aria-hidden', 'true'); else e.removeAttribute('aria-hidden'); } }); };
    var ab = $('#rzAddBar'); if (ab) ab.hidden = !(st.setup && view === 'today'); if (ab && !st.setup) lockUi(true);
    if (!st.setup) { lockUi(true); if (needLangPick()) showLangPick(); else if (needIntro()) introFirst(); else showOnb(); return; }          // til → tanishtiruv (3 ekran, bir marta) → profil savollari
    lockUi(false); akk.check();
    var onb = $('#rzOnb'); if (onb && !onb.classList.contains('out')) onb.hidden = true;
    $$('.rz-tab').forEach(function (b) { var on = b.getAttribute('data-v') === view; b.classList.toggle('on', on); b.setAttribute('aria-current', on ? 'page' : 'false'); });
    var title = { today: T('appName'), history: T('histT'), profile: T('profT') }[view]; $('#rzTitle').textContent = title; root.setAttribute('data-view', view);
    KD.mark(lang);
    var lt = $('#rzLangTxt'); if (lt) lt.textContent = isCyr() ? 'ЎЗ' : lang.toUpperCase();
    $('#rzFab').setAttribute('aria-label', T('navAdd'));
    var main = $('#rzMain'), sc = main.scrollTop;
    if (mainView !== view) { Object.keys(ringMem).forEach(function (k) { if (k.indexOf('ml:') === 0) delete ringMem[k]; }); ringPend = {}; calFresh = true; setTimeout(function () { calFresh = false; }, 2600); }          // v63: ekran ochilganda halqalar 0 dan to'ladi (qayta chizishda emas)
    ({ today: renderToday, history: renderHistory, profile: renderProfile })[view]();
    main.classList.toggle('enter', enterNext); enterNext = false; main.scrollTop = sc;
    if (view === 'today') { if (!todayIn) { todayIn = true; staggerToday(); } else upIdx(); }
  }


  /* ================= 2-bosqich: hazillar, "Buni yesam-chi?", retsept, taqvim, rasm, taklif, qo'shimchalar ================= */
  kit.addIcons({
    bowl: 'M3 11h18a8 8 0 0 1-8 8h-2a8 8 0 0 1-8-8z M8 7c0-1 1-1 1-2 M12 7c0-1 1-1 1-2 M16 7c0-1 1-1 1-2',
    lbl: 'M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z M8 7h8 M8 11h8 M8 14h5 M8 17h6',
    star: 'M12 3.500l2.700 5.500 6 .900-4.400 4.200 1 6-5.300-2.800-5.300 2.800 1-6L3.300 9.900l6-.900z',
    dots: 'M5.500 12h.010 M12 12h.010 M18.500 12h.010', undo: 'M4 12a8 8 0 1 0 2.500-5.800 M4 4v5h5', bm: 'M6 4h12v17l-6-4-6 4z',
    kVeg: 'M15 4c1.5-1.5 3.5-1 4 0 M17 6l2-2 M15 9l2-1 M14 7 4.5 19.5c-.6.8.2 1.6 1 1L17 10a2.1 2.1 0 0 0-3-3z', kFruit: 'M12 7c-2.200-2-6.500-1.500-7 2.500C4.500 13 6.800 19.500 10 20c1 .200 1.500-.500 2-.500s1 .700 2 .500c3.200-.500 5.500-7 5-10.500C18.500 5.500 14.200 5 12 7z M12 7c0-2 1-3.500 3-4', kGrain: 'M12 21V9 M12 9c-2.500-1-3.500-3-3.500-5.500 2.200.300 3.500 2.300 3.500 5.500 M12 9c2.500-1 3.500-3 3.500-5.500-2.200.300-3.500 2.300-3.500 5.500 M12 14c-2.500-1-3.500-3-3.500-5 M12 14c2.500-1 3.500-3 3.500-5 M12 19c-2.500-1-3.500-3-3.500-5 M12 19c2.500-1 3.500-3 3.500-5', kSauce: 'M10 3h4v3l1.500 2.500V20a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1V8.500L10 6z M8.500 12.500h7', kMilk: 'M8 3h8v3l2 3v12H6V9l2-3z M6 9h12 M10 14h4', kDrink: 'M6 4h12l-1.500 16a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1z M6.500 9h11', kBread: 'M5 11a7 4 0 0 1 14 0v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z M9 11v4 M12 10v5 M15 11v4', kFast: 'M4 11a8 5 0 0 1 16 0z M4 14h16 M5 17h14a1 1 0 0 1-1 2H6a1 1 0 0 1-1-2',
    mlSun: 'M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8z M12 2v2 M12 20v2 M4.900 4.900l1.400 1.400 M17.700 17.700l1.400 1.400 M2 12h2 M20 12h2 M4.900 19.100l1.400-1.400 M17.700 6.300l1.400-1.400', mlBowl: 'M3 11h18a9 9 0 0 1-18 0z M8 7c0-1 1-1 1-2 M12 7c0-1 1-1 1-2 M16 7c0-1 1-1 1-2', mlMoon: 'M20 14.500A8 8 0 1 1 9.500 4a6.500 6.500 0 0 0 10.500 10.500z', mlSnack: 'M12 7c-2.200-2-6.500-1.500-7 2.500C4.500 13 6.800 19.500 10 20c1 .200 1.500-.500 2-.500s1 .700 2 .500c3.200-.500 5.500-7 5-10.500C18.500 5.500 14.200 5 12 7z M12 7c0-2 1-3.500 3-4', trash: 'M4 7h16 M10 11v6 M14 11v6 M6 7l1 13h10l1-13 M9 7V4h6v3',
    mic: 'M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3z M5 11a7 7 0 0 0 14 0 M12 18v3 M9 21h6', kSalat: 'M3 12h18a9 9 0 0 1-18 0z M8 12c0-3 2-5 4-6 M12 12c0-2 1-4 3-5 M15.500 12c0-1.500 1-3 2.500-3.500', kShorva: 'M3 11h18a9 9 0 0 1-18 0z M9 7.500c-1-1 1-2 0-3.500 M13 7.500c-1-1 1-2 0-3.500 M17 7.500c-1-1 1-2 0-3.500', kGosht: 'M14.500 4a5.500 5.500 0 0 1 5.500 5.500c0 3.500-3.500 5.500-6.500 5.500l-2.500 2.500a2.200 2.200 0 1 1-3 3 2.200 2.200 0 1 1-3-3 2.200 2.200 0 1 1 3-3L10.500 12c0-3.500 1.500-8 4-8z', kZakuska: 'M3 15h18a9 4 0 0 1-18 0z M12 4v7 M9.500 4v3.500a2.500 2.500 0 0 0 5 0V4', kDesert: 'M4 20h16 M5 20v-7h14v7 M5 15.500c2.300 1.200 4.700 1.200 7 0s4.700-1.200 7 0 M12 13V9.500 M12 7v.01', chat: 'M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-5 4v-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z', img: 'M4 5h16v14H4z M4 16l5-5 4 4 3-3 4 4 M9 9.500h.01', cam: 'M4 8h3l2-3h6l2 3h3v11H4z M12 16.500a3.500 3.500 0 1 0 0-7 3.500 3.500 0 0 0 0 7z', pill: 'M10.500 3.500l10 10a4.200 4.200 0 0 1-6 6l-10-10a4.200 4.200 0 0 1 6-6z M8 9l6 6',
    sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z M12 2v2 M12 20v2 M2 12h2 M20 12h2 M4.900 4.900l1.400 1.400 M17.700 17.700l1.400 1.400 M4.900 19.100l1.400-1.400 M17.700 6.300l1.400-1.400', leaf: 'M5 19c0-8 5-13 14-14 0 9-5 14-13 14 M5 19c2-4 5-7 9-9', bolt: 'M13 3L5 13h6l-1 8 8-10h-6z',
    bone: 'M7 8.500a2.500 2.500 0 1 1 3.500-3L16 11l.5.500a2.500 2.500 0 1 1 3 3.500L13 20a2.500 2.500 0 1 1-3-3.500z', muscle: 'M5 15c0-4 3-7 7-7 2 0 3 1 3 3 0 1.500-1 2-2 2.500 3 0 5 1.500 5 4v1H8c-2 0-3-1.500-3-3.500z', book: 'M4 5h7a3 3 0 0 1 3 3v11a3 3 0 0 0-3-3H4z M20 5h-3a3 3 0 0 0-3 3v11a3 3 0 0 1 3-3h3z',
    cloud: 'M7 18h10a4 4 0 0 0 .5-7.970A6 6 0 0 0 6.100 9.100 4.500 4.500 0 0 0 7 18z',
    cal2: 'M7 5h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3z M8 3v4 M16 3v4 M4 10h16', trash: 'M5 7h14 M9 7V4h6v3 M7 7l1 13h8l1-13', warn: 'M12 3l10 18H2z M12 10v5 M12 18h.01'
  });
  var Y = window.KalkiYeymizUI, R = window.KalkiRetseptUI, IN = window.KalkiIntroUI, KD = window.KalkiDemo || { on: false, mark: function () {} }, G = window.KalkiFitGaplar, masofa = null, masofaState = 0, supp = null, suppState = 0;
  /* ---------- O'RNIGA (oqsilga boy o'rinbosar) va «Oqsil manbalari» ---------- */
  var OR = window.KalkiOrinbosar, orState = 0, orTable = null, orTags = null, orBy = null, orWait = [];
  function loadOr(cb) {
    if (!OR) return; if (orState === 2) { if (cb) cb(); return; } if (cb) orWait.push(cb); if (orState === 1) return; orState = 1;
    var left = Y ? 3 : 2, done = function () { if (--left) return; orState = 2; var w = orWait; orWait = []; w.forEach(function (f) { f(); }); }, fail = function () { orState = 0; orWait = []; };
    loadJson('/data/orinbosar.json', function (j) { orTable = j; done(); }, fail); loadJson('/data/oqsil-manba.json', function (j) { orTags = j; done(); }, fail); if (Y) Y.load(done);
  }
  function orIndex() { if (!orBy || orBy.__db !== db) { orBy = OR.index(db || []); orBy.__db = db; } return orBy; }
  function orKeyOf(f, vr) { if (!f) return null; var id = f.al ? f.al.f : f.id; var v = f.al ? f.al.v : vr; return v ? id + '#' + v : id; }
  function orSrc(o) {                                  // joriy taom + porsiya: { key, sp } (qoida: assets/orinbosar-core.js); karta ko'rinmasligi kerak bo'lsa null
    if (!OR || orState !== 2 || !db || prefs().orin === false || fd.mode !== 'portion' || fd.editId != null || fd.obFrom || !o.food || o.food.custom || o.base) return null;
    var key = o.fam ? o.fam.id + '#' + o.food.vr : o.food.id, by = orIndex(), sv = OR.valuesOf(by, key); if (!sv || !orTable.manba[sv.id]) return null;
    if (OR.tegOf(orTags, key) !== 'qizil' && !(sv.f >= 14)) return null;
    var vv = vOf(o.unit), sp = (vv || o.unit === 'g100') ? { u: null, g: pwGrams(o), n: 1 } : { u: o.unit, g: pwUg(o, o.unit), n: o.qty };
    return { key: key, sp: sp };
  }
  function orAlts(o) { var s = orSrc(o); if (!s) return []; var l = OR.alternatives(orIndex(), orTable, s.key, s.sp); return Y ? Y.filterAlts(l) : l; }       // «Yemaydiganlarim» cheklovi shu yerda qo'llanadi
  function yzRemaining() { var r = yzRemFull(); return r ? r.k : null; }          // v48: tartib bo'lsa — HOZIRGI ovqat vaqtining qolgan budjeti (kunlik qoldiq emas)
  function yzRemFull() {                            // «Nima yesam»: qolgan kkal va oqsil ({ k, p, m, lab }); tartib bo'lsa — hozirgi ovqat vaqti uchun; profil yo'q — null
    if (!st || !st.setup) return null; var t = todayStr(), pl = planNow(), x = S.dayOf(st, t) || { food: [], steps: 0 }, tot = S.sumEntries(x.food), k = S.dayBalance(st, t, tot.kcal).remaining, pg = protNow();
    var mb = mbOf(t); if (mb && mb.now && mb.meals[mb.now].left >= 100) { /* hozirgi ovqat budjeti deyarli tugagan bo'lsa — kunlik qoldiq (tavsiya ma'nosiz bo'lmasin) */ var m = mb.now, sh = protShare(tot, pg, mb), lb = T('mlD_' + m); return { k: Math.min(k, mb.meals[m].left), p: sh.m === m ? sh.part : 0, m: m, lab: lang === 'ru' ? lb.charAt(0).toUpperCase() + lb.slice(1) : lb.charAt(0).toUpperCase() + lb.slice(1) }; }
    return { k: k, p: Math.max(0, Math.round(pg.g - tot.p)) };
  }
  function ppLog(it) {                               // «Uyda» retsepti: «Yedim» — kundalikka bitta yozuv (kkal/BJU tarkibdan hisoblangan, «taxminiy»); varaq yopiladi, hazil shundan keyin ko'rinadi
    var t = todayStr(), ml = mealNow(), pa = prefs(), e = S.addFood(st, t, { fid: null, name: String(it.name).slice(0, 80), meal: ml, unit: 'porsiya', qty: it.qty, g: it.g, kcal: it.k, p: it.p, f: it.f, c: it.c, est: true, ifid: it.ifid || '', ts: nowTs() });
    var prev = pa.ppAte; pa.ppAte = (Array.isArray(prev) ? prev : []).concat([[t, it.id]]); var lim = Dt.addDays(t, -3); pa.ppAte = pa.ppAte.filter(function (z) { return z[0] >= lim; }).slice(-30);          // faqat bugun/kecha kerak (takrorlanmasin)
    kit.closeSheet(); commit(); vib(); toast(T('ppAteDone', { x: it.name }), function () { S.removeFood(st, t, e.id); pa.ppAte = (pa.ppAte || []).filter(function (z) { return !(z[0] === t && z[1] === it.id); }); commit(); }, true); jokeAfter('food', {});
  }
  /* «Nima yesam ekan?» [+]: bir bosishda 1 porsiya (qo'shish oqimidagi [+] kabi: ✓ bo'ladi, oyna ochiq qoladi, toast'da «Bekor qilish», qayta bosilsa — bekor; hazil oyna yopilgach) */
  var yzAdded = {};
  function yzAddToggle(key, nm, build) {
    var t = todayStr();
    if (yzAdded[key]) { S.removeFood(st, t, yzAdded[key]); delete yzAdded[key]; commit(); kit.hideToast(); if (Y) Y.redraw(); return; }
    var e = build(); if (!e) return; e.meal = mealNow(); if (!e.ts) e.ts = nowTs(); var it = S.addFood(st, t, e); yzAdded[key] = it.id; commit(); vib(); if (Y) Y.redraw();
    toast(T('aAdded', { x: nm }), function () { S.removeFood(st, t, it.id); delete yzAdded[key]; commit(); if (Y) Y.redraw(); }, true, 3000); afterWater(); jokeAfter('food', {});
  }
  function yzQuickRecipe(key, it) {
    yzAddToggle(key, it.name, function () { var pa = prefs(), t = todayStr(), lim = Dt.addDays(t, -3); pa.ppAte = (Array.isArray(pa.ppAte) ? pa.ppAte : []).concat([[t, it.id]]).filter(function (z) { return z[0] >= lim; }).slice(-30); return { fid: null, name: String(it.name).slice(0, 80), unit: 'porsiya', qty: 1, g: it.g, kcal: it.k, p: it.p, f: it.f, c: it.c, est: true, ifid: it.ifid || '' }; });
  }
  function yzQuickKey(key, fkey, por, half) {          // Kafeda / Buyurtma: ko'rsatilgan porsiya (yoki yarmi)
    var s = OR.split(fkey), f = foodById(s.id); if (!f) return; var b = f.al ? foodById(f.al.f) : f, o = {}; if (!prepFood(o, s.id, s.v && b && b.fam ? S.famSelOf(b, s.v) : null)) return;
    if (por) { if (por.u && o.food.u.some(function (u) { return u[0] === por.u; })) { o.unit = por.u; o.qty = por.n || 1; } else if (por.g > 0) { o.unit = 'g100'; o.qty = Math.max(10, Math.round(por.g / 10) * 10); } }
    if (half) o.qty = o.unit === 'g100' ? Math.max(10, Math.round(o.qty / 20) * 10) : o.qty / 2;
    yzAddToggle(key, nameOf(o.fam || o.food) + ' · ' + pwSumQ(o), function () { return entryOf(o); });
  }
  function ppSaveTpl(name, item) {                   // «Odatdagi ovqatlarim»ga: bitta qator (porsiya bilan)
    var t = S.addTemplate(st, name, [item], mealNow()); if (!t) { toast(T('tplFull')); return; } vib(); commit();
    toast(T('ppSaved', { x: t.name }), function () { S.removeTemplate(st, t.id); commit(); }, true);
  }
  function yzFd(key, por) {                           // taom oynasi: ko'rsatilgan porsiya (birlik + miqdor yoki gramm) oldindan tanlangan
    var s = OR.split(key), f = foodById(s.id); if (!f) return false; var b = f.al ? foodById(f.al.f) : f; pickFood(s.id, s.v && b && b.fam ? S.famSelOf(b, s.v) : null);
    if (por) { if (por.u && fd.food.u.some(function (u) { return u[0] === por.u; })) { fd.unit = por.u; fd.qty = por.n || 1; } else if (por.g > 0) { fd.unit = 'g100'; fd.qty = Math.max(10, Math.round(por.g / 10) * 10); } }
    return true;
  }
  function yzPick(key, back, por) { openAdd({}); fd.yBack = back; if (yzFd(key, por)) setSheet(portionHtml()); }                       // porsiya oynasi: Orqaga — chaqirgan oynaga (Bugun nima yeymiz? / Baliq kuni)
  function menuLog(c) {                                // «Menyudan tanlash»: kundalikka ASL menyu nomi bilan (kkal bazadan; tarkibdan yig'ilgan bo'lsa — «taxminiy»)
    var t = todayStr(), ml = mealNow();
    var e = S.addFood(st, t, { fid: null, name: String(c.asl || c.nom).slice(0, 80), meal: ml, unit: null, qty: 1, g: c.g || 0, kcal: Math.round(c.k), p: c.p || 0, f: c.f || 0, c: c.c || 0, est: !!c.est, ifid: c.ifid || '', ikat: c.bolim || '', src: 'menyu', ts: Date.now() });
    aiFEnd(true); kit.closeSheet(); commit(); vib(); stEv('ovqat_qoshildi', 'menyu'); toast(T('yzMeal_' + ml), function () { S.removeFood(st, t, e.id); commit(); }, true); jokeAfter('food');
  }
  function yzLog(key, por) { var ml = mealNow(); fd = { saveMsg: T('yzMeal_' + ml), date: todayStr(), meal: ml, mode: 'search', q: '', food: null, unit: null, qty: 1, editId: null, items: [], busy: false }; if (yzFd(key, por)) fSave(); }   // bir bosishda: ko'rsatilgan porsiya bilan yoziladi (Bekor qilish tugmasi bilan)
  function nativeBack() {                            // Android «Orqaga» (KalkiNative.back): oyna → ichki qadam orqaga / yopish; slayd, yo'l-yo'riq — yopiladi; boshqa bo'lim → Bugun; Bugun → 'home' (ilova ikki bosishda chiqadi)
    if (HK) { HK.close(); return 'overlay'; }
    if (AF && AF.isOpen()) { AF.close(); return 'overlay'; }          // v54: «Afsona yoki haqiqat?»          // «Haftangiz» hikoyasi
    if (closeFeats()) return 'overlay';                // «Imkoniyatlar» chap paneli
    if (Y && Y.backStep && Y.backStep()) return 'step';          // «Nima yesam ekan?»: retsept sahifasi / «Uyda nima bor?» → ro'yxat
    if (IN && IN.isOpen && IN.isOpen()) { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); return 'overlay'; }
    if (kit.tipsOn()) { kit.tipsEnd(); return 'overlay'; }
    var yg = $('#ygOk'); if (yg) { yg.click(); return 'overlay'; }
    var mm2 = $('#kqMM'); if (mm2 && !mm2.hidden) { mealMenu(false); return 'step'; }
    if (kit.sheetKind() === 'add' && fd && !fd.yBack && fd.editId == null) { if (fd.mode === 'portion' || fd.mode === 'custom' || fd.mode === 'tpl') { backToSearch(); return 'step'; } if (fd.mode === 'search' && fd.q.trim()) { fd.q = ''; var qi = $('#fdQ'); if (qi) { qi.value = ''; qi.blur(); } refreshRes(); return 'step'; } }          // porsiya → qidiruv; natijalar → 1-ekran
    var sh = $('#rzSheet'); if (sh && !sh.hidden && kit.sheetKind()) { var b = sh.querySelector('.rz-sh-h > .rz-x:first-child:not([data-act=sheetclose]), .sl-yh > .sl-x'); if (b) { b.click(); return 'step'; } kit.closeSheet(); return 'sheet'; }
    var ob = $('#rzOnb'); if (ob && !ob.hidden) { var bb = ob.querySelector('[data-act=obback]'); if (bb) { bb.click(); return 'onb'; } return 'home'; }
    if (view !== 'today') { var tb = $('[data-act=tab][data-v=today]'); if (tb) { tb.click(); return 'tab'; } }
    return 'home';
  }
  function openExternal(url) { try { if (window.KalkiNative && KalkiNative.openUrl(url)) return true; var C = window.Capacitor; if (C && C.Plugins && C.Plugins.Browser && C.Plugins.Browser.open) { C.Plugins.Browser.open({ url: url }); return true; } if (window.cordova && window.cordova.InAppBrowser) { window.cordova.InAppBrowser.open(url, '_system'); return true; } } catch (e) {} return false; }      // APK (Capacitor/Cordova): tashqi brauzerda; veb/TWA: havolaning o'zi target=_blank rel=noopener
  function orFishKey(f, o) { if (!OR || orState !== 2 || !f) return false; var key = orKeyOf(f, o && o.fam ? f.vr : null); return OR.tegOf(orTags, key) === 'baliq'; }
  function orName(a) { var f = foodById(a.id); if (!f) return a.id; var lb = a.v && f.fam ? S.famLabel(f, a.v, null, lang) : ''; return nameOf(f) + (lb ? ' · ' + lb : ''); }
  function orSign(x) { return (x > 0 ? '+' : '−') + Math.abs(Math.round(x)); }
  function orDesc(a) {                                // faktik, baholamasdan: «oqsil +9 g, yog' −12 g» (|oqsil farqi| < 2 g bo'lsa «deyarli bir xil»)
    var parts = [OR.deyarli(a.dp) ? T('orP_same') : T(a.dp > 0 ? 'orP_up' : 'orP_down', { x: Math.abs(Math.round(a.dp)) })];
    if (Math.abs(a.df) >= 3) parts.push(T('orF', { x: orSign(a.df) })); else parts.push(T('orK', { x: orSign(a.dk) }));
    return parts.join(', ');
  }
  function orCardHtml() {
    var o = fd, l = orAlts(o); if (!l.length) return ''; if (Y && !fd.orSeen) { fd.orSeen = true; Y.count('orinbosar_korsatildi'); }
    var row = function (a, i, main) { return '<button type="button" class="sl-or-b' + (main ? ' main' : '') + '" data-act="orgo" data-i="' + i + '" aria-label="' + esc(T('orLine', { n: orName(a), d: orDesc(a) })) + '"><span class="m">' + (main ? '<small>' + esc(T('orLine', { n: '', d: '' }).replace(/\s*—\s*$/, '')) + '</small>' : '') + '<b>' + esc(orName(a)) + '</b><span>' + esc(orDesc(a)) + '</span></span>' + ico('chev', 'r') + '</button>'; };
    return '<div class="sl-or" id="orCard">' + row(l[0], 0, true) + (Y ? Y.varBtn() : (l.length > 1 ? '<button type="button" class="sl-txtbtn" data-act="ormore" aria-expanded="' + !!fd.orMore + '">' + esc(T(fd.orMore ? 'orLess' : 'orMore')) + '</button><div class="sl-or-more"' + (fd.orMore ? '' : ' hidden') + '>' + l.slice(1).map(function (a, i) { return row(a, i + 1, false); }).join('') + '</div>' : '')) + '</div>';
  }
  function orRefresh() { var b = $('#orBox'); if (b) b.innerHTML = orCardHtml(); }
  function orApply(a) {                              // o'rinbosarni tanlash: xuddi shu porsiya bilan portion oynasi (shu oynada, Orqaga yo'q)
    var meal = fd.meal, date = fd.date, f = foodById(a.id); if (!f) return;
    pickFood(a.id, a.v && f.fam ? S.famSelOf(f, a.v) : null);
    if (a.u && fd.food.u.some(function (u) { return u[0] === a.u; })) { fd.unit = a.u; fd.qty = a.n; } else { fd.unit = 'g100'; fd.qty = Math.max(10, Math.round(a.g / 10) * 10); }
    fd.meal = meal; fd.date = date; fd.obFrom = 1; setSheet(portionHtml());
  }
  function orGo(i) { var l = orAlts(fd), a = l[i]; if (!a) return; if (Y) Y.count('orinbosar_tanlandi'); orApply(a); }
  /* ---------- «BALIQ KUNI» eslatmasi (Web Push) ---------- */
  var PS = { state: 0, on: false, key: null, wait: [] };
  /* Android ilovasi ichida (KalkiNative): Web Push o'rniga LOKAL haftalik bildirishnoma (tanlangan kun, 11:00; server kerak emas) */
  var NAT = window.KalkiNative && KalkiNative.isApp() && KalkiNative.notif.ok() ? KalkiNative : null, NS = { perm: 'prompt' };
  function natTr(x) { return isCyr() && window.KalkiTranslit ? KalkiTranslit.translit(String(x).replace(/[‘’ʻ`´]/g, "'")) : x; }
  function natOpts() { return { day: Y ? Y.kunBugun() : 3, hour: 11, title: 'KalkiFit', body: natTr(T('bkMsg')), url: (lang === 'ru' ? '/ru/kalkifit' : '/kalkifit') + '?baliq=1' }; }
  function natResched() { if (!NAT) return; var q = prefs().push; if (!q || !q.local) return; if (prefs().baliqOff || (Y && Y.avoids('baliq'))) { NAT.notif.disable(); return; } NAT.notif.schedule(natOpts()).catch(function () {}); }
  function loadPush(cb) {
    if (PS.state === 2) { if (cb) cb(); return; } if (cb) PS.wait.push(cb); if (PS.state === 1) return; PS.state = 1;
    var fin = function () { PS.state = 2; var w = PS.wait; PS.wait = []; w.forEach(function (f) { f(); }); };
    loadJson('/api/push/kalit', function (j) { PS.on = !!(j && j.yoqilgan && j.kalit); PS.key = j && j.kalit || null; fin(); }, function () { PS.on = false; fin(); });
  }
  function pushSupported() { return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window; }
  function isIOS() { return /iPad|iPhone|iPod/.test(navigator.userAgent || '') || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); }
  function standalone() { return (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true; }
  function appDays() { if (/\.pages\.dev$/.test(location.hostname)) { if (/[?&]pushtest=1\b/.test(location.search) && !prefs().pushTest) { prefs().pushTest = true; save(); } return 99; } return st && st.created ? Math.floor((Date.now() - st.created) / DAY_MS) : 0; }          // FAQAT *.pages.dev preview'da: 3-kun sharti o'chiq (sinash oson; ?pushtest=1 bayrog'i ham yoziladi). kalki.uz'da e'tiborsiz
  function pushStatus() {                              // 'na' (server/brauzer qo'llamaydi) | 'ios' (avval Bosh ekran) | 'denied' | 'on' | 'off'
    if (NAT) { if (NS.perm === 'denied') return 'denied'; var q0 = prefs().push; return q0 && q0.on && q0.local ? 'on' : 'off'; }
    if (PS.state !== 2 || !PS.on) return 'na'; if (isIOS() && !standalone()) return 'ios'; if (!pushSupported()) return 'na';
    if (Notification.permission === 'denied') return 'denied'; var p = prefs().push; return p && p.on ? 'on' : 'off';
  }
  function urlB64(k) { var pad = '='.repeat((4 - k.length % 4) % 4), b = atob((k + pad).replace(/-/g, '+').replace(/_/g, '/')), o = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) o[i] = b.charCodeAt(i); return o; }
  function pushPost(sub) { return fetch('/api/push/obuna', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ obuna: sub.toJSON(), til: isCyr() ? 'cyr' : lang, baliqsiz: !!(Y && Y.avoids('baliq')), kun: Y ? Y.kunBugun() : 3, hafta: hwOn() }) }).then(function (r) { if (!r.ok) throw new Error('push ' + r.status); return r; }); }
  function pushEnable() {                              // FAQAT foydalanuvchi bosganda (ruxsat so'rash bosishga bog'langan)
    var fail = function () { toast(T('bkErr')); };
    if (NAT) { NAT.notif.enable(natOpts()).then(function (r) { if (r === 'on') { stEv('baliq_kuni_obuna'); NS.perm = 'granted'; prefs().push = { on: true, local: true, t: Date.now() }; delete prefs().pushNo; commit(); toast(T('bkDone')); } else { if (r === 'denied') NS.perm = 'denied'; prefs().pushNo = Date.now(); commit(); } }).catch(fail); return; }
    Notification.requestPermission().then(function (perm) {
      if (perm !== 'granted') { prefs().pushNo = Date.now(); commit(); return; }
      return navigator.serviceWorker.ready.then(function (reg) { return reg.pushManager.getSubscription().then(function (s) { return s || reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64(PS.key) }); }); })
        .then(function (sub) { return pushPost(sub).then(function () { stEv('baliq_kuni_obuna'); prefs().push = { on: true, ep: sub.endpoint, t: Date.now() }; delete prefs().pushNo; commit(); toast(T('bkDone')); }); });
    }).catch(fail);
  }
  function pushDisable() { stEv('baliq_kuni_bekor');
    if (NAT || (prefs().push && prefs().push.local)) { if (NAT) NAT.notif.disable(); prefs().push = null; commit(); toast(T('bkDoneOff')); return; }
    var ep = prefs().push && prefs().push.ep; prefs().push = null; commit(); toast(T('bkDoneOff'));
    if (!pushSupported()) return; navigator.serviceWorker.ready.then(function (reg) { return reg.pushManager.getSubscription(); }).then(function (sub) { if (!sub) return; ep = sub.endpoint; return sub.unsubscribe(); })
      .then(function () { if (ep) return fetch('/api/push/ochir', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: ep }) }); }).catch(function () {});
  }
  function pushSync() {                                // yoqilgan bo'lsa: haftada bir marta serverdagi obuna (til, akkaunt ulanishi) yangilanadi; brauzerda obuna yo'qolgan bo'lsa — o'chirilgan deb belgilanadi
    var p = prefs().push; if (p && p.local) return; if (!p || !p.on || !pushSupported() || Date.now() - (p.sync || 0) < 7 * DAY_MS) return; p.sync = Date.now();
    navigator.serviceWorker.ready.then(function (reg) { return reg.pushManager.getSubscription(); }).then(function (sub) { if (!sub) { prefs().push = null; commit(); return; } return pushPost(sub).then(function () { save(); }); }).catch(function () {});
  }
  function pushResync() {                              // «Baliq yoqtirmayman» / «Boshqa kun» o'zgarsa: serverdagi obuna belgisi darrov yangilanadi (jim; xato bo'lsa haftalik sinxron tuzatadi)
    if (NAT) { natResched(); return; }
    var p = prefs().push; if (!p || !p.on || !pushSupported()) return; p.sync = 0;
    navigator.serviceWorker.ready.then(function (reg) { return reg.pushManager.getSubscription(); }).then(function (sub) { if (sub) return pushPost(sub); }).catch(function () {});
  }
  function pushAskDue() { var no = prefs().pushNo; return !(no && Date.now() - no < 30 * DAY_MS); }
  function swHtml(on, act, label, off, extra) { return '<button type="button" class="sl-sw' + (on ? ' on' : '') + '" role="switch" aria-checked="' + !!on + '" aria-label="' + esc(label) + '" data-act="' + act + '"' + (extra || '') + (off ? ' disabled aria-disabled="true"' : '') + '><i aria-hidden="true"></i></button>'; }
  function pushRowHtml(card) {                             // Profil → Eslatmalar: «🐟 Baliq kuni» qatori — o'ngda kun («Pay») va switch; qator bosilsa — kun tanlash oynasi
    var s0 = NAT || PS.state === 2 ? pushStatus() : 'load', on = s0 === 'on', can = s0 === 'on' || s0 === 'off';
    var line = { ios: 'bkIos2', denied: NAT ? 'bkDen3' : 'bkDen2', na: 'bkNA2' }[s0];          // faqat muammo bo'lsa — qator ostida qisqa izoh
    return '<div class="sl-remr" id="pushRow"><button type="button" class="sl-remm" data-act="fwdaysheet"><span class="ic" aria-hidden="true">🐟</span><span class="t"><b class="sl-bkT">' + esc(T('bkT2')) + '</b>' + (line ? '<small class="sl-bkL">' + esc(T(line)) + '</small>' : '') + '</span><span class="v" id="pushDay">' + esc(Y ? Y.kunQisqa() : '') + '</span>' + ico('chev', 'r') + '</button>' + swHtml(on, !can ? 'pushna' : (on ? 'pushoff' : 'pushon'), T('bkT2'), !can) + '</div>';
  }
  function pushOfferHtml() {                           // Kun yakuni: BITTA taklif; «Hozir emas» — 30 kun so'ramaydi
    if (appDays() < 3 || !pushAskDue()) return ''; var s0 = pushStatus(); if (s0 !== 'off' && s0 !== 'ios') return '';
    return '<section class="rz-card sl-poff" id="pushOffer"><b>' + esc(T('bkAsk')) + '</b><p class="rz-p sm">' + esc(T(s0 === 'ios' ? 'bkIos' : 'bkAskH')) + '</p><div class="rz-actions">' + (s0 === 'ios' ? '' : '<button type="button" class="rz-btn ghost sm" data-act="pushno">' + esc(T('bkNo')) + '</button><button type="button" class="rz-btn primary sm" data-act="pushon">' + esc(T('bkOn')) + '</button>') + (s0 === 'ios' ? '<button type="button" class="rz-btn primary sm" data-act="pushno">' + esc(T('bkOk')) + '</button>' : '') + '</div></section>';
  }
  function fishDay(t) { return !!(Y && st.setup && S.weekdayIdx(t) === Y.kunBugun() && !prefs().baliqOff && !Y.avoids('baliq')); }     // tanlangan kun (tanlanmagan bo'lsa payshanba); «Baliq yoqtirmayman» / Yemaydiganlarim → yo'q
  var FISH_SVG = '<svg viewBox="0 0 48 28" aria-hidden="true"><path d="M3 14c5-8 13-11 21-11 8 0 13 5 16 11-3 6-8 11-16 11C16 25 8 22 3 14z" fill="currentColor"/><path d="M38 14l9-8v16z" fill="currentColor" opacity=".8"/><circle cx="12" cy="12" r="2" fill="var(--bg,#fff)"/><path d="M20 8c2 3 2 9 0 12" stroke="var(--bg,#fff)" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".55"/></svg>';
  function fishChipHtml(t) { return fishDay(t) ? '<button type="button" class="sl-fishchip' + (fishSwimOn ? ' sw' : '') + '" id="fishChip" data-act="baliqgo"><span aria-hidden="true">🐟</span>' + esc(T('fcT')) + '<i aria-hidden="true">›</i></button>' : ''; }
  var fishSwimOn = false;
  function infoTitle(title, text, attrs) { return '<div class="rz-st sl-sti"' + (attrs || '') + '><span>' + esc(title) + '</span><button type="button" class="sl-infob" data-cyr="skip" data-act="ibtog" aria-expanded="false" aria-label="ⓘ ' + esc(title) + '">i</button></div><p class="sl-ibx" hidden>' + esc(text) + '</p>'; }      // Profil: bo'lim sarlavhasi + «ⓘ» (izoh bosilganda ochiladi)
  function fishSwim(t) {                               // baliq kuni: ekran tepasidan BIR MARTA (kuniga) suzib o'tadi va chipga aylanadi; faqat transform/opacity; reduced-motion — faqat chip
    if (!fishDay(t) || prefs().fishSwim === t || fishSwimOn) return; prefs().fishSwim = t; save();
    var chip = $('#fishChip'); if (reduce || !chip || !document.body.animate) return;
    fishSwimOn = true; chip.classList.add('sw');
    setTimeout(function () {
      var c = $('#fishChip'); if (!c || view !== 'today') { fishSwimOn = false; if (c) c.classList.remove('sw'); return; }
      var r = c.getBoundingClientRect(), vw = window.innerWidth, f = document.createElement('div'); f.className = 'sl-fishswim'; f.innerHTML = FISH_SVG; (document.querySelector('.rz.sl') || document.body).appendChild(f);
      var x0 = vw + 20, x1 = r.left + 2, y = Math.max(8, r.top - 46), ks = [], n = 8;
      for (var i = 0; i <= n; i++) { var k = i / n, e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, yy = i === n ? r.top + (r.height - 20) / 2 : y + Math.sin(k * Math.PI * 3) * 10 + k * k * (r.top - y); ks.push({ transform: 'translate(' + Math.round(x0 + (x1 - x0) * e) + 'px,' + Math.round(yy) + 'px) rotate(' + (i === n ? 0 : Math.round(Math.cos(k * Math.PI * 3) * -9)) + 'deg) scale(' + (i === n ? .62 : 1) + ')', opacity: i === 0 ? 0 : 1, offset: k }); }
      var a = f.animate(ks, { duration: 2500, easing: 'linear', fill: 'forwards' });
      var done = function () { var c2 = $('#fishChip'); if (c2) c2.classList.remove('sw'); f.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, fill: 'forwards' }).onfinish = function () { if (f.parentNode) f.parentNode.removeChild(f); }; fishSwimOn = false; };
      a.onfinish = done; a.oncancel = done;
    }, document.getElementById('kfSplash') ? 1000 : 400);
  }
  function pendingFish() {                              // eslatma bosilganda sw.js belgi qoldiradi (iOS'da openWindow manzili e'tiborsiz qolishi mumkin): ilova ochilganda/qaytganda 10 daqiqa ichida bo'lsa — Baliq guruhi
    if (!st || !st.setup || !window.caches) return;
    caches.open('kalkifit-pending').then(function (c) { return c.match('/__pending/baliq').then(function (r) { if (!r) return; return c.delete('/__pending/baliq').then(function () { return r.text(); }).then(function (t) { if (Date.now() - (+t || 0) < 600000) openFish(); }); }); }).catch(function () {});
    caches.open('kalkifit-pending').then(function (c) { return c.match('/__pending/hafta').then(function (r) { if (!r) return; return c.delete('/__pending/hafta').then(function () { return r.text(); }).then(function (t) { if (Date.now() - (+t || 0) < 600000) openWeek(); }); }); }).catch(function () {});          // «Haftalik xulosa» eslatmasi
  }
  function openFish() { if (Y) { if (kit.sheetKind() !== 'fish') Y.openFish(); return; } openAdd(); }
  var ORB_TAGS = ['qizil', 'tovuq', 'baliq', 'sut', 'dukkak'];
  function orbStats() {                                // oxirgi 7 kun (bugun bilan): oqsil grammi manba bo'yicha, baliq marta, yozilgan kunlar
    var t = todayStr(), by = orIndex(), g = { qizil: 0, tovuq: 0, baliq: 0, sut: 0, dukkak: 0 }, fish = 0, days = 0, tot = 0;
    for (var i = 0; i < 7; i++) {
      var x = S.dayOf(st, Dt.addDays(t, -i)); if (!x || !x.food.length) continue; days++;
      x.food.forEach(function (e) {
        if (!e.fid) return; var f = foodById(e.fid); if (!f) return; var key = orKeyOf(f, e.vr), tg = OR.tegOf(orTags, key); if (tg === 'tuxum') tg = 'sut';
        if (g[tg] == null) return; g[tg] += e.p || 0; tot += e.p || 0; if (tg === 'baliq') fish++;
      });
    }
    return { g: g, fish: fish, days: days, tot: tot };
  }
  function orbHtml() {                                // «Oqsil manbalari»: bitta gorizontal ustma-ust chiziq + bitta faktik gap (Natijalar, Kun yakuni)
    if (!OR) return ''; if (orState !== 2) { loadOr(function () { if ((view === 'history' || view === 'today') && !kit.sheetKind()) render(); }); return ''; } if (!db) { loadDb(function () { if ((view === 'history' || view === 'today') && !kit.sheetKind()) render(); }); return ''; }
    var s0 = orbStats(); if (s0.days < 3 || s0.tot < 1) return '<section class="rz-card sl-orb"><div class="rz-st">' + esc(T('orbT')) + '</div><p class="rz-p sm">' + esc(T('orbEmpty')) + '</p></section>';
    var top = ORB_TAGS.slice().sort(function (a, b) { return s0.g[b] - s0.g[a]; })[0], pc = {}, sum = 0; ORB_TAGS.forEach(function (k) { pc[k] = Math.round(s0.g[k] / s0.tot * 100); sum += pc[k]; });
    var bar = ORB_TAGS.filter(function (k) { return s0.g[k] > 0; }).map(function (k) { return '<i class="orb-' + k + '" style="flex-grow:' + s0.g[k].toFixed(1) + '"></i>'; }).join('');
    var leg = ORB_TAGS.map(function (k) { return '<li><i class="orb-' + k + '" aria-hidden="true"></i>' + esc(T('orb_' + k)) + ' <b>' + pc[k] + '%</b></li>'; }).join('');
    var times = T('orbTimes', { n: s0.fish }); if (lang === 'ru') times = s0.fish + ' ' + ((s0.fish % 10 === 1 && s0.fish % 100 !== 11) ? 'раз' : (s0.fish % 10 >= 2 && s0.fish % 10 <= 4 && (s0.fish % 100 < 10 || s0.fish % 100 >= 20) ? 'раза' : 'раз'));
    var fj = s0.fish === 0 && G && G.pickLine && prefs().jokes !== false && hazilState === 2 ? G.pickLine(jokeCtx(false), 'fish_none_week', {}, 'fishweek') : null; if (fj) saveQuiet();
    return '<section class="rz-card sl-orb"><div class="rz-st">' + esc(T('orbT')) + '</div><div class="orb-bar" role="img" aria-label="' + esc(T('orbAria', { x: ORB_TAGS.map(function (k) { return T('orb_' + k) + ' ' + pc[k] + '%'; }).join(', ') })) + '">' + bar + '</div><ul class="orb-leg">' + leg + '</ul><p class="rz-p sl-fact">' + esc(T('orbSent', { x: pc[top], s: T('orbA_' + top), n: times })) + '</p>' + (fj ? '<p class="rz-p sm">' + esc(fj.text) + '</p>' : '') + '</section>';
  }
  function loadJson(url, ok, fail) { fetch(url).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(ok).catch(fail || function () {}); }
  var hz = null;                                    // hazil tanlovi holati (oxirgi variantlar, kunlik hisoblagich) — foydalanuvchi ma'lumoti EMAS: alohida kalit, zaxira/bulut/eksportga kirmaydi
  function hazilStore() { if (!hz) { try { hz = JSON.parse(localStorage.getItem('kalki_fit_hazil') || '{}') || {}; } catch (e) { hz = {}; } } return hz; }
  function saveQuiet() { try { localStorage.setItem('kalki_fit_hazil', JSON.stringify(hz || {})); } catch (e) {} }
  var hazilState = 0;
  var hzFail = false;
  function loadHazil() { if (!G || !G.setTexts || hazilState) return; hazilState = 1; loadJson('/data/hazillar.json', function (j) { G.setTexts(j); hazilState = 2; if ((view === 'today' || view === 'history') && !kit.sheetKind()) render(); }, function () { hazilState = 0; hzFail = true; if (view === 'today' && !kit.sheetKind()) render(); }); }
  function loadMasofa() { if (masofaState) return; masofaState = 1; loadJson('/data/masofalar.json', function (j) { masofa = j; masofaState = 2; if ((view === 'today' || view === 'history') && !kit.sheetKind()) render(); }, function () { masofaState = 0; }); }
  function loadSupp(cb) { if (suppState === 2) { cb(); return; } if (suppState === 1) return; suppState = 1; loadJson('/data/qoshimchalar.json', function (j) { j.items.forEach(function (it) { if (it.ev && it.ev.length) it.level = topLevel(it.ev); }); supp = j; suppState = 2; cb(); }, function () { suppState = 0; cb(true); }); }
  function jokeCtx(fresh) { var t = todayStr(); return { fresh: !!fresh, store: hazilStore(), S: S, st: st, today: t, lang: lang, hour: new Date().getHours(), masofa: masofa, city: prefs().city || 'toshkent', foods: db, jokesOn: prefs().jokes !== false, fishDay: fishDay(t) }; }
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
    return '<div class="rz-sh-h sl-ph"><button type="button" class="rz-x" data-act="yback" aria-label="' + esc(T('back')) + '">' + ico('back') + '</button><b>' + esc(nameOf(f)) + '</b><button type="button" class="rz-x" data-act="sheetclose" aria-label="' + esc(T('close')) + '">' + ico('x') + '</button></div><div class="rz-chips">' + f.u.map(function (u) { return '<button type="button" class="rz-chip' + (yd.unit === u[0] ? ' on' : '') + '" data-act="yunit" data-u="' + u[0] + '" aria-pressed="' + (yd.unit === u[0]) + '">' + esc(unitLabel(f, u[0])) + '</button>'; }).join('') + '</div>' +
      '<div class="sl-qty"><button type="button" data-act="yqty" data-s="-1" aria-label="' + esc(T('qtyMinus')) + '">' + ico('minus', '', 2.4) + '</button><b id="ydQty">' + qtyStr(yd.qty) + (yd.unit === 'g100' ? ' ' + T('gram') : '') + '</b><button type="button" data-act="yqty" data-s="1" aria-label="' + esc(T('qtyPlus')) + '">' + ico('plus', '', 2.4) + '</button></div><div id="ydOut" aria-live="polite">' + yOutHtml() + '</div><p class="rz-p sm">' + esc(T('yNoSave')) + '</p>';
  }
  function yOutHtml() {
    var f = yd.food, g = yGrams(), pt = S.portion(f, g), t = todayStr(), pl = planNow(), x = S.dayOf(st, t) || { food: [], steps: 0 }, tot = S.sumEntries(x.food), bal = S.dayBalance(st, t, tot.kcal);
    var after = bal.remaining - pt.kcal, min = S.minutesToBurn(pt.kcal, S.currentWeight(st)), steps = Math.round(min / 60 * 5000 / S.strideM(num(st.profile.height)));
    var item = nameOf(f) + ' (' + (yd.unit === 'g100' ? amtG(g, f) : qtyStr(yd.qty) + ' ' + unitName(yd.unit)) + ')';
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
    var h = shBack(rc.id ? T('rcEdit') : T('rcT'), 'data-act="rcmine"') + '<p class="rz-p sm">' + esc(T('rcMineH')) + '</p><label class="rz-f" for="rcName"><span>' + esc(T('rcName')) + '</span><input id="rcName" type="text" maxlength="60" placeholder="' + esc(T('rcNamePh')) + '" value="' + esc(rc.name) + '"></label>' +
      '<div class="rz-fl">' + esc(T('rcIng')) + '</div>' + (rc.ings.length ? rc.ings.map(function (i, k) { var kc = Math.round(i.k * i.g / 100); return '<div class="sl-ti"><span class="m"><span class="nm">' + esc(rcIngName(i)) + '</span><span class="tm">' + fmt(i.g) + ' ' + T('gram') + '</span></span><b>' + fmt(kc) + '<small> ' + T('kcal') + '</small></b><button type="button" class="rz-x" data-act="rcdel" data-i="' + k + '" aria-label="' + esc(T('del')) + '">' + ico('x') + '</button></div>'; }).join('') : '<div class="rz-mut">' + esc(T('rcNoIng')) + '</div>') +
      '<button type="button" class="rz-btn ghost full" data-act="rcadd">' + esc(T('rcAdd')) + '</button>' +
      '<div class="rz-fl" style="margin-top:12px">' + esc(T('rcPortions')) + '</div><div class="sl-qty"><button type="button" data-act="rcport" data-s="-1" aria-label="' + esc(T('qtyMinus')) + '">' + ico('minus', '', 2.4) + '</button><b id="rcPN">' + rc.portions + '</b><button type="button" data-act="rcport" data-s="1" aria-label="' + esc(T('qtyPlus')) + '">' + ico('plus', '', 2.4) + '</button></div>' +
      '<div id="rcOut" aria-live="polite">' + rcOutHtml() + '</div><div class="rz-actions">' + (rc.id ? '<button type="button" class="rz-btn ghost danger" data-act="rcremove">' + esc(T('del')) + '</button>' : '') + '<button type="button" class="rz-btn primary" id="rcSave" data-act="rcsave">' + esc(T('rcSave')) + '</button></div>';
    return h;
  }
  function rcSearchHtml() {
    return '<div class="rz-sh-h sl-ph"><button type="button" class="rz-x" data-act="rcback" aria-label="' + esc(T('back')) + '">' + ico('back') + '</button><b>' + esc(T('rcPickIng')) + '</b><button type="button" class="rz-x" data-act="sheetclose" aria-label="' + esc(T('close')) + '">' + ico('x') + '</button></div><div class="sl-search">' + ico('search') + '<input id="rcQ" type="text" inputmode="search" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="' + esc(T('rcQ')) + '" value="' + esc(rc.q) + '" aria-label="' + esc(T('rcQ')) + '"></div><div class="sl-res" id="rcRes">' + rcResults() + '</div>';
  }
  function rcResults() {
    if (dbState !== 2) return '<div class="rz-mut">' + esc(T('aLoading')) + '</div>'; var q = rc.q.trim(), foods = (db || []), list;
    list = q ? S.search(foods, q, srchOpts(30)) : foods.filter(function (f) { return f.t !== 'q' && f.t !== 'h' && f.t !== 'i'; }).slice(0, 60);
    return list.length ? list.map(function (f) { return '<button type="button" class="sl-rr" data-act="rcpick" data-id="' + esc(f.id) + '"><span class="m"><span class="nm">' + esc(nameOf(f)) + '</span><span class="tm">' + esc(T('per100', { k: f.k })) + '</span></span>' + ico('chev', 'r') + '</button>'; }).join('') : '<div class="rz-empty"><b>' + esc(T('aNone')) + '</b></div>';
  }
  function rcGramsHtml() {
    var f = rc.pick, pt = S.portion(f, rc.g);
    return '<div class="rz-sh-h sl-ph"><button type="button" class="rz-x" data-act="rcsearch" aria-label="' + esc(T('back')) + '">' + ico('back') + '</button><b>' + esc(nameOf(f)) + '</b><button type="button" class="rz-x" data-act="sheetclose" aria-label="' + esc(T('close')) + '">' + ico('x') + '</button></div><div class="sl-kc"><b id="rcgK">' + fmt(pt.kcal) + '</b><small> ' + T('kcal') + '</small></div><div class="rz-fl">' + esc(T('rcGrams')) + '</div><div class="rz-chips">' + [50, 100, 150, 200, 250, 300, 500].map(function (g) { return '<button type="button" class="rz-chip' + (rc.g === g ? ' on' : '') + '" data-act="rcg" data-g="' + g + '">' + g + ' ' + T('gram') + '</button>'; }).join('') + f.u.filter(function (u) { return u[0] !== 'g100'; }).map(function (u) { return '<button type="button" class="rz-chip alt" data-act="rcg" data-g="' + u[1] + '">' + esc(unitLabel(f, u[0])) + '</button>'; }).join('') + '</div>' +
      '<div class="sl-qty"><button type="button" data-act="rcgq" data-s="-1" aria-label="' + esc(T('qtyMinus')) + '">' + ico('minus', '', 2.4) + '</button><b id="rcgN">' + fmt(rc.g) + ' ' + T('gram') + '</b><button type="button" data-act="rcgq" data-s="1" aria-label="' + esc(T('qtyPlus')) + '">' + ico('plus', '', 2.4) + '</button></div><div class="rz-actions"><button type="button" class="rz-btn primary" data-act="rcaddgo">' + esc(T('rcAddIng')) + '</button></div>';
  }
  function rcGUpdate() { var pt = S.portion(rc.pick, rc.g); var k = $('#rcgK'), n = $('#rcgN'); if (k) k.textContent = fmt(pt.kcal); if (n) n.textContent = fmt(rc.g) + ' ' + T('gram'); $$('[data-act=rcg]').forEach(function (b) { b.classList.toggle('on', +b.getAttribute('data-g') === rc.g && !b.classList.contains('alt')); }); }
  function rcSaveGo() {
    var nm = ($('#rcName') && $('#rcName').value || rc.name).trim(); rc.name = nm; if (!nm) { flashEl($('#rcName')); return; } if (!rc.ings.length) { flashEl($('#rcSave')); return; }
    var f = S.saveRecipe(st, { id: rc.id, name: nm, ings: rc.ings, portions: rc.portions }); if (!f) return; kit.closeSheet(); commit(); vib(); toast(T('rcSaved', { n: f.n }), null, true);
  }
  function rcMineHtml() {
    var mine = st.customFoods || [];
    return '<section class="rz-card"><div class="rz-st">' + esc(T('rcMine')) + '</div>' + (mine.length ? mine.map(function (f) { return '<div class="sl-rowx"><button type="button" class="sl-row" data-act="pickfav" data-id="' + esc(f.id) + '" data-d="' + (foodDay || todayStr()) + '"><span class="m"><span class="nm">' + esc(f.n) + '</span><span class="tm">' + esc(T('per100', { k: f.k })) + (f.recipe ? ' · ' + f.recipe.portions + ' ' + (lang === 'ru' ? 'порц.' : 'porsiya') : '') + '</span></span></button>' + (f.recipe ? '<button type="button" class="sl-edit" data-act="rcedit" data-id="' + esc(f.id) + '" aria-label="' + esc(T('rcEdit') + ': ' + f.n) + '">' + ico('pen') + '</button>' : '') + '</div>'; }).join('') : '<div class="rz-mut">' + esc(T('rcNoMine')) + '</div>') + '<button type="button" class="rz-btn ghost full" data-act="rcnew">' + esc(T('rcNew')) + '</button><button type="button" class="rz-btn ghost full" data-act="rclbl">' + ico('lbl') + ' ' + esc(T('rcLbl')) + '</button></section>';
  }

  /* ---------- oylik taqvim (Men) ---------- */
  var calYm = null;
  function stLabel(i, d, t) { return { pre: T('stPre'), none: T('stNone'), part: i.live ? T('stLive') : T('stPart'), near: T('stNear'), low: T('stLow'), high: T('stHigh') }[i.state]; }
  /* v63 (maket ~/tarix-maket.html): Tarix — OYLIK NATIJA. Kalendar ustida 3 plitka (yozilgan kun, o'rtacha kkal, vazn o'zgarishi), kun = halqa (to'lishi = iste'mol/limit ≤ 100%; maqsadda yashil, kamroq ko'k, ko'proq sariq;
     qisman — uzuq-uzuq kulrang; ma'lumotsiz — oddiy xira raqam; bugun — to'la aksent doira), ixcham izoh chiplari, seriya kartasi (gradient, 🔥, rekord, oxirgi 7 kun). Halqalar ekran ochilganda bir marta to'ladi. */
  var calFresh = false;
  function calHtml() {
    var t = todayStr(), ym = calYm || Dt.monthOf(t), ms = S.monthSummary(st, ym, t), g = ms.grid, p = Dt.parse(ym + '-01'), wd = lang === 'ru' ? ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] : ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'], sk = S.streak(st, t), start = S.trackStart(st);
    var st2 = { near: T('calNear'), low: T('calLow'), high: T('calHigh'), part: T('calPart'), none: T('calNone'), pre: T('calPre') }, short = { near: T('cmNear'), low: T('cmLow'), high: T('cmHigh'), part: T('cmPart') };
    var wdl = null; try { if (window.KalkiPlato && KalkiPlato.monthDelta) wdl = KalkiPlato.monthDelta(st.weights, ym, t, Dt); } catch (e) {}
    var goal = st.profile && st.profile.goal, good = wdl != null && ((goal === 'lose' && wdl < 0) || (goal === 'gain' && wdl > 0) || (goal === 'keep' && Math.abs(wdl) < 0.5)), wtx = wdl == null ? '—' : (wdl > 0 ? '+' : wdl < 0 ? '−' : '') + dec(Math.abs(wdl), 1) + ' ' + KG();
    var h = '<div class="sl-cmt" id="calSum"><div class="s"><small>' + esc(T('cmDays')) + '</small><b>' + (ms.total ? ms.logged + ' / ' + ms.total : '—') + '</b></div><div class="s"><small>' + esc(T('cmAvg')) + '</small><b>' + (ms.avg != null ? fmt(ms.avg) : '—') + '</b></div><div class="s"><small>' + esc(T('cmWt')) + '</small><b' + (good ? ' class="g"' : '') + '>' + esc(wtx) + '</b></div></div>';
    h += '<section class="rz-card sl-cal" id="calCard"><div class="sl-wh"><b>' + ico('cal2') + esc(T('calT')) + '</b><button type="button" class="rz-x sl-info" data-act="calinfo" aria-label="ⓘ ' + esc(T('calInfoT')) + '">ⓘ</button></div><div class="rz-monthnav"><button type="button" data-act="calprev" aria-label="‹">' + ico('back') + '</button><b>' + esc(kit.monthName(p.m, true) + ' ' + p.y) + '</b><button type="button" data-act="calnext" aria-label="›"' + (ym >= Dt.monthOf(t) ? ' disabled' : '') + '>' + ico('chev') + '</button></div><div class="sl-calg' + (calFresh && !reduce ? ' cin' : '') + '" role="grid">';
    wd.forEach(function (w) { h += '<i>' + esc(w) + '</i>'; }); for (var i = 0; i < g.first; i++) h += '<span></span>';
    g.days.forEach(function (d, i) {
      var pre = d.state === 'pre', ring = d.state === 'near' || d.state === 'low' || d.state === 'high', pv = ring ? Math.max(1, Math.min(100, Math.round(d.limit > 0 ? d.eaten / d.limit * 100 : 100))) : 0;
      h += '<button type="button" class="c ' + d.state + (ring ? ' r' : '') + (d.d === t ? ' td' : '') + (d.d > t ? ' fut' : '') + '" data-act="calday" data-d="' + d.d + '"' + (ring ? ' style="--cp:' + pv + ';--ci:' + i + '"' : '') + ' aria-label="' + esc(kit.dLabel(d.d) + ': ' + (d.live ? T('stLive') : st2[d.state])) + '"' + (d.d > t || pre ? ' disabled' : '') + '><span>' + d.n + '</span></button>';
    });
    h += '</div><div class="sl-leg">' + ['near', 'low', 'high', 'part'].map(function (k) { return '<span><i class="c ' + k + '" aria-hidden="true"></i>' + esc(short[k]) + ' · ' + g.counts[k] + '</span>'; }).join('') + '</div>';
    if (start) h += '<p class="rz-mut sm sl-cstart">' + esc(T('calStart', { d: kit.dLabel(start) })) + '</p>';
    h += '</section>';
    var best = Math.max(S.bestStreak(st, t), sk), wk = S.streakWeek(st, t), wn = wk.filter(Boolean).length;
    h += '<section class="sl-stc' + (sk ? '' : ' z') + '" id="stkCard"><span class="fl" aria-hidden="true">' + ico('flame') + '</span><div class="m"><b>' + esc(sk >= 2 ? T('stcN', { n: sk }) : sk === 1 ? T('stcN1') : T('stc0')) + '</b><small>' + esc(sk >= 2 ? (sk >= best ? T('stcRec', { n: best }) : T('stcBest', { n: best })) : sk === 1 ? T('stcN1s') : (best > 0 ? T('stc0b', { n: best }) : T('stc0s'))) + '</small></div><span class="wk" role="img" aria-label="' + esc(T('stcWk', { n: wn })) + '">' + wk.map(function (v) { return '<i' + (v ? '' : ' class="n"') + '></i>'; }).join('') + '</span></section>';
    var sj = G ? G.streakLine(jokeCtx()) : null; if (sj) { h += '<p class="rz-p sl-fact">' + esc(sj.text) + '</p>'; }
    return h;
  }

  /* ---------- hazil sozlamalari, shahar ---------- */
  function setRow(id, ic, title, note, on, act) {   // Profil: sozlama qatori — sarlavha + ⓘ qisqa izoh + switch (Eslatmalar kabi); bosilsa qiymat almashadi
    return '<div class="sl-remr" id="' + id + '"><div class="sl-remm"><span class="ic" aria-hidden="true">' + ic + '</span><span class="t"><b class="sl-bkT2">' + esc(title) + ' <button type="button" class="sl-infob" data-cyr="skip" data-act="ibtog" aria-expanded="false" aria-label="ⓘ ' + esc(title) + '">i</button></b><small class="sl-ibx" hidden>' + esc(note) + '</small></span></div>' + swHtml(on, act, title, false, ' data-v="' + (on ? '0' : '1') + '"') + '</div>';
  }
  function jokesCardHtml() {
    var on = prefs().jokes !== false, cityId = prefs().city || 'toshkent', cn = masofa && G ? G.nodeOf(masofa, cityId) : null, t = todayStr(), x = S.dayOf(st, t);
    return '<section class="rz-card sl-remc" id="jkCard">' + setRow('jkRow', '😄', T('jkT'), T('jkNote'), on, 'jktog') +
      '<button type="button" class="rz-row" data-act="city"><span class="m"><b>' + esc(T('jkCity')) + '</b></span><span class="v">' + esc(cn ? (lang === 'ru' ? cn.ru : cn.uz) : cityId) + '</span></button>' +
      '<label class="rz-chk"><input type="checkbox" id="jkParty"' + (x && x.party ? ' checked' : '') + '><span>' + esc(T('jkParty')) + '</span></label>' + (OR ? setRow('orRow', '🔁', T('orSet'), T('orSetH'), prefs().orin !== false, 'ortog') : '') + '</section>';
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
    var res = fd.items.length && !fd.busy, h = shHead(T('phT')) + (res ? '' : '<p class="rz-p sm">' + esc(T('phNote')) + '</p>');          // v52: natija chiqqach — izoh va limit qatori yo'q (360 px'da ikkinchi taom ko'rinsin)
    if (fd.busy) return h + '<div class="rz-empty"><div class="sl-spin" aria-hidden="true"></div><b>' + esc(T('phBusy')) + '</b></div>';
    if (fd.phErr) h += '<p class="rz-p warn">' + esc(fd.phErr) + '</p>';
    if (aiq && !fd.busy && !res) h += '<p class="rz-mut sm sl-aileft" id="phAiLeft">' + esc(aiq.qoldi > 0 ? T('aiLeft', { q: aiq.qoldi, n: aiq.limit }) : T('aiLimit', { n: aiq.limit })) + '</p>';
    if (!fd.items.length && phNative()) return h + '<div class="sl-phc"><button type="button" class="rz-btn primary full" data-act="fphotog">' + ico('img') + ' ' + esc(T('phGal')) + '</button><button type="button" class="rz-btn primary full" data-act="fphotoc">' + ico('cam') + ' ' + esc(T('phCam')) + '</button><button type="button" class="rz-btn ghost full" data-act="fphotof">' + esc(T('phFile')) + '</button></div><div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="fback">' + esc(T('back')) + '</button></div>';
    if (!fd.items.length) return h + '<div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="fback">' + esc(T('back')) + '</button><button type="button" class="rz-btn primary" data-act="fphoto">' + ico('cam') + ' ' + esc(T('phPick')) + '</button></div>';
    h += '<p class="rz-p sm">' + esc(T('phHint')) + '</p>' + itRows(fd.items);
    return h + '<div class="rz-fl">' + esc(T('pMeal')) + '</div>' + mealChips(fd.meal, 'fmeal3') + '<div class="rz-actions sl-sticky"><button type="button" class="rz-btn primary" data-act="txsave">' + esc(T('pwAll', { n: fd.items.length })) + '</button></div>';
  }
  /* AI so'rovlari hisoblagichi (retsept bilan UMUMIY: functions/api/kalkifit-quota.js AI_LIMIT — Android ilovasi 2, veb 5) */
  var aiq = null;
  function aiPlat() { var N = window.KalkiNative; try { return N && N.isApp() && N.platform() === 'android' ? 'android' : ''; } catch (e) { return ''; } }
  var ovq = null;          // ovoz limiti (AI hisobidan alohida): { limit, qoldi } — /api/ovoz va ovozdan keyingi taom ajratish javoblari
  function ovqSet(j) { if (!j || !(j.limit > 0) || typeof j.qoldi !== 'number') return; ovq = { limit: j.limit, qoldi: Math.max(0, j.qoldi) }; }
  function aiqSet(j) { if (!j || !(j.limit > 0) || typeof j.qoldi !== 'number') return; aiq = { limit: j.limit, qoldi: Math.max(0, j.qoldi) }; }
  function aiPeek() { try { fetch('/api/retsept', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sorov: 'qoldi', mijoz_id: cid(), platforma: aiPlat() || undefined }) }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { aiqSet(j); ftLimRefresh(); if (fd && fd.mode === 'search' && kit.sheetKind() === 'add') { repaintPick(); return; } if (!fd || !fd.busy) phRefresh(); }).catch(function () {}); } catch (e) {} }
  /* rasm natijasi → bazadagi taom (kkal bazadan); topilmasa AI qiymati «taxminiy ±30%». vs — AI variantlari (ehtimol bo'yicha): asosiysi + «Bu emasmi?» */
  function phItem(o, nom, vs) {
    var g = o.g > 0 ? o.g : 0, m = aiItem({ nom: nom, porsiya: g ? g + ' g' : o.porsiya, kcal: o.kcal }, true), it;
    if (m) { it = m; it.photo = true; it.dbk = true; }
    else it = { name: nom, fid: null, food: null, rHit: rGuess(nom), ptxt: o.porsiya || '', est: true, ai: true, photo: true, unit: 'pc', qty: 1, g: g, kcal: Math.round(o.kcal), p: o.o || 0, f: o.y || 0, c: o.u || 0, base: { g: g, kcal: Math.round(o.kcal), p: o.o || 0, f: o.y || 0, c: o.u || 0 } };
    it.ph = o; it.phNom = nom; it.alts = (vs || []).filter(function (v) { return v && v.nom && v.nom !== nom; }).slice(0, 2);
    return it;
  }
  function phAlt(i, k) { var it = fd.items[i]; if (!it || !it.alts || !it.alts[k]) return; var v = it.alts[k], all = [{ nom: it.phNom }].concat(it.alts); fd.items[i] = phItem(it.ph, v.nom, all); phRefresh(); }
  var phFq = '';
  function phFindHtml(i) {
    var q = phFq.trim(), list = q ? S.search(allFoods(), q, srchOpts(12)) : [];
    return '<div class="rz-sh-h sl-ph"><button type="button" class="rz-x" data-act="phfindx" aria-label="' + esc(T('back')) + '">' + ico('back') + '</button><b>' + esc(T('phFindT')) + '</b><button type="button" class="rz-x" data-act="sheetclose" aria-label="' + esc(T('close')) + '">' + ico('x') + '</button></div>' +
      '<div class="sl-search">' + ico('search') + '<input id="phFq" type="text" inputmode="search" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="' + esc(T('phFindPh')) + '" value="' + esc(phFq) + '" aria-label="' + esc(T('phFindPh')) + '" data-i="' + i + '"></div><div id="phFl">' + phFindList(i, list) + '</div>';
  }
  function phFindList(i, list) { return list.map(function (f) { return '<button type="button" class="sl-row" data-act="phpick" data-i="' + i + '" data-id="' + esc(f.id) + '"><span class="m"><span class="nm">' + esc(nameOf(f)) + '</span><span class="tm">' + esc(defPortionTxt(f)) + '</span></span></button>'; }).join('') || (phFq.trim() ? '<div class="rz-mut">' + esc(T('aNone')) + '</div>' : ''); }
  function phFind(i) { var it = fd.items[i]; if (!it) return; fd.phI = i; fd.mode = 'phfind'; phFq = it.phNom || it.name || ''; loadDb(function () { setSheet(phFindHtml(i)); var e = $('#phFq'); if (e) { e.addEventListener('input', function () { phFq = e.value; var l = $('#phFl'); if (l) l.innerHTML = phFindList(i, phFq.trim() ? S.search(allFoods(), phFq.trim(), srchOpts(12)) : []); }); try { e.focus(); e.select(); } catch (x) {} } }); }
  function phPick(i, id) {
    var it = fd.items[i], f = foodById(id); if (!it || !f) return; var g = it.g > 0 ? it.g : (it.ph && it.ph.g) || 0;
    var m = aiItem({ nom: nameOf(f), porsiya: g ? g + ' g' : '', kcal: 0, fid: f.id }, true);
    if (!m) { m = { name: nameOf(f), fid: f.id, food: f, unit: g ? 'g100' : f.u[0][0], qty: g ? Math.round(g) : 1, est: !!f.e, ai: false, fromAi: true }; itSync(m); }
    m.photo = true; m.dbk = true; m.ph = it.ph; m.phNom = nameOf(f); m.alts = [{ nom: it.phNom }].concat(it.alts || []).filter(function (v) { return v.nom && v.nom !== m.phNom; }).slice(0, 2);
    fd.items[i] = m; fd.mode = 'photo'; setSheet(phHtml());
  }
  function phRefresh() { if (kit.sheetKind() === 'add' && fd && fd.mode === 'photo') setSheet(phHtml()); }
  /* Rasm tayyorlash (taom rasmi va menyu): iPhone HEIC/48 MP ham — createImageBitmap (EXIF aylanishi bilan) → bo'lmasa <img>; canvas orqali JPEG, uzun tomon ≤ px;
     hajm > maxBytes bo'lsa sifat 0,8 → 0,46 gacha, keyin o'lcham ×0,8 (3 marta). cb(b64) yoki cb(null, 'format' | 'hajm'). Rasm saqlanmaydi. */
  function imgPrep(file, o, cb) {
    var px0 = (o && o.px) || 1024, max = (o && o.maxBytes) || 600000, done = false, closer = null, guard = setTimeout(function () { fin(null, 'format'); }, 20000);
    function fin(b, e) { if (done) return; done = true; clearTimeout(guard); try { if (closer) closer(); } catch (x) {} cb(b, e); }
    function read(b) { var r = new FileReader(); r.onload = function () { var v = String(r.result).split(',')[1] || ''; if (v) fin(v); else fin(null, 'format'); }; r.onerror = function () { fin(null, 'format'); }; r.readAsDataURL(b); }
    function draw(src, w, h) {
      var px = px0, round = 0, QS = [0.8, 0.68, 0.56, 0.46];
      (function enc() {
        var sc = Math.min(1, px / Math.max(w, h)), cw = Math.max(1, Math.round(w * sc)), ch = Math.max(1, Math.round(h * sc)), c = document.createElement('canvas'), qi = 0; c.width = cw; c.height = ch;
        try { var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, cw, ch); x.drawImage(src, 0, 0, cw, ch); } catch (e) { fin(null, 'format'); return; }
        (function tryQ() { c.toBlob(function (b) {
          if (!b || !b.size) { fin(null, 'format'); return; }
          if (b.size <= max) { read(b); return; }
          if (qi < QS.length - 1) { qi++; tryQ(); return; }
          if (round < 3) { round++; px = Math.round(px * 0.8); enc(); return; }
          if (b.size <= max * 1.4) read(b); else fin(null, 'hajm');
        }, 'image/jpeg', QS[qi]); })();
      })();
    }
    function viaImg() {
      var url = URL.createObjectURL(file), img = new Image(); closer = function () { URL.revokeObjectURL(url); };
      img.onload = function () { var w = img.naturalWidth || img.width, h = img.naturalHeight || img.height; if (!w || !h) { fin(null, 'format'); return; } draw(img, w, h); };
      img.onerror = function () { fin(null, 'format'); }; img.src = url;
    }
    if (window.createImageBitmap) { createImageBitmap(file).then(function (bm) { closer = function () { try { bm.close(); } catch (x) {} }; draw(bm, bm.width, bm.height); }, viaImg); } else viaImg();
  }
  function aiNetErr(e) { return navigator.onLine === false || (e && e.name === 'TypeError') ? 'tarmoq' : (e && e.name === 'AbortError' ? 'vaqt' : 'tarmoq'); }
  /* Android ilovasi (@capacitor/camera bor): sayt O'ZI tanlov oynasini ko'rsatadi (Galereyadan / Rasmga olish / Fayllardan) — native PROMPT oynasi ishlatilmaydi */
  function phNative() { return !!(window.KalkiNative && KalkiNative.canPickPhoto && KalkiNative.canPickPhoto() && KalkiNative.pickPhotoFrom); }
  function phChooser() { if (!fd || kit.sheetKind() !== 'add') openAdd({}); fd.mode = 'photo'; fd.items = []; fd.phErr = ''; fd.busy = false; setSheet(phHtml()); aiPeek(); }
  function phFromFile() { var pin = $('#phIn'); if (pin) { pin.value = ''; pin.click(); } }
  function phNativePick(src) {
    if (navigator.onLine === false) return; fd.phErr = '';
    KalkiNative.pickPhotoFrom(src).then(function (r) {
      if (r && r.file) { phFile(r.file); return; }
      if (!r || r.cancel) return;
      fd.phErr = r.error === 'camera' ? T('phPerm') : T('phErrPick') + (r.message ? ' (' + r.message + ')' : ''); if (fd.mode === 'photo') phRefresh();
      if (r.error !== 'camera' && src === 'PHOTOS') setTimeout(phFromFile, 200);        // galereya xatosi — WebView'ning o'z fayl tanlovi zaxira sifatida
    });
  }
  function phFile(file) {
    if (!file) return; if (!fd || kit.sheetKind() !== 'add') openAdd({}); fd.mode = 'photo'; fd.busy = true; fd.phErr = ''; fd.items = []; setSheet(phHtml()); aiPeek();
    var bad = function (kind, key) { stEv('ai_sorov', 'rasm.' + kind); fd.busy = false; fd.phErr = T(key); phRefresh(); };
    imgPrep(file, { px: 1024, maxBytes: 600000 }, function (b64, perr) {
      if (!b64) { bad(perr === 'hajm' ? 'hajm' : 'format', perr === 'hajm' ? 'phErrBig' : 'phErrFmt'); return; }
      var ctl = window.AbortController ? new AbortController() : null, tm = setTimeout(function () { if (ctl) ctl.abort(); }, 50000);
      fetch('/api/kalkifit-rasm', { method: 'POST', signal: ctl ? ctl.signal : undefined, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ img: b64, til: isCyr() ? 'kirill' : lang, mijoz_id: cid(), platforma: aiPlat() || undefined }) }).then(function (r) { clearTimeout(tm); return r.json().catch(function () { return {}; }).then(function (j) { return { s: r.status, j: j }; }); }).then(function (res) {
        aiqSet(res.j);
        var done = function () { fd.busy = false; phRefresh(); };
        stEv('ai_sorov', 'rasm.' + (res.s === 429 ? 'limit' : (res.s >= 200 && res.s < 300 ? 'ok' : (res.s === 413 ? 'hajm' : (res.s >= 500 ? 'server' : 'xato')))));
        if (res.s === 429) { fd.phErr = res.j && res.j.sabab !== 'sayt' && res.j.limit > 0 ? T('aiLimit', { n: res.j.limit }) : T(res.j && res.j.sabab === 'sayt' ? 'phSite' : 'phLimit'); done(); }
        else if (res.s === 413) { fd.phErr = T('phErrBig'); done(); }
        else if (res.s >= 500) { fd.phErr = T('phErrSrv'); done(); }
        else if (res.s !== 200 || !res.j || !res.j.ovqatlar) { fd.phErr = T('phErr'); done(); }
        else if (!res.j.ovqatlar.length) { fd.phErr = T('phNone'); stEv('ai_natija', 'rasm.bosh'); done(); }
        else loadDb(function () { fd.items = res.j.ovqatlar.map(function (o) { return phItem(o, o.nom, [{ nom: o.nom, ehtimol: o.ehtimol }].concat(o.boshqa || [])); }); done(); aiFOpen('rasm'); });
      }).catch(function (e) { clearTimeout(tm); var k = aiNetErr(e); bad(k, k === 'vaqt' ? 'phErrTime' : 'phErrNet'); });
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
    return '<div class="rz-sh-h sl-ph"><button type="button" class="rz-x" data-act="spback" aria-label="' + esc(T('spBack')) + '">' + ico('back') + '</button><b>' + esc(L.name) + '</b><button type="button" class="rz-x" data-act="sheetclose" aria-label="' + esc(T('close')) + '">' + ico('x') + '</button></div><div class="sl-lvrow"><span class="rz-mut sm">' + esc(T('spLvl')) + '</span></div>' + spEvHtml(it) + (it.warn ? '<p class="sl-warn big">' + ico('warn', 'sl-inl') + esc(it.warn[lang]) + '</p>' : '') + part('spWhat', 'what') + part('spFood', 'food') + part('spWho', 'who') + part('spNot', 'not') + part('spCare', 'care') +
      (it.ul && it.ul[lang] ? '<div class="sl-ul"><b>' + ico('warn', 'sl-inl') + esc(T('spUl')) + '</b><p>' + esc(it.ul[lang]) + '</p></div>' : '') + prot +
      '<p class="rz-p sm">' + (it.src ? '<a class="rz-link" href="' + esc(it.src) + '" target="_blank" rel="noopener noreferrer">' + esc(T('spSrc', { s: srcLabel(it) })) + '</a>' : esc(T('spSrc', { s: '—' }))) + (it.src2 ? ' · <a class="rz-link" href="' + esc(it.src2) + '" target="_blank" rel="noopener noreferrer">2</a>' : '') + (it.srcs ? it.srcs.map(function (x) { return ' · <a class="rz-link" href="' + esc(x.u) + '" target="_blank" rel="noopener noreferrer">' + esc(x.l) + '</a>'; }).join('') : '') + ' · ' + esc(T('spChecked', { d: it.checked || supp.checked })) + '</p>' + spDisc();
  }

  /* ---------- tushuntirish panellari ---------- */
  function xr(sg, label, val, cls, unit) { return '<div class="rz-xr ' + (cls || '') + '"><span class="sg" aria-hidden="true">' + sg + '</span><span class="lb">' + esc(label) + '</span>' + (val == null ? '' : '<b>' + val + (unit === false ? '' : '<small> ' + T('kcal') + '</small>') + '</b>') + '</div>'; }
  function okBtn() { return '<div class="rz-actions"><button type="button" class="rz-btn primary" data-act="sheetclose">' + esc(T('close')) + '</button></div>'; }
  function macrosHtml(tot, pl) { return '<section class="sl-card sl-macs"><button type="button" class="sl-mac3" data-act="xmacro" aria-label="' + esc(T('macroRow')) + '">' + [['mP', 'p'], ['mF', 'f'], ['mC', 'c']].map(function (m) { var goal = pl.macros[m[1]], v = Math.round(tot[m[1]]); return '<span class="mc"><b><i class="dt" style="background:var(--' + m[1] + ')"></i>' + esc(T(m[0])) + '</b><span class="mv">' + v + ' <small>/ ' + goal + ' g</small></span><span class="tr"><i class="kf-bar2" style="width:' + Math.min(100, Math.round(v / Math.max(1, goal) * 100)) + '%;background:var(--' + m[1] + ')"></i></span></span>'; }).join('') + '</button></section>'; }          // oqsil · yog' · uglevod — halqa bosilganda (kaloriya tushuntirishi oynasi tepasida)
  function bjuHtml(tot, pl) {                          // Bugun: oqsil · yog' · uglevod (maqsad — makro tafsiloti bilan BIR manba: planNow().macros; oqsil — S.protein); bosilsa makro tafsiloti. Oshsa ham qizil yo'q (yumshoq)
    var cols = [['mP', 'p'], ['mF', 'f'], ['mC', 'c']].map(function (m) {
      var goal = pl.macros[m[1]], v = Math.round(tot[m[1]]), over = v > goal;
      return '<span class="mc" data-m="' + m[1] + '"><span class="mh">' + esc(T(m[0])) + '</span><span class="mv"><b>' + fmt(v) + '</b><small>/ ' + fmt(goal) + ' g</small></span><span class="tr"><i class="' + (over ? 'over' : '') + '" style="width:' + Math.min(100, Math.round(v / Math.max(1, goal) * 100)) + '%"></i></span></span>';
    }).join('');
    return '<section class="sl-card sl-bju bj3" id="bjuCard"><button type="button" class="sl-bjub" data-act="xmacro" aria-label="' + esc(T('macroRow')) + '">' + cols + '<span class="bj-tip" id="prTip">' + esc(protTipDay(tot, pl)) + '</span></button></section>';
  }
  function protTipDay(tot, pl) {                     // bitta qator: «Oqsilga yana ~67 g — masalan, 200 g mol go'shti» (kunlik qoldiq; misol bazadan, kunga qarab almashadi) | «Oqsil maqsadi bajarildi ✓»
    var left = Math.round(pl.macros.p - tot.p); if (left <= 0) return T('prDone2');
    var ex = protEx(left); return ex ? T('prTipD', { p: left, g: ex.g, f: ex.n }) : T('prTipD0', { p: left });
  }
  function openExplainKcal() {                       // v51: BITTA tushuntirish — S.dayPlan (yig'indi = kunlik me'yor)
    var t = todayStr(), pl = planNow(), x = S.dayOf(st, t) || { food: [], steps: 0 }, tot = S.sumEntries(x.food), dp = S.dayPlan(st, t), rem = dp.limit - tot.kcal;
    var di = S.dayStatus(st, t, t), dnote = di.complete ? T('stFull') + ' · ' + stLabel(di, t, t) : T('cNote'), sg = function (v) { return (v < 0 ? '−' : '+') + fmt(Math.abs(v)); };
    var parts = [fmt(dp.bmr), '+ ' + fmt(dp.life)].concat(dp.stepCredit ? ['+ ' + fmt(dp.stepCredit)] : [], dp.exCredit ? ['+ ' + fmt(dp.exCredit)] : [], dp.aeCredit ? ['+ ' + fmt(dp.aeCredit)] : [], dp.dev ? ['− ' + fmt(dp.dev.cut)] : [], dp.corr ? [(dp.corr < 0 ? '− ' : '+ ') + fmt(Math.abs(dp.corr))] : [], dp.delta ? [(dp.delta < 0 ? '− ' : '+ ') + fmt(Math.abs(dp.delta))] : [], dp.floorAdd ? ['+ ' + fmt(dp.floorAdd)] : []);
    var h = shHead(T('xKcalT')) + macrosHtml(tot, pl) + '<p class="rz-p sm" id="dayChip" data-state="' + di.state + '">' + esc(dnote) + '</p>' +
      '<p class="rz-p xk-f" id="xkFormula">' + esc(parts.join(' ') + ' = ' + fmt(dp.limit) + ' ' + T('kcal')) + '</p><div class="rz-xrows" id="xkRows">' +
      xr('', T('xRest') + ' · ' + T('xBmrN'), fmt(dp.bmr)) + xr('+', dp.job ? T('xLifeJ', { j: T('job_' + dp.job).toLowerCase() }) : T('xLifeA'), fmt(dp.life)) +
      (dp.stepCredit ? xr('+', T('xStepX', { s: fmt(dp.steps), b: fmt(dp.base) }), fmt(dp.stepCredit)) : '') + (dp.exCredit ? xr('+', T('xExX', { n: dp.exMin }), fmt(dp.exCredit)) : '') + (dp.aeCredit ? xr('+', T('xAeX', { a: fmt(dp.ae), b: fmt(dp.aeBase) }), fmt(dp.aeCredit)) : '') + (dp.dev ? xr('−', T('xDevX', { d: fmt(dp.dev.total) }), fmt(dp.dev.cut)) : '') + (dp.corr ? xr(dp.corr < 0 ? '−' : '+', T('xCorrL'), fmt(Math.abs(dp.corr))) : '') +
      (dp.delta ? xr(dp.delta < 0 ? '−' : '+', T(dp.delta < 0 ? 'xGoalL' : 'xGoalG') + ' (' + dec(Math.abs(pl.kgPerWeek), 2) + ' ' + KG() + '/' + (lang === 'ru' ? 'нед.' : 'hafta') + ')', fmt(Math.abs(dp.delta))) : '') +
      (dp.floorAdd ? xr('+', T('xFloorA') + ' (' + fmt(pl.floorMin) + ')', fmt(dp.floorAdd)) : '') + xr('=', T('xLimitR'), fmt(dp.limit), 'sum') + xr('−', T('xEaten'), fmt(tot.kcal)) + xr('=', T('xRem'), sg(rem).replace('+', ''), 'sum big') + '</div>' +
      '<p class="rz-p sm" id="xkCred">' + esc(dp.job ? (prefs().qa !== 'on' && !dp.steps ? T('xCredQm') : T('xCredJob', { b: fmt(dp.base) })) + (dp.exCredit || dp.stepCredit ? ' ' + T('blK70') : '') : (jobUi() && qaOn() ? T('xCredAsk') : T('xCredOff'))) + '</p><p class="rz-p sm">' + esc(T('disc')) + '</p>' + okBtn();
    openSheet('xkcal', h);
  }
  function openExplainMacro() {
    var pl = planNow(), m = pl.macros, pg = pl.protein || S.protein(st.profile, S.currentWeight(st));          // v48: oqsil — maqsad (1,6 / 1,2 g/kg × trend yoki tavsiya vazni)
    openSheet('xmacro', shHead(T('xMacroT')) + '<div class="rz-xrows">' + xr('', T('xProt', { pk: dec(pg.manual ? Math.round(pg.g / pg.ref * 10) / 10 : pg.perKg, 1), w: dec(pg.ref, 1), p: m.p }), null) + xr('', T('xFat', { f: m.f }), null) + xr('', T('xCarb', { c: m.c }), null) + '</div>' + (function () { var tt = S.dayTotals(st, todayStr()); return tt.kcal >= 300 && tt.f * 9 / tt.kcal < 0.2 ? '<p class="rz-p sm sl-fatlow">' + esc(T('xFatLow')) + '</p>' : ''; })() + '<p class="rz-p sm">' + esc(T('xMacroN')) + '</p><p class="rz-p sm">' + esc(T('rMacro', { p: m.p, f: m.f, c: m.c })) + '</p>' + okBtn());          // yog' 20% dan kam — yumshoq eslatma faqat tafsilotda
  }
  function openExplainWater() { var pl = planNow(); openSheet('xwater', shHead(T('xWaterT')) + '<div class="rz-xrows">' + xr('', T('xWater', { w: dec(S.currentWeight(st), 1), ml: fmt(pl.water.ml), n: pl.water.glasses }), null) + '</div><p class="rz-p sm">' + esc(T('xWaterN')) + '</p>' + okBtn()); }
  function openExplainSteps() {
    var t = todayStr(), x = S.dayOf(st, t) || { steps: 0 }, h0 = num(st.profile.height), w = S.currentWeight(st), s = x.steps || 10000, km = S.distanceKm(s, h0), sc = Math.round(S.strideM(h0) * 1000) / 10;
    openSheet('xsteps', shHead(T('xStepT')) + '<div class="rz-xrows">' + xr('', T('xStride', { s: dec(sc, 1) }), null) + xr('', T('xDist', { n: fmt(s), s: dec(sc, 1), km: dec(km, 2) }), null) + xr('', T('xKc', { w: dec(w, 1), km: dec(km, 2), k: S.stepKcal(s, h0, w) }), null) + (function () { var dp = S.dayPlan(st, todayStr()); return dp.job ? xr('', T('xStepBase', { base: fmt(dp.base), n: fmt(dp.extra), k: fmt(dp.credit) }), null) : xr('', T('xNoCred'), null); })() + '</div><p class="rz-p sm">' + esc(T('xKcN')) + '</p><p class="rz-p sm">' + esc((function () { var dp = S.dayPlan(st, todayStr()); return dp.job ? T('xCredJob', { b: fmt(dp.base) }) : (jobUi() && qaOn() ? T('xCredAsk') : T('xCredOff')); })()) + '</p>' + okBtn());
  }
  function openExplainWeight() { openSheet('xweight', shHead(T('xWeightT')) + '<p class="rz-p">' + esc(T('xWeightN')) + '</p>' + okBtn()); }

  /* ---------- ovqat qo'shish: BITTA oqim (tasdiqlangan maket, 3 ekran) ----------
     1) «Nima yedingiz?» + ovqat vaqti chipi (soatga qarab o'zi), qidiruv (ichida mikrofon), «Taom rasmi» · «Kafe menyusi», «Yaqinda yeganlaringiz» ([+] — bir bosishda, varaq ochiq qoladi)
     2) yozilganda — faqat natijalar (o'z taomlari birinchi, «meniki»); bir nechta taom yozilsa — tepada «Hammasini qo'shish: …»
     3) qator bosilsa — porsiya oynasi (portionHtml). Barcha kirish nuqtalari (Qo'shish, ovqat vaqti «+», Tarix «+», maslahat kartalari) — openAdd() */
  var fd = null;
  function mealNow() { var d = new Date(); return S.mealByHour(d.getHours(), d.getMinutes()); }
  function openAdd(o) {
    o = o || {}; fd = { date: o.date || todayStr(), meal: o.meal || mealNow(), mode: 'search', q: '', food: null, unit: null, qty: 1, editId: null, items: [], busy: false, added: {} };
    if (dbState === 2) lmIndex();
    openSheet('add', searchHtml()); ovBoot();          // klaviatura o'zi chiqmaydi (openSheet — noFocus)
    loadDb(function (err) { if (fd && kit.sheetKind() === 'add' && fd.mode === 'search') refreshRes(err); });
    if (!aiq && !(KD && KD.on) && navigator.onLine !== false) aiPeek();          // «bugun N ta qoldi»: seansda bir marta so'raladi (sanamaydi), keyin javoblardan yangilanadi
    if (o.food) pickFood(o.food);
  }
  function entUnitTxt(e) { if (e.pt && !e.fid) return e.pt; var vv = vOf(e.unit); if (e.unit === 'g100') return amtG(e.g, e.fid ? foodById(e.fid) : null); if (vv) return qtyStr(e.qty) + ' ' + vName(vv); if (e.vn) return qtyStr(e.qty) + ' ' + e.vn; return qtyStr(e.qty) + ' ' + (e.unit && e.unit !== 'pc' ? unitName(e.unit) : unitName('porsiya')); }
  function lastEntries(limit) {                        // eng oxirgi yozuvlar (yangisi birinchi), har taomdan bittadan: [{e, d, k}]
    var out = [], seen = {}, days = Object.keys(st.days).sort().reverse(), from = Dt.addDays(todayStr(), -120);
    for (var i = 0; i < days.length && out.length < limit; i++) {
      if (days[i] < from) break; var l = st.days[days[i]].food;
      for (var j = l.length - 1; j >= 0 && out.length < limit; j--) { var e = l[j], k = e.fid ? (dbAlias[e.fid] || e.fid) : (e.name ? 'n:' + e.name : null); if (!k || seen[k]) continue; seen[k] = 1; out.push({ e: e, d: days[i], k: k }); }
    }
    return out;
  }
  var fdLM = {};
  function lmIndex() { fdLM = {}; lastEntries(200).forEach(function (r) { fdLM[r.k] = r; }); }
  function lastFor(key) { return key ? (fdLM[key] || null) : null; }
  function defPortionTxt(f, sel) {
    var v = f.fam ? S.famVariant(f, sel || S.famDefault(f), null) : f; if (!v || !v.u || !v.u.length) return ''; var u = defUnit(v), g = u === 'g100' ? 100 : (S.unitGrams(v, u) || 0); if (!(g > 0)) return '';
    return T('aDefOne', { x: u === 'g100' ? '100 ' + gWord(v) : '1 ' + unitName(u), k: fmt(S.portion(v, g).kcal) });
  }
  function isSentence(q) { q = String(q || '').trim(); if (q.length < 6) return false; return /\d/.test(q) || /[,;+]/.test(q) || /(^|\s)(va|bilan|и|ва|ta|та)(\s|$)/i.test(q) || q.split(/\s+/).length >= 2; }
  function shBack(title, attrs) { return '<div class="rz-sh-h sl-ph"><button type="button" class="rz-x" ' + attrs + ' aria-label="' + esc(T('back')) + '">' + ico('back') + '</button><b>' + esc(title) + '</b><button type="button" class="rz-x" data-act="sheetclose" aria-label="' + esc(T('close')) + '">' + ico('x') + '</button></div>'; }
  function rcmineOpen() { openSheet('rcmine', shHead(T('ft_taomlarim')) + rcMineHtml() + '<div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="sheetclose">' + esc(T('close')) + '</button></div>'); }
  /* ovqat vaqti chipi: «Tushlik ▾» → 4 variantli kichik ro'yxat */
  function mealPickHtml() {
    return '<div class="kq-mw"><button type="button" class="kq-meal" id="kqMeal" data-act="qmeal" aria-haspopup="true" aria-expanded="false" aria-controls="kqMM" aria-label="' + esc(T('pMealT') + ': ' + mealName(fd.meal)) + '"><span>' + esc(T('mealS_' + fd.meal)) + '</span>' + ico('chev', 'dn') + '</button>' +
      '<div class="kq-mm" id="kqMM" role="menu" hidden>' + S.MEALS.map(function (m) { var on = m === fd.meal; return '<button type="button" role="menuitemradio" aria-checked="' + on + '" data-act="qmealset" data-m="' + m + '"' + (on ? ' class="on"' : '') + '><span>' + esc(mealName(m)) + '</span>' + (on ? ico('check', '', 2.6) : '') + '</button>'; }).join('') + '</div></div>';
  }
  function mealMenu(open) { var mm = $('#kqMM'), b = $('#kqMeal'); if (!mm || !b) return; mm.hidden = !open; b.setAttribute('aria-expanded', String(!!open)); if (open) { var f = mm.querySelector('.on') || mm.querySelector('button'); if (f) try { f.focus({ preventScroll: true }); } catch (e) {} } }
  function mealSet(m) { fd.meal = m; var w = $('.kq-mw'); if (w) w.outerHTML = mealPickHtml(); var b = $('#kqMeal'); if (b) try { b.focus({ preventScroll: true }); } catch (e) {} }
  /* «Taom rasmi» · «Kafe menyusi» — mavjud funksiyalar; AI limiti ma'lum bo'lsa — tugma ichida kichik yozuv */
  function twoHtml() {
    var off = navigator.onLine === false, menu = !!(Y && Y.menuOpen && window.KalkiMenyu && fd.date === todayStr());
    var lim = aiq ? '<small class="kq-lim' + (aiq.qoldi > 0 ? '' : ' z') + '">' + esc(aiq.qoldi > 0 ? T('qLeft', { n: aiq.qoldi }) : T('qNoLeft')) + '</small>' : '';
    var btn = function (id, act, ic, k, attrs) { return '<button type="button" class="kq-b2" id="' + id + '" data-act="' + act + '"' + (attrs || '') + (off ? ' disabled aria-disabled="true"' : '') + '><i aria-hidden="true">' + ico(ic) + '</i><span class="m"><b>' + esc(T(k)) + '</b><small>' + esc(T(k + 'H')) + '</small>' + lim + '</span></button>'; };
    return '<div class="kq-two">' + btn('phBtn', 'fphoto', 'cam', 'qPhoto') + (menu ? btn('mnAdd', 'mnopen', 'img', 'qMenu', ' data-f="add"') : '') + '</div>';
  }
  function repaintPick() { var w = $('.kq-two'); if (w && fd && kit.sheetKind() === 'add' && fd.mode === 'search') w.outerHTML = twoHtml(); }
  function searchHtml() {
    var off = navigator.onLine === false, q = fd.q.trim();
    return '<div class="kq-h"><h2 class="kq-t">' + esc(T('qT')) + '</h2>' + mealPickHtml() + '</div>' +
      '<div class="kq-srch' + (q ? ' on' : '') + '"><input id="fdQ" type="text" inputmode="search" enterkeyhint="search" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="' + esc(T('apPh')) + '" value="' + esc(fd.q) + '" aria-label="' + esc(T('qT')) + '">' +
        (micOk() ? '<button type="button" class="kq-mic" id="micBtn" data-act="fmic" aria-label="' + esc(T('vMic')) + '"' + (off ? ' disabled aria-disabled="true"' : '') + '>' + ico('mic') + '</button>' : '<span class="kq-mic z" aria-hidden="true">' + ico('search') + '</span>') + '</div>' +
      '<div id="fdPickW"' + (q ? ' hidden' : '') + '>' + twoHtml() + '<button type="button" class="sl-txtbtn kq-lbl" data-act="lbphoto">' + ico('lbl', 'sl-inl') + esc(T('qLblLink')) + '</button><div id="fdRecent">' + (q ? '' : recentHtml()) + '</div></div>' +
      '<div class="sl-res" id="fdRes"' + (q ? '' : ' hidden') + '>' + (q ? resultsHtml() : '') + '</div>';
  }
  /* bitta qator: ikonka, nom (+ «meniki»/«odatiy» belgisi), porsiya · kkal, o'ngda [+] (✓ — qayta bosilsa bekor) */
  function rowHtml(o) {
    return '<div class="sl-rw' + (o.dim ? ' dim' : '') + '"><button type="button" class="sl-rr" ' + o.main + '>' + o.tile + '<span class="m"><span class="nm">' + esc(o.nm) + (o.tag ? ' <span class="sl-kb sl-mine">' + esc(o.tag) + '</span>' : '') + (o.bad ? ' <span class="sl-kb sl-rb">' + esc(T('rBadge')) + '</span>' : '') + (o.extra || '') + (o.fav ? ' ' + ico('heart', 'fv') : '') + '</span>' + (o.sub ? '<span class="tm">' + esc(o.sub) + '</span>' : '') + '</span></button>' +
      '<button type="button" class="sl-pl' + (o.done ? ' done' : '') + '" ' + o.plus + ' aria-label="' + esc((o.done ? T('aDone') : T('aQuickAdd')) + ': ' + o.nm) + '">' + (o.done ? ico('check', '', 2.6) : ico('plus', '', 2.4)) + '</button></div>';
  }
  function recRow(r) {                               // oxirgi yozuv: [+] — xuddi o'sha porsiya (AI/rasm yozuvi ham)
    var e = r.e, f = e.fid ? foodById(e.fid) : null, base = f && f.al ? (foodById(f.al.f) || f) : f, nm = e.name || (base ? nameOf(base) : '?');
    var plus = 'data-act="fquick" data-d="' + r.d + '" data-i="' + e.id + '" data-fk="' + esc(r.k) + '"';
    /* bazadagi taom — qator porsiya oynasini ochadi; fid'siz yozuv (AI/rasm/matn) yoki bazadan o'chgan taom — qator [+] bilan bir xil (xuddi o'sha porsiya qo'shiladi) */
    return rowHtml({ main: f ? 'data-act="pickfood" data-id="' + esc(e.fid) + '"' : plus, tile: tileHtml(e.fid || iconFid(e), e.vr, nm, 46, false, e.ikat), nm: nm, tag: base && base.custom ? T('qMine') : '', sub: entUnitTxt(e) + ' · ' + fmt(e.kcal) + ' ' + T('kcal'), plus: plus, done: !!fd.added[r.k] });
  }
  function foodKey(f, pk, pre) { return (f.fam ? f.fam.id : (dbAlias[f.id] || f.id)) + (pk ? '|' + JSON.stringify(pk) : '') + (pre ? '|' + pre.q + (pre.u || '') : ''); }
  function foodRow(f, pk, src, pre) {                     // baza/o'z taomi: [+] — oxirgi marta yegan porsiyasi, bo'lmasa odatiy porsiya (qatorda aynan shu yoziladi)
    var o = {}, ok = prepFood(o, f.id, pk, pre), key = foodKey(f, pk, pre), pt = ok ? pwCalc(o) : null, vl = ok && pk && o.fam ? S.famLabel(o.fam, o.food.vr, null, lang) : '', pj = (pk ? ' data-pick="' + esc(JSON.stringify(pk)) + '"' : '') + (pre ? ' data-pre="' + esc(JSON.stringify(pre)) + '"' : ''), nm = nameOf(f) + (vl ? ' · ' + vl : '');
    return rowHtml({ main: 'data-act="pickfood" data-id="' + esc(f.id) + '"' + pj, tile: tileHtml(f.id, null, nameOf(f), 46), nm: nm, tag: f.custom ? T('qMine') : '', bad: rI(f).hit.length, fav: st.favs.indexOf(f.id) > -1, extra: f.kf && Y ? ' ' + Y.badge({ kafe: true }) : '',
      sub: pt ? pwSumQ(o) + ' · ' + fmt(pt.kcal) + ' ' + T('kcal') + (f.tm ? ' · ' + T('qApprox') : '') : '', plus: 'data-act="fadd" data-id="' + esc(f.id) + '"' + pj + ' data-fk="' + esc(key) + '" data-src="' + src + '"', done: !!fd.added[key] });
  }
  function tplRow(t) {                               // «Odatdagi» to'plam: qator — ro'yxat (belgilab qo'shish), [+] — hammasi bir bosishda
    var x = t.items[0] || {};
    return rowHtml({ main: 'data-act="tplopen" data-id="' + t.id + '"', tile: tileHtml(x.fid, x.vr, x.n || t.name, 46), nm: t.name, tag: T('qTpl'), sub: T('aCnt', { n: t.items.length, k: fmt(S.tplKcal(t)) }), plus: 'data-act="tpladd" data-id="' + t.id + '"', done: !!fd.added['t:' + t.id] });
  }
  function recentList() {                            // odatdagilar (≤2) → o'z taomlari (≤3, hali yeyilmaganlari ham) → oxirgi takrorlanmas taomlar; jami ≤ 8
    var le = lastEntries(40).filter(function (r) { var i = rEntInfo(r.e); return !i.pork && !i.hit.length; });
    var mine = function (r) { var f = r.e.fid ? foodById(r.e.fid) : null; return !!(f && f.custom); }, seen = {};
    var mr = le.filter(mine).slice(0, 3); mr.forEach(function (r) { seen[r.e.fid] = 1; });
    var mn = (st.customFoods || []).filter(function (f) { return !seen[f.id] && !le.some(function (r) { return r.e.fid === f.id; }); }).slice(-Math.max(0, 3 - mr.length)).reverse();
    return (st.tpls || []).slice(0, 2).map(function (t) { return { t: t }; }).concat(mr.map(function (r) { return { r: r }; }), mn.map(function (f) { return { f: f }; }), le.filter(function (r) { return !mine(r); }).map(function (r) { return { r: r }; })).slice(0, 8);
  }
  function recentHtml() {                            // «Yaqinda yeganlaringiz» (ochilgandagi ro'yxat saqlanadi — [+] bosilganda qatorlar siljimaydi); hali hech narsa yo'q — mashhur milliy taomlar
    if (dbState !== 2) return '';
    var l = fd.recSnap || (fd.recSnap = recentList());
    if (l.length) return '<div class="sl-sech"><h3>' + esc(T('qRecent')) + '</h3></div>' + l.map(function (x) { return x.t ? tplRow(x.t) : (x.r ? recRow(x.r) : foodRow(x.f, null, 'oxirgilar')); }).join('');
    var pop = rSplit(allFoods().filter(function (f) { return f.t === 'o' && f.top && !f.custom && !f.h; })).show.slice(0, 6);
    if (pop.length < 4) pop = rSplit(allFoods().filter(function (f) { return f.t === 'o' && !f.custom && !f.h; })).show.slice(0, 6);
    return '<div class="sl-sech"><h3>' + esc(T('aPop')) + '</h3></div>' + pop.map(function (f) { return foodRow(f, null, 'qidiruv'); }).join('');
  }
  /* ko'p taomli gap («osh va choy», «2 ta non, choy»): tepada BITTA qator — mavjud ajratish (lokal, topilmagani — AI, limit bilan) */
  var multiMiss = 0;                                  // «Hammasini qo'shish»da topilmagan qism bormi (hammasi topilsa — «topilmadi» deb yozilmaydi)
  function multiHtml(q, n) {
    multiMiss = 0; if (!isSentence(q)) return ''; var r; try { r = S.parseText(q, allFoods(), { recents: st.recents, favs: st.favs, freq: S.freqMap(st, todayStr(), 30, dbAlias), vessels: st.vessels }); } catch (e) { return ''; }
    multiMiss = r.missing.length;
    var parts = r.items.map(function (x) {          // qisqa: «non ½ + qaymoq 50 g + qora choy»
      var nm = S.splitQty(x.text).name || x.text;     // gramm va yarimta — qisqa; qolgani yozilganidek («2 ta somsa», «1 kosa osh»)
      return x.unit === 'g100' ? nm + ' ' + fmt(Math.round(x.g)) + ' ' + unitName('g100') : (x.qty === 0.5 ? nm + ' ½' : x.text);
    }).concat(r.missing).map(function (s) { return String(s).trim(); }).filter(Boolean);
    if (parts.length < 2 && !(parts.length === 1 && !n && r.items.length)) return '';
    var off = navigator.onLine === false && r.missing.length, lim = r.missing.length && aiq ? '<small class="kq-lim' + (aiq.qoldi > 0 ? '' : ' z') + '">' + esc(aiq.qoldi > 0 ? T('qLeft', { n: aiq.qoldi }) : T('qNoLeft')) + '</small>' : '';
    return '<button type="button" class="kq-all" id="fdAi" data-act="fqai"' + (off ? ' disabled aria-disabled="true"' : '') + '><i aria-hidden="true">' + ico('plus', '', 2.4) + '</i><span class="m"><b>' + esc(T('qAll', { x: parts.join(' + ') })) + '</b>' + lim + '</span></button>';
  }
  function noneHtml() {                               // v67: «Topilmadimi? Qadoq yorlig'ini suratga oling» (karta) + «Qo'lda kiritish» + ovoz; birinchi «topilmadi»da — bir martalik maslahat
    var off = navigator.onLine === false, tip = fd.lbTip || !prefs().lbTip; if (!prefs().lbTip) { prefs().lbTip = 1; fd.lbTip = true; save(); }
    return '<div class="kq-none"><b>' + esc(T('qNone')) + '</b><button type="button" class="kq-lbc" data-act="lbphoto"' + (off ? ' disabled aria-disabled="true"' : '') + '><i aria-hidden="true">' + ico('lbl') + '</i><span class="m"><b>' + esc(T('qNoneLbl')) + '</b><small>' + esc(T('qNoneLblH')) + '</small></span>' + ico('chev', 'r') + '</button>' +
      '<div class="kq-nb"><button type="button" class="rz-btn" data-act="lbman">' + ico('pen') + '<span>' + esc(T('lbManT')) + '</span></button>' + (micOk() ? '<button type="button" class="rz-btn" data-act="fmic"' + (off ? ' disabled aria-disabled="true"' : '') + '>' + ico('mic') + '<span>' + esc(T('qVoice')) + '</span></button>' : '') + '</div>' +
      (tip ? '<p class="kq-tip">' + ico('spark', 'sl-inl') + esc(T('qLblTip')) + '</p>' : '') + '</div>';
  }
  function rI(f, vr) { return Y ? Y.rinfo(f, vr) : { pork: false, hit: [] }; }
  function rSplit(list, keepPork) { var o = { show: [], hid: [] }; list.forEach(function (f) { var i = rI(f); if (i.pork && !keepPork) return; (i.hit.length ? o.hid : o.show).push(f); }); return o; }
  function rNoPork(list) { return list.filter(function (f) { return !rI(f).pork; }); }
  function rEntInfo(e) { var f = e.fid ? foodById(e.fid) : null; return f ? rI(f.al ? (foodById(f.al.f) || f) : f, e.vr || null) : { pork: false, hit: [] }; }
  function rHits() { if (!Y || !fd || (fd.mode !== 'portion' && fd.mode !== 'item')) return []; var o = fd.mode === 'item' ? fd.items[fd.ix] : fd; if (!o) return []; if (!o.food && fd.mode === 'item') return o.rHit || []; if (!o.food || o.food.custom || (fd.mode === 'portion' && fd.editId != null)) return []; var f = o.fam || o.food; return rI(f, o.fam ? o.food.vr : null).hit; }      // AI matn / rasm natijasi (item) ham: taom tanilsa — o'sha yumshoq ogohlantirish
  function rWarnInner() { var h = rHits(); return h.length ? '<div class="sl-rwarn" role="note">' + ico('warn') + '<span>' + esc(T('rWarn', { x: Y.hitText(h) })) + '</span></div>' : ''; }
  function resultsHtml() {
    if (dbState !== 2 || (Y && !Y.chReady())) return '<div class="rz-mut">' + esc(T('aLoading')) + '</div>';
    var q = fd.q.trim(), sq = S.splitParts(q).length > 1 ? {} : S.splitQty(q), pre = sq.qty != null && sq.name ? { q: sq.qty, u: sq.unit } : null, qn = pre ? sq.name : q, all = S.search(allFoods(), qn, srchOpts(40)),          // «рис вареный 100 г» → «рис вареный» qidiriladi, natija 100 g bilan
        list = all.filter(function (f) { return f.custom; }).concat(all.filter(function (f) { return !f.custom; }));          // qidiruv: odam o'zi yozgan — HAMMASI (cheklangani belgi bilan); o'z taomlari birinchi
    var head = multiHtml(q, list.length);
    if (!list.length) { if (!head || multiMiss) qtNote(q); return head + noneHtml(); }
    var FATX = { sut: 1, kefir: 1, qatiq: 1, smetana: 1 }, noNum = !/\d/.test(qn);          // sut mahsulotlari: yog'liligi yozilmagan bo'lsa — har variant alohida qator (0,5% → 6%, tartib bilan)
    var own = '<button type="button" class="sl-txtbtn kq-own" data-act="fcustom">' + ico('plus', 'sl-inl') + esc(T('qOwn')) + '</button>';          // topilgani mos kelmasa — o'z taomi (ro'yxat oxirida, sokin havola)
    return head + list.map(function (f) { if (noNum && f.fam && FATX[f.fam.id] && f.fam.ax && f.fam.ax[0] && f.fam.ax[0].i === 'yogliligi') { var ax = f.fam.ax[0]; return ax.o.map(function (o) { var pk = {}; pk[ax.i] = o.i; return foodRow(f, pk, 'qidiruv', pre); }).join(''); } return foodRow(f, f.fam ? S.famPick(f, qn) : null, 'qidiruv', pre); }).join('') + own;
  }
  var QT_LS = 'kalki_fit_qt', qtTm = null;
  function qtNorm(q) {
    var s0 = String(q == null ? '' : q).toLowerCase().replace(/[\u2019\u2018\u02bb\u02bc`\u00b4]/g, "'").replace(/\s+/g, ' ').trim();
    if (s0.length < 2 || s0.length > 40 || /[@\/\\<>{}\[\]|=:;#$%^&*_~+]|https?|www\./.test(s0) || (s0.match(/\d/g) || []).length > 4 || !/[a-z\u0430-\u044f\u0451\u045e\u049b\u0493\u04b3]/i.test(s0)) return '';
    return /^[a-z0-9\u0430-\u044f\u0451\u045e\u049b\u0493\u04b3' ,.()%-]+$/i.test(s0) ? s0 : '';
  }
  function qtNote(q) {                               // topilmagan so'z: miqdorsiz («рис вареный 100 г» → «рис вареный»)
    if (KD.on || (navigator.doNotTrack === '1') || !window.fetch) return;
    clearTimeout(qtTm);
    qtTm = setTimeout(function () {
      if (!fd || fd.q.trim() !== q) return; var w = qtNorm(S.splitQty(q).name || q), d = todayStr(); if (!w) return;
      var m = {}; try { m = JSON.parse(localStorage.getItem(QT_LS) || '{}') || {}; } catch (e) {}
      Object.keys(m).forEach(function (k) { if (k.slice(0, 10) !== d) delete m[k]; });
      if (m[d + '|' + w]) return; m[d + '|' + w] = 1; try { localStorage.setItem(QT_LS, JSON.stringify(m)); } catch (e) {}
      stEv('qidiruv_topilmadi');
      try { fetch('/api/qidiruv', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ k: [{ s: d, q: w, n: 1 }] }), keepalive: true }).catch(function () {}); } catch (e) {}
    }, 2500);
  }
  /* v67: qaysi fast-food TARMOG'I qidirilgani (anonim, qat'iy ro'yxat — functions/api/stat.js tarmoq_qidiruv; seansda har tarmoq bir marta) */
  var TM_RE = { evos: /^(evos|эвос|evoc)/, maxway: /^(max ?way|maks ?vey|макс ?вей|maxvey)/, oqtepa: /^(oqtepa|oktepa|окт[еэ]па|ok tepa)/, bellissimo: /^(bel+is+imo|бел+ис+имо)/, kfc: /^(kfc|кфс|кфц|kafsi)/, feedup: /^(feed ?up|fid ?ap|фид ?ап)/, lesailes: /^(les ?ailes|лес ?аил|les ?ail)/, chopar: /^(chopar|чопар)/ };
  function tmNote(q) { var w = String(q || '').toLowerCase().trim(); Object.keys(TM_RE).forEach(function (k) { if (TM_RE[k].test(w) && !(fd.tmSeen || (fd.tmSeen = {}))[k]) { fd.tmSeen[k] = 1; stEv('tarmoq_qidiruv', k); } }); }
  function refreshRes(err) {                         // 1-ekran (bo'sh qidiruv) ↔ 2-ekran (natijalar): maydon DOM'i almashtirilmaydi — fokus/klaviatura saqlanadi
    if (!fd || kit.sheetKind() !== 'add' || fd.mode !== 'search') return;
    if (Y && !Y.chReady()) Y.loadCh(function () { if (fd && kit.sheetKind() === 'add' && fd.mode === 'search') refreshRes(); });
    if (dbState === 2) lmIndex();
    var q = fd.q.trim(), pw = $('#fdPickW'), rs = $('#fdRes'), rc = $('#fdRecent'), sr = $('.kq-srch');
    if (sr) sr.classList.toggle('on', !!q); if (pw) pw.hidden = !!q; if (rs) rs.hidden = !q; sheetFull();
    if (q) { if (rc) rc.innerHTML = ''; if (rs) rs.innerHTML = err ? '<div class="rz-mut">' + esc(T('aNone')) + '</div>' : resultsHtml(); tmNote(q); }          // «Yaqinda» tozalanadi — natijalar bilan takrorlanmasin
    else { if (rc) rc.innerHTML = err ? '' : recentHtml(); if (rs) rs.innerHTML = ''; }
  }
  function backToSearch() { fd.mode = 'search'; fd.food = null; fd.fam = null; fd.base = null; setSheet(searchHtml()); refreshRes(dbState === 0); }
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
  function pwChipU(o) { if (o.unit !== 'g100') return o.unit; var l = pwUnits(o).filter(function (u) { return u !== 'g100'; }); return l[0] || 'g100'; }          // tezkor tugmalar birligi: «Gramm» tanlangan bo'lsa ham — taomning odatiy birligi
  function pwKc(o, u, q) { return pwCalc({ food: o.food, fam: o.fam, base: o.base, unit: u, qty: q, vfill: o.vfill }).kcal; }
  function pwQuick(o) {                              // Yarim · 1 likopcha · 1,5 · Gramm (har birida kkal); faqat grammli taom — 50 · 100 · 150 · 200 g
    var cu = pwChipU(o), gr = cu === 'g100', vals = gr ? [50, 100, 150, 200] : [0.5, 1, 1.5], gOn = o.unit === 'g100' && !gr;
    var lab = function (v, i) { return gr ? v + ' ' + gWord(o.food) : (i === 0 ? T('qHalf') : (i === 1 ? '1 ' + pwUName(cu) : '1,5')); };
    return vals.map(function (v, i) { var on = o.unit === cu && Math.abs(o.qty - v) < 1e-6; return '<button type="button" class="kq-chip' + (on ? ' on' : '') + '" data-act="pwq" data-v="' + v + '" data-u="' + esc(cu) + '" aria-pressed="' + on + '"><b>' + esc(lab(v, i)) + '</b><small>' + fmt(pwKc(o, cu, v)) + '</small></button>'; }).join('') +
      (gr ? '' : '<button type="button" class="kq-chip' + (gOn ? ' on' : '') + '" data-act="pwgram" aria-pressed="' + gOn + '"><b>' + esc(isLiq(o.food) ? ML() : T('qGram')) + '</b><small>' + (gOn ? fmt(pwGrams(o)) + ' ' + T('gram') : '…') + '</small></button>');
  }
  function pwSumQ(o) { return o.unit === 'g100' ? amtG(pwGrams(o), o.food) : qtyStr(o.qty) + ' ' + pwUName(o.unit); }
  function pwBody(o, noName) {
    var pt = pwCalc(o), tmF = !o.base && o.food && o.food.tm, approx = !!o.base || !!tmF;          // «taxminiy» faqat bazada yo'q (AI/rasm) taom va fast-food TARMOG'I taomi (v67: tarmoq rasmiy qiymat e'lon qilmagan) uchun; boshqa baza taomlariniki — faqat ⓘ Manba ichida
    var nm = o.fam ? nameOf(o.fam) : (o.food ? nameOf(o.food) : (o.name || '')), lb = o.fam && o.food ? S.famLabel(o.fam, o.food.vr, o.szid, lang) : '', fidv = o.fam ? o.fam.id : (o.food ? o.food.id : null);
    var more = famChips(o) + '<div class="rz-fl">' + esc(T('pUnit')) + '</div><div class="rz-chips" id="fdUnits" role="group" aria-label="' + esc(T('pUnit')) + '">' + pwUnits(o).map(function (u) { var vv = vOf(u); return '<button type="button" class="rz-chip' + (vv ? ' sl-vc' : '') + (o.unit === u ? ' on' : '') + '" data-act="funit" data-u="' + u + '" aria-pressed="' + (o.unit === u) + '">' + esc(vv ? vLabel(vv, vkey(o)) : pwUName(u)) + '</button>'; }).join('') + (o.food ? '<button type="button" class="rz-chip sl-vnew" data-act="vnew">+ ' + esc(T('vNew')) + '</button>' : '') + '</div>' + vFillChips(o) +
      '<div class="sl-pwi" id="fdInfo">' + esc(pwInfo(o)) + '</div>' + (fd.mode === 'portion' || fd.mode === 'item' ? '<button type="button" class="rz-btn ghost sl-sw" data-act="pwswap">' + esc(T('pwSwap')) + '</button>' : '');
    return (noName ? '' : '<div class="kq-hero"><span class="kq-food kf-pop">' + tileHtml(fidv, o.food ? o.food.vr : null, nm, 110, true) + '</span><h2 class="sl-pn" id="fdName">' + esc(nm) + '</h2><span class="sl-pv" id="fdVar"' + (lb ? '' : ' hidden') + '>' + esc(lb) + '</span></div>') +
      '<div class="kq-m4" aria-live="polite"><span class="k1">' + (approx ? '<small class="ap">≈</small>' : '') + '<b id="fdKcal">' + fmt(pt.kcal) + '</b><small>' + esc(T('kcal')) + '</small></span><span><b><i id="fdMp">' + Math.round(pt.p) + '</i> ' + esc(T('gram')) + '</b><small>' + esc(T('m4P')) + '</small></span><span><b><i id="fdMf">' + Math.round(pt.f) + '</i> ' + esc(T('gram')) + '</b><small>' + esc(T('m4F')) + '</small></span><span><b><i id="fdMc">' + Math.round(pt.c) + '</i> ' + esc(T('gram')) + '</b><small>' + esc(T('m4C')) + '</small></span></div>' +          // v56: kkal · oqsil · yog' · uglevod — 4 plitka (kkal birinchi)
      (approx ? '<p class="rz-p sm sl-ap' + (tmF ? ' sl-tm' : '') + '">' + esc(T(tmF ? 'pwChain' : 'pwApprox')) + '</p>' : '') +
      '<div class="kq-chips kq-seg" id="fdQuick" role="group" aria-label="' + esc(T('pwQuick')) + '">' + pwQuick(o) + '</div>' +
      '<div class="sl-qty"><button type="button" data-act="fqty" data-s="-1" aria-label="' + esc(T('qtyMinus')) + '">' + ico('minus', '', 2.6) + '</button><span class="c"><span class="pw-in"><input id="fdQty" type="text" inputmode="decimal" autocomplete="off" enterkeyhint="done" aria-label="' + esc(T('pwQty')) + '" value="' + esc(qtyStr(o.qty)) + '"><i id="fdQu">' + esc(o.unit === 'g100' ? gWord(o.food) : pwUName(o.unit)) + '</i></span><small id="fdGr"' + (o.unit === 'g100' ? ' hidden' : '') + '>≈ ' + esc(amtG(pwGrams(o), o.food)) + '</small></span><button type="button" data-act="fqty" data-s="1" aria-label="' + esc(T('qtyPlus')) + '">' + ico('plus', '', 2.6) + '</button></div>' +
      '<div class="pw-rows"><button type="button" class="sl-type pw-row" data-act="pwmore" aria-expanded="' + !!o.pmore + '"><span class="ic" aria-hidden="true">🍽</span><b>' + esc(T('pTypeT')) + '</b><small id="fdTSum">' + esc(lb || pwUName(o.unit)) + '</small><span class="a" aria-hidden="true">›</span></button><div class="sl-pwmore" id="pwMore"' + (o.pmore ? '' : ' hidden') + '>' + more + '</div>' +
      (fd.mode === 'portion' ? '<button type="button" class="pw-row" data-act="pwmeal" aria-expanded="' + !!(fd.pmeal) + '"><span class="ic" aria-hidden="true">🕐</span><b>' + esc(T('pMealT')) + '</b><small id="fdMealV">' + esc(mealName(fd.meal)) + '</small><span class="a" aria-hidden="true">›</span></button><div class="pw-meal" id="pwMeal"' + (fd.pmeal ? '' : ' hidden') + '>' + mealChips(fd.meal, 'fmeal') + '</div>' : '') +
      (fd.mode === 'portion' && fd.editId != null ? '<button type="button" class="pw-row" data-act="tplsave" data-m="' + fd.meal + '" data-d="' + fd.date + '"><span class="ic" aria-hidden="true">☆</span><b>' + esc(T('tplSaveR')) + '</b><small></small><span class="a" aria-hidden="true">›</span></button>' : '') + '</div>';
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
    return '<div class="rz-sh-h sl-ph"><button type="button" class="rz-x" data-act="pwswapx" aria-label="' + esc(T('back')) + '">' + ico('back') + '</button><b>' + esc(T('srcBtn')) + '</b><button type="button" class="rz-x" data-act="sheetclose" aria-label="' + esc(T('close')) + '">' + ico('x') + '</button></div>' +
      '<p class="rz-p"><b>' + esc(f ? nameOf(o.fam || f) : (o.name || '')) + '</b>' + ((o.fam && f.vr) ? ' · ' + esc(S.famLabel(o.fam, f.vr, o.szid, lang) || '') : '') + '</p>' +
      (!f ? '<p class="rz-p sl-ap">' + esc(T('srcAi')) + '</p>' : (f.e ? '<p class="rz-p sl-ap">' + esc(T(f.rc ? 'srcApprox' : 'srcApprox2')) + '</p>' : '')) + '<p class="rz-p">' + esc(t) + '</p>' + (f && f.k ? '<p class="rz-p sm">' + esc(T('srcPer100', { k: f.k }) + (o.fam ? ' · ' + T('famN', { n: o.fam.fam.N }) + ' · ' + T('famDef') : '')) + '</p>' : '') + (us ? '<p class="rz-p sm">' + esc(us) + '</p>' : '') +
      '<div class="rz-actions sl-sticky"><button type="button" class="rz-btn primary" data-act="pwswapx">' + esc(T('back')) + '</button></div>';
  }
  function itSync(it) {
    var pt = pwCalc(it); it.g = pt.g; it.kcal = pt.kcal; it.p = pt.p; it.f = pt.f; it.c = pt.c;
    if (it.ed || it.food) it.ptxt = it.unit === 'g100' ? amtG(pt.g, it.food) : qtyStr(it.qty) + ' ' + pwUName(it.unit);
  }
  function pwUpdate(fromInput) {
    var o = pwO(), pt = pwCalc(o); if (fd.mode === 'item') { o.ed = true; itSync(o); }
    kit.setNum($('#fdKcal'), num($('#fdKcal').textContent.replace(/\s/g, '')), pt.kcal, { dur: 200 });
    var set = function (id, v) { var e = $(id); if (e) e.textContent = v; }; var rw = $('#rWarn'); if (rw) rw.innerHTML = rWarnInner();
    set('#fdMp', Math.round(pt.p));
    if (!fromInput) $('#fdQty').value = qtyStr(o.qty);
    set('#fdQu', o.unit === 'g100' ? gWord(o.food) : pwUName(o.unit)); set('#fdGr', '≈ ' + amtG(pwGrams(o), o.food)); set('#fdInfo', pwInfo(o)); if (!o.fam) set('#fdTSum', pwUName(o.unit)); $('#fdQuick').innerHTML = pwQuick(o);
    $$('[data-act=funit]').forEach(function (b) { var on = b.getAttribute('data-u') === o.unit; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    var cb = $('#fsave'); if (cb && fd.mode === 'portion') cb.innerHTML = ctaHtml(pt.kcal); set('#fdMf', Math.round(pt.f)); set('#fdMc', Math.round(pt.c)); var gr = $('#fdGr'); if (gr) gr.hidden = o.unit === 'g100';
    if (fd.mode === 'portion') orRefresh();
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
    return rSplit(out).show.slice(0, 5);
  }
  function pwSwapHtml(o) {
    var l = pwSimilar(o);
    return '<div class="rz-sh-h sl-ph"><button type="button" class="rz-x" data-act="pwswapx" aria-label="' + esc(T('back')) + '">' + ico('back') + '</button><b>' + esc(T('pwSwapT')) + '</b><button type="button" class="rz-x" data-act="sheetclose" aria-label="' + esc(T('close')) + '">' + ico('x') + '</button></div>' +
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
    return '<div class="rz-sh-h sl-ph"><button type="button" class="rz-x" data-act="pwdone" aria-label="' + esc(T('back')) + '">' + ico('back') + '</button><b>' + esc(it.name) + '</b><button type="button" class="rz-x sl-src" data-act="pwsrc" aria-label="' + esc(T('pManba')) + '">' + ico('info') + '</button></div><div id="rWarn">' + rWarnInner() + '</div>' + pwBody(it, true) +
      '<div class="pw-bar"><button type="button" class="sl-main" id="fsave" data-act="pwdone">' + esc(T('pwDone')) + '</button></div>';          // v56: bir xil qotgan panel
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
    h = '<div class="rz-sh-h sl-ph"><button type="button" class="rz-x" data-act="vback" aria-label="' + esc(T('back')) + '">' + ico('back') + '</button><b>' + esc(T('vcT')) + '</b><button type="button" class="rz-x" data-act="sheetclose" aria-label="' + esc(T('close')) + '">' + ico('x') + '</button></div><p class="rz-p sm">' + esc(T('vcFor', { x: nameOf(o.fam || o.food) })) + '</p>';
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
    return shHead(T('ft_idishlar')) + (l.length ? l.map(function (v) {
      return '<div class="sl-tr"><span class="m"><b>' + esc(vName(v)) + '</b><span>' + esc(vFams(v)) + '</span></span><button type="button" class="rz-x" data-act="vedit" data-id="' + v.id + '" aria-label="' + esc(T('vmEdit') + ': ' + vName(v)) + '">' + ico('pen') + '</button><button type="button" class="rz-x" data-act="vdel" data-id="' + v.id + '" aria-label="' + esc(T('del') + ': ' + vName(v)) + '">' + ico('x') + '</button></div>';
    }).join('') + '<p class="rz-p sm">' + esc(T('vmMax', { n: S.VESSEL_MAX })) + '</p>' : '<p class="rz-p">' + esc(T('vmEmpty')) + '</p><p class="rz-p sm">' + esc(T('vmGuide')) + '</p><button type="button" class="rz-btn primary full" data-act="tplgoadd">' + esc(T('tplAddFood')) + '</button>') + '<div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="sheetclose">' + esc(T('close')) + '</button></div>';
  }
  function vmOpen() { openSheet('vess', vmHtml()); }
  function vmEdit(id) {
    var v = S.vesselById(st, id); if (!v) return; vm = { id: id };
    setSheet('<div class="rz-sh-h sl-ph"><button type="button" class="rz-x" data-act="vmback" aria-label="' + esc(T('back')) + '">' + ico('back') + '</button><b>' + esc(T('vmEdit')) + '</b><button type="button" class="rz-x" data-act="sheetclose" aria-label="' + esc(T('close')) + '">' + ico('x') + '</button></div>' +
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
    var f = e.fid ? foodById(e.fid) : null; return { fid: e.fid || null, n: f ? nameOf(f) : (e.name || ''), pt: e.pt, unit: e.unit, qty: e.qty, g: e.g, kcal: e.kcal, p: e.p, f: e.f, c: e.c, est: !!e.est, vr: e.vr, sz: e.sz, vn: e.vn, vf: e.vf };
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


  function tplToItems(list) {                       // shablon/kecha yozuvlari → porsiya oynasi qatorlari
    return list.map(function (x) {
      var f = x.fid ? foodById(x.fid) : null, vr = x.vr || null, fam = null;
      if (f && f.al) { var bf = foodById(f.al.f); if (bf) { vr = vr || f.al.v; f = bf; } }
      if (f && f.fam) { fam = f; f = S.famVariant(fam, S.famSelOf(fam, vr), x.sz || null); }
      var ux = x.unit, qty = x.qty > 0 ? x.qty : 1, vkx = f ? (fam ? fam.fam.id : f.id) : null;
      if (ux && String(ux).indexOf('v:') === 0) { var vv = S.vesselById(st, +String(ux).slice(2)); if (!(vv && vkx && vv.fam[vkx] > 0)) { ux = 'g100'; qty = x.g > 0 ? Math.round(x.g) : 100; } }       // idish o'chirilgan: saqlangan gramm bilan
      var ok = f && (vOf(ux) || f.u.some(function (u) { return u[0] === ux; }));
      if (ok) { if (ux === 'g100' && qty < 5 && x.g > 5) qty = x.g; var it = { name: nameOf(fam || f), fid: (fam || f).id, food: f, unit: ux, qty: qty, est: !!f.e, ai: false, vfill: vOf(ux) ? (x.vf || 'tola') : undefined }; if (fam) { it.fam = fam; it.sel = S.famSelOf(fam, vr); it.szid = x.sz || fam.fam.sz && fam.fam.sz.d || null; it.vr = f.vr; it.sz = f.sz; var lb = S.famLabel(fam, f.vr, it.szid, lang); if (lb) it.name += ' · ' + lb; } itSync(it); return it; }
      var sp = S.ptSplit(x.n || '?', x.pt), it2 = { name: sp.n, fid: null, food: null, unit: 'pc', qty: 1, est: true, ai: false, ptxt: sp.pt, base: { g: x.g || 0, kcal: x.kcal, p: x.p || 0, f: x.f || 0, c: x.c || 0 } };
      it2.g = x.g || 0; it2.kcal = x.kcal; it2.p = x.p || 0; it2.f = x.f || 0; it2.c = x.c || 0; return it2;
    });
  }
  function tplHtml() {
    var on = fd.items.filter(function (i) { return !i.off; }).length;
    return '<div class="rz-sh-h sl-ph"><button type="button" class="rz-x" data-act="fback" aria-label="' + esc(T('back')) + '">' + ico('back') + '</button><b>' + esc(fd.tplT || '') + '</b><button type="button" class="rz-x" data-act="sheetclose" aria-label="' + esc(T('close')) + '">' + ico('x') + '</button></div>' + itRows(fd.items, true) +
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
    else if (back === 'add') { save(); render(); backToSearch(); }
    else { kit.closeSheet(); commit(); }
    toast(T('tplSaved', { x: t.name }), null, true);
  }
  function tplStartSave(m, d, items) {
    var ctx = kit.sheetKind() === 'tpls' ? 'tpls' : (kit.sheetKind() === 'add' && !(fd && fd.editId) ? 'add' : null);          // tahrirlash oynasidan (v44 ☆) — saqlab yopiladi
    if ((st.tpls || []).length >= S.TPL_MAX) { toast(T('tplFull')); return; }
    tm = { m: m, d: d, items: items || null, back: ctx }; if (ctx) setSheet(tplNameHtml()); else openSheet('mmenu', tplNameHtml());
  }
  function tplsHtml() {
    var l = st.tpls || [];
    return shHead(T('ft_odatdagi')) + (l.length ? l.map(function (t, i) {
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
  function prepFood(o, id, pick, pre) {                   // taom → boshlang'ich porsiya: «Mening idishim» › shu taomning OXIRGI porsiyasi (va omillari) › odatiy porsiya. Porsiya oynasi ham, [+] ham shu yerdan
    var f = foodById(id); if (!f) return false;
    o.fam = null; o.sel = null; o.szid = null; o.favId = null; o.base = null;
    if (f.al) { var bf = foodById(f.al.f); if (bf) { o.favId = f.id; pick = S.famSelOf(bf, f.al.v); f = bf; } }
    if (f.fam) famOpen(o, f, Object.assign(S.famDefault(f), pick || {})); else o.food = f;
    o.unit = defUnit(o.food); o.qty = o.unit === 'g100' ? 100 : 1; o.vfill = 'tola';
    var vs0 = S.vesselsFor(st, vkey(o)); if (vs0.length) { o.unit = 'v:' + vs0[0].id; o.qty = 1; }             // shu oila uchun «Mening idishim» bor — oldindan tanlangan
    var le = lastFor(vkey(o)); if (le) pwApplyLast(o, le.e, pick);
    if (pre && pre.q > 0) pwPre(o, pre);
    return true;
  }
  function pwPre(o, pre) {                           // qidiruvda yozilgan miqdor: «100 г» / «200 мл» → gramm; «2 ta» — taom birligida; «yarimta non» — odatiy birlik × 0,5
    o.vfill = 'tola';
    if (pre.u === 'g100' || pre.u === 'ml') { o.unit = 'g100'; o.qty = Math.round(pre.q); return; }
    o.unit = pre.u && o.food.u.some(function (u) { return u[0] === pre.u; }) ? pre.u : defUnit(o.food); o.qty = o.unit === 'g100' ? Math.round(pre.q * 100) : pre.q;
  }
  function pickFood(id, pick, pre) {
    if (!foodById(id)) { if (dbState !== 2) loadDb(function () { if (fd && foodById(id)) pickFood(id, pick, pre); }); return; }
    if (!Object.keys(fdLM).length) lmIndex();
    prepFood(fd, id, pick, pre); fd.obFrom = null; fd.orMore = false; fd.orSeen = false; fd.mode = 'portion'; fd.editId = null; fd.vsugShown = null; fd.pmore = false;
    setSheet(portionHtml()); var shp = $('#rzSheet'); if (shp) shp.scrollTop = 0;          // porsiya oynasi har doim tepadan (qidiruv ro'yxatidagi scroll saqlanmaydi)
    if (OR && orState !== 2) loadOr(function () { if (kit.sheetKind() === 'add' && fd.mode === 'portion') orRefresh(); });
  }
  function pwApplyLast(o, e, pick) {
    if (o.fam && !pick) famOpen(o, o.fam, S.famSelOf(o.fam, e.vr || null), e.sz || null);
    var ok = vOf(e.unit) ? S.vesselsFor(st, vkey(o)).some(function (v) { return 'v:' + v.id === e.unit; }) : o.food.u.some(function (u) { return u[0] === e.unit; });
    if (!ok) return; o.unit = e.unit; o.qty = e.qty > 0 ? e.qty : 1; if (e.unit === 'g100' && e.qty < 5 && e.g > 5) o.qty = e.g; if (vOf(e.unit)) o.vfill = e.vf || 'tola';
  }
  function entryOf(o) {                              // porsiya → kundalik yozuvi (porsiya oynasi va [+] uchun bitta)
    var f = o.food, pt = pwCalc(o), vv = vOf(o.unit);
    return { fid: f.id, name: f.custom ? f.n : null, meal: fd ? fd.meal : mealNow(), unit: o.unit, qty: o.qty, g: pt.g, kcal: pt.kcal, p: pt.p, f: pt.f, c: pt.c, est: !!f.e, ts: nowTs(), vr: o.fam ? f.vr : null, sz: o.fam && o.fam.fam.sz ? o.szid : null, vn: vv ? vName(vv) : null, vf: vv ? (o.vfill || 'tola') : null };
  }
  function addedToast(nm, date, ids, key) {
    toast(T('aAdded', { x: nm }), function () { ids.forEach(function (x) { S.removeFood(st, date, x); }); if (fd && fd.added) delete fd.added[key]; commit(); if (fd && kit.sheetKind() === 'add' && fd.mode === 'search') refreshRes(); }, true, 3000);
  }
  function plusUndo(key) {                           // ✓ qayta bosildi — bekor
    var cur = fd.added[key]; if (!cur) return false; [].concat(cur).forEach(function (x) { S.removeFood(st, fd.date, x); }); delete fd.added[key]; commit(); refreshRes(); kit.hideToast(); return true;
  }
  function addNow(id, pick, key, src, pre) {              // natija / «Yaqinda» [+]: qatorda ko'rsatilgan porsiya bilan darhol; ✓ bo'ladi, varaq ochiq qoladi
    if (plusUndo(key)) return; var o = {}; if (!prepFood(o, id, pick, pre)) return;
    stEv('ovqat_qoshildi', src === 'oxirgilar' ? 'oxirgilar' : 'qidiruv');
    var date = fd.date, it = S.addFood(st, date, entryOf(o)), f = o.food; fd.added[key] = it.id; commit(); vib(); refreshRes();
    addedToast(nameOf(o.fam || f) + ' · ' + pwSumQ(o), date, [it.id], key); afterWater(); jokeAfter('food', { sweet: f.t === 'h', fish: orFishKey(f, o) });
  }
  function quickAdd(d, id, key) {                    // «Yaqinda» [+] (oxirgi yozuv): xuddi o'sha porsiya bilan (AI/rasm yozuvi ham)
    if (plusUndo(key)) return; stEv('ovqat_qoshildi', 'oxirgilar');
    var x = S.dayOf(st, d), e = x && x.food.filter(function (y) { return y.id === id; })[0]; if (!e) return; var o = {};
    ['fid', 'name', 'pt', 'unit', 'qty', 'g', 'kcal', 'p', 'f', 'c', 'est', 'vr', 'sz', 'vn', 'vf', 'ifid', 'ikat'].forEach(function (k) { if (e[k] != null) o[k] = e[k]; }); o.meal = fd.meal; o.ts = nowTs();
    var date = fd.date, it = S.addFood(st, date, o), f = e.fid ? foodById(e.fid) : null, nm = e.name || (f ? nameOf(f.al ? (foodById(f.al.f) || f) : f) : '');
    if (o.ifid != null) it.ifid = o.ifid; if (o.ikat) it.ikat = o.ikat;
    fd.added[key] = it.id; commit(); vib(); refreshRes();
    addedToast(nm + ' · ' + entUnitTxt(e), date, [it.id], key); afterWater(); jokeAfter('food', { sweet: !!(f && f.t === 'h') });
  }
  function addItem(date, it) {                       // AI/rasm/shablon qatori → kundalik
    var db1 = !!it.food, e = S.addFood(st, date, { vr: it.vr, sz: it.sz, vn: vOf(it.unit) ? vName(vOf(it.unit)) : null, vf: vOf(it.unit) ? (it.vfill || 'tola') : null, fid: it.fid || null, name: it.fid ? (it.food && it.food.custom ? it.name : null) : it.name, meal: fd.meal, unit: db1 ? it.unit : null, qty: db1 ? it.qty : 1, g: it.g, kcal: it.kcal, p: it.p, f: it.f, c: it.c, est: it.est, ts: nowTs() });
    if (!it.fid) { e.name = it.name; if (it.ptxt) e.pt = String(it.ptxt).slice(0, 60); e.ifid = iconMatch(it.name) || ''; } return e;          // porsiya matni nomga QO'SHILMAYDI (alohida `pt`)
  }
  function tplAdd(id) {                              // «Odatdagi» [+]: to'plamdagi hamma taom bir bosishda
    var t = S.tplById(st, id), key = 't:' + id; if (!t || plusUndo(key)) return; stEv('ovqat_qoshildi', 'odatdagi');
    var date = fd.date, ids = tplToItems(t.items).map(function (it) { return addItem(date, it).id; }); fd.added[key] = ids; commit(); vib(); refreshRes();
    addedToast(t.name, date, ids, key); afterWater(); jokeAfter('food');
  }
  function ctaHtml(k) { var t = ctaText(k), i = t.indexOf(' · '); return i > 0 ? '<span class="ct">' + esc(t.slice(0, i)) + '<span> · ' + esc(t.slice(i + 3)) + '</span></span>' : esc(t); }          // bitta flex bola — matn bir butun (o'quvchi va innerText uchun)          // «Saqlash <span>· 665 kkal</span>»
  function ctaText(k) { return fd.editId != null ? T('pCtaE', { k: fmt(k) }) : (rHits().length ? T('pCtaForce', { k: fmt(k) }) : T('pCta_' + fd.meal)); }          // «Tushlikka qo'shish» — kkal katta raqamda ko'rinib turadi
  function portionHtml() {
    var f = fd.food, fav = f && st.favs.indexOf(f.id) > -1;
    return '<div class="sl-ph2"><button type="button" class="sl-x" data-act="fback" aria-label="' + esc(T('back')) + '">' + ico('back') + '</button><span class="sp"></span>' + (f ? '<button type="button" class="sl-x' + (fav ? ' fav' : '') + '" data-act="ffav" aria-label="' + esc(T('aFav')) + '" aria-pressed="' + fav + '">' + ico('heart') + '</button>' : '') + '<button type="button" class="sl-x sl-src" data-act="pwsrc" aria-label="' + esc(T('pManba')) + '">' + ico('info') + '</button><button type="button" class="sl-x" data-act="sheetclose" aria-label="' + esc(T('close')) + '">' + ico('x') + '</button></div>' +
      '<div id="rWarn">' + rWarnInner() + '</div>' + vSugHtml() + pwBody(fd) +
      '<div id="orBox">' + orCardHtml() + '</div><div class="pw-bar">' + (fd.editId != null ? '<button type="button" class="pw-del" data-act="fdel" aria-label="' + esc(T('del')) + '">' + ico('trash') + '</button>' : '') + '<button type="button" class="sl-main" id="fsave" data-act="fsave">' + ctaHtml(pwCalc(fd).kcal) + '</button></div>';          // v56: qotgan panel (🗑 + «Saqlash · N kkal»)          // katta tugma — porsiyadan keyin darhol; o'rinbosar taklifi — undan pastda
  }
  function fSave() {
    var f = fd.food, pt = pwCalc(fd); if (fd.editId == null) { stEv('ovqat_qoshildi', fd.yBack ? 'tavsiya' : 'qidiruv'); aiFEnd(true); }          /* v52: menyu/rasm natijasidan porsiya orqali qo'shilsa ham — qo'shildi */
    if (fd.editId != null) {
      var x = S.dayOf(st, fd.date), e = x && x.food.filter(function (y) { return y.id === fd.editId; })[0];
      if (e) {
        e.meal = fd.meal; e.g = pt.g; e.kcal = pt.kcal; e.p = pt.p; e.f = pt.f; e.c = pt.c;
        if (f) { e.fid = f.id; e.name = f.custom ? f.n : null; e.unit = fd.unit; e.qty = fd.qty; e.est = !!f.e; var ev = vOf(fd.unit); if (ev) { e.vn = vName(ev); e.vf = fd.vfill || 'tola'; } else { delete e.vn; delete e.vf; } if (fd.fam) { e.vr = f.vr; if (fd.fam.fam.sz) e.sz = fd.szid; else delete e.sz; } else { delete e.vr; delete e.sz; } } else { e.unit = null; e.qty = 1; }
      }
      kit.closeSheet(); commit(); vib(); toast(T('saved'), null, true); return;
    }
    var it = S.addFood(st, fd.date, entryOf(fd));
    var date = fd.date; kit.closeSheet(); commit(); vib(); toast(fd.saveMsg || T('saved'), function () { rowOut(it.id, function () { S.removeFood(st, date, it.id); commit(); }); }, true);
    afterWater(); jokeAfter('food', { sweet: f.t === 'h', fish: orFishKey(f, fd), alt: !!fd.obFrom });
  }
  function rowOut(id, cb) { var el = $('.sl-row[data-id="' + id + '"]'); if (el && !reduce) { el.classList.add('rz-gone'); setTimeout(cb, 230); } else cb(); }
  function openEdit(date, id) {
    var x = S.dayOf(st, date), e = x && x.food.filter(function (y) { return y.id === id; })[0]; if (!e) return;
    var f = e.fid ? foodById(e.fid) : null, vr = e.vr || null;
    if (f && f.al) { var bf = foodById(f.al.f); if (bf) { vr = vr || f.al.v; f = bf; } }       // eski id (alias) → oila + shu omillar oldindan tanlangan
    fd = { date: date, meal: e.meal, mode: 'portion', q: '', food: f, unit: e.unit, qty: e.qty, editId: id, items: [], name: e.name || '' };
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
  /* v67 «YORLIQDAN QO'SHISH» va «Qo'lda kiritish» — BITTA oyna (fd.mode 'lbl'):
     rasm → /api/kalkifit-rasm (tur: 'yorliq'; AI FAQAT yorliqdagi raqamlarni o'qiydi, limit — taom rasmi bilan umumiy) → tasdiqlash/tahrir varag'i;
     qo'lda — shu varaq bo'sh holda. Qiymat asosi: «100 g uchun» (yorliq) yoki «1 porsiya uchun» (uy taomi). 4/9/4 tekshiruvi: kkal ↔ oqsil×4 + yog'×9 + uglevod×4, ±15% dan farq — ogohlantirish (saqlashni to'smaydi).
     Saqlangani «Mening taomlarim»ga tushadi (qidiruvda birinchi, «meniki»). Anonim taklif: ruxsat BIR marta so'raladi (prefs.lbShare), yuboriladi faqat nom + 100 g raqamlari — rasm hech qachon. */
  function openLbl(src, name, basis) {
    if (!fd || kit.sheetKind() !== 'add') openAdd({});
    fd.mode = 'lbl'; fd.lb = { src: src, step: src === 'rasm' ? 'pick' : 'form', b: basis || '100', nom: name != null ? String(name).trim() : (fd.q || '').trim(), k: '', p: '', f: '', c: '', g: '', err: '', ai: false };
    setSheet(lbHtml()); if (src === 'rasm') aiPeek();
  }
  function openCustom(name) { openLbl('qolda', name, 'p'); }          // «O'z taomimni qo'shish» — o'sha varaq, qiymat porsiya uchun
  function lbRefresh() { if (fd && fd.mode === 'lbl' && kit.sheetKind() === 'add') setSheet(lbHtml()); }
  function lbAtw(k, p, f, c) { var a = Math.round(4 * p + 9 * f + 4 * c); return a > 0 && k > 0 && Math.abs(a - k) > Math.max(10, k * 0.15) ? a : 0; }
  function lbChkHtml() {
    var v = function (id) { var e = $(id); return e ? num(e.value) : 0; }, k = v('#cuK'), a = lbAtw(k, v('#cuP'), v('#cuF'), v('#cuC'));
    return a ? '<p class="rz-p warn sm" role="status">' + ico('warn', 'sl-inl') + esc(T('lbWarn', { a: fmt(a), k: fmt(k) })) + '</p>' : '';
  }
  function lbHtml() {
    var L = fd.lb, h = shBack(T(L.src === 'rasm' ? 'lbT' : (L.b === 'p' ? 'cT' : 'lbManT')), 'data-act="lbback"');
    if (L.step === 'busy') return h + '<div class="rz-empty"><div class="sl-spin" aria-hidden="true"></div><b>' + esc(T('lbBusy')) + '</b></div>';
    if (L.step === 'pick') {
      h += '<div class="kq-lbx"><i aria-hidden="true">' + ico('lbl') + '</i><p class="rz-p">' + esc(T('lbPickH')) + '</p></div>';
      if (L.err) h += '<p class="rz-p warn">' + esc(L.err) + '</p>';
      if (aiq) h += '<p class="rz-mut sm sl-aileft" id="lbAiLeft">' + esc(aiq.qoldi > 0 ? T('lbLeft', { q: aiq.qoldi, n: aiq.limit }) : T('aiLimit', { n: aiq.limit })) + '</p>';
      var off = navigator.onLine === false, dis = off || (aiq && aiq.qoldi <= 0) ? ' disabled aria-disabled="true"' : '';
      h += phNative() ? '<div class="sl-phc"><button type="button" class="rz-btn primary full" data-act="lbcam"' + dis + '>' + ico('cam') + ' ' + esc(T('phCam')) + '</button><button type="button" class="rz-btn ghost full" data-act="lbgal"' + dis + '>' + ico('img') + ' ' + esc(T('phGal')) + '</button></div>'
        : '<button type="button" class="rz-btn primary full" data-act="lbfile"' + dis + '>' + ico('cam') + ' ' + esc(T('lbShot')) + '</button>';
      if (off) h += '<p class="rz-p sm">' + esc(T('phOffline')) + '</p>';
      return h + '<button type="button" class="rz-btn ghost full kq-lbm" data-act="lbman">' + ico('pen') + ' ' + esc(T('lbMan')) + '</button>';
    }
    var per = L.b === '100', seg = function (b, k) { var on = L.b === b; return '<button type="button" class="rz-chip' + (on ? ' on' : '') + '" data-act="lbb" data-b="' + b + '" aria-pressed="' + on + '">' + esc(T(k)) + '</button>'; };
    if (L.ai) h += '<p class="rz-p sm kq-lbok">' + ico('check', 'sl-inl') + esc(T('lbAiOk')) + '</p>';
    h += '<label class="rz-f" for="cuName"><span>' + esc(T('cName')) + '</span><input id="cuName" type="text" maxlength="60" value="' + esc(L.nom) + '" placeholder="' + esc(T(per ? 'lbNamePh' : 'cName')) + '"></label>' +
      '<div class="rz-fl">' + esc(T('lbBasis')) + '</div><div class="rz-chips" role="group" aria-label="' + esc(T('lbBasis')) + '">' + seg('100', 'lbB100') + seg('p', 'lbBp') + '</div>' +
      '<div class="kq-lbg">' + numFld('cuK', T(per ? 'lbKcal' : 'cKcal'), L.k, '0', 'decimal') + numFld('cuP', T(per ? 'lbP' : 'cP'), L.p, '') + numFld('cuF', T(per ? 'lbF' : 'cF'), L.f, '') + numFld('cuC', T(per ? 'lbC' : 'cC'), L.c, '') + '</div>' +
      '<div id="lbChk">' + '</div>' + numFld('cuG', T(per ? 'lbPack' : 'cG'), L.g, '', 'numeric');
    if (prefs().lbShare == null && navigator.onLine !== false && !KD.on) h += '<label class="rz-chk kq-lbsh"><input type="checkbox" id="lbShare"><span>' + esc(T('lbShare')) + '</span></label>';
    return h + '<div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="lbback">' + esc(T('back')) + '</button><button type="button" class="rz-btn primary" data-act="cusave">' + esc(T('save')) + '</button></div>';
  }
  function lbKeep() { var L = fd.lb; [['nom', '#cuName'], ['k', '#cuK'], ['p', '#cuP'], ['f', '#cuF'], ['c', '#cuC'], ['g', '#cuG']].forEach(function (x) { var e = $(x[1]); if (e) L[x[0]] = e.value; }); }
  function lbPaint() { var w = $('#lbChk'); if (w) w.innerHTML = lbChkHtml(); }
  function lbFile(file) {
    var L = fd.lb; L.step = 'busy'; L.err = ''; lbRefresh();
    var bad = function (kind, key) { stEv('ai_sorov', 'yorliq.' + kind); L.step = 'pick'; L.err = T(key); lbRefresh(); };
    imgPrep(file, { px: 1280, maxBytes: 600000 }, function (b64, perr) {
      if (!b64) { bad(perr === 'hajm' ? 'hajm' : 'format', perr === 'hajm' ? 'phErrBig' : 'phErrFmt'); return; }
      var ctl = window.AbortController ? new AbortController() : null, tm = setTimeout(function () { if (ctl) ctl.abort(); }, 50000);
      fetch('/api/kalkifit-rasm', { method: 'POST', signal: ctl ? ctl.signal : undefined, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ img: b64, tur: 'yorliq', til: isCyr() ? 'kirill' : lang, mijoz_id: cid(), platforma: aiPlat() || undefined }) })
        .then(function (r) { clearTimeout(tm); return r.json().catch(function () { return {}; }).then(function (j) { return { s: r.status, j: j }; }); }).then(function (res) {
          if (!fd || fd.mode !== 'lbl') return; aiqSet(res.j); var y = res.j && res.j.yorliq;
          stEv('ai_sorov', 'yorliq.' + (res.s === 429 ? 'limit' : (res.s === 200 ? (y ? 'ok' : 'bosh') : (res.s === 413 ? 'hajm' : (res.s >= 500 ? 'server' : 'xato')))));
          if (res.s === 429) { L.step = 'pick'; L.err = res.j && res.j.sabab !== 'sayt' && res.j.limit > 0 ? T('aiLimit', { n: res.j.limit }) : T(res.j && res.j.sabab === 'sayt' ? 'phSite' : 'phLimit'); }
          else if (res.s !== 200) { L.step = 'pick'; L.err = T(res.s === 413 ? 'phErrBig' : (res.s >= 500 ? 'phErrSrv' : 'phErr')); }
          else if (!y) { L.step = 'pick'; L.err = T('lbNone'); }
          else { var s1 = function (x) { return x == null ? '' : String(x).replace('.', lang === 'ru' ? ',' : ','); }; L.step = 'form'; L.ai = true; L.b = '100'; L.nom = L.nom || y.nom || ''; L.k = String(y.kcal); L.p = s1(y.o); L.f = s1(y.y); L.c = s1(y.u); L.g = y.qadoq ? String(y.qadoq) : ''; L.ml = y.birlik === 'ml'; }
          lbRefresh(); lbPaint();
        }).catch(function (e) { clearTimeout(tm); var k = aiNetErr(e); bad(k, k === 'vaqt' ? 'phErrTime' : 'phErrNet'); });
    });
  }
  function lbNativePick(src) {
    if (navigator.onLine === false) return;
    KalkiNative.pickPhotoFrom(src).then(function (r) {
      if (r && r.file) { lbFile(r.file); return; } if (!r || r.cancel || !fd || fd.mode !== 'lbl') return;
      fd.lb.err = r.error === 'camera' ? T('phPerm') : T('phErrPick'); lbRefresh();
    });
  }
  function cuSave() {
    lbKeep(); var L = fd.lb || { src: 'qolda', b: 'p' }, name = String(L.nom || '').trim(), k = num(L.k), g = num(L.g), per = L.b === '100';
    if (!name) { flashEl($('#cuName')); return; } if (!(k > 0) || (per && k > 900)) { flashEl($('#cuK')); return; }
    var m = per ? 1 : 100 / (g || 100), o = { name: name, k: k * m, p: num(L.p) * m, f: num(L.f) * m, c: num(L.c) * m, src: L.src === 'rasm' ? 'yorliq' : 'qolda', lbl: per };
    if (per) o.pack = g > 0 ? g : 0; else o.g = g || 100;
    var f = S.addCustom(st, o); if (!f) return;
    stEv('yorliq', L.src === 'rasm' ? 'rasm' : 'qolda');
    var sh = $('#lbShare'); if (sh) prefs().lbShare = !!sh.checked;
    if (prefs().lbShare && !KD.on && (per || g > 0) && !lbAtw(f.k, f.p, f.f, f.c)) {          // anonim taklif: faqat nom + 100 g raqamlari (+ qadoq/porsiya og'irligi); 4/9/4 ga mos kelmasa yuborilmaydi
      try { fetch('/api/kalkifit-yorliq', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nom: f.n, kcal: f.k, o: f.p, y: f.f, u: f.c, g: per ? (g || 0) : g, birlik: L.ml ? 'ml' : 'g', manba: L.src === 'rasm' ? 'rasm' : 'qolda', til: isCyr() ? 'kirill' : lang, mijoz_id: cid() }), keepalive: true }).then(function (r) { if (r.ok) stEv('yorliq', 'taklif'); }).catch(function () {}); } catch (e) {}
    }
    save(); fd.food = f; fd.mode = 'portion'; fd.unit = f.u[0][0]; fd.qty = 1; setSheet(portionHtml());
  }

  /* ---------- matn bilan qo'shish (lokal + AI) ---------- */
  function openText(date, keep) {
    fd = keep && fd ? fd : { date: date || todayStr(), meal: mealNow(), q: '', items: [] };
    if (date) fd.date = date; if (!fd.date) fd.date = todayStr(); fd.mode = 'text'; fd.items = []; fd.missing = []; fd.busy = false; fd.txt = ''; fd.vEdit = 0; fd.usul = '';
    if (kit.sheetKind() === 'add') setSheet(textHtml()); else openSheet('add', textHtml()); loadDb();
  }
  function textHtml() {
    var offline = navigator.onLine === false, items = fd.items;
    if (fd.usul === 'ovoz' && !fd.vEdit) return shHead(T('vT')) + '<div class="sl-heard"><span class="rz-mut sm">' + esc(T('vHeard')) + '</span><q>' + esc(fd.txt || '') + '</q><button type="button" class="sl-txtbtn" data-act="vtxedit">' + ico('pen', 'sl-inl') + esc(T('vEditTx')) + '</button></div><div id="txOut">' + textOut() + '</div>';          // v52: ovozdan keyin — aytilgan gap (matn maydoni va 2-tugma yo'q; asosiy tugma bitta — «Hammasini qo'shish»)
    var h = shHead(T(fd.usul === 'ovoz' ? 'vT' : 'tT')) + '<input id="txQ" class="sl-ta" type="text" autocomplete="off" autocapitalize="off" enterkeyhint="done" placeholder="' + esc(T('tPh')) + '" aria-label="' + esc(T('tT')) + '" value="' + esc(fd.txt || '') + '"><div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="fback">' + esc(T('back')) + '</button><button type="button" class="rz-btn ' + (items.length ? 'ghost' : 'primary') + '" data-act="txgo">' + esc(T('tGo')) + '</button></div><div id="txOut">' + textOut() + '</div>';
    return h;
  }
  function exItem(e) { return { exr: true, t: e.t, min: e.min, lv: e.lv, name: T('ex_' + e.t) + ' · ' + T('exMin', { n: e.min }), kcal: S.exNet(e, S.currentWeight(st) || num(st.profile.weight)), ptxt: T('lv' + e.lv) }; }
  function itRows(items, tpl) {
    return items.map(function (it, i) { if (it.exr) return '<div class="sl-ti sl-tiex"><span class="sl-tib"><span class="m"><span class="nm">' + S.EX[it.t].e + ' ' + esc(it.name) + '</span><span class="tm">' + esc(it.ptxt) + '</span></span><b>+' + fmt(it.kcal) + '<small> ' + T('kcal') + '</small></b></span><button type="button" class="rz-x" data-act="txdel" data-i="' + i + '" aria-label="' + esc(T('del')) + '">' + ico('x') + '</button></div>'; var ap = it.ai || (it.base && !it.food); return '<div class="sl-ti' + (tpl && it.off ? ' off' : '') + '">' + (tpl ? '<button type="button" class="sl-chk' + (it.off ? '' : ' on') + '" data-act="tplchk" data-i="' + i + '" role="checkbox" aria-checked="' + !it.off + '" aria-label="' + esc(T('tplChk') + ': ' + it.name) + '">' + ico('check', '', 3) + '</button>' : '') + '<button type="button" class="sl-tib" data-act="itedit" data-i="' + i + '" aria-label="' + esc(T('pwEditRow', { x: it.name })) + '"><span class="m"><span class="nm">' + esc(it.name) + '</span><span class="tm">' + esc(it.ptxt || '') + (it.photo && it.dbk ? ' · ' + esc(T('phDb')) : '') + (it.ai ? ' · ' + esc(it.photo ? T('phAiKcal') : T('tAiTag')) : (ap ? ' · ' + esc(T('aEst')) : '')) + '</span></span><b>' + (ap ? '≈ ' : '') + fmt(it.kcal) + '<small> ' + T('kcal') + '</small></b>' + ico('pen', 'sl-pen') + '</button>' + (tpl ? '' : '<button type="button" class="rz-x" data-act="txdel" data-i="' + i + '" aria-label="' + esc(T('del')) + '">' + ico('x') + '</button>') + '</div>' + (it.photo && it.ph && !tpl ? '<div class="sl-alt" role="group" aria-label="' + esc(T('phNotIt')) + '"><span>' + esc(T('phNotIt')) + '</span>' + (it.alts || []).map(function (v, k) { return '<button type="button" class="rz-chip" data-act="phalt" data-i="' + i + '" data-k="' + k + '">' + esc(v.nom) + '</button>'; }).join('') + '<button type="button" class="rz-chip sl-altq" data-act="phfind" data-i="' + i + '">' + ico('search', 'sl-inl') + esc(T('phFind')) + '</button></div>' : ''); }).join('');
  }
  function textOut() {
    var items = fd.items, h = '', offline = navigator.onLine === false;
    if (fd.parsed && !items.length && !(fd.missing || []).length) h += '<div class="rz-mut">' + esc(T('tEmpty')) + '</div>';
    h += itRows(items);
    if ((fd.missing || []).length) {
      h += '<p class="rz-p warn">' + esc(T('tMiss', { x: fd.missing.join(', ') })) + '</p>';
      h += offline ? '<p class="rz-p sm">' + esc(T('tOffline')) + '</p>' : '<button type="button" class="rz-btn ghost full" data-act="txai"' + (fd.busy ? ' disabled' : '') + '>' + esc(fd.busy ? T('tAiBusy') : T('tAi')) + '</button><p class="rz-p sm">' + esc(T('tAiNote')) + '</p>';
    }
    if (fd.aiErr) h += '<p class="rz-p warn" id="txAiErr">' + esc(fd.aiErr === 'limit' ? (fd.usul === 'ovoz' ? T('ovLimit') : T('aiLimit', { n: fd.aiLim })) : T(fd.aiErr === 'busy' ? 'tAiSite' : 'tAiErr')) + '</p>';
    if (items.length) h += '<div class="rz-fl">' + esc(T('pMeal')) + '</div>' + mealChips(fd.meal, 'fmeal3') + '<p class="rz-p sm">' + esc(T('tHelp')) + (items.some(function (x) { return x.ai; }) ? ' ' + esc(T('tkNote')) : '') + '</p><div class="rz-actions sl-sticky"><button type="button" class="rz-btn primary" data-act="txsave">' + esc(T('pwAll', { n: items.length })) + '</button></div>';
    return h;
  }
  function txRefresh() { var o = $('#txOut'); if (o) o.innerHTML = textOut(); }
  function txGo() {
    var tq = $('#txQ'); if (tq) fd.txt = tq.value; var run = function () {
      var r = S.parseText(fd.txt, allFoods(), { recents: st.recents, favs: st.favs, freq: S.freqMap(st, todayStr(), 30, dbAlias), vessels: st.vessels }); fd.parsed = true; fd.aiErr = false;
      fd.items = r.items.map(function (x) { var it = { name: nameOf(x.fam || x.food), fid: x.fid, food: x.food, unit: x.unit, qty: x.unit === 'g100' ? Math.round(x.g) : x.qty, est: x.est, ai: false, vfill: x.vfill }; if (x.fam) { it.fam = x.fam; it.sel = x.sel; it.szid = x.szid; it.vr = x.vr; it.sz = x.sz; var lb = S.famLabel(x.fam, x.vr, x.szid, lang); if (lb) it.name += ' · ' + lb; } itSync(it); return it; });
      (r.ex || []).forEach(function (e) { fd.items.push(exItem(e)); });          // v55: mashg'ulot qatorlari (kkal — formula)
      fd.missing = r.missing; txRefresh(); var u0 = fd.usul === 'ovoz' ? 'ovoz' : 'matn'; if (fd.items.length || fd.missing.length) aiFOpen(u0); else stEv('ai_natija', u0 + '.bosh');
    };
    if (dbState === 2) run(); else loadDb(function () { run(); });
  }
  /* ---------- anonim statistika (assets/stat-kun.js → /api/stat): faqat hodisa nomi + qat'iy kalit; ovqat/vazn/yosh yuborilmaydi ---------- */
  var STAT = null;
  var stPre = [];          // v52: statistika hali yuklanmagan paytdagi hodisalar (birinchi chizish) — yuklangach yuboriladi
  function stEv(h, k) { try { if (STAT) STAT.add(h, k); else if (stPre.length < 30) stPre.push([h, k]); } catch (e) {} }
  /* v52: AI natija voronkasi (anonim): natija ekrani ochildi → qator tahrirlandi / o'chirildi → «Qo'shish» yoki qo'shmasdan yopildi (+ necha soniyada). Usul: ovoz | rasm | matn | menyu */
  var aiF = null;
  function aiFOpen(u) { if (aiF && aiF.u === u) return; if (aiF) aiFEnd(false); aiF = { u: u, t0: Date.now() }; stEv('ai_natija', u + '.ochildi'); }
  function aiFMark(k) { if (!aiF || aiF[k]) return; aiF[k] = 1; stEv('ai_natija', aiF.u + '.' + k); }
  function aiFEnd(ok) { if (!aiF) return; var sec = (Date.now() - aiF.t0) / 1000, b = sec < 10 ? '10' : (sec < 30 ? '30' : (sec < 60 ? '60' : (sec < 180 ? '180' : 'x'))); stEv('ai_natija', aiF.u + (ok ? '.qoshildi' : '.yopildi')); stEv('ai_natija', aiF.u + (ok ? '.qt' : '.yt') + b); aiF = null; }
  function statPlat() { try { if (window.KalkiNative && KalkiNative.isApp()) return 'android'; var ios = /iPad|iPhone|iPod/.test(navigator.userAgent), sa = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true; return ios && sa ? 'ios-pwa' : 'veb'; } catch (e) { return 'veb'; } }
  function statBoot() {
    if (!window.KalkiStat || STAT) return; STAT = KalkiStat.create({ cid: cid, platform: statPlat, lang: function () { return isCyr() ? 'cyr' : (lang === 'ru' ? 'ru' : 'uz'); }, ver: function () { return statPlat() === 'android' ? (appVer || lsGet('kalki_app_ver') || '') : ''; } }); window.KalkiStatApp = { add: stEv, aiOpen: aiFOpen }; stPre.splice(0).forEach(function (x) { stEv(x[0], x[1]); });
    STAT.manba();          // v61: manba birinchi ochilishda (onboarding'dan OLDIN) qurilmada bir marta saqlanadi
    if (st && st.setup) STAT.faol();
    if (/[?&]baliq=1\b/.test(location.search)) stEv('push_bosildi');
  }
  function cid() { try { var c = lsGet(LS_CID); if (!c) { c = (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (ch) { var r = Math.random() * 16 | 0; return (ch === 'x' ? r : (r & 3 | 8)).toString(16); })); localStorage.setItem(LS_CID, c); } return c; } catch (e) { return ''; } }
  function rGuess(nm) {                               // bazaga moslanmagan AI/rasm qatori: nomdan taom taniladimi? tanilsa — «Yemaydiganlarim» teglari (yumshoq ogohlantirish uchun)
    try { if (!Y || !Y.chReady()) return []; var r = S.parseText(String(nm || '').split(' · ')[0], allFoods(), { recents: st.recents, favs: st.favs, freq: S.freqMap(st, todayStr(), 30, dbAlias), vessels: st.vessels }); if (r.items.length !== 1 || r.missing.length) return []; var x = r.items[0]; return rI(x.fam || x.food, x.fam ? x.vr : null).hit; } catch (e) { return []; }
  }
  function aiItem(o, relax) {                               // AI javobini bazaga moslash: nom + porsiya → eng yaqin taom/oila/birikma; kkal AI bilan ±50…160% ichida bo'lsa baza qiymati (aks holda AI «taxminiy»)
    try {
      var r = S.parseText(String(o.porsiya || '') + ' ' + String(o.nom || '').split(' · ')[0], allFoods(), { recents: st.recents, favs: st.favs, freq: S.freqMap(st, todayStr(), 30, dbAlias), vessels: st.vessels });
      if (r.items.length !== 1 || r.missing.length) return null; var x = r.items[0], pt = S.portion(x.food, x.g);
      if (!o.fid && !relax && !(o.kcal > 0 && pt.kcal >= o.kcal * 0.5 && pt.kcal <= o.kcal * 1.6)) return null;
      var it = { name: nameOf(x.fam || x.food), fid: x.fid, food: x.food, unit: x.unit, qty: x.unit === 'g100' ? Math.round(x.g) : x.qty, est: x.est, ai: false, fromAi: true, vfill: x.vfill };
      if (x.fam) { it.fam = x.fam; it.sel = x.sel; it.szid = x.szid; it.vr = x.vr; it.sz = x.sz; var lb = S.famLabel(x.fam, x.vr, x.szid, lang); if (lb) it.name += ' · ' + lb; } itSync(it); return it;
    } catch (e) { return null; }
  }
  function txAi() {
    if (fd.busy || !fd.missing.length) return; fd.busy = true; fd.aiErr = false; txRefresh();
    var body = { matn: fd.missing.join(', ').slice(0, 300), til: isCyr() ? 'kirill' : lang, mijoz_id: cid() }; if (fd.usul === 'ovoz') { body.manba = 'ovoz'; if (aiPlat()) body.platforma = aiPlat(); if (fd.ovTok) body.ovoz_tok = fd.ovTok; }          // ovoz: umumiy AI hisobi (rasm/retsept/menyu bilan)
    fetch('/api/kalkifit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); }).then(function (res) {
      fd.busy = false; if (!res.ok || !res.j || !res.j.ovqatlar) { stEv('ai_sorov', (fd.usul === 'ovoz' ? 'ovoz' : 'matn') + (res.j && res.j.sabab ? '.limit' : '.xato')); fd.aiErr = res.j && res.j.sabab === 'sayt' ? 'busy' : (res.j && res.j.sabab && res.j.limit > 0 ? 'limit' : true); fd.aiLim = res.j && res.j.limit; if (fd.usul === 'ovoz' && res.j && res.j.sabab) ovqSet({ limit: res.j.limit, qoldi: 0 }); txRefresh(); return; }
      if (!(fd.usul === 'ovoz' && fd.ovTok)) stEv('ai_sorov', (fd.usul === 'ovoz' ? 'ovoz' : 'matn') + '.ok'); if (fd.usul === 'ovoz') ovqSet(res.j);          // v52: server ovozi transkripsiyada (ovPost) allaqachon «ovoz.ok» — ikki marta sanalmaydi
      res.j.ovqatlar.forEach(function (o) { var m = aiItem(o); if (m) { fd.items.push(m); return; } fd.items.push({ name: o.nom, fid: null, food: null, rHit: rGuess(o.nom), unit: 'pc', qty: 1, g: o.g || 0, kcal: Math.round(o.kcal), p: o.o, f: o.y, c: o.u, est: true, ai: true, ptxt: o.porsiya || '', base: { g: o.g || 0, kcal: Math.round(o.kcal), p: o.o || 0, f: o.y || 0, c: o.u || 0 } }); });
      fd.missing = []; txRefresh();
    }).catch(function () { stEv('ai_sorov', (fd.usul === 'ovoz' ? 'ovoz' : 'matn') + '.xato'); fd.busy = false; fd.aiErr = true; txRefresh(); });
  }
  function txSave() {
    var list = fd.items.filter(function (i) { return !i.off; }), n = list.length, date = fd.date, ids = [], exIds = []; if (!n) return;
    var exs = list.filter(function (it) { return it.exr; }); list = list.filter(function (it) { return !it.exr; }); exs.forEach(function (it) { exIds.push(S.addEx(st, date, it).id); stEv('mashq_qoshildi', it.t + '.' + exBucket(it.min)); });          // v55: mashg'ulot qatorlari
    if (list.length) stEv('ovqat_qoshildi', fd.mode === 'photo' ? 'rasm' : (fd.usul || 'matn')); aiFEnd(true);
    list.forEach(function (it) { sendTaklif(it); ids.push(addItem(date, it).id); });
    kit.closeSheet(); heroPrev = null; commit(); vib(); toast(T('saved') + ': ' + n, function () { ids.forEach(function (id) { S.removeFood(st, date, id); }); exIds.forEach(function (id) { S.removeEx(st, date, id); }); commit(); }, true); if (list.length) jokeAfter('food'); if (exs.length) jobAskOnce();
  }

  /* ---------- qadam ---------- */
  /* Avtomatik qadam (faqat Android ilovasi: apparat hisoblagich, KalkiNative.qadam). Veb/iPhone'da QA = null — hamma narsa avvalgidek.
     prefs().qa: undefined (hali so'ralmagan) | 'on' | 'off' (rad etildi / o'chirildi) | 'later' («Keyinroq» — qayta so'ralmaydi, Profil'dan yoqiladi). */
  var QA = null, qaS = { avail: false, granted: false, src: '', hc: '', hcToday: 0, sensor: false, sensorG: false, fit: false, loaded: false }, qaFlow = '';
  /* v49: plagin aniqlash BIR MARTALIK emas — ko'prik (Capacitor.PluginHeaders) kech tayyor bo'lsa ham keyingi chizishda topiladi; karta ilovada (native) DOIM bor, plagin topilmasa ham (holat izohi bilan) */
  function qaDetect() { if (!QA) { try { if (window.KalkiNative && KalkiNative.qadam && KalkiNative.qadam.ok()) { QA = KalkiNative.qadam; qaBootLate(); } } catch (e) {} } return QA; }
  function stepCard() { qaDetect(); return !!QA || isNativeApp(); }          // Android ilovasi (veb/iPhone — false: kartasiz)
  var qaBooted = false;
  function qaBootLate() { if (qaBooted || !st) return; qaBooted = true; setTimeout(function () { qaBoot(); }, 0); }
  qaDetect();
  /* Bugun → qadam kartasi (Android ilovada DOIM): yoqilgan — son, progress, manba; ruxsat yo'q / rad etilgan — «Qadamni yoqish»; sensor yo'q — qisqa izoh; plagin yo'q (eski ilova) — «ilovani yangilang» */
  function stepState() {
    if (!QA) return 'old'; if (!qaS.loaded) return 'wait'; if (qaOn()) return 'on';
    if (!qaS.avail) return 'nosensor'; return prefs().qa === 'off' && !qaS.granted ? 'denied' : 'off';
  }
  function stepCardHtml(x) {                         // Android (avtomatik): v56 uslubi — sarlavha + manba belgisi (qo'lda «+» yo'q), mini doira, kkal yorlig'i; v49 holatlari pastda
    var s0 = stepState(), steps = x.steps || 0, g = st.stepGoal || 8000, dp = S.dayPlan(st, todayStr()), kc = s0 === 'on' ? dp.stepCredit || 0 : 0;          // v58: kredit
    var foot = s0 === 'on' ? (qaFitBtn() || (kc ? '<span class="chip c-bl">+' + fmt(kc) + ' ' + T('kcal') + '</span>' : '')) : s0 === 'off' || s0 === 'denied' ? '<button type="button" class="sl-pill" data-act="qaulash">' + ico('steps') + '<span>' + esc(T('qaOnBtn')) + '</span></button>' : s0 === 'nosensor' ? '<span class="sl-src sl-stnote">' + esc(T('qaNoSensorS')) + '</span>' : s0 === 'old' ? '<span class="sl-src sl-stnote">' + esc(T('qaOldApp')) + '</span>' : '';
    return '<section class="sl-card sl-ab2 sl-s" data-st="' + s0 + '"><div class="ah"><b>' + esc(T('sT')) + '</b></div><button type="button" class="mr' + (steps >= 10000 ? ' w5' : '') + '" data-act="addsteps" aria-label="' + esc(T('stepsT')) + '">' + miniRing('s', steps / g, '👟', 'c-bl') + '<span class="mv"><b id="sNum"' + (steps ? '' : ' class="z"') + '>' + fmt(steps) + '</b><small>/ ' + fmt(g) + '</small></span></button>' + (qaSrcHtml() ? '<span class="sl-abs2">' + qaSrcHtml() + '</span>' : '') + foot + '</section>';          // manba belgisi — doira ostida (sarlavha qisqarmasin)
  }
  function qaOn() { return !!(QA && qaS.avail && qaS.granted && prefs().qa === 'on'); }
  function qaBadge() { return ''; }                 // eski «Avtomatik» belgisi o'rniga kartada manba nomi (qaSrcHtml)
  function qaZero() { var x = S.dayOf(st, todayStr()); return qaOn() && !(x && x.steps > 0) && (!qaS.sensorG || new Date().getHours() >= 11); }          // ulangan, lekin qadam kelmayapti
  function qaSrcHtml() { if (!qaOn()) return ''; if (qaZero()) return '<span class="sl-src">' + esc(T('qaNone')) + '</span>'; return '<span class="sl-src">' + esc(T(qaS.src === 'hc' ? 'qaSrc_hc' : 'qaSrc_sensor')) + '</span>'; }
  function qaFitBtn() {                              // qadam kelmayapti: sensor ruxsati yo'q bo'lsa — «Qadamlarni ulash»; aks holda Google Fit (Health Connect'ga yozadi)
    if (!qaZero()) return ''; if (qaS.sensor && !qaS.sensorG) return '<button type="button" class="sl-pill" data-act="qaulash">' + esc(T('qaConnT')) + '</button>';
    return !qaS.fit && qaS.hc !== 'none' ? '<button type="button" class="sl-pill" data-act="qafit">' + esc(T('qaFit')) + '</button>' : '';
  }
  /* yashirin diagnostika: Profil → versiya qatorini 5 marta bosish */
  var verN = 0, verT = 0, appVer = '';
  function verTap() { var now = Date.now(); if (now - verT > 1500) verN = 0; verT = now; if (++verN >= 5) { verN = 0; openDiag(); } }
  function selAll(el) { try { var r = document.createRange(); r.selectNodeContents(el); var sl = getSelection(); sl.removeAllRanges(); sl.addRange(r); } catch (e) {} }
  function openDiag() {
    var x = S.dayOf(st, todayStr()) || {}, head = 'KalkiFit ' + (appVer || '-') + ' · ' + new Date().toString() + '\nprefs.qa: ' + prefs().qa + '\nholat: ' + JSON.stringify(qaS) + '\nbugun (sayt): steps ' + (x.steps || 0) + ', avtomatik ' + (x.sa || 0) + '\n--- telefon ---\n';
    (QA && QA.diag ? QA.diag() : Promise.resolve('Qadam plagini yo\'q (veb)')).then(function (t) {
      openSheet('diag', shHead(T('diagT')) + '<pre class="sl-diag" id="diagTxt">' + esc(head + t) + '</pre><div class="rz-actions"><button type="button" class="rz-btn primary" data-act="diagcopy">' + esc(T('diagCopy')) + '</button></div>');
    });
  }
  function qaInfo() {                               // avtomatik qadam: karta bosilganda — bugungi jami va manba (qo'lda kiritish yo'q)
    var x = S.dayOf(st, todayStr()) || { steps: 0 };
    openSheet('qainfo', shHead(T('stepsT')) + '<div class="rz-amt"><span>' + fmt(x.steps || 0) + '</span><small> / ' + fmt(st.stepGoal) + '</small></div><p class="rz-mut sm sl-qasrc">' + esc(qaZero() ? T('qaNone') : T(qaS.src === 'hc' ? 'qaSrc_hc' : 'qaSrc_sensor')) + '</p>' + (!qaS.sensor ? '<p class="rz-p sm">' + esc(T('qaNoSensor')) + '</p>' : '') + (qaZero() && !qaS.fit && qaS.hc !== 'none' ? '<p class="rz-p sm">' + esc(T('qaFitH')) + '</p><div class="rz-actions"><button type="button" class="rz-btn ghost full" data-act="qafit">' + esc(T('qaFit')) + '</button></div>' : '') + okBtn());
  }
  function qaRowHtml() {                            // Profil: «Qadamni avtomatik sanash» — Eslatmalar kartasidagi kabi switch + bitta qisqa izoh (faqat Android ilova)
    if (!QA || !qaS.avail) return ''; var on = qaOn();
    return '<div class="sl-remc sl-qarow"><div class="sl-remr" id="qaRow"><div class="sl-remm"><span class="ic" aria-hidden="true">👟</span><span class="t"><b>' + esc(T('qaRow')) + '</b><small>' + esc(T(on && qaS.src === 'hc' ? 'qaRowHc' : 'qaRowS')) + '</small></span></div>' + swHtml(on, 'qatog', T('qaRow'), false, ' data-v="' + (on ? '0' : '1') + '"') + '</div></div>';
  }
  function qaView() { return !kit.sheetKind() && st.setup && (view === 'today' || view === 'history' || view === 'profile'); }
  function qaRefresh() {
    if (!QA) return;
    QA.status().then(function (r) {
      var key = function () { return [qaOn(), qaS.loaded, qaS.avail, qaS.src, qaS.hc, qaS.hcToday > 0, qaS.sensor, qaS.sensorG, qaS.fit].join('|'); }, was = key();
      qaS.loaded = true; qaS.avail = !!(r && r.available); qaS.granted = !!(r && r.granted); qaS.src = (r && r.source) || ''; qaS.hc = (r && r.hc) || ''; qaS.hcToday = +(r && r.hcToday) || 0; qaS.sensor = !!(r && r.sensor); qaS.sensorG = !!(r && r.sensorGranted); qaS.fit = !!(r && r.fit);
      if (qaFlow === 'hc' && qaS.hc === 'ok') { qaFlow = 'hc2'; if (kit.sheetKind() === 'qaask') qaAsk(); setTimeout(function () { if (document.visibilityState === 'visible') qaGo(); }, 500); }          // Play Market'dan qaytdi — jarayon o'zi davom etadi (ruxsat oynasi)
      if (qaS.avail && prefs().qa != null) QA.enable(qaOn());
      if (qaOn()) qaSync(); if (was !== key() && qaView()) render();
    });
  }
  function devSync() {                               // v62: soat sarfi (Health Connect, 1.0.7) — oxirgi 7 kun; S.dayPlan kun oxirida solishtiradi
    if (!QA || !QA.energiya || prefs().hcE !== 'on' || !st.setup) return Promise.resolve();
    return QA.energiya(7).then(function (list) {
      var t = todayStr(), ch = false; (list || []).forEach(function (k) { if (!k || typeof k.sana !== 'string' || !Dt.parse(k.sana) || k.sana > t) return; var x = S.dayOf(st, k.sana), old = JSON.stringify(x && x.dev || null); S.setDev(st, k.sana, k); var nx = S.dayOf(st, k.sana); if (JSON.stringify(nx && nx.dev || null) !== old) ch = true; });
      if (ch) { save(); if (view === 'today' && !kit.sheetKind()) render(); }
    });
  }
  function hcEon() {
    if (!QA || !QA.eUlash) return; QA.eUlash().then(function (r) {
      if (r && r.old) return toast(T('hcEold')); if (!(r && r.granted)) return toast(T('hcEno'));
      prefs().hcE = 'on'; save(); stEv('soat_ulandi'); toast(T('hcEok'), null, true); devSync().then(function () { if (kit.sheetKind() === 'xkcal') openKcalHow(); });
    });
  }
  function qaSync() {
    devSync();
    if (!qaOn()) return;
    QA.days(7).then(function (list) {
      if (!qaOn() || !st.setup) return; var ch = false, t = todayStr(); if (list.source != null && list.source !== qaS.src) { qaS.src = list.source; ch = true; } if (list.hcToday != null) qaS.hcToday = +list.hcToday || 0;
      list.forEach(function (k) { if (k && typeof k.sana === 'string' && Dt.parse(k.sana) && k.sana <= t && (k.qadam > 0 || st.days[k.sana])) ch = S.setAutoSteps(st, k.sana, k.qadam) || ch; });
      if (!ch) return;
      save(); if (qaView() && view !== 'profile') { render(); afterWater(); }
    });
  }
  function qaBoot() {
    if (!qaDetect()) return; qaBooted = true;
    qaRefresh();
    setInterval(function () { if (document.visibilityState === 'visible') qaSync(); }, 60000);          // ekran ochiq bo'lsa — har daqiqada
    var liveT = 0; if (QA.onLive) QA.onLive(function (e) { var x = S.dayOf(st, todayStr()); if (!qaOn() || !(e.sensor > ((x && x.sa) || 0))) return; var now = Date.now(); if (now - liveT < 4000) return; liveT = now; qaSync(); });      // sensor jonli: yurgan sari son o'sadi
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') qaRefresh(); });
  }
  function qaAsk() {                                // «Qadamlarni ulash»: BITTA tugma, har qadamda bitta jumla (1/2 o'rnatish → Play Market → qaytganda o'zi 2/2 ruxsat oynasi)
    var inst = qaS.hc === 'install', h = shHead(T('qaConnT')) + '<p class="rz-p">' + esc(T('qaH')) + '</p>';
    if (inst) h += '<p class="rz-p sl-qastep">' + esc(T('qaConn1')) + '</p><div class="rz-actions"><button type="button" class="rz-btn primary" data-act="qahc">' + esc(T('qaHcInst')) + '</button></div>' + (qaS.sensor ? '<p class="sl-qafix"><button type="button" class="sl-txtbtn" data-act="qayes">' + esc(T('qaSkipHc')) + '</button></p>' : '');
    else h += '<p class="rz-p sl-qastep">' + esc(T(qaFlow === 'hc2' ? 'qaConn2' : 'qaConnOne')) + '</p><div class="rz-actions"><button type="button" class="rz-btn primary" data-act="qayes">' + esc(T('qaYes')) + '</button><button type="button" class="rz-btn ghost" data-act="qalater">' + esc(T('qaLater')) + '</button></div>';
    if (prefs().qa === 'off' && !qaS.granted) h += '<p class="rz-p sm sl-qahint">' + esc(T('qaSetHint')) + '</p>'; /* rad etilgan: sozlamalarga qo'lda yo'l (APK'da «sozlamani ochish» yo'q) */
    openSheet('qaask', h);
  }
  function qaGo() { qaFlow = ''; qaAllow(kit.sheetKind() === 'qaask'); }
  function qaAllow(fromAsk) {
    (QA.ulash || QA.perm)().then(function (r) {
      qaS.granted = !!(r && r.granted); if (r && r.source != null) qaS.src = r.source; if (r && r.hc) qaS.hc = r.hc; if (r && r.sensor != null) { qaS.sensor = !!r.sensor; qaS.sensorG = !!r.sensorGranted; } prefs().qa = qaS.granted ? 'on' : 'off'; save();
      if (fromAsk) kit.closeSheet();
      if (qaS.granted) { stEv('qadam_ulandi', qaS.src === 'hc' ? 'hc' : 'sensor'); QA.enable(true).then(function () { qaSync(); }); toast(T('qaOnT'), null, true); } else toast(T('qaDenied'));
      render();
    });
  }
  function qaToggle(on) {
    if (!QA) return;
    if (on) { if (qaS.hc === 'install' && !qaS.sensor) qaAsk(); else qaAllow(false); return; }
    prefs().qa = 'off'; save(); QA.enable(false); render();
  }
  function stepsOpen() { if (!qaDetect()) { toast(T('qaOldApp')); return; } if (qaS.avail && !qaOn()) { qaAsk(); return; } qaInfo(); }          // qadam faqat avtomatik: ulanmagan — ulash oynasi, ulangan (yoki sensor/Health Connect yo'q) — bugungi jami va manba
  var sp = null;
  function openGoal() {                              // kunlik qadam maqsadi (qadamning o'zi qo'lda kiritilmaydi)
    sp = { val: '' };
    openSheet('steps', shHead(T('stGoalSet')) + '<div class="rz-amt" id="spAmt"><span id="spNum">0</span></div><p class="rz-mut sm" id="spHint">' + esc(fmt(st.stepGoal)) + '</p>' + kit.padHtml('int000') + '<div class="rz-actions"><button type="button" class="rz-btn primary" id="spSave" data-act="spsave" disabled>' + esc(T('save')) + '</button></div>');
  }
  function spUpdate() { $('#spNum').textContent = sp.val ? fmt(+sp.val) : '0'; $('#spSave').disabled = !sp.val; }
  function afterWater() { /* qadam/suv/ovqat saqlangach sokin bayram tekshiruvi */ var t = todayStr(), x = S.dayOf(st, t); if (!x) return; var p = prefs(); if (!p.cel || p.cel.d !== t) p.cel = { d: t }; var pl = planNow();
    if (wInfo(t).glasses >= pl.water.glasses && !p.cel.w) { p.cel.w = 1; save(); celebrate('wCard', T('wDone')); }
    if (x.steps >= st.stepGoal && !p.cel.s) { p.cel.s = 1; save(); celebrate('kcalBtn', T('sGoalDone')); } }
  function celebrate(id, msg) { setTimeout(function () { var el = document.getElementById(id) && $('#' + id); if (el) { el.classList.remove('glow'); void el.offsetWidth; el.classList.add('glow'); } toast(msg, null, true); vib(25); }, 350); }
  function spSave() { st.stepGoal = Math.max(1000, Math.min(100000, +sp.val)); kit.closeSheet(); commit(); vib(); toast(T('saved'), null, true); }

  /* ---------- vazn ---------- */
  var wf = null;
  function openWeight() {
    wf = { val: dec(S.currentWeight(st), 1) };
    openSheet('weight', shHead(T('wtT')) + '<div class="rz-amt" id="wfAmt"><span id="wfNum">' + esc(wf.val) + '</span><small> ' + KG() + '</small></div>' + kit.padHtml('dec') + kit.dpHtml('wfDate', T('wDay'), todayStr(), 'past', null, todayStr()) + '<div class="rz-actions"><button type="button" class="rz-btn primary" data-act="wfsave">' + esc(T('save')) + '</button></div>');
    wf.val = '';
  }
  function wfSave() {
    var kg = num(wf.val.replace(',', '.')), d = kit.dpGet('wfDate') || todayStr(); if (!S.addWeight(st, d, kg)) { flashEl($('#wfAmt')); return; }
    st.profile.weight = S.currentWeight(st); kit.closeSheet(); commit(); vib(); toast(T('saved'), null, true); jokeAfter('weight', { kg: kg });
  }

  /* ---------- profil tahriri ---------- */
  var pe = null;
  function openProfile() {
    var p = st.profile; pe = { sex: p.sex, preg: p.preg, act: p.act, goal: p.goal, job: p.job || null };
    openSheet('prof', profHtml(p));
  }
  function peSlider(id, f, v) {                          // Profil tahriri ham slayder: chegaralar mavjud qiymatni o'z ichiga oladi (eski qiymat o'zgarib ketmasin)
    var lm = OBLIM[f], x = num(v) || obDef(pe.sex)[f], mn = Math.min(lm.min, Math.floor(x)), mx = Math.max(lm.max, Math.ceil(x)), unit = { age: lang === 'ru' ? 'лет' : 'yosh', height: lang === 'ru' ? 'см' : 'sm', weight: lang === 'ru' ? 'кг' : 'kg' }[f], lb = { age: 'pfAge', height: 'pfH', weight: 'pfW' }[f];
    return '<div class="rz-fl">' + esc(T(lb)) + '</div><div class="sl-pe-sld">' + SL.html({ id: id, min: mn, max: mx, step: lm.step, value: x, unit: unit, label: T(lb), minus: T('sldMinus'), plus: T('sldPlus'), edit: T('sldEdit') }) + '</div>';
  }
  function profHtml(p) {
    var lock = S.restrictions({ age: num(p.age), sex: pe.sex, preg: pe.preg, weight: num(p.weight), height: num(p.height) }).keepOnly;
    return shHead(T('meEdit')) + '<div class="rz-fl">' + esc(T('pfSex')) + '</div>' + segHtml(T('pfSex'), [{ attrs: 'data-act="pesex" data-v="m"', on: pe.sex === 'm', text: T('male') }, { attrs: 'data-act="pesex" data-v="f"', on: pe.sex === 'f', text: T('female') }]) + '' +
      (pe.sex === 'f' ? '<label class="rz-chk"><input type="checkbox" id="peP"' + (pe.preg ? ' checked' : '') + '><span>' + esc(T('preg')) + '</span></label>' : '') +
      peSlider('peA', 'age', p.age) + peSlider('peH', 'height', p.height) + peSlider('peW', 'weight', p.weight) + numFld('peG', T('meGoalW'), p.goalWeight ? dec(p.goalWeight, 1) : '', '') +
      '<div class="rz-fl">' + esc(T('pfAct')) + '</div><div class="rz-chips">' + [1, 2, 3, 4, 5].map(function (a) { return '<button type="button" class="rz-chip' + (pe.act === a ? ' on' : '') + '" data-act="peact" data-v="' + a + '">' + esc(T('a' + a)) + '</button>'; }).join('') + '</div>' +
      '<div class="rz-fl">' + esc(T('pfGoal')) + '</div><div class="rz-chips">' + ['keep', 'slow', 'lose', 'gain'].map(function (g) { var off = lock && g !== 'keep'; return '<button type="button" class="rz-chip' + (pe.goal === g ? ' on' : '') + (off ? ' off' : '') + '" data-act="pegoal" data-v="' + g + '"' + (off ? ' aria-disabled="true"' : '') + '>' + esc(T('g' + g)) + '</button>'; }).join('') + '</div>' + (lock ? '<p class="rz-p warn">' + esc(T('gLocked')) + '</p>' : '') +
      (jobUi() ? '<div class="rz-fl">' + esc(T('jobRow')) + '</div><div class="rz-chips">' + JOBS.map(function (j) { return '<button type="button" class="rz-chip' + (pe.job === j ? ' on' : '') + '" data-act="pejob" data-v="' + j + '">' + esc(T('job_' + j)) + '</button>'; }).join('') + '</div>' : '') +
      '<div class="rz-actions"><button type="button" class="rz-btn primary" data-act="pesave">' + esc(T('save')) + '</button></div>';
  }
  function peRead() { var p = {}; var e = $('#peA'); if (!e) return null; p.age = num($('#peA').value); p.height = num($('#peH').value); p.weight = num($('#peW').value); p.goalWeight = num($('#peG').value) || null; if ($('#peP')) pe.preg = $('#peP').checked; return p; }
  function peRepaint() { var cur = peRead() || {}; var p = Object.assign({}, st.profile, cur); var sh = $('#rzSheet'); var keep = sh.scrollTop; setSheet(profHtml(p)); sh.scrollTop = keep; }
  function peSave() {
    var r = peRead(), np = { sex: pe.sex, preg: pe.sex === 'f' && pe.preg, age: r.age, height: r.height, weight: r.weight, act: pe.act, goal: pe.goal, goalWeight: r.goalWeight };
    if (st.profile.tartib) np.tartib = st.profile.tartib; if (st.profile.protG) np.protG = st.profile.protG; if (pe.job || st.profile.job) np.job = pe.job || st.profile.job; if (st.profile.corr) np.corr = st.profile.corr;          // v50/v51: tahrirlashda «Kun tartibi» va qo'lda oqsil maqsadi o'chib ketmasin
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

  /* ---------- ovozli kiritish (assets/kalkifit-ovoz.js): ovoz → matn (qurilmada) → odatiy matn oqimi (bazadan kkal; topilmagani — BITTA AI so'rov, umumiy limit) ---------- */
  var VO = null, vs = null, ovSrv = false;            // ovSrv — serverda OPENAI kaliti bor (GET /api/ovoz); yo'q bo'lsa iOS'da 🎤 ko'rinmaydi
  function micCan() {                               // ro'yxatda ko'rsatish: hozir ishlaydi YOKI server yo'li (iPhone veb) javobi hali kelmagan, lekin brauzer yozib ola oladi
    if (micOk()) return true; if (ovDone || !window.KalkiOvoz) return false; var n = navigator; return !!(window.MediaRecorder && n.mediaDevices && n.mediaDevices.getUserMedia);
  }
  function micOk() { if (!VO && window.KalkiOvoz) VO = KalkiOvoz.create({ lang: function () { return lang; }, server: function () { return ovSrv; }, post: ovPost }); return !!(VO && VO.ok()); }
  var ovAsked = false;
  var ovDone = false, ovW = [];                       // ovDone — /api/ovoz javobi keldi (yoki so'ralmaydi); ovW — javobni kutayotganlar
  function ovFlush() { ovDone = true; var w = ovW; ovW = []; w.forEach(function (f) { try { f(); } catch (e) {} }); }
  function ovBoot(cb) { if (cb) { if (ovDone) { cb(); return; } ovW.push(cb); } if (ovAsked) return; if (navigator.onLine === false || (KD && KD.on)) { ovFlush(); return; } ovAsked = true; try { loadJson('/api/ovoz?mijoz_id=' + encodeURIComponent(cid()), function (j) { ovqSet(j); var was = ovSrv; ovSrv = !!(j && j.yoqilgan); ovFlush(); if (was !== ovSrv && kit.sheetKind() === 'add' && fd && fd.mode === 'search' && document.activeElement !== $('#fdQ')) { setSheet(searchHtml()); refreshRes(); } }, function () { ovSrv = false; ovFlush(); }); } catch (e) { ovFlush(); } }
  function ovPost(blob, mime, til, signal) {          // server yo'li: audio → /api/ovoz → { text, tok } (tok — shu ovozning AI hisobi; keyingi taom ajratish qayta sanalmaydi)
    var u = '/api/ovoz?til=' + encodeURIComponent(til) + '&mijoz_id=' + encodeURIComponent(cid()) + (vs && vs.t0 ? '&dav=' + Math.min(31000, Date.now() - vs.t0) : '');          // dav — yozuv davomiyligi (ms): server ≤ 30 s ni tekshiradi
    return fetch(u, { method: 'POST', headers: { 'Content-Type': mime }, body: blob, signal: signal }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) {
      ovqSet(j); if (r.status === 429) { stEv('ai_sorov', 'ovoz.limit'); return { err: 'limit', n: j.limit }; } if (!r.ok) { stEv('ai_sorov', 'ovoz.xato'); return { err: r.status === 503 ? 'yoq' : 'xato' }; } stEv('ai_sorov', 'ovoz.ok'); return { text: j.matn || '', tok: j.tok || '' }; }); });
  }
  function voiceHtml() {
    var h = shHead(T('vT'));
    if (vs.err) return h + '<p class="rz-p warn" id="vErr">' + esc(vs.err === 'limit' ? T('ovLimit') : T('vErr_' + vs.err)) + '</p><div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="vtext">' + esc(T('vText')) + '</button>' + (vs.err === 'yoq' || vs.err === 'limit' ? '' : '<button type="button" class="rz-btn primary" data-act="fmic">' + ico('mic') + ' ' + esc(T('vAgain')) + '</button>') + '</div><p class="rz-priv">' + esc(T('vPriv')) + '</p>';
    var srv = vs.kind === 'server';
    var mic = srv && !vs.busy ? '<button type="button" class="sl-vmic" data-act="vdone" aria-label="' + esc(T('vDone')) + '">' + ico('mic') + '</button>' : '<span class="sl-vmic" aria-hidden="true">' + ico('mic') + '</span>';          // yozuv: mikrofonni qayta bosish = «Tayyor»
    var wave = srv && !vs.busy ? '<div class="sl-vwave" id="vWave" aria-hidden="true">' + new Array(25).join('<i></i>') + '</div><p class="sl-vtime" id="vTime" aria-live="off">' + vTimeTxt() + '</p>' : '';
    return h + '<div class="sl-vo' + (vs.on ? ' on' : '') + '" id="vBox">' + mic + wave + '<p class="sl-vpart" id="vPart" aria-live="polite">' + esc(vs.busy ? T('vBusy') : (vs.part || T(srv ? 'vRec' : 'vListen'))) + '</p></div><div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="vstop" id="vStop">' + esc(T('vStop')) + '</button>' + (srv && !vs.busy ? '<button type="button" class="rz-btn primary" data-act="vdone" id="vDone">' + esc(T('vDone')) + '</button>' : '') + '</div><p class="rz-priv">' + esc(T(srv ? 'vPrivS' : 'vPriv')) + '</p>' + (srv && ovq && !vs.busy ? '<p class="rz-mut sm sl-aileft" id="vLeft">' + esc(T('ovLeft', { q: ovq.qoldi, n: ovq.limit })) + '</p>' : '');
  }
  var vTick = null, VMAX = (window.KalkiOvoz && KalkiOvoz.MAXREC || 30000) / 1000;
  function mmss(n) { n = Math.max(0, Math.floor(n)); return Math.floor(n / 60) + ':' + (n % 60 < 10 ? '0' : '') + (n % 60); }
  function vTimeTxt() { return mmss(vs && vs.t0 ? (Date.now() - vs.t0) / 1000 : 0) + ' / ' + mmss(VMAX); }
  function vLevel(v) { var w = $('#vWave'); if (!w) return; var b = w.children, n = b.length; for (var i = 0; i < n - 1; i++) b[i].style.transform = b[i + 1].style.transform; if (n) b[n - 1].style.transform = 'scaleY(' + Math.max(0.08, Math.min(1, v * 1.6)).toFixed(2) + ')'; }          // to'lqin: o'ngdan yangi ustun, chapga suriladi
  var vHoldT = 0;                                       // 🎤 bosib turish: bosilganda yozuv boshlanadi, ≥ 0,6 s ushlab qo'yib yuborilsa — «Tayyor»; qisqa bosish — yozuv davom etadi (qayta bosish / «Tayyor» bilan tugaydi)
  function vHoldBoot() {
    var down = false;
    document.addEventListener('pointerdown', function (e) { var b = e.target && e.target.closest && e.target.closest('#micBtn'); if (!b || b.disabled || e.button > 0) return; vHoldT = Date.now(); down = true; voiceStart(); }, true);
    document.addEventListener('pointerup', function () { if (!down) return; down = false; if (Date.now() - vHoldT >= 600 && vs && vs.kind === 'server' && vs.t0) voiceFinish(); }, true);
    document.addEventListener('pointercancel', function () { down = false; }, true);
  }
  function voiceCancel() { if (VO) VO.cancel(); clearInterval(vTick); vs = null; }          // «To'xtatish» va ✕: DARHOL to'xtaydi (abort, mikrofon yopiladi) va oyna yopiladi
  function voiceStart() {
    if (!micOk() || navigator.onLine === false) return; used('ovoz'); var date = fd && fd.date || todayStr(), meal = fd && fd.meal;
    var me = vs = { on: true, part: '', err: '', kind: VO.kind() }; if (me.kind === 'server' && ovq && ovq.qoldi <= 0) { me.on = false; me.err = 'limit'; if (kit.sheetKind() !== 'add') openAdd({}); fd.mode = 'voice'; setSheet(voiceHtml()); return; }          // ovoz limiti tugagan — yozmasdan aniq xabar
    if (kit.sheetKind() !== 'add') openAdd({}); fd.date = date; if (meal) fd.meal = meal; fd.mode = 'voice'; setSheet(voiceHtml());
    var live = function () { return vs === me && fd && fd.mode === 'voice' && kit.sheetKind() === 'add'; };
    clearInterval(vTick);
    VO.start({ onPart: function (t) { if (!live()) return; me.part = t; var e = $('#vPart'); if (e) e.textContent = t; },
      onRec: function () { if (!live()) return; me.t0 = Date.now(); vTick = setInterval(function () { var e = $('#vTime'); if (!live() || !e) { clearInterval(vTick); return; } e.textContent = vTimeTxt(); }, 250); },
      onLevel: function (v) { if (live() && !me.busy) vLevel(v); },
      onText: function (t, tok) { if (!live()) return; me.on = false; voiceDone(t, tok); },
      onErr: function (c, n) { if (!live()) return; me.on = false; me.err = c; me.n = n; setSheet(voiceHtml()); } });
  }
  function voiceFinish() { if (!vs || !VO || vs.busy || vs.err) return; clearInterval(vTick); vs.busy = true; setSheet(voiceHtml()); VO.finish(); }
  function voiceDone(t, tok) {                         // matn → odatiy «Matn bilan qo'shish» oqimi: ro'yxat (tahrirlash/o'chirish) → «Hammasini qo'shish»; topilmagani bo'lsa — avtomatik BITTA AI so'rov (server yo'lida tok bilan — qayta sanalmaydi)
    vs = null; openText(null, true); fd.usul = 'ovoz'; fd.ovTok = tok || ''; fd.txt = t; setSheet(textHtml()); txGo();
    setTimeout(function () { if (fd && fd.usul === 'ovoz' && fd.missing && fd.missing.length && navigator.onLine !== false) txAi(); }, 80);
  }

  /* ---------- haftalik xulosa (qurilmada hisoblanadi) — assets/kalkifit-hafta.js ---------- */
  var HW_ID = 7002;
  function hwDue() {                                   // «Haftangiz» vaqti (yakshanba 19:00 – dushanba); o'sha haftada birorta ovqat yozilmagan bo'lsa (yangi foydalanuvchi) — xulosa yo'q
    var H = window.KalkiHafta, e = H && st && st.setup ? H.dueEnd(S, todayStr(), new Date().getHours()) : null; if (!e) return null;
    for (var i = 0; i < 7; i++) { var x = S.dayOf(st, Dt.addDays(e, -i)); if (x && x.food && x.food.length) return e; } return null;
  }
  function hwOn() { return prefs().hafta !== false; }
  function hwDay(d) { var wd = (WDN[lang === 'ru' ? 'ru' : 'uz'] || WDN.uz)[S.weekdayIdx(d)]; return wd + ', ' + kit.dLabel(d); }
  var HK = null;
  function hkData(end) {                               // «Haftangiz» hikoyasi uchun ma'lumot (qurilmada); vazn — faqat 4-slaydda, ulashish rasmiga tushmaydi
    var H = window.KalkiHafta, w = H.summary(S, st, end, todayStr()), wd = lang === 'ru' ? ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] : ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'], cnt = {}, top = null;
    w.days.forEach(function (d) { var x = S.dayOf(st, d); (x && x.food || []).forEach(function (e) { var k = e.fid || ''; if (!k) return; cnt[k] = (cnt[k] || 0) + 1; if (!top || cnt[k] > cnt[top]) top = k; }); });
    var food = null; if (top) { var f = foodById(top), b = f && f.al ? (foodById(f.al.f) || f) : f, fl = imgFile(top, null); food = { name: b ? nameOf(b) : top, img: fl ? '/assets/ovqat/' + fl + '-256.webp' : '' }; }
    var ws = S.weekSummary(st, end), wt = ws.weightDelta != null && Math.abs(ws.weightDelta) >= 0.1 ? T('hkWt', { d: (ws.weightDelta > 0 ? '+' : '') + dec(ws.weightDelta, 1) }) : '';
    var joke = G && G.cardLine && prefs().jokes !== false ? G.cardLine(jokeCtx(false), 'hafta_xulosa', 'w') : null; if (joke) saveQuiet();
    return { range: kit.dLabel(w.days[0]) + ' – ' + kit.dLabel(end), logged: w.logged, days: w.rows.map(function (r) { return { l: wd[S.weekdayIdx(r.d)], k: r.kcal, near: r.state === 'near' }; }), target: w.target, near: w.near, avgKcal: w.avgKcal || 0,
      water: { avg: w.waterAvg || 0, goal: w.waterGoal }, steps: { avg: w.stepsAvg || 0, sum: w.stepsSum || 0, goal: w.stepGoal }, best: w.best ? hwDay(w.best) : '', streak: w.streak, food: food, ex: w.exMin ? T('hkEx', { m: fmt(w.exMin), k: fmt(w.exKcal), n: w.exDays }) : '', weight: wt, tip: T(w.logged ? 'hwTip_' + w.tip : 'hwTip_log'), prot: (function () { var n = protDays(w.days); return n ? T('hkProt', { n: n }) : ''; })(), joke: joke ? joke.text : '', dark: kcDark(),
      L: { title: T('hkTitle'), hi: T('hkHi'), days: T('hkDays', { n: w.logged }), empty: T('hkEmpty'), kcalT: T('hkKcalT'), nearT: T('hkNearT'), avg: T('hkAvg', { x: fmt(w.avgKcal || 0), g: fmt(w.target) }), few: T('hkFew'), waterU: T('hkWaterU'), stepsU: T('hkStepsU'), moveT: T('hkMoveT'), bestT: T('hkBestT'), streakU: T('hkStreakU'), foodT: T('hkFoodT'), tipT: T('hkTipT'), share: T('hkShare'), close: T('hkClose'), avgT: T('hkAvgT'), nearS: T('hkNearS'), kcal: T('kcKcal'), ml: ML() } };
  }
  function openWeek(end) {                             // «Haftangiz» — to'liq ekranli hikoya (assets/kalkifit-hikoya.js); Tarix kartasi, yakshanba eslatmasi va ?hafta=1 shu yerni ochadi
    var H = window.KalkiHafta, KH = window.KalkiHikoya; if (!H || !KH || HK) return; end = end || hwDue() || todayStr(); prefs().hwSeen = end; save(); stEv('haftalik_ochildi'); var nd = $('[data-nudge=hafta]'); if (nd) nd.remove();
    if (kit.sheetKind()) kit.closeSheet();
    var d = hkData(end); d.L.nearT2 = d.L.nearS; d.plato = plHk(); if (d.plato) { plPrefs().hk = end; save(); }          // «Nega sekin?» — Haftangiz ichida bir marta
    HK = KH.open({ data: d, onPlato: function () { setTimeout(openPlato, 260); }, reduce: !!(reduce || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)), tr: natTr, onShare: function (cv) { sharePng(cv, 'kalkifit-hafta.png', 'kun_kartochka_ulashildi'); }, onClose: function () { HK = null; } });
  }
  function hkCardHtml() {                              // Tarix tepasida: «Haftangiz ▶» — 7 kunlik mini ustunlar + asosiy raqam
    if (!window.KalkiHafta || !window.KalkiHikoya) return ''; var t = todayStr(), w = KalkiHafta.summary(S, st, t, t), mx = Math.max(w.target || 1, Math.max.apply(null, w.rows.map(function (r) { return r.kcal; }).concat([1])));
    return '<button type="button" class="sl-hkc" id="hkCard" data-act="hafta" data-end="' + t + '"><span class="mini" aria-hidden="true">' + w.rows.map(function (r) { return '<i class="' + (r.kcal ? '' : 'z') + '" style="--h:' + (r.kcal / mx).toFixed(3) + '"></i>'; }).join('') + '</span><span class="m"><b>' + esc(T('hkTitle')) + '</b><span>' + esc(w.logged ? T('hkCardS', { n: w.logged, k: fmt(w.avgKcal || 0) }) : T('hkCard0')) + '</span></span><span class="pl" aria-hidden="true">▶</span></button>';
  }
  function hwOpts() { return { id: HW_ID, day: 6, hour: 19, title: 'KalkiFit', body: natTr(T('hwMsg')), url: (lang === 'ru' ? '/ru/kalkifit' : '/kalkifit') + '?hafta=1' }; }
  function hwResched() { if (!NAT || NS.perm !== 'granted') return; if (!hwOn()) { NAT.notif.disable(HW_ID); return; } NAT.notif.schedule(hwOpts()).catch(function () {}); }          // standart: yoqilgan (bildirishnoma ruxsati bo'lsa)
  function hwRowHtml() {                              // Profil → Eslatmalar: «📊 Haftalik xulosa» — switch (sukut: yoqilgan), ⓘ qisqa izoh
    var on = hwOn();
    return '<div class="sl-remr" id="hwRow"><div class="sl-remm"><span class="ic" aria-hidden="true">📊</span><span class="t"><b class="sl-bkT2">' + esc(T('hwN')) + ' <button type="button" class="sl-infob" data-cyr="skip" data-act="ibtog" aria-expanded="false" aria-label="ⓘ ' + esc(T('hwN')) + '">i</button></b><small class="sl-hwL sl-ibx" hidden>' + esc(T('hwNH')) + '</small></span></div>' + swHtml(on, 'hwtog', T('hwN'), false, ' data-v="' + (on ? '0' : '1') + '"') + '</div>';
  }
  function hwToggle(v) {
    prefs().hafta = v; commit();
    if (NAT) { if (v && NS.perm !== 'granted') { NAT.notif.enable(hwOpts()).then(function (r) { if (r === 'on') NS.perm = 'granted'; else if (r === 'denied') NS.perm = 'denied'; }).catch(function () {}); } else hwResched(); return; }
    pushResync();
  }

  /* ---------- kun kartasi (kun yakuni rasmi; vazn/yosh YO'Q) — assets/kalkifit-kunkarta.js ---------- */
  var KK = null, kcImg = null;
  function kcDark() { var t = themeNow(); if (t !== 'auto') return t === 'dark'; try { return !!(window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches); } catch (e) { return false; } }
  function kcData() {
    var t = todayStr(), pr = st.profile, pl = planNow(), x = S.dayOf(st, t) || { food: [], water: 0, steps: 0 }, tot = S.sumEntries(x.food), wi = wInfo(t);
    var bal = S.dayBalance(st, t, tot.kcal), limit = bal.limit, best = null;
    x.food.forEach(function (e) { if (!best || e.kcal > best.kcal) best = e; });
    var f = best && best.fid ? foodById(best.fid) : null, base = f && f.al ? (foodById(f.al.f) || f) : f, nm = best ? (base ? nameOf(base) : String(best.name || '')) : '', fl = best ? imgFile(best.fid || iconFid(best), best.vr) : null;
    var joke = ''; if (G && G.cardLine && prefs().jokes !== false && KK) { var l = G.cardLine(jokeCtx(false), KK.jokeState(tot.kcal, limit)); if (l) { joke = l.text; saveQuiet(); } }
    var wd = (WDN[lang === 'ru' ? 'ru' : 'uz'] || WDN.uz)[S.weekdayIdx(t)], tr = natTr;
    return { dark: kcDark(), date: tr(wd + ', ' + kit.dLabel(t)), eaten: tot.kcal, limit: limit, ml: wi.ml, mlGoal: pl.water.glasses * S.GLASS_ML, steps: x.steps || 0, stepGoal: st.stepGoal || 8000, food: tr(nm), letter: tr(nm).charAt(0), joke: tr(joke), file: fl,
      L: { goal: tr(T('kcGoal')), kcal: tr(T('kcKcal')), water: tr(T('wT')), steps: tr(T('kcSteps')), ml: tr(ML()), top: tr(T('kcTop')) } };
  }
  function kcPaint(cb) {
    KK = window.KalkiKunKarta; if (!KK) return; var d = kcData(), cv = document.createElement('canvas');
    var go = function () { d.img = kcImg && kcImg.f === d.file ? kcImg.im : null; KK.draw(cv, d); var v = $('#kcCv'); if (v) v.getContext('2d').drawImage(cv, 0, 0); if (cb) cb(cv); };
    if (d.file && !(kcImg && kcImg.f === d.file)) { var im = new Image(); im.onload = function () { kcImg = { f: d.file, im: im }; go(); }; im.onerror = go; im.src = '/assets/ovqat/' + d.file + '-256.webp'; } else go();
  }
  function openDayCard() {
    openSheet('daycard', shHead(T('kcT')) + '<p class="rz-p sm">' + esc(T('kcH')) + '</p><div class="sl-cvw"><canvas id="kcCv" width="1080" height="1350" role="img" aria-label="' + esc(T('kcT')) + '"></canvas></div><div class="rz-actions"><button type="button" class="rz-btn primary" data-act="kcgo" id="kcGo">' + ico('share') + ' ' + esc(T('kcGo')) + '</button></div>');
    kcPaint();
  }
  function kcDownload(b, nm) { var a = document.createElement('a'), u = URL.createObjectURL(b); a.href = u; a.download = nm || 'kalkifit-kun.png'; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(u); a.remove(); }, 500); }
  function sharePng(cv, nm, ev) {                    // APK: Capacitor Filesystem + Share; veb: Web Share (fayl bilan), bo'lmasa — yuklab olish
    cv.toBlob(function (b) {
      if (!b) return; if (ev) stEv(ev); var N = window.KalkiNative;          // APK sahifasida @capacitor/* JS yo'q — native-bridge (KalkiNative.call)
      if (isNativeApp() && N && N.has('Share') && N.has('Filesystem')) {
        var r = new FileReader(); r.onload = function () { var b64 = String(r.result).split(',')[1] || ''; N.call('Filesystem', 'writeFile', { path: nm, data: b64, directory: 'CACHE' }).then(function (w) { return N.call('Share', 'share', { files: [w.uri], title: 'KalkiFit' }); }).catch(function () { kcDownload(b, nm); }); }; r.readAsDataURL(b); return;
      }
      var f; try { f = new File([b], nm, { type: 'image/png' }); } catch (e) { f = null; }
      if (f && navigator.canShare && navigator.canShare({ files: [f] })) { navigator.share({ files: [f], title: 'KalkiFit' }).catch(function () {}); return; }
      kcDownload(b, nm);
    }, 'image/png');
  }
  function kcShare() { kcPaint(function (cv) { sharePng(cv, 'kalkifit-kun.png', 'kun_kartochka_ulashildi'); }); }

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
  var TIPS = [{ sel: '#kcalBtn', key: 'tip1', pos: 'below' }, { sel: '#mainAdd', key: 'tip2', pos: 'above' }, { sel: '.rz-tab[data-v=history]', key: 'tip3', pos: 'above' }];
  function noIntro() { try { return !!localStorage.getItem('kalki_no_intro'); } catch (e) { return false; } }      // sinov kaliti: avtomatik slayd chiqmasin (faqat test-soddalik2 uni tekshiradi)
  /* ochilish animatsiyasi: splash (seansda bir marta, ≤900 ms, ilovani kuttirmaydi) va Bugun'ning birinchi kirishida bloklar pastdan 12 px suzib chiqadi (50–60 ms stagger, ≤400 ms; tab almashganda takrorlanmaydi) */
  var todayIn = false;
  function upIdx() { var m = $('#rzMain'); if (!m || !m.classList.contains('rzi')) return; var i = 0; ['.sl-duo', '.sl-bju', '.sl-meal', '#mainAdd'].forEach(function (q) { $$('#rzMain ' + q).forEach(function (e) { e.style.setProperty('--i', i++); }); }); }
  function staggerToday() {                                // .rzi — faqat birinchi ~1,9 s; shu vaqtda qayta chizilsa ham indekslar qayta qo'yiladi (render ichida upIdx)
    if (reduce || noIntro()) return; var m = $('#rzMain'); m.classList.add('rzi'); upIdx(); setTimeout(function () { m.classList.remove('rzi'); }, 1900);
  }
  var introPending = false;                                // yangi foydalanuvchi: avval «Qanday ishlaydi?» slaydlari, KEYIN tips (bir vaqtda emas)
  function introShow() { if (!IN) { introPending = false; return; } IN.show(function () { introPending = false; prefs().introDone = true; save(); heroPrev = null; heroAnim = null; todayIn = false; render(); }); }      // Bugun kirish animatsiyasi slayd YOPILGANDAN keyin ko'rinsin
  function tipsStart() { tipsSess = true; kit.tipsStart(TIPS, function () { prefs().tipsDone = true; save(); var f = $('#mainAdd'); if (f) try { f.focus({ preventScroll: true }); } catch (e) {} }); }
  function aboutOpen(on) {
    document.body.classList.toggle('rz-aboutopen', !!on); var a = document.getElementById('rzAbout'); if (!a) return;
    if (on) { a.scrollTop = 0; var b = document.getElementById('rzAboutBack'); if (b) try { b.focus({ preventScroll: true }); } catch (e) {} } else { var m = $('#rzMain'); if (m) try { m.focus({ preventScroll: true }); } catch (e) {} }
  }

  /* ---------- onboarding: bir savol — bir ekran, KLAVIATURASIZ (slayder: assets/num-slider.js) ----------
  Qadamlar: 1 jins · 2 yosh · 3 bo'y · 4 vazn · 5 faollik · 6 maqsad · 7 yemaydigan narsa (ixtiyoriy) · 8 natija. Saqlash formati va me'yor hisobi (S.plan) o'zgarmagan.
   «Keyinroq» (1-ekran): jinsga qarab o'rtacha qiymatlar bilan me'yor hisoblanadi (taxminiy), keyin yumshoq karta («30 soniyada aniqlashtiring») → refine rejimi (2–6 + natija). */
  var SL = window.KalkiSlider, OBN = 7, OBID = { obAge: 'age', obHeight: 'height', obWeight: 'weight' };
  var OBDEF = { m: { age: 30, height: 175, weight: 75 }, f: { age: 30, height: 162, weight: 62 } }, OBLIM = { age: { min: 14, max: 90, step: 1 }, height: { min: 120, max: 220, step: 1 }, weight: { min: 35, max: 200, step: 0.5 } };
  function obDef(sex) { return OBDEF[sex === 'f' ? 'f' : 'm']; }
  function obFmt(f, v) { return f === 'weight' ? String(v).replace('.', ',') : String(Math.round(v)); }
  function obNew() {
    ob = { step: 1, sex: '', preg: false, age: '', height: '', weight: '', act: 0, goal: '', yemay: [], touched: {}, anim: null, refine: false, counted: false, ycounted: false };
    try {
      var imp = JSON.parse(lsGet(LS_IMPORT) || 'null');
      if (imp && typeof imp === 'object') {
        ob.sex = imp.sex === 'f' ? 'f' : (imp.sex === 'm' ? 'm' : ''); ob.age = imp.age ? String(Math.round(num(imp.age))) : ''; ob.height = imp.height ? String(Math.round(num(imp.height))) : ''; ob.weight = imp.weight ? String(num(imp.weight)).replace('.', ',') : '';
        ob.act = S.ACT[imp.act] ? +imp.act : 0; ob.goal = S.GOAL_DELTA[imp.goal] != null ? imp.goal : ''; ['age', 'height', 'weight'].forEach(function (f) { if (ob[f]) ob.touched[f] = true; });
        var er = S.validate(obProfile()); ob.step = !ob.sex ? 1 : er.age ? 2 : er.height ? 3 : er.weight ? 4 : !ob.act ? 5 : !ob.goal ? 6 : 7;
      }
    } catch (e) {}
  }
  function obProfile() { return { sex: ob.sex, preg: ob.sex === 'f' && ob.preg, age: num(ob.age), height: num(ob.height), weight: num(ob.weight), act: ob.act, goal: ob.goal || 'keep', goalWeight: null, job: ob.job || undefined }; }
  function optBtn(act, v, title, sub, on, off) { return '<button type="button" class="rz-opt big' + (on ? ' on' : '') + (off ? ' off' : '') + '" data-act="' + act + '" data-v="' + v + '" aria-pressed="' + !!on + '"' + (off ? ' aria-disabled="true"' : '') + '><b>' + esc(title) + '</b>' + (sub ? '<span>' + esc(sub) + '</span>' : '') + '</button>'; }
  function obSlider(f) {
    var lm = OBLIM[f], id = { age: 'obAge', height: 'obHeight', weight: 'obWeight' }[f], unit = { age: lang === 'ru' ? 'лет' : 'yosh', height: lang === 'ru' ? 'см' : 'sm', weight: lang === 'ru' ? 'кг' : 'kg' }[f], q = { age: 'o2q', height: 'o3q', weight: 'o4q' }[f];
    if (!ob[f]) ob[f] = obFmt(f, obDef(ob.sex)[f]);
    return SL.html({ id: id, min: lm.min, max: lm.max, step: lm.step, value: num(ob[f]), unit: unit, label: T(q), minus: T('sldMinus'), plus: T('sldPlus'), edit: T('sldEdit') });
  }
  /* til tugmasi (har onboarding ekranida): joriy ekran darhol shu tilga o'tadi; kiritilgan qiymatlar (ob) sessionStorage'ga yoziladi va sahifa qayta yuklansa (UZ↔RU boshqa sahifa, ЎЗ) tiklanadi */
  var OB_RES = 'kalki_ob_resume';
  function obLangHtml() {
    var cur = isCyr() ? 'cyr' : lang;
    return '<div class="sl-ob-top" data-cyr="skip"><div class="sl-ob-lang" role="group" aria-label="Til / Язык">' + [['uz', 'UZ'], ['cyr', 'ЎЗ'], ['ru', 'RU']].map(function (x) { return '<button type="button" data-act="oblang" data-l="' + x[0] + '" aria-pressed="' + (cur === x[0]) + '"' + (cur === x[0] ? ' class="on"' : '') + '>' + x[1] + '</button>'; }).join('') + '</div></div>';
  }
  function obLang(l) { stEv('til_tanlandi', l);
    var cur = isCyr() ? 'cyr' : lang; if (!ob || l === cur) return;
    try { var sn = JSON.parse(JSON.stringify(ob)); sn.anim = null; sessionStorage.setItem(OB_RES, JSON.stringify({ t: Date.now(), ob: sn })); } catch (e) {}
    var tgt = document.getElementById(l === 'cyr' ? 'langCyr' : (l === 'ru' ? 'langRu' : 'langUz')); if (tgt) tgt.click();
    setTimeout(function () { if (ob) { lang = langNow(); showOnb(); } }, 80);          // sahifa qayta yuklanmasa (joyida almashsa) — hozirgi ekran yangi tilda qayta chiziladi
  }
  /* birinchi ochilish: onboarding'dan OLDIN til tanlash ekrani. Faqat: yangi foydalanuvchi (setup yo'q), saqlangan til yo'q (kalki_lang), demo emas.
     Tanlov lang.js orqali saqlanadi (KalkiLang.setLang → kalki_lang); UZ↔RU/ЎЗ da sahifa o'zi qayta yuklanadi va ekran qayta chiqmaydi. */
  var lpDone = false;
  function langStored() { try { var v = localStorage.getItem('kalki_lang'); return v === 'uz' || v === 'ru' || v === 'cyr'; } catch (e) { return false; } }
  var INTRO_K = 'kalki_intro_v2';
  function introSeen() { try { return !!localStorage.getItem(INTRO_K); } catch (e) { return true; } }
  function needIntro() { return !!IN && !(KD && KD.on) && !noIntro() && !introSeen() && !(ob && ob.step > 1); }
  function introFirst() { var el = $('#rzOnb'); if (el) el.hidden = true; if (IN.isOpen()) return; IN.show(function () { try { localStorage.setItem(INTRO_K, '1'); } catch (e) {} render(); }); }
  function needLangPick() { return !lpDone && !(KD && KD.on) && !noIntro() && !(st && st.setup) && !langStored(); }
  function showLangPick() {
    var el = $('#rzOnb'); if (!el) return;
    var cur = isCyr() ? 'cyr' : lang;
    el.className = 'rz-onb sl-ob sl-lp'; el.hidden = false; el.classList.remove('out');
    el.innerHTML = '<div class="sl-ob-body" data-cyr="skip"><div class="sl-ob-in"><div class="sl-lp-logo" aria-hidden="true">K</div>' +
      '<h1 class="sl-lp-t"><span lang="uz">Tilni tanlang</span><span lang="uz-Cyrl">Тилни танланг</span><span lang="ru">Выберите язык</span></h1>' +
      [['uz', 'O\u2018zbekcha (lotin)', 'uz'], ['cyr', 'Ўзбекча (кирилл)', 'uz-Cyrl'], ['ru', 'Русский', 'ru']].map(function (x) {
        return '<button type="button" class="rz-opt big sl-lp-b' + (cur === x[0] ? ' cur' : '') + '" data-act="lppick" data-l="' + x[0] + '" lang="' + x[2] + '"><b>' + x[1] + '</b></button>';
      }).join('') + '</div></div>';
  }
  function lpPick(l) { stEv('til_tanlandi', l);
    lpDone = true;
    if (window.KalkiLang && KalkiLang.setLang) KalkiLang.setLang(l, { user: true }); else { var t = document.getElementById(l === 'cyr' ? 'langCyr' : (l === 'ru' ? 'langRu' : 'langUz')); if (t) t.click(); }
    setTimeout(function () { lang = langNow(); render(); }, 60);          // joyida almashgan bo'lsa — onboarding yangi tilda; sahifa qayta yuklansa bu kod ishlamaydi (tanlov saqlangan)
  }
  function obResume() {                               // til almashtirishdan keyin: 10 daqiqa ichida yozilgan qiymatlar va qadam tiklanadi
    var raw = null; try { raw = sessionStorage.getItem(OB_RES); sessionStorage.removeItem(OB_RES); } catch (e) {} if (!raw) return;
    try { var r = JSON.parse(raw), o = r && r.ob; if (!o || typeof o !== 'object' || Date.now() - (+r.t || 0) > 600000 || !(o.step >= 1 && o.step <= 8)) return; if (st && st.setup && !o.refine) return; o.anim = null; ob = o; if (st && st.setup) obLock(true); } catch (e) {}
  }
  function showOnb() {
    var el = $('#rzOnb'); if (!ob) obNew();
    var s = ob.step, an = ob.anim, h = '', foot = 'next', nav = ''; ob.anim = null;
    if (!ob.counted && !ob.refine) { ob.counted = true; if (Y) Y.count('onboarding_boshlandi'); }
    var body = '';
    if (s === 1) { body = '<h2 class="rz-q">' + esc(T('o1q')) + '</h2>' + optBtn('obsex', 'm', T('male'), '', ob.sex === 'm') + optBtn('obsex', 'f', T('female'), '', ob.sex === 'f') + bk.restoreLink() + akk.restoreLink() + (ob.sex === 'f' ? '<label class="rz-chk" style="margin-top:12px"><input type="checkbox" id="obPreg"' + (ob.preg ? ' checked' : '') + '><span>' + esc(T('preg')) + '</span></label>' : ''); foot = ob.sex ? 'next' : 'next0'; }
    if (OBID && (s === 2 || s === 3 || s === 4)) { var f = { 2: 'age', 3: 'height', 4: 'weight' }[s]; body = '<h2 class="rz-q">' + esc(T('o' + s + 'q')) + '</h2>' + '<p class="rz-p">' + esc(T('o' + s + 'h')) + '</p>' + '<div class="sl-ob-sld">' + obSlider(f) + '</div>'; }
    if (s === 5) { body = jobUi() && !ob.refine ? '<h2 class="rz-q">' + esc(T('jobQ')) + '</h2><p class="rz-p">' + esc(T('jobH')) + '</p>' + jobOpts(ob.job, 'objob') : '<h2 class="rz-q">' + esc(T('o5q')) + '</h2>' + [1, 2, 3, 4, 5].map(function (x) { return optBtn('obact', x, T('a' + x), T('a' + x + 'h'), ob.act === x); }).join(''); foot = ob.act ? 'next' : 'next0'; }          // v51: Android (qadam bor) — faqat ish turi
    if (s === 6) { var lock = S.restrictions(obProfile()).keepOnly; body = '<h2 class="rz-q">' + esc(T('o6q')) + '</h2>' + ['keep', 'slow', 'lose', 'gain'].map(function (g) { return optBtn('obgoal', g, T('g' + g), T('g' + g + 'H'), (ob.goal === g) || (lock && g === 'keep' && !ob.goal), lock && g !== 'keep'); }).join('') + (lock ? '<p class="rz-p warn">' + esc(T('gLocked')) + '</p>' : ''); foot = (ob.goal || lock) ? 'next' : 'next0'; }
    if (s === 7) { body = '<h2 class="rz-q">' + esc(T('obYq2')) + '</h2><p class="rz-p">' + esc(T('obYh2')) + '</p>' + (Y ? Y.chipsHtml(ob.yemay, 'obyntog') : '') + '<p class="rz-priv sl-ywarn">' + esc(T('obYwarn')) + '</p>'; foot = 'yemay'; }
    if (s === 8) {
      var pr = obProfile(); if (S.restrictions(pr).keepOnly) pr.goal = 'keep'; var pl = S.plan(pr);
      var why = pl.goal === 'keep' ? T('rWhyKeep', { tdee: fmt(pl.tdee) }) : T(pl.goal === 'gain' ? 'rWhyGain' : 'rWhyLose', { tdee: fmt(pl.tdee), kg: dec(Math.abs(pl.kgPerWeek), 2), d: fmt(Math.abs(pl.target - pl.tdee)) });
      body = '<div class="sl-res7"><p class="rz-fl" style="text-align:center">' + esc(T('rT')) + '</p><div class="sl-big" aria-live="polite"><b id="obTarget">' + fmt(pl.target) + '</b><small> ' + T('kcal') + '</small></div><p class="rz-p">' + esc(why) + '</p>' +
        (pl.floorApplied ? '<p class="rz-p warn">' + esc(T('rFloor', { min: fmt(pl.floorMin), kg: dec(Math.abs(pl.kgPerWeek), 2) })) + '</p>' : '') +
        pl.notes.filter(function (n) { return n !== 'floor'; }).map(function (n) { return '<p class="rz-p warn">' + esc(T(n === 'preg' ? 'pregN' : n)) + '</p>'; }).join('') + (pl.doctor ? '<p class="rz-p warn"><b>' + esc(T('rDoc')) + '</b></p>' : '') +
        '<p class="rz-p">' + esc(T('rMacro', { p: pl.macros.p, f: pl.macros.f, c: pl.macros.c })) + '<br>' + esc(T('rWater', { n: pl.water.glasses, ml: fmt(pl.water.ml) })) + '</p><p class="rz-p sm">' + esc(T('disc')) + '</p></div>'; foot = 'start';
    }
    var first = ob.refine ? 2 : 1, dots = [1, 2, 3, 4, 5, 6, 7].map(function (i) { return '<i class="' + (i === s ? 'on' : (i < s ? 'done' : '')) + '"></i>'; }).join('');
    var btn = foot === 'start' ? '<button type="button" class="rz-btn primary" data-act="obstart">' + esc(T(ob.refine ? 'save' : 'start')) + '</button>' : foot === 'yemay' ? '<button type="button" class="rz-btn primary" data-act="obnext" id="obYbtn">' + esc(T(ob.yemay.length ? 'obYgo' : 'obYno')) + '</button>' : '<button type="button" class="rz-btn primary" data-act="obnext"' + (foot === 'next0' ? ' disabled' : '') + '>' + esc(T('next')) + '</button>';
    nav = '<div class="sl-ob-nav">' + (s > first || (ob.refine && s === first) ? '<button type="button" class="sl-txtbtn sl-ob-back" data-act="obback">' + esc(T(ob.refine && s === first ? 'cancel' : 'back')) + '</button>' : '<span class="sl-ob-sp"></span>') + '<div class="rz-dots" aria-hidden="true">' + dots + '</div>' + '<span class="sl-ob-sp"></span></div>';
    var later = s === 1 && ob.sex ? '<button type="button" class="rz-btn ghost sl-ob-later" data-act="oblater">' + esc(T('obLater2')) + '</button>' : '';
    h = obLangHtml() + '<div class="sl-ob-body' + (an ? ' in-' + an : '') + '"><div class="sl-ob-in">' + body + '</div></div><div class="sl-ob-foot">' + btn + later + nav + '</div>';
    el.className = 'rz-onb sl-ob'; el.innerHTML = h; el.hidden = false; el.classList.remove('out'); if (SL) SL.mount(el);
    if (s === 8) kit.setNum($('#obTarget'), 0, planOfOb().target, { dur: 700 });
  }
  function planOfOb() { var pr = obProfile(); if (S.restrictions(pr).keepOnly) pr.goal = 'keep'; return S.plan(pr); }
  function obGo(step, an) { ob.step = step; ob.anim = an; showOnb(); }
  function obNext() {
    var s = ob.step;
    if (s === 1) { obGo(2, 'f'); return; }
    if (s === 2 || s === 3 || s === 4) { obGo(s + 1, 'f'); return; }
    if (s === 5) { obGo(6, 'f'); return; }
    if (s === 6) { if (!ob.goal) ob.goal = 'keep'; obGo(ob.refine ? 8 : 7, 'f'); return; }
    if (s === 7) { if (!ob.ycounted) { ob.ycounted = true; if (Y) Y.count(ob.yemay.length ? 'yemaydi_tanlandi' : 'yemaydi_hammasi'); } obGo(8, 'f'); return; }
  }
  function obBack() { var first = ob.refine ? 2 : 1; if (ob.refine && ob.step === first) { obClose(); return; } obGo(Math.max(first, ob.step === 8 && ob.refine ? 6 : ob.step - 1), 'b'); }
  function obPrefs() { var p = {}, l = ob && ob.yemay; if (l && l.length) { p.yemay = l.slice(); if (l.indexOf('baliq') > -1) p.baliqOff = true; } if (ob && ob.ycounted) p.yemayK = 1; return p; }
  function obFinish(pr, later) {                          // yangi foydalanuvchi: holat yaratiladi (saqlash formati o'zgarmagan)
    var n = S.emptyState(); if (S.restrictions(pr).keepOnly) pr.goal = 'keep'; n.prefs = obPrefs(); if (later) n.prefs.taxminiy = { t: Date.now(), n: 0 }; n.profile = pr; n.setup = true; n.created = Date.now(); n.trackStart = todayStr(); S.addWeight(n, todayStr(), pr.weight);
    if (Y) Y.count(later ? 'onboarding_keyinroq' : 'onboarding_tugadi');
    stEv('yangi_foydalanuvchi', STAT ? STAT.manba() : ''); stEv(later ? 'onboarding_keyinroq' : 'onboarding_tugadi');
    st = n; try { localStorage.removeItem(LS_IMPORT); localStorage.removeItem(OLD[LS_IMPORT]); } catch (e) {} ob = null; seenFood = null; heroPrev = null; save(); loadDb(); try { if (STAT) STAT.faol(); } catch (e) {}
    var el = $('#rzOnb'); el.classList.add('out');
    wait(function () { el.hidden = true; el.classList.remove('out'); view = 'today'; enterNext = true; render(); var mn = $('#rzMain'); if (mn) mn.scrollTop = 0; window.scrollTo(0, 0); if (location.hash === '#boshlash') history.replaceState(null, '', location.pathname + location.search); if (introPending) setTimeout(introShow, 350); }, 260);
  }
  function obStart() { if (ob.refine) { obRefineSave(); return; } obFinish(obProfile(), false); }          // v50: tartib savoli onboarding'da YO'Q (standart — «Farqi yo'q»)
  function obLater() { if (!ob || !ob.sex) return; var d = obDef(ob.sex); obFinish({ sex: ob.sex, preg: ob.sex === 'f' && ob.preg, age: d.age, height: d.height, weight: d.weight, act: 2, goal: 'keep', goalWeight: null }, true); }
  /* «Me'yoringiz taxminiy» → aniqlashtirish (slayder ekranlari 2–6 + natija); mavjud holat saqlanadi, faqat profil yangilanadi */
  function obLock(on) { ['#rzMain', '.rz-nav'].forEach(function (q) { var e = $(q); if (e) { e.inert = on; if (on) e.setAttribute('aria-hidden', 'true'); else e.removeAttribute('aria-hidden'); } }); }
  function obClose() { var el = $('#rzOnb'); el.classList.add('out'); ob = null; wait(function () { el.hidden = true; el.classList.remove('out'); obLock(false); render(); }, 220); }
  function taxOpen() { var p = st.profile; ob = { step: 2, refine: true, sex: p.sex, preg: !!p.preg, age: String(Math.round(num(p.age))), height: String(Math.round(num(p.height))), weight: String(num(p.weight)).replace('.', ','), act: p.act, goal: p.goal, yemay: [], touched: { age: 1, height: 1, weight: 1 }, anim: null, counted: true, ycounted: true }; obLock(true); showOnb(); }
  function obRefineSave() {
    var r = obProfile(), np = { sex: r.sex, preg: r.preg, age: r.age, height: r.height, weight: r.weight, act: r.act, goal: r.goal, goalWeight: st.profile.goalWeight || null }; if (S.restrictions(np).keepOnly) np.goal = 'keep'; if (st.profile.tartib) np.tartib = st.profile.tartib; if (st.profile.protG) np.protG = st.profile.protG; if (st.profile.job) np.job = st.profile.job; if (st.profile.corr) np.corr = st.profile.corr;
    st.profile = np; var d = todayStr(); if (st.weights.length === 0 || Math.abs(S.currentWeight(st) - np.weight) > 0.04) S.addWeight(st, d, np.weight); prefs().taxminiy = null; save(); ob = null;
    var el = $('#rzOnb'); el.classList.add('out'); wait(function () { el.hidden = true; el.classList.remove('out'); obLock(false); render(); toast(T('saved'), null, true); }, 220);
  }
  /* «Taxminiy» belgisi: aniqlashtirilguncha doim turadi — Bugun'da aylana ostida kichik chip (joylashuvni siljitmaydi), Profil tepasida ixcham qator */
  function taxChipHtml() { return prefs().taxminiy ? '<div class="sl-taxrow"><button type="button" class="sl-taxchip" id="taxChip" data-act="taxgo">' + esc(T('txChip')) + ' ›</button></div>' : ''; }
  function taxRowHtml() { return prefs().taxminiy ? '<section class="rz-card sl-tax1" id="taxCard"><span>' + esc(T('txP')) + '</span><button type="button" class="rz-btn sm" data-act="taxgo">' + esc(T('txBtn')) + '</button></section>' : ''; }
  var tipsSess = false;                                   // shu seansda yo'l-ko'rsatkich bor edi/bo'ldi → bir martalik kartalar KEYINGI ochilishda (bir vaqtda chiqmaydi)
  var sessT0 = Date.now();
  function oneTimeOk() { return !!(st && st.setup && (st.created || 0) < sessT0 - 60000); }          // bir martalik kartalar (Yemaydiganlar) onboarding seansida emas, KEYINGI ochilishda
  if (SL) document.addEventListener('sldchange', function (e) {
    var d = e.detail || {}, f = OBID[d.id]; if (f && ob) { ob[f] = obFmt(f, d.value); ob.touched[f] = true; }
  });

  /* ---------- suv ---------- */
  function waterSheetHtml() {
    var t = todayStr(), x = S.dayOf(st, t) || { water: 0 }, pl = planNow(), glasses = pl.water.glasses, wi = wInfo(t), man = Math.min(glasses, x.water || 0), wl = Math.min(glasses, wi.glasses), h = shHead(T('wOpenT')) + '<div class="sl-glasses" role="group" aria-label="' + esc(T('wT')) + '">';
    for (var i = 0; i < glasses; i++) h += '<button type="button" class="sl-glass' + (i < wl ? ' on' : '') + (i >= man && i < wl ? ' dr' : '') + '" data-act="glass" data-i="' + i + '" data-d="' + (i < man ? 1 : 0) + '" aria-pressed="' + (i < wl) + '" aria-label="' + (i + 1) + '">' + glassSvg() + '</button>';
    return h + '</div><p class="rz-p sm" id="wsTxt">' + esc(T('wOf', { n: wl, m: glasses }) + ' · ' + fmt(wi.ml) + ' ' + ML()) + '</p><p class="rz-mut sm">' + esc(T('wHint')) + '</p>' + (wi.items.length ? '<div class="sl-wl" id="wList"><div class="rz-st">' + esc(T('wListT')) + '</div>' + drinkRowsHtml(wi) + '</div>' : '') + '<p class="rz-p sm sl-wnote">' + esc(T('wDrinkNote')) + '</p><div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="xwater">' + esc(T('hHow')) + '</button><button type="button" class="rz-btn" data-act="sheetclose">' + esc(T('close')) + '</button></div>';
  }
  function openWaterSheet() { openSheet('water', waterSheetHtml(), { noFocus: true }); }
  function glassTap(i) {
    var t = todayStr(), x = S.ensureDay(st, t), pl = planNow(), n = (x.water === i + 1) ? i : i + 1; if (n > (x.water || 0)) stEv('suv_qoshildi'); S.setWater(st, t, n); save();
    var wi = wInfo(t), man = Math.min(n, pl.water.glasses), wl = Math.min(wi.glasses, pl.water.glasses);
    $$('.sl-glass').forEach(function (g, j) { var on = j < wl; g.classList.toggle('on', on); g.classList.toggle('dr', j >= man && on); g.setAttribute('aria-pressed', on); g.setAttribute('data-d', j < man ? 1 : 0); });
    var w = $('#wTxt'); if (w) w.innerHTML = '<b>' + fmt(wi.ml) + '</b><small> / ' + fmt(pl.water.glasses * S.GLASS_ML) + ' ' + ML() + '</small>'; var wbr = $('#wBar i'); if (wbr) wbr.style.width = Math.round(Math.min(1, wi.ml / Math.max(1, pl.water.glasses * S.GLASS_ML)) * 100) + '%'; var sp = $('#wSplit'); if (sp) sp.textContent = T('wSplit', { w: fmt(wi.manual), d: fmt(wi.drink) }); var ws = $('#wsTxt'); if (ws) ws.textContent = T('wOf', { n: wl, m: pl.water.glasses }) + ' · ' + fmt(wi.ml) + ' ' + ML(); vib(10); afterWater(); jokeAfter('water');
  }

  /* ---------- hodisalar ---------- */
  lpBind();
  root.addEventListener('click', function (e) {
    var lmenu = $('#rzLangMenu'), el = e.target.closest('[data-act]'), mm1 = $('#kqMM');
    if (mm1 && !mm1.hidden && !e.target.closest('.kq-mw')) mealMenu(false);          // ovqat vaqti ro'yxati: tashqariga bosilsa yopiladi
    if (!el) { if (lmenu && !lmenu.hidden && !e.target.closest('.rz-langwrap')) lmenu.hidden = true; return; }
    var a = el.getAttribute('data-act');
    if (a !== 'langmenu' && lmenu) lmenu.hidden = true;
    var UA = { fmic: 'ovoz', fphoto: 'rasm', mnopen: 'menyu', yedoor: 'yeymiz', hafta: 'hafta', daycard: 'kunkarta' }; if (UA[a] && st && st.setup) used(UA[a]);          // birinchi hafta maslahati: o'zi ishlatgan funksiya o'tkazib yuboriladi
    if (kit.act(a, el)) return;
    if (Y && Y.act(a, el, e)) return;
    if (R && R.act(a, el, e)) return;
    if (IN && IN.act(a)) return;
    switch (a) {
      case 'tab': kit.hideToast(); if (view !== viewOf(el.getAttribute('data-v'))) { view = viewOf(el.getAttribute('data-v')); enterNext = true; var mm = $('#rzMain'); if (mm) mm.scrollTop = 0; } render(); break;
      case 'add': case 'fab': openAdd({ date: view === 'history' && foodDay ? foodDay : todayStr() }); break;          // Bugun «Qo'shish» va Tarix «+» — bitta oqim
      case 'fwtry': fwTry(el.getAttribute('data-fk')); break;
      case 'fwx': fwDone(el.getAttribute('data-fk')); render(); break;
      case 'feat': { var fk0 = el.getAttribute('data-fk'); closeFeats(true); feat(fk0); break; }
      case 'ftopen': openFeats(); break;
      case 'ftclose': closeFeats(); break;
      case 'ftintro': closeFeats(true); if (IN && !IN.isOpen()) IN.show(function () { try { localStorage.setItem(INTRO_K, '1'); } catch (e) {} render(); }); break;
      case 'wopen': openWaterSheet(); break;
      case 'wadd': { stEv('suv_qoshildi'); var t9 = todayStr(), x9 = S.ensureDay(st, t9); S.setWater(st, t9, x9.water + 1); commit(); vib(10); afterWater(); jokeAfter('water'); break; }
      case 'theme': { prefs().theme = el.getAttribute('data-t'); save(); applyTheme(); render(); break; }
      case 'xkcal': openKcalHow(); break; case 'xmacro': openExplainMacro(); break; case 'xwater': openExplainWater(); break; case 'xsteps': openExplainSteps(); break; case 'xweight': openExplainWeight(); break; 
      case 'glass': glassTap(+el.getAttribute('data-i')); break;
      case 'updgo': if (upd) { try { KalkiNative.openUrl(location.origin + upd.apk); } catch (e) {} } break;
      case 'updlater': if (upd) { try { localStorage.setItem(UPD_KEY, JSON.stringify({ c: +upd.versionCode, t: Date.now() })); } catch (e) {} upd = null; var uc = $('#updCard'); if (uc) uc.remove(); } break;
      case 'addsteps': stepsOpen(); break;  case 'qahc': if (QA && QA.hcInstall) { qaFlow = 'hc'; QA.hcInstall(); } break; case 'qafit': if (QA && QA.fitInstall) QA.fitInstall(); break; case 'qaulash': qaAsk(); break;
      case 'vertap': verTap(); break; case 'diagcopy': { var dt = $('#diagTxt'); if (dt) { try { navigator.clipboard.writeText(dt.textContent).then(function () { toast(T('diagOk')); }, function () { selAll(dt); }); } catch (e) { selAll(dt); } } break; } case 'qayes': qaAllow(true); break; case 'qalater': prefs().qa = 'later'; save(); kit.closeSheet(); render(); break; case 'qatog': qaToggle(el.getAttribute('data-v') === '1'); break; case 'stepgoal': openGoal(); break;
      case 'key': {
        var k = el.getAttribute('data-k'), ks = kit.sheetKind();
        if (ks === 'steps') { sp.val = kit.padApply(sp.val, k, { max: 6 }); spUpdate(); vib(5); }          // kunlik qadam maqsadi
        else if (ks === 'weight') { wf.val = kit.padApply(wf.val, k, { max: 3, dec: 1 }); $('#wfNum').textContent = wf.val || '0'; vib(5); }
        break; }
      case 'spsave': spSave(); break; case 'addweight': openWeight(); break; case 'wfsave': wfSave(); break;
      case 'editprof': openProfile(); break;
      case 'wper': { plPrefs().per = el.getAttribute('data-k'); save(); render(); break; }
      case 'plwater': { plPrefs().water = 1; save(); render(); break; }          // «1-hafta: suv» izohi — bir marta; yopsa qayta chiqmaydi
      case 'jkx': jokeHide(); break;
      case 'jbopen': openJob(); break;
      case 'jbno': { prefs().jobAsked = 1; save(); render(); break; }
      case 'jbpick': { if (jv) { jv.sel = el.getAttribute('data-v'); setSheet(jobSheetHtml()); } break; }
      case 'jbok': { if (jv && jv.sel) { st.profile.job = jv.sel; prefs().jobAsked = 1; if (jv.web) prefs().qm = 'on'; jv.ok = 1; kit.closeSheet(); heroPrev = null; commit(); vib(); toast(T('jbDone'), null, true); } break; }
      case 'adyes': { if (adS) { st.profile.corr = adS.corr; prefs().adT = Date.now(); heroPrev = null; commit(); vib(); toast(T('adOn'), null, true); } break; }
      case 'adno': { prefs().adT = Date.now(); save(); render(); break; }
      case 'corroff': { delete st.profile.corr; heroPrev = null; commit(); vib(); toast(T('pfCorrDone'), null, true); break; }
      case 'objob': { ob.job = el.getAttribute('data-v'); ob.act = S.LIM.JOB_ACT[ob.job]; showOnb(); break; }
      case 'pejob': { peRead(); pe.job = el.getAttribute('data-v'); peRepaint(); break; }
      case 'plato': openPlato(); break;
      case 'ttopen': openTartib(); break;
      case 'pftile': pfField(el.getAttribute('data-k')); break;
      case 'ttno': { prefs().ttAsked = 1; save(); render(); break; }
      case 'ttpick': { if (tv) { tv.sel = el.getAttribute('data-k'); var sh0 = $('#rzSheet'), sc0 = sh0.scrollTop; setSheet(ttSheetHtml()); sh0.scrollTop = sc0; } break; }
      case 'ttsave': { if (tv) { ttSet(tv.sel); kit.closeSheet(); commit(); vib(); toast(T('saved'), null, true); } break; }
      case 'protg': openProtG(); break;
      case 'pgm': { if (pgv) { pgv.g = Math.max(60, Math.min(250, pgv.g + +el.getAttribute('data-d'))); var sh1 = $('#rzSheet'), sc1 = sh1.scrollTop; setSheet(pgSheetHtml()); sh1.scrollTop = sc1; } break; }
      case 'pgsave': { if (pgv) { st.profile.protG = pgv.g; kit.closeSheet(); commit(); vib(); toast(T('saved'), null, true); } break; }
      case 'pgauto': { delete st.profile.protG; kit.closeSheet(); commit(); vib(); toast(T('saved'), null, true); break; }
      case 'pltry': { var kk = el.getAttribute('data-k'); if (plCheckSet(kk)) stEv('plato_belgi', kk.replace(/_.*/, '')); vib(); save(); plRefresh(); plResched(); break; }
      case 'plrem': { var pq = plPrefs(); pq.rem = !pq.rem; pq.remD = todayStr(); save(); plRefresh(); if (pq.rem) { toast(T('plRemOn'), null, true); var px = plRemTxt(); if (NAT && NS.perm !== 'granted' && px) NAT.notif.enable({ id: PL_ID, day: (S.weekdayIdx(todayStr()) + 1) % 7, hour: 12, title: 'KalkiFit', body: natTr(T('plRemToast', { x: px })), url: (lang === 'ru' ? '/ru/kalkifit' : '/kalkifit') + '?plato=1' }).then(function (r) { if (r === 'on') NS.perm = 'granted'; else if (r === 'denied') NS.perm = 'denied'; }).catch(function () {}); else plResched(); } else plResched(); break; }
      case 'plsrc': { if (pv) { pv.src = !pv.src; plRefresh(); } break; }
      case 'plgoal': { kit.closeSheet(); setTimeout(openProfile, 260); break; }
      case 'pesex': { peRead(); pe.sex = el.getAttribute('data-v'); if (pe.sex === 'm') pe.preg = false; peRepaint(); break; }
      case 'peact': peRead(); pe.act = +el.getAttribute('data-v'); peRepaint(); break;
      case 'pegoal': if (el.getAttribute('aria-disabled') !== 'true') { peRead(); pe.goal = el.getAttribute('data-v'); peRepaint(); } break;
      case 'pesave': peSave(); break;
      case 'fmic': if (el.id === 'micBtn' && Date.now() - vHoldT < 1500) break; voiceStart(); break; case 'vstop': voiceCancel(); kit.closeSheet(); break; case 'vdone': voiceFinish(); break; case 'vtext': openText(fd && fd.date); break;
      case 'hafta': openWeek(el.getAttribute('data-end') || null); break; case 'hwtog': hwToggle(el.getAttribute('data-v') === '1'); break;
      case 'daycard': openDayCard(); break; case 'kcgo': kcShare(); break;
      case 'share': openShare(); break; case 'shgo': shGo(false); break; case 'shdl': shGo(true); break;
      case 'dayend': { var t0 = todayStr(), r0 = S.finishDay(st, t0, t0); if (r0.why === 'empty') break; commit(); toast(T(r0.ok ? 'deDone' : 'deLow'), function () { if (st.days[t0]) delete st.days[t0].done; commit(); }, r0.ok); if (r0.ok) jokeAfter('dayend'); break; }
      case 'export': doExport(); break; case 'import': bk.restoreSheet(); break; case 'wipe': wipe(); break;
      case 'tips': prefs().tipsDone = false; save(); view = 'today'; enterNext = true; var m0 = $('#rzMain'); if (m0) m0.scrollTop = 0; render(); break;
      case 'about': aboutOpen(true); break;
      case 'apk': { window.location.href = lang === 'ru' ? '/ilova/?lang=ru' : (isCyr() ? '/ilova/?lang=cyr' : '/ilova/'); break; }
      case 'jclose': { stEv('hazil_yopildi'); hazilStore().jx = todayStr(); saveQuiet(); var jl = $('#jLine'); if (jl) jl.remove(); break; }
      case 'hide': prefs()['h_' + el.getAttribute('data-k')] = Date.now(); commit(); break;
      case 'hideweek': prefs().weekHide = todayStr(); commit(); break;
      case 'font': { var big = el.getAttribute('data-f') === 'b'; document.documentElement.classList.toggle('fs-big', big); try { if (big) localStorage.setItem('kalki_fs', 'big'); else localStorage.removeItem('kalki_fs'); } catch (x) {} render(); break; }
      case 'langmenu': lmenu.hidden = !lmenu.hidden; break;
      case 'lang': { var l = el.getAttribute('data-l'); stEv('til_tanlandi', l); l = el.getAttribute('data-l'); var tgt = document.getElementById(l === 'cyr' ? 'langCyr' : (l === 'ru' ? 'langRu' : 'langUz')); if (tgt) tgt.click(); break; }
      case 'dprev': foodDay = Dt.addDays(foodDay || todayStr(), -1); render(); break;
      case 'dnext': if ((foodDay || todayStr()) < todayStr()) { foodDay = Dt.addDays(foodDay || todayStr(), 1); render(); } break;
      case 'addto': openAdd({ meal: el.getAttribute('data-m'), date: el.getAttribute('data-d') }); break;
      case 'addtext': openText(el.getAttribute('data-d')); break;
      case 'pickfav': openAdd({ date: el.getAttribute('data-d'), food: el.getAttribute('data-id') }); break;
      case 'editfood': openEdit(el.getAttribute('data-d'), +el.getAttribute('data-id')); break;
      case 'mlmore': mlOpen[el.getAttribute('data-d') + el.getAttribute('data-m')] = true; render(); break;
      case 'mlless': delete mlOpen[el.getAttribute('data-d') + el.getAttribute('data-m')]; render(); break;
      case 'mlgrp': { var gh = mlGrpHtml(el.getAttribute('data-d'), el.getAttribute('data-ids').split(',').map(Number)); if (gh) openSheet('mlgrp', gh); break; }          // v63: birlashgan qator — alohida yozuvlar
      case 'mlgdel': {
        var gd = el.getAttribute('data-d'), gid = +el.getAttribute('data-id'), gl = el.closest('.ml-gl'), left = gl ? gl.getAttribute('data-ids').split(',').map(Number).filter(function (i) { return i !== gid; }) : [], grm = S.removeFood(st, gd, gid); if (!grm) break;
        commit(); vib(); if (left.length >= 2) setSheet(mlGrpHtml(gd, left)); else kit.closeSheet();
        toast(T('del1'), function () { S.restoreFood(st, gd, grm); commit(); }, true); break;
      }
      case 'pickfood': { var pk0 = el.getAttribute('data-pick'); var pr0 = el.getAttribute('data-pre'); pickFood(el.getAttribute('data-id'), pk0 ? JSON.parse(pk0) : null, pr0 ? JSON.parse(pr0) : null); break; }
      case 'calinfo': openSheet('calinfo', shHead(T('calInfoT')) + '<p class="rz-p">' + esc(T('calNote')) + '</p><p class="rz-p sm">' + esc(T('deHint')) + '</p>' + okBtn()); break;
      case 'fquick': quickAdd(el.getAttribute('data-d'), +el.getAttribute('data-i'), el.getAttribute('data-fk')); break;
      case 'pwmore': { var o8 = pwO(); o8.pmore = !o8.pmore; var pm = $('#pwMore'); if (pm) pm.hidden = !o8.pmore; el.setAttribute('aria-expanded', !!o8.pmore); break; }          // «›» CSS bilan buriladi (aria-expanded)
      case 'fqai': { var q0 = fd.q; openText(null, true); fd.txt = q0; setSheet(textHtml()); txGo(); setTimeout(function () { if (fd && fd.missing && fd.missing.length && navigator.onLine !== false) txAi(); }, 80); break; }
      case 'fcustom': { var qv = $('#fdQ'); openCustom(qv ? qv.value : ''); break; }
      case 'cusave': cuSave(); break;
      case 'lbphoto': openLbl('rasm'); break;
      case 'rclbl': kit.closeSheet(); openAdd({}); openLbl('rasm'); break;
      case 'lbman': { var nm0 = fd && fd.lb ? (lbKeep(), fd.lb.nom) : null; openLbl('qolda', nm0, '100'); break; }
      case 'lbback': if (fd.lb && fd.lb.src === 'rasm' && fd.lb.step === 'form' && !fd.lb.ai) { lbKeep(); fd.lb.step = 'pick'; lbRefresh(); } else backToSearch(); break;
      case 'lbb': lbKeep(); fd.lb.b = el.getAttribute('data-b'); lbRefresh(); lbPaint(); break;
      case 'lbfile': phFromFile(); break; case 'lbcam': lbNativePick('CAMERA'); break; case 'lbgal': lbNativePick('PHOTOS'); break;
      case 'fback': if (fd.yBack) { var yb = fd.yBack; fd = null; if (yb === 'f') Y.fishBack(); else Y.yBack(); } else if (fd.editId != null) kit.closeSheet(); else backToSearch(); break;
      case 'ffav': { var on = S.toggleFav(st, fd.favId || fd.food.id); save(); var b = $('[data-act=ffav]'); b.classList.toggle('fav', on); b.setAttribute('aria-pressed', on); toast(T(on ? 'favOn' : 'favOff')); break; }
      case 'funit': { var o1 = pwO(), nu = el.getAttribute('data-u'), wasV = !!vOf(o1.unit); if (nu !== o1.unit) pwSetUnit(o1, nu); if (wasV || vOf(nu)) pwScreen(); else pwUpdate(); break; }
      case 'fqty': { var o2 = pwO(); pwSetQty(o2, o2.qty + (+el.getAttribute('data-s')) * pwStep(o2)); pwUpdate(); vib(5); break; }
      case 'fmeal': fd.meal = el.getAttribute('data-m'); (function () { var mv = $('#fdMealV'); if (mv) mv.textContent = mealName(fd.meal); var tp = $('[data-act=tplsave]'); if (tp) tp.setAttribute('data-m', fd.meal); })(); $$('[data-act=fmeal]').forEach(function (b) { var on3 = b === el; b.classList.toggle('on', on3); b.setAttribute('aria-pressed', on3); });  pwUpdate(); break;
      case 'fmeal2': { var x2 = S.dayOf(st, fd.date), e2 = x2 && x2.food.filter(function (y) { return y.id === fd.editId; })[0]; if (e2) { e2.meal = el.getAttribute('data-m'); save(); kit.closeSheet(); render(); } break; }
      case 'fmeal3': fd.meal = el.getAttribute('data-m'); $$('[data-act=fmeal3]').forEach(function (b) { var on4 = b === el; b.classList.toggle('on', on4); b.setAttribute('aria-pressed', on4); }); break;
      case 'fsave': fSave(); break; case 'fdel': fDelete(); break;
      case 'txgo': txGo(); break; case 'txai': txAi(); break; case 'txsave': txSave(); break;
      case 'pwmeal': { fd.pmeal = !fd.pmeal; pwScreen(); break; }
      case 'exadd': openEx(null); break;
      case 'exedit': { if (el.__sw) { el.__sw = 0; break; } openEx(el.getAttribute('data-id'), el.getAttribute('data-d')); break; }
      case 'ext': { if (exv) { exv.t = el.getAttribute('data-v'); exApply(exv.t); } break; }
      case 'exmin': { if (exv) { exv.min = +el.getAttribute('data-v'); exApply(); } break; }
      case 'exstep': { if (exv) { exv.min = Math.max(5, Math.min(180, exv.min + (+el.getAttribute('data-s') || 0))); exApply(); } break; }
      case 'exlv': { if (exv) { exv.lv = +el.getAttribute('data-v'); exApply(); } break; }
      case 'exsave': exSave(); break;
      case 'exdel': { if (exv && exv.id) exDel(exv.id, exv.d); break; }
      case 'stepin': openStepIn(); break;
      case 'sid': { if (siv) { siv.d = el.getAttribute('data-v'); setSheet(stepInHtml()); } break; }
      case 'sisave': stepInSave(); break;
      case 'hcEon': hcEon(); break;
      case 'lmok': { delete prefs().limShow; save(); render(); break; }
      case 'exlist': openExList(); break; case 'xkform': openExplainKcal(); break; case 'exwhy': { var wy = $('#exWhy'); if (wy) { wy.hidden = !wy.hidden; el.setAttribute('aria-expanded', !wy.hidden); } break; }
      case 'vtxedit': fd.vEdit = 1; setSheet(textHtml()); break;
      case 'aftz': { var tc = AF && AF.todayCard(); if (tc) AF.open({ from: 'kun', id: tc.id, pick: el.getAttribute('data-v') }); break; }
      case 'crdgo': crdGo(el.getAttribute('data-k')); break; case 'crdno': crdMark(el.getAttribute('data-k'), false); render(); break; case 'crdcopy': inst.copyData(); break;
      case 'txdel': aiFMark('ochirildi'); fd.items.splice(+el.getAttribute('data-i'), 1); txRefresh(); break;
      case 'yesam': openYesam(); break;
      case 'ypick': yPick(el.getAttribute('data-id')); break;
      case 'yback': yd.food = null; setSheet(ySearchHtml()); yRefresh(); break;
      case 'yunit': { var yu = el.getAttribute('data-u'); if ((yu === 'g100') !== (yd.unit === 'g100')) yd.qty = yu === 'g100' ? 100 : 1; yd.unit = yu; $$('[data-act=yunit]').forEach(function (b) { var on = b === el; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); }); yUpdate(); break; }
      case 'yqty': { var ys = yd.unit === 'g100' ? 25 : 0.5, yq = yd.qty + (+el.getAttribute('data-s')) * ys; yd.qty = Math.max(ys, Math.min(yd.unit === 'g100' ? 3000 : 50, Math.round(yq * 100) / 100)); yUpdate(); vib(5); break; }
      case 'fphoto': if (navigator.onLine !== false) { if (phNative()) { phChooser(); break; } phFromFile(); } break;      // ilovada: o'z tanlov oynamiz (Galereyadan / Rasmga olish / Fayllardan), vebda — fayl tanlash
      case 'fphotog': phNativePick('PHOTOS'); break; case 'fphotoc': phNativePick('CAMERA'); break; case 'fphotof': phFromFile(); break;
      case 'phalt': aiFMark('tahrir'); phAlt(+el.getAttribute('data-i'), +el.getAttribute('data-k')); break; case 'phfind': aiFMark('tahrir'); phFind(+el.getAttribute('data-i')); break; case 'phpick': phPick(+el.getAttribute('data-i'), el.getAttribute('data-id')); break; case 'phfindx': fd.mode = 'photo'; setSheet(phHtml()); break;
      case 'itedit': aiFMark('tahrir'); itemOpen(+el.getAttribute('data-i'), fd.mode === 'photo' ? 'photo' : (fd.mode === 'tpl' ? 'tpl' : 'text')); break;
      case 'pwdone': itemBack(); break;
      case 'pwq': { var o3 = pwO(), u3 = el.getAttribute('data-u'), sw3 = u3 && u3 !== o3.unit && (!!vOf(u3) || !!vOf(o3.unit)); if (u3) o3.unit = u3; pwSetQty(o3, +el.getAttribute('data-v')); if (sw3) pwScreen(); else pwUpdate(); vib(5); break; }
      case 'pwgram': { var o9 = pwO(), w9 = !!vOf(o9.unit); if (o9.unit !== 'g100') { pwSetUnit(o9, 'g100'); if (w9) pwScreen(); else pwUpdate(); } var qi9 = $('#fdQty'); if (qi9) { try { qi9.focus(); qi9.select(); } catch (x) {} } break; }
      case 'qmeal': mealMenu($('#kqMM') && $('#kqMM').hidden); break;
      case 'qmealset': mealSet(el.getAttribute('data-m')); break;
      case 'fadd': { var pk1 = el.getAttribute('data-pick'); addNow(el.getAttribute('data-id'), pk1 ? JSON.parse(pk1) : null, el.getAttribute('data-fk'), el.getAttribute('data-src'), el.getAttribute('data-pre') ? JSON.parse(el.getAttribute('data-pre')) : null); break; }
      case 'tpladd': tplAdd(+el.getAttribute('data-id')); break;
      case 'pwswap': loadDb(function () { setSheet(pwSwapHtml(pwO())); }); break;
      case 'pwswapx': pwScreen(); break;
      case 'baliqgo': openFish(); break;
      case 'ibtog': { var ibx = el.parentNode && el.parentNode.nextElementSibling, ibo = el.getAttribute('aria-expanded') !== 'true'; if (ibx && ibx.classList.contains('sl-ibx')) { ibx.hidden = !ibo; el.setAttribute('aria-expanded', String(ibo)); } break; }
      case 'streakinfo': openSheet('stk', shHead(T('stkT')) + '<p class="rz-p">' + esc(T('stkB', { n: S.streak(st, todayStr()) })) + '</p>' + okBtn()); break;
      case 'wkday': { var wd0 = el.getAttribute('data-d'); if (wd0 !== todayStr()) { foodDay = wd0; view = 'history'; enterNext = true; render(); } break; }
      case 'mealrep': mealRepeat(el.getAttribute('data-d'), el.getAttribute('data-m')); break;
      case 'baliqoff': prefs().baliqOff = true; commit(); break;
      case 'fwdaysheet': if (Y) Y.daySheet(); break;
      case 'pushon': pushEnable(); break;
      case 'pushoff': pushDisable(); break;
      case 'pushno': prefs().pushNo = Date.now(); commit(); break;
      case 'orgo': orGo(+el.getAttribute('data-i')); break;
      case 'ormore': fd.orMore = !fd.orMore; orRefresh(); break;
      case 'ortog': prefs().orin = el.getAttribute('data-v') === '1'; commit(); break;
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
      case 'rcmine': rcmineOpen(); break;
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
      case 'calday': foodDay = el.getAttribute('data-d'); view = 'history'; enterNext = true; render(); break;
      case 'jktog': prefs().jokes = el.getAttribute('data-v') === '1'; commit(); break;
      case 'city': openCity(); break;
      case 'citypick': prefs().city = el.getAttribute('data-id'); kit.closeSheet(); commit(); break;
      case 'supp': openSupp(); break;
      case 'tpls': tplsOpen(); break;
      case 'tplsave': tplStartSave(el.getAttribute('data-m'), el.getAttribute('data-d')); break;
      case 'tplgoadd': if (kit.sheetKind() === 'add') backToSearch(); else { kit.closeSheet(); setTimeout(function () { openAdd(); }, 250); } break;
      case 'tplsugsave': if (tmSug) tplStartSave(tmSug.meal, todayStr(), tmSug.entries); break;
      case 'tplsugno': { if (tmSug) { var pr = prefs(); (pr.tplNo || (pr.tplNo = [])).push(tmSug.key); save(); var sg = $('#tplSug'); if (sg) sg.parentNode.removeChild(sg); } break; }
      case 'tplname': tplSaveAs(el.getAttribute('data-n')); break;
      case 'tplsave2': { var tn = $('#tplNm').value.trim(); if (!tn) { flashEl($('#tplNm')); break; } tplSaveAs(tn); break; }
      case 'tplopen': { var tp = S.tplById(st, +el.getAttribute('data-id')); if (tp) tplShow(tp.name, tp.items); break; }
      case 'yday': { openAdd({ meal: el.getAttribute('data-m'), date: el.getAttribute('data-d') }); tplShow(T('tplYestT'), S.yesterdayEntries(st, fd.date, fd.meal).map(entryToTpl)); break; }
      case 'tplchk': { var ti = fd.items[+el.getAttribute('data-i')]; if (ti) { ti.off = !ti.off; var sc = $('#rzSheet').scrollTop; setSheet(tplHtml()); $('#rzSheet').scrollTop = sc; } break; }
      case 'tplup': case 'tpldn': { S.moveTemplate(st, +el.getAttribute('data-id'), a === 'tplup' ? -1 : 1); save(); setSheet(tplsHtml()); break; }
      case 'tpldel': { var did = +el.getAttribute('data-id'), idx = (st.tpls || []).map(function (x) { return x.id; }).indexOf(did), rm = S.removeTemplate(st, did); if (rm) { save(); setSheet(tplsHtml()); toast(T('tplDel1'), function () { st.tpls.splice(Math.min(idx, st.tpls.length), 0, rm); save(); if (kit.sheetKind() === 'tpls') setSheet(tplsHtml()); }); } break; }
      case 'tplren': { var rt = S.tplById(st, +el.getAttribute('data-id')); if (rt) { tm = { rid: rt.id }; setSheet(shHead(T('tplRen')) + '<label class="rz-f" for="tplNm"><span>' + esc(T('tplNameT')) + '</span><input id="tplNm" type="text" maxlength="40" autocomplete="off" enterkeyhint="done" value="' + esc(rt.name) + '"></label><div class="rz-actions sl-sticky"><button type="button" class="rz-btn ghost" data-act="tplren0">' + esc(T('back')) + '</button><button type="button" class="rz-btn primary" data-act="tplren2">' + esc(T('save')) + '</button></div>'); } break; }
      case 'tplren0': setSheet(tplsHtml()); break;
      case 'tplren2': { var rn = $('#tplNm').value.trim(); if (!rn) { flashEl($('#tplNm')); break; } S.renameTemplate(st, tm.rid, rn); save(); setSheet(tplsHtml()); break; }
      case 'spitem': { var it = supp && supp.items.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; if (it) { setSheet(spCardHtml(it)); var shh = $('#rzSheet'); if (shh) shh.scrollTop = 0; } break; }
      case 'spback': setSheet(spListHtml()); break;
      case 'obsex': ob.sex = el.getAttribute('data-v'); if (ob.sex === 'm') ob.preg = false; ['age', 'height', 'weight'].forEach(function (f) { if (!ob.touched[f]) ob[f] = ''; }); showOnb(); break;      // tegilmagan qiymatlar yangi jinsning boshlang'ich qiymatiga qaytadi
      case 'obact': ob.act = +el.getAttribute('data-v'); showOnb(); break;
      case 'obgoal': if (el.getAttribute('aria-disabled') !== 'true') { ob.goal = el.getAttribute('data-v'); showOnb(); } break;
      case 'obnext': obNext(); break; case 'obstart': obStart(); break;
      case 'obback': obBack(); break;
      case 'oblater': obLater(); break; case 'oblang': obLang(el.getAttribute('data-l')); break; case 'lppick': lpPick(el.getAttribute('data-l')); break;
      case 'taxgo': taxOpen(); break;
    }
  });
  root.addEventListener('focusout', function (e) { if (e.target && e.target.id === 'fdQty' && fd) { var o5 = pwO(); if (o5) e.target.value = qtyStr(o5.qty); } });
  root.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target && e.target.id === 'fdQty') { e.preventDefault(); e.target.blur(); } });
  if (window.visualViewport) { var vv = window.visualViewport, vvf = function () { var kb = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)); root.style.setProperty('--kb', (kb > 80 ? kb : 0) + 'px'); }; vv.addEventListener('resize', vvf); vv.addEventListener('scroll', vvf); }
  root.addEventListener('input', function (e) { var t = e.target; if (fd && fd.vc && /^vc(Name|Full|Empty|Direct)$/.test(t.id)) { fd.vc[{ vcName: 'name', vcFull: 'full', vcEmpty: 'empty', vcDirect: 'direct' }[t.id]] = t.value; var rs = $('#vcRes'); if (rs) rs.textContent = vcResTxt(); } else if (t.id === 'fdQty') { var v = parseFloat(String(t.value).replace(',', '.')); if (v > 0) { var o4 = pwO(); o4.qty = Math.min(pwMax(o4), Math.round(v * 100) / 100); pwUpdate(true); } } else if (/^cu[KPFC]$/.test(t.id) && fd && fd.mode === 'lbl') lbPaint(); else if (t.id === 'fdQ') { fd.q = t.value; clearTimeout(qTimer); qTimer = setTimeout(refreshRes, 120); } else if (t.id === 'ydQ') { yd.q = t.value; clearTimeout(qTimer); qTimer = setTimeout(yRefresh, 120); } else if (t.id === 'rcQ') { rc.q = t.value; var rr = $('#rcRes'); if (rr) rr.innerHTML = rcResults(); } else if (t.id === 'spQ') { spQ = t.value; var sr = $('#spRes'); if (sr) sr.innerHTML = spRows(); } else if (t.id === 'rcName') rc.name = t.value; });
  root.addEventListener('change', function (e) {
    var t = e.target;
    if (t.id === 'phIn') { var f0 = t.files && t.files[0]; if (f0) { if (fd && fd.mode === 'lbl') lbFile(f0); else phFile(f0); } } else if (t.id === 'jkParty') { S.ensureDay(st, todayStr()).party = t.checked; commit(); } else if (t.id === 'obPreg') ob.preg = t.checked; else if (t.id === 'peP') { pe.preg = t.checked; peRepaint(); } else if (t.hasAttribute && t.hasAttribute('data-sh')) { shSel[t.getAttribute('data-sh')] = t.checked; shPaint(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (closeFeats()) { e.preventDefault(); return; }          // «Imkoniyatlar» chap paneli
    if (Y && Y.backStep && Y.backStep()) { e.preventDefault(); return; }
    var mm0 = $('#kqMM'); if (mm0 && !mm0.hidden) { mealMenu(false); var mb0 = $('#kqMeal'); if (mb0) mb0.focus(); return; }
    if (document.body.classList.contains('rz-aboutopen')) aboutOpen(false); else if (kit.sheetKind()) kit.closeSheet(); else { var lm = $('#rzLangMenu'); if (lm) lm.hidden = true; }
  });
  var lastDay = Dt.today();
  document.addEventListener('visibilitychange', function () { if (!document.hidden && st && st.setup) { var d = Dt.today(); if (d !== lastDay) { lastDay = d; heroPrev = null; foodDay = null; render(); } } });
  try { var rootScr = document.documentElement.getAttribute('data-script'); new MutationObserver(function () { var scr = document.documentElement.getAttribute('data-script'); if (langNow() !== lang || scr !== rootScr) { rootScr = scr; render(); } }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'data-lang', 'data-script'] }); } catch (e) {}

  /* ---------- ishga tushirish ---------- */
  function init() {
    st = load(); if (loadDirty) { loadDirty = false; try { localStorage.setItem(LS, JSON.stringify(st)); } catch (e) {} } applyTheme(); shell();
    try { if ((window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true) document.body.classList.add('rz-standalone'); } catch (e) {}
    var ab = document.getElementById('rzAbout');
    if (ab && !document.getElementById('rzAboutBar')) {
      var bar = document.createElement('div'); bar.className = 'rz-about-bar'; bar.id = 'rzAboutBar'; bar.innerHTML = '<button type="button" class="rz-btn sm" id="rzAboutBack"></button>';
      ab.insertBefore(bar, ab.firstChild); bar.firstChild.addEventListener('click', function () { aboutOpen(false); });
    }
    if (Y) Y.init({ D: D, T: T, esc: esc, ico: ico, catIcon: catIcon, $: $, lang: function () { return lang; }, prefs: prefs, save: save, render: render, S: S, fmt: fmt, unitName: unitName, foodById: foodById, nameOf: nameOf, tileHtml: tileHtml, toast: toast, shHead: shHead,
      openSheet: openSheet, setSheet: setSheet, closeSheet: function () { kit.closeSheet(); }, today: todayStr, addDays: function (d, n) { return Dt.addDays(d, n); }, mealNow: mealNow, remFull: yzRemFull, logRecipe: ppLog, saveTpl: ppSaveTpl, tileFile: tileFile, quickRecipe: yzQuickRecipe, quickKey: yzQuickKey, added: function (k) { return !!yzAdded[k]; }, addedReset: function () { yzAdded = {}; }, reduce: function () { return !!reduce; }, openAdd: openAdd, by: orIndex, tags: function () { return orTags; }, table: function () { return orTable; }, remaining: yzRemaining, orSrc: function () { return orSrc(fd); }, orDesc: orDesc, orApply: orApply, portionHtml: portionHtml,
      sheetKind: function () { return kit.sheetKind(); }, addIcons: kit.addIcons, withDb: function (cb) { loadDb(function (err) { if (err) return; loadOr(cb); }); }, pickKey: yzPick, logKey: yzLog, logMenu: menuLog, imgPrep: imgPrep, aiNetErr: aiNetErr, pushResync: pushResync, matchFood: menuMatch, cid: cid, aiPlat: aiPlat, aiqSet: aiqSet, isCyr: isCyr, openExternal: openExternal, infoTitle: infoTitle,
      obYnToggle: function (t) { var l = ob.yemay || (ob.yemay = []), i = l.indexOf(t); if (i > -1) l.splice(i, 1); else l.push(t); showOnb(); } });
    if (R) R.init({ D: D, T: T, esc: esc, ico: ico, $: $, $$: $$, lang: function () { return lang; }, isCyr: isCyr, toast: toast, openSheet: openSheet, setSheet: setSheet, sheetKind: function () { return kit.sheetKind(); }, addIcons: kit.addIcons,
      count: function (h) { if (Y) Y.count(h); }, cid: cid, yemay: function () { return Array.isArray(prefs().yemay) ? prefs().yemay : []; },
      saveRecipe: function (name, ings, portions) { var f = S.saveRecipe(st, { name: name, ings: ings, portions: portions }); if (f) commit(); return f; },
      openAddFood: function (id) { kit.closeSheet(); setTimeout(function () { openAdd({ food: id }); }, 320); } });
    if (IN) IN.init({ D: D, T: T, esc: esc, ico: ico, $: $, lang: function () { return lang; } });
    obResume(); if (ob && st && st.setup) showOnb(); else render(); inst.gate();
    try { if (window.__kfSplashHide) window.__kfSplashHide(); } catch (e) {}      // HTML ichidagi splash (kalkifit.html) — ilova tayyor: silliq yo'qoladi (min 600 ms)
    if (KD.on && KD.intro && IN && st && st.setup) { introPending = true; introShow(); }
    if (st.setup) { loadMasofa(); loadDb(function () { if (view === 'today' && !kit.sheetKind()) render(); }); }
    if (st.setup && Y) Y.loadCh();                   // «Yemaydiganlarim» qoidasi ro'yxatlarda tayyor turishi uchun (kichik fayl)
    window.addEventListener('offline', phSetOffline); window.addEventListener('online', phSetOffline);
    var hv = viewOf(location.hash); if (hv && st.setup) { view = hv; render(); }
    if (location.hash === '#qoshish' && st.setup) openAdd({});
    statBoot(); qaBoot(); if (!QA && isNativeApp()) [800, 2500, 6000].forEach(function (ms) { setTimeout(function () { if (qaDetect() && qaView()) render(); }, ms); }); vHoldBoot(); updCheck();          // ko'prik kech tayyor bo'lsa — plagin keyinroq topiladi
    setTimeout(pendingFish, 700); document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') pendingFish(); });
    if (navigator.serviceWorker && navigator.serviceWorker.addEventListener) navigator.serviceWorker.addEventListener('message', function (ev) { if (ev.data && ev.data.t === 'baliq' && st && st.setup) { try { caches.open('kalkifit-pending').then(function (c) { c.delete('/__pending/baliq'); }); } catch (e) {} openFish(); } if (ev.data && ev.data.t === 'hafta' && st && st.setup) { try { caches.open('kalkifit-pending').then(function (c) { c.delete('/__pending/hafta'); }); } catch (e) {} openWeek(); } });
    if (window.KalkiNative) KalkiNative.setBack(nativeBack);
    if (NAT) { NAT.notif.onTap(function () { stEv('push_bosildi', 'hafta'); if (st && st.setup) openWeek(); }, HW_ID); }
    if (NAT) { NAT.notif.onTap(function () { stEv('push_bosildi'); if (st && st.setup) openFish(); }); NAT.notif.perm().then(function (p) { NS.perm = p; if (p === 'granted') { natResched(); hwResched(); plResched(); } if (view === 'profile' && !kit.sheetKind()) render(); }); }
    if (/[?&]baliq=1\b/.test(location.search) && st.setup) { try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) {} setTimeout(openFish, 500); }          // eslatma bosildi: baliq guruhi ochiladi
    if (/[?&]hafta=1\b/.test(location.search) && st.setup) { stEv('push_bosildi', 'hafta'); try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) {} setTimeout(function () { openWeek(); }, 500); }          // «Haftangiz xulosasi tayyor» bosildi
    if (/[?&]plato=1\b/.test(location.search) && st.setup) { try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) {} setTimeout(openPlato, 500); }          // «Eslatib turilsin» bildirishnomasi bosildi
    plBootRem(); protStat();
    if (location.hash === '#haqida') aboutOpen(true);
    window.__kalkifit = { get state() { return st; }, render: render, S: S, imgFile: imgFile, tile: function (fid, name) { return tileHtml(fid, null, name || fid, 34); }, jokeTest: function (t) { jkPrev(); jFlash = { text: t, rem: JK_MS }; jokeShow(); }, remFull: yzRemFull, voiceTest: function (t) { voiceDone(t, ''); } };          // jokeTest, voiceTest — faqat sinov/skrinshot uchun (ovoz natijasi: matn → ro'yxat)
    // pwa-install.js (KalkiPwa: iPhone ko'rsatmasi, Android o'rnatish) shu skriptdan KEYIN yuklanadi — sahifa yuklangach "o'rnatish" kartasi uchun qayta chizamiz
    if (document.readyState !== 'complete') window.addEventListener('load', function () { if (st && st.setup && view === 'today' && !kit.sheetKind() && !kit.tipsOn()) render(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
