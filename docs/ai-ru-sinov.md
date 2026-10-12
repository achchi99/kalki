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
