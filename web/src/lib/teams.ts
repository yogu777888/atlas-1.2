import { slugify } from "./translit";

/**
 * Russian names for well-known clubs and national teams, grouped by league.
 * sstats (and its PARI feed) spell teams in English; anything not listed here
 * is shown as-is.
 */
const GROUPS = {
  // РПЛ
  rpl: {
    "zenit": "Зенит", "zenit saint petersburg": "Зенит", "zenit st petersburg": "Зенит",
    "spartak moscow": "Спартак", "spartak moskva": "Спартак", "cska moscow": "ЦСКА", "cska moskva": "ЦСКА",
    "lokomotiv moscow": "Локомотив", "lokomotiv moskva": "Локомотив", "dinamo moscow": "Динамо", "dynamo moscow": "Динамо",
    "krasnodar": "Краснодар", "rostov": "Ростов", "rubin": "Рубин", "rubin kazan": "Рубин", "akhmat grozny": "Ахмат",
    "krylya sovetov": "Крылья Советов", "krylia sovetov": "Крылья Советов", "fakel": "Факел", "fakel voronezh": "Факел",
    "orenburg": "Оренбург", "gazovik orenburg": "Оренбург", "nizhny novgorod": "Пари НН", "pari nn": "Пари НН",
    "dynamo makhachkala": "Динамо Махачкала", "dinamo makhachkala": "Динамо Махачкала", "akron": "Акрон", "akron togliatti": "Акрон",
    "baltika": "Балтика", "baltika kaliningrad": "Балтика", "sochi": "Сочи", "khimki": "Химки", "torpedo moscow": "Торпедо",
  },
  // АПЛ
  epl: {
    "manchester united": "Манчестер Юнайтед", "manchester city": "Манчестер Сити", "arsenal": "Арсенал", "chelsea": "Челси",
    "liverpool": "Ливерпуль", "tottenham": "Тоттенхэм", "tottenham hotspur": "Тоттенхэм", "newcastle": "Ньюкасл",
    "newcastle united": "Ньюкасл", "aston villa": "Астон Вилла", "west ham": "Вест Хэм", "west ham united": "Вест Хэм",
    "brighton": "Брайтон", "everton": "Эвертон", "fulham": "Фулхэм", "crystal palace": "Кристал Пэлас", "brentford": "Брентфорд",
    "wolves": "Вулверхэмптон", "wolverhampton": "Вулверхэмптон", "nottingham forest": "Ноттингем Форест",
    "bournemouth": "Борнмут", "leeds": "Лидс", "leeds united": "Лидс", "burnley": "Бернли", "sunderland": "Сандерленд",
  },
  // Ла Лига
  laliga: {
    "real madrid": "Реал Мадрид", "barcelona": "Барселона", "atletico madrid": "Атлетико", "sevilla": "Севилья",
    "real betis": "Бетис", "real sociedad": "Реал Сосьедад", "villarreal": "Вильярреал", "athletic club": "Атлетик",
    "athletic bilbao": "Атлетик", "valencia": "Валенсия", "celta vigo": "Сельта", "girona": "Жирона", "osasuna": "Осасуна",
    "getafe": "Хетафе", "mallorca": "Мальорка", "rayo vallecano": "Райо Вальекано", "espanyol": "Эспаньол", "alaves": "Алавес",
    "levante": "Леванте", "elche": "Эльче", "oviedo": "Овьедо", "real oviedo": "Овьедо",
  },
  // Серия А
  seriea: {
    "inter": "Интер", "inter milan": "Интер", "ac milan": "Милан", "milan": "Милан", "juventus": "Ювентус", "napoli": "Наполи",
    "as roma": "Рома", "roma": "Рома", "lazio": "Лацио", "atalanta": "Аталанта", "fiorentina": "Фиорентина", "bologna": "Болонья",
    "torino": "Торино", "genoa": "Дженоа", "udinese": "Удинезе", "sassuolo": "Сассуоло", "como": "Комо", "lecce": "Лечче",
    "cagliari": "Кальяри", "verona": "Верона", "hellas verona": "Верона", "parma": "Парма", "cremonese": "Кремонезе", "pisa": "Пиза",
  },
  // Бундеслига
  bundesliga: {
    "bayern munchen": "Бавария", "bayern munich": "Бавария", "borussia dortmund": "Боруссия Д", "bayer leverkusen": "Байер",
    "rb leipzig": "РБ Лейпциг", "eintracht frankfurt": "Айнтрахт", "vfb stuttgart": "Штутгарт", "sc freiburg": "Фрайбург",
    "borussia monchengladbach": "Боруссия М", "vfl wolfsburg": "Вольфсбург", "werder bremen": "Вердер", "1899 hoffenheim": "Хоффенхайм",
    "hoffenheim": "Хоффенхайм", "fsv mainz 05": "Майнц", "mainz 05": "Майнц", "fc augsburg": "Аугсбург", "union berlin": "Унион Берлин",
    "1 fc heidenheim": "Хайденхайм", "heidenheim": "Хайденхайм", "fc st pauli": "Санкт-Паули", "st pauli": "Санкт-Паули",
    "1 fc koln": "Кёльн", "fc koln": "Кёльн", "hamburger sv": "Гамбург",
  },
  // Лига 1
  ligue1: {
    "paris saint germain": "ПСЖ", "psg": "ПСЖ", "marseille": "Марсель", "lyon": "Лион", "monaco": "Монако", "lille": "Лилль",
    "nice": "Ницца", "lens": "Ланс", "rennes": "Ренн", "strasbourg": "Страсбург", "nantes": "Нант", "toulouse": "Тулуза",
    "brest": "Брест", "stade brestois 29": "Брест", "auxerre": "Осер", "angers": "Анже", "le havre": "Гавр", "lorient": "Лорьян",
    "metz": "Метц", "paris fc": "Париж",
  },
  // Еврокубки
  euro: {
    "benfica": "Бенфика", "porto": "Порту", "fc porto": "Порту", "sporting cp": "Спортинг", "sporting lisbon": "Спортинг",
    "ajax": "Аякс", "psv eindhoven": "ПСВ", "psv": "ПСВ", "feyenoord": "Фейеноорд", "celtic": "Селтик", "rangers": "Рейнджерс",
    "club brugge": "Брюгге", "club brugge kv": "Брюгге", "galatasaray": "Галатасарай", "fenerbahce": "Фенербахче",
    "besiktas": "Бешикташ", "olympiakos piraeus": "Олимпиакос", "olympiacos": "Олимпиакос", "shakhtar donetsk": "Шахтёр",
    "dinamo zagreb": "Динамо Загреб", "crvena zvezda": "Црвена Звезда", "red star belgrade": "Црвена Звезда",
    "red bull salzburg": "Зальцбург", "salzburg": "Зальцбург", "sturm graz": "Штурм", "bsc young boys": "Янг Бойз",
    "young boys": "Янг Бойз", "slavia praha": "Славия", "sparta praha": "Спарта Прага", "fc copenhagen": "Копенгаген",
    "copenhagen": "Копенгаген", "bodo glimt": "Будё-Глимт", "qarabag": "Карабах", "union st gilloise": "Юнион Сент-Жиллуаз",
    "kairat almaty": "Кайрат", "kairat": "Кайрат",
  },
  // Сборные
  intl: {
    "russia": "Россия", "england": "Англия", "france": "Франция", "germany": "Германия", "spain": "Испания", "italy": "Италия",
    "portugal": "Португалия", "netherlands": "Нидерланды", "belgium": "Бельгия", "croatia": "Хорватия", "serbia": "Сербия",
    "switzerland": "Швейцария", "austria": "Австрия", "denmark": "Дания", "sweden": "Швеция", "norway": "Норвегия",
    "poland": "Польша", "czech republic": "Чехия", "czechia": "Чехия", "slovakia": "Словакия", "hungary": "Венгрия",
    "romania": "Румыния", "bulgaria": "Болгария", "greece": "Греция", "turkey": "Турция", "turkiye": "Турция",
    "ukraine": "Украина", "belarus": "Беларусь", "georgia": "Грузия", "armenia": "Армения", "azerbaijan": "Азербайджан",
    "kazakhstan": "Казахстан", "uzbekistan": "Узбекистан", "scotland": "Шотландия", "wales": "Уэльс", "ireland": "Ирландия",
    "republic of ireland": "Ирландия", "northern ireland": "Северная Ирландия", "iceland": "Исландия", "finland": "Финляндия",
    "slovenia": "Словения", "bosnia and herzegovina": "Босния и Герцеговина", "north macedonia": "Северная Македония",
    "montenegro": "Черногория", "albania": "Албания", "israel": "Израиль", "cyprus": "Кипр", "latvia": "Латвия",
    "lithuania": "Литва", "estonia": "Эстония", "moldova": "Молдова", "luxembourg": "Люксембург", "malta": "Мальта",
    "brazil": "Бразилия", "argentina": "Аргентина", "uruguay": "Уругвай", "colombia": "Колумбия", "chile": "Чили",
    "peru": "Перу", "ecuador": "Эквадор", "paraguay": "Парагвай", "bolivia": "Боливия", "venezuela": "Венесуэла",
    "mexico": "Мексика", "usa": "США", "united states": "США", "canada": "Канада", "jamaica": "Ямайка", "honduras": "Гондурас",
    "costa rica": "Коста-Рика", "panama": "Панама", "japan": "Япония", "south korea": "Южная Корея", "korea republic": "Южная Корея",
    "australia": "Австралия", "iran": "Иран", "saudi arabia": "Саудовская Аравия", "qatar": "Катар", "morocco": "Марокко",
    "egypt": "Египет", "senegal": "Сенегал", "nigeria": "Нигерия", "cameroon": "Камерун", "ghana": "Гана", "algeria": "Алжир",
    "tunisia": "Тунис", "ivory coast": "Кот-д'Ивуар",
  },
} satisfies Record<string, Record<string, string>>;

