# AI ariza — RU sinovi (2026-10-12)

Sinov: lokal `wrangler pages dev` (port 8799, `.dev.vars` + lokal KV), jonli `claude-haiku-5-5` (thinking: disabled, temperature yuborilmaydi, RU uchun `max_tokens` 600). Har so'rovga alohida soxta IP. Skriptlar: `tools/ai-sinov/test-ru.mjs`, `test-ru-ui.mjs`, `test-ariza-ru.mjs`, `tokens-ru.mjs`.

**Hujjat tuzilishi.** Shapka («Кому/От кого»), «ЗАЯВЛЕНИЕ», sana va imzo joyini sayt (forma generatori) qo'yadi; model faqat asosiy matnni yozadi (UZ dagi kabi) — shuning uchun dublikat bo'lmaydi. RU tekshiruv: lotin harfi qolsa — matn qaytarilmaydi (2 urinishdan keyin 502), translit YO'Q.

## 1. Sakkiz RU holat

| # | holat | so'rov | javob | avtomatik tekshiruv | baho |
|---|---|---|---|---|---|
| 1 | ta'til | хочу взять отпуск за свой счёт на 5 дней, нужно поехать в другой город по семейным делам | В связи с необходимостью решения семейных дел в другом городе прошу предоставить мне отпуск без сохранения заработной платы сроком на 5 (пять) календарных дней, с [дата] по [дата]. ¶ Дела, которые требуют моего присутствия в этот период, я заранее передам коллеге [Ф.И.О.], а также готов решить вопросы, связанные с передачей работы, до начала отпуска. | 200, 53 so'z, lotin yo'q, qonun yo'q, murojaat yo'q, «прошу» ×1, bo'sh joy bor, 1.7 s | yaxshi: «прошу» 1, joy qoldiruvchilar bor. Eslatma: 2-xatboshi namunadagi (UZ dagi kabi) «передам коллеге» jumlasiga o'xshash — foydalanuvchi aytmagan, lekin zararsiz. |
| 2 | ishdan bo'shash | хочу уволиться по собственному желанию, работаю менеджером | Прошу уволить меня по собственному желанию с должности менеджера с [дата]. Прошу оформить расчёт и выдать все необходимые документы в соответствии с действующим законодательством. ¶ Я готов передать свои дела и обеспечить передачу рабочих материалов в течение срока, установленного трудовым законодательством, а также оказать содействие в подготовке к замене. | 200, 48 so'z, lotin yo'q, qonun yo'q, murojaat yo'q, «прошу» ×2, bo'sh joy bor, 1.5 s | qabul: «прошу» 2 marta (promptga qaramay), foydalanuvchi aytmagan «расчёт, документы» qo'shilgan — kichik ortiqcha. |
| 3 | moddiy yordam | мне нужна материальная помощь, тяжёлое финансовое положение, в семье трое детей | Я, [Ф.И.О.], обращаюсь к вам с просьбой об оказании материальной помощи в связи с тяжёлым финансовым положением. В семье трое детей, и текущих доходов недостаточно для обеспечения их повседневных потребностей. ¶ Прошу рассмотреть возможность оказания мне материальной помощи. Необходимые документы, подтверждающие состав семьи и доходы, готов предоставить по вашему требованию. | 200, 49 so'z, lotin yo'q, qonun yo'q, murojaat yo'q, «прошу» ×1, bo'sh joy bor, 1.6 s | yaxshi: summa o'ylab topilmagan, hujjat ro'yxati umumiy. |
| 4 | ma'lumotnoma | нужна справка с места работы для банка, чтобы оформить кредит | В связи с необходимостью оформления кредита в банке прошу выдать мне справку с места работы, содержащую сведения о занимаемой должности, дате начала трудовой деятельности и размере заработной платы. ¶ Справка требуется мне для предоставления в [название банка]. Готов предоставить паспорт и иные документы, необходимые для её оформления. | 200, 46 so'z, lotin yo'q, qonun yo'q, murojaat yo'q, «прошу» ×1, bo'sh joy bor, 1.4 s | yaxshi: [название банка] joyi qoldirilgan, «прошу» 1. |
| 5 | o'qishga qabul | хочу подать заявление на поступление в университет на факультет экономики | Прошу принять меня на обучение на факультет экономики [название университета] на [форма обучения] форму обучения по направлению [направление подготовки]. Я, [Ф.И.О.], окончил(а) [название учебного заведения] и имею документ о среднем образовании. Готов(а) предоставить все необходимые документы в соответствии с требованиями приёмной комиссии. | 200, 42 so'z, lotin yo'q, qonun yo'q, murojaat yo'q, «прошу» ×1, bo'sh joy bor, 3.2 s | yaxshi: bitta xatboshi, ko'p [bo'sh joy]; «окончил(а)» jins-neytral. |
| 6 | uy-joy | хочу встать на очередь для улучшения жилищных условий: семья из четырёх человек живёт в однокомнатной квартире | В связи с тем, что моя семья из четырёх человек проживает в однокомнатной квартире, не соответствующей нормам жилой площади на одного человека, прошу поставить меня и членов моей семьи на очередь для улучшения жилищных условий. ¶ Состав семьи: [Ф.И.О.] — заявитель, супруга(-ин) [Ф.И.О.], несовершеннолетние дети [Ф.И.О.], [Ф.И.О.]. Необходимые сведения и документы, подтверждающие состав семьи и жилищные условия, готов предоставить по первому требованию. | 200, 61 so'z, lotin yo'q, qonun yo'q, murojaat yo'q, «прошу» ×1, bo'sh joy bor, 1.8 s | yaxshi, lekin «не соответствующей нормам жилой площади» foydalanuvchi aytmagan baho; qonun moddasi yo'q. |
| 7 | aliment | хочу подать на алименты, бывший муж не платит содержание на ребёнка | Я, [Ф.И.О.], являюсь матерью (законным представителем) несовершеннолетнего ребёнка [Ф.И.О. ребёнка], [дата рождения] года рождения. Отец ребёнка, [Ф.И.О. бывшего супруга], в добровольном порядке не выплачивает средства на содержание ребёнка с [дата] по настоящее время. ¶ В связи с этим прошу взыскать с [Ф.И.О. бывшего супруга] алименты на содержание ребёнка в установленном законом порядке. Также необходимо рассмотреть вопрос о задолженности по алиментам за период неуплаты. Готова предоставить все имеющиеся документы, подтверждающие родство и отсутствие выплат. | 200, 72 so'z, lotin yo'q, qonun yo'q, murojaat yo'q, «прошу» ×1, bo'sh joy bor, 1.9 s | yaxshi: «в установленном законом порядке» — umumiy ibora (qonun moddasi emas). Birinchi urinishda bu ibora tekshiruvga tushib 502 bergan — qoida yumshatildi (quyiga qarang). |
| 8 | erkin mavzu | нужно попросить школу перевести ребёнка в другой класс, потому что он конфликтует с одноклассниками | Я, [Ф.И.О.], законный представитель ученика [класс] класса [Ф.И.О. ученика], обращаюсь по вопросу перевода моего ребёнка в другой класс. В последнее время у моего ребёнка возникают конфликтные ситуации с одноклассниками, что негативно сказывается на его обучении и самочувствии. ¶ Прошу рассмотреть возможность перевода моего ребёнка в другой класс. Также необходимо провести с ним и его одноклассниками беседу с участием классного руководителя и школьного психолога. По необходимости готов предоставить дополнительную информацию и принять участие в обсуждении. | 200, 73 so'z, lotin yo'q, qonun yo'q, murojaat yo'q, «прошу» ×1, bo'sh joy bor, 2.0 s | yaxshi, lekin «беседа с психологом» foydalanuvchi aytmagan taklif — foydalanuvchi tahrir qiladi. |

## 2. Qo'shimcha RU tekshiruvlar

- **Ariza emas** («напиши мне стихотворение про осень в Ташкенте»): `{rad:true}` — to'g'ri rad etildi.
- **PII niqobi** (telefon, pasport, PINFL yozilgan): 200; javobda telefon/pasport/PINFL YO'Q, joyida «[телефон]». Matn: Прошу предоставить мне очередной ежегодный трудовой отпуск продолжительностью 7 (семь) календарных дней, с [дата] по [дата]. Прошу учесть, что на период отпуска должна быть сохранена заработная плата в установленном порядке. ¶ Для связи в период отпуска могу быть доступен по номеру телефона [телефон]. Необходимые дела в период моего отсутствия я передам [Ф.И.О. ответственного сотрудника].

## 3. UZ regressiya

`yozuv` va `til` yo'q so'rovlar UZ yo'lidan o'tadi (kod o'zgarmagan: `cleanText`, `validate`, `toCyrillic`, `SYSTEM`).

| holat | natija |
|---|---|
| uz: bola kasal: «bolam 3 kun kasal bo'ldi, maktabga yozishim kerak» | 200, 33 so'z |
| uz: ishdan 2 kun: «ishdan 2 kunga javob so'ramoqchiman, to'yim bor» | 200, 26 so'z |
| uz: kirill yozuv: «o'z xohishim bilan ishdan bo'shamoqchiman» | 502, 0 so'z, kirill yozuv: YO'Q |

Qo'shimcha: har UZ holat yana 3 martadan (9 so'rov) — 9/9 → 200 (26–44 so'z). Bitta alohida yurishda UZ «kirill» holati 502 berdi (model matni 25 so'zdan qisqa/tekshiruvdan o'tmagan; keyingi 4 yurishda 200) — bu UZ'ning mavjud xatti-harakati, RU o'zgarishlari bilan bog'liq emas.

Birlik testlari: `tools/ai-sinov/test-ariza.mjs` (UZ, 15/15 o'tdi), `test-ariza-ru.mjs` (RU, 10/10 o'tdi).

## 4. UI (Playwright, jonli API)
- RU sahifa: blok ko'rinadi, barcha matnlar ruscha, Lotin/Kirill tugmasi yo'q, so'rovda `til:"ru"` va `yozuv` yo'q, matn formaga tushadi va hujjatda «ЗАЯВЛЕНИЕ» ostida ko'rinadi, «Подробнее» ochiladi, 390 px da gorizontal toshmaydi, JS xatosi yo'q.
- UZ sahifa: blok va Lotin/Kirill avvalgidek, so'rovda `til` yo'q; sahifa ichida RU tugmasi bosilsa blok ruscha bo'ladi, UZ ga qaytsa o'zbekcha.
- /cyr/ sahifa: blok yo'q.
- Skrinshotlar: `tools/ai-sinov/out/ru-ui-1280.png`, `ru-ui-390.png` (gitignore'da).

## 5. Narx

Haiku 5.5: kirish $0,10 / chiqish $0,50 (1M token). 8 RU so'rov o'lchovi: o'rtacha **1608 kirish / 176 chiqish token** (kirish katta: RU system prompt ~1,5 ming token) → **1 so'rov ≈ $0.00025**, 1000 so'rov ≈ $0.25. Taqqos: UZ 896/232 token, $0,00021. Bu sinov uchun jami taxminan 100 so'rov ≈ $0,03.

## 6. Topilmalar va qarorlar
- JS `\b` kirill harflarda ishlamaydi → RU regexlarda `(?<![а-яё])…(?![а-яё])` ishlatildi (birlik testi buni ushladi: «Уважаемый директор,» olib tashlanmagan edi).
- «закон» so'zining o'zi qonun havolasi hisoblanmaydi (aliment holati «в установленном законом порядке» sababli 502 bergan): faqat «Закон Республики…», «закон №…», «закон об…», «ст. N», «статья», «кодекс», «№», «постановление N…» rad etiladi.
- Prompt'da «прошу» ≤ 1 qilib qattiqlashtirildi; 8 dan 7 holatda 1 marta, 1 holatda 2 marta.
- Kuzatilgan flake: bitta yurishda «поступление в университет» holati noto'g'ri `RAD_ETILDI` berdi (qayta 7 urinishda yo'q). Foydalanuvchi «Другой вариант»/qayta urinishi mumkin; kuzatish kerak.
- RU `max_tokens` 600 (UZ 400): kirill ko'proq token sarflaydi.
- 429 xabarlari RU so'rovga ruscha qaytadi; UI RU da faqat 429 da server xabarini ko'rsatadi, boshqa xatolarda o'z ruscha matnini.

## 7. Tuzatishlar (telefonda sinovdan keyin, 2026-10-12)

Faqat RU yo'li (`til:'ru'`); UZ kodiga tegilmadi (UZ birlik testlari 15/15, UZ jonli 3 holat 200).

1. **Fakt to'qimasin.** Prompt: ta'til turi (оплачиваемый / без сохранения / ежегодный / очередной), summa, sabab tafsiloti, muddat — foydalanuvchi aytmasa YOZILMAYDI; tur aytilmasa «отпуск» yoki [вид отпуска]; standart ibora «без сохранения…» promptdan olib tashlandi. Server tekshiruvi `factOkRu`: javobda «без сохранения / за свой счёт / оплачиваемый / ежегодный / очередной / учебный отпуск» bo'lsa-yu, kiritishda yo'q bo'lsa — javob qaytarilmaydi, qayta so'raladi (RU uchun 3 urinish).
2. **Jins.** Prompt: «Обязуюсь…», «Документы будут предоставлены» kabi jinssiz tuzilmalar; iloji bo'lmasa «готов(а)». Server `genderNeutral`: «готов, уведомлён, ознакомлен, вынужден, обязан, рад, благодарен» → «…(а)», «согласен, должен» → «…(на)», «окончил, проживал, работал, обращался, заболел, уволился» → «…(а)» avtomatik.
3. **Yil.** So'rovga «Сегодня (Ташкент): YYYY-MM-DD» qo'shiladi; prompt: yilsiz sana → eng yaqin kelgusi sana yili, o'tgan/noaniq → [год]; sana/oy aytilmagan bo'lsa yil umuman yozilmaydi. Server: `yearOkRu` (yil faqat joriy/keyingi yoki foydalanuvchi yozgan yil bo'lishi mumkin; oy aytilmagan bo'lsa yil yo'q) va `stripInventedYear` («[дата] 2026 г.» → «[дата]»).

### Qayta ishga tushirilgan 3 so'rov va yana 5 holat (to'liq javoblar)

| # | so'rov | javob | «без сохранения» | bir jinsli shakl | yillar |
|---|---|---|---|---|---|
| 1: fakt | Прошу отпуск с 1 по 14 ноября, ухаживать за мамой | В связи с необходимостью ухода за матерью, [Ф.И.О. матери], прошу предоставить мне отпуск с 1 по 14 ноября 2026 г. ¶ Дела, которые необходимо выполнить в период отпуска, будут переданы коллеге [Ф.И.О.]. При необходимости готов(а) предоставить документы, подтверждающие указанную причину. | yo'q | yo'q | 2026 |
| 2: jins | хочу уволиться по собственному желанию, могу передать дела и предоставить документы | Прошу уволить меня по собственному желанию с [дата] в соответствии с законодательством Республики Узбекистан. ¶ Обязуюсь передать дела и документы, находящиеся в моем ведении, назначенному лицу в установленный срок. Документы, необходимые для оформления увольнения, будут предоставлены в полном объеме. | yo'q | yo'q | - |
| 3: yil | отпуск с 1 ноября по 14 ноября | Прошу предоставить мне отпуск с 1 по 14 ноября 2026 г. (до сих пор) — нет, без лишних слов: прошу предоставить мне отпуск с 1 по 14 ноября 2026 г. ¶ Дела, которые необходимо выполнить в этот период, я передам коллеге [Ф.И.О.]. По возвращении готов(а) приступить к исполнению своих обязанностей в установленном порядке. | yo'q | yo'q | 2026,2026 |
| 4: ta'til turi aytilmagan | нужен отпуск на 3 дня по семейным обстоятельствам | Прошу предоставить мне отпуск на 3 (три) дня, с [дата] по [дата], в связи с семейными обстоятельствами. ¶ На время моего отсутствия необходимые дела будут переданы коллеге [Ф.И.О.]. При необходимости готов(а) предоставить документы, подтверждающие причину отсутствия. | yo'q | yo'q | - |
| 5: ma'lumotnoma | нужна справка с места работы для посольства | Прошу выдать мне справку с места работы для предоставления в посольство. Справка необходима для оформления [название документа / цель получения визы]. ¶ Сведения, которые должны быть указаны в справке: [Ф.И.О.], занимаемая должность [должность], дата приёма на работу [дата], размер заработной платы [сумма] (при необходимости). Справка будет использоваться по месту требования и не может быть предоставлена иным лицам без моего согласия. | yo'q | yo'q | - |
| 6: moddiy yordam | прошу материальную помощь, у ребёнка болезнь, лечение дорогое | Я, [Ф.И.О.], обращаюсь к вам с просьбой об оказании материальной помощи. У моего ребёнка [возраст] лет диагностировано заболевание, требующее дорогостоящего лечения. Расходы на лечение превышают имеющиеся у семьи возможности, что создаёт для нас серьёзные затруднения. ¶ Прошу рассмотреть возможность оказания материальной помощи для покрытия расходов на лечение ребёнка. Необходимые медицинские документы и подтверждающие справки готов(а) предоставить по требованию. | yo'q | yo'q | - |
| 7: ishdan bo'shash | увольнение с должности бухгалтера, последний рабочий день 20 ноября | Прошу уволить меня с должности бухгалтера по собственному желанию с 20 ноября 2026 г. Последний рабочий день — 20 ноября 2026 г. ¶ Дела, которые необходимо передать, будут переданы коллеге [Ф.И.О.] до окончания работы. Обязуюсь передать все документы и материальные ценности в установленном порядке и предоставить необходимые пояснения по текущей работе. | yo'q | yo'q | 2026,2026 |
| 8: ta'til ko'chirish | хочу перенести отпуск на декабрь | Прошу перенести мой отпуск, предоставляемый в [дата], на декабрь 2026 г. в период с [__] по [__]. ¶ Перенос обусловлен [причина переноса]. Дела, которые необходимо выполнить в период отсутствия, будут переданы [Ф.И.О. сотрудника, исполняющего обязанности]. | yo'q | yo'q | 2026 |

Natija: 8/8 → 200; «без сохранения» faqat foydalanuvchi aytganda (hech biri aytmagan — yo'q); «готов/согласен» bir jinsli shakl qolmadi («готов(а)» ko'rinishida); yil faqat sana/oy aytilgan holatlarda (2026), «1 ноября» → «2026 г.» (bugun 2026-10-12, eng yaqin kelgusi sana).

Birlik testlari: `test-ariza-ru.mjs` 14/14 (3 yangi qoida uchun 5 ta yangi test). Regressiya: avvalgi 8 RU holat + rad + PII + 3 UZ holat qayta yurgizildi — 13/13 → 200 (rad to'g'ri).

Topilma: tekshiruvlar qattiqlashgani uchun RU da 2 → 3 urinish; birinchi urinishda model ba'zan «ежегодный» yoki «[дата] 2026 г.» yozadi va u rad etiladi (kuzatuvda ~1/3 holat); javob vaqti odatda 1.5–2.2 s, ba'zan 4 s gacha.
- RU minimal so'z soni 25 → 15: fakt to'qimaslik qoidasidan keyin to'g'ri matnlar qisqaroq bo'ldi (24 so'zli matn rad etilib 502 bergan; 8 urinishdan 6 ta). UZ minimal (25) o'zgarmagan.
