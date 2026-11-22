// Электро-объявления несут синий акцент CarUnity (#465A90), остальные виды топлива — зелёный.
// Временно отключено: синий акцент убран, всё использует зелёный. Функция оставлена для возможного возврата.
export const isElectricAccent = (car) => false;

export const accentClasses = (electric) => ({
  // Иконки-кнопки сравнения и избранного внутри карточки
  iconIdle: electric
    ? 'bg-slate-100 dark:bg-slate-800 text-[#465A90] border-slate-200 dark:border-slate-700 hover:border-[#465A90]'
    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500',
  iconActive: electric ? 'bg-[#465A90] text-white border-[#465A90]' : 'bg-emerald-500 text-white border-emerald-500',
  // Кнопки-иконки поверх фото плитки
  photoIdle: electric
    ? 'bg-slate-950 border-white/10 text-white hover:bg-[#465A90] hover:border-[#465A90]'
    : 'bg-slate-950 border-white/10 text-white hover:bg-emerald-500 hover:border-emerald-500',
  photoActive: electric ? 'bg-[#465A90] border-[#465A90] text-white' : 'bg-emerald-500 border-emerald-500 text-white',
  // Сплошная кнопка (написать продавцу, подробнее)
  solidButton: electric ? 'bg-[#465A90] hover:bg-[#5B72B0]' : 'bg-emerald-500 hover:bg-emerald-600',
});