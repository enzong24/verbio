export interface VocabWord {
  chinese?: string;
  spanish?: string;
  italian?: string;
  pinyin?: string;
}

export interface ThemeVocabulary {
  Easy: VocabWord[];
  Medium: VocabWord[];
  Hard: VocabWord[];
}

export interface Theme {
  id: string;
  title: string;
  vocabulary: ThemeVocabulary;
}

export const THEMES: Theme[] = [
  {
    id: "travel",
    title: "Travel & Tourism",
    vocabulary: {
      Easy: [
        { chinese: "去", pinyin: "qù", spanish: "ir", italian: "andare" },
        { chinese: "飞机", pinyin: "fēijī", spanish: "avión", italian: "aereo" },
        { chinese: "酒店", pinyin: "jiǔdiàn", spanish: "hotel", italian: "hotel" },
      ],
      Medium: [
        { chinese: "旅行", pinyin: "lǚxíng", spanish: "viajar", italian: "viaggiare" },
        { chinese: "目的地", pinyin: "mùdìdì", spanish: "destino", italian: "destinazione" },
        { chinese: "冒险", pinyin: "màoxiǎn", spanish: "aventura", italian: "avventura" },
        { chinese: "文化", pinyin: "wénhuà", spanish: "cultura", italian: "cultura" },
        { chinese: "护照", pinyin: "hùzhào", spanish: "pasaporte", italian: "passaporto" },
      ],
      Hard: [
        { chinese: "旅游胜地", pinyin: "lǚyóu shèngdì", spanish: "destino turístico", italian: "meta turistica" },
        { chinese: "异国情调", pinyin: "yìguó qíngdiào", spanish: "exótico", italian: "esotico" },
        { chinese: "背包客", pinyin: "bēibāokè", spanish: "mochilero", italian: "zaino in spalla" },
        { chinese: "观光旅游", pinyin: "guānguāng lǚyóu", spanish: "turismo", italian: "turismo" },
        { chinese: "旅游纪念品", pinyin: "lǚyóu jìniànpǐn", spanish: "recuerdo", italian: "souvenir" },
        { chinese: "旅程安排", pinyin: "lǚchéng ānpái", spanish: "itinerario", italian: "itinerario" },
        { chinese: "风景名胜", pinyin: "fēngjǐng míngshèng", spanish: "lugar escénico", italian: "luogo panoramico" },
      ],
    },
  },
  {
    id: "food",
    title: "Food & Dining",
    vocabulary: {
      Easy: [
        { chinese: "吃", pinyin: "chī", spanish: "comer", italian: "mangiare" },
        { chinese: "喝", pinyin: "hē", spanish: "beber", italian: "bere" },
        { chinese: "饭", pinyin: "fàn", spanish: "arroz", italian: "riso" },
      ],
      Medium: [
        { chinese: "美味", pinyin: "měiwèi", spanish: "delicioso", italian: "delizioso" },
        { chinese: "餐厅", pinyin: "cāntīng", spanish: "restaurante", italian: "ristorante" },
        { chinese: "味道", pinyin: "wèidào", spanish: "sabor", italian: "sapore" },
        { chinese: "点菜", pinyin: "diǎncài", spanish: "ordenar", italian: "ordinare" },
        { chinese: "烹饪", pinyin: "pēngrèn", spanish: "cocinar", italian: "cucinare" },
      ],
      Hard: [
        { chinese: "美食家", pinyin: "měishíjiā", spanish: "gastrónomo", italian: "buongustaio" },
        { chinese: "佳肴", pinyin: "jiāyáo", spanish: "manjar", italian: "prelibatezza" },
        { chinese: "饕餮盛宴", pinyin: "tāotiè shèngyàn", spanish: "festín", italian: "banchetto" },
        { chinese: "烹饪技艺", pinyin: "pēngrèn jìyì", spanish: "arte culinario", italian: "arte culinaria" },
        { chinese: "营养均衡", pinyin: "yíngyǎng jūnhéng", spanish: "equilibrio nutricional", italian: "equilibrio nutrizionale" },
        { chinese: "异国料理", pinyin: "yìguó liàolǐ", spanish: "cocina exótica", italian: "cucina esotica" },
        { chinese: "食材新鲜", pinyin: "shícài xīnxiān", spanish: "ingredientes frescos", italian: "ingredienti freschi" },
      ],
    },
  },
  {
    id: "business",
    title: "Business & Work",
    vocabulary: {
      Easy: [
        { chinese: "工作", pinyin: "gōngzuò", spanish: "trabajo", italian: "lavoro" },
        { chinese: "老板", pinyin: "lǎobǎn", spanish: "jefe", italian: "capo" },
        { chinese: "钱", pinyin: "qián", spanish: "dinero", italian: "denaro" },
      ],
      Medium: [
        { chinese: "同事", pinyin: "tóngshì", spanish: "colega", italian: "collega" },
        { chinese: "项目", pinyin: "xiàngmù", spanish: "proyecto", italian: "progetto" },
        { chinese: "会议", pinyin: "huìyì", spanish: "reunión", italian: "riunione" },
        { chinese: "客户", pinyin: "kèhù", spanish: "cliente", italian: "cliente" },
        { chinese: "市场", pinyin: "shìchǎng", spanish: "mercado", italian: "mercato" },
      ],
      Hard: [
        { chinese: "截止日期", pinyin: "jiézhǐ rìqī", spanish: "fecha límite", italian: "scadenza" },
        { chinese: "策略", pinyin: "cèlüè", spanish: "estrategia", italian: "strategia" },
        { chinese: "谈判技巧", pinyin: "tánpàn jìqiǎo", spanish: "habilidades de negociación", italian: "abilità negoziali" },
        { chinese: "商业模式", pinyin: "shāngyè móshì", spanish: "modelo de negocio", italian: "modello di business" },
        { chinese: "投资回报率", pinyin: "tóuzī huíbàolǜ", spanish: "retorno de inversión", italian: "ritorno sull'investimento" },
        { chinese: "企业文化", pinyin: "qǐyè wénhuà", spanish: "cultura empresarial", italian: "cultura aziendale" },
        { chinese: "职业发展", pinyin: "zhíyè fāzhǎn", spanish: "desarrollo profesional", italian: "sviluppo professionale" },
      ],
    },
  },
  {
    id: "family",
    title: "Family & Relationships",
    vocabulary: {
      Easy: [
        { chinese: "爸爸", pinyin: "bàba", spanish: "papá", italian: "papà" },
        { chinese: "妈妈", pinyin: "māma", spanish: "mamá", italian: "mamma" },
        { chinese: "朋友", pinyin: "péngyou", spanish: "amigo", italian: "amico" },
      ],
      Medium: [
        { chinese: "家庭", pinyin: "jiātíng", spanish: "familia", italian: "famiglia" },
        { chinese: "关系", pinyin: "guānxi", spanish: "relación", italian: "relazione" },
        { chinese: "一起", pinyin: "yìqǐ", spanish: "juntos", italian: "insieme" },
        { chinese: "陪伴", pinyin: "péibàn", spanish: "acompañar", italian: "accompagnare" },
        { chinese: "照顾", pinyin: "zhàogù", spanish: "cuidar", italian: "prendersi cura" },
      ],
      Hard: [
        { chinese: "血浓于水", pinyin: "xuè nóng yú shuǐ", spanish: "la sangre tira", italian: "il sangue non è acqua" },
        { chinese: "代沟", pinyin: "dàigōu", spanish: "brecha generacional", italian: "divario generazionale" },
        { chinese: "家族传统", pinyin: "jiāzú chuántǒng", spanish: "tradición familiar", italian: "tradizione familiare" },
        { chinese: "亲密无间", pinyin: "qīnmì wújiān", spanish: "intimidad", italian: "intimità" },
        { chinese: "和睦相处", pinyin: "hémù xiāngchǔ", spanish: "convivencia armoniosa", italian: "convivenza armoniosa" },
        { chinese: "家庭责任", pinyin: "jiātíng zérèn", spanish: "responsabilidad familiar", italian: "responsabilità familiare" },
        { chinese: "代代相传", pinyin: "dài dài xiāngchuán", spanish: "transmitir de generación en generación", italian: "tramandare di generazione in generazione" },
      ],
    },
  },
  {
    id: "technology",
    title: "Technology & Innovation",
    vocabulary: {
      Easy: [
        { chinese: "手机", pinyin: "shǒujī", spanish: "móvil", italian: "cellulare" },
        { chinese: "网", pinyin: "wǎng", spanish: "internet", italian: "internet" },
        { chinese: "游戏", pinyin: "yóuxì", spanish: "juego", italian: "gioco" },
      ],
      Medium: [
        { chinese: "设备", pinyin: "shèbèi", spanish: "dispositivo", italian: "dispositivo" },
        { chinese: "软件", pinyin: "ruǎnjiàn", spanish: "software", italian: "software" },
        { chinese: "创新", pinyin: "chuàngxīn", spanish: "innovación", italian: "innovazione" },
        { chinese: "连接", pinyin: "liánjiē", spanish: "conectar", italian: "connettere" },
        { chinese: "科技", pinyin: "kējì", spanish: "tecnología", italian: "tecnologia" },
      ],
      Hard: [
        { chinese: "人工智能", pinyin: "réngōng zhìnéng", spanish: "inteligencia artificial", italian: "intelligenza artificiale" },
        { chinese: "云计算", pinyin: "yún jìsuàn", spanish: "computación en la nube", italian: "cloud computing" },
        { chinese: "大数据", pinyin: "dà shùjù", spanish: "big data", italian: "big data" },
        { chinese: "虚拟现实", pinyin: "xūnǐ xiànshí", spanish: "realidad virtual", italian: "realtà virtuale" },
        { chinese: "区块链", pinyin: "qūkuàiliàn", spanish: "blockchain", italian: "blockchain" },
        { chinese: "物联网", pinyin: "wùliánwǎng", spanish: "internet de las cosas", italian: "internet delle cose" },
        { chinese: "机器学习", pinyin: "jīqì xuéxí", spanish: "aprendizaje automático", italian: "apprendimento automatico" },
      ],
    },
  },
  {
    id: "health",
    title: "Health & Wellness",
    vocabulary: {
      Easy: [
        { chinese: "病", pinyin: "bìng", spanish: "enfermo", italian: "malato" },
        { chinese: "医生", pinyin: "yīshēng", spanish: "médico", italian: "medico" },
        { chinese: "药", pinyin: "yào", spanish: "medicina", italian: "medicina" },
      ],
      Medium: [
        { chinese: "锻炼", pinyin: "duànliàn", spanish: "ejercitar", italian: "esercitare" },
        { chinese: "营养", pinyin: "yíngyǎng", spanish: "nutrición", italian: "nutrizione" },
        { chinese: "健康", pinyin: "jiànkāng", spanish: "salud", italian: "salute" },
        { chinese: "健身", pinyin: "jiànshēn", spanish: "fitness", italian: "fitness" },
        { chinese: "体检", pinyin: "tǐjiǎn", spanish: "chequeo médico", italian: "visita medica" },
      ],
      Hard: [
        { chinese: "身心健康", pinyin: "shēnxīn jiànkāng", spanish: "salud física y mental", italian: "salute fisica e mentale" },
        { chinese: "预防保健", pinyin: "yùfáng bǎojiàn", spanish: "medicina preventiva", italian: "medicina preventiva" },
        { chinese: "有氧运动", pinyin: "yǒuyǎng yùndòng", spanish: "ejercicio aeróbico", italian: "esercizio aerobico" },
        { chinese: "免疫系统", pinyin: "miǎnyì xìtǒng", spanish: "sistema inmunológico", italian: "sistema immunitario" },
        { chinese: "心理健康", pinyin: "xīnlǐ jiànkāng", spanish: "salud mental", italian: "salute mentale" },
        { chinese: "生活方式", pinyin: "shēnghuó fāngshì", spanish: "estilo de vida", italian: "stile di vita" },
        { chinese: "健康饮食", pinyin: "jiànkāng yǐnshí", spanish: "alimentación saludable", italian: "alimentazione sana" },
      ],
    },
  },
  {
    id: "education",
    title: "Education & Learning",
    vocabulary: {
      Easy: [
        { chinese: "学", pinyin: "xué", spanish: "estudiar", italian: "studiare" },
        { chinese: "书", pinyin: "shū", spanish: "libro", italian: "libro" },
        { chinese: "老师", pinyin: "lǎoshī", spanish: "profesor", italian: "professore" },
      ],
      Medium: [
        { chinese: "知识", pinyin: "zhīshi", spanish: "conocimiento", italian: "conoscenza" },
        { chinese: "学习", pinyin: "xuéxí", spanish: "aprender", italian: "imparare" },
        { chinese: "课程", pinyin: "kèchéng", spanish: "curso", italian: "corso" },
        { chinese: "成绩", pinyin: "chéngjì", spanish: "calificación", italian: "voto" },
        { chinese: "教育", pinyin: "jiàoyù", spanish: "educación", italian: "educazione" },
      ],
      Hard: [
        { chinese: "终身学习", pinyin: "zhōngshēn xuéxí", spanish: "aprendizaje permanente", italian: "apprendimento permanente" },
        { chinese: "批判性思维", pinyin: "pīpàn xìng sīwéi", spanish: "pensamiento crítico", italian: "pensiero critico" },
        { chinese: "学术研究", pinyin: "xuéshù yánjiū", spanish: "investigación académica", italian: "ricerca accademica" },
        { chinese: "教学方法", pinyin: "jiàoxuéfǎ", spanish: "método pedagógico", italian: "metodo pedagogico" },
        { chinese: "认知能力", pinyin: "rènzhī nénglì", spanish: "capacidad cognitiva", italian: "capacità cognitiva" },
        { chinese: "教育体系", pinyin: "jiàoyù tǐxì", spanish: "sistema educativo", italian: "sistema educativo" },
        { chinese: "学以致用", pinyin: "xué yǐ zhì yòng", spanish: "aplicar lo aprendido", italian: "applicare ciò che si è appreso" },
      ],
    },
  },
  {
    id: "entertainment",
    title: "Entertainment & Hobbies",
    vocabulary: {
      Easy: [
        { chinese: "玩", pinyin: "wán", spanish: "jugar", italian: "giocare" },
        { chinese: "看", pinyin: "kàn", spanish: "ver", italian: "guardare" },
        { chinese: "电影", pinyin: "diànyǐng", spanish: "película", italian: "film" },
      ],
      Medium: [
        { chinese: "娱乐", pinyin: "yúlè", spanish: "entretenimiento", italian: "intrattenimento" },
        { chinese: "爱好", pinyin: "àihào", spanish: "pasatiempo", italian: "hobby" },
        { chinese: "兴趣", pinyin: "xìngqù", spanish: "interés", italian: "interesse" },
        { chinese: "演出", pinyin: "yǎnchū", spanish: "espectáculo", italian: "spettacolo" },
        { chinese: "摄影", pinyin: "shèyǐng", spanish: "fotografía", italian: "fotografia" },
      ],
      Hard: [
        { chinese: "艺术鉴赏", pinyin: "yìshù jiànshǎng", spanish: "apreciación artística", italian: "apprezzamento artistico" },
        { chinese: "文化活动", pinyin: "wénhuà huódòng", spanish: "actividad cultural", italian: "attività culturale" },
        { chinese: "创意表达", pinyin: "chuàngyì biǎodá", spanish: "expresión creativa", italian: "espressione creativa" },
        { chinese: "休闲娱乐", pinyin: "xiūxián yúlè", spanish: "ocio y entretenimiento", italian: "svago e intrattenimento" },
        { chinese: "精神寄托", pinyin: "jīngshén jìtuō", spanish: "refugio espiritual", italian: "rifugio spirituale" },
        { chinese: "业余爱好", pinyin: "yèyú àihào", spanish: "afición amateur", italian: "hobby amatoriale" },
        { chinese: "艺术修养", pinyin: "yìshù xiūyǎng", spanish: "cultura artística", italian: "cultura artistica" },
      ],
    },
  },
  {
    id: "nature",
    title: "Nature & Environment",
    vocabulary: {
      Easy: [
        { chinese: "花", pinyin: "huā", spanish: "flor", italian: "fiore" },
        { chinese: "树", pinyin: "shù", spanish: "árbol", italian: "albero" },
        { chinese: "山", pinyin: "shān", spanish: "montaña", italian: "montagna" },
      ],
      Medium: [
        { chinese: "环境", pinyin: "huánjìng", spanish: "medio ambiente", italian: "ambiente" },
        { chinese: "自然", pinyin: "zìrán", spanish: "naturaleza", italian: "natura" },
        { chinese: "保护", pinyin: "bǎohù", spanish: "proteger", italian: "proteggere" },
        { chinese: "污染", pinyin: "wūrǎn", spanish: "contaminación", italian: "inquinamento" },
        { chinese: "森林", pinyin: "sēnlín", spanish: "bosque", italian: "foresta" },
      ],
      Hard: [
        { chinese: "生态系统", pinyin: "shēngtài xìtǒng", spanish: "ecosistema", italian: "ecosistema" },
        { chinese: "可持续发展", pinyin: "kě chíxù fāzhǎn", spanish: "desarrollo sostenible", italian: "sviluppo sostenibile" },
        { chinese: "生物多样性", pinyin: "shēngwù duōyàng xìng", spanish: "biodiversidad", italian: "biodiversità" },
        { chinese: "环境保护", pinyin: "huánjìng bǎohù", spanish: "protección ambiental", italian: "protezione ambientale" },
        { chinese: "气候变化", pinyin: "qìhòu biànhuà", spanish: "cambio climático", italian: "cambiamento climatico" },
        { chinese: "自然资源", pinyin: "zìrán zīyuán", spanish: "recursos naturales", italian: "risorse naturali" },
        { chinese: "绿色环保", pinyin: "lǜsè huánbǎo", spanish: "ecológico", italian: "ecologico" },
      ],
    },
  },
  {
    id: "shopping",
    title: "Shopping & Fashion",
    vocabulary: {
      Easy: [
        { chinese: "买", pinyin: "mǎi", spanish: "comprar", italian: "comprare" },
        { chinese: "衣服", pinyin: "yīfu", spanish: "ropa", italian: "vestiti" },
        { chinese: "钱", pinyin: "qián", spanish: "dinero", italian: "denaro" },
      ],
      Medium: [
        { chinese: "购物", pinyin: "gòuwù", spanish: "compras", italian: "shopping" },
        { chinese: "时尚", pinyin: "shíshàng", spanish: "moda", italian: "moda" },
        { chinese: "品牌", pinyin: "pǐnpái", spanish: "marca", italian: "marca" },
        { chinese: "打折", pinyin: "dǎzhé", spanish: "descuento", italian: "sconto" },
        { chinese: "质量", pinyin: "zhìliàng", spanish: "calidad", italian: "qualità" },
      ],
      Hard: [
        { chinese: "消费行为", pinyin: "xiāofèi xíngwéi", spanish: "comportamiento de consumo", italian: "comportamento di consumo" },
        { chinese: "时尚潮流", pinyin: "shíshàng cháoliú", spanish: "tendencia de moda", italian: "tendenza della moda" },
        { chinese: "性价比", pinyin: "xìngjiàbǐ", spanish: "relación calidad-precio", italian: "rapporto qualità-prezzo" },
        { chinese: "奢侈品", pinyin: "shēchǐpǐn", spanish: "artículos de lujo", italian: "articoli di lusso" },
        { chinese: "购物体验", pinyin: "gòuwù tǐyàn", spanish: "experiencia de compra", italian: "esperienza di acquisto" },
        { chinese: "品味审美", pinyin: "pǐnwèi shěnměi", spanish: "gusto estético", italian: "gusto estetico" },
        { chinese: "个性风格", pinyin: "gèxìng fēnggé", spanish: "estilo personal", italian: "stile personale" },
      ],
    },
  },
  {
    id: "sports",
    title: "Sports & Fitness",
    vocabulary: {
      Easy: [
        { chinese: "球", pinyin: "qiú", spanish: "pelota", italian: "palla" },
        { chinese: "跑", pinyin: "pǎo", spanish: "correr", italian: "correre" },
        { chinese: "比赛", pinyin: "bǐsài", spanish: "competencia", italian: "gara" },
      ],
      Medium: [
        { chinese: "运动员", pinyin: "yùndòngyuán", spanish: "atleta", italian: "atleta" },
        { chinese: "训练", pinyin: "xùnliàn", spanish: "entrenar", italian: "allenare" },
        { chinese: "团队", pinyin: "tuánduì", spanish: "equipo", italian: "squadra" },
        { chinese: "冠军", pinyin: "guànjūn", spanish: "campeón", italian: "campione" },
        { chinese: "体育", pinyin: "tǐyù", spanish: "deporte", italian: "sport" },
      ],
      Hard: [
        { chinese: "竞技精神", pinyin: "jìngjì jīngshén", spanish: "espíritu competitivo", italian: "spirito competitivo" },
        { chinese: "体能训练", pinyin: "tǐnéng xùnliàn", spanish: "entrenamiento físico", italian: "allenamento fisico" },
        { chinese: "运动损伤", pinyin: "yùndòng sǔnshāng", spanish: "lesión deportiva", italian: "infortunio sportivo" },
        { chinese: "职业体育", pinyin: "zhíyè tǐyù", spanish: "deporte profesional", italian: "sport professionistico" },
        { chinese: "体育精神", pinyin: "tǐyù jīngshén", spanish: "espíritu deportivo", italian: "spirito sportivo" },
        { chinese: "竞赛规则", pinyin: "jìngsài guīzé", spanish: "reglas de competencia", italian: "regole di gara" },
        { chinese: "团队协作", pinyin: "tuánduì xiézuò", spanish: "trabajo en equipo", italian: "lavoro di squadra" },
      ],
    },
  },
  {
    id: "weather",
    title: "Weather & Seasons",
    vocabulary: {
      Easy: [
        { chinese: "热", pinyin: "rè", spanish: "calor", italian: "caldo" },
        { chinese: "冷", pinyin: "lěng", spanish: "frío", italian: "freddo" },
        { chinese: "雨", pinyin: "yǔ", spanish: "lluvia", italian: "pioggia" },
      ],
      Medium: [
        { chinese: "季节", pinyin: "jìjié", spanish: "estación", italian: "stagione" },
        { chinese: "温度", pinyin: "wēndù", spanish: "temperatura", italian: "temperatura" },
        { chinese: "预报", pinyin: "yùbào", spanish: "pronóstico", italian: "previsione" },
        { chinese: "晴朗", pinyin: "qínglǎng", spanish: "despejado", italian: "sereno" },
        { chinese: "潮湿", pinyin: "cháoshī", spanish: "húmedo", italian: "umido" },
      ],
      Hard: [
        { chinese: "气象变化", pinyin: "qìxiàng biànhuà", spanish: "cambios meteorológicos", italian: "cambiamenti meteorologici" },
        { chinese: "极端天气", pinyin: "jíduān tiānqì", spanish: "clima extremo", italian: "clima estremo" },
        { chinese: "季节性特征", pinyin: "jìjié xìng tèzhēng", spanish: "características estacionales", italian: "caratteristiche stagionali" },
        { chinese: "气候适应", pinyin: "qìhòu shìyìng", spanish: "adaptación climática", italian: "adattamento climatico" },
        { chinese: "天气现象", pinyin: "tiānqì xiànxiàng", spanish: "fenómeno meteorológico", italian: "fenomeno meteorologico" },
        { chinese: "降水量", pinyin: "jiàngshuǐliàng", spanish: "precipitación", italian: "precipitazione" },
        { chinese: "四季分明", pinyin: "sìjì fēnmíng", spanish: "cuatro estaciones distintas", italian: "quattro stagioni distinte" },
      ],
    },
  },
  {
    id: "social",
    title: "Social Life & Communication",
    vocabulary: {
      Easy: [
        { chinese: "说", pinyin: "shuō", spanish: "hablar", italian: "parlare" },
        { chinese: "听", pinyin: "tīng", spanish: "escuchar", italian: "ascoltare" },
        { chinese: "见面", pinyin: "jiànmiàn", spanish: "encontrarse", italian: "incontrarsi" },
      ],
      Medium: [
        { chinese: "交流", pinyin: "jiāoliú", spanish: "comunicar", italian: "comunicare" },
        { chinese: "社交", pinyin: "shèjiāo", spanish: "socializar", italian: "socializzare" },
        { chinese: "聚会", pinyin: "jùhuì", spanish: "reunión", italian: "festa" },
        { chinese: "分享", pinyin: "fēnxiǎng", spanish: "compartir", italian: "condividere" },
        { chinese: "表达", pinyin: "biǎodá", spanish: "expresar", italian: "esprimere" },
      ],
      Hard: [
        { chinese: "人际关系", pinyin: "rénjì guānxi", spanish: "relaciones interpersonales", italian: "relazioni interpersonali" },
        { chinese: "社交礼仪", pinyin: "shèjiāo lǐyí", spanish: "etiqueta social", italian: "etichetta sociale" },
        { chinese: "沟通技巧", pinyin: "gōutōng jìqiǎo", spanish: "habilidades de comunicación", italian: "abilità comunicative" },
        { chinese: "情感表达", pinyin: "qínggǎn biǎodá", spanish: "expresión emocional", italian: "espressione emotiva" },
        { chinese: "社会交往", pinyin: "shèhuì jiāowǎng", spanish: "interacción social", italian: "interazione sociale" },
        { chinese: "文化差异", pinyin: "wénhuà chāyì", spanish: "diferencias culturales", italian: "differenze culturali" },
        { chinese: "换位思考", pinyin: "huànwèi sīkǎo", spanish: "ponerse en el lugar del otro", italian: "mettersi nei panni dell'altro" },
      ],
    },
  },
];

export function getThemeVocabulary(themeId: string, difficulty: "Easy" | "Medium" | "Hard", language: "Chinese" | "Spanish" | "Italian"): string[] {
  const theme = THEMES.find(t => t.id === themeId);
  if (!theme) return [];

  const vocabWords = theme.vocabulary[difficulty];
  
  if (language === "Chinese") {
    return vocabWords.map(w => w.chinese || "").filter(Boolean);
  } else if (language === "Spanish") {
    return vocabWords.map(w => w.spanish || "").filter(Boolean);
  } else if (language === "Italian") {
    return vocabWords.map(w => w.italian || "").filter(Boolean);
  }
  
  return [];
}

export function getThemeTitle(themeId: string): string {
  const theme = THEMES.find(t => t.id === themeId);
  return theme?.title || "";
}
