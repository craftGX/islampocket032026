"use client";

import Link from "next/link";

type RoqyaVerse = {
  id: string;
  title: string;
  arabic: string;
  french: string;
  reference: string;
};

const roqyaVerses: RoqyaVerse[] = [
  {
    id: "fatiha",
    title: "Al-Fatiha",
    arabic:
      "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ • ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ • ٱلرَّحْمَٰنِ ٱلرَّحِيمِ • مَٰلِكِ يَوْمِ ٱلدِّينِ • إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ • ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ • صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ",
    french:
      "Au nom d’Allah, le Tout Miséricordieux, le Très Miséricordieux. Louange à Allah, Seigneur de l’univers, le Tout Miséricordieux, le Très Miséricordieux, Maître du Jour de la Rétribution. C’est Toi que nous adorons et c’est de Toi que nous implorons secours. Guide-nous dans le droit chemin, le chemin de ceux que Tu as comblés de faveurs, non pas de ceux qui ont encouru Ta colère ni des égarés.",
    reference: "Sourate 1, Al-Fatiha, 1-7",
  },
  {
    id: "kursi",
    title: "Ayat Al-Kursi",
    arabic:
      "ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَيُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي ٱلسَّمَٰوَاتِ وَمَا فِي ٱلْأَرْضِ ۗ مَنْ ذَا ٱلَّذِي يَشْفَعُ عِنْدَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَٰوَاتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِيُّ ٱلْعَظِيمُ",
    french:
      "Allah! Point de divinité à part Lui, le Vivant, Celui qui subsiste par lui-même « Al-Qayyûm ». Ni somnolence ni sommeil ne Le saisissent. À Lui appartient tout ce qui est dans les cieux et sur la terre. Qui peut intercéder auprès de Lui sans Sa permission? Il connaît leur passé et leur futur. Et de Sa science, ils n’embrassent que ce qu’Il veut. Son Trône déborde les cieux et la terre, dont la garde ne Lui coûte aucune peine. Et Il est le Très-Haut, le Très-Grand.",
    reference: "Sourate 2, Al-Baqara, 255",
  },
  {
    id: "falaq",
    title: "Al-Falaq",
    arabic:
      "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ • مِن شَرِّ مَا خَلَقَ • وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ • وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِي ٱلْعُقَدِ • وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
    french:
      "Dis : « Je cherche protection auprès du Seigneur de l’aube naissante, contre le mal de ce qu’Il a créé, contre le mal de l’obscurité lorsqu’elle s’approfondit, contre le mal de celles qui soufflent sur les nœuds, et contre le mal de l’envieux quand il envie. »",
    reference: "Sourate 113, Al-Falaq, 1-5",
  },
  {
    id: "nas",
    title: "An-Nas",
    arabic:
      "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ • مَلِكِ ٱلنَّاسِ • إِلَٰهِ ٱلنَّاسِ • مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ • ٱلَّذِي يُوَسْوِسُ فِي صُدُورِ ٱلنَّاسِ • مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ",
    french:
      "Dis : « Je cherche protection auprès du Seigneur des hommes, le Souverain des hommes, le Dieu des hommes, contre le mal du mauvais conseiller, furtif, qui souffle le mal dans les poitrines des hommes, qu’il soit un djinn ou un être humain. »",
    reference: "Sourate 114, An-Nas, 1-6",
  },
  {
    id: "ikhlas",
    title: "Al-Ikhlass",
    arabic:
      "قُلْ هُوَ ٱللَّهُ أَحَدٌ • ٱللَّهُ ٱلصَّمَدُ • لَمْ يَلِدْ وَلَمْ يُولَدْ • وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌ",
    french:
      "Dis : « Il est Allah, Unique. Allah, Le Seul à être imploré pour ce que nous désirons. Il n’a jamais engendré, n’a pas été engendré non plus, et nul n’est égal à Lui. »",
    reference: "Sourate 112, Al-Ikhlâs, 1-4",
  },
  {
    id: "Sourate 2 versets 102",
    title: "Sourate 2 versets 102",
    arabic:
      "وَٱتَّبَعُوا۟ مَا تَتْلُوا۟ ٱلشَّيَـٰطِينُ عَلَىٰ مُلْكِ سُلَيْمَـٰنَ ۖ وَمَا كَفَرَ سُلَيْمَـٰنُ وَلَـٰكِنَّ ٱلشَّيَـٰطِينَ كَفَرُوا۟ يُعَلِّمُونَ ٱلنَّاسَ ٱلسِّحْرَ وَمَآ أُنزِلَ عَلَى ٱلْمَلَكَيْنِ بِبَابِلَ هَـٰرُوتَ وَمَـٰرُوتَ ۚ وَمَا يُعَلِّمَانِ مِنْ أَحَدٍ حَتَّىٰ يَقُولَآ إِنَّمَا نَحْنُ فِتْنَةٌۭ فَلَا تَكْفُرْ ۖ فَيَتَعَلَّمُونَ مِنْهُمَا مَا يُفَرِّقُونَ بِهِۦ بَيْنَ ٱلْمَرْءِ وَزَوْجِهِۦ ۚ وَمَا هُم بِضَآرِّينَ بِهِۦ مِنْ أَحَدٍ إِلَّا بِإِذْنِ ٱللَّهِ ۚ وَيَتَعَلَّمُونَ مَا يَضُرُّهُمْ وَلَا يَنفَعُهُمْ ۚ وَلَقَدْ عَلِمُوا۟ لَمَنِ ٱشْتَرَىٰهُ مَا لَهُۥ فِى ٱلْـَٔاخِرَةِ مِنْ خَلَـٰقٍۢ ۚ وَلَبِئْسَ مَا شَرَوْا۟ بِهِۦٓ أَنفُسَهُمْ ۚ لَوْ كَانُوا۟ يَعْلَمُونَ",
    french:
      "Et ils suivirent ce que les diables racontent contre le règne de Salomon. Alors que Salomon n’a jamais été mécréant mais bien les diables: ils enseignent aux gens la magie ainsi que ce qui est descendu aux deux anges Hârût et Mârût, à Babylone; mais ceux-ci n’enseignaient rien à personne, qu’ils n’aient dit d’abord: “Nous ne sommes rien qu’une tentation: ne soit pas mécréant!” Ils apprennent auprès d’eux ce qui sème la désunion entre l’homme et son épouse. Or ils ne sont capables de ne nuire à personne qu’avec la permission d’Allah. Et les gens apprennent ce qui leur nuit et ne leur est pas profitable. Et ils savent, très certainement, que celui qui acquiert [ce pouvoir] n’aura aucune part dans l’au-delà. Certes, quelle détestable marchandise pour laquelle ils ont vendu leurs âmes! Si seulement ils savaient !",
    reference: "Sourate 2 versets 102",
  },
  {
    id: "Sourate 2 versets 163-164",
    title: "Sourate 2 versets 163-164",
    arabic:
      "وَإِلَـٰهُكُمْ إِلَـٰهٌۭ وَٰحِدٌۭ ۖ لَّآ إِلَـٰهَ إِلَّا هُوَ ٱلرَّحْمَـٰنُ ٱلرَّحِيمُ إِنَّ فِى خَلْقِ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضِ وَٱخْتِلَـٰفِ ٱلَّيْلِ وَٱلنَّهَارِ وَٱلْفُلْكِ ٱلَّتِى تَجْرِى فِى ٱلْبَحْرِ بِمَا يَنفَعُ ٱلنَّاسَ وَمَآ أَنزَلَ ٱللَّهُ مِنَ ٱلسَّمَآءِ مِن مَّآءٍۢ فَأَحْيَا بِهِ ٱلْأَرْضَ بَعْدَ مَوْتِهَا وَبَثَّ فِيهَا مِن كُلِّ دَآبَّةٍۢ وَتَصْرِيفِ ٱلرِّيَـٰحِ وَٱلسَّحَابِ ٱلْمُسَخَّرِ بَيْنَ ٱلسَّمَآءِ وَٱلْأَرْضِ لَـَٔايَـٰتٍۢ لِّقَوْمٍۢ يَعْقِلُونَ",
    french:
      "Et votre Divinité est une divinité unique. Pas de divinité à part lui, le Tout Miséricordieux, le Très Miséricordieux. Certes, dans la création des cieux et de la Terre, dans l’alternance de la nuit et du jour, dans le navire qui vogue en mer chargé de choses profitables aux gens, dans l’eau qu’Allah fait descendre du ciel, par laquelle Il rend la vie à la terre une fois morte et y répand des bêtes de toute espèce, dans la variation des vents, et dans les nuages soumis entre le ciel et la terre, en tout cela il y a des signes, pour un peuple qui raisonne.",
    reference: "Sourate 2 versets 163-164",
  },
  {
    id: "Sourate 3 versets 18 et 19",
    title: "Sourate 3 versets 18 et 19",
    arabic:
      "شَهِدَ ٱللَّهُ أَنَّهُۥ لَآ إِلَـٰهَ إِلَّا هُوَ وَٱلْمَلَـٰٓئِكَةُ وَأُو۟لُوا۟ ٱلْعِلْمِ قَآئِمًۢا بِٱلْقِسْطِ ۚ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْعَزِيزُ ٱلْحَكِيمُ إِنَّ ٱلدِّينَ عِندَ ٱللَّهِ ٱلْإِسْلَـٰمُ ۗ وَمَا ٱخْتَلَفَ ٱلَّذِينَ أُوتُوا۟ ٱلْكِتَـٰبَ إِلَّا مِنۢ بَعْدِ مَا جَآءَهُمُ ٱلْعِلْمُ بَغْيًۢا بَيْنَهُمْ ۗ وَمَن يَكْفُرْ بِـَٔايَـٰتِ ٱللَّهِ فَإِنَّ ٱللَّهَ سَرِيعُ ٱلْحِسَابِ",
    french:
      "Allah atteste, et aussi les Anges et les doués de science, qu’il n’y a point de divinité à part Lui, le Mainteneur de la justice. Point de divinité à part Lui, le Puissant, le Sage ! Certes, la religion acceptée d’Allah, c’est l’Islam. Ceux auxquels le Livre a été apporté ne se sont disputés, par agressivité entre eux, qu’après avoir reçu la science. Et quiconque ne croit pas aux signes d’Allah… alors Allah est prompt à demander compte !",
    reference: "Sourate 3 versets 18 et 19",
  },
  {
    id: "Sourate 7 versets 117 à 122",
    title: "Sourate 7 versets 117 à 122",
    arabic:
      "وَأَوْحَيْنَآ إِلَىٰ مُوسَىٰٓ أَنْ أَلْقِ عَصَاكَ ۖ فَإِذَا هِىَ تَلْقَفُ مَا يَأْفِكُونَ فَوَقَعَ ٱلْحَقُّ وَبَطَلَ مَا كَانُوا۟ يَعْمَلُونَ فَغُلِبُوا۟ هُنَالِكَ وَٱنقَلَبُوا۟ صَـٰغِرِينَ وَأُلْقِىَ ٱلسَّحَرَةُ سَـٰجِدِينَ قَالُوٓا۟ ءَامَنَّا بِرَبِّ ٱلْعَـٰلَمِينَ رَبِّ مُوسَىٰ وَهَـٰرُونَ",
    french:
      "Et Nous révélâmes à Moïse : “Jette ton bâton !” Et voilà que celui-ci se mit à engloutir ce qu’ils avaient fabriqué. Ainsi la vérité se manifesta et ce qu’ils firent fût vain. Ainsi ils furent battus et s’en retournèrent humiliés. Et les magiciens se jetèrent prosternés. Ils dirent : “Nous croyons au Seigneur de l’Univers, au Seigneur de Moïse et d’Aaron.”",
    reference: "Sourate 7 versets 117 à 122",
  },
  {
    id: "Sourate 37 versets 1 à 9",
    title: "Sourate 37 versets 1 à 9",
    arabic:
      "وَٱلصَّـٰٓفَّـٰتِ صَفًّۭا فَٱلزَّٰجِرَٰتِ زَجْرًۭا فَٱلتَّـٰلِيَـٰتِ ذِكْرًا إِنَّ إِلَـٰهَكُمْ لَوَٰحِدٌۭ رَّبُّ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضِ وَمَا بَيْنَهُمَا وَرَبُّ ٱلْمَشَـٰرِقِ إِنَّا زَيَّنَّا ٱلسَّمَآءَ ٱلدُّنْيَا بِزِينَةٍ ٱلْكَوَاكِبِ وَحِفْظًۭا مِّن كُلِّ شَيْطَـٰنٍۢ مَّارِدٍۢ لَّا يَسَّمَّعُونَ إِلَى ٱلْمَلَإِ ٱلْأَعْلَىٰ وَيُقْذَفُونَ مِن كُلِّ جَانِبٍۢ دُحُورًۭا ۖ وَلَهُمْ عَذَابٌۭ وَاصِبٌ",
    french:
      "Par ceux qui sont rangés en rangs. Par ceux qui poussent (les nuages) avec force. Par ceux qui récitent, en rappel : “Votre Dieu est en vérité unique, le Seigneur des cieux et de la terre et de ce qui existe entre eux et Seigneur des Levants”. Nous avons décoré le ciel le plus proche d’un décor: les étoiles, afin de le protéger contre tout diable rebelle. Ils ne pourront être à l’écoute des dignitaires suprêmes [les Anges] ; car ils seront harcelés de tout côté, et refoulés. Et ils auront un châtiment perpétuel.",
    reference: "Sourate 37 versets 1 à 9",
  },
  {
    id: "Sourate 10 versets 81 et 82",
    title: "Sourate 10 versets 81 et 82",
    arabic:
      "فَلَمَّآ أَلْقَوْا۟ قَالَ مُوسَىٰ مَا جِئْتُم بِهِ ٱلسِّحْرُ ۖ إِنَّ ٱللَّهَ سَيُبْطِلُهُۥٓ ۖ إِنَّ ٱللَّهَ لَا يُصْلِحُ عَمَلَ ٱلْمُفْسِدِينَ وَيُحِقُّ ٱللَّهُ ٱلْحَقَّ بِكَلِمَـٰتِهِۦ وَلَوْ كَرِهَ ٱلْمُجْرِمُونَ",
    french:
      "Lorsqu’ils jetèrent, Moïse dit: “Ce que vous avez produit est magie! Allah l’annulera. Car Allah ne fait pas prospérer ce que font les fauteurs de désordre. Et par Ses paroles, Allah fera triompher la Vérité, quelque répulsion qu’en aient les criminels.”",
    reference: "Sourate 10 versets 81 et 82",
  },
  {
    id: "Sourate 20 verset 69",
    title: "Sourate 20 verset 69",
    arabic:
      "وَأَلْقِ مَا فِى يَمِينِكَ تَلْقَفْ مَا صَنَعُوٓا۟ ۖ إِنَّمَا صَنَعُوا۟ كَيْدُ سَـٰحِرٍۢ ۖ وَلَا يُفْلِحُ ٱلسَّاحِرُ حَيْثُ أَتَىٰ",
    french:
      "Jette ce qu’il y a dans ta main droite ! Cela dévorera ce qu’ils ont fabriqué. Ce qu’ils ont fabriqué n’est qu’une ruse de magicien ; et le magicien ne réussit pas, où qu’il soit.",
    reference: "Sourate 20 verset 69",
  },
  {
    id: "Sourate 23 versets 115 à 117",
    title: "Sourate 23 versets 115 à 117",
    arabic:
      "أَفَحَسِبْتُمْ أَنَّمَا خَلَقْنَـٰكُمْ عَبَثًۭا وَأَنَّكُمْ إِلَيْنَا لَا تُرْجَعُونَ فَتَعَـٰلَى ٱللَّهُ ٱلْمَلِكُ ٱلْحَقُّ ۖ لَآ إِلَـٰهَ إِلَّا هُوَ رَبُّ ٱلْعَرْشِ ٱلْكَرِيمِ وَمَن يَدْعُ مَعَ ٱللَّهِ إِلَـٰهًا ءَاخَرَ لَا بُرْهَـٰنَ لَهُۥ بِهِۦ فَإِنَّمَا حِسَابُهُۥ عِندَ رَبِّهِۦٓ ۚ إِنَّهُۥ لَا يُفْلِحُ ٱلْكَـٰفِرُونَ",
    french:
      "Pensiez-vous que Nous vous avions créés sans but, et que vous ne seriez pas ramenés vers Nous ?” Que soit exalté Allah, le vrai Souverain! Pas de divinité [véritable] en dehors de Lui, le Seigneur du Trône sublime ! Et quiconque invoque avec Allah une autre divinité, sans avoir la preuve évidente [de son existence], aura à en rendre compte à son Seigneur. En vérité, les mécréants, ne réussiront pas.",
    reference: "Sourate 23 versets 115 à 117",
  },
  {
    id: "Sourate 46 versets 29 à 32",
    title: "Sourate 46 versets 29 à 32",
    arabic:
      "وَإِذْ صَرَفْنَآ إِلَيْكَ نَفَرًۭا مِّنَ ٱلْجِنِّ يَسْتَمِعُونَ ٱلْقُرْءَانَ فَلَمَّا حَضَرُوهُ قَالُوٓا۟ أَنصِتُوا۟ ۖ فَلَمَّا قُضِىَ وَلَّوْا۟ إِلَىٰ قَوْمِهِم مُّنذِرِينَ قَالُوا۟ يَـٰقَوْمَنَآ إِنَّا سَمِعْنَا كِتَـٰبًا أُنزِلَ مِنۢ بَعْدِ مُوسَىٰ مُصَدِّقًۭا لِّمَا بَيْنَ يَدَيْهِ يَهْدِىٓ إِلَى ٱلْحَقِّ وَإِلَىٰ طَرِيقٍۢ مُّسْتَقِيمٍۢ يَـٰقَوْمَنَآ أَجِيبُوا۟ دَاعِىَ ٱللَّهِ وَءَامِنُوا۟ بِهِۦ يَغْفِرْ لَكُم مِّن ذُنُوبِكُمْ وَيُجِرْكُم مِّنْ عَذَابٍ أَلِيمٍۢ وَمَن لَّا يُجِبْ دَاعِىَ ٱللَّهِ فَلَيْسَ بِمُعْجِزٍۢ فِى ٱلْأَرْضِ وَلَيْسَ لَهُۥ مِن دُونِهِۦٓ أَوْلِيَآءُ ۚ أُو۟لَـٰٓئِكَ فِى ضَلَـٰلٍۢ مُّبِينٍ",
    french:
      "(Rappelle-toi) lorsque Nous dirigeâmes vers toi une troupe de djinns pour qu’ils écoutent le Coran. Quand ils assistèrent [à sa lecture] ils dirent : “Ecoutez attentivement”… Puis, quand ce fut terminé, ils retournèrent à leur peuple en avertisseurs . Ils dirent : “Ô notre peuple ! Nous venons d’entendre un Livre qui a été descendu après Moïse, confirmant ce qui l’a précédé. Il guide vers la vérité et vers un chemin droit. Ô notre peuple ! Répondez au prédicateur d’Allah et croyez en lui. Il [Allah] vous pardonnera une partie de vos péchés et vous protégera contre un châtiment douloureux. Et quiconque ne répond pas au prédicateur d’Allah ne saura échapper au pouvoir [d’Allah] sur terre. Et il n’aura pas de protecteurs en dehors de Lui. Ceux- là sont dans un égarement évident.",
    reference: "Sourate 46 versets 29 à 32",
  },
  {
    id: "Sourate 55 versets 33 à 36",
    title: "Sourate 55 versets 33 à 36",
    arabic:
      "يَـٰمَعْشَرَ ٱلْجِنِّ وَٱلْإِنسِ إِنِ ٱسْتَطَعْتُمْ أَن تَنفُذُوا۟ مِنْ أَقْطَارِ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضِ فَٱنفُذُوا۟ ۚ لَا تَنفُذُونَ إِلَّا بِسُلْطَـٰنٍۢ فَبِأَىِّ ءَالَآءِ رَبِّكُمَا تُكَذِّبَانِ يُرْسَلُ عَلَيْكُمَا شُوَاظٌۭ مِّن نَّارٍۢ وَنُحَاسٌۭ فَلَا تَنتَصِرَانِ فَبِأَىِّ ءَالَآءِ رَبِّكُمَا تُكَذِّبَانِ",
    french:
      "Ô peuple de djinns et d’hommes ! si vous pouvez sortir du domaine des cieux et de la Terre, alors faites-le. Mais vous ne pourrez en sortir qu’à l’aide d’un pouvoir [illimité]. Lequel donc des bienfaits de votre Seigneur nierez-vous ? Il sera lancé contre vous un jet de feu et de fumée [ou de cuivre fondu], et vous ne serez pas secourus. Lequel donc des bienfaits de votre Seigneur nierez-vous ?",
    reference: "Sourate 55 versets 33 à 36",
  },
  {
    id: "Sourate 59 versets 21 à 24",
    title: "Sourate 59 versets 21 à 24",
    arabic:
      "لَوْ أَنزَلْنَا هَـٰذَا ٱلْقُرْءَانَ عَلَىٰ جَبَلٍۢ لَّرَأَيْتَهُۥ خَـٰشِعًۭا مُّتَصَدِّعًۭا مِّنْ خَشْيَةِ ٱللَّهِ ۚ وَتِلْكَ ٱلْأَمْثَـٰلُ نَضْرِبُهَا لِلنَّاسِ لَعَلَّهُمْ يَتَفَكَّرُونَ هُوَ ٱللَّهُ ٱلَّذِى لَآ إِلَـٰهَ إِلَّا هُوَ ۖ عَـٰلِمُ ٱلْغَيْبِ وَٱلشَّهَـٰدَةِ ۖ هُوَ ٱلرَّحْمَـٰنُ ٱلرَّحِيمُ هُوَ ٱللَّهُ ٱلَّذِى لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْمَلِكُ ٱلْقُدُّوسُ ٱلسَّلَـٰمُ ٱلْمُؤْمِنُ ٱلْمُهَيْمِنُ ٱلْعَزِيزُ ٱلْجَبَّارُ ٱلْمُتَكَبِّرُ ۚ سُبْحَـٰنَ ٱللَّهِ عَمَّا يُشْرِكُونَ هُوَ ٱللَّهُ ٱلْخَـٰلِقُ ٱلْبَارِئُ ٱلْمُصَوِّرُ ۖ لَهُ ٱلْأَسْمَآءُ ٱلْحُسْنَىٰ ۚ يُسَبِّحُ لَهُۥ مَا فِى ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضِ ۖ وَهُوَ ٱلْعَزِيزُ ٱلْحَكِيمُ",
    french:
      "Si Nous avions fait descendre ce Coran sur une montagne, tu l’aurais vu s’humilier et se fendre par crainte d’Allah. Et ces paraboles Nous les citons aux gens afin qu’ils réfléchissent. C’est Lui Allah. Nulle divinité autre que Lui, le Connaisseur de l’Invisible tout comme du visible. C’est Lui, le Tout Miséricordieux, le Très Miséricordieux. C’est Lui, Allah. Nulle divinité que Lui ; Le Souverain, le Pur, L’Apaisant, Le Rassurant, le Prédominant, Le Tout Puissant, Le Contraignant, L’Orgueilleux. Gloire à Allah! Il transcende ce qu’ils Lui associent. C’est Lui Allah, le Créateur, Celui qui donne un commencement à toute chose, le Formateur. A Lui les plus beaux noms. Tout ce qui est dans les cieux et la Terre Le glorifie. Et c’est Lui le Puissant, le Sage.",
    reference: "Sourate 59 versets 21 à 24",
  },
  {
    id: "Sourate 72 versets 1 à 7",
    title: "Sourate 72 versets 1 à 7",
    arabic:
      "قُلْ أُوحِىَ إِلَىَّ أَنَّهُ ٱسْتَمَعَ نَفَرٌۭ مِّنَ ٱلْجِنِّ فَقَالُوٓا۟ إِنَّا سَمِعْنَا قُرْءَانًا عَجَبًۭا يَهْدِىٓ إِلَى ٱلرُّشْدِ فَـَٔامَنَّا بِهِۦ ۖ وَلَن نُّشْرِكَ بِرَبِّنَآ أَحَدًۭا وَأَنَّهُۥ تَعَـٰلَىٰ جَدُّ رَبِّنَا مَا ٱتَّخَذَ صَـٰحِبَةًۭ وَلَا وَلَدًۭا وَأَنَّهُۥ كَانَ يَقُولُ سَفِيهُنَا عَلَى ٱللَّهِ شَطَطًۭا وَأَنَّا ظَنَنَّآ أَن لَّن تَقُولَ ٱلْإِنسُ وَٱلْجِنُّ عَلَى ٱللَّهِ كَذِبًۭا وَأَنَّهُۥ كَانَ رِجَالٌۭ مِّنَ ٱلْإِنسِ يَعُوذُونَ بِرِجَالٍۢ مِّنَ ٱلْجِنِّ فَزَادُوهُمْ رَهَقًۭا وَأَنَّهُمْ ظَنُّوا۟ كَمَا ظَنَنتُمْ أَن لَّن يَبْعَثَ ٱللَّهُ أَحَدًۭا ٧",
    french:
      "Dis : “Il m’a été révélé qu’un groupe de djinns prêtèrent l’oreille, puis dirent : “Nous avons certes entendu une Lecture [le Coran] merveilleuse, qui guide vers la droiture. Nous y avons cru, et nous n’associerons jamais personne à notre Seigneur. En vérité notre Seigneur – que Sa grandeur soit exaltée – ne S’est donné ni compagne, ni enfant ! Notre insensé [Iblîs] disait des extravagances contre Allah. Et nous pensions que ni les humains ni les djinns ne sauraient jamais proférer de mensonge contre Allah. Or, il y avait parmi les humains, des hommes qui cherchaient protection auprès des hommes parmi les djinns mais cela ne fît qu’accroître leur détresse. Et ils avaient pensé comme vous avez pensé qu’Allah ne ressusciterait jamais personne.",
    reference: "Sourate 72 versets 1 à 7",
  },
];

export default function Roqya() {
  return (
    <main>
      <Link href="/" className="btn">
        ← Accueil
      </Link>

      <h1>Versets de roqya</h1>
      <p style={{ fontSize: "0.9rem", textAlign: "center", marginBottom: "1rem", color: "#666" }}>
        Lecture en arabe pour la roqya, avec traduction française pour la compréhension.
      </p>

      {roqyaVerses.map((v) => (
        <section key={v.id} className="list-item" style={{ marginTop: "0.6rem" }}>
          <h2 style={{ marginBottom: "0.3rem" }}>{v.title}</h2>
          <p
            className="verse"
            style={{ marginBottom: "0.5rem", direction: "rtl", textAlign: "right" }}
          >
            {v.arabic}
          </p>
          <p style={{ fontSize: "0.9rem", marginBottom: "0.3rem" }}>{v.french}</p>
          <p style={{ fontSize: "0.8rem", color: "#777" }}>{v.reference}</p>
        </section>
      ))}
    </main>
  );
}
