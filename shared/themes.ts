export interface VocabWord {
  chinese?: string;
  spanish?: string;
  italian?: string;
  pinyin?: string;
  english?: string;
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
        { chinese: "去", pinyin: "qù", spanish: "ir", italian: "andare", english: "go" },
        { chinese: "飞机", pinyin: "fēijī", spanish: "avión", italian: "aereo", english: "airplane" },
        { chinese: "酒店", pinyin: "jiǔdiàn", spanish: "hotel", italian: "hotel", english: "hotel" },
      ],
      Medium: [
        { chinese: "旅行", pinyin: "lǚxíng", spanish: "viajar", italian: "viaggiare", english: "travel" },
        { chinese: "目的地", pinyin: "mùdìdì", spanish: "destino", italian: "destinazione", english: "destination" },
        { chinese: "冒险", pinyin: "màoxiǎn", spanish: "aventura", italian: "avventura", english: "adventure" },
        { chinese: "文化", pinyin: "wénhuà", spanish: "cultura", italian: "cultura", english: "culture" },
        { chinese: "护照", pinyin: "hùzhào", spanish: "pasaporte", italian: "passaporto", english: "passport" },
      ],
      Hard: [
        { chinese: "旅游胜地", pinyin: "lǚyóu shèngdì", spanish: "destino turístico", italian: "meta turistica", english: "tourist destination" },
        { chinese: "异国情调", pinyin: "yìguó qíngdiào", spanish: "exótico", italian: "esotico", english: "exotic" },
        { chinese: "背包客", pinyin: "bēibāokè", spanish: "mochilero", italian: "zaino in spalla", english: "backpacker" },
        { chinese: "观光旅游", pinyin: "guānguāng lǚyóu", spanish: "turismo", italian: "turismo", english: "sightseeing" },
        { chinese: "旅游纪念品", pinyin: "lǚyóu jìniànpǐn", spanish: "recuerdo", italian: "souvenir", english: "souvenir" },
        { chinese: "旅程安排", pinyin: "lǚchéng ānpái", spanish: "itinerario", italian: "itinerario", english: "itinerary" },
        { chinese: "风景名胜", pinyin: "fēngjǐng míngshèng", spanish: "lugar escénico", italian: "luogo panoramico", english: "scenic spot" },
      ],
    },
  },
  {
    id: "food",
    title: "Food & Dining",
    vocabulary: {
      Easy: [
        { chinese: "吃", pinyin: "chī", spanish: "comer", italian: "mangiare", english: "eat" },
        { chinese: "喝", pinyin: "hē", spanish: "beber", italian: "bere", english: "drink" },
        { chinese: "饭", pinyin: "fàn", spanish: "arroz", italian: "riso", english: "rice/meal" },
      ],
      Medium: [
        { chinese: "美味", pinyin: "měiwèi", spanish: "delicioso", italian: "delizioso", english: "delicious" },
        { chinese: "餐厅", pinyin: "cāntīng", spanish: "restaurante", italian: "ristorante", english: "restaurant" },
        { chinese: "味道", pinyin: "wèidào", spanish: "sabor", italian: "sapore", english: "taste/flavor" },
        { chinese: "点菜", pinyin: "diǎncài", spanish: "ordenar", italian: "ordinare", english: "order food" },
        { chinese: "烹饪", pinyin: "pēngrèn", spanish: "cocinar", italian: "cucinare", english: "cooking" },
      ],
      Hard: [
        { chinese: "美食家", pinyin: "měishíjiā", spanish: "gastrónomo", italian: "buongustaio", english: "gourmet" },
        { chinese: "佳肴", pinyin: "jiāyáo", spanish: "manjar", italian: "prelibatezza", english: "delicacy" },
        { chinese: "饕餮盛宴", pinyin: "tāotiè shèngyàn", spanish: "festín", italian: "banchetto", english: "feast" },
        { chinese: "烹饪技艺", pinyin: "pēngrèn jìyì", spanish: "arte culinario", italian: "arte culinaria", english: "culinary art" },
        { chinese: "营养均衡", pinyin: "yíngyǎng jūnhéng", spanish: "equilibrio nutricional", italian: "equilibrio nutrizionale", english: "nutritional balance" },
        { chinese: "异国料理", pinyin: "yìguó liàolǐ", spanish: "cocina exótica", italian: "cucina esotica", english: "exotic cuisine" },
        { chinese: "食材新鲜", pinyin: "shícài xīnxiān", spanish: "ingredientes frescos", italian: "ingredienti freschi", english: "fresh ingredients" },
      ],
    },
  },
  {
    id: "business",
    title: "Business & Work",
    vocabulary: {
      Easy: [
        { chinese: "工作", pinyin: "gōngzuò", spanish: "trabajo", italian: "lavoro", english: "work" },
        { chinese: "老板", pinyin: "lǎobǎn", spanish: "jefe", italian: "capo", english: "boss" },
        { chinese: "钱", pinyin: "qián", spanish: "dinero", italian: "denaro", english: "money" },
      ],
      Medium: [
        { chinese: "同事", pinyin: "tóngshì", spanish: "colega", italian: "collega", english: "colleague" },
        { chinese: "项目", pinyin: "xiàngmù", spanish: "proyecto", italian: "progetto", english: "project" },
        { chinese: "会议", pinyin: "huìyì", spanish: "reunión", italian: "riunione", english: "meeting" },
        { chinese: "客户", pinyin: "kèhù", spanish: "cliente", italian: "cliente", english: "client" },
        { chinese: "市场", pinyin: "shìchǎng", spanish: "mercado", italian: "mercato", english: "market" },
      ],
      Hard: [
        { chinese: "截止日期", pinyin: "jiézhǐ rìqī", spanish: "fecha límite", italian: "scadenza", english: "deadline" },
        { chinese: "策略", pinyin: "cèlüè", spanish: "estrategia", italian: "strategia", english: "strategy" },
        { chinese: "谈判技巧", pinyin: "tánpàn jìqiǎo", spanish: "habilidades de negociación", italian: "abilità negoziali", english: "negotiation skills" },
        { chinese: "商业模式", pinyin: "shāngyè móshì", spanish: "modelo de negocio", italian: "modello di business", english: "business model" },
        { chinese: "投资回报率", pinyin: "tóuzī huíbàolǜ", spanish: "retorno de inversión", italian: "ritorno sull'investimento", english: "ROI" },
        { chinese: "企业文化", pinyin: "qǐyè wénhuà", spanish: "cultura empresarial", italian: "cultura aziendale", english: "corporate culture" },
        { chinese: "职业发展", pinyin: "zhíyè fāzhǎn", spanish: "desarrollo profesional", italian: "sviluppo professionale", english: "career development" },
      ],
    },
  },
  {
    id: "family",
    title: "Family & Relationships",
    vocabulary: {
      Easy: [
        { chinese: "爸爸", pinyin: "bàba", spanish: "papá", italian: "papà", english: "dad" },
        { chinese: "妈妈", pinyin: "māma", spanish: "mamá", italian: "mamma", english: "mom" },
        { chinese: "朋友", pinyin: "péngyou", spanish: "amigo", italian: "amico", english: "friend" },
      ],
      Medium: [
        { chinese: "家庭", pinyin: "jiātíng", spanish: "familia", italian: "famiglia", english: "family" },
        { chinese: "关系", pinyin: "guānxi", spanish: "relación", italian: "relazione", english: "relationship" },
        { chinese: "一起", pinyin: "yìqǐ", spanish: "juntos", italian: "insieme", english: "together" },
        { chinese: "陪伴", pinyin: "péibàn", spanish: "acompañar", italian: "accompagnare", english: "accompany" },
        { chinese: "照顾", pinyin: "zhàogù", spanish: "cuidar", italian: "prendersi cura", english: "take care of" },
      ],
      Hard: [
        { chinese: "血浓于水", pinyin: "xuè nóng yú shuǐ", spanish: "la sangre tira", italian: "il sangue non è acqua", english: "blood is thicker than water" },
        { chinese: "代沟", pinyin: "dàigōu", spanish: "brecha generacional", italian: "divario generazionale", english: "generation gap" },
        { chinese: "家族传统", pinyin: "jiāzú chuántǒng", spanish: "tradición familiar", italian: "tradizione familiare", english: "family tradition" },
        { chinese: "亲密无间", pinyin: "qīnmì wújiān", spanish: "intimidad", italian: "intimità", english: "intimacy" },
        { chinese: "和睦相处", pinyin: "hémù xiāngchǔ", spanish: "convivencia armoniosa", italian: "convivenza armoniosa", english: "harmonious coexistence" },
        { chinese: "家庭责任", pinyin: "jiātíng zérèn", spanish: "responsabilidad familiar", italian: "responsabilità familiare", english: "family responsibility" },
        { chinese: "代代相传", pinyin: "dài dài xiāngchuán", spanish: "transmitir de generación en generación", italian: "tramandare di generazione in generazione", english: "pass down through generations" },
      ],
    },
  },
  {
    id: "technology",
    title: "Technology & Innovation",
    vocabulary: {
      Easy: [
        { chinese: "手机", pinyin: "shǒujī", spanish: "móvil", italian: "cellulare", english: "phone" },
        { chinese: "网", pinyin: "wǎng", spanish: "internet", italian: "internet", english: "internet" },
        { chinese: "游戏", pinyin: "yóuxì", spanish: "juego", italian: "gioco", english: "game" },
      ],
      Medium: [
        { chinese: "设备", pinyin: "shèbèi", spanish: "dispositivo", italian: "dispositivo", english: "device" },
        { chinese: "软件", pinyin: "ruǎnjiàn", spanish: "software", italian: "software", english: "software" },
        { chinese: "创新", pinyin: "chuàngxīn", spanish: "innovación", italian: "innovazione", english: "innovation" },
        { chinese: "连接", pinyin: "liánjiē", spanish: "conectar", italian: "connettere", english: "connect" },
        { chinese: "科技", pinyin: "kējì", spanish: "tecnología", italian: "tecnologia", english: "technology" },
      ],
      Hard: [
        { chinese: "人工智能", pinyin: "réngōng zhìnéng", spanish: "inteligencia artificial", italian: "intelligenza artificiale", english: "artificial intelligence" },
        { chinese: "云计算", pinyin: "yún jìsuàn", spanish: "computación en la nube", italian: "cloud computing", english: "cloud computing" },
        { chinese: "大数据", pinyin: "dà shùjù", spanish: "big data", italian: "big data", english: "big data" },
        { chinese: "虚拟现实", pinyin: "xūnǐ xiànshí", spanish: "realidad virtual", italian: "realtà virtuale", english: "virtual reality" },
        { chinese: "区块链", pinyin: "qūkuàiliàn", spanish: "blockchain", italian: "blockchain", english: "blockchain" },
        { chinese: "物联网", pinyin: "wùliánwǎng", spanish: "internet de las cosas", italian: "internet delle cose", english: "Internet of Things" },
        { chinese: "机器学习", pinyin: "jīqì xuéxí", spanish: "aprendizaje automático", italian: "apprendimento automatico", english: "machine learning" },
      ],
    },
  },
  {
    id: "health",
    title: "Health & Wellness",
    vocabulary: {
      Easy: [
        { chinese: "病", pinyin: "bìng", spanish: "enfermo", italian: "malato", english: "sick" },
        { chinese: "医生", pinyin: "yīshēng", spanish: "médico", italian: "medico", english: "doctor" },
        { chinese: "药", pinyin: "yào", spanish: "medicina", italian: "medicina", english: "medicine" },
      ],
      Medium: [
        { chinese: "锻炼", pinyin: "duànliàn", spanish: "ejercitar", italian: "esercitare", english: "exercise" },
        { chinese: "营养", pinyin: "yíngyǎng", spanish: "nutrición", italian: "nutrizione", english: "nutrition" },
        { chinese: "健康", pinyin: "jiànkāng", spanish: "salud", italian: "salute", english: "health" },
        { chinese: "健身", pinyin: "jiànshēn", spanish: "fitness", italian: "fitness", english: "fitness" },
        { chinese: "体检", pinyin: "tǐjiǎn", spanish: "chequeo médico", italian: "visita medica", english: "medical checkup" },
      ],
      Hard: [
        { chinese: "身心健康", pinyin: "shēnxīn jiànkāng", spanish: "salud física y mental", italian: "salute fisica e mentale", english: "physical and mental health" },
        { chinese: "预防保健", pinyin: "yùfáng bǎojiàn", spanish: "medicina preventiva", italian: "medicina preventiva", english: "preventive healthcare" },
        { chinese: "有氧运动", pinyin: "yǒuyǎng yùndòng", spanish: "ejercicio aeróbico", italian: "esercizio aerobico", english: "aerobic exercise" },
        { chinese: "免疫系统", pinyin: "miǎnyì xìtǒng", spanish: "sistema inmunológico", italian: "sistema immunitario", english: "immune system" },
        { chinese: "心理健康", pinyin: "xīnlǐ jiànkāng", spanish: "salud mental", italian: "salute mentale", english: "mental health" },
        { chinese: "生活方式", pinyin: "shēnghuó fāngshì", spanish: "estilo de vida", italian: "stile di vita", english: "lifestyle" },
        { chinese: "健康饮食", pinyin: "jiànkāng yǐnshí", spanish: "alimentación saludable", italian: "alimentazione sana", english: "healthy diet" },
      ],
    },
  },
  {
    id: "education",
    title: "Education & Learning",
    vocabulary: {
      Easy: [
        { chinese: "学", pinyin: "xué", spanish: "estudiar", italian: "studiare", english: "study" },
        { chinese: "书", pinyin: "shū", spanish: "libro", italian: "libro", english: "book" },
        { chinese: "老师", pinyin: "lǎoshī", spanish: "profesor", italian: "professore", english: "teacher" },
      ],
      Medium: [
        { chinese: "知识", pinyin: "zhīshi", spanish: "conocimiento", italian: "conoscenza", english: "knowledge" },
        { chinese: "学习", pinyin: "xuéxí", spanish: "aprender", italian: "imparare", english: "learn" },
        { chinese: "课程", pinyin: "kèchéng", spanish: "curso", italian: "corso", english: "course" },
        { chinese: "成绩", pinyin: "chéngjì", spanish: "calificación", italian: "voto", english: "grade" },
        { chinese: "教育", pinyin: "jiàoyù", spanish: "educación", italian: "educazione", english: "education" },
      ],
      Hard: [
        { chinese: "终身学习", pinyin: "zhōngshēn xuéxí", spanish: "aprendizaje permanente", italian: "apprendimento permanente", english: "lifelong learning" },
        { chinese: "批判性思维", pinyin: "pīpàn xìng sīwéi", spanish: "pensamiento crítico", italian: "pensiero critico", english: "critical thinking" },
        { chinese: "学术研究", pinyin: "xuéshù yánjiū", spanish: "investigación académica", italian: "ricerca accademica", english: "academic research" },
        { chinese: "教学方法", pinyin: "jiàoxuéfǎ", spanish: "método pedagógico", italian: "metodo pedagogico", english: "teaching method" },
        { chinese: "认知能力", pinyin: "rènzhī nénglì", spanish: "capacidad cognitiva", italian: "capacità cognitiva", english: "cognitive ability" },
        { chinese: "教育体系", pinyin: "jiàoyù tǐxì", spanish: "sistema educativo", italian: "sistema educativo", english: "education system" },
        { chinese: "学以致用", pinyin: "xué yǐ zhì yòng", spanish: "aplicar lo aprendido", italian: "applicare ciò che si è appreso", english: "apply what you learn" },
      ],
    },
  },
  {
    id: "entertainment",
    title: "Entertainment & Hobbies",
    vocabulary: {
      Easy: [
        { chinese: "玩", pinyin: "wán", spanish: "jugar", italian: "giocare", english: "play" },
        { chinese: "看", pinyin: "kàn", spanish: "ver", italian: "guardare", english: "watch" },
        { chinese: "电影", pinyin: "diànyǐng", spanish: "película", italian: "film", english: "movie" },
      ],
      Medium: [
        { chinese: "娱乐", pinyin: "yúlè", spanish: "entretenimiento", italian: "intrattenimento", english: "entertainment" },
        { chinese: "爱好", pinyin: "àihào", spanish: "pasatiempo", italian: "hobby", english: "hobby" },
        { chinese: "兴趣", pinyin: "xìngqù", spanish: "interés", italian: "interesse", english: "interest" },
        { chinese: "演出", pinyin: "yǎnchū", spanish: "espectáculo", italian: "spettacolo", english: "performance" },
        { chinese: "摄影", pinyin: "shèyǐng", spanish: "fotografía", italian: "fotografia", english: "photography" },
      ],
      Hard: [
        { chinese: "艺术鉴赏", pinyin: "yìshù jiànshǎng", spanish: "apreciación artística", italian: "apprezzamento artistico", english: "art appreciation" },
        { chinese: "文化活动", pinyin: "wénhuà huódòng", spanish: "actividad cultural", italian: "attività culturale", english: "cultural activity" },
        { chinese: "创意表达", pinyin: "chuàngyì biǎodá", spanish: "expresión creativa", italian: "espressione creativa", english: "creative expression" },
        { chinese: "休闲娱乐", pinyin: "xiūxián yúlè", spanish: "ocio y entretenimiento", italian: "svago e intrattenimento", english: "leisure and entertainment" },
        { chinese: "精神寄托", pinyin: "jīngshén jìtuō", spanish: "refugio espiritual", italian: "rifugio spirituale", english: "spiritual sustenance" },
        { chinese: "业余爱好", pinyin: "yèyú àihào", spanish: "afición amateur", italian: "hobby amatoriale", english: "amateur hobby" },
        { chinese: "艺术修养", pinyin: "yìshù xiūyǎng", spanish: "cultura artística", italian: "cultura artistica", english: "artistic cultivation" },
      ],
    },
  },
  {
    id: "nature",
    title: "Nature & Environment",
    vocabulary: {
      Easy: [
        { chinese: "花", pinyin: "huā", spanish: "flor", italian: "fiore", english: "flower" },
        { chinese: "树", pinyin: "shù", spanish: "árbol", italian: "albero", english: "tree" },
        { chinese: "山", pinyin: "shān", spanish: "montaña", italian: "montagna", english: "mountain" },
      ],
      Medium: [
        { chinese: "环境", pinyin: "huánjìng", spanish: "medio ambiente", italian: "ambiente", english: "environment" },
        { chinese: "自然", pinyin: "zìrán", spanish: "naturaleza", italian: "natura", english: "nature" },
        { chinese: "保护", pinyin: "bǎohù", spanish: "proteger", italian: "proteggere", english: "protect" },
        { chinese: "污染", pinyin: "wūrǎn", spanish: "contaminación", italian: "inquinamento", english: "pollution" },
        { chinese: "森林", pinyin: "sēnlín", spanish: "bosque", italian: "foresta", english: "forest" },
      ],
      Hard: [
        { chinese: "生态系统", pinyin: "shēngtài xìtǒng", spanish: "ecosistema", italian: "ecosistema", english: "ecosystem" },
        { chinese: "可持续发展", pinyin: "kě chíxù fāzhǎn", spanish: "desarrollo sostenible", italian: "sviluppo sostenibile", english: "sustainable development" },
        { chinese: "生物多样性", pinyin: "shēngwù duōyàng xìng", spanish: "biodiversidad", italian: "biodiversità", english: "biodiversity" },
        { chinese: "环境保护", pinyin: "huánjìng bǎohù", spanish: "protección ambiental", italian: "protezione ambientale", english: "environmental protection" },
        { chinese: "气候变化", pinyin: "qìhòu biànhuà", spanish: "cambio climático", italian: "cambiamento climatico", english: "climate change" },
        { chinese: "自然资源", pinyin: "zìrán zīyuán", spanish: "recursos naturales", italian: "risorse naturali", english: "natural resources" },
        { chinese: "绿色环保", pinyin: "lǜsè huánbǎo", spanish: "ecológico", italian: "ecologico", english: "eco-friendly" },
      ],
    },
  },
  {
    id: "shopping",
    title: "Shopping & Fashion",
    vocabulary: {
      Easy: [
        { chinese: "买", pinyin: "mǎi", spanish: "comprar", italian: "comprare", english: "buy" },
        { chinese: "衣服", pinyin: "yīfu", spanish: "ropa", italian: "vestiti", english: "clothes" },
        { chinese: "钱", pinyin: "qián", spanish: "dinero", italian: "denaro", english: "money" },
      ],
      Medium: [
        { chinese: "购物", pinyin: "gòuwù", spanish: "compras", italian: "shopping", english: "shopping" },
        { chinese: "时尚", pinyin: "shíshàng", spanish: "moda", italian: "moda", english: "fashion" },
        { chinese: "品牌", pinyin: "pǐnpái", spanish: "marca", italian: "marca", english: "brand" },
        { chinese: "打折", pinyin: "dǎzhé", spanish: "descuento", italian: "sconto", english: "discount" },
        { chinese: "质量", pinyin: "zhìliàng", spanish: "calidad", italian: "qualità", english: "quality" },
      ],
      Hard: [
        { chinese: "消费行为", pinyin: "xiāofèi xíngwéi", spanish: "comportamiento de consumo", italian: "comportamento di consumo", english: "consumer behavior" },
        { chinese: "时尚潮流", pinyin: "shíshàng cháoliú", spanish: "tendencia de moda", italian: "tendenza della moda", english: "fashion trend" },
        { chinese: "性价比", pinyin: "xìngjiàbǐ", spanish: "relación calidad-precio", italian: "rapporto qualità-prezzo", english: "value for money" },
        { chinese: "奢侈品", pinyin: "shēchǐpǐn", spanish: "artículos de lujo", italian: "articoli di lusso", english: "luxury goods" },
        { chinese: "购物体验", pinyin: "gòuwù tǐyàn", spanish: "experiencia de compra", italian: "esperienza di acquisto", english: "shopping experience" },
        { chinese: "品味审美", pinyin: "pǐnwèi shěnměi", spanish: "gusto estético", italian: "gusto estetico", english: "aesthetic taste" },
        { chinese: "个性风格", pinyin: "gèxìng fēnggé", spanish: "estilo personal", italian: "stile personale", english: "personal style" },
      ],
    },
  },
  {
    id: "sports",
    title: "Sports & Fitness",
    vocabulary: {
      Easy: [
        { chinese: "球", pinyin: "qiú", spanish: "pelota", italian: "palla", english: "ball" },
        { chinese: "跑", pinyin: "pǎo", spanish: "correr", italian: "correre", english: "run" },
        { chinese: "比赛", pinyin: "bǐsài", spanish: "competencia", italian: "gara", english: "competition" },
      ],
      Medium: [
        { chinese: "运动员", pinyin: "yùndòngyuán", spanish: "atleta", italian: "atleta", english: "athlete" },
        { chinese: "训练", pinyin: "xùnliàn", spanish: "entrenar", italian: "allenare", english: "train" },
        { chinese: "团队", pinyin: "tuánduì", spanish: "equipo", italian: "squadra", english: "team" },
        { chinese: "冠军", pinyin: "guànjūn", spanish: "campeón", italian: "campione", english: "champion" },
        { chinese: "体育", pinyin: "tǐyù", spanish: "deporte", italian: "sport", english: "sports" },
      ],
      Hard: [
        { chinese: "竞技精神", pinyin: "jìngjì jīngshén", spanish: "espíritu competitivo", italian: "spirito competitivo", english: "competitive spirit" },
        { chinese: "体能训练", pinyin: "tǐnéng xùnliàn", spanish: "entrenamiento físico", italian: "allenamento fisico", english: "physical training" },
        { chinese: "运动损伤", pinyin: "yùndòng sǔnshāng", spanish: "lesión deportiva", italian: "infortunio sportivo", english: "sports injury" },
        { chinese: "职业体育", pinyin: "zhíyè tǐyù", spanish: "deporte profesional", italian: "sport professionistico", english: "professional sports" },
        { chinese: "体育精神", pinyin: "tǐyù jīngshén", spanish: "espíritu deportivo", italian: "spirito sportivo", english: "sportsmanship" },
        { chinese: "竞赛规则", pinyin: "jìngsài guīzé", spanish: "reglas de competencia", italian: "regole di gara", english: "competition rules" },
        { chinese: "团队协作", pinyin: "tuánduì xiézuò", spanish: "trabajo en equipo", italian: "lavoro di squadra", english: "teamwork" },
      ],
    },
  },
  {
    id: "weather",
    title: "Weather & Seasons",
    vocabulary: {
      Easy: [
        { chinese: "热", pinyin: "rè", spanish: "calor", italian: "caldo", english: "hot" },
        { chinese: "冷", pinyin: "lěng", spanish: "frío", italian: "freddo", english: "cold" },
        { chinese: "雨", pinyin: "yǔ", spanish: "lluvia", italian: "pioggia", english: "rain" },
      ],
      Medium: [
        { chinese: "季节", pinyin: "jìjié", spanish: "estación", italian: "stagione", english: "season" },
        { chinese: "温度", pinyin: "wēndù", spanish: "temperatura", italian: "temperatura", english: "temperature" },
        { chinese: "预报", pinyin: "yùbào", spanish: "pronóstico", italian: "previsione", english: "forecast" },
        { chinese: "晴朗", pinyin: "qínglǎng", spanish: "despejado", italian: "sereno", english: "clear" },
        { chinese: "潮湿", pinyin: "cháoshī", spanish: "húmedo", italian: "umido", english: "humid" },
      ],
      Hard: [
        { chinese: "气象变化", pinyin: "qìxiàng biànhuà", spanish: "cambios meteorológicos", italian: "cambiamenti meteorologici", english: "meteorological changes" },
        { chinese: "极端天气", pinyin: "jíduān tiānqì", spanish: "clima extremo", italian: "clima estremo", english: "extreme weather" },
        { chinese: "季节性特征", pinyin: "jìjié xìng tèzhēng", spanish: "características estacionales", italian: "caratteristiche stagionali", english: "seasonal characteristics" },
        { chinese: "气候适应", pinyin: "qìhòu shìyìng", spanish: "adaptación climática", italian: "adattamento climatico", english: "climate adaptation" },
        { chinese: "天气现象", pinyin: "tiānqì xiànxiàng", spanish: "fenómeno meteorológico", italian: "fenomeno meteorologico", english: "weather phenomenon" },
        { chinese: "降水量", pinyin: "jiàngshuǐliàng", spanish: "precipitación", italian: "precipitazione", english: "precipitation" },
        { chinese: "四季分明", pinyin: "sìjì fēnmíng", spanish: "cuatro estaciones distintas", italian: "quattro stagioni distinte", english: "four distinct seasons" },
      ],
    },
  },
  {
    id: "social",
    title: "Social Life & Communication",
    vocabulary: {
      Easy: [
        { chinese: "说", pinyin: "shuō", spanish: "hablar", italian: "parlare", english: "speak" },
        { chinese: "听", pinyin: "tīng", spanish: "escuchar", italian: "ascoltare", english: "listen" },
        { chinese: "见面", pinyin: "jiànmiàn", spanish: "encontrarse", italian: "incontrarsi", english: "meet" },
      ],
      Medium: [
        { chinese: "交流", pinyin: "jiāoliú", spanish: "comunicar", italian: "comunicare", english: "communicate" },
        { chinese: "社交", pinyin: "shèjiāo", spanish: "socializar", italian: "socializzare", english: "socialize" },
        { chinese: "聚会", pinyin: "jùhuì", spanish: "reunión", italian: "festa", english: "gathering" },
        { chinese: "分享", pinyin: "fēnxiǎng", spanish: "compartir", italian: "condividere", english: "share" },
        { chinese: "表达", pinyin: "biǎodá", spanish: "expresar", italian: "esprimere", english: "express" },
      ],
      Hard: [
        { chinese: "人际关系", pinyin: "rénjì guānxi", spanish: "relaciones interpersonales", italian: "relazioni interpersonali", english: "interpersonal relationships" },
        { chinese: "社交礼仪", pinyin: "shèjiāo lǐyí", spanish: "etiqueta social", italian: "etichetta sociale", english: "social etiquette" },
        { chinese: "沟通技巧", pinyin: "gōutōng jìqiǎo", spanish: "habilidades de comunicación", italian: "abilità comunicative", english: "communication skills" },
        { chinese: "情感表达", pinyin: "qínggǎn biǎodá", spanish: "expresión emocional", italian: "espressione emotiva", english: "emotional expression" },
        { chinese: "社会交往", pinyin: "shèhuì jiāowǎng", spanish: "interacción social", italian: "interazione sociale", english: "social interaction" },
        { chinese: "文化差异", pinyin: "wénhuà chāyì", spanish: "diferencias culturales", italian: "differenze culturali", english: "cultural differences" },
        { chinese: "换位思考", pinyin: "huànwèi sīkǎo", spanish: "ponerse en el lugar del otro", italian: "mettersi nei panni dell'altro", english: "empathy" },
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
