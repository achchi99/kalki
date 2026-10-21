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
      ringOf: '/ {t} kkal', remLbl: 'Yana yeyish mumkin', overLbl: "Me'yordan ko'p", stepPlus: 'Qadamlar hisobiga +{c} kkal', hHow: 'Bu raqam qanday hisoblanadi?', limitParts: "{t} me'yor + {c} qadamlardan", tAiSite: "AI bugun juda band — ovqatni qidiruv orqali qo'shing (u internetsiz ham ishlaydi). Ertaga AI yana ishlaydi.", phSite: "Rasm tahlili bugun juda band — ovqatni matn yoki qidiruv bilan qo'shing. Ertaga yana ishlaydi.", hEmpty: "Birinchi ovqatni yozing — «Yedingiz» va «Qoldi» shu yerda yangilanadi.", stEmpty: "Qadam yozsangiz, ustunlar shu yerda o'sadi.",
      mP: 'Oqsil', mF: "Yog'", mC: 'Uglevod', wT: 'Suv', wOf: '{n} / {m} stakan', wHint: 'Stakanga bosing', wDone: "Suv me'yori bajarildi", sT: 'Qadam', sAdd: 'Qadam kiritish', sNone: 'Bugun hali kiritilmagan', sGoalDone: 'Qadam maqsadi bajarildi',
      addMeal: "+ Qo'shish", emptyMeal: "Hali yo'q",
      aT: "Ovqat qo'shish", aAiBtn: "AI bilan qo'shish", aSugBtn: 'Bazaga taklif qilish', aSugNote: "Saqlasangiz, nom va kaloriya (shaxsiy ma'lumotsiz) bazaga taklif sifatida yuboriladi.", aPh: 'Osh, «2 ta non»…', aRec: 'Oxirgi', aMine: 'Mening taomlarim', aCats: 'Guruhlar', aFav: 'Sevimli', aPop: 'Mashhur', aNone: 'Topilmadi', aNoneH: "Boshqa nom bilan yozing yoki o'z taomingizni qo'shing.", aCustom: "O'z taomim", aText: 'Matn bilan qo\'shish', aLoading: 'Baza yuklanmoqda…', aEst: 'taxminiy', per100: '{k} kkal / 100 g', all: 'Hammasi',
      cat_o: "O'zbek taomlari", cat_n: 'Non', cat_s: 'Sut', cat_m: "Go'sht, baliq, tuxum", cat_g: 'Don va makaron', cat_v: 'Sabzavot', cat_f: 'Meva', cat_d: "Yong'oq, quruq meva", cat_i: 'Ichimlik', cat_q: 'Fast-food', cat_h: 'Shirinlik', cat_x: 'Boshqa',
      pwGramm: 'gramm', pwEq: '1 {u} ≈ {g} g', pwNow: 'hozir {g} g', pwQty: 'Miqdor', pwQuick: 'Tez tanlash', pwSwap: 'Taomni almashtirish', pwSwapT: "O'xshash taomlar", pwNoSim: "O'xshash taom topilmadi", pwDone: 'Tayyor', pwApprox: "Taxminiy qiymat — porsiyani o'zingizga moslang.", pwAll: "Hammasini qo'shish ({n})", pwEditRow: "{x} — porsiyani o'zgartirish", tplMore: 'Ovqat amallari', tplSave1: 'Shu ovqatni saqlash', tplSaveH: 'Odatdagi ovqat sifatida', tplNameT: 'Nomi', tplNameIn: "Yoki o'zingiz yozing", tplSaved: 'Saqlandi: {x}', tplFull: "12 ta to'ldi — Men → «Odatdagi ovqatlarim»dan keraksizini o'chiring.", tplMine: 'Odatdagi ovqatlarim', tplMineH: 'Tez-tez yeydiganlaringiz', tplEmpty: "Tez-tez yeydigan ovqatingizni bir marta saqlang — keyin bir bosishda qo'shiladi.", tplBar: 'Odatdagilar', tplYest: 'Kechagidek', tplYestT: 'Kecha yegan ovqatlar', tplAdd: "Qo'shish ({n})", tplRen: "Nomini o'zgartirish", tplDel1: "Odatdagi ovqat o'chirildi", tplUp: 'Yuqoriga', tplDown: 'Pastga', tplCnt: '{n} ta · {k} kkal', tplChk: 'Tanlash', tplS0: 'Uy nonushtasi', tplS1: 'Ishdagi nonushta', tplS2: 'Mashqdan keyin', tplL0: 'Uy tushligi', tplL1: 'Ishdagi tushlik', tplD0: 'Uy kechki ovqati', tplD1: 'Yengil kechki ovqat', tplT0: 'Tamaddi', tplT1: 'Ishdagi tamaddi', tplSaveS: 'Saqlash', tplToday: 'Bugun yozilganlar', tplTodayRow: '{n} ta taom · {k} kkal', tplNoToday: 'Avval ovqat yozing, keyin uni shu yerda bir bosishda saqlaysiz.', tplAddFood: "Ovqat qo'shish", tplSugT: 'Siz tez-tez yeysiz: {x} — saqlaymi?', tplNo: "Yo'q", tplHint: "Bir marta saqlang — keyin bir bosishda qo'shiladi.", famN: '{n} xil', famDef: 'odatiy tanlov', srcBtn: 'Manba', srcNone: "Bu taom uchun manba yozuvi yo'q.", srcApprox: "Retsept o'rtacha uy taomiga asoslangan, ±15% farq bo'lishi mumkin.", srcApprox2: "Qiymat mavjud jadvallarga asoslangan, ±15% farq bo'lishi mumkin.", srcAi: "Bu qiymatni AI taxmin qildi — aniq emas.", srcUnitB: "birlik grammi mavjud baza qiymati (tarozida hali tekshirilmagan)", srcUnitA: "birlik grammi o'xshash taomdan olingan taxmin", vNew: 'Mening idishim', vfT: "Ichiga to'ldirish", vf_yarim: 'Yarim', vf_tola: "To'la", vf_kop: "Ko'p", vk_kosa: 'Kosa', vk_lagan: 'Lagan', vk_piyola: 'Piyola', vk_likopcha: 'Likopcha', vk_custom: "O'zim yozaman", vn_kosa: 'Mening kosam', vn_lagan: 'Mening laganim', vn_piyola: 'Mening piyolam', vn_likopcha: 'Mening likopcham', vn_custom: 'Mening idishim', vs_kosa: 'Odatiy kosa', vs_lagan: 'Odatiy lagan', vs_piyola: 'Odatiy piyola', vs_likopcha: 'Odatiy likopcha', vs_custom: 'Odatiy porsiya', vcT: 'Mening idishim', vcFor: '«{x}» uchun', vcLink: 'Boshqa idishlaringiz', vcKind: 'Idish turi', vcName: 'Idish nomi', vcHow: 'Hajmini qanday aniqlaymiz?', vcScaleOn: 'Tarozida tortdim', vcScaleOff: "Tarozim yo'q", vcHint: "Idishni bo'sh torting, keyin ovqat bilan — farqi ovqatingiz.", vcFull: 'Ovqat bilan vazn (g)', vcEmpty: "Bo'sh idish vazni (g)", vcDirect: "Yoki to'g'ridan-to'g'ri ovqat grammi", vcRes: 'Ovqat: {g} g', vcStd: '{k} ≈ {g} g', vcCompare: 'Sizning idishingiz standartga nisbatan?', vc_kichik: 'Kichikroq (×0,75)', vc_ohshash: "Shunga o'xshash (×1)", vc_katta: 'Kattaroq (×1,3)', vcSave: 'Saqlash', vcBad: "Gramm 10 dan 3000 gacha bo'lsin", vcMax: "Ko'pi bilan 20 ta idish. Keraksizini Men → «Mening idishlarim»dan o'chiring.", vSaved: 'Saqlandi: {x}', vmT: 'Mening idishlarim', vmH: "O'z kosa va laganlaringiz", vmEmpty: "O'z kosangizni bir marta belgilang — keyin hisob aniqroq bo'ladi.", vmGuide: "Ovqat qo'shayotganda porsiya oynasida «+ Mening idishim» ni bosing.", vmMax: "Ko'pi bilan {n} ta idish.", vmDel1: "Idish o'chirildi", vmEdit: 'Tahrirlash', vmName: 'Nomi', vmFam: 'Taomlar', vsugL: 'Har safar laganingizdan yeysizmi? Uni bir marta belgilang.', vsugK: 'Har safar kosangizdan yeysizmi? Uni bir marta belgilang.', vsugYes: 'Belgilash', vsugNo: 'Keyin', navDiary: 'Kundalik', navResults: 'Natijalar', navProfile: 'Profil', navAdd: "Qo'shish", diaryT: 'Kundalik', resT: 'Natijalar', profT: 'Profil', todayDate: 'Bugun, {d}', cEaten: 'Yedingiz', cGoal: 'Maqsad', cLeft: 'Qoldi', cOver: "Maqsaddan {x} kkal ko'p", cNote: "Kiritilgan ovqatlar bo'yicha", mainAdd: "Ovqat qo'shish", wCard: '{a} / {b} ml', wAdd: '+250', sCard: '{n} qadam', sEnter: 'Kiritish', sNoneC: 'Bugun kiritilmagan', macroRow: "Oqsil · Yog' · Uglevod", fabMenuT: "Nimani qo'shamiz?", fabFood: 'Ovqat', fabWater: 'Suv', fabSteps: 'Qadam', fabWeight: 'Vazn', wOpenT: 'Suv', themeT: 'Mavzu', thAuto: 'Avto', thLight: 'Och', thDark: "Qorong'i", profData: "Maqsad va ma'lumotlar", resWeekT: 'Hafta xulosasi', resMore: 'Batafsil', diaryAdd: "Shu kunga ovqat qo'shish", profBackup: 'Zaxira va ko\'chirish', calInfoT: 'Taqvim qanday hisoblanadi?', hStreak: '{n} kun', cBurn: 'Yoqildi', vLeft: 'Qoldi', vOver1: 'Maqsaddan', vOver2: "kkal ko'p", vAria: 'Kunlik maqsadning {p} foizi yeyildi, {k} kkal qoldi', vAriaO: "Kunlik maqsaddan {k} kkal ko'p yeyildi", wAdd2: '+ 250 ml', sTap: 'Qadam kiriting', wRowT: 'Vazn: {x} kg', wRowW: 'Haftada {d} kg', avL: 'K',
      mealAdd_b: "Nonushtani qo'shish", mealAdd_l: "Tushlikni qo'shish", mealAdd_d: "Kechki ovqatni qo'shish", mealAdd_s: "Tamaddini qo'shish", mealS_b: 'Nonushta', mealS_l: 'Tushlik', mealS_d: 'Kechki', mealS_s: 'Tamaddi',
      pCta_b: "Nonushtaga qo'shish · {k} kkal", pCta_l: "Tushlikka qo'shish · {k} kkal", pCta_d: "Kechki ovqatga qo'shish · {k} kkal", pCta_s: "Tamaddiga qo'shish · {k} kkal", pCtaE: 'Saqlash · {k} kkal',
      aHint: "Gap bilan yozing — AI o'zi ajratib beradi", aRecHint: "bitta bosishda qo'shiladi", aMoreSub: "O'z taomim · Retsept · Kategoriyalar", aCnt: '{n} taom · {k} kkal', aYestSub: '{m} · {k} kkal', pTypeT: 'Turi va hajmi', pChange: "O'zgartirish", pCloseL: 'Yopish', pMealT: 'Ovqat vaqti', aDone: "Qo'shildi", pManba: 'Manba',
      aAiLine: '✨ AI bilan aniqlash: «{q}»', aRecentT: 'Oxirgilar', aSavedT: 'Saqlanganlar', aMoreT: 'Boshqa usullar', aCatsBtn: "Kategoriyalar bo'yicha ko'rish", aLastTime: 'Oxirgi safar: {x}', aDefOne: '{x} ≈ {k} kkal', aQuickAdd: "Qo'shish", aAdded: "Qo'shildi: {x}", pAddBtn: "Qo'shish", pMoreT: "Turi va hajmini aniqlashtirish", pMore2T: 'Boshqa sozlamalar', srcPer100: '{k} kkal / 100 g', nbSee: "Ko'rish", nbClose: 'Yopish', pUnit: 'Qancha?', pMeal: 'Qaysi ovqat?', pSave: 'Saqlash', pEstNote: "Taxminiy qiymat: aniq retsept va porsiyaga qarab o'zgaradi.", pEdit: 'Ovqatni tahrirlash', pMacro: "oqsil {p} · yog' {f} · uglevod {c}", favOn: 'Sevimlilarga qo\'shildi', favOff: 'Sevimlilardan olindi',
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
      tip1: "Bu yerda bugun nechta kkal yeganingiz va qancha qolgani ko'rinadi. Ovqat yozsangiz «Qoldi» kamayadi.", tip2: "«Ovqat qo'shish» tugmasi — qidiring, porsiyani tanlang, qo'shing. Odatda 3 ta bosish yetadi.", tip3: "«Tarix»da kunlar, taqvim, vazn, hafta xulosasi va qadam tarixi bor — qadam sonini yozsangiz ilova masofa va kaloriyani hisoblaydi.",
      wkT: "O'tgan hafta", wkAvgK: "To'liq kunlarda o'rtacha: {x} kkal/kun", wkAvgS: "O'rtacha qadam: {x}", wkW: "Vazn (7 kunlik o'rtacha): {a} → {b} kg", wkDays: "7 kundan {n} tasi to'liq", wkNone: "Ma'lumot kam",
      nudgeInstall: "Ilovani bosh ekranga qo'shing — tezroq ochiladi va ma'lumot saqlanadi.", nudgeInstallBtn: "O'rnatish", nudgeIos: "iPhone'da: Safari'da «Ulashish» → «Bosh ekranga qo'shish». Aks holda Safari ma'lumotni o'chirib yuborishi mumkin.", nudgeBackup: "Haftalik zaxira vaqti — ma'lumot faqat shu qurilmada.", nudgeBackupBtn: 'Telegramga yuborish',
      qtyMinus: 'Kamaytirish', qtyPlus: "Ko'paytirish", aboutBack: 'Orqaga', errAmt: 'Raqamni kiriting', stepsT: 'Bugungi qadam', stepsOf: '{d} kuni qadami',
      units: { g100: 'g', kosa: 'kosa', likop: 'lagan', dona: 'dona', bolak: "bo'lak", stakan: 'stakan', qoshiq: 'osh qoshiq', choyq: 'choy qoshiq', piyola: 'piyola', porsiya: 'porsiya', hovuch: 'hovuch', tilim: 'tilim', shisha: 'shisha', six: 'six', skup: 'skup' }
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
      ringOf: '/ {t} ккал', remLbl: 'Ещё можно съесть', overLbl: 'Больше нормы', stepPlus: 'За счёт шагов +{c} ккал', hHow: 'Как считается это число?', limitParts: '{t} норма + {c} за шаги', tAiSite: 'ИИ сегодня перегружен — добавьте еду через поиск (он работает и без интернета). Завтра ИИ снова заработает.', phSite: 'Анализ фото сегодня перегружен — добавьте еду текстом или через поиск. Завтра снова заработает.', hEmpty: 'Запишите первую еду — «Съели» и «Осталось» обновятся здесь.', stEmpty: 'Запишете шаги — столбики вырастут здесь.',
      mP: 'Белки', mF: 'Жиры', mC: 'Углеводы', wT: 'Вода', wOf: '{n} / {m} стаканов', wHint: 'Нажимайте на стакан', wDone: 'Норма воды выполнена', sT: 'Шаги', sAdd: 'Ввести шаги', sNone: 'Сегодня ещё не введено', sGoalDone: 'Цель по шагам выполнена',
      addMeal: '+ Добавить', emptyMeal: 'Пока пусто',
      aT: 'Добавить еду', aAiBtn: 'Добавить через ИИ', aSugBtn: 'Предложить в базу', aSugNote: 'Если сохраните, название и калории (без личных данных) уйдут в базу как предложение.', aPh: 'Плов, «2 самсы»…', aRec: 'Недавние', aMine: 'Мои блюда', aCats: 'Группы', aFav: 'Избранное', aPop: 'Популярное', aNone: 'Не найдено', aNoneH: 'Напишите иначе или добавьте своё блюдо.', aCustom: 'Своё блюдо', aText: 'Добавить текстом', aLoading: 'Загрузка базы…', aEst: 'примерно', per100: '{k} ккал / 100 г', all: 'Все',
      cat_o: 'Узбекские блюда', cat_n: 'Хлеб', cat_s: 'Молочное', cat_m: 'Мясо, рыба, яйца', cat_g: 'Крупы и макароны', cat_v: 'Овощи', cat_f: 'Фрукты', cat_d: 'Орехи, сухофрукты', cat_i: 'Напитки', cat_q: 'Фастфуд', cat_h: 'Сладкое', cat_x: 'Другое',
      pwGramm: 'грамм', pwEq: '1 {u} ≈ {g} г', pwNow: 'сейчас {g} г', pwQty: 'Количество', pwQuick: 'Быстрый выбор', pwSwap: 'Заменить блюдо', pwSwapT: 'Похожие блюда', pwNoSim: 'Похожих блюд не найдено', pwDone: 'Готово', pwApprox: 'Примерное значение — подгоните порцию под себя.', pwAll: 'Добавить всё ({n})', pwEditRow: '{x} — изменить порцию', tplMore: 'Действия с приёмом пищи', tplSave1: 'Сохранить этот приём', tplSaveH: 'Как привычную еду', tplNameT: 'Название', tplNameIn: 'Или впишите своё', tplSaved: 'Сохранено: {x}', tplFull: 'Заполнено 12 — удалите ненужное в «Я» → «Привычная еда».', tplMine: 'Привычная еда', tplMineH: 'То, что вы едите часто', tplEmpty: 'Сохраните то, что часто едите, один раз — потом добавляйте в одно касание.', tplBar: 'Привычное', tplYest: 'Как вчера', tplYestT: 'Что вы ели вчера', tplAdd: 'Добавить ({n})', tplRen: 'Переименовать', tplDel1: 'Привычная еда удалена', tplUp: 'Выше', tplDown: 'Ниже', tplCnt: '{n} шт. · {k} ккал', tplChk: 'Выбрать', tplS0: 'Домашний завтрак', tplS1: 'Завтрак на работе', tplS2: 'После тренировки', tplL0: 'Домашний обед', tplL1: 'Обед на работе', tplD0: 'Домашний ужин', tplD1: 'Лёгкий ужин', tplT0: 'Перекус', tplT1: 'Перекус на работе', tplSaveS: 'Сохранить', tplToday: 'Записано сегодня', tplTodayRow: '{n} шт. · {k} ккал', tplNoToday: 'Сначала запишите еду — потом здесь её можно сохранить в одно касание.', tplAddFood: 'Добавить еду', tplSugT: 'Вы часто едите: {x} — сохранить?', tplNo: 'Нет', tplHint: 'Сохраните один раз — потом добавляйте в одно касание.', famN: '{n} вид.', famDef: 'обычный вариант', srcBtn: 'Источник', srcNone: 'Для этого блюда нет записи об источнике.', srcApprox: 'Рецепт основан на среднем домашнем блюде, возможно отклонение ±15%.', srcApprox2: 'Значение основано на существующих таблицах, возможно отклонение ±15%.', srcAi: 'Это значение оценил ИИ — оно неточное.', srcUnitB: 'граммы единицы — существующее значение базы (на весах пока не проверено)', srcUnitA: 'граммы единицы — оценка по похожему блюду', vNew: 'Моя посуда', vfT: 'Насколько наполнена', vf_yarim: 'Половина', vf_tola: 'Полная', vf_kop: 'С горкой', vk_kosa: 'Миска', vk_lagan: 'Лаган', vk_piyola: 'Пиала', vk_likopcha: 'Тарелочка', vk_custom: 'Своя (впишу название)', vn_kosa: 'Моя миска', vn_lagan: 'Мой лаган', vn_piyola: 'Моя пиала', vn_likopcha: 'Моя тарелочка', vn_custom: 'Моя посуда', vs_kosa: 'Обычная миска', vs_lagan: 'Обычный лаган', vs_piyola: 'Обычная пиала', vs_likopcha: 'Обычная тарелочка', vs_custom: 'Обычная порция', vcT: 'Моя посуда', vcFor: 'для «{x}»', vcLink: 'Другая ваша посуда', vcKind: 'Вид посуды', vcName: 'Название', vcHow: 'Как определим объём?', vcScaleOn: 'Взвесил(а)', vcScaleOff: 'Весов нет', vcHint: 'Взвесьте пустую посуду, затем с едой — разница и есть ваша еда.', vcFull: 'Вес с едой (г)', vcEmpty: 'Вес пустой посуды (г)', vcDirect: 'Или сразу вес еды (г)', vcRes: 'Еда: {g} г', vcStd: '{k} ≈ {g} г', vcCompare: 'Ваша посуда по сравнению со стандартной?', vc_kichik: 'Меньше (×0,75)', vc_ohshash: 'Такая же (×1)', vc_katta: 'Больше (×1,3)', vcSave: 'Сохранить', vcBad: 'Вес от 10 до 3000 г', vcMax: 'Не больше 20 штук. Удалите лишнее в «Я» → «Моя посуда».', vSaved: 'Сохранено: {x}', vmT: 'Моя посуда', vmH: 'Ваши миски и лаганы', vmEmpty: 'Отметьте свою миску один раз — и расчёт станет точнее.', vmGuide: 'При добавлении еды в окне порции нажмите «+ Моя посуда».', vmMax: 'Не больше {n} штук.', vmDel1: 'Посуда удалена', vmEdit: 'Изменить', vmName: 'Название', vmFam: 'Блюда', vsugL: 'Вы всегда едите из своего лагана? Отметьте его один раз.', vsugK: 'Вы всегда едите из своей миски? Отметьте её один раз.', vsugYes: 'Отметить', vsugNo: 'Позже', navDiary: 'Дневник', navResults: 'Итоги', navProfile: 'Профиль', navAdd: 'Добавить', diaryT: 'Дневник', resT: 'Итоги', profT: 'Профиль', todayDate: 'Сегодня, {d}', cEaten: 'Съели', cGoal: 'Цель', cLeft: 'Осталось', cOver: 'На {x} ккал больше цели', cNote: 'По внесённым блюдам', mainAdd: 'Добавить еду', wCard: '{a} / {b} мл', wAdd: '+250', sCard: '{n} шагов', sEnter: 'Ввести', sNoneC: 'Сегодня не введено', macroRow: 'Белки · Жиры · Углеводы', fabMenuT: 'Что добавим?', fabFood: 'Еда', fabWater: 'Вода', fabSteps: 'Шаги', fabWeight: 'Вес', wOpenT: 'Вода', themeT: 'Тема', thAuto: 'Авто', thLight: 'Светлая', thDark: 'Тёмная', profData: 'Цель и данные', resWeekT: 'Итоги недели', resMore: 'Подробнее', diaryAdd: 'Добавить еду на этот день', profBackup: 'Резервная копия и перенос', calInfoT: 'Как считается календарь?', hStreak: '{n} дн.', cBurn: 'Сожжено', vLeft: 'Осталось', vOver1: 'Сверх цели', vOver2: 'ккал', vAria: 'Съедено {p}% дневной цели, осталось {k} ккал', vAriaO: 'Съедено на {k} ккал больше цели', wAdd2: '+ 250 мл', sTap: 'Введите шаги', wRowT: 'Вес: {x} кг', wRowW: 'За неделю {d} кг', avL: 'К',
      mealAdd_b: 'Добавить завтрак', mealAdd_l: 'Добавить обед', mealAdd_d: 'Добавить ужин', mealAdd_s: 'Добавить перекус', mealS_b: 'Завтрак', mealS_l: 'Обед', mealS_d: 'Ужин', mealS_s: 'Перекус',
      pCta_b: 'Добавить в завтрак · {k} ккал', pCta_l: 'Добавить в обед · {k} ккал', pCta_d: 'Добавить в ужин · {k} ккал', pCta_s: 'Добавить в перекус · {k} ккал', pCtaE: 'Сохранить · {k} ккал',
      aHint: 'Пишите фразой — ИИ сам разберёт', aRecHint: 'добавляется одним касанием', aMoreSub: 'Своё блюдо · Рецепт · Категории', aCnt: '{n} блюд · {k} ккал', aYestSub: '{m} · {k} ккал', pTypeT: 'Вид и размер', pChange: 'Изменить', pCloseL: 'Закрыть', pMealT: 'Приём пищи', aDone: 'Добавлено', pManba: 'Источник',
      aAiLine: '✨ Определить через ИИ: «{q}»', aRecentT: 'Недавние', aSavedT: 'Сохранённое', aMoreT: 'Другие способы', aCatsBtn: 'Смотреть по категориям', aLastTime: 'В прошлый раз: {x}', aDefOne: '{x} ≈ {k} ккал', aQuickAdd: 'Добавить', aAdded: 'Добавлено: {x}', pAddBtn: 'Добавить', pMoreT: 'Уточнить вид и размер', pMore2T: 'Другие настройки', srcPer100: '{k} ккал / 100 г', nbSee: 'Смотреть', nbClose: 'Закрыть', pUnit: 'Сколько?', pMeal: 'Какой приём пищи?', pSave: 'Сохранить', pEstNote: 'Значение примерное: зависит от рецепта и порции.', pEdit: 'Изменить запись', pMacro: 'белки {p} · жиры {f} · углеводы {c}', favOn: 'Добавлено в избранное', favOff: 'Убрано из избранного',
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
      tip1: 'Здесь видно, сколько ккал вы съели сегодня и сколько осталось. Записываете еду — «Осталось» уменьшается.', tip2: 'Кнопка «Добавить еду» — найдите блюдо, выберите порцию, добавьте. Обычно хватает 3 нажатий.', tip3: 'В «Истории» — дни, календарь, вес, итоги недели и история шагов; введите шаги — приложение посчитает расстояние и калории.',
      wkT: 'Прошлая неделя', wkAvgK: 'В полные дни в среднем: {x} ккал/день', wkAvgS: 'В среднем шагов: {x}', wkW: 'Вес (среднее за 7 дней): {a} → {b} кг', wkDays: '{n} из 7 дней полные', wkNone: 'Мало данных',
      nudgeInstall: 'Добавьте приложение на главный экран — открывается быстрее, данные надёжнее.', nudgeInstallBtn: 'Установить', nudgeIos: 'На iPhone: в Safari «Поделиться» → «На экран «Домой»». Иначе Safari может удалить данные.', nudgeBackup: 'Пора сделать недельную копию — данные хранятся только на этом устройстве.', nudgeBackupBtn: 'Отправить в Telegram',
      qtyMinus: 'Меньше', qtyPlus: 'Больше', aboutBack: 'Назад', errAmt: 'Введите число', stepsT: 'Шаги за сегодня', stepsOf: 'Шаги за {d}',
      units: { g100: 'г', kosa: 'миска', likop: 'тарелка', dona: 'шт.', bolak: 'кусок', stakan: 'стакан', qoshiq: 'ст. ложка', choyq: 'ч. ложка', piyola: 'пиала', porsiya: 'порция', hovuch: 'горсть', tilim: 'ломтик', shisha: 'бутылка', six: 'шампур', skup: 'мерная ложка' }
    }
  };
  /* ---------- 2-bosqich matnlari: hazillar, "Buni yesam-chi?", retsept, taqvim, rasm, qo'shimchalar ---------- */
  Object.assign(D.uz, {
    jkT: 'Maslahat va hazil', perPortion: 'kkal / porsiya', spUl: 'Yuqori chegara (UL)', jkOn: 'Yoqilgan', jkOff: "O'chirilgan", jkCity: 'Shahringiz', jkCityH: 'Masofa taqqoslashlari shu shahardan boshlanadi', jkParty: "Bugun to'y yoki bayram kuni", jkNote: "Qiziqarli gaplar faqat ovqat, qadam va kundalik hayot ustidan — vazn va tana haqida gap yo'q.",
    stRouteF: "Bu {km} km — {route} masofasi ({rk} km) dan ko'proq", stRouteP: "Bu {km} km — {route} yo'lining {pct}%", cityPick: 'Shaharni tanlang',
    yT: 'Buni yesam-chi?', yBtn: 'Buni yesam-chi?', yPh: 'Qaysi ovqat? (somsa, osh, kola…)', yPick: 'Ovqatni tanlang — nima bo\'lishini ko\'ring', yRem: "Bugun me'yordan qoladi: {x} kkal", yAfterOk: 'Yesangiz: {x} kkal qoladi', yAfterOver: "Yesangiz: me'yordan {x} kkal oshadi", yWalk: 'Yoqish uchun: ≈ {min} daqiqa yurish (≈ {steps} qadam)', yNoSave: "Hech narsa saqlanmaydi — faqat oqibatni ko'rsatadi.", yAdd: 'Yeyman — yozib qo\'yish',
    rcT: "O'z taomim (retsept)", rcName: 'Taom nomi', rcNamePh: "masalan, Onamning oshi", rcIng: 'Masalliqlar', rcAdd: "+ Masalliq qo'shish", rcNoIng: "Hali masalliq yo'q", rcPortions: 'Necha porsiya chiqadi?', rcPer: 'Bir porsiya: {k} kkal', rcPerMac: "oqsil {p} · yog' {f} · uglevod {c} · {g} g", rcTotal: 'Hammasi: {g} g · {k} kkal', rcSave: 'Saqlash', rcSaved: "«{n}» saqlandi — endi qidiruvda chiqadi", rcPickIng: 'Masalliqni tanlang', rcGrams: 'Necha gramm?', rcAddIng: "Qo'shish", rcMine: 'Mening taomlarim', rcNoMine: "Hali retsept yo'q", rcDelete: "Taomni o'chirish", rcDeleted: "Taom o'chirildi", rcEdit: 'Retseptni tahrirlash', rcNew: "+ Retsept qo'shish", rcMineH: "Masalliqlarni gramm bilan yozing — bir porsiya kkal va makro o'zi hisoblanadi.", rcQ: 'Masalliq nomi', aRecipe: 'Retsept',
    calT: 'Oylik taqvim', calNear: 'Maqsadga yaqin', calLow: 'Pastroq', calHigh: 'Yuqoriroq', calPart: 'Qisman / davom etmoqda', calNone: "Ma'lumot yo'q", calPre: 'Kuzatuv boshlanmagan', calStart: 'Kuzatuv boshlangan: {d}', stNone: "Ma'lumot yo'q", stLive: 'Kun davom etmoqda', stPart: 'Qisman yozilgan', stNear: 'Maqsadga yaqin', stLow: 'Pastroq', stHigh: 'Yuqoriroq', stPre: 'Kuzatuv boshlanmagan', stFull: "To'liq kun", deBtn: 'Kunni yakunlash', deHint: "Hamma ovqatni yozgan bo'lsangiz, kunni yakunlang — statistika faqat to'liq kunlardan hisoblanadi.", deDone: 'Kun yakunlandi', deLow: "Kun yakunlandi, lekin yozuv maqsadning yarmidan kam — «qisman» bo'lib qoladi", deDoneL: 'Kun yakunlandi ✓', wFirst: "Birinchi o'lchov", wLast: "Oxirgi o'lchov", wAvgN: "Oxirgi 7 kundagi {n} ta o'lchov o'rtachasi: {x} kg", wTrend: "7 kunlik o'rtacha (trend): {x} kg", wTrendD: 'oldingi 7 kunga nisbatan {d} kg', wkNoFull: "To'liq kun yo'q — o'rtacha hisoblanmadi", xStepBase: "Odatiy chegara: {base} qadam. Bugun ortig'i: {n} qadam → +{k} kkal (sof)", calStreak: '{n} kun ketma-ket yozdingiz', calStreak0: "Seriya hali yo'q — bugun yozilsa boshlanadi", calNote: "Faqat to'liq kunlar (yakunlangan yoki o'tib ketgan, yozuv maqsadning ≥50% i) maqsad bilan solishtiriladi. Ranglar baho emas.", calDays: '{n} kun', calOpen: 'Kunni ochish',
    phBtn: 'Rasm', phGal: 'Galereyadan', phCam: 'Rasmga olish', phT: "Rasm bilan qo'shish", phNote: 'Rasm AI xizmatiga yuboriladi va saqlanmaydi.', phBusy: 'Rasm tahlil qilinmoqda…', phErr: "Rasmni aniqlab bo'lmadi. Qo'lda qo'shing.", phLimit: "Bugungi rasm limiti tugadi (kuniga 10 ta). Ertaga urinib ko'ring.", phOffline: "Internet yo'q — rasm tugmasi o'chiq", phApprox: 'taxminiy ±30%', phScale: 'Porsiyani tuzating', phNone: 'Rasmda ovqat topilmadi. Boshqa rasm yoki matn bilan urinib ko\'ring.', phSave: '{n} ta ovqatni saqlash', phHint: 'Natijani ko\'rib, porsiyani tuzatib tasdiqlang.', phPick: 'Kamera yoki galereya', tkNote: "Tasdiqlasangiz, ovqat nomi va kkal (shaxsiy ma'lumotsiz) umumiy bazaga taklif sifatida yuboriladi.",
    spT: 'Vitamin va qo\'shimchalar: kerakmi?', spCardT: '💊 Vitamin va BAD — kerakmi?', spH: "Ko'pchilikka kerak emas — avval ovqatni ko'ring.", spSearch: 'Qidirish (D vitamini, kreatin…)', spWhat: 'Nima va nima uchun kerak', spFood: 'Ovqatdan qayerdan olinadi', spWho: 'Kim uchun?', spNot: 'Qachon kerak emas?', spCare: "Ehtiyot bo'ling", spLvl: 'Dalil kuchi', spLvl_strong: 'Kuchli', spLvl_moderate: "O'rtacha", spLvl_low: 'Kam', spLvl_not: "Tavsiya etilmaydi", spEvL: 'Dalil: {t} {w}', spW_strong: 'kuchli', spW_moderate: "o'rtacha", spW_low: 'kam', spW_not: 'tavsiya etilmaydi', spTop: "Ro'yxatda — eng yuqori guruh bahosi; kartada hammasi.", spLvlH: "Foydasi haqidagi dalil kuchi (ma'lum guruhlar uchun).", spSrc: 'Manba: {s}', spChecked: 'Tekshirilgan: {d}', spProt: 'Bugun oqsil: {a} / {b} g', spNone: 'Topilmadi', spLoading: 'Yuklanmoqda…', spErr: "Ma'lumot yuklanmadi. Internetni tekshiring.", spRules: ["1. Avval ovqat.", "2. Tahlil bilan aniqlang.", "3. Ko'pi zararli bo'lishi mumkin."], spBack: 'Ro\'yxatga', srcNih: "NIH (AQSh Milliy sog'liqni saqlash institutlari), Qo'shimchalar idorasi", srcHarvard: "Harvard sog'liqni saqlash maktabi (Nutrition Source)"
  });
  Object.assign(D.ru, {
    jkT: 'Советы и шутки', perPortion: 'ккал / порция', spUl: 'Верхняя граница (UL)', jkOn: 'Включены', jkOff: 'Выключены', jkCity: 'Ваш город', jkCityH: 'Сравнения расстояний начинаются с этого города', jkParty: 'Сегодня свадьба или праздник', jkNote: 'Забавные фразы — только про еду, шаги и быт: про вес и тело — никогда.',
    stRouteF: 'Это {km} км — больше, чем путь {route} ({rk} км)', stRouteP: 'Это {km} км — {pct}% пути {route}', cityPick: 'Выберите город',
    yT: 'А если я это съем?', yBtn: 'А если я это съем?', yPh: 'Какая еда? (самса, плов, кола…)', yPick: 'Выберите еду — посмотрите, что будет', yRem: 'Сегодня до нормы остаётся: {x} ккал', yAfterOk: 'Если съесть: останется {x} ккал', yAfterOver: 'Если съесть: выше нормы на {x} ккал', yWalk: 'Чтобы сжечь: ≈ {min} мин ходьбы (≈ {steps} шагов)', yNoSave: 'Ничего не сохраняется — только показывает последствия.', yAdd: 'Съем — записать',
    rcT: 'Моё блюдо (рецепт)', rcName: 'Название блюда', rcNamePh: 'например, мамин плов', rcIng: 'Ингредиенты', rcAdd: '+ Добавить ингредиент', rcNoIng: 'Ингредиентов пока нет', rcPortions: 'Сколько порций получится?', rcPer: 'Одна порция: {k} ккал', rcPerMac: 'белки {p} · жиры {f} · углеводы {c} · {g} г', rcTotal: 'Всего: {g} г · {k} ккал', rcSave: 'Сохранить', rcSaved: '«{n}» сохранено — теперь найдётся в поиске', rcPickIng: 'Выберите ингредиент', rcGrams: 'Сколько граммов?', rcAddIng: 'Добавить', rcMine: 'Мои блюда', rcNoMine: 'Рецептов пока нет', rcDelete: 'Удалить блюдо', rcDeleted: 'Блюдо удалено', rcEdit: 'Изменить рецепт', rcNew: '+ Добавить рецепт', rcMineH: 'Впишите ингредиенты в граммах — ккал и БЖУ порции посчитаются сами.', rcQ: 'Название ингредиента', aRecipe: 'Рецепт',
    calT: 'Календарь месяца', calNear: 'Близко к цели', calLow: 'Ниже цели', calHigh: 'Выше цели', calPart: 'Частично / день идёт', calNone: 'Нет данных', calPre: 'Наблюдение не начато', calStart: 'Наблюдение начато: {d}', stNone: 'Нет данных', stLive: 'День продолжается', stPart: 'Частично записано', stNear: 'Близко к цели', stLow: 'Ниже цели', stHigh: 'Выше цели', stPre: 'Наблюдение не начато', stFull: 'Полный день', deBtn: 'Завершить день', deHint: 'Если записали всю еду — завершите день: статистика считается только по полным дням.', deDone: 'День завершён', deLow: 'День завершён, но записано меньше половины цели — он останется «частичным»', deDoneL: 'День завершён ✓', wFirst: 'Первое измерение', wLast: 'Последнее измерение', wAvgN: 'Среднее за последние 7 дней по {n} измерениям: {x} кг', wTrend: 'Среднее за 7 дней (тренд): {x} кг', wTrendD: 'по сравнению с предыдущими 7 днями {d} кг', wkNoFull: 'Нет полных дней — среднее не посчитано', xStepBase: 'Обычный порог: {base} шагов. Сегодня сверх него: {n} шагов → +{k} ккал (чистыми)', calStreak: 'Записи подряд: {n} дн.', calStreak0: 'Серии пока нет — начнётся, как только появится запись сегодня', calNote: 'Только полные дни (завершённые или прошедшие, записано ≥50% цели) сравниваются с целью. Цвета — не оценка.', calDays: '{n} дн.', calOpen: 'Открыть день',
    phBtn: 'Фото', phGal: 'Из галереи', phCam: 'Сделать фото', phT: 'Добавить по фото', phNote: 'Фото отправляется сервису ИИ и не сохраняется.', phBusy: 'Анализирую фото…', phErr: 'Не удалось распознать фото. Добавьте вручную.', phLimit: 'Лимит фото на сегодня исчерпан (10 в день). Попробуйте завтра.', phOffline: 'Нет интернета — кнопка фото отключена', phApprox: 'примерно ±30%', phScale: 'Поправьте порцию', phNone: 'На фото не найдено еды. Попробуйте другое фото или текст.', phSave: 'Сохранить: {n}', phHint: 'Проверьте результат, поправьте порцию и подтвердите.', phPick: 'Камера или галерея', tkNote: 'Если подтвердите, название блюда и ккал (без личных данных) отправятся в общую базу как предложение.',
    spT: 'Витамины и добавки: нужны ли?', spCardT: '💊 БАД и витамины — нужны ли?', spH: 'Большинству не нужны — сначала посмотрите на питание.', spSearch: 'Поиск (витамин D, креатин…)', spWhat: 'Что это и зачем', spFood: 'Где взять из еды', spWho: 'Для кого?', spNot: 'Когда не нужно?', spCare: 'Осторожно', spLvl: 'Сила доказательств', spLvl_strong: 'Сильная', spLvl_moderate: 'Средняя', spLvl_low: 'Слабая', spLvl_not: 'Не рекомендуется', spEvL: 'Доказательства {t}: {w}', spW_strong: 'сильные', spW_moderate: 'средние', spW_low: 'слабые', spW_not: 'не рекомендуется', spTop: 'В списке — оценка самой сильной группы; в карточке все.', spLvlH: 'Насколько доказана польза (для определённых групп).', spSrc: 'Источник: {s}', spChecked: 'Проверено: {d}', spProt: 'Белок сегодня: {a} / {b} г', spNone: 'Не найдено', spLoading: 'Загрузка…', spErr: 'Данные не загрузились. Проверьте интернет.', spRules: ['1. Сначала еда.', '2. Уточните анализом.', '3. Лишнее может навредить.'], spBack: 'К списку', srcNih: 'NIH (Национальные институты здоровья США), Управление по пищевым добавкам', srcHarvard: 'Гарвардская школа общественного здравоохранения (Nutrition Source)'
  });
  Object.assign(D.uz, {
    bkT: 'Baliq kuni eslatmasi', bkH: "Haftada bir marta — {d} kuni, 11:00 da. Boshqa xabar yuborilmaydi.", bkOn: 'Yoqish', bkOff: "O'chirish", bkIsOn: 'Yoqilgan: {d} kuni, 11:00 da.', bkIos: "Avval ilovani Bosh ekranga qo'shing (Safari: Ulashish → «Bosh ekranga qo'shish»), keyin eslatmani shu yerdan yoqing.", bkDenied: "Brauzerda bildirishnomalar o'chirilgan. Sayt sozlamalaridan ruxsat bering.", bkNA: "Bu brauzer yoki qurilmada bildirishnomalar mavjud emas. Baliq kuni ilova ichida eslatma ko'rsatiladi.", bkErr: "Yoqib bo'lmadi. Keyinroq urinib ko'ring.",
    fcT: 'Bugun baliq kuni', bkT2: 'Baliq kuni', bkLine: 'Haftada bir kun eslatamiz. Qaysi kun?', bkIos2: "Avval Bosh ekranga qo'shing: Ulashish → «Bosh ekranga»", bkDen2: "Bildirishnomalar o'chiq — brauzer sozlamasidan yoqing", bkDen3: "Bildirishnomalar o'chiq — telefon sozlamasidan yoqing", bkNA2: "Bu qurilmada eslatma yo'q — Bugun ekranida ko'rsatamiz", bkAsk: 'Haftalik baliq kuni eslatmasini yoqasizmi?', bkAskH: "Haftada bitta xabar, baliq kuni 11:00 da. Istalgan payt o'chirasiz.", bkNo: 'Hozir emas', bkOk: 'Tushunarli', bkMsg: "Bugun baliq kuni 🐟 — yaqin kafedan buyurtma qilasizmi yoki uyda pishirasizmi?", bkBtn: 'Baliq kuni', bkNever: "Bundan keyin ko'rsatma", bkDone: 'Yoqildi: baliq kuni 11:00 da eslatamiz.', bkDoneOff: "Eslatma o'chirildi.", cat_baliq: 'Baliq',
    qaT: 'Qadamlaringizni avtomatik sanaymizmi?', qaH: "Telefon o'zi sanaydi, joylashuvingiz olinmaydi.", qaYes: 'Ruxsat berish', qaLater: 'Keyinroq', qaBadge: 'Avtomatik', qaRow: 'Qadamni avtomatik sanash', qaRowH: "Telefon qadamni o'zi sanaydi (GPS ishlatilmaydi). Ma'lumot telefoningizda qoladi.", qaOnT: 'Qadam endi avtomatik sanaladi', qaDenied: "Ruxsat berilmadi. Telefon sozlamalarida KalkiFit → Ruxsatlar → «Jismoniy faollik» ni yoqing.", qaExtra: "Telefonsiz yurgan qadamlaringizni qo'shing. Avtomatik sanalgani ({a}) o'zgarmaydi.", qaExtraNow: "Qo'shilgan: {m}", qaAdd: "Qo'shish",
    mealAddS: "Qo'shish", vLeftK: 'kkal qoldi', cEaten2: "iste'mol", cGoal2: 'maqsad', cBurn2: 'yoqildi', stWrite: 'Yozish', stkQ: "Kun qanday hisoblanadi?", stkT: 'Ketma-ket kunlar', stkB: "Ketma-ket {n} kun ovqat yozdingiz. Kun hisobga olinishi uchun kamida bitta ovqat yozilgan bo'lishi kerak. Bugun hali yozilmagan bo'lsa ham, seriya kechagacha saqlanadi.", wkTap: "Kunni ochish", mealRepT: 'Takrorlash', mealRepD: "Shu ovqatdagi hamma taomni bugunga yana qo'shadi.", mealRepH: "Taomni uzun bosing — «Takrorlash»", mealEmptyD: 'Hali yozilmadi', histT: 'Tarix', navHist: 'Tarix', histDays: 'Kunlar', histRes: 'Natijalar', orWord: "O'rniga:", orLine: "O'rniga: {n} — {d}", orMore: 'Boshqa variantlar', orLess: 'Yopish', orP_up: 'oqsil +{x} g', orP_down: 'oqsil −{x} g', orP_same: 'oqsil deyarli bir xil', orF: "yog' {x} g", orK: '{x} kkal',
    orSet: "O'rinbosar takliflari", orSetH: "Porsiya oynasida o'xshash, oqsilga boyroq yoki yog'i kamroq taom taklif qilinadi", orOn: 'Yoqilgan', orOff: "O'chirilgan",
    orbT: 'Oqsil manbalari', orbEmpty: "3 kun yozgandan keyin shu yerda oqsil qaysi manbadan kelayotgani ko'rinadi.", orbSent: 'Bu hafta oqsilning {x}% i {s}. Baliq {n}.', orbTimes: '{n} marta',
    orb_qizil: "Qizil go'sht", orb_tovuq: 'Tovuq', orb_baliq: 'Baliq', orb_sut: 'Tuxum va sut', orb_dukkak: 'Dukkaklilar',
    orbA_qizil: "qizil go'shtdan", orbA_tovuq: 'tovuqdan', orbA_baliq: 'baliqdan', orbA_sut: 'tuxum va sut mahsulotlaridan', orbA_dukkak: 'dukkaklilardan', orbAria: 'Oqsil manbalari: {x}'
  });
  Object.assign(D.ru, {
    bkT: 'Напоминание о рыбном дне', bkH: 'Раз в неделю — в {d}, в 11:00. Других уведомлений не будет.', bkOn: 'Включить', bkOff: 'Выключить', bkIsOn: 'Включено: в {d}, в 11:00.', bkIos: 'Сначала добавьте приложение на экран «Домой» (Safari: Поделиться → «На экран Домой»), затем включите напоминание здесь.', bkDenied: 'В браузере уведомления отключены. Разрешите их в настройках сайта.', bkNA: 'В этом браузере или на этом устройстве уведомления недоступны. В рыбный день напоминание покажем внутри приложения.', bkErr: 'Не удалось включить. Попробуйте позже.',
    fcT: 'Сегодня рыбный день', bkT2: 'Рыбный день', bkLine: 'Напомним раз в неделю. В какой день?', bkIos2: 'Сначала добавьте на экран «Домой»: Поделиться → «На экран Домой»', bkDen2: 'Уведомления выключены — включите в настройках браузера', bkDen3: 'Уведомления выключены — включите в настройках телефона', bkNA2: 'Здесь уведомлений нет — покажем на экране «Сегодня»', bkAsk: 'Включить еженедельное напоминание о рыбном дне?', bkAskH: 'Одно уведомление в неделю, в рыбный день в 11:00. Отключить можно в любой момент.', bkNo: 'Не сейчас', bkOk: 'Понятно', bkMsg: 'Сегодня рыбный день 🐟 — закажете в ближайшем кафе или приготовите дома?', bkBtn: 'Рыбный день', bkNever: 'Больше не показывать', bkDone: 'Включено: напомним в рыбный день в 11:00.', bkDoneOff: 'Напоминание выключено.', cat_baliq: 'Рыба',
    qaT: 'Считать шаги автоматически?', qaH: 'Телефон считает сам, местоположение не используется.', qaYes: 'Разрешить', qaLater: 'Позже', qaBadge: 'Авто', qaRow: 'Автоматический подсчёт шагов', qaRowH: 'Телефон сам считает шаги (без GPS). Данные остаются на телефоне.', qaOnT: 'Теперь шаги считаются автоматически', qaDenied: 'Разрешение не дано. В настройках телефона: KalkiFit → Разрешения → «Физическая активность».', qaExtra: 'Добавьте шаги, пройденные без телефона. Автоматический счёт ({a}) не изменится.', qaExtraNow: 'Добавлено: {m}', qaAdd: 'Добавить',
    mealAddS: 'Добавить', vLeftK: 'ккал осталось', cEaten2: 'съедено', cGoal2: 'цель', cBurn2: 'сожжено', stWrite: 'Ввести', stkQ: 'Как считаются дни?', stkT: 'Дни подряд', stkB: 'Вы записывали еду {n} дн. подряд. День засчитывается, если записано хотя бы одно блюдо. Если сегодня ещё нет записей, серия сохраняется до вчерашнего дня.', wkTap: 'Открыть день', mealRepT: 'Повторить', mealRepD: 'Добавит на сегодня все блюда этого приёма пищи ещё раз.', mealRepH: 'Нажмите на приём пищи и удерживайте — «Повторить»', mealEmptyD: 'Пока не записано', histT: 'История', navHist: 'История', histDays: 'Дни', histRes: 'Итоги', orWord: 'Вместо:', orLine: 'Вместо: {n} — {d}', orMore: 'Другие варианты', orLess: 'Свернуть', orP_up: 'белка +{x} г', orP_down: 'белка −{x} г', orP_same: 'белка почти столько же', orF: 'жира {x} г', orK: '{x} ккал',
    orSet: 'Подсказки-замены', orSetH: 'В окне порции предлагается похожее блюдо с большим количеством белка или меньшим — жира', orOn: 'Включено', orOff: 'Выключено',
    orbT: 'Источники белка', orbEmpty: 'После 3 дней записей здесь будет видно, из чего складывается белок.', orbSent: 'На этой неделе {x}% белка — {s}. Рыба: {n}.', orbTimes: '{n}',
    orb_qizil: 'Красное мясо', orb_tovuq: 'Курица', orb_baliq: 'Рыба', orb_sut: 'Яйца и молочное', orb_dukkak: 'Бобовые',
    orbA_qizil: 'из красного мяса', orbA_tovuq: 'из курицы', orbA_baliq: 'из рыбы', orbA_sut: 'из яиц и молочных продуктов', orbA_dukkak: 'из бобовых', orbAria: 'Источники белка: {x}'
  });
  var root = document.getElementById('rzApp');
  var st = null, view = 'today', lang = langNow(), enterNext = true, foodDay = null, db = null, dbState = 0, heroPrev = null, seenFood = null, ob = null, reduce = false;
  function langNow() { return document.documentElement.lang === 'ru' ? 'ru' : 'uz'; }
  function isCyr() { return document.documentElement.getAttribute('data-script') === 'cyr'; }
  Object.assign(D.uz, { sMine: "Mening ma'lumotlarim", pFoot: "Ma'lumot faqat shu qurilmada. Tibbiy maslahat emas.", sRem: 'Eslatmalar', sLangT: "Til va ko'rinish", profBackup: "Ma'lumotni saqlash (email)", sHow: 'Qanday ishlaydi?', hEmpty: "Birinchi ovqatni qo'shing", aTabS: 'Qidirish', aTabM: 'Taomlarim', aTabT: 'Odatdagi', aTabV: 'Idishlar', aTabs: "Ovqat qo'shish bo'limlari", fuT: 'Foydali' });
  Object.assign(D.ru, { sMine: 'Мои данные', pFoot: 'Данные только на этом устройстве. Не медицинский совет.', sRem: 'Напоминания', sLangT: 'Язык и вид', profBackup: 'Сохранить данные (почта)', sHow: 'Как это работает?', hEmpty: 'Добавьте первую еду', aTabS: 'Поиск', aTabM: 'Мои блюда', aTabT: 'Привычные', aTabV: 'Посуда', aTabs: 'Разделы «Добавить еду»', fuT: 'Полезное' });
  function T(k, o) { var s = (D[lang] && D[lang][k] != null) ? D[lang][k] : D.uz[k]; if (typeof s === 'string' && o) s = s.replace(/\{(\w+)\}/g, function (m, x) { return o[x] != null ? o[x] : m; }); return s; }
  var kit = RzKit.create({ root: root, K: Dt, t: function (k) { return T(k); }, lang: langNow, isCyr: isCyr });
  /* Funksiya oynasi (Ovqat qo'shish, Bugun nima yeymiz?, Retsept, Suv, Tez-tez, Idish, Mening taomlarim) yopilganda DOIM Bugun'ga qaytadi (o'tgan kunga yozilayotgan «Ovqat qo'shish» bundan mustasno) */
  var FUNC_KINDS = ['add', 'yeymiz', 'fish', 'retsept', 'tpls', 'vess', 'rcmine', 'recipe', 'water'], _cs0 = kit.closeSheet;
  kit.closeSheet = function () { var k = kit.sheetKind(), past = k === 'add' && typeof fd !== 'undefined' && fd && fd.date && fd.date !== todayStr(); _cs0(); if (FUNC_KINDS.indexOf(k) > -1 && !past && view !== 'today') { view = 'today'; enterNext = true; var m0 = $('#rzMain'); if (m0) m0.scrollTop = 0; render(); } };
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
  function openSheet(kind, html, o) { kit.openSheet(kind, html, o || { noFocus: true }); if (SL) SL.mount($('#rzSheet')); }
  function setSheet(html) { var sh = $('#rzSheet'); sh.innerHTML = '<div class="rz-grab" aria-hidden="true"><i></i></div>' + html; kit.dpInit(); if (SL) SL.mount(sh); }
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
  var loadDirty = false;                             // migratsiya yangi maydon (kuzatuv boshi) qo'shdi — bir marta saqlanadi (zaxira/ko'chirish kodi bilan bir xil bo'lsin)
  function load() {
    try { var raw = lsGet(LS); if (raw) { var o0 = JSON.parse(raw), s = S.migrate(o0); if (s) { if (!s.prefs) s.prefs = {}; if (s.setup && o0 && !o0.trackStart) loadDirty = true; return s; } } } catch (e) {}
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
    trend: 'M3 17l5-5 4 4 8-8 M15 8h5v5', spark: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z', info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 11v6 M12 7.500v.500', grid: 'M6 4h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M15 4h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M6 13h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2z M15 13h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2z', today: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z', food: 'M7 3v8 M4 3v5a3 3 0 0 0 6 0V3 M7 11v10 M17 21V3c-2.2 1.5-3.5 4-3.5 7.5 0 2 1.2 3 3.5 3', steps: 'M7 20c-1.5 0-2.5-1.2-2.5-3 0-2 1-3.5 2.5-3.5S9.5 15 9.5 17c0 1.8-1 3-2.5 3z M16 13c-1.5 0-2.5-1.2-2.5-3 0-2 1-3.5 2.5-3.5s2.5 1.5 2.5 3.5c0 1.8-1 3-2.5 3z',
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
      '<div class="rz-top"><a class="rz-logo" href="./" data-cyr="skip">Kalki<span>.uz</span></a><div class="rz-title" id="rzTitle"></div>' +
      '<div class="rz-langwrap"><button type="button" class="rz-lang" id="rzLang" data-act="langmenu" aria-label="Til / Язык" data-cyr="skip">' + ico('lang', '', 2) + '<span id="rzLangTxt">UZ</span></button>' +
      '<div class="rz-langmenu" id="rzLangMenu" hidden data-cyr="skip"><button type="button" data-act="lang" data-l="uz">UZ</button><button type="button" data-act="lang" data-l="cyr">ЎЗ</button><button type="button" data-act="lang" data-l="ru">RU</button></div></div></div>' +
      '<main class="rz-main" id="rzMain" tabindex="-1"></main>' +
      '<nav class="rz-nav" aria-label="' + esc(T('appName')) + '">' + tab('today', 'today', 'navToday') + tab('history', 'cal2', 'navHist') + tab('profile', 'me', 'navProfile') +
      '<button type="button" class="rz-fab" id="rzFab" data-act="fab" aria-label="' + esc(T('navAdd')) + '">' + ico('plus', '', 2.6) + '</button></nav>' +
      kit.shellHtml() + '<input type="file" id="phIn" accept="image/*" hidden><div class="rz-onb" id="rzOnb" hidden></div><div class="rz-onb rz-intro" id="rzIntro" hidden></div>';
  }

  /* ---------- umumiy bo'laklar ---------- */
  function planNow() { return S.plan(st.profile); }
  /* ---------- taom rasmlari (assets/ovqat, 128/256 px WebP) va harfli tile ---------- */
  var IMGS = {};
  ['anor', 'ayron', 'banan', 'burger', 'chuchvara', 'dimlama', 'guruch', 'kartoshka-fri', 'lagmon', 'manti', 'mastava', 'moshxorda', 'navvot', 'norin', 'olivye', 'olma', 'osh', 'patir', 'pitsa', 'qatiq', 'qatlama', 'qovun', 'qovurdoq', 'qozon-kabob', 'shashlik', 'suzma', 'tarvuz', 'tuxum', 'uzum', 'xurmo'].forEach(function (k) { IMGS[k] = k; });
  var IMGMAP = { shurva: 'shorva', 'tovuq-shurva': 'shorva', choy: 'qora-choy', 'choy-shakar': 'qora-choy', 'choy-sut': 'qora-choy', 'yashil-choy': 'kok-choy', 'lavash-tovuq': 'lavash', 'lavash-mol': 'lavash', 'lavash-roll': 'lavash', hotdog: 'hot-dog', chakchak: 'chak-chak', achichuk: 'achchiq-chuchuk', 'tovuq-son': 'tovuq', 'tovuq-qov': 'tovuq', 'tuxum-qov': 'tuxum', 'tuxum-xom': 'tuxum', 'yengil-osh': 'osh', 'chuchvara-sho': 'chuchvara', 'shashlik-tovuq': 'shashlik', 'lagmon-qov': 'lagmon', 'kafe-tovuq-shashlik': 'shashlik', 'kafe-qoy-shashlik': 'shashlik', 'kafe-mol-shashlik': 'shashlik', 'kafe-lyulya': 'shashlik', 'kafe-baliq-shashlik': 'shashlik', 'kafe-jigar-kabob': 'shashlik', 'kafe-tandir-kabob': 'shashlik', 'kafe-jiz': 'shashlik', 'uy-tovuq-shashlik': 'shashlik', 'uy-lyulya': 'shashlik', 'kafe-tovuq-qanot': 'tovuq', 'kafe-tovuq-son-grill': 'tovuq', 'kafe-tandir-tovuq': 'tovuq', 'choyxona-osh': 'osh', 'kafe-lagmon-tovuq': 'lagmon', 'kafe-lagmon-qoy': 'lagmon', 'kafe-mastava': 'mastava', 'kafe-moshxorda': 'moshxorda', 'kafe-chuchvara-shorva': 'chuchvara', 'kafe-shurva': 'shorva', 'kafe-tovuq-shurva': 'shorva', 'uy-tovuq-shurva': 'shorva', 'doner': 'lavash', 'uy-lavash-tovuq': 'lavash', 'hotdog-mol': 'hot-dog', 'hotdog-tovuq': 'hot-dog', 'omlet-sabzavot': 'tuxum' };
  Object.keys(IMGMAP).forEach(function (k) { IMGS[k] = IMGMAP[k]; });
  function imgFile(fid, vr) {
    if (!fid) return null; var k = dbAlias[fid] || fid;
    if (String(fid).indexOf('somsa') === 0 || k === 'somsa') return (fid === 'somsa-qovoq' || /qovoq/.test(vr || '')) ? 'somsa-qovoq' : 'somsa-gosht';
    if (k === 'non') return vr === 'buxanka' ? null : (vr === 'patir' ? 'patir' : (vr === 'qatlama' ? 'qatlama' : 'obi-non'));
    if (fid === 'non-oq' || fid === 'non-qora') return null;
    return IMGS[fid] || IMGS[k] || null;
  }
  function tileHtml(fid, vr, name, px, hi) {
    var f = imgFile(fid, vr), sz = '--s:' + px + 'px';
    if (f) return '<span class="sl-tile" style="' + sz + '"><img src="/assets/ovqat/' + f + (hi ? '-256' : '-128') + '.webp"' + (hi ? '' : ' srcset="/assets/ovqat/' + f + '-128.webp 1x, /assets/ovqat/' + f + '-256.webp 2x"') + ' alt="" width="' + px + '" height="' + px + '" loading="lazy" decoding="async"></span>';
    var ik = Y && fid ? Y.iconFor(fid) : null; if (ik) return '<span class="sl-tile sl-ti2" style="' + sz + '" aria-hidden="true">' + ico(ik) + '</span>';
    var h = 0, n = String(name || '?'); for (var i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) % 360;
    return '<span class="sl-tile sl-tl" style="' + sz + ';--h:' + h + '" aria-hidden="true"><b>' + esc(n.charAt(0).toUpperCase()) + '</b></span>';
  }
  var WDN = { uz: ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'], ru: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'] };
  function entryRow(e, date) {
    var f = e.fid ? foodById(e.fid) : null, base = f && f.al ? (foodById(f.al.f) || f) : f, name = base ? nameOf(base) : (e.name || '?'), isNew = seenFood && !seenFood[e.id], lb = '';
    if (f && f.fam && e.vr) lb = S.famLabel(f, e.vr, e.sz, lang) || '';
    return '<button type="button" class="sl-row' + (isNew ? ' rz-new' : '') + '" data-act="editfood" data-d="' + date + '" data-id="' + e.id + '"><span class="m"><span class="nm">' + esc(name) + '</span><span class="tm">' + esc(portionText(e) + (lb ? ' · ' + lb : '')) + (e.est && !e.fid ? ' · ' + esc(T('aEst')) : '') + '</span></span><span class="am">' + (e.est && !e.fid ? '≈ ' : '') + fmt(e.kcal) + '</span></button>';
  }
  function mealTile(list) {                          // kartadagi 48 px rasm: eng ko'p kkal'li taom (rasmi yo'q bo'lsa — harfli tile)
    var best = null; list.forEach(function (e) { if (!best || e.kcal > best.kcal) best = e; });
    if (!best) return '<span class="sl-tile sl-te" style="--s:48px">' + ico('bowl') + '</span>';
    var f = best.fid ? foodById(best.fid) : null, base = f && f.al ? (foodById(f.al.f) || f) : f;
    return tileHtml(best.fid, best.vr, base ? nameOf(base) : (best.name || '?'), 48);
  }
  function mealsHtml(date) {
    var x = S.dayOf(st, date) || { food: [] }, h = '<section class="sl-meals">';
    S.MEALS.forEach(function (m) {
      var list = x.food.filter(function (e) { return e.meal === m; }), sum = S.sumEntries(list).kcal, yb = S.kechagidekOk(st, date, m);
      h += '<section class="sl-meal' + (list.length ? '' : ' empty') + '" data-m="' + m + '"><div class="sl-mh" data-m="' + m + '" data-d="' + date + '">' + mealTile(list) + '<span class="m"><b>' + esc(mealName(m)) + '</b>' + (list.length ? '' : '<span class="s">' + esc(T('mealEmptyD')) + '</span>') + '</span>' +
        (list.length ? '<span class="k">' + fmt(sum) + ' ' + T('kcal') + '</span><button type="button" class="sl-ib" data-act="tplsave" data-m="' + m + '" data-d="' + date + '" aria-label="' + esc(T('tplSave1') + ': ' + mealName(m)) + '">' + ico('star') + '</button><button type="button" class="sl-ib" data-act="addto" data-m="' + m + '" data-d="' + date + '" aria-label="' + esc(T('add') + ': ' + mealName(m)) + '">' + ico('plus', '', 2.4) + '</button>'
          : '<button type="button" class="sl-dash" data-act="addto" data-m="' + m + '" data-d="' + date + '" aria-label="' + esc(T('mealAdd_' + m)) + '">' + ico('plus', '', 2.2) + '<span>' + esc(T('mealAddS')) + '</span></button>') + '</div>' +
        (list.length ? '<div class="sl-ents">' + list.map(function (e) { return entryRow(e, date); }).join('') + '</div>' : (yb ? '<button type="button" class="sl-txtbtn sl-yb" data-act="yday" data-m="' + m + '" data-d="' + date + '">' + ico('undo') + '<span>' + esc(T('tplYest')) + '</span></button>' : '')) + '</section>';
    });
    return h + '</section>';
  }
  function mealRepeatSheet(date, m) {
    var x = S.dayOf(st, date), n = x ? x.food.filter(function (e) { return e.meal === m; }).length : 0; if (!n) return;
    openSheet('mealrep', shHead(T('mealRepT') + ': ' + mealName(m)) + '<p class="rz-p">' + esc(T('mealRepD')) + '</p><div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="sheetclose">' + esc(T('cancel')) + '</button><button type="button" class="rz-btn primary" data-act="mealrep" data-m="' + m + '" data-d="' + date + '">' + esc(T('mealRepT')) + '</button></div>');
  }
  function mealRepeat(date, m) {
    var x = S.dayOf(st, date), t = todayStr(), added = []; if (!x) return;
    x.food.filter(function (e) { return e.meal === m; }).forEach(function (e) { var c = {}; ['fid', 'name', 'meal', 'unit', 'qty', 'g', 'kcal', 'p', 'f', 'c', 'est', 'vr', 'sz', 'vn', 'vf'].forEach(function (k) { if (e[k] != null) c[k] = e[k]; }); c.ts = nowTs(); added.push(S.addFood(st, t, c)); });
    kit.closeSheet(); commit(); vib(); toast(T('saved'), function () { added.forEach(function (it) { S.removeFood(st, t, it.id); }); commit(); }, true);
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
    search: function (n) { return goTab('today', function () { openAdd(); setTimeout(function () { n.highlight($('#fdQ')); }, 450); }); },
    portion: function (n) { return goTab('today', function () { openAdd(); pickFood('olma'); setTimeout(function () { n.highlight($('.sl-qty')); }, 500); }); },
    units: function (n) { return goTab('today', function () { openAdd(); pickFood('osh'); setTimeout(function () { n.highlight($('#fdUnits')); }, 500); }); },
    variants: function (n) { return goTab('today', function () { openAdd(); pickFood('somsa'); fd.pmore = true; pwScreen(); setTimeout(function () { n.highlight($('#pwMore .rz-chips') || $('.sl-morebtn')); }, 500); }); },
    theme: function (n) { return goTab('profile', function () { var b = $('[data-act=theme]'); n.highlight(b && b.parentNode); }); },
    jokes: function (n) { return goTab('profile', function () { var b = $('[data-act=jktog]'); n.highlight(b && b.parentNode); }); },
    history: function (n) { return goTab('history', function () { n.highlight($('.sl-sec2') || $('#rzMain')); }); },
    week7: function (n) { return goTab('today', function () { n.highlight($('.sl-week7')); }); },
    yeymiz: function (n) { return goTab('today', function () { n.highlight($('#yeCard')); }); },
    retsept: function (n) { return goTab('today', function () { n.highlight($('#rtDoor')); }); },
    bugun: function (n) { return goTab('today', function () { n.highlight($('.sl-doors') || $('#mainAdd')); }); },
    yemaydi: function (n) { return goTab('profile', function () { n.highlight($('#ynCard')); }); },
    supp: function (n) { return goTab('history', function () { n.highlight($('[data-act=supp]')); }); },
    fishday: function (n) { return goTab('profile', function () { var r = $('#pushRow') || $('[data-act=jktog]'); n.highlight(r && (r.id === 'pushRow' ? r : r.parentNode)); }); },
    cats: function (n) { return goTab('today', function () { openAdd(); setTimeout(function () { n.highlight($('#catsRow')); }, 450); }); },
    simple: function (n) { return goTab('today', function () { n.highlight($('#mainAdd')); }); },
    source: function (n) { return goTab('today', function () { openAdd(); pickFood('somsa'); setTimeout(function () { n.highlight($('.sl-src')); }, 500); }); },
    vessel: function (n) { return goTab('today', function () { openAdd(); pickFood('osh'); setTimeout(function () { n.highlight($('.sl-vnew')); }, 500); }); },
    templates: function (n) { return goTab('today', function () { openAdd({}); setTimeout(function () { tplsOpen(); setTimeout(function () { n.highlight($('.sl-atab[data-t=t]')); }, 350); }, 450); }); },
    dayend: function (n) { return goTab('today', function () { var b = $('#dayEnd') || $('#dayEndDone'); if (b) n.highlight(b); else { kit.toast(n.t('hDayEnd')); n.highlight($('.sl-meal') || $('#kcalBtn')); } }); } } });
  function backupJoke() { var l = G && G.pickLine && prefs().jokes !== false && hazilState === 2 ? G.pickLine(jokeCtx(false), 'backup', {}, 'backup') : null; if (l) saveQuiet(); return l ? l.text : ''; }
  function nudges() {
    var out = [], p = prefs(), now = Date.now(), hid = function (k) { return p['h_' + k] && now - p['h_' + k] < 7 * DAY_MS; };
    if (bk.remindDue() && !hid('backup')) out.push({ k: 'backup', msg: T('nudgeBackup'), joke: backupJoke(), btn: T('nudgeBackupBtn'), act: 'bktg' });
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
    if (!x.food.length) return ''; if (x.done) return '<p class="sl-dayend done" id="dayEndDone">' + ico('check', 'sl-inl') + esc(T('deDoneL')) + '</p>' + orbHtml() + pushOfferHtml();
    return '<p class="sl-dayend"><button type="button" class="sl-txtbtn" data-act="dayend" id="dayEnd" title="' + esc(T('deHint')) + '">' + esc(T('deBtn')) + '</button></p>';
  }
  var jShown = '';                                  // oxirgi ko'rsatilgan hazil matni (almashganda 200 ms fade)
  function jokeSwap(text) {                         // Bugun: qator o'rnida matn yumshoq (200 ms) almashadi; qator yo'q bo'lsa qayta chiziladi
    var el = $('#jLine'); if (!el) { render(); return; } if (el.textContent === text) return;
    el.classList.remove('jnew'); el.classList.add('jout');
    setTimeout(function () { var e = $('#jLine'); if (!e) return; e.textContent = text; jShown = text; e.classList.remove('jout'); void e.offsetWidth; e.classList.add('jnew'); }, kit.reduce ? 0 : 200);
  }
  function jokeAfter(kind, p) {                     // hodisadan (ovqat/suv/qadam/vazn/kun yakuni) keyin hazil: toast YO'Q — oxirgi hazil Bugun'dagi qatorda keyingi hodisagacha (yoki kun almashguncha) turadi; kuniga ≤4 marta, oralig'i ≥60 s; hazil o'chirilgan bo'lsa — qator yo'q
    if (!G || !G.eventLine || prefs().jokes === false) return; var pr = hazilStore(), t = todayStr(), now = Date.now(); if (!pr.jfl || pr.jfl.d !== t) pr.jfl = { d: t, n: 0, t: 0 }; if (pr.jfl.n >= 4 || now - (pr.jfl.t || 0) < 60000) return;
    var ctx = jokeCtx(true), l = G.eventLine(ctx, kind, p); if (!l || !l.text) return; pr.jfl.n++; pr.jfl.t = now; pr.last = { d: t, text: l.text }; saveQuiet();
    if (view === 'today' && pr.jx !== t) jokeSwap(l.text);
  }
  function emptyLine() { var l = G && G.pickLine && prefs().jokes !== false && hazilState === 2 ? G.pickLine(jokeCtx(false), 'empty_day', {}, 'empty') : null; if (l) saveQuiet(); return l ? l.text : T('hEmpty'); }
  function jokeLineHtml() {                          // Bugun, idish kartasi ostidagi bitta ixcham qator: oxirgi hodisa hazili (bo'lmasa holatga mos qator); hazil o'chiq yoki bugun yopilgan bo'lsa yo'q
    if (!G || !G.todayLine || prefs().jokes === false) return ''; var pr = hazilStore(), t = todayStr(); if (pr.jx === t) return ''; var text;
    if (pr.last && pr.last.d === t) text = pr.last.text; else { if (masofaState === 1 || dbState === 1) return ''; var l = G.todayLine(jokeCtx(false)); if (!l) return ''; saveQuiet(); text = l.text; }
    var cls = text !== jShown ? ' jnew' : ''; jShown = text;
    return '<button type="button" class="sl-jline' + cls + '" id="jLine" data-act="jclose" title="' + esc(T('jClose')) + '">' + esc(text) + '</button>';
  }
  function waveD(amp, ph) { var d = 'M0 ' + (amp * Math.sin(ph)).toFixed(1); for (var x = 6; x <= 480; x += 6) d += ' L' + x + ' ' + (amp * Math.sin(2 * Math.PI * x / 120 + ph)).toFixed(1); return d + ' L480 270 L0 270 Z'; }
  function tyOf(L) { return L <= 0 ? 245 : (L >= 1 ? 8 : Math.round((221 - 208 * L) * 10) / 10); }
  function vesselSvg(o) {                            // kaloriya «idishi»: maketdan aynan (to'lqin yo'li mk(), ikki qatlamli matn, animatsiya vaqtlari)
    var ty = o.ty, ty2 = ty - 6, fy = o.fromTy, fy2 = fy - 6, d1 = o.upd ? '1.2s' : '.95s', d2 = o.upd ? '1.3s' : '1.05s', rd = reduce;
    var rise = function (a, b, d) { return '<animateTransform attributeName="transform" type="translate" from="0 ' + a + '" to="0 ' + b + '" dur="' + d + '"' + (o.begin ? ' begin="-' + o.begin.toFixed(2) + 's"' : '') + ' fill="freeze" calcMode="spline" keyTimes="0;1" keySplines=".22 1 .36 1"/>'; };
    var sway1 = '<animateTransform attributeName="transform" type="translate" from="0 0" to="-240 0" dur="3.2s" repeatCount="indefinite" additive="sum"/>', sway2 = '<animateTransform attributeName="transform" type="translate" from="-240 0" to="0 0" dur="4.6s" repeatCount="indefinite" additive="sum"/>';
    var capTxt = function (cls, a, c) {                 // yon yozuvlar («{n} kkal qoldi» kabi) — to'lqin ichida/ustida ikki rangli (mavjud naqsh)
      return (a ? '<text class="' + cls + '" x="120" y="82" text-anchor="middle" font-size="15" font-weight="500">' + esc(a) + '</text>' : '') + '<text class="' + cls + '" x="120" y="162" text-anchor="middle" font-size="15" font-weight="500">' + esc(c) + '</text>';
    };
    var numTxt = function (b, ids) {                     // markaziy raqam — BITTA qatlam, to'lqin GURUHIDAN KEYIN chiziladi (doim ustida, chiziq bilan kesilmaydi); halo CSS'da (.kv-sub.kv-n)
      return '<text class="kv-sub kv-n" x="120" y="132" text-anchor="middle" font-size="52" font-weight="800" letter-spacing="-1.5"' + ids + '>' + esc(b) + '</text>';
    };
    return '<svg class="sl-vsvg" width="240" height="240" viewBox="0 0 240 240" aria-hidden="true" focusable="false"><defs><linearGradient id="kfLiq" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" style="stop-color:var(--liq1)"/><stop offset="100%" style="stop-color:var(--liq2)"/></linearGradient><linearGradient id="kfRim" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" style="stop-color:var(--liq2)"/><stop offset="100%" style="stop-color:var(--liq1)"/></linearGradient><clipPath id="kfVessel"><circle cx="120" cy="120" r="104"/></clipPath>' +
      '<clipPath id="kfWave"><path d="' + waveD(7, 0) + '"' + (rd ? ' transform="translate(0 ' + ty + ')"' : '') + '>' + (rd ? '' : rise(fy, ty, d1) + sway1) + '</path></clipPath></defs>' +
      '<circle cx="120" cy="120" r="115" fill="none" stroke="url(#kfRim)" stroke-width="3" opacity=".55"/><circle class="kv-vessel" cx="120" cy="120" r="104"/>' +
      '<g clip-path="url(#kfVessel)"><path d="' + waveD(9, 1.6) + '" style="fill:var(--liq3)" opacity=".45"' + (rd ? ' transform="translate(0 ' + ty2 + ')"' : '') + '>' + (rd ? '' : rise(fy2, ty2, d2) + sway2) + '</path>' + capTxt('kv-sub', o.a, o.c) + '<g clip-path="url(#kfWave)"><rect x="0" y="0" width="240" height="240" fill="url(#kfLiq)"/>' + capTxt('kv-dk', o.a, o.c) + '</g>' + numTxt(o.b, ' id="kLeft" data-n="' + o.n + '"') + '</g></svg>';
  }
  var animRaf = 0, heroAnim = null;
  function animNum(from, to, dur) {
    var els = function () { return [$('#kLeft')]; }, set = function (n) { els().forEach(function (e) { if (e) e.textContent = fmt(n); }); };
    cancelAnimationFrame(animRaf); if (reduce || !(dur > 0) || from === to) { set(to); return; }
    var t0 = performance.now(); set(from); (function tick(t) { var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); set(Math.round(from + (to - from) * e)); if (k < 1) animRaf = requestAnimationFrame(tick); })(t0);
  }
  function routeShort(km) {
    if (!G || !masofa || !(km >= 1)) return ''; var rt = G.routeFor(masofa, prefs().city || 'toshkent', km), dest = lang === 'ru' ? 'до ' + (rt.to.ruGen || rt.to.ru) : rt.to.uz + 'gacha';
    return rt.type === 'full' ? dest : rt.pct + '% · ' + dest;
  }
  function renderToday() {
    var t = todayStr(), pr = st.profile, pl = planNow(), x = S.dayOf(st, t) || { food: [], water: 0, steps: 0 }, tot = S.sumEntries(x.food), h0 = num(pr.height), w0 = S.currentWeight(st);
    var bal = S.dayBalance(pl.target, tot.kcal, x.steps, h0, w0, pr.act), limit = pl.target + bal.credit, ratio = Math.min(1, tot.kcal / Math.max(1, limit)), over = bal.remaining < 0, info = S.dayStatus(st, t, t);
    var glasses = pl.water.glasses, wmax = glasses * S.GLASS_ML, note = info.complete ? T('stFull') + ' · ' + stLabel(info, t, t) : T('cNote');
    var prev = heroPrev, n = over ? -bal.remaining : bal.remaining, ty = tyOf(over ? 1 : ratio), now0 = performance.now(), cont = !!(heroAnim && !reduce && now0 - heroAnim.t0 < heroAnim.dur && heroAnim.to === n && heroAnim.ty === ty);
    var fromTy = cont ? heroAnim.fromTy : (prev ? prev.ty : 250), upd = cont ? heroAnim.upd : (!!prev && prev.ty !== ty), el0 = cont ? (now0 - heroAnim.t0) / 1000 : 0, startN = prev ? prev.n : 0, curN = startN, durN = prev ? (prev.n !== n ? 1200 : 0) : 900;
    if (cont) { var kk = Math.min(1, (now0 - heroAnim.t0) / heroAnim.dur); curN = Math.round(heroAnim.from + (heroAnim.to - heroAnim.from) * (1 - Math.pow(1 - kk, 3))); durN = heroAnim.dur - (now0 - heroAnim.t0); startN = heroAnim.from; }
    var pct = Math.round(ratio * 100), wd = (WDN[lang === 'ru' ? 'ru' : 'uz'] || WDN.uz)[S.weekdayIdx(t)], sk = S.streak(st, t);
    var h = (inst.isTop() ? inst.cardHtml() : '');
    h += '<div class="sl-hd2"><div class="t"><span class="d">' + esc(wd + ', ' + kit.dLabel(t)) + '</span><h2 class="sl-h1" id="todayHd">' + esc(T('navToday')) + '</h2>' + fishChipHtml(t) + '</div><div class="r">' + (sk >= 2 ? '<button type="button" class="sl-streak2" id="streakChip" data-act="streakinfo" aria-label="' + esc(T('hStreak', { n: sk }) + '. ' + T('stkQ')) + '">' + ico('flame') + esc(T('hStreak', { n: sk })) + '</button>' : '') + '<button type="button" class="sl-av" data-act="tab" data-v="profile" aria-label="' + esc(T('navProfile')) + '"><span data-cyr="skip">' + esc(T('avL')) + '</span></button></div></div>';
    h += weekStripHtml(t) + (Y && oneTimeOk() ? Y.yemayCard() : '');
    h += '<section class="sl-big' + (over ? ' ovr' : '') + '"><button type="button" class="sl-vessel" id="kcalBtn" data-act="xkcal" aria-label="' + esc(over ? T('vAriaO', { k: fmt(n) }) : T('vAria', { p: pct, k: fmt(n) })) + '">' + vesselSvg({ ty: ty, fromTy: fromTy, upd: upd, begin: el0, n: n, a: over ? T('vOver1') : '', b: fmt(curN), c: over ? T('vOver2') : T('vLeftK') }) + '</button>' + (over ? '<p class="sl-over rz-sr" id="kOver">' + esc(T('cOver', { x: fmt(n) })) + '</p>' : '') +
      '<div class="sl-rsub"><span><b id="kNum">' + fmt(tot.kcal) + '</b> ' + esc(T('cEaten2')) + '</span><i aria-hidden="true">·</i><span><b id="kGoal">' + fmt(pl.target) + '</b> ' + esc(T('cGoal2')) + '</span>' + (bal.credit > 0 ? '<i aria-hidden="true">·</i><span><b id="kBurn">+' + fmt(bal.credit) + '</b> ' + esc(T('cBurn2')) + '</span>' : '') + '<button type="button" class="sl-infob" data-act="xkcal" aria-label="ⓘ ' + esc(T('xKcalT')) + '">i</button></div>' + taxChipHtml() + '</section>';
    if (!tot.kcal && !x.food.length) h += '<p class="sl-first">' + esc(T('hEmpty')) + '</p>';
    h += '<button type="button" class="sl-main" id="mainAdd" data-act="add">' + ico('plus', '', 2.5) + '<span>' + esc(T('mainAdd')) + '</span></button>';
    h += '<div class="sl-doors">' + (R ? R.door() : '') + (Y ? Y.todayCard() : '') + '</div>';
    h += mealsHtml(t) + (x.food.length ? '<p class="sl-lphint">' + esc(T('mealRepH')) + '</p>' : '') + dayEndHtml(t, x);
    h += '<section class="sl-card sl-macs"><button type="button" class="sl-mac3" data-act="xmacro" aria-label="' + esc(T('macroRow')) + '">' + [['mP', 'p'], ['mF', 'f'], ['mC', 'c']].map(function (m) { var goal = pl.macros[m[1]], v = Math.round(tot[m[1]]); return '<span class="mc"><b><i class="dt" style="background:var(--' + m[1] + ')"></i>' + esc(T(m[0])) + '</b><span class="mv">' + v + ' <small>/ ' + goal + ' g</small></span><span class="tr"><i class="kf-bar2" style="width:' + Math.min(100, Math.round(v / Math.max(1, goal) * 100)) + '%;background:var(--' + m[1] + ')"></i></span></span>'; }).join('') + '</button></section>';
    var wsegs = ''; for (var wi2 = 0; wi2 < glasses; wi2++) wsegs += '<i' + (wi2 < Math.min(glasses, x.water) ? ' class="on"' : '') + '></i>';
    var stp = S.stepsStats(st, x.steps), rs = routeShort(stp.km), wiInfo = S.weightInfo(st, t);
    h += '<div class="sl-duo"><section class="sl-card sl-w" id="wCard"><button type="button" class="sl-wb" data-act="wopen" aria-label="' + esc(T('wT')) + '"><span class="l">' + ico('drop') + esc(T('wT')) + '</span><span class="v" id="wTxt"><b>' + fmt(x.water * S.GLASS_ML) + '</b><small> / ' + fmt(wmax) + ' ' + ML() + '</small></span></button><button type="button" class="sl-pill" data-act="wadd" aria-label="+250 ' + ML() + '">' + esc(T('wAdd2')) + '</button></section>' +
      '<section class="sl-card sl-s"><button type="button" class="sl-sb" data-act="addsteps" aria-label="' + esc(T('sEnter')) + '"><span class="l">' + ico('steps') + esc(T('sT')) + qaBadge() + '</span><span class="v"><b id="sNum">' + (x.steps ? fmt(x.steps) : '0') + '</b><small> / ' + fmt(st.stepGoal) + '</small></span></button><button type="button" class="sl-pill" data-act="addsteps">' + ico(qaOn() ? 'plus' : 'pen') + '<span>' + esc(T(qaOn() ? 'qaAdd' : 'stWrite')) + '</span></button></section></div>';
    if (st.weights.length) { var dl = wiInfo.delta; h += '<button type="button" class="sl-card sl-wrow" data-act="tab" data-v="history"><span class="ic">' + ico('trend') + '</span><span class="m"><b>' + esc(T('wRowT', { x: dec(S.currentWeight(st), 1) })) + '</b><span>' + esc(dl != null ? T('wRowW', { d: (dl > 0 ? '+' : '−') + dec(Math.abs(dl), 1) }) : weightLabel(wiInfo)) + '</span></span>' + ico('chev', 'r') + '</button>'; }
    nudges().forEach(function (n) { h += '<div class="rz-card nudge" data-nudge="' + n.k + '"><div class="t">' + esc(n.msg) + '</div>' + '<div class="b">' + (n.btn ? '<button type="button" class="rz-btn sm" data-act="' + n.act + '">' + esc(n.btn) + '</button>' : '') + '<button type="button" class="rz-btn sm ghost" data-act="hide" data-k="' + n.k + '">' + esc(T('later')) + '</button>' + (n.never ? '<button type="button" class="rz-btn sm ghost" data-act="' + n.never.act + '">' + esc(n.never.label) + '</button>' : '') + '</div></div>'; });
    if (!inst.isTop()) h += inst.cardHtml();
    h += jokeLineHtml();
    h += '<button type="button" class="rz-link sl-suplink" data-act="supp">' + esc(T('spCardT')) + '</button>';
    h += '<p class="rz-priv">' + esc(T('disc')) + '</p>';
    $('#rzMain').innerHTML = h; markSeen(); fishSwim(t);
    animNum(curN, n, durN); if (!cont) heroAnim = (!reduce && durN > 0) || (!reduce && fromTy !== ty) ? { t0: now0, dur: prev ? 1200 : 900, from: startN, to: n, fromTy: fromTy, ty: ty, upd: upd } : null; heroPrev = { n: n, ty: ty };
    if (G && !jokeBoot) { jokeBoot = true; loadHazil(); loadMasofa(); if (appDays() >= 3) loadPush(function () { pushSync(); if ((view === 'today' || view === 'profile') && !kit.sheetKind()) render(); }); loadDb(function () { if (view === 'today' && !kit.sheetKind()) render(); }); }
  }

  /* ---------- KUNDALIK ---------- */
  function diaryHtml() {
    var t = todayStr(), d = foodDay || t, x = S.dayOf(st, d), tot = S.sumEntries(x ? x.food : []), pl = planNow();
    var lab = d === t ? T('today') : (d === Dt.addDays(t, -1) ? T('yesterday') : kit.dLabel(d));
    var h = '<section class="rz-card"><div class="rz-monthnav"><button type="button" data-act="dprev" aria-label="‹">' + ico('back') + '</button><b>' + esc(lab) + '</b><button type="button" data-act="dnext" aria-label="›"' + (d >= t ? ' disabled' : '') + '>' + ico('chev') + '</button></div><div class="sl-daysum"><b>' + fmt(tot.kcal) + '</b><small> / ' + fmt(pl.target) + ' ' + T('kcal') + '</small></div>' + dayChip(d) + '</section>';
    return h + mealsHtml(d) + calHtml();
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
  function rowBtn(act, ic, t1, t2) { return '<button type="button" class="rz-row" data-act="' + act + '">' + catIcon(ic) + '<span class="m"><b>' + esc(t1) + '</b>' + (t2 ? '<span>' + esc(t2) + '</span>' : '') + '</span>' + ico('chev', 'r') + '</button>'; }
  function histResultsHtml() {
    var pr = st.profile, cur = S.currentWeight(st), wi = S.weightInfo(st, todayStr()), gp = S.goalProgress(st), first = st.weights.length ? st.weights[0].kg : cur; loadMasofa();
    var h = '';
    var wjoke = G && prefs().jokes !== false ? G.weightLine(jokeCtx(false)) : null; if (wjoke) saveQuiet();
    h += '<section class="rz-card sl-weight"><div class="sl-wh"><b>' + ico('scale') + esc(T('meW')) + '</b><button type="button" class="sl-wv" data-act="xweight">?</button></div>' + (st.weights.length ? '<div class="sl-wbig"><b>' + dec(cur, 1) + '</b><small> ' + KG() + '</small></div><div class="rz-mut" id="wLbl">' + esc(weightLabel(wi)) + '</div>' + (wjoke ? '<p class="rz-p sl-fact">' + esc(wjoke.text) + '</p>' : '') : '<div class="rz-mut">' + esc(T('meNoW')) + '</div>') + weightChart() +
      (gp ? '<div class="sl-gp"><div class="rz-bar thin" aria-hidden="true"><i style="transform:scaleX(' + gp.share + ')"></i></div><span>' + esc(gp.left > 0 ? T('meProg', { x: dec(gp.left, 1) }) : '✓') + '</span></div>' : '') +
      (st.weights.length > 1 ? '<div class="rz-mut sm">' + esc(T('meDelta', { x: (cur - first > 0 ? '+' : '') + dec(cur - first, 1) })) + '</div>' : '') + '<button type="button" class="rz-btn primary full" data-act="addweight">' + esc(T('meAddW')) + '</button></section>';
    h += orbHtml() + stepsHtml() + '<section class="rz-card"><button type="button" class="rz-row" data-act="share"><span class="sl-ci">' + ico('share') + '</span><span class="m"><b>' + esc(T('meShare')) + '</b><span>' + esc(T('shH')) + '</span></span>' + ico('chev', 'r') + '</button></section>';
    return h;
  }
  function resultsAfter() {
    stepsAnim();
    var p = $('.sl-wchart .avg'); if (p && !reduce) { p.style.strokeDashoffset = '1'; requestAnimationFrame(function () { requestAnimationFrame(function () { p.style.strokeDashoffset = '0'; }); }); }
  }
  /* ---------- TARIX (Kundalik + Natijalar birlashgan) ---------- */
  function secHead(k) { return '<div class="sl-sec2"><h3>' + esc(T(k)) + '</h3></div>'; }
  function renderHistory() {
    var h = '<h2 class="rz-h">' + esc(T('histT')) + '</h2>' + '<section class="rz-card">' + rowBtn('supp', 'pill', T('spCardT'), T('spH')) + '</section>' + weekStatsHtml() + secHead('histDays') + diaryHtml() + secHead('histRes') + histResultsHtml();
    $('#rzMain').innerHTML = h; markSeen(); resultsAfter();
  }
  function stepsHtml() {
    var t = todayStr(), x = S.dayOf(st, t) || { steps: 0 }, stp = S.stepsStats(st, x.steps), ser = S.stepsSeries(st, t, 7), tot = S.stepsTotal(st, ser), mx = Math.max(st.stepGoal, Math.max.apply(null, ser.map(function (s) { return s.steps; })), 1), mon = S.monthSteps(st, Dt.monthOf(t));
    loadMasofa(); var dl = G && prefs().jokes !== false && masofa ? G.distLines(jokeCtx(false)) : null; if (dl && (dl.week || dl.month)) saveQuiet(); var jbox = function (l) { return '<p class="rz-p sl-fact">' + ico('flame', 'sl-inl') + esc(l.text) + '</p>'; }; var weekJoke = dl && dl.week ? jbox(dl.week) : routeFact(tot.km), monJoke = dl && dl.month ? jbox(dl.month) : routeFact(mon.km);
    var h = '<section class="rz-card sl-stepbig"><button type="button" class="sl-sn" data-act="xsteps"><span class="l">' + ico('steps') + esc(T('stepsT')) + qaBadge() + '</span><b id="sNum">' + fmt(x.steps) + '</b><span class="u">' + (x.steps ? esc(stp.km.toString().replace('.', ',') + ' ' + T('km') + ' · ' + fmt(stp.kcal) + ' ' + T('kcal')) : esc(T('sNone'))) + '</span></button><div class="rz-bar thin" aria-hidden="true"><i style="transform:scaleX(' + Math.min(1, x.steps / st.stepGoal) + ')"></i></div><div class="rz-mut sm">' + esc(T('stGoal', { x: fmt(st.stepGoal) })) + '</div><button type="button" class="rz-btn full" data-act="addsteps">' + esc(T('sAdd')) + '</button><button type="button" class="rz-link" data-act="stephelp">' + esc(T('stWhere')) + '</button></section>';
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
    if (PS.state === 0) loadPush(function () { if (view === 'profile' && !kit.sheetKind()) render(); });          // yangi foydalanuvchida kalit so'rovi faqat Profil ochilganda (boshqa joyda tarmoq so'rovi yo'q)
    var pr = st.profile, pl = planNow(), big = document.documentElement.classList.contains('fs-big'), curL = isCyr() ? 'cyr' : lang, th = themeNow();
    var row = function (act, ic, t1, t2) { return '<button type="button" class="rz-row" data-act="' + act + '">' + catIcon(ic) + '<span class="m"><b>' + esc(t1) + '</b>' + (t2 ? '<span>' + esc(t2) + '</span>' : '') + '</span>' + ico('chev', 'r') + '</button>'; };
    var seg = function (act, key, opts, cur, label) { return segHtml(label || '', opts.map(function (o) { return { attrs: 'data-act="' + act + '" data-' + key + '="' + o[0] + '"', on: cur === o[0], text: o[1] }; })); };
    var h = '<h2 class="rz-h">' + esc(T('profT')) + '</h2>' + taxRowHtml();
    h += '<section class="rz-card sl-prof"><div class="rz-st">' + esc(T('sMine')) + '</div><div class="sl-pg"><div><small>' + esc(T('pfSex')) + '</small><b>' + esc(T(pr.sex === 'f' ? 'female' : 'male')) + '</b></div><div><small>' + esc(T('pfAge')) + '</small><b>' + pr.age + '</b></div><div><small>' + esc(T('pfH')) + '</small><b>' + pr.height + '</b></div><div><small>' + esc(T('pfW')) + '</small><b>' + dec(num(pr.weight), 1) + '</b></div></div>' +
      '<div class="sl-pt"><span>' + esc(T('rT')) + '</span><b>' + fmt(pl.target) + ' ' + T('kcal') + '</b></div><button type="button" class="rz-btn ghost full" data-act="editprof">' + ico('pen') + ' ' + esc(T('meEdit')) + '</button>' + qaRowHtml() + '</section>';
    h += '<section class="rz-card" id="remCard" aria-label="' + esc(T('sRem')) + '">' + pushRowHtml(true) + '</section>';
    if (Y) h += Y.profileCard();
    h += '<section class="rz-card"><div class="rz-st">' + esc(T('sLangT')) + '</div>' + segHtml(T('sLang'), [{ attrs: 'data-act="lang" data-l="uz"', on: curL === 'uz', text: 'UZ' }, { attrs: 'data-act="lang" data-l="cyr"', on: curL === 'cyr', text: 'ЎЗ' }, { attrs: 'data-act="lang" data-l="ru"', on: curL === 'ru', text: 'RU' }], ' data-cyr="skip"') +
      '<div class="rz-st" style="margin-top:14px">' + esc(T('themeT')) + '</div>' + seg('theme', 't', [['auto', T('thAuto')], ['light', T('thLight')], ['dark', T('thDark')]], th, T('themeT')) +
      '<div class="rz-st" style="margin-top:14px">' + esc(T('sFont')) + '</div>' + segHtml(T('sFont'), [{ attrs: 'data-act="font" data-f="n"', on: !big, text: T('fN') }, { attrs: 'data-act="font" data-f="b"', on: big, text: T('fB') }]) + '</section>';
    h += jokesCardHtml();
    h += '<section class="rz-card"><div class="rz-st">' + esc(T('profBackup')) + '</div>' + (inst.row() ? inst.row().html : '') + (akk.enabled() ? akk.rowHtml() + akk.more(bk.tgRow() + bk.cloudHtml() + akk.strictRow() + row('export', 'text', T('sExp'), '') + row('import', 'boshqa', T('sImp'), '') + bk.lastHtml()) + row('wipe', 'x', T('sDel'), '') : bk.tgRow() + bk.cloudHtml() + akk.rowHtml() + row('export', 'text', T('sExp'), '') + row('import', 'boshqa', T('sImp'), '') + row('wipe', 'x', T('sDel'), '') + bk.lastHtml()) + '</section>';
    h += '<section class="rz-card">' + (window.KalkiNative && KalkiNative.isAndroidBrowser() ? row('apk', 'boshqa', T('apkT'), T('apkH')) : '') + row('intro', 'help', T('sHow'), '') + news.row() + '<span class="rz-aboutrow">' + row('about', 'info', T('sAbout'), '') + '</span></section><p class="rz-priv">' + esc(T('pFoot')) + '</p>';
    $('#rzMain').innerHTML = h;
  }

  function render() {
    lang = langNow();
    $$('[data-k]').forEach(function (e) { e.textContent = T(e.getAttribute('data-k')); });
    var lt0 = isCyr() ? 'ЎЗ' : lang.toUpperCase(), lb0 = $('#rzLang'); if (lb0) lb0.setAttribute('aria-label', lt0 + ' · Til / Язык');
    var ab = document.getElementById('rzAboutBack'); if (ab) ab.textContent = T('aboutBack');
    var lockUi = function (on) { ['#rzMain', '.rz-nav'].forEach(function (q) { var e = $(q); if (e) { e.inert = on; if (on) e.setAttribute('aria-hidden', 'true'); else e.removeAttribute('aria-hidden'); } }); };
    if (!st.setup) { lockUi(true); if (needLangPick()) showLangPick(); else showOnb(); return; }
    lockUi(false); akk.check();
    var onb = $('#rzOnb'); if (onb && !onb.classList.contains('out')) onb.hidden = true;
    $$('.rz-tab').forEach(function (b) { var on = b.getAttribute('data-v') === view; b.classList.toggle('on', on); b.setAttribute('aria-current', on ? 'page' : 'false'); });
    var title = { today: T('appName'), history: T('histT'), profile: T('profT') }[view]; $('#rzTitle').textContent = title; root.setAttribute('data-view', view);
    KD.mark(lang);
    var lt = $('#rzLangTxt'); if (lt) lt.textContent = isCyr() ? 'ЎЗ' : lang.toUpperCase();
    $('#rzFab').setAttribute('aria-label', T('navAdd'));
    var main = $('#rzMain'), sc = main.scrollTop;
    ({ today: renderToday, history: renderHistory, profile: renderProfile })[view]();
    main.classList.toggle('enter', enterNext); enterNext = false; main.scrollTop = sc;
    if (view === 'today') { if (!todayIn) { todayIn = true; staggerToday(); } else upIdx(); }
    if (view === 'today' && !prefs().tipsDone && !kit.tipsOn() && !kit.sheetKind() && !introPending && !(IN && IN.isOpen())) setTimeout(function () { if (!kit.tipsOn() && st.setup && view === 'today' && !prefs().tipsDone && !kit.sheetKind() && !introPending && !(IN && IN.isOpen()) && !$('#rzOnb').classList.contains('out')) tipsStart(); }, 1700);
  }


  /* ================= 2-bosqich: hazillar, "Buni yesam-chi?", retsept, taqvim, rasm, taklif, qo'shimchalar ================= */
  kit.addIcons({
    bowl: 'M3 11h18a8 8 0 0 1-8 8h-2a8 8 0 0 1-8-8z M8 7c0-1 1-1 1-2 M12 7c0-1 1-1 1-2 M16 7c0-1 1-1 1-2',
    star: 'M12 3.500l2.700 5.500 6 .900-4.400 4.200 1 6-5.300-2.800-5.300 2.800 1-6L3.300 9.900l6-.900z',
    dots: 'M5.500 12h.010 M12 12h.010 M18.500 12h.010', undo: 'M4 12a8 8 0 1 0 2.500-5.800 M4 4v5h5', bm: 'M6 4h12v17l-6-4-6 4z',
    chat: 'M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-5 4v-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z', cam: 'M4 8h3l2-3h6l2 3h3v11H4z M12 16.500a3.500 3.500 0 1 0 0-7 3.500 3.500 0 0 0 0 7z', pill: 'M10.500 3.500l10 10a4.200 4.200 0 0 1-6 6l-10-10a4.200 4.200 0 0 1 6-6z M8 9l6 6',
    sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z M12 2v2 M12 20v2 M2 12h2 M20 12h2 M4.900 4.900l1.400 1.400 M17.700 17.700l1.400 1.400 M4.900 19.100l1.400-1.400 M17.700 6.300l1.400-1.400', leaf: 'M5 19c0-8 5-13 14-14 0 9-5 14-13 14 M5 19c2-4 5-7 9-9', bolt: 'M13 3L5 13h6l-1 8 8-10h-6z',
    bone: 'M7 8.500a2.500 2.500 0 1 1 3.500-3L16 11l.5.500a2.500 2.500 0 1 1 3 3.500L13 20a2.500 2.500 0 1 1-3-3.500z', muscle: 'M5 15c0-4 3-7 7-7 2 0 3 1 3 3 0 1.500-1 2-2 2.500 3 0 5 1.500 5 4v1H8c-2 0-3-1.500-3-3.500z', book: 'M4 5h7a3 3 0 0 1 3 3v11a3 3 0 0 0-3-3H4z M20 5h-3a3 3 0 0 0-3 3v11a3 3 0 0 1 3-3h3z',
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
  function yzRemaining() { if (!st || !st.setup) return null; var t = todayStr(), pl = planNow(), x = S.dayOf(st, t) || { food: [], steps: 0 }, tot = S.sumEntries(x.food); return S.dayBalance(pl.target, tot.kcal, x.steps, num(st.profile.height), S.currentWeight(st), st.profile.act).remaining; }
  function yzFd(key, por) {                           // taom oynasi: ko'rsatilgan porsiya (birlik + miqdor yoki gramm) oldindan tanlangan
    var s = OR.split(key), f = foodById(s.id); if (!f) return false; var b = f.al ? foodById(f.al.f) : f; pickFood(s.id, s.v && b && b.fam ? S.famSelOf(b, s.v) : null);
    if (por) { if (por.u && fd.food.u.some(function (u) { return u[0] === por.u; })) { fd.unit = por.u; fd.qty = por.n || 1; } else if (por.g > 0) { fd.unit = 'g100'; fd.qty = Math.max(10, Math.round(por.g / 10) * 10); } }
    return true;
  }
  function yzPick(key, back, por) { openAdd({}); fd.yBack = back; if (yzFd(key, por)) setSheet(portionHtml()); }                       // porsiya oynasi: Orqaga — chaqirgan oynaga (Bugun nima yeymiz? / Baliq kuni)
  function yzLog(key, por) { var ml = S.mealByHour(new Date().getHours()); fd = { saveMsg: T('yzMeal_' + ml), date: todayStr(), meal: ml, mode: 'search', q: '', cat: '', food: null, unit: null, qty: 1, editId: null, items: [], busy: false }; if (yzFd(key, por)) fSave(); }   // bir bosishda: ko'rsatilgan porsiya bilan yoziladi (Bekor qilish tugmasi bilan)
  function nativeBack() {                            // Android «Orqaga» (KalkiNative.back): oyna → ichki qadam orqaga / yopish; slayd, yo'l-yo'riq — yopiladi; boshqa bo'lim → Bugun; Bugun → 'home' (ilova ikki bosishda chiqadi)
    if (IN && IN.isOpen && IN.isOpen()) { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); return 'overlay'; }
    if (kit.tipsOn()) { kit.tipsEnd(); return 'overlay'; }
    var yg = $('#ygOk'); if (yg) { yg.click(); return 'overlay'; }
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
  function inCat(f, c) { if (c === 'baliq') return orState === 2 && OR.tegOf(orTags, f.id) === 'baliq' && !f.custom; return f.t === c; }       // «Baliq» — oqsil manbasi tegi bo'yicha virtual guruh (bazadagi tur o'zgarmaydi)
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
  function pushPost(sub) { return fetch('/api/push/obuna', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ obuna: sub.toJSON(), til: isCyr() ? 'cyr' : lang, baliqsiz: !!(Y && Y.avoids('baliq')), kun: Y ? Y.kunBugun() : 3 }) }).then(function (r) { if (!r.ok) throw new Error('push ' + r.status); return r; }); }
  function pushEnable() {                              // FAQAT foydalanuvchi bosganda (ruxsat so'rash bosishga bog'langan)
    var fail = function () { toast(T('bkErr')); };
    if (NAT) { NAT.notif.enable(natOpts()).then(function (r) { if (r === 'on') { NS.perm = 'granted'; prefs().push = { on: true, local: true, t: Date.now() }; delete prefs().pushNo; commit(); toast(T('bkDone')); } else { if (r === 'denied') NS.perm = 'denied'; prefs().pushNo = Date.now(); commit(); } }).catch(fail); return; }
    Notification.requestPermission().then(function (perm) {
      if (perm !== 'granted') { prefs().pushNo = Date.now(); commit(); return; }
      return navigator.serviceWorker.ready.then(function (reg) { return reg.pushManager.getSubscription().then(function (s) { return s || reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64(PS.key) }); }); })
        .then(function (sub) { return pushPost(sub).then(function () { prefs().push = { on: true, ep: sub.endpoint, t: Date.now() }; delete prefs().pushNo; commit(); toast(T('bkDone')); }); });
    }).catch(fail);
  }
  function pushDisable() {
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
  function pushRowHtml(card) {                             // Profil «🐟 Baliq kuni» kartasi: sozlama — DOIM ko'rinadi; sarlavha + bitta qator + kun chiplari + tugma (3-kun sharti bu yerda YO'Q)
    var s0 = NAT || PS.state === 2 ? pushStatus() : 'load';
    var btn = s0 === 'on' ? '<button type="button" class="rz-btn ghost full" data-act="pushoff">' + esc(T('bkOff')) + '</button>' : s0 === 'off' ? '<button type="button" class="rz-btn ghost full" data-act="pushon">' + esc(T('bkOn')) + '</button>' : '';
    var line = { ios: 'bkIos2', denied: NAT ? 'bkDen3' : 'bkDen2', na: 'bkNA2' }[s0] || 'bkLine';        // bitta qisqa qator (holatga qarab); vaqt (11:00) yoqilganda toast'da aytiladi
    return '<div id="pushRow"><h3 class="sl-bkT"><span aria-hidden="true">🐟</span>' + esc(T('bkT2')) + '</h3><p class="sl-bkL">' + esc(T(line)) + '</p>' + (Y ? Y.profileDays() : '') + btn + '</div>';
  }
  function pushOfferHtml() {                           // Kun yakuni: BITTA taklif; «Hozir emas» — 30 kun so'ramaydi
    if (appDays() < 3 || !pushAskDue()) return ''; var s0 = pushStatus(); if (s0 !== 'off' && s0 !== 'ios') return '';
    return '<section class="rz-card sl-poff" id="pushOffer"><b>' + esc(T('bkAsk')) + '</b><p class="rz-p sm">' + esc(T(s0 === 'ios' ? 'bkIos' : 'bkAskH')) + '</p><div class="rz-actions">' + (s0 === 'ios' ? '' : '<button type="button" class="rz-btn ghost sm" data-act="pushno">' + esc(T('bkNo')) + '</button><button type="button" class="rz-btn primary sm" data-act="pushon">' + esc(T('bkOn')) + '</button>') + (s0 === 'ios' ? '<button type="button" class="rz-btn primary sm" data-act="pushno">' + esc(T('bkOk')) + '</button>' : '') + '</div></section>';
  }
  function fishDay(t) { return !!(Y && st.setup && S.weekdayIdx(t) === Y.kunBugun() && !prefs().baliqOff && !Y.avoids('baliq')); }     // tanlangan kun (tanlanmagan bo'lsa payshanba); «Baliq yoqtirmayman» / Yemaydiganlarim → yo'q
  var FISH_SVG = '<svg viewBox="0 0 48 28" aria-hidden="true"><path d="M3 14c5-8 13-11 21-11 8 0 13 5 16 11-3 6-8 11-16 11C16 25 8 22 3 14z" fill="currentColor"/><path d="M38 14l9-8v16z" fill="currentColor" opacity=".8"/><circle cx="12" cy="12" r="2" fill="var(--bg,#fff)"/><path d="M20 8c2 3 2 9 0 12" stroke="var(--bg,#fff)" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".55"/></svg>';
  function fishChipHtml(t) { return fishDay(t) ? '<button type="button" class="sl-fishchip' + (fishSwimOn ? ' sw' : '') + '" id="fishChip" data-act="baliqgo"><span aria-hidden="true">🐟</span>' + esc(T('fcT')) + '<i aria-hidden="true">›</i></button>' : ''; }
  var fishSwimOn = false;
  function infoTitle(title, text, attrs) { return '<div class="rz-st sl-sti"' + (attrs || '') + '><span>' + esc(title) + '</span><button type="button" class="sl-infob" data-act="ibtog" aria-expanded="false" aria-label="ⓘ ' + esc(title) + '">i</button></div><p class="sl-ibx" hidden>' + esc(text) + '</p>'; }      // Profil: bo'lim sarlavhasi + «ⓘ» (izoh bosilganda ochiladi)
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
  }
  function openFish() { if (Y) { if (kit.sheetKind() !== 'fish') Y.openFish(); return; } if (kit.sheetKind() === 'add' && fd && fd.cat === 'baliq') return; openAdd(); fd.cat = 'baliq'; loadOr(function () { if (fd && fd.mode === 'search') refreshRes(); }); setSheet(searchHtml()); catsInit(); catView(); }
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
  function loadHazil() { if (!G || !G.setTexts || hazilState) return; hazilState = 1; loadJson('/data/hazillar-kalkifit.json', function (j) { G.setTexts(j); hazilState = 2; if ((view === 'today' || view === 'history') && !kit.sheetKind()) render(); }, function () { hazilState = 0; }); }
  function loadMasofa() { if (masofaState) return; masofaState = 1; loadJson('/data/masofalar.json', function (j) { masofa = j; masofaState = 2; if ((view === 'today' || view === 'history') && !kit.sheetKind()) render(); }, function () { masofaState = 0; }); }
  function loadSupp(cb) { if (suppState === 2) { cb(); return; } if (suppState === 1) return; suppState = 1; loadJson('/data/qoshimchalar.json', function (j) { j.items.forEach(function (it) { if (it.ev && it.ev.length) it.level = topLevel(it.ev); }); supp = j; suppState = 2; cb(); }, function () { suppState = 0; cb(true); }); }
  function jokeCtx(fresh) { return { fresh: !!fresh, store: hazilStore(), S: S, st: st, today: todayStr(), lang: lang, hour: new Date().getHours(), masofa: masofa, city: prefs().city || 'toshkent', foods: db, jokesOn: prefs().jokes !== false }; }
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
    var h = shBack(rc.id ? T('rcEdit') : T('rcT'), 'data-act="atab" data-t="m"') + '<p class="rz-p sm">' + esc(T('rcMineH')) + '</p><label class="rz-f" for="rcName"><span>' + esc(T('rcName')) + '</span><input id="rcName" type="text" maxlength="60" placeholder="' + esc(T('rcNamePh')) + '" value="' + esc(rc.name) + '"></label>' +
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
    return '<section class="rz-card">' + infoTitle(T('jkT'), T('jkNote')) + segHtml(T('jkT'), [{ attrs: 'data-act="jktog" data-v="1"', on: on, text: T('jkOn') }, { attrs: 'data-act="jktog" data-v="0"', on: !on, text: T('jkOff') }]) + '' +
      '<button type="button" class="rz-row" data-act="city"><span class="m"><b>' + esc(T('jkCity')) + '</b></span><span class="v">' + esc(cn ? (lang === 'ru' ? cn.ru : cn.uz) : cityId) + '</span></button>' +
      '<label class="rz-chk"><input type="checkbox" id="jkParty"' + (x && x.party ? ' checked' : '') + '><span>' + esc(T('jkParty')) + '</span></label>' + (OR ? infoTitle(T('orSet'), T('orSetH'), ' style="margin-top:14px"') + segHtml(T('orSet'), [{ attrs: 'data-act="ortog" data-v="1"', on: prefs().orin !== false, text: T('orOn') }, { attrs: 'data-act="ortog" data-v="0"', on: prefs().orin === false, text: T('orOff') }]) : '') + '</section>';
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
        else fd.items = res.j.ovqatlar.map(function (o) { return { name: o.nom, fid: null, food: null, rHit: rGuess(o.nom), ptxt: o.porsiya || '', est: true, ai: true, photo: true, unit: 'pc', qty: 1, g: o.g || 0, kcal: Math.round(o.kcal), p: o.o || 0, f: o.y || 0, c: o.u || 0, base: { g: o.g || 0, kcal: Math.round(o.kcal), p: o.o || 0, f: o.y || 0, c: o.u || 0 } }; }); phRefresh();
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
    return '<div class="rz-sh-h sl-ph"><button type="button" class="rz-x" data-act="spback" aria-label="' + esc(T('spBack')) + '">' + ico('back') + '</button><b>' + esc(L.name) + '</b><button type="button" class="rz-x" data-act="sheetclose" aria-label="' + esc(T('close')) + '">' + ico('x') + '</button></div><div class="sl-lvrow"><span class="rz-mut sm">' + esc(T('spLvl')) + '</span></div>' + spEvHtml(it) + (it.warn ? '<p class="sl-warn big">' + ico('warn', 'sl-inl') + esc(it.warn[lang]) + '</p>' : '') + part('spWhat', 'what') + part('spFood', 'food') + part('spWho', 'who') + part('spNot', 'not') + part('spCare', 'care') +
      (it.ul && it.ul[lang] ? '<div class="sl-ul"><b>' + ico('warn', 'sl-inl') + esc(T('spUl')) + '</b><p>' + esc(it.ul[lang]) + '</p></div>' : '') + prot +
      '<p class="rz-p sm">' + (it.src ? '<a class="rz-link" href="' + esc(it.src) + '" target="_blank" rel="noopener noreferrer">' + esc(T('spSrc', { s: srcLabel(it) })) + '</a>' : esc(T('spSrc', { s: '—' }))) + (it.src2 ? ' · <a class="rz-link" href="' + esc(it.src2) + '" target="_blank" rel="noopener noreferrer">2</a>' : '') + (it.srcs ? it.srcs.map(function (x) { return ' · <a class="rz-link" href="' + esc(x.u) + '" target="_blank" rel="noopener noreferrer">' + esc(x.l) + '</a>'; }).join('') : '') + ' · ' + esc(T('spChecked', { d: it.checked || supp.checked })) + '</p>' + spDisc();
  }

  /* ---------- tushuntirish panellari ---------- */
  function xr(sg, label, val, cls, unit) { return '<div class="rz-xr ' + (cls || '') + '"><span class="sg" aria-hidden="true">' + sg + '</span><span class="lb">' + esc(label) + '</span>' + (val == null ? '' : '<b>' + val + (unit === false ? '' : '<small> ' + T('kcal') + '</small>') + '</b>') + '</div>'; }
  function okBtn() { return '<div class="rz-actions"><button type="button" class="rz-btn primary" data-act="sheetclose">' + esc(T('close')) + '</button></div>'; }
  function openExplainKcal() {
    var t = todayStr(), pl = planNow(), x = S.dayOf(st, t) || { food: [], steps: 0 }, tot = S.sumEntries(x.food), b = S.dayBalance(pl.target, tot.kcal, x.steps, num(st.profile.height), S.currentWeight(st), st.profile.act);
    var di = S.dayStatus(st, t, t), dnote = di.complete ? T('stFull') + ' · ' + stLabel(di, t, t) : T('cNote');
    var h = shHead(T('xKcalT')) + '<p class="rz-p sm" id="dayChip" data-state="' + di.state + '">' + esc(dnote) + '</p><div class="rz-xrows">' + xr('', T('xTarget'), fmt(pl.target)) + xr('+', T('xSteps') + (b.extraSteps ? ' (' + fmt(b.extraSteps) + ')' : ''), fmt(b.credit)) + xr('=', T('xLimit'), fmt(pl.target + b.credit), 'sum') + xr('−', T('xEaten'), fmt(tot.kcal)) + xr('=', T('xRem'), fmt(b.remaining), 'sum big') + '</div><p class="rz-p sm">' + esc(T('xWhyStep', { base: fmt(b.base) })) + '</p>';
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
  var fd = null, CATS = ['o', 'n', 's', 'm', 'baliq', 'g', 'v', 'f', 'd', 'i', 'q', 'h', 'x'];
  function openAdd(o) {
    o = o || {}; fd = { date: o.date || todayStr(), meal: o.meal || S.mealByHour(new Date().getHours()), mode: 'search', q: '', cat: '', food: null, unit: null, qty: 1, editId: null, items: [], busy: false };
    openSheet('add', searchHtml()); catsInit(); if (Y) Y.loadCh(function () { if (fd && kit.sheetKind() === 'add' && fd.mode === 'search') refreshRes(); }); loadDb(function (err) { if (fd && fd.mode === 'search') refreshRes(err); });
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
  function defPortionTxt(f, sel) {
    var v = f.fam ? S.famVariant(f, sel || S.famDefault(f), null) : f; if (!v || !v.u || !v.u.length) return ''; var u = defUnit(v), g = u === 'g100' ? 100 : (S.unitGrams(v, u) || 0); if (!(g > 0)) return '';
    return T('aDefOne', { x: u === 'g100' ? '100 ' + T('gram') : '1 ' + unitName(u), k: fmt(S.portion(v, g).kcal) });
  }
  function isSentence(q) { q = String(q || '').trim(); if (q.length < 6) return false; return /\d/.test(q) || /[,;+]/.test(q) || /(^|\s)(va|bilan|и|ва|ta|та)(\s|$)/i.test(q) || q.split(/\s+/).length >= 2; }
  function aiLineHtml() {
    var q = (fd && fd.q || '').trim();
    return isSentence(q) ? '<button type="button" class="sl-ai" id="fdAi" data-act="fqai">' + ico('spark') + '<span>' + esc(T('aAiLine', { q: '\u0001' })).replace('\u0001', '<span data-cyr="skip">' + esc(q) + '</span>') + '</span></button>' : '<p class="sl-hint">' + ico('spark') + '<span>' + esc(T('aHint')) + '</span></p>';
  }
  function mealSeg() { return segHtml(T('pMeal'), S.MEALS.map(function (m) { return { attrs: 'data-act="fmeals" data-m="' + m + '"', on: fd.meal === m, text: T('mealS_' + m) }; })); }
  function recRow(r, dim) {
    var e = r.e, f = e.fid ? foodById(e.fid) : null, base = f && f.al ? (foodById(f.al.f) || f) : f, nm = e.name || (base ? nameOf(base) : '?'), tx = entUnitTxt(e) + ' · ' + fmt(e.kcal) + ' ' + T('kcal'), done = !!(fd.added && fd.added[r.k]);
    return '<div class="sl-rw' + (dim ? ' dim' : '') + '"><button type="button" class="sl-rr" data-act="pickfood" data-id="' + esc(e.fid || '') + '"' + (e.fid ? '' : ' disabled') + '>' + tileHtml(e.fid, e.vr, nm, 50) + '<span class="m"><span class="nm">' + esc(nm) + '</span><span class="tm">' + esc(tx) + '</span></span></button><button type="button" class="sl-pl' + (done ? ' done' : '') + '" data-act="fquick" data-d="' + r.d + '" data-i="' + e.id + '" data-fk="' + esc(r.k) + '" aria-label="' + esc((done ? T('aDone') : T('aQuickAdd')) + ': ' + nm) + '">' + (done ? ico('check', '', 2.6) : ico('plus', '', 2.4)) + '</button></div>';
  }
  function moreHtml() {
    var row = function (act, ic, k) { return '<button type="button" class="sl-row" data-act="' + act + '">' + ico(ic) + '<span class="m"><span class="nm">' + esc(T(k)) + '</span></span>' + ico('chev', 'r') + '</button>'; };
    return '<div class="sl-more"><button type="button" class="sl-morebig" data-act="fmore" aria-expanded="' + !!fd.more + '">' + ico('grid') + '<span class="m"><b>' + esc(T('aMoreT')) + '</b><small>' + esc(T('aMoreSub')) + '</small></span>' + ico('chev', 'r' + (fd.more ? ' open' : '')) + '</button>' + (fd.more ? '<div class="sl-morep">' + row('fcustom', 'plus', 'aCustom') + row('frecipe', 'book', 'aRecipe') + row('fbrowse', 'search', 'aCatsBtn') + row('yesam', 'help', 'yBtn') + row('fqsug', 'chat', 'aSugBtn') + '</div>' : '') + '</div>';
  }
  function catChip(c, label) { var on = (fd.cat || '') === c; return '<button type="button" class="rz-chip' + (on ? ' on' : '') + '" data-act="fcat" data-c="' + c + '" aria-pressed="' + on + '">' + esc(label) + '</button>'; }
  function catsHtml() {                              // qidiruv ostidagi gorizontal kategoriya chiplari — TAB kabi: «Mashhur» (odatiy) + bazadagi guruhlar; tanlangani accent; qator kategoriya ochilganda ham joyida qoladi. «Boshqa usullar → Kategoriyalar» ham shu komponent
    return '<div class="sl-catsw" id="catsW"><div class="sl-cats" id="catsRow" role="group" aria-label="' + esc(T('aCats')) + '">' + catChip('', T('aPop')) + CATS.filter(catVisible).map(function (c) { return catChip(c, T('cat_' + c)); }).join('') + '</div></div>';
  }
  function chipsHtml() { return fd.q.trim() ? '' : catsHtml(); }
  function catSelect(c) {                            // chip bosildi: shu chip tanlanadi (qayta bosilsa — «Mashhur»ga qaytadi), ro'yxat darhol almashadi, yengil fade (150 ms), tepaga qaytadi
    fd.cat = (c && c !== fd.cat) ? c : ''; var hadQ = !!fd.q.trim(); fd.q = ''; var qi = $('#fdQ'); if (qi) qi.value = '';
    var r = $('#catsRow');
    if (!r || hadQ) refreshRes(); else { [].forEach.call(r.querySelectorAll('.rz-chip'), function (b) { var on = (b.getAttribute('data-c') || '') === (fd.cat || ''); b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); }); var cw = $('#fdCat'); if (cw) cw._k = chipsHtml(); var res = $('#fdRes'); if (res) { res.innerHTML = resultsHtml(); res.classList.remove('fi'); void res.offsetWidth; res.classList.add('fi'); } var w = $('#fdAiW'); if (w) w.innerHTML = aiLineHtml(); }
    var sh = $('#rzSheet'); if (sh) sh.scrollTop = 0; catView();
  }
  function catView() { var on = document.querySelector('#catsRow .rz-chip.on'); if (on && on.scrollIntoView) { try { on.scrollIntoView({ inline: 'center', block: 'nearest', behavior: kit.reduce ? 'auto' : 'smooth' }); } catch (e) { on.scrollIntoView(); } } }
  function actsHtml() { return ''; }
  /* «Ovqat qo'shish» oynasi ichidagi bo'limlar (tablar): Qidirish · Mening taomlarim · Odatdagi · Idishlar — Profilda emas */
  function addTabs(cur) {
    return '<div class="sl-atabs" role="tablist" aria-label="' + esc(T('aTabs')) + '">' + [['s', 'aTabS'], ['m', 'aTabM'], ['t', 'aTabT'], ['v', 'aTabV']].map(function (x) {
      var on = x[0] === cur; return '<button type="button" role="tab" class="sl-atab' + (on ? ' on' : '') + '" aria-selected="' + on + '" data-act="atab" data-t="' + x[0] + '">' + esc(T(x[1])) + '</button>'; }).join('') + '</div>';
  }
  function shBack(title, attrs) { return '<div class="rz-sh-h sl-ph"><button type="button" class="rz-x" ' + attrs + ' aria-label="' + esc(T('back')) + '">' + ico('back') + '</button><b>' + esc(title) + '</b><button type="button" class="rz-x" data-act="sheetclose" aria-label="' + esc(T('close')) + '">' + ico('x') + '</button></div>'; }
  function rcmineOpen() { openSheet('rcmine', shHead(T('aT')) + addTabs('m') + rcMineHtml() + '<div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="sheetclose">' + esc(T('close')) + '</button></div>'); }
  function searchHtml() {
    var off = navigator.onLine === false;
    return shHead(T('aT')) + addTabs('s') + mealSeg() + '<div class="sl-sr"><label class="sl-search">' + ico('search') + '<input id="fdQ" type="text" inputmode="search" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="' + esc(T('aPh')) + '" value="' + esc(fd.q) + '" aria-label="' + esc(T('aT')) + '"></label><button type="button" class="sl-cam" id="phBtn" data-act="fphoto" aria-label="' + esc(T('phT')) + '"' + (off ? ' disabled aria-disabled="true" title="' + esc(T('phOffline')) + '"' : '') + '>' + ico('cam') + '</button></div><div id="fdAiW">' + aiLineHtml() + '</div>' + '<div id="fdCat">' + chipsHtml() + '</div><div class="sl-res" id="fdRes">' + resultsHtml() + '</div>';
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
    var on = r.querySelector('.rz-chip.on'); if (on && r.scrollWidth > r.clientWidth) r.scrollLeft = Math.max(0, on.offsetLeft - (r.clientWidth - on.offsetWidth) / 2); upd();
  }
  function defPortionCat(f) { var v = f.fam ? S.famVariant(f, S.famDefault(f), null) : f; if (!v || !v.u || !v.u.length) return ''; var u = defUnit(v), g = u === 'g100' ? 100 : (S.unitGrams(v, u) || 0); return g > 0 ? (u === 'g100' ? '100 ' + T('gram') : '1 ' + unitName(u)) + ' · ' + fmt(S.portion(v, g).kcal) + ' ' + T('kcal') : ''; }
  /* «Yemaydiganlarim» qoidasi (yagona: kalkifit-yeymiz.js rinfo): cho'chqa — hech qayerda; cheklangan teglar — ro'yxatda yashiriladi (+ «Ko'rsatish»), qidiruvda belgi, porsiya oynasida yumshoq ogohlantirish */
  function rI(f, vr) { return Y ? Y.rinfo(f, vr) : { pork: false, hit: [] }; }
  function rSplit(list, keepPork) { var o = { show: [], hid: [] }; list.forEach(function (f) { var i = rI(f); if (i.pork && !keepPork) return; (i.hit.length ? o.hid : o.show).push(f); }); return o; }
  function rNoPork(list) { return list.filter(function (f) { return !rI(f).pork; }); }
  function rFoot(n) { return n ? '<button type="button" class="sl-txtbtn sl-rhid" data-act="rshow" aria-expanded="' + !!fd.showR + '">' + esc(T(fd.showR ? 'rhHide' : 'rhShow', { n: n })) + '</button>' : ''; }
  function rEntInfo(e) { var f = e.fid ? foodById(e.fid) : null; return f ? rI(f.al ? (foodById(f.al.f) || f) : f, e.vr || null) : { pork: false, hit: [] }; }
  var catCache = { k: '', m: {} };
  function catVisible(c) {                              // butun guruh cheklangan bo'lsa (masalan «Baliq») — tabning o'zi yashiriladi
    if (c === 'baliq' && Y && Y.avoids('baliq')) return false; if (!Y || !Y.chReady() || dbState !== 2) return true;
    var k = dbState + '|' + Y.yemay().join(); if (catCache.k !== k) catCache = { k: k, m: {} }; if (catCache.m[c] != null) return catCache.m[c];
    var l = allFoods().filter(function (f) { return inCat(f, c) && !f.h && !f.custom; }); return (catCache.m[c] = !l.length || l.some(function (f) { var i = rI(f); return !i.pork && !i.hit.length; }));
  }
  function rHits() { if (!Y || !fd || (fd.mode !== 'portion' && fd.mode !== 'item')) return []; var o = fd.mode === 'item' ? fd.items[fd.ix] : fd; if (!o) return []; if (!o.food && fd.mode === 'item') return o.rHit || []; if (!o.food || o.food.custom || (fd.mode === 'portion' && fd.editId != null)) return []; var f = o.fam || o.food; return rI(f, o.fam ? o.food.vr : null).hit; }      // AI matn / rasm natijasi (item) ham: taom tanilsa — o'sha yumshoq ogohlantirish
  function rWarnInner() { var h = rHits(); return h.length ? '<div class="sl-rwarn" role="note">' + ico('warn') + '<span>' + esc(T('rWarn', { x: Y.hitText(h) })) + '</span></div>' : ''; }
  function resRow(f, cat, dim) {
    var pk = f.fam && fd && fd.q ? S.famPick(f, fd.q) : null, key = f.fam ? f.fam.id : (dbAlias[f.id] || f.id), le = lastFor(key), fv = pk ? S.famVariant(f, Object.assign(S.famDefault(f), pk)) : null, vl = fv ? S.famLabel(f, fv.vr, null, lang) : '', sub = cat ? defPortionCat(f) : (le ? T('aLastTime', { x: entUnitTxt(le.e) }) : defPortionTxt(f, fv ? Object.assign(S.famDefault(f), pk) : null));      // «sut 1,5» → qatorda ham «Sut · 1,5%» va shu variantning kkal'i (bosganda porsiya oynasida o'sha tanlanadi)
    var bad = rI(f).hit.length;
    return '<button type="button" class="sl-rr' + (dim ? ' dim' : '') + '" data-act="pickfood" data-id="' + esc(f.id) + '"' + (pk ? ' data-pick="' + esc(JSON.stringify(pk)) + '"' : '') + '>' + tileHtml(f.id, null, nameOf(f), 44) + '<span class="m"><span class="nm">' + esc(nameOf(f) + (vl ? ' · ' + vl : '')) + (f.kf && Y ? ' ' + Y.badge({ kafe: true }) : '') + (bad ? ' <span class="sl-kb sl-rb">' + esc(T('rBadge')) + '</span>' : '') + (st.favs.indexOf(f.id) > -1 ? ' ' + ico('heart', 'fv') : '') + '</span>' + (sub ? '<span class="tm">' + esc(sub) + '</span>' : '') + '</span>' + ico('chev', 'r') + '</button>';
  }
  function resultsHtml() {
    if (dbState !== 2) return '<div class="rz-mut">' + esc(T('aLoading')) + '</div>';
    if (Y && !Y.chReady()) { Y.loadCh(function () { if (fd && kit.sheetKind() === 'add' && fd.mode === 'search') refreshRes(); }); return '<div class="rz-mut">' + esc(T('aLoading')) + '</div>'; }
    var foods = allFoods(), q = fd.q.trim(), list, h = '', le = lastEntries(200); fdLM = {}; le.forEach(function (r) { fdLM[r.k] = r; });
    var withR = function (sp, fn) { return sp.show.map(function (f) { return fn(f, false); }).join('') + (fd.showR ? sp.hid.map(function (f) { return fn(f, true); }).join('') : '') + rFoot(sp.hid.length); };
    if (q) { list = S.search(foods, q, srchOpts(40)); if (fd.cat) list = list.filter(function (f) { return inCat(f, fd.cat); }); }      // qidiruv: odam o'zi yozgan — HAMMASI chiqadi (cho'chqali ham, belgisiz); cheklangani «Yemaydiganlaringizda» belgisi bilan
    else if (fd.cat) { var sc = rSplit(foods.filter(function (f) { return inCat(f, fd.cat) && !f.h; })); return sc.show.length || sc.hid.length ? withR(sc, function (f, d) { return resRow(f, true, d); }) : '<div class="rz-empty"><b>' + esc(T('aNone')) + '</b></div>'; }
    else {                                           // birinchi ko'rinish («Mashhur»): Oxirgilar → Saqlanganlar → Boshqa usullar
      var recAll = fd.recSnap || (fd.recSnap = le.slice(0, 8)), recI = recAll.filter(function (r) { return !rEntInfo(r.e).pork; }), recS = recI.filter(function (r) { return !rEntInfo(r.e).hit.length; }), recH = recI.filter(function (r) { return rEntInfo(r.e).hit.length; });
      var rec = recS.slice(0, 5), favSp = rSplit(st.favs.map(foodById).filter(Boolean).slice(0, 8), true), sec = function (t, l, hint) { return l.length ? '<div class="sl-sech"><h3>' + esc(t) + '</h3>' + (hint ? '<span>' + esc(hint) + '</span>' : '') + '</div>' + l.join('') : ''; };
      var pop = rec.length ? [] : (function () { var r0 = rSplit(st.recents.map(foodById).filter(Boolean)).show.slice(0, 5); return r0.length ? r0 : rSplit(foods.filter(function (f) { return f.t === 'o' && !f.custom && !f.h; })).show.slice(0, 6); })();
      var hidN = recH.length + favSp.hid.length;
      return sec(T('aRecentT'), rec.map(function (r) { return recRow(r); }).concat(fd.showR ? recH.map(function (r) { return recRow(r, true); }) : []), T('aRecHint')) + sec(T('aPop'), pop.map(function (f) { return resRow(f); })) + '<div class="sl-sech"><h3>' + esc(T('aSavedT')) + '</h3></div>' + tplBar() + favSp.show.map(function (f) { return resRow(f); }).join('') + (fd.showR ? favSp.hid.map(function (f) { return resRow(f, false, true); }).join('') : '') + st.customFoods.map(function (f) { return resRow(f); }).join('') + rFoot(hidN) + moreHtml();
    }
    if (!list.length) return '<div class="rz-empty"><b>' + esc(T('aNone')) + '</b><span>' + esc(T('aNoneH')) + '</span>' + (q ? '<div class="sl-nact"><button type="button" class="rz-btn sm primary" data-act="fqai"' + (navigator.onLine === false ? ' disabled aria-disabled="true"' : '') + '>' + esc(T('aAiBtn')) + '</button><button type="button" class="rz-btn sm" data-act="fcustom">' + esc(T('aCustom')) + '</button><button type="button" class="rz-btn sm" data-act="fqsug">' + esc(T('aSugBtn')) + '</button></div>' : '') + '</div>';
    return list.map(function (f) { return resRow(f); }).join('');
  }
  function refreshRes(err) { var r = $('#fdRes'); if (r) r.innerHTML = err ? '<div class="rz-mut">' + esc(T('aNone')) + '</div>' : resultsHtml(); var w = $('#fdAiW'); if (w) w.innerHTML = aiLineHtml(); var cw = $('#fdCat'); if (cw) { var want = chipsHtml(); if (cw._k !== want) { cw.innerHTML = want; cw._k = want; catsInit(); } } }
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
    var nm = o.fam ? nameOf(o.fam) : (o.food ? nameOf(o.food) : (o.name || '')), lb = o.fam && o.food ? S.famLabel(o.fam, o.food.vr, o.szid, lang) : '', fidv = o.fam ? o.fam.id : (o.food ? o.food.id : null);
    var more = famChips(o) + '<div class="rz-fl">' + esc(T('pUnit')) + '</div><div class="rz-chips" id="fdUnits" role="group" aria-label="' + esc(T('pUnit')) + '">' + pwUnits(o).map(function (u) { var vv = vOf(u); return '<button type="button" class="rz-chip' + (vv ? ' sl-vc' : '') + (o.unit === u ? ' on' : '') + '" data-act="funit" data-u="' + u + '" aria-pressed="' + (o.unit === u) + '">' + esc(vv ? vLabel(vv, vkey(o)) : pwUName(u)) + '</button>'; }).join('') + (o.food ? '<button type="button" class="rz-chip sl-vnew" data-act="vnew">+ ' + esc(T('vNew')) + '</button>' : '') + '</div>' + vFillChips(o) +
      (fd.mode === 'portion' ? '<div class="rz-fl">' + esc(T('pMealT')) + '</div>' + mealChips(fd.meal, 'fmeal') : '') + '<div class="sl-pwi" id="fdInfo">' + esc(pwInfo(o)) + '</div>' + (fd.mode === 'portion' || fd.mode === 'item' ? '<button type="button" class="rz-btn ghost sl-sw" data-act="pwswap">' + esc(T('pwSwap')) + '</button>' : '');
    return (noName ? '' : '<div class="sl-hero2"><span class="sl-pimg kf-pop">' + tileHtml(fidv, o.food ? o.food.vr : null, nm, 120, true) + '</span><h2 class="sl-pn" id="fdName">' + esc(nm) + '</h2><span class="sl-pv" id="fdVar">' + esc(lb) + '</span></div>') +
      '<div class="sl-pk" aria-live="polite">' + (approx ? '<small>≈ </small>' : '') + '<b id="fdKcal">' + fmt(pt.kcal) + '</b><span> ' + T('kcal') + '</span></div><div class="sl-pm" id="fdMac"><span class="p">' + esc(T('mP')) + ' <b id="fdMp">' + Math.round(pt.p) + '</b> g</span><span class="f">' + esc(T('mF')) + ' <b id="fdMf">' + Math.round(pt.f) + '</b> g</span><span class="c">' + esc(T('mC')) + ' <b id="fdMc">' + Math.round(pt.c) + '</b> g</span></div>' +
      (approx ? '<p class="rz-p sm sl-ap">' + esc(T('pwApprox')) + '</p>' : '') +
      '<div class="sl-qty"><button type="button" data-act="fqty" data-s="-1" aria-label="' + esc(T('qtyMinus')) + '">' + ico('minus', '', 2.6) + '</button><span class="c"><span class="pw-in"><input id="fdQty" type="text" inputmode="decimal" autocomplete="off" enterkeyhint="done" aria-label="' + esc(T('pwQty')) + '" value="' + esc(qtyStr(o.qty)) + '"><i id="fdQu">' + esc(o.unit === 'g100' ? T('gram') : pwUName(o.unit)) + '</i></span><small id="fdGr">≈ ' + fmt(pwGrams(o)) + ' ' + T('gram') + '</small></span><button type="button" data-act="fqty" data-s="1" aria-label="' + esc(T('qtyPlus')) + '">' + ico('plus', '', 2.6) + '</button></div>' +
      '<div class="sl-q4" id="fdQuick" role="group" aria-label="' + esc(T('pwQuick')) + '">' + pwQuick(o) + '</div>' +
      '<button type="button" class="sl-type" data-act="pwmore" aria-expanded="' + !!o.pmore + '"><span class="m"><b>' + esc(T('pTypeT')) + '</b><small id="fdTSum">' + esc(lb || pwUName(o.unit)) + '</small></span><span class="a">' + esc(T(o.pmore ? 'pCloseL' : 'pChange')) + '</span></button><div class="sl-pwmore" id="pwMore"' + (o.pmore ? '' : ' hidden') + '>' + more + '</div>';
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
    if (it.ed || it.food) it.ptxt = it.unit === 'g100' ? fmt(pt.g) + ' ' + T('gram') : qtyStr(it.qty) + ' ' + pwUName(it.unit);
  }
  function pwUpdate(fromInput) {
    var o = pwO(), pt = pwCalc(o); if (fd.mode === 'item') { o.ed = true; itSync(o); }
    kit.setNum($('#fdKcal'), num($('#fdKcal').textContent.replace(/\s/g, '')), pt.kcal, { dur: 200 });
    var set = function (id, v) { var e = $(id); if (e) e.textContent = v; }; var rw = $('#rWarn'); if (rw) rw.innerHTML = rWarnInner();
    set('#fdMp', Math.round(pt.p)); set('#fdMf', Math.round(pt.f)); set('#fdMc', Math.round(pt.c));
    if (!fromInput) $('#fdQty').value = qtyStr(o.qty);
    set('#fdQu', o.unit === 'g100' ? T('gram') : pwUName(o.unit)); set('#fdGr', '≈ ' + fmt(pwGrams(o)) + ' ' + T('gram')); set('#fdInfo', pwInfo(o)); if (!o.fam) set('#fdTSum', pwUName(o.unit)); $('#fdQuick').innerHTML = pwQuick(o);
    $$('[data-act=funit]').forEach(function (b) { var on = b.getAttribute('data-u') === o.unit; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    var cb = $('#fsave'); if (cb && fd.mode === 'portion') cb.textContent = ctaText(pt.kcal);
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
      '<div class="sl-cta"><button type="button" class="sl-main" id="fsave" data-act="pwdone">' + esc(T('pwDone')) + '</button></div>';
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
    return shHead(T('aT')) + addTabs('v') + (l.length ? l.map(function (v) {
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
    var yb = S.kechagidekOk(st, fd.date, fd.meal), l = st.tpls || [], cards = '';
    var thumbs = function (arr) { return '<span class="th">' + arr.slice(0, 3).map(function (x) { return tileHtml(x.fid, x.vr, x.n, 30); }).join('') + '</span>'; };
    if (yb) { var ye = S.yesterdayEntries(st, fd.date, fd.meal); cards += '<button type="button" class="sl-sc" data-act="yday2">' + thumbs(ye.map(function (e) { var f = e.fid ? foodById(e.fid) : null; return { fid: e.fid, vr: e.vr, n: f ? nameOf(f) : (e.name || '?') }; })) + '<b>' + esc(T('tplYest')) + '</b><small>' + esc(T('aYestSub', { m: mealName(fd.meal), k: fmt(S.sumEntries(ye).kcal) })) + '</small></button>'; }
    l.forEach(function (t) { cards += '<button type="button" class="sl-sc" data-act="tplopen" data-id="' + t.id + '">' + thumbs(t.items.map(function (x) { return { fid: x.fid, vr: x.vr, n: x.n }; })) + '<b>' + esc(t.name) + '</b><small>' + esc(T('aCnt', { n: t.items.length, k: fmt(S.tplKcal(t)) })) + '</small></button>'; });
    if (!l.length) cards += '<button type="button" class="sl-sc help" data-act="tplhelp"><span class="th">' + ico('star') + '</span><b>' + esc(T('tplBar')) + '</b><small>' + esc(T('tplSaveS')) + '</small></button>';
    return tplSugHtml() + '<div class="sl-sgrid" id="tplBar" role="group" aria-label="' + esc(T('tplBar')) + '">' + cards + '</div>';
  }
  function tplHelpHtml() {
    return '<div class="rz-sh-h sl-ph"><button type="button" class="rz-x" data-act="fback" aria-label="' + esc(T('back')) + '">' + ico('back') + '</button><b>' + esc(T('tplBar')) + '</b><button type="button" class="rz-x" data-act="sheetclose" aria-label="' + esc(T('close')) + '">' + ico('x') + '</button></div><p class="rz-p">' + esc(T('tplEmpty')) + '</p>' + tplSugHtml() + tplTodayHtml(fd.date);
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
    return shHead(T('aT')) + addTabs('t') + (l.length ? l.map(function (t, i) {
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
    fd.base = null; fd.obFrom = null; fd.orMore = false; fd.orSeen = false; fd.mode = 'portion'; fd.unit = defUnit(fd.food); fd.qty = fd.unit === 'g100' ? 100 : 1; fd.editId = null; fd.vfill = 'tola'; fd.vsugShown = null;
    var vs0 = S.vesselsFor(st, vkey(fd)); if (vs0.length) { fd.unit = 'v:' + vs0[0].id; fd.qty = 1; }             // shu oila uchun «Mening idishim» bor — oldindan tanlangan
    var le = lastFor(vkey(fd)); if (le) pwApplyLast(le.e, pick);
    setSheet(portionHtml()); if (OR && orState !== 2) loadOr(function () { if (kit.sheetKind() === 'add' && fd.mode === 'portion') orRefresh(); });
  }
  function pwApplyLast(e, pick) {                        // shu taomning OXIRGI porsiyasi (va omillari) — boshlang'ich qiymat
    if (fd.fam && !pick) famOpen(fd, fd.fam, S.famSelOf(fd.fam, e.vr || null), e.sz || null);
    var ok = vOf(e.unit) ? S.vesselsFor(st, vkey(fd)).some(function (v) { return 'v:' + v.id === e.unit; }) : fd.food.u.some(function (u) { return u[0] === e.unit; });
    if (!ok) return; fd.unit = e.unit; fd.qty = e.qty > 0 ? e.qty : 1; if (e.unit === 'g100' && e.qty < 5 && e.g > 5) fd.qty = e.g; if (vOf(e.unit)) fd.vfill = e.vf || 'tola';
  }
  function quickAdd(d, id, key) {                       // Oxirgilar [+]: oxirgi porsiya bilan shu zahoti (1 bosish); ✓ bo'ladi, qayta bosilsa — bekor
    fd.added = fd.added || {}; var cur = fd.added[key];
    if (cur) { var rm = S.removeFood(st, fd.date, cur); delete fd.added[key]; commit(); refreshRes(); return rm; }
    var x = S.dayOf(st, d), e = x && x.food.filter(function (y) { return y.id === id; })[0]; if (!e) return; var o = {};
    ['fid', 'name', 'unit', 'qty', 'g', 'kcal', 'p', 'f', 'c', 'est', 'vr', 'sz', 'vn', 'vf'].forEach(function (k) { if (e[k] != null) o[k] = e[k]; }); o.meal = fd.meal; o.ts = nowTs();
    var date = fd.date, it = S.addFood(st, date, o), f = e.fid ? foodById(e.fid) : null, nm = e.name || (f ? nameOf(f.al ? (foodById(f.al.f) || f) : f) : '');
    fd.added[key] = it.id; commit(); vib(); refreshRes();
    toast(T('aAdded', { x: nm + ' · ' + entUnitTxt(e) }), function () { S.removeFood(st, date, it.id); if (fd && fd.added) delete fd.added[key]; commit(); if (fd && kit.sheetKind() === 'add' && fd.mode === 'search') refreshRes(); }, true, 3000); afterWater(); jokeAfter('food', { sweet: !!(f && f.t === 'h') });
  }
  function ctaText(k) { return fd.editId != null ? T('pCtaE', { k: fmt(k) }) : (rHits().length ? T('pCtaForce', { k: fmt(k) }) : T('pCta_' + fd.meal, { k: fmt(k) })); }
  function portionHtml() {
    var f = fd.food, fav = f && st.favs.indexOf(f.id) > -1;
    return '<div class="sl-ph2"><button type="button" class="sl-x" data-act="fback" aria-label="' + esc(T('back')) + '">' + ico('back') + '</button><span class="sp"></span>' + (f ? '<button type="button" class="sl-x' + (fav ? ' fav' : '') + '" data-act="ffav" aria-label="' + esc(T('aFav')) + '" aria-pressed="' + fav + '">' + ico('heart') + '</button>' : '') + '<button type="button" class="sl-chip sl-src" data-act="pwsrc">' + ico('info') + '<span>' + esc(T('pManba')) + '</span></button><button type="button" class="sl-x" data-act="sheetclose" aria-label="' + esc(T('close')) + '">' + ico('x') + '</button></div>' +
      '<div id="rWarn">' + rWarnInner() + '</div>' + vSugHtml() + pwBody(fd) + '<div id="orBox">' + orCardHtml() + '</div>' +
      '<div class="sl-cta">' + (fd.editId != null ? '<button type="button" class="sl-txtbtn danger" data-act="fdel">' + esc(T('del')) + '</button>' : '') + '<button type="button" class="sl-main" id="fsave" data-act="fsave">' + esc(ctaText(pwCalc(fd).kcal)) + '</button></div>';
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
    var date = fd.date; kit.closeSheet(); commit(); vib(); toast(fd.saveMsg || T('saved'), function () { rowOut(it.id, function () { S.removeFood(st, date, it.id); commit(); }); }, true);
    afterWater(); jokeAfter('food', { sweet: f.t === 'h', fish: orFishKey(f, fd), alt: !!fd.obFrom });
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
  function rGuess(nm) {                               // bazaga moslanmagan AI/rasm qatori: nomdan taom taniladimi? tanilsa — «Yemaydiganlarim» teglari (yumshoq ogohlantirish uchun)
    try { if (!Y || !Y.chReady()) return []; var r = S.parseText(String(nm || '').split(' · ')[0], allFoods(), { recents: st.recents, favs: st.favs, freq: S.freqMap(st, todayStr(), 30, dbAlias), vessels: st.vessels }); if (r.items.length !== 1 || r.missing.length) return []; var x = r.items[0]; return rI(x.fam || x.food, x.fam ? x.vr : null).hit; } catch (e) { return []; }
  }
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
      res.j.ovqatlar.forEach(function (o) { var m = aiItem(o); if (m) { fd.items.push(m); return; } fd.items.push({ name: o.nom, fid: null, food: null, rHit: rGuess(o.nom), unit: 'pc', qty: 1, g: o.g || 0, kcal: Math.round(o.kcal), p: o.o, f: o.y, c: o.u, est: true, ai: true, ptxt: o.porsiya || '', base: { g: o.g || 0, kcal: Math.round(o.kcal), p: o.o || 0, f: o.y || 0, c: o.u || 0 } }); });
      fd.missing = []; txRefresh();
    }).catch(function () { fd.busy = false; fd.aiErr = true; txRefresh(); });
  }
  function txSave() {
    var list = fd.items.filter(function (i) { return !i.off; }), n = list.length, date = fd.date, ids = []; if (!n) return;
    list.forEach(function (it) {
      sendTaklif(it); var db1 = !!it.food, e = S.addFood(st, date, { vr: it.vr, sz: it.sz, vn: vOf(it.unit) ? vName(vOf(it.unit)) : null, vf: vOf(it.unit) ? (it.vfill || 'tola') : null, fid: it.fid || null, name: it.fid ? (it.food && it.food.custom ? it.name : null) : it.name, meal: fd.meal, unit: db1 ? it.unit : null, qty: db1 ? it.qty : 1, g: it.g, kcal: it.kcal, p: it.p, f: it.f, c: it.c, est: it.est, ts: nowTs() });
      ids.push(e.id); if (!it.fid) e.name = it.name + (it.ptxt ? ' (' + it.ptxt + ')' : '');
    });
    kit.closeSheet(); commit(); vib(); toast(T('saved') + ': ' + n, function () { ids.forEach(function (id) { S.removeFood(st, date, id); }); commit(); }, true); jokeAfter('food');
  }

  /* ---------- qadam ---------- */
  /* Avtomatik qadam (faqat Android ilovasi: apparat hisoblagich, KalkiNative.qadam). Veb/iPhone'da QA = null — hamma narsa avvalgidek.
     prefs().qa: undefined (hali so'ralmagan) | 'on' | 'off' (rad etildi / o'chirildi) | 'later' («Keyinroq» — qayta so'ralmaydi, Profil'dan yoqiladi). */
  var QA = window.KalkiNative && KalkiNative.qadam && KalkiNative.qadam.ok() ? KalkiNative.qadam : null, qaS = { avail: false, granted: false };
  function qaOn() { return !!(QA && qaS.avail && qaS.granted && prefs().qa === 'on'); }
  function qaBadge() { return qaOn() ? ' <span class="sl-auto">' + esc(T('qaBadge')) + '</span>' : ''; }
  function qaRowHtml() {
    if (!QA || !qaS.avail) return '';
    var on = qaOn();
    return '<div class="sl-qa">' + infoTitle(T('qaRow'), T('qaRowH'), ' style="margin-top:14px"') + segHtml(T('qaRow'), [{ attrs: 'data-act="qatog" data-v="1"', on: on, text: T('jkOn') }, { attrs: 'data-act="qatog" data-v="0"', on: !on, text: T('jkOff') }]) + '</div>';
  }
  function qaView() { return !kit.sheetKind() && st.setup && (view === 'today' || view === 'history' || view === 'profile'); }
  function qaRefresh() {
    if (!QA) return;
    QA.status().then(function (r) {
      var was = qaOn() + '|' + qaS.avail; qaS.avail = !!(r && r.available); qaS.granted = !!(r && r.granted);
      if (qaS.avail && prefs().qa != null) QA.enable(qaOn());
      if (qaOn()) qaSync(); if (was !== qaOn() + '|' + qaS.avail && qaView()) render();
    });
  }
  function qaSync() {
    if (!qaOn()) return;
    QA.days(7).then(function (list) {
      if (!qaOn() || !st.setup) return; var ch = false, t = todayStr();
      list.forEach(function (k) { if (k && typeof k.sana === 'string' && Dt.parse(k.sana) && k.sana <= t && (k.qadam > 0 || st.days[k.sana])) ch = S.setAutoSteps(st, k.sana, k.qadam) || ch; });
      if (!ch) return;
      save(); if (qaView() && view !== 'profile') { render(); afterWater(); }
    });
  }
  function qaBoot() {
    if (!QA) return;
    qaRefresh();
    setInterval(function () { if (document.visibilityState === 'visible') qaSync(); }, 60000);          // ekran ochiq bo'lsa — har daqiqada
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') qaRefresh(); });
  }
  function qaAsk() {
    openSheet('qaask', shHead(T('qaT')) + '<p class="rz-p">' + esc(T('qaH')) + '</p><div class="rz-actions"><button type="button" class="rz-btn primary" data-act="qayes">' + esc(T('qaYes')) + '</button><button type="button" class="rz-btn ghost" data-act="qalater">' + esc(T('qaLater')) + '</button></div>');
  }
  function qaAllow(fromAsk) {
    QA.perm().then(function (r) {
      qaS.granted = !!(r && r.granted); prefs().qa = qaS.granted ? 'on' : 'off'; save();
      if (fromAsk) kit.closeSheet();
      if (qaS.granted) { QA.enable(true).then(function () { qaSync(); }); toast(T('qaOnT'), null, true); } else toast(T('qaDenied'));
      render();
    });
  }
  function qaToggle(on) {
    if (!QA) return;
    if (on) { qaAllow(false); return; }
    prefs().qa = 'off'; save(); QA.enable(false); render();
  }
  function stepsOpen() { if (QA && qaS.avail && prefs().qa == null) { qaAsk(); return; } openSteps(todayStr()); }
  var sp = null;
  function openSteps(date, goal) {
    date = date || todayStr(); var dx = S.dayOf(st, date), auto = !goal && qaOn() && !!(dx && dx.sa != null || date === todayStr()), cur = goal ? st.stepGoal : auto ? S.manualSteps(dx) : (dx || { steps: 0 }).steps;
    sp = { date: date, val: '', goal: !!goal, cur: cur, auto: auto };
    var hint = auto ? (cur ? T('qaExtraNow', { m: fmt(cur) }) : '') : (cur ? fmt(cur) : '');
    openSheet('steps', shHead(goal ? T('stGoalSet') : (date === todayStr() ? T('stepsT') : T('stepsOf', { d: kit.dLabel(date) }))) + '<p class="rz-p sm">' + esc(goal ? '' : auto ? T('qaExtra', { a: fmt(dx && dx.sa || 0) }) : T('stEnter')) + '</p><div class="rz-amt" id="spAmt"><span id="spNum">0</span></div><p class="rz-mut sm" id="spHint">' + esc(hint) + '</p>' + kit.padHtml('int000') + '<div class="rz-actions"><button type="button" class="rz-btn primary" id="spSave" data-act="spsave" disabled>' + esc(T('save')) + '</button></div>');
  }
  function spUpdate() { $('#spNum').textContent = sp.val ? fmt(+sp.val) : '0'; $('#spSave').disabled = !sp.val; }
  function afterWater() { /* qadam/suv/ovqat saqlangach sokin bayram tekshiruvi */ var t = todayStr(), x = S.dayOf(st, t); if (!x) return; var p = prefs(); if (!p.cel || p.cel.d !== t) p.cel = { d: t }; var pl = planNow();
    if (x.water >= pl.water.glasses && !p.cel.w) { p.cel.w = 1; save(); celebrate('wCard', T('wDone')); }
    if (x.steps >= st.stepGoal && !p.cel.s) { p.cel.s = 1; save(); celebrate('kcalBtn', T('sGoalDone')); } }
  function celebrate(id, msg) { setTimeout(function () { var el = document.getElementById(id) && $('#' + id); if (el) { el.classList.remove('glow'); void el.offsetWidth; el.classList.add('glow'); } toast(msg, null, true); vib(25); }, 350); }
  function spSave() {
    var v = +sp.val, prevS = sp.cur; if (sp.goal) { st.stepGoal = Math.max(1000, Math.min(100000, v)); } else if (sp.auto) { prevS = (S.dayOf(st, sp.date) || { steps: 0 }).steps; v = S.setManualSteps(st, sp.date, v); } else S.setSteps(st, sp.date, v);
    kit.closeSheet(); commit(); vib(); toast(T('saved'), null, true); if (!sp.goal) { afterWater(); if (sp.date === todayStr()) jokeAfter('steps', { steps: v, prev: prevS }); }
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
    st.profile.weight = S.currentWeight(st); kit.closeSheet(); commit(); vib(); toast(T('saved'), null, true); jokeAfter('weight', { kg: kg });
  }

  /* ---------- profil tahriri ---------- */
  var pe = null;
  function openProfile() {
    var p = st.profile; pe = { sex: p.sex, preg: p.preg, act: p.act, goal: p.goal };
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
  var TIPS = [{ sel: '#kcalBtn', key: 'tip1', pos: 'below' }, { sel: '#mainAdd', key: 'tip2', pos: 'above' }, { sel: '.rz-tab[data-v=history]', key: 'tip3', pos: 'above' }];
  function noIntro() { try { return !!localStorage.getItem('kalki_no_intro'); } catch (e) { return false; } }      // sinov kaliti: avtomatik slayd chiqmasin (faqat test-soddalik2 uni tekshiradi)
  /* ochilish animatsiyasi: splash (seansda bir marta, ≤900 ms, ilovani kuttirmaydi) va Bugun'ning birinchi kirishida bloklar pastdan 12 px suzib chiqadi (50–60 ms stagger, ≤400 ms; tab almashganda takrorlanmaydi) */
  var todayIn = false;
  function upIdx() { var m = $('#rzMain'); if (!m || !m.classList.contains('rzi')) return; var i = 0; ['#mainAdd', '.sl-door', '.sl-meal', '.sl-macs', '.sl-duo'].forEach(function (q) { $$('#rzMain ' + q).forEach(function (e) { e.style.setProperty('--i', i++); }); }); }
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
  function obProfile() { return { sex: ob.sex, preg: ob.sex === 'f' && ob.preg, age: num(ob.age), height: num(ob.height), weight: num(ob.weight), act: ob.act, goal: ob.goal || 'keep', goalWeight: null }; }
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
  function obLang(l) {
    var cur = isCyr() ? 'cyr' : lang; if (!ob || l === cur) return;
    try { var sn = JSON.parse(JSON.stringify(ob)); sn.anim = null; sessionStorage.setItem(OB_RES, JSON.stringify({ t: Date.now(), ob: sn })); } catch (e) {}
    var tgt = document.getElementById(l === 'cyr' ? 'langCyr' : (l === 'ru' ? 'langRu' : 'langUz')); if (tgt) tgt.click();
    setTimeout(function () { if (ob) { lang = langNow(); showOnb(); } }, 80);          // sahifa qayta yuklanmasa (joyida almashsa) — hozirgi ekran yangi tilda qayta chiziladi
  }
  /* birinchi ochilish: onboarding'dan OLDIN til tanlash ekrani. Faqat: yangi foydalanuvchi (setup yo'q), saqlangan til yo'q (kalki_lang), demo emas.
     Tanlov lang.js orqali saqlanadi (KalkiLang.setLang → kalki_lang); UZ↔RU/ЎЗ da sahifa o'zi qayta yuklanadi va ekran qayta chiqmaydi. */
  var lpDone = false;
  function langStored() { try { var v = localStorage.getItem('kalki_lang'); return v === 'uz' || v === 'ru' || v === 'cyr'; } catch (e) { return false; } }
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
  function lpPick(l) {
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
    if (s === 5) { body = '<h2 class="rz-q">' + esc(T('o5q')) + '</h2>' + [1, 2, 3, 4, 5].map(function (x) { return optBtn('obact', x, T('a' + x), T('a' + x + 'h'), ob.act === x); }).join(''); foot = ob.act ? 'next' : 'next0'; }
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
    st = n; try { localStorage.removeItem(LS_IMPORT); localStorage.removeItem(OLD[LS_IMPORT]); } catch (e) {} ob = null; seenFood = null; heroPrev = null; save(); loadDb();
    var el = $('#rzOnb'); el.classList.add('out');
    wait(function () { el.hidden = true; el.classList.remove('out'); view = 'today'; enterNext = true; if (IN && !KD.on && !prefs().introDone && !noIntro()) introPending = true; render(); var mn = $('#rzMain'); if (mn) mn.scrollTop = 0; window.scrollTo(0, 0); if (location.hash === '#boshlash') history.replaceState(null, '', location.pathname + location.search); if (introPending) setTimeout(introShow, 350); }, 260);
  }
  function obStart() { if (ob.refine) { obRefineSave(); return; } obFinish(obProfile(), false); }
  function obLater() { if (!ob || !ob.sex) return; var d = obDef(ob.sex); obFinish({ sex: ob.sex, preg: ob.sex === 'f' && ob.preg, age: d.age, height: d.height, weight: d.weight, act: 2, goal: 'keep', goalWeight: null }, true); }
  /* «Me'yoringiz taxminiy» → aniqlashtirish (slayder ekranlari 2–6 + natija); mavjud holat saqlanadi, faqat profil yangilanadi */
  function obLock(on) { ['#rzMain', '.rz-nav'].forEach(function (q) { var e = $(q); if (e) { e.inert = on; if (on) e.setAttribute('aria-hidden', 'true'); else e.removeAttribute('aria-hidden'); } }); }
  function obClose() { var el = $('#rzOnb'); el.classList.add('out'); ob = null; wait(function () { el.hidden = true; el.classList.remove('out'); obLock(false); render(); }, 220); }
  function taxOpen() { var p = st.profile; ob = { step: 2, refine: true, sex: p.sex, preg: !!p.preg, age: String(Math.round(num(p.age))), height: String(Math.round(num(p.height))), weight: String(num(p.weight)).replace('.', ','), act: p.act, goal: p.goal, yemay: [], touched: { age: 1, height: 1, weight: 1 }, anim: null, counted: true, ycounted: true }; obLock(true); showOnb(); }
  function obRefineSave() {
    var r = obProfile(), np = { sex: r.sex, preg: r.preg, age: r.age, height: r.height, weight: r.weight, act: r.act, goal: r.goal, goalWeight: st.profile.goalWeight || null }; if (S.restrictions(np).keepOnly) np.goal = 'keep';
    st.profile = np; var d = todayStr(); if (st.weights.length === 0 || Math.abs(S.currentWeight(st) - np.weight) > 0.04) S.addWeight(st, d, np.weight); prefs().taxminiy = null; save(); ob = null;
    var el = $('#rzOnb'); el.classList.add('out'); wait(function () { el.hidden = true; el.classList.remove('out'); obLock(false); render(); toast(T('saved'), null, true); }, 220);
  }
  /* «Taxminiy» belgisi: aniqlashtirilguncha doim turadi — Bugun'da aylana ostida kichik chip (joylashuvni siljitmaydi), Profil tepasida ixcham qator */
  function taxChipHtml() { return prefs().taxminiy ? '<div class="sl-taxrow"><button type="button" class="sl-taxchip" id="taxChip" data-act="taxgo">' + esc(T('txChip')) + ' ›</button></div>' : ''; }
  function taxRowHtml() { return prefs().taxminiy ? '<section class="rz-card sl-tax1" id="taxCard"><span>' + esc(T('txP')) + '</span><button type="button" class="rz-btn sm" data-act="taxgo">' + esc(T('txBtn')) + '</button></section>' : ''; }
  var tipsSess = false;                                   // shu seansda yo'l-ko'rsatkich bor edi/bo'ldi → bir martalik kartalar KEYINGI ochilishda (bir vaqtda chiqmaydi)
  function oneTimeOk() { return !!(st && st.prefs && st.prefs.tipsDone) && !tipsSess; }
  if (SL) document.addEventListener('sldchange', function (e) {
    var d = e.detail || {}, f = OBID[d.id]; if (f && ob) { ob[f] = obFmt(f, d.value); ob.touched[f] = true; }
  });

  /* ---------- suv ---------- */
  function waterSheetHtml() {
    var t = todayStr(), x = S.dayOf(st, t) || { water: 0 }, pl = planNow(), glasses = pl.water.glasses, wl = Math.min(glasses, x.water), h = shHead(T('wOpenT')) + '<div class="sl-glasses" role="group" aria-label="' + esc(T('wT')) + '">';
    for (var i = 0; i < glasses; i++) h += '<button type="button" class="sl-glass' + (i < wl ? ' on' : '') + '" data-act="glass" data-i="' + i + '" data-d="' + (i < wl ? 1 : 0) + '" aria-pressed="' + (i < wl) + '" aria-label="' + (i + 1) + '">' + glassSvg() + '</button>';
    return h + '</div><p class="rz-p sm" id="wsTxt">' + esc(T('wOf', { n: wl, m: glasses }) + ' · ' + fmt(x.water * S.GLASS_ML) + ' ' + ML()) + '</p><p class="rz-mut sm">' + esc(T('wHint')) + '</p><div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="xwater">' + esc(T('hHow')) + '</button><button type="button" class="rz-btn" data-act="sheetclose">' + esc(T('close')) + '</button></div>';
  }
  function openWaterSheet() { openSheet('water', waterSheetHtml(), { noFocus: true }); }
  function glassTap(i) {
    var t = todayStr(), x = S.ensureDay(st, t), pl = planNow(), n = (x.water === i + 1) ? i : i + 1; S.setWater(st, t, n); save();
    $$('.sl-glass').forEach(function (g, j) { var on = j < Math.min(n, pl.water.glasses); g.classList.toggle('on', on); g.setAttribute('aria-pressed', on); });
    $$('#wSegs i').forEach(function (g, j) { g.classList.toggle('on', j < Math.min(n, pl.water.glasses)); });
    var w = $('#wTxt'); if (w) w.innerHTML = '<b>' + fmt(n * S.GLASS_ML) + '</b><small> / ' + fmt(pl.water.glasses * S.GLASS_ML) + ' ' + ML() + '</small>'; var ws = $('#wsTxt'); if (ws) ws.textContent = T('wOf', { n: Math.min(n, pl.water.glasses), m: pl.water.glasses }) + ' · ' + fmt(n * S.GLASS_ML) + ' ' + ML(); vib(10); afterWater(); jokeAfter('water');
  }

  /* ---------- hodisalar ---------- */
  lpBind();
  root.addEventListener('click', function (e) {
    var lmenu = $('#rzLangMenu'), el = e.target.closest('[data-act]');
    if (!el) { if (lmenu && !lmenu.hidden && !e.target.closest('.rz-langwrap')) lmenu.hidden = true; return; }
    var a = el.getAttribute('data-act');
    if (a !== 'langmenu' && lmenu) lmenu.hidden = true;
    if (kit.act(a, el)) return;
    if (Y && Y.act(a, el, e)) return;
    if (R && R.act(a, el, e)) return;
    if (IN && IN.act(a)) return;
    switch (a) {
      case 'tab': kit.hideToast(); if (view !== viewOf(el.getAttribute('data-v'))) { view = viewOf(el.getAttribute('data-v')); enterNext = true; var mm = $('#rzMain'); if (mm) mm.scrollTop = 0; } render(); break;
      case 'add': openAdd({ date: view === 'history' && foodDay ? foodDay : todayStr() }); break;
      case 'fab': openAdd({ date: view === 'history' && foodDay ? foodDay : todayStr() }); break;
      case 'wopen': openWaterSheet(); break;
      case 'wadd': { var t9 = todayStr(), x9 = S.ensureDay(st, t9); S.setWater(st, t9, x9.water + 1); commit(); vib(10); afterWater(); jokeAfter('water'); break; }
      case 'theme': { prefs().theme = el.getAttribute('data-t'); save(); applyTheme(); render(); break; }
      case 'xkcal': openExplainKcal(); break; case 'xmacro': openExplainMacro(); break; case 'xwater': openExplainWater(); break; case 'xsteps': openExplainSteps(); break; case 'xweight': openExplainWeight(); break; case 'stephelp': openStepHelp(); break;
      case 'glass': glassTap(+el.getAttribute('data-i')); break;
      case 'addsteps': stepsOpen(); break; case 'qayes': qaAllow(true); break; case 'qalater': prefs().qa = 'later'; save(); openSteps(todayStr()); break; case 'qatog': qaToggle(el.getAttribute('data-v') === '1'); break; case 'editsteps': openSteps(el.getAttribute('data-d')); break; case 'stepgoal': openSteps(null, true); break;
      case 'key': {
        var k = el.getAttribute('data-k'), ks = kit.sheetKind();
        if (ks === 'steps') { sp.val = kit.padApply(sp.val, k, { max: 6 }); spUpdate(); vib(5); }
        else if (ks === 'weight') { wf.val = kit.padApply(wf.val, k, { max: 3, dec: 1 }); $('#wfNum').textContent = wf.val || '0'; vib(5); }
        break; }
      case 'spsave': spSave(); break; case 'addweight': openWeight(); break; case 'wfsave': wfSave(); break;
      case 'editprof': openProfile(); break;
      case 'pesex': { peRead(); pe.sex = el.getAttribute('data-v'); if (pe.sex === 'm') pe.preg = false; peRepaint(); break; }
      case 'peact': peRead(); pe.act = +el.getAttribute('data-v'); peRepaint(); break;
      case 'pegoal': if (el.getAttribute('aria-disabled') !== 'true') { peRead(); pe.goal = el.getAttribute('data-v'); peRepaint(); } break;
      case 'pesave': peSave(); break;
      case 'share': openShare(); break; case 'shgo': shGo(false); break; case 'shdl': shGo(true); break;
      case 'dayend': { var t0 = todayStr(), r0 = S.finishDay(st, t0, t0); if (r0.why === 'empty') break; commit(); toast(T(r0.ok ? 'deDone' : 'deLow'), function () { if (st.days[t0]) delete st.days[t0].done; commit(); }, r0.ok); if (r0.ok) jokeAfter('dayend'); break; }
      case 'export': doExport(); break; case 'import': bk.restoreSheet(); break; case 'wipe': wipe(); break;
      case 'tips': prefs().tipsDone = false; save(); view = 'today'; enterNext = true; var m0 = $('#rzMain'); if (m0) m0.scrollTop = 0; render(); break;
      case 'about': aboutOpen(true); break;
      case 'apk': { window.location.href = lang === 'ru' ? '/ilova/?lang=ru' : (isCyr() ? '/ilova/?lang=cyr' : '/ilova/'); break; }
      case 'jclose': { hazilStore().jx = todayStr(); saveQuiet(); var jl = $('#jLine'); if (jl) jl.remove(); break; }
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
      case 'fcat': catSelect(el.getAttribute('data-c') || ''); break;
      case 'ftext': openText(null, true); break;
      case 'calinfo': openSheet('calinfo', shHead(T('calInfoT')) + '<p class="rz-p">' + esc(T('calNote')) + '</p><p class="rz-p sm">' + esc(T('deHint')) + '</p>' + okBtn()); break;
      case 'fquick': quickAdd(el.getAttribute('data-d'), +el.getAttribute('data-i'), el.getAttribute('data-fk')); break;
      case 'fmeals': fd.meal = el.getAttribute('data-m'); $$('[data-act=fmeals]').forEach(function (b) { var on9 = b === el; b.classList.toggle('on', on9); b.setAttribute('aria-checked', on9); }); refreshRes(); break;
      case 'fmore': fd.more = !fd.more; refreshRes(); break;
      case 'fbrowse': fd.more = false; fd.q = ''; if (!fd.cat) fd.cat = CATS[0]; setSheet(searchHtml()); catsInit(); $('#rzSheet').scrollTop = 0; break;     // «Boshqa usullar → Kategoriyalar»: chiplar qatori (tab) ochiladi, birinchi guruh tanlanadi
      case 'pwmore': { var o8 = pwO(); o8.pmore = !o8.pmore; var pm = $('#pwMore'); if (pm) pm.hidden = !o8.pmore; el.setAttribute('aria-expanded', !!o8.pmore); var cv = el.querySelector('.a'); if (cv) cv.textContent = T(o8.pmore ? 'pCloseL' : 'pChange'); break; }
      case 'fqai': { var q0 = fd.q; openText(null, true); fd.txt = q0; setSheet(textHtml()); txGo(); setTimeout(function () { if (fd && fd.missing && fd.missing.length && navigator.onLine !== false) txAi(); }, 80); break; }
      case 'fqsug': { var q1 = fd.q; fd.suggest = true; openCustom(q1); break; }
      case 'fcustom': { var qv = $('#fdQ'); openCustom(qv ? qv.value : ''); break; }
      case 'cusave': cuSave(); break;
      case 'fback': if (fd.yBack) { var yb = fd.yBack; fd = null; if (yb === 'f') Y.fishBack(); else Y.yBack(); } else if (fd.editId != null) kit.closeSheet(); else { fd.mode = 'search'; fd.food = null; setSheet(searchHtml()); catsInit(); refreshRes(dbState === 0); } break;
      case 'ffav': { var on = S.toggleFav(st, fd.favId || fd.food.id); save(); var b = $('[data-act=ffav]'); b.classList.toggle('fav', on); b.setAttribute('aria-pressed', on); toast(T(on ? 'favOn' : 'favOff')); break; }
      case 'funit': { var o1 = pwO(), nu = el.getAttribute('data-u'), wasV = !!vOf(o1.unit); if (nu !== o1.unit) pwSetUnit(o1, nu); if (wasV || vOf(nu)) pwScreen(); else pwUpdate(); break; }
      case 'fqty': { var o2 = pwO(); pwSetQty(o2, o2.qty + (+el.getAttribute('data-s')) * pwStep(o2)); pwUpdate(); vib(5); break; }
      case 'fmeal': fd.meal = el.getAttribute('data-m'); $$('[data-act=fmeal]').forEach(function (b) { var on3 = b === el; b.classList.toggle('on', on3); b.setAttribute('aria-pressed', on3); });  pwUpdate(); break;
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
      case 'fphoto': if (navigator.onLine !== false) { if (window.KalkiNative && KalkiNative.canPickPhoto()) { KalkiNative.pickPhoto({ header: natTr(T('phT')), gallery: natTr(T('phGal')), camera: natTr(T('phCam')), cancel: natTr(T('cancel')) }).then(function (f) { if (f) phFile(f); }); break; } var pin = $('#phIn'); if (pin) { pin.value = ''; pin.click(); } } break;      // ilovada: kamera yoki galereya tanlovi (native)
      case 'itedit': itemOpen(+el.getAttribute('data-i'), fd.mode === 'photo' ? 'photo' : (fd.mode === 'tpl' ? 'tpl' : 'text')); break;
      case 'pwdone': itemBack(); break;
      case 'pwq': { var o3 = pwO(); pwSetQty(o3, +el.getAttribute('data-v')); pwUpdate(); vib(5); break; }
      case 'pwswap': loadDb(function () { setSheet(pwSwapHtml(pwO())); }); break;
      case 'pwswapx': pwScreen(); break;
      case 'baliqgo': openFish(); break;
      case 'ibtog': { var ibx = el.parentNode && el.parentNode.nextElementSibling, ibo = el.getAttribute('aria-expanded') !== 'true'; if (ibx && ibx.classList.contains('sl-ibx')) { ibx.hidden = !ibo; el.setAttribute('aria-expanded', String(ibo)); } break; }
      case 'streakinfo': openSheet('stk', shHead(T('stkT')) + '<p class="rz-p">' + esc(T('stkB', { n: S.streak(st, todayStr()) })) + '</p>' + okBtn()); break;
      case 'wkday': { var wd0 = el.getAttribute('data-d'); if (wd0 !== todayStr()) { foodDay = wd0; view = 'history'; enterNext = true; render(); } break; }
      case 'mealrep': mealRepeat(el.getAttribute('data-d'), el.getAttribute('data-m')); break;
      case 'baliqoff': prefs().baliqOff = true; commit(); break;
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
      case 'atab': { var at0 = el.getAttribute('data-t'); if (at0 === 's') openAdd({ date: (fd && fd.date) || todayStr() }); else if (at0 === 'm') rcmineOpen(); else if (at0 === 't') tplsOpen(); else vmOpen(); break; }
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
      case 'obsex': ob.sex = el.getAttribute('data-v'); if (ob.sex === 'm') ob.preg = false; ['age', 'height', 'weight'].forEach(function (f) { if (!ob.touched[f]) ob[f] = ''; }); showOnb(); break;      // tegilmagan qiymatlar yangi jinsning boshlang'ich qiymatiga qaytadi
      case 'obact': ob.act = +el.getAttribute('data-v'); showOnb(); break;
      case 'obgoal': if (el.getAttribute('aria-disabled') !== 'true') { ob.goal = el.getAttribute('data-v'); showOnb(); } break;
      case 'rshow': fd.showR = !fd.showR; refreshRes(); break;
      case 'obnext': obNext(); break; case 'obstart': obStart(); break;
      case 'obback': obBack(); break;
      case 'oblater': obLater(); break; case 'oblang': obLang(el.getAttribute('data-l')); break; case 'lppick': lpPick(el.getAttribute('data-l')); break;
      case 'taxgo': taxOpen(); break;
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
    st = load(); if (loadDirty) { loadDirty = false; try { localStorage.setItem(LS, JSON.stringify(st)); } catch (e) {} } applyTheme(); shell();
    try { if ((window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true) document.body.classList.add('rz-standalone'); } catch (e) {}
    var ab = document.getElementById('rzAbout');
    if (ab && !document.getElementById('rzAboutBar')) {
      var bar = document.createElement('div'); bar.className = 'rz-about-bar'; bar.id = 'rzAboutBar'; bar.innerHTML = '<button type="button" class="rz-btn sm" id="rzAboutBack"></button>';
      ab.insertBefore(bar, ab.firstChild); bar.firstChild.addEventListener('click', function () { aboutOpen(false); });
    }
    if (Y) Y.init({ D: D, T: T, esc: esc, ico: ico, catIcon: catIcon, $: $, lang: function () { return lang; }, prefs: prefs, save: save, render: render, S: S, fmt: fmt, unitName: unitName, foodById: foodById, nameOf: nameOf, tileHtml: tileHtml, toast: toast, shHead: shHead,
      openSheet: openSheet, setSheet: setSheet, closeSheet: function () { kit.closeSheet(); }, openAdd: openAdd, by: orIndex, tags: function () { return orTags; }, table: function () { return orTable; }, remaining: yzRemaining, orSrc: function () { return orSrc(fd); }, orDesc: orDesc, orApply: orApply, portionHtml: portionHtml,
      sheetKind: function () { return kit.sheetKind(); }, addIcons: kit.addIcons, withDb: function (cb) { loadDb(function (err) { if (err) return; loadOr(cb); }); }, pickKey: yzPick, logKey: yzLog, pushResync: pushResync, openExternal: openExternal, infoTitle: infoTitle,
      obYnToggle: function (t) { var l = ob.yemay || (ob.yemay = []), i = l.indexOf(t); if (i > -1) l.splice(i, 1); else l.push(t); showOnb(); } });
    if (R) R.init({ D: D, T: T, esc: esc, ico: ico, $: $, $$: $$, lang: function () { return lang; }, isCyr: isCyr, toast: toast, openSheet: openSheet, setSheet: setSheet, sheetKind: function () { return kit.sheetKind(); }, addIcons: kit.addIcons,
      count: function (h) { if (Y) Y.count(h); }, cid: cid, yemay: function () { return Array.isArray(prefs().yemay) ? prefs().yemay : []; },
      saveRecipe: function (name, ings, portions) { var f = S.saveRecipe(st, { name: name, ings: ings, portions: portions }); if (f) commit(); return f; },
      openAddFood: function (id) { kit.closeSheet(); setTimeout(function () { openAdd({ food: id }); }, 320); } });
    if (IN) IN.init({ D: D, T: T, esc: esc, ico: ico, $: $, lang: function () { return lang; } });
    obResume(); tipsSess = !!(st && st.setup && !prefs().tipsDone); if (ob && st && st.setup) showOnb(); else render(); inst.gate();
    try { if (window.__kfSplashHide) window.__kfSplashHide(); } catch (e) {}      // HTML ichidagi splash (kalkifit.html) — ilova tayyor: silliq yo'qoladi (min 600 ms)
    if (KD.on && KD.intro && IN && st && st.setup) { introPending = true; introShow(); }
    if (st.setup) { loadMasofa(); loadDb(function () { if (view === 'today' && !kit.sheetKind()) render(); }); }
    if (st.setup && Y) Y.loadCh();                   // «Yemaydiganlarim» qoidasi ro'yxatlarda tayyor turishi uchun (kichik fayl)
    window.addEventListener('offline', phSetOffline); window.addEventListener('online', phSetOffline);
    var hv = viewOf(location.hash); if (hv && st.setup) { view = hv; render(); }
    if (location.hash === '#qoshish' && st.setup) openAdd({});
    qaBoot();
    setTimeout(pendingFish, 700); document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') pendingFish(); });
    if (navigator.serviceWorker && navigator.serviceWorker.addEventListener) navigator.serviceWorker.addEventListener('message', function (ev) { if (ev.data && ev.data.t === 'baliq' && st && st.setup) { try { caches.open('kalkifit-pending').then(function (c) { c.delete('/__pending/baliq'); }); } catch (e) {} openFish(); } });
    if (window.KalkiNative) KalkiNative.setBack(nativeBack);
    if (NAT) { NAT.notif.onTap(function () { if (st && st.setup) openFish(); }); NAT.notif.perm().then(function (p) { NS.perm = p; if (p === 'granted') natResched(); if (view === 'profile' && !kit.sheetKind()) render(); }); }
    if (/[?&]baliq=1\b/.test(location.search) && st.setup) { try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) {} setTimeout(openFish, 500); }          // eslatma bosildi: baliq guruhi ochiladi
    if (location.hash === '#haqida') aboutOpen(true);
    window.__kalkifit = { get state() { return st; }, render: render, S: S, imgFile: imgFile };
    // pwa-install.js (KalkiPwa: iPhone ko'rsatmasi, Android o'rnatish) shu skriptdan KEYIN yuklanadi — sahifa yuklangach "o'rnatish" kartasi uchun qayta chizamiz
    if (document.readyState !== 'complete') window.addEventListener('load', function () { if (st && st.setup && view === 'today' && !kit.sheetKind() && !kit.tipsOn()) render(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
