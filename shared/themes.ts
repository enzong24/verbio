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
        { chinese: "好", pinyin: "hǎo", spanish: "bueno", italian: "buono", english: "good/OK" },
        { chinese: "车", pinyin: "chē", spanish: "coche", italian: "macchina", english: "car/vehicle" },
      ],
      Medium: [
        { chinese: "去", pinyin: "qù", spanish: "ir", italian: "andare", english: "go" },
        { chinese: "飞机", pinyin: "fēijī", spanish: "avión", italian: "aereo", english: "airplane" },
        { chinese: "酒店", pinyin: "jiǔdiàn", spanish: "hotel", italian: "hotel", english: "hotel" },
      ],
      Hard: [
        { chinese: "旅行", pinyin: "lǚxíng", spanish: "viajar", italian: "viaggiare", english: "travel" },
        { chinese: "目的地", pinyin: "mùdìdì", spanish: "destino", italian: "destinazione", english: "destination" },
        { chinese: "冒险", pinyin: "màoxiǎn", spanish: "aventura", italian: "avventura", english: "adventure" },
        { chinese: "文化", pinyin: "wénhuà", spanish: "cultura", italian: "cultura", english: "culture" },
        { chinese: "护照", pinyin: "hùzhào", spanish: "pasaporte", italian: "passaporto", english: "passport" },
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
        { chinese: "水", pinyin: "shuǐ", spanish: "agua", italian: "acqua", english: "water" },
        { chinese: "肉", pinyin: "ròu", spanish: "carne", italian: "carne", english: "meat" },
        { chinese: "菜", pinyin: "cài", spanish: "verdura", italian: "verdura", english: "vegetable/dish" },
      ],
      Medium: [
        { chinese: "吃", pinyin: "chī", spanish: "comer", italian: "mangiare", english: "eat" },
        { chinese: "喝", pinyin: "hē", spanish: "beber", italian: "bere", english: "drink" },
        { chinese: "饭", pinyin: "fàn", spanish: "arroz", italian: "riso", english: "rice/meal" },
        { chinese: "美味", pinyin: "měiwèi", spanish: "delicioso", italian: "delizioso", english: "delicious" },
        { chinese: "饿", pinyin: "è", spanish: "hambriento", italian: "affamato", english: "hungry" },
      ],
      Hard: [
        { chinese: "餐厅", pinyin: "cāntīng", spanish: "restaurante", italian: "ristorante", english: "restaurant" },
        { chinese: "味道", pinyin: "wèidào", spanish: "sabor", italian: "sapore", english: "taste/flavor" },
        { chinese: "点菜", pinyin: "diǎncài", spanish: "ordenar", italian: "ordinare", english: "order food" },
        { chinese: "烹饪", pinyin: "pēngrèn", spanish: "cocinar", italian: "cucinare", english: "cooking" },
        { chinese: "美食家", pinyin: "měishíjiā", spanish: "gastrónomo", italian: "buongustaio", english: "gourmet" },
        { chinese: "佳肴", pinyin: "jiāyáo", spanish: "manjar", italian: "prelibatezza", english: "delicacy" },
        { chinese: "烹饪技艺", pinyin: "pēngrèn jìyì", spanish: "arte culinario", italian: "arte culinaria", english: "culinary art" },
        { chinese: "营养均衡", pinyin: "yíngyǎng jūnhéng", spanish: "equilibrio nutricional", italian: "equilibrio nutrizionale", english: "nutritional balance" },
      ],
    },
  },
  {
    id: "business",
    title: "Business & Work",
    vocabulary: {
      Easy: [
        { chinese: "人", pinyin: "rén", spanish: "persona", italian: "persona", english: "person" },
        { chinese: "做", pinyin: "zuò", spanish: "hacer", italian: "fare", english: "do/make" },
        { chinese: "买", pinyin: "mǎi", spanish: "comprar", italian: "comprare", english: "buy" },
      ],
      Medium: [
        { chinese: "工作", pinyin: "gōngzuò", spanish: "trabajo", italian: "lavoro", english: "work" },
        { chinese: "老板", pinyin: "lǎobǎn", spanish: "jefe", italian: "capo", english: "boss" },
        { chinese: "钱", pinyin: "qián", spanish: "dinero", italian: "denaro", english: "money" },
      ],
      Hard: [
        { chinese: "同事", pinyin: "tóngshì", spanish: "colega", italian: "collega", english: "colleague" },
        { chinese: "项目", pinyin: "xiàngmù", spanish: "proyecto", italian: "progetto", english: "project" },
        { chinese: "会议", pinyin: "huìyì", spanish: "reunión", italian: "riunione", english: "meeting" },
        { chinese: "客户", pinyin: "kèhù", spanish: "cliente", italian: "cliente", english: "client" },
        { chinese: "市场", pinyin: "shìchǎng", spanish: "mercado", italian: "mercato", english: "market" },
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
        { chinese: "我", pinyin: "wǒ", spanish: "yo", italian: "io", english: "I/me" },
        { chinese: "你", pinyin: "nǐ", spanish: "tú", italian: "tu", english: "you" },
        { chinese: "他", pinyin: "tā", spanish: "él", italian: "lui", english: "he/him" },
      ],
      Medium: [
        { chinese: "爸爸", pinyin: "bàba", spanish: "papá", italian: "papà", english: "dad" },
        { chinese: "妈妈", pinyin: "māma", spanish: "mamá", italian: "mamma", english: "mom" },
        { chinese: "朋友", pinyin: "péngyou", spanish: "amigo", italian: "amico", english: "friend" },
      ],
      Hard: [
        { chinese: "家庭", pinyin: "jiātíng", spanish: "familia", italian: "famiglia", english: "family" },
        { chinese: "关系", pinyin: "guānxi", spanish: "relación", italian: "relazione", english: "relationship" },
        { chinese: "一起", pinyin: "yìqǐ", spanish: "juntos", italian: "insieme", english: "together" },
        { chinese: "陪伴", pinyin: "péibàn", spanish: "acompañar", italian: "accompagnare", english: "accompany" },
        { chinese: "照顾", pinyin: "zhàogù", spanish: "cuidar", italian: "prendersi cura", english: "take care of" },
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
        { chinese: "看", pinyin: "kàn", spanish: "ver", italian: "guardare", english: "look/watch" },
        { chinese: "用", pinyin: "yòng", spanish: "usar", italian: "usare", english: "use" },
        { chinese: "电脑", pinyin: "diànnǎo", spanish: "computadora", italian: "computer", english: "computer" },
      ],
      Medium: [
        { chinese: "手机", pinyin: "shǒujī", spanish: "móvil", italian: "cellulare", english: "phone" },
        { chinese: "网", pinyin: "wǎng", spanish: "internet", italian: "internet", english: "internet" },
        { chinese: "游戏", pinyin: "yóuxì", spanish: "juego", italian: "gioco", english: "game" },
      ],
      Hard: [
        { chinese: "设备", pinyin: "shèbèi", spanish: "dispositivo", italian: "dispositivo", english: "device" },
        { chinese: "软件", pinyin: "ruǎnjiàn", spanish: "software", italian: "software", english: "software" },
        { chinese: "创新", pinyin: "chuàngxīn", spanish: "innovación", italian: "innovazione", english: "innovation" },
        { chinese: "连接", pinyin: "liánjiē", spanish: "conectar", italian: "connettere", english: "connect" },
        { chinese: "科技", pinyin: "kējì", spanish: "tecnología", italian: "tecnologia", english: "technology" },
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
        { chinese: "好", pinyin: "hǎo", spanish: "bien", italian: "bene", english: "good/well" },
        { chinese: "累", pinyin: "lèi", spanish: "cansado", italian: "stanco", english: "tired" },
        { chinese: "疼", pinyin: "téng", spanish: "dolor", italian: "dolore", english: "pain/hurt" },
      ],
      Medium: [
        { chinese: "病", pinyin: "bìng", spanish: "enfermo", italian: "malato", english: "sick" },
        { chinese: "医生", pinyin: "yīshēng", spanish: "médico", italian: "medico", english: "doctor" },
        { chinese: "药", pinyin: "yào", spanish: "medicina", italian: "medicina", english: "medicine" },
      ],
      Hard: [
        { chinese: "锻炼", pinyin: "duànliàn", spanish: "ejercitar", italian: "esercitare", english: "exercise" },
        { chinese: "营养", pinyin: "yíngyǎng", spanish: "nutrición", italian: "nutrizione", english: "nutrition" },
        { chinese: "健康", pinyin: "jiànkāng", spanish: "salud", italian: "salute", english: "health" },
        { chinese: "健身", pinyin: "jiànshēn", spanish: "fitness", italian: "fitness", english: "fitness" },
        { chinese: "体检", pinyin: "tǐjiǎn", spanish: "chequeo médico", italian: "visita medica", english: "medical checkup" },
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
        { chinese: "写", pinyin: "xiě", spanish: "escribir", italian: "scrivere", english: "write" },
        { chinese: "读", pinyin: "dú", spanish: "leer", italian: "leggere", english: "read" },
        { chinese: "学", pinyin: "xué", spanish: "estudiar", italian: "studiare", english: "study" },
      ],
      Medium: [
        { chinese: "学", pinyin: "xué", spanish: "estudiar", italian: "studiare", english: "study" },
        { chinese: "书", pinyin: "shū", spanish: "libro", italian: "libro", english: "book" },
        { chinese: "老师", pinyin: "lǎoshī", spanish: "profesor", italian: "professore", english: "teacher" },
      ],
      Hard: [
        { chinese: "知识", pinyin: "zhīshi", spanish: "conocimiento", italian: "conoscenza", english: "knowledge" },
        { chinese: "学习", pinyin: "xuéxí", spanish: "aprender", italian: "imparare", english: "learn" },
        { chinese: "课程", pinyin: "kèchéng", spanish: "curso", italian: "corso", english: "course" },
        { chinese: "成绩", pinyin: "chéngjì", spanish: "calificación", italian: "voto", english: "grade" },
        { chinese: "教育", pinyin: "jiàoyù", spanish: "educación", italian: "educazione", english: "education" },
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
        { chinese: "听", pinyin: "tīng", spanish: "escuchar", italian: "ascoltare", english: "listen" },
        { chinese: "唱", pinyin: "chàng", spanish: "cantar", italian: "cantare", english: "sing" },
      ],
      Medium: [
        { chinese: "玩", pinyin: "wán", spanish: "jugar", italian: "giocare", english: "play" },
        { chinese: "看", pinyin: "kàn", spanish: "ver", italian: "guardare", english: "watch" },
        { chinese: "电影", pinyin: "diànyǐng", spanish: "película", italian: "film", english: "movie" },
      ],
      Hard: [
        { chinese: "娱乐", pinyin: "yúlè", spanish: "entretenimiento", italian: "intrattenimento", english: "entertainment" },
        { chinese: "爱好", pinyin: "àihào", spanish: "pasatiempo", italian: "hobby", english: "hobby" },
        { chinese: "兴趣", pinyin: "xìngqù", spanish: "interés", italian: "interesse", english: "interest" },
        { chinese: "演出", pinyin: "yǎnchū", spanish: "espectáculo", italian: "spettacolo", english: "performance" },
        { chinese: "摄影", pinyin: "shèyǐng", spanish: "fotografía", italian: "fotografia", english: "photography" },
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
        { chinese: "天", pinyin: "tiān", spanish: "cielo", italian: "cielo", english: "sky/day" },
        { chinese: "水", pinyin: "shuǐ", spanish: "agua", italian: "acqua", english: "water" },
        { chinese: "风", pinyin: "fēng", spanish: "viento", italian: "vento", english: "wind" },
      ],
      Medium: [
        { chinese: "花", pinyin: "huā", spanish: "flor", italian: "fiore", english: "flower" },
        { chinese: "树", pinyin: "shù", spanish: "árbol", italian: "albero", english: "tree" },
        { chinese: "山", pinyin: "shān", spanish: "montaña", italian: "montagna", english: "mountain" },
      ],
      Hard: [
        { chinese: "环境", pinyin: "huánjìng", spanish: "medio ambiente", italian: "ambiente", english: "environment" },
        { chinese: "自然", pinyin: "zìrán", spanish: "naturaleza", italian: "natura", english: "nature" },
        { chinese: "保护", pinyin: "bǎohù", spanish: "proteger", italian: "proteggere", english: "protect" },
        { chinese: "污染", pinyin: "wūrǎn", spanish: "contaminación", italian: "inquinamento", english: "pollution" },
        { chinese: "森林", pinyin: "sēnlín", spanish: "bosque", italian: "foresta", english: "forest" },
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
        { chinese: "卖", pinyin: "mài", spanish: "vender", italian: "vendere", english: "sell" },
        { chinese: "贵", pinyin: "guì", spanish: "caro", italian: "costoso", english: "expensive" },
      ],
      Medium: [
        { chinese: "买", pinyin: "mǎi", spanish: "comprar", italian: "comprare", english: "buy" },
        { chinese: "衣服", pinyin: "yīfu", spanish: "ropa", italian: "vestiti", english: "clothes" },
        { chinese: "钱", pinyin: "qián", spanish: "dinero", italian: "denaro", english: "money" },
      ],
      Hard: [
        { chinese: "购物", pinyin: "gòuwù", spanish: "compras", italian: "shopping", english: "shopping" },
        { chinese: "时尚", pinyin: "shíshàng", spanish: "moda", italian: "moda", english: "fashion" },
        { chinese: "品牌", pinyin: "pǐnpái", spanish: "marca", italian: "marca", english: "brand" },
        { chinese: "打折", pinyin: "dǎzhé", spanish: "descuento", italian: "sconto", english: "discount" },
        { chinese: "质量", pinyin: "zhìliàng", spanish: "calidad", italian: "qualità", english: "quality" },
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
        { chinese: "跑", pinyin: "pǎo", spanish: "correr", italian: "correre", english: "run" },
        { chinese: "跳", pinyin: "tiào", spanish: "saltar", italian: "saltare", english: "jump" },
        { chinese: "赢", pinyin: "yíng", spanish: "ganar", italian: "vincere", english: "win" },
      ],
      Medium: [
        { chinese: "球", pinyin: "qiú", spanish: "pelota", italian: "palla", english: "ball" },
        { chinese: "跑", pinyin: "pǎo", spanish: "correr", italian: "correre", english: "run" },
        { chinese: "比赛", pinyin: "bǐsài", spanish: "competencia", italian: "gara", english: "competition" },
      ],
      Hard: [
        { chinese: "运动员", pinyin: "yùndòngyuán", spanish: "atleta", italian: "atleta", english: "athlete" },
        { chinese: "训练", pinyin: "xùnliàn", spanish: "entrenar", italian: "allenare", english: "train" },
        { chinese: "团队", pinyin: "tuánduì", spanish: "equipo", italian: "squadra", english: "team" },
        { chinese: "冠军", pinyin: "guànjūn", spanish: "campeón", italian: "campione", english: "champion" },
        { chinese: "体育", pinyin: "tǐyù", spanish: "deporte", italian: "sport", english: "sports" },
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
        { chinese: "天", pinyin: "tiān", spanish: "día", italian: "giorno", english: "day/sky" },
        { chinese: "风", pinyin: "fēng", spanish: "viento", italian: "vento", english: "wind" },
        { chinese: "雪", pinyin: "xuě", spanish: "nieve", italian: "neve", english: "snow" },
      ],
      Medium: [
        { chinese: "热", pinyin: "rè", spanish: "calor", italian: "caldo", english: "hot" },
        { chinese: "冷", pinyin: "lěng", spanish: "frío", italian: "freddo", english: "cold" },
        { chinese: "雨", pinyin: "yǔ", spanish: "lluvia", italian: "pioggia", english: "rain" },
      ],
      Hard: [
        { chinese: "季节", pinyin: "jìjié", spanish: "estación", italian: "stagione", english: "season" },
        { chinese: "温度", pinyin: "wēndù", spanish: "temperatura", italian: "temperatura", english: "temperature" },
        { chinese: "预报", pinyin: "yùbào", spanish: "pronóstico", italian: "previsione", english: "forecast" },
        { chinese: "晴朗", pinyin: "qínglǎng", spanish: "despejado", italian: "sereno", english: "clear" },
        { chinese: "潮湿", pinyin: "cháoshī", spanish: "húmedo", italian: "umido", english: "humid" },
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
        { chinese: "看", pinyin: "kàn", spanish: "ver", italian: "guardare", english: "see/look" },
      ],
      Medium: [
        { chinese: "说", pinyin: "shuō", spanish: "hablar", italian: "parlare", english: "speak" },
        { chinese: "听", pinyin: "tīng", spanish: "escuchar", italian: "ascoltare", english: "listen" },
        { chinese: "见面", pinyin: "jiànmiàn", spanish: "encontrarse", italian: "incontrarsi", english: "meet" },
      ],
      Hard: [
        { chinese: "交流", pinyin: "jiāoliú", spanish: "comunicar", italian: "comunicare", english: "communicate" },
        { chinese: "社交", pinyin: "shèjiāo", spanish: "socializar", italian: "socializzare", english: "socialize" },
        { chinese: "聚会", pinyin: "jùhuì", spanish: "reunión", italian: "festa", english: "gathering" },
        { chinese: "分享", pinyin: "fēnxiǎng", spanish: "compartir", italian: "condividere", english: "share" },
        { chinese: "表达", pinyin: "biǎodá", spanish: "expresar", italian: "esprimere", english: "express" },
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
  {
    id: "music",
    title: "Music & Arts",
    vocabulary: {
      Easy: [
        { chinese: "歌", pinyin: "gē", spanish: "canción", italian: "canzone", english: "song" },
        { chinese: "跳", pinyin: "tiào", spanish: "bailar", italian: "ballare", english: "dance/jump" },
        { chinese: "画", pinyin: "huà", spanish: "pintar", italian: "dipingere", english: "paint/draw" },
      ],
      Medium: [
        { chinese: "音乐", pinyin: "yīnyuè", spanish: "música", italian: "musica", english: "music" },
        { chinese: "唱歌", pinyin: "chànggē", spanish: "cantar", italian: "cantare", english: "sing" },
        { chinese: "跳舞", pinyin: "tiàowǔ", spanish: "bailar", italian: "ballare", english: "dance" },
        { chinese: "画画", pinyin: "huàhuà", spanish: "dibujar", italian: "disegnare", english: "draw" },
        { chinese: "艺术", pinyin: "yìshù", spanish: "arte", italian: "arte", english: "art" },
      ],
      Hard: [
        { chinese: "演奏", pinyin: "yǎnzòu", spanish: "tocar", italian: "suonare", english: "perform/play instrument" },
        { chinese: "乐器", pinyin: "yuèqì", spanish: "instrumento", italian: "strumento", english: "musical instrument" },
        { chinese: "旋律", pinyin: "xuánlǜ", spanish: "melodía", italian: "melodia", english: "melody" },
        { chinese: "节奏", pinyin: "jiézòu", spanish: "ritmo", italian: "ritmo", english: "rhythm" },
        { chinese: "创作", pinyin: "chuàngzuò", spanish: "crear", italian: "creare", english: "create" },
        { chinese: "艺术表现", pinyin: "yìshù biǎoxiàn", spanish: "expresión artística", italian: "espressione artistica", english: "artistic expression" },
        { chinese: "音乐天赋", pinyin: "yīnyuè tiānfù", spanish: "talento musical", italian: "talento musicale", english: "musical talent" },
        { chinese: "创意灵感", pinyin: "chuàngyì línggǎn", spanish: "inspiración creativa", italian: "ispirazione creativa", english: "creative inspiration" },
      ],
    },
  },
  {
    id: "hobbies",
    title: "Hobbies & Leisure",
    vocabulary: {
      Easy: [
        { chinese: "玩", pinyin: "wán", spanish: "jugar", italian: "giocare", english: "play" },
        { chinese: "书", pinyin: "shū", spanish: "libro", italian: "libro", english: "book" },
        { chinese: "走", pinyin: "zǒu", spanish: "caminar", italian: "camminare", english: "walk" },
      ],
      Medium: [
        { chinese: "看书", pinyin: "kànshū", spanish: "leer", italian: "leggere", english: "read" },
        { chinese: "游戏", pinyin: "yóuxì", spanish: "juego", italian: "gioco", english: "game" },
        { chinese: "散步", pinyin: "sànbù", spanish: "pasear", italian: "passeggiare", english: "take a walk" },
        { chinese: "爱好", pinyin: "àihào", spanish: "pasatiempo", italian: "hobby", english: "hobby" },
        { chinese: "休闲", pinyin: "xiūxián", spanish: "ocio", italian: "svago", english: "leisure" },
      ],
      Hard: [
        { chinese: "兴趣爱好", pinyin: "xìngqù àihào", spanish: "interés", italian: "interesse", english: "interest/hobby" },
        { chinese: "收藏", pinyin: "shōucáng", spanish: "coleccionar", italian: "collezionare", english: "collect" },
        { chinese: "摄影", pinyin: "shèyǐng", spanish: "fotografía", italian: "fotografia", english: "photography" },
        { chinese: "园艺", pinyin: "yuányì", spanish: "jardinería", italian: "giardinaggio", english: "gardening" },
        { chinese: "手工制作", pinyin: "shǒugōng zhìzuò", spanish: "artesanía", italian: "artigianato", english: "handicraft" },
        { chinese: "业余时间", pinyin: "yèyú shíjiān", spanish: "tiempo libre", italian: "tempo libero", english: "spare time" },
        { chinese: "放松心情", pinyin: "fàngsōng xīnqíng", spanish: "relajarse", italian: "rilassarsi", english: "relax" },
        { chinese: "陶冶情操", pinyin: "táoyě qíngcāo", spanish: "cultivar el espíritu", italian: "coltivare lo spirito", english: "cultivate character" },
      ],
    },
  },
  {
    id: "home",
    title: "Home & Daily Life",
    vocabulary: {
      Easy: [
        { chinese: "家", pinyin: "jiā", spanish: "casa", italian: "casa", english: "home" },
        { chinese: "睡", pinyin: "shuì", spanish: "dormir", italian: "dormire", english: "sleep" },
        { chinese: "吃", pinyin: "chī", spanish: "comer", italian: "mangiare", english: "eat" },
      ],
      Medium: [
        { chinese: "房间", pinyin: "fángjiān", spanish: "habitación", italian: "stanza", english: "room" },
        { chinese: "打扫", pinyin: "dǎsǎo", spanish: "limpiar", italian: "pulire", english: "clean" },
        { chinese: "睡觉", pinyin: "shuìjiào", spanish: "dormir", italian: "dormire", english: "sleep" },
        { chinese: "起床", pinyin: "qǐchuáng", spanish: "levantarse", italian: "alzarsi", english: "get up" },
        { chinese: "洗澡", pinyin: "xǐzǎo", spanish: "bañarse", italian: "fare il bagno", english: "take a bath" },
      ],
      Hard: [
        { chinese: "家务", pinyin: "jiāwù", spanish: "quehaceres domésticos", italian: "faccende domestiche", english: "housework" },
        { chinese: "装修", pinyin: "zhuāngxiū", spanish: "decorar", italian: "ristrutturare", english: "decorate/renovate" },
        { chinese: "家居", pinyin: "jiājū", spanish: "muebles", italian: "arredamento", english: "home furnishing" },
        { chinese: "整理", pinyin: "zhěnglǐ", spanish: "ordenar", italian: "ordinare", english: "organize" },
        { chinese: "生活习惯", pinyin: "shēnghuó xíguàn", spanish: "hábitos de vida", italian: "abitudini di vita", english: "lifestyle habits" },
        { chinese: "家庭氛围", pinyin: "jiātíng fēnwéi", spanish: "ambiente familiar", italian: "atmosfera familiare", english: "family atmosphere" },
        { chinese: "居住环境", pinyin: "jūzhù huánjìng", spanish: "entorno de vida", italian: "ambiente abitativo", english: "living environment" },
        { chinese: "日常起居", pinyin: "rìcháng qǐjū", spanish: "rutina diaria", italian: "routine quotidiana", english: "daily routine" },
      ],
    },
  },
  {
    id: "transportation",
    title: "Transportation & Commute",
    vocabulary: {
      Easy: [
        { chinese: "车", pinyin: "chē", spanish: "coche", italian: "macchina", english: "car/vehicle" },
        { chinese: "坐", pinyin: "zuò", spanish: "sentarse", italian: "sedersi", english: "sit/take (transport)" },
        { chinese: "站", pinyin: "zhàn", spanish: "parada", italian: "fermata", english: "station/stop" },
      ],
      Medium: [
        { chinese: "公交", pinyin: "gōngjiāo", spanish: "autobús", italian: "autobus", english: "bus" },
        { chinese: "地铁", pinyin: "dìtiě", spanish: "metro", italian: "metropolitana", english: "subway" },
        { chinese: "骑车", pinyin: "qíchē", spanish: "andar en bicicleta", italian: "andare in bicicleta", english: "ride bike" },
        { chinese: "开车", pinyin: "kāichē", spanish: "conducir", italian: "guidare", english: "drive" },
        { chinese: "交通", pinyin: "jiāotōng", spanish: "tráfico", italian: "traffico", english: "traffic" },
      ],
      Hard: [
        { chinese: "通勤", pinyin: "tōngqín", spanish: "ir al trabajo", italian: "pendolare", english: "commute" },
        { chinese: "拥堵", pinyin: "yōngdǔ", spanish: "congestión", italian: "congestione", english: "traffic jam" },
        { chinese: "路线", pinyin: "lùxiàn", spanish: "ruta", italian: "percorso", english: "route" },
        { chinese: "换乘", pinyin: "huànchéng", spanish: "transbordo", italian: "trasferimento", english: "transfer" },
        { chinese: "交通工具", pinyin: "jiāotōng gōngjù", spanish: "medio de transporte", italian: "mezzo di trasporto", english: "means of transport" },
        { chinese: "出行方式", pinyin: "chūxíng fāngshì", spanish: "modo de viaje", italian: "modo di viaggio", english: "mode of travel" },
        { chinese: "高峰时段", pinyin: "gāofēng shíduàn", spanish: "hora pico", italian: "ora di punta", english: "rush hour" },
        { chinese: "公共交通", pinyin: "gōnggòng jiāotōng", spanish: "transporte público", italian: "trasporto pubblico", english: "public transport" },
      ],
    },
  },
  {
    id: "animals",
    title: "Animals & Pets",
    vocabulary: {
      Easy: [
        { chinese: "狗", pinyin: "gǒu", spanish: "perro", italian: "cane", english: "dog" },
        { chinese: "猫", pinyin: "māo", spanish: "gato", italian: "gatto", english: "cat" },
        { chinese: "鸟", pinyin: "niǎo", spanish: "pájaro", italian: "uccello", english: "bird" },
      ],
      Medium: [
        { chinese: "宠物", pinyin: "chǒngwù", spanish: "mascota", italian: "animale domestico", english: "pet" },
        { chinese: "养", pinyin: "yǎng", spanish: "criar", italian: "allevare", english: "raise/keep" },
        { chinese: "动物", pinyin: "dòngwù", spanish: "animal", italian: "animale", english: "animal" },
        { chinese: "可爱", pinyin: "kě'ài", spanish: "lindo", italian: "carino", english: "cute" },
        { chinese: "喂养", pinyin: "wèiyǎng", spanish: "alimentar", italian: "nutrire", english: "feed" },
      ],
      Hard: [
        { chinese: "驯养", pinyin: "xùnyǎng", spanish: "domesticar", italian: "addomesticare", english: "domesticate" },
        { chinese: "野生动物", pinyin: "yěshēng dòngwù", spanish: "animal salvaje", italian: "animale selvatico", english: "wild animal" },
        { chinese: "保护动物", pinyin: "bǎohù dòngwù", spanish: "proteger animales", italian: "proteggere animali", english: "protect animals" },
        { chinese: "动物习性", pinyin: "dòngwù xíxìng", spanish: "comportamiento animal", italian: "comportamento animale", english: "animal behavior" },
        { chinese: "生态平衡", pinyin: "shēngtài pínghéng", spanish: "equilibrio ecológico", italian: "equilibrio ecologico", english: "ecological balance" },
        { chinese: "濒危物种", pinyin: "bīnwēi wùzhǒng", spanish: "especie en peligro", italian: "specie in pericolo", english: "endangered species" },
        { chinese: "动物福利", pinyin: "dòngwù fúlì", spanish: "bienestar animal", italian: "benessere animale", english: "animal welfare" },
        { chinese: "人与自然", pinyin: "rén yǔ zìrán", spanish: "hombre y naturaleza", italian: "uomo e natura", english: "humans and nature" },
      ],
    },
  },
  {
    id: "clothing",
    title: "Clothing & Fashion",
    vocabulary: {
      Easy: [
        { chinese: "衣", pinyin: "yī", spanish: "ropa", italian: "vestiti", english: "clothes" },
        { chinese: "穿", pinyin: "chuān", spanish: "llevar", italian: "indossare", english: "wear" },
        { chinese: "鞋", pinyin: "xié", spanish: "zapatos", italian: "scarpe", english: "shoes" },
      ],
      Medium: [
        { chinese: "衣服", pinyin: "yīfu", spanish: "ropa", italian: "vestiti", english: "clothes" },
        { chinese: "裤子", pinyin: "kùzi", spanish: "pantalones", italian: "pantaloni", english: "pants" },
        { chinese: "裙子", pinyin: "qúnzi", spanish: "falda", italian: "gonna", english: "skirt" },
        { chinese: "颜色", pinyin: "yánsè", spanish: "color", italian: "colore", english: "color" },
        { chinese: "时尚", pinyin: "shíshàng", spanish: "moda", italian: "moda", english: "fashion" },
      ],
      Hard: [
        { chinese: "搭配", pinyin: "dāpèi", spanish: "combinar", italian: "abbinare", english: "match/coordinate" },
        { chinese: "款式", pinyin: "kuǎnshì", spanish: "estilo", italian: "stile", english: "style/design" },
        { chinese: "品味", pinyin: "pǐnwèi", spanish: "gusto", italian: "gusto", english: "taste" },
        { chinese: "时尚潮流", pinyin: "shíshàng cháoliú", spanish: "tendencia de moda", italian: "tendenza moda", english: "fashion trend" },
        { chinese: "服装设计", pinyin: "fúzhuāng shèjì", spanish: "diseño de moda", italian: "design di moda", english: "fashion design" },
        { chinese: "穿衣风格", pinyin: "chuānyī fēnggé", spanish: "estilo de vestir", italian: "stile di abbigliamento", english: "dressing style" },
        { chinese: "个人形象", pinyin: "gèrén xíngxiàng", spanish: "imagen personal", italian: "immagine personale", english: "personal image" },
        { chinese: "审美观念", pinyin: "shěnměi guānniàn", spanish: "concepto estético", italian: "concetto estetico", english: "aesthetic concept" },
      ],
    },
  },
  {
    id: "holidays",
    title: "Holidays & Celebrations",
    vocabulary: {
      Easy: [
        { chinese: "节", pinyin: "jié", spanish: "festival", italian: "festa", english: "festival" },
        { chinese: "过", pinyin: "guò", spanish: "pasar", italian: "passare", english: "celebrate/pass" },
        { chinese: "年", pinyin: "nián", spanish: "año", italian: "anno", english: "year" },
      ],
      Medium: [
        { chinese: "节日", pinyin: "jiérì", spanish: "día festivo", italian: "festa", english: "holiday" },
        { chinese: "春节", pinyin: "chūnjié", spanish: "Año Nuevo chino", italian: "Capodanno cinese", english: "Spring Festival" },
        { chinese: "庆祝", pinyin: "qìngzhù", spanish: "celebrar", italian: "celebrare", english: "celebrate" },
        { chinese: "礼物", pinyin: "lǐwù", spanish: "regalo", italian: "regalo", english: "gift" },
        { chinese: "团聚", pinyin: "tuánjù", spanish: "reunirse", italian: "riunirsi", english: "reunion" },
      ],
      Hard: [
        { chinese: "传统", pinyin: "chuántǒng", spanish: "tradición", italian: "tradizione", english: "tradition" },
        { chinese: "习俗", pinyin: "xísú", spanish: "costumbre", italian: "usanza", english: "custom" },
        { chinese: "欢庆", pinyin: "huānqìng", spanish: "celebración", italian: "festeggiamento", english: "celebration" },
        { chinese: "文化传承", pinyin: "wénhuà chuánchéng", spanish: "herencia cultural", italian: "eredità culturale", english: "cultural heritage" },
        { chinese: "节日氛围", pinyin: "jiérì fēnwéi", spanish: "ambiente festivo", italian: "atmosfera festiva", english: "festive atmosphere" },
        { chinese: "传统美德", pinyin: "chuántǒng měidé", spanish: "virtud tradicional", italian: "virtù tradizionale", english: "traditional virtue" },
        { chinese: "欢聚一堂", pinyin: "huānjù yìtáng", spanish: "reunión familiar", italian: "riunione familiare", english: "gather together" },
        { chinese: "喜庆吉祥", pinyin: "xǐqìng jíxiáng", spanish: "festivo y auspicioso", italian: "festivo e propizio", english: "joyous and auspicious" },
      ],
    },
  },
  {
    id: "emotions",
    title: "Emotions & Feelings",
    vocabulary: {
      Easy: [
        { chinese: "开心", pinyin: "kāixīn", spanish: "feliz", italian: "felice", english: "happy" },
        { chinese: "难过", pinyin: "nánguò", spanish: "triste", italian: "triste", english: "sad" },
        { chinese: "累", pinyin: "lèi", spanish: "cansado", italian: "stanco", english: "tired" },
      ],
      Medium: [
        { chinese: "高兴", pinyin: "gāoxìng", spanish: "contento", italian: "contento", english: "happy/glad" },
        { chinese: "生气", pinyin: "shēngqì", spanish: "enojado", italian: "arrabbiato", english: "angry" },
        { chinese: "紧张", pinyin: "jǐnzhāng", spanish: "nervioso", italian: "nervoso", english: "nervous" },
        { chinese: "兴奋", pinyin: "xīngfèn", spanish: "emocionado", italian: "eccitato", english: "excited" },
        { chinese: "感觉", pinyin: "gǎnjué", spanish: "sentir", italian: "sentire", english: "feel" },
      ],
      Hard: [
        { chinese: "情绪", pinyin: "qíngxù", spanish: "emoción", italian: "emozione", english: "emotion/mood" },
        { chinese: "心情", pinyin: "xīnqíng", spanish: "estado de ánimo", italian: "umore", english: "mood" },
        { chinese: "感动", pinyin: "gǎndòng", spanish: "conmovido", italian: "commosso", english: "moved/touched" },
        { chinese: "失望", pinyin: "shīwàng", spanish: "decepcionado", italian: "deluso", english: "disappointed" },
        { chinese: "情感表达", pinyin: "qínggǎn biǎodá", spanish: "expresión emocional", italian: "espressione emotiva", english: "emotional expression" },
        { chinese: "心理状态", pinyin: "xīnlǐ zhuàngtài", spanish: "estado psicológico", italian: "stato psicologico", english: "psychological state" },
        { chinese: "情绪管理", pinyin: "qíngxù guǎnlǐ", spanish: "gestión emocional", italian: "gestione emotiva", english: "emotion management" },
        { chinese: "内心感受", pinyin: "nèixīn gǎnshòu", spanish: "sentimientos internos", italian: "sentimenti interiori", english: "inner feelings" },
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
  return theme?.title || "General Conversation";
}