const RU: Record<string, string> = Object.assign({}, ...Object.values(GROUPS));

function key(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/ø/g, "o")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Russian club name when we know it, otherwise the original spelling. */
export function teamRu(name: string): string {
  const k = key(name);
  return RU[k] ?? RU[k.replace(/^(fc|fk|ac|sc) | (fc|fk|cf)$/g, "")] ?? name;
}

/** Team pages get readable URLs; these names would otherwise shorten badly. */
const SLUG: Record<string, string> = {
  "Боруссия Д": "borussiya-dortmund",
  "Боруссия М": "borussiya-menhengladbah",
  "ПСЖ": "psg",
  "ПСВ": "psv",
};

/** URL segment of a team page: «Зенит» → "zenit", «Реал Мадрид» → "real-madrid" */
export const teamSlug = (name: string) => SLUG[name] ?? slugify(name);

const LEAGUE_OF = new Map<string, string>();
for (const league of ["rpl", "epl", "laliga", "seriea", "bundesliga", "ligue1"] as const) {
  for (const ru of Object.values(GROUPS[league])) LEAGUE_OF.set(teamSlug(ru), league);
}

/** The club league a team is listed under in our dictionary, if any. A guess for the team page; the season data decides. */
export const clubLeagueOf = (slug: string) => LEAGUE_OF.get(slug);

/** Clubs people look for most often: chips on the home page and in the footer. */
export const POPULAR = ["Зенит", "Спартак", "ЦСКА", "Краснодар", "Локомотив", "Динамо", "Реал Мадрид", "Барселона", "Ливерпуль", "Манчестер Сити", "Бавария", "Интер"];
