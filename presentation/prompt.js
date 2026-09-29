const DEMO_PROMPT = B(
`Подпомогни UX изследване на учебно приложение за поръчка на обяд.
Всички данни по-долу са измислени за обучение.

Цел: до три месеца делът на завършените поръчки да нарасне от 40% на 50%, без ръст на оплакванията на 100 завършени поръчки.
Ограничение: можем да променим интерфейса, но не цените и системата за прогнозиране на доставката.

Използвай само предоставените данни. Не добавяй факти за реални компании или участници. Не измисляй цитати. При липса на информация напиши „неизвестно“.

Задачи:
1. Посочи до две липсващи уточнения за измерването на целта.
2. Преформулирай „Колко лесно и приятно беше поръчването?“ в два неутрални въпроса с балансирани отговори.
3. Предложи един извод за потребителска нужда с точни препратки към данните и един случай, който го ограничава.
4. Предложи една следваща проверка и кажи какво тя не може да докаже.
Отдели наблюдения, интерпретации и хипотези. Не обобщавай анкетата към всички потребители. Не извеждай причина само от конверсията. Отговори до 350 думи.

УЧЕБЕН ПАКЕТ
A1: 1000 уникални започнати поръчки; 400 завършени. Започната = отворена стъпка за потвърждение, веднъж за уникална поръчка. Завършена = успешно потвърдена от същата начална група. Причините за незавършване не са записани. Липсват точните дати на отчетния период, начална стойност на оплакванията и правилото за периода, в който ги отчитаме.
I1 — прекъсната поръчка, ограничен бюджет: „Избрах обяд за 9 евро. Накрая видях общо 13 евро с доставката и таксите. Бях решил да похарча до 11 и се отказах.“
I2 — прекъсната поръчка, ограничено време: „Общата цена ми беше ясна. Отказах се, когато видях доставка след 50 минути — тогава вече започваше срещата ми.“
I3 — завършена поръчка след колебание: „Върнах се до кошницата, защото не разбрах дали доставката е включена. Проверих още веднъж и накрая поръчах.“
I4 — прекъсната поръчка, проблем с плащането: „Цената и времето ми бяха добре. Плащането даде грешка два пъти и поръчах по телефона.“
S1: 30 доброволци от извадка по удобство, всички със заявена онлайн поръчка на обяд през последните 7 дни. Въпрос: „При последната ви поръчка колко лесно беше да разберете общата сума преди потвърждението?“ Много трудно: 4; по-скоро трудно: 8; нито трудно, нито лесно: 6; по-скоро лесно: 7; много лесно: 3; не помня: 2. 12 от всички 30, включително „не помня“ в знаменателя, посочват затруднение: 40%. Извадката не е представителна и не измерва причините за отказ.
C-A — измислена услуга: общата цена е на финалната стъпка; показан интервал 35–50 минути; задължителен профил след кошницата.
C-B — измислена услуга: общата цена е в кошницата; показан интервал 40–50 минути; възможно продължаване като гост.
Конкурентните карти не съдържат данни за реална скорост, удовлетвореност, успех или конверсия.`,
`Support UX research for a fictional lunch-ordering app.
All data below is invented for teaching.

Goal: increase completed orders from 40% to 50% within three months, without increasing complaints per 100 completed orders.
Constraint: we can change the interface, but not prices or the delivery prediction system.

Use only the supplied data. Do not add facts about real companies or participants. Do not invent quotes. Write “unknown” when information is missing.

Tasks:
1. Identify up to two missing details needed to measure the goal.
2. Rewrite “How easy and pleasant was ordering?” as two neutral questions with balanced response options.
3. Propose one insight about a user need with precise source references and one case that limits the insight.
4. Propose one next test and explain what it cannot prove.
Separate observations, interpretations and hypotheses. Do not generalise the survey to all users. Do not infer causes from conversion alone. Keep the response under 350 words.

TEACHING DATASET
A1: 1,000 unique started orders; 400 completed. Started = confirmation step opened, counted once per unique order. Completed = successfully confirmed from the same starting group. Reasons for non-completion were not recorded. Exact reporting dates, the baseline complaint rate and the complaint observation window are missing.
I1 — abandoned, limited budget: “I chose a €9 lunch. At the end I saw €13 including delivery and fees. I had decided to spend no more than €11, so I abandoned it.”
I2 — abandoned, limited time: “The total price was clear. I stopped when I saw delivery in 50 minutes — my meeting would already be starting.”
I3 — completed after hesitation: “I went back to the basket because I couldn’t tell whether delivery was included. I checked again and eventually ordered.”
I4 — abandoned, payment issue: “The price and timing were fine. Payment failed twice, so I ordered by phone.”
S1: 30 volunteers recruited by convenience sampling; all reported ordering lunch online in the last seven days. Question: “For your last order, how easy was it to understand the total before confirmation?” Very difficult: 4; somewhat difficult: 8; neither difficult nor easy: 6; somewhat easy: 7; very easy: 3; don’t remember: 2. 12 out of all 30 respondents, including don’t remember in the denominator, report difficulty: 40%. The sample is not representative and does not measure causes of abandonment.
C-A — fictional service: total price appears at the final step; displayed delivery range 35–50 minutes; an account is required after the basket.
C-B — fictional service: total price appears in the basket; displayed delivery range 40–50 minutes; guest checkout is possible.
The competitor cards contain no evidence about actual speed, satisfaction, success or conversion.`
);
