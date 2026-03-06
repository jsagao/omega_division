export interface GeoRiskItem {
  label: string;
  value: string;
}

export interface MacroItem {
  label: string;
  value: string;
  change: number;
  note: string;
}

export interface CityConfig {
  id: string;
  name: string;
  short: string;
  lat: number;
  lng: number;
  timezone: string;
  primaryIndex: string;
  primaryLabel: string;
  secondaryIndex?: string;
  secondaryLabel?: string;
  currencyPair: string;
  currencyLabel: string;
  trendingSymbols: string;
  yieldSymbols: string;
  yieldLabels: Record<string, string>;
  sectorSymbols: string;
  sectorLabels: Record<string, string>;
  sentimentScore: number;
  geoRiskScore: number;
  geoRiskItems: GeoRiskItem[];
  macroIndicators: MacroItem[];
}

// US sectors (used as fallback for cities without local sector ETFs)
const US_SECTORS = "XLK,XLF,XLV,XLE,XLY,XLI,XLC,XLRE,XLU";
const US_SECTOR_LABELS: Record<string, string> = {
  XLK: "Tech", XLF: "Financials", XLV: "Health", XLE: "Energy",
  XLY: "Consumer", XLI: "Industrial", XLC: "Comms", XLRE: "Real Est", XLU: "Utilities",
};

const US_YIELDS = "^IRX,^FVX,^TNX,^TYX";
const US_YIELD_LABELS: Record<string, string> = {
  "^IRX": "3M T-Bill", "^FVX": "5Y Note", "^TNX": "10Y Note", "^TYX": "30Y Bond",
};

const US_MACRO: MacroItem[] = [
  { label: "Fed Funds Rate", value: "5.33%", change: 0, note: "Held" },
  { label: "CPI (YoY)", value: "3.1%", change: -0.2, note: "Feb" },
  { label: "Unemployment", value: "3.7%", change: 0.1, note: "Feb" },
  { label: "GDP (QoQ)", value: "3.2%", change: 0.4, note: "Q4" },
  { label: "PCE (YoY)", value: "2.8%", change: -0.1, note: "Jan" },
  { label: "10Y Real Yield", value: "2.05%", change: 0.03, note: "Mar" },
];

export const CITIES: CityConfig[] = [
  {
    id: "nyc",
    name: "New York",
    short: "NYC",
    lat: 40.7128,
    lng: -74.006,
    timezone: "America/New_York",
    primaryIndex: "^GSPC",
    primaryLabel: "S&P 500",
    secondaryIndex: "^DJI",
    secondaryLabel: "DOW",
    currencyPair: "DX-Y.NYB",
    currencyLabel: "DXY",
    trendingSymbols: "AAPL,MSFT,NVDA,TSLA,AMZN",
    yieldSymbols: US_YIELDS,
    yieldLabels: US_YIELD_LABELS,
    sectorSymbols: US_SECTORS,
    sectorLabels: US_SECTOR_LABELS,
    sentimentScore: 62,
    geoRiskScore: 58,
    geoRiskItems: [
      { label: "US-CN", value: "0.72 \u2193" },
      { label: "MIDEAST", value: "HIGH" },
      { label: "RU-UA", value: "CRITICAL" },
    ],
    macroIndicators: US_MACRO,
  },
  {
    id: "ldn",
    name: "London",
    short: "LDN",
    lat: 51.5074,
    lng: -0.1278,
    timezone: "Europe/London",
    primaryIndex: "^FTSE",
    primaryLabel: "FTSE 100",
    currencyPair: "GBPUSD=X",
    currencyLabel: "GBP/USD",
    trendingSymbols: "SHEL.L,AZN.L,HSBA.L,BP.L,RIO.L",
    yieldSymbols: US_YIELDS,
    yieldLabels: { "^IRX": "UK 3M", "^FVX": "UK 5Y", "^TNX": "UK 10Y", "^TYX": "UK 30Y" },
    sectorSymbols: US_SECTORS,
    sectorLabels: US_SECTOR_LABELS,
    sentimentScore: 55,
    geoRiskScore: 52,
    geoRiskItems: [
      { label: "BREXIT", value: "STABLE" },
      { label: "EU-UK", value: "0.65" },
      { label: "RU-UA", value: "HIGH" },
    ],
    macroIndicators: [
      { label: "BoE Rate", value: "5.25%", change: 0, note: "Held" },
      { label: "CPI (YoY)", value: "4.0%", change: -0.6, note: "Jan" },
      { label: "Unemployment", value: "3.8%", change: 0, note: "Dec" },
      { label: "GDP (QoQ)", value: "-0.3%", change: -0.4, note: "Q3" },
      { label: "Retail Sales", value: "0.3%", change: 0.7, note: "Jan" },
      { label: "PMI Mfg", value: "47.0", change: 0.3, note: "Feb" },
    ],
  },
  {
    id: "tky",
    name: "Tokyo",
    short: "TKY",
    lat: 35.6895,
    lng: 139.6917,
    timezone: "Asia/Tokyo",
    primaryIndex: "^N225",
    primaryLabel: "Nikkei 225",
    currencyPair: "JPY=X",
    currencyLabel: "USD/JPY",
    trendingSymbols: "7203.T,6758.T,9984.T,6861.T,8306.T",
    yieldSymbols: US_YIELDS,
    yieldLabels: { "^IRX": "JGB 3M", "^FVX": "JGB 5Y", "^TNX": "JGB 10Y", "^TYX": "JGB 30Y" },
    sectorSymbols: US_SECTORS,
    sectorLabels: US_SECTOR_LABELS,
    sentimentScore: 71,
    geoRiskScore: 45,
    geoRiskItems: [
      { label: "CN-TW", value: "ELEVATED" },
      { label: "NK-JP", value: "0.58" },
      { label: "US-JP", value: "STABLE" },
    ],
    macroIndicators: [
      { label: "BoJ Rate", value: "0.10%", change: 0.1, note: "Raised" },
      { label: "CPI (YoY)", value: "2.2%", change: -0.4, note: "Jan" },
      { label: "Unemployment", value: "2.4%", change: 0, note: "Jan" },
      { label: "GDP (QoQ)", value: "0.1%", change: 0.9, note: "Q4" },
      { label: "Tankan Index", value: "13", change: 4, note: "Q4" },
      { label: "Trade Balance", value: "-¥662B", change: 0, note: "Jan" },
    ],
  },
  {
    id: "hkg",
    name: "Hong Kong",
    short: "HKG",
    lat: 22.3964,
    lng: 114.1095,
    timezone: "Asia/Hong_Kong",
    primaryIndex: "^HSI",
    primaryLabel: "Hang Seng",
    currencyPair: "HKD=X",
    currencyLabel: "USD/HKD",
    trendingSymbols: "0700.HK,9988.HK,1299.HK,0005.HK,2318.HK",
    yieldSymbols: US_YIELDS,
    yieldLabels: US_YIELD_LABELS,
    sectorSymbols: US_SECTORS,
    sectorLabels: US_SECTOR_LABELS,
    sentimentScore: 38,
    geoRiskScore: 68,
    geoRiskItems: [
      { label: "CN-TW", value: "HIGH" },
      { label: "HK-CN", value: "0.82" },
      { label: "US-CN", value: "ELEVATED" },
    ],
    macroIndicators: [
      { label: "Base Rate", value: "5.75%", change: 0, note: "Pegged" },
      { label: "CPI (YoY)", value: "1.7%", change: -0.3, note: "Jan" },
      { label: "Unemployment", value: "2.9%", change: -0.1, note: "Jan" },
      { label: "GDP (QoQ)", value: "4.3%", change: 1.1, note: "Q4" },
      { label: "PMI", value: "49.0", change: -0.8, note: "Feb" },
      { label: "Retail Sales", value: "-7.3%", change: -2.1, note: "Jan" },
    ],
  },
  {
    id: "sgp",
    name: "Singapore",
    short: "SGP",
    lat: 1.3521,
    lng: 103.8198,
    timezone: "Asia/Singapore",
    primaryIndex: "^STI",
    primaryLabel: "STI",
    currencyPair: "SGD=X",
    currencyLabel: "USD/SGD",
    trendingSymbols: "D05.SI,O39.SI,U11.SI,Z74.SI,C6L.SI",
    yieldSymbols: US_YIELDS,
    yieldLabels: US_YIELD_LABELS,
    sectorSymbols: US_SECTORS,
    sectorLabels: US_SECTOR_LABELS,
    sentimentScore: 60,
    geoRiskScore: 35,
    geoRiskItems: [
      { label: "ASEAN", value: "STABLE" },
      { label: "SCS", value: "MODERATE" },
      { label: "US-CN", value: "0.55" },
    ],
    macroIndicators: [
      { label: "MAS Policy", value: "Tighten", change: 0, note: "Oct" },
      { label: "CPI (YoY)", value: "2.9%", change: -0.4, note: "Jan" },
      { label: "GDP (QoQ)", value: "2.2%", change: 1.1, note: "Q4" },
      { label: "PMI", value: "50.7", change: 0.2, note: "Feb" },
      { label: "Trade Balance", value: "S$4.8B", change: 0, note: "Jan" },
      { label: "Unemployment", value: "2.0%", change: 0, note: "Q4" },
    ],
  },
  {
    id: "fra",
    name: "Frankfurt",
    short: "FRA",
    lat: 50.1109,
    lng: 8.6821,
    timezone: "Europe/Berlin",
    primaryIndex: "^GDAXI",
    primaryLabel: "DAX",
    currencyPair: "EURUSD=X",
    currencyLabel: "EUR/USD",
    trendingSymbols: "SAP.DE,SIE.DE,ALV.DE,DTE.DE,BAS.DE",
    yieldSymbols: US_YIELDS,
    yieldLabels: { "^IRX": "Bund 3M", "^FVX": "Bund 5Y", "^TNX": "Bund 10Y", "^TYX": "Bund 30Y" },
    sectorSymbols: US_SECTORS,
    sectorLabels: US_SECTOR_LABELS,
    sentimentScore: 50,
    geoRiskScore: 55,
    geoRiskItems: [
      { label: "RU-UA", value: "HIGH" },
      { label: "EU-RU", value: "CRITICAL" },
      { label: "ENERGY", value: "ELEVATED" },
    ],
    macroIndicators: [
      { label: "ECB Rate", value: "4.50%", change: 0, note: "Held" },
      { label: "HICP (YoY)", value: "2.8%", change: -0.1, note: "Jan" },
      { label: "Unemployment", value: "6.4%", change: 0, note: "Jan" },
      { label: "GDP (QoQ)", value: "-0.3%", change: -0.4, note: "Q4" },
      { label: "PMI Mfg", value: "42.5", change: -1.1, note: "Feb" },
      { label: "Ifo Index", value: "85.5", change: -0.2, note: "Feb" },
    ],
  },
  {
    id: "syd",
    name: "Sydney",
    short: "SYD",
    lat: -33.8688,
    lng: 151.2093,
    timezone: "Australia/Sydney",
    primaryIndex: "^AXJO",
    primaryLabel: "ASX 200",
    currencyPair: "AUDUSD=X",
    currencyLabel: "AUD/USD",
    trendingSymbols: "BHP.AX,CBA.AX,CSL.AX,NAB.AX,WBC.AX",
    yieldSymbols: US_YIELDS,
    yieldLabels: { "^IRX": "AU 3M", "^FVX": "AU 5Y", "^TNX": "AU 10Y", "^TYX": "AU 30Y" },
    sectorSymbols: US_SECTORS,
    sectorLabels: US_SECTOR_LABELS,
    sentimentScore: 58,
    geoRiskScore: 30,
    geoRiskItems: [
      { label: "AU-CN", value: "MODERATE" },
      { label: "PACIFIC", value: "STABLE" },
      { label: "AUKUS", value: "0.25" },
    ],
    macroIndicators: [
      { label: "RBA Rate", value: "4.35%", change: 0, note: "Held" },
      { label: "CPI (YoY)", value: "4.1%", change: -0.8, note: "Q4" },
      { label: "Unemployment", value: "3.7%", change: -0.2, note: "Jan" },
      { label: "GDP (QoQ)", value: "0.2%", change: -0.2, note: "Q3" },
      { label: "Trade Balance", value: "A$11B", change: 0, note: "Dec" },
      { label: "PMI", value: "50.1", change: 0.3, note: "Feb" },
    ],
  },
  {
    id: "dxb",
    name: "Dubai",
    short: "DXB",
    lat: 25.2048,
    lng: 55.2708,
    timezone: "Asia/Dubai",
    primaryIndex: "^DFMGI",
    primaryLabel: "DFM",
    currencyPair: "AED=X",
    currencyLabel: "USD/AED",
    trendingSymbols: "EMAAR.AE,DIB.AE,DFM.AE,ADCB.AE,FAB.AE",
    yieldSymbols: US_YIELDS,
    yieldLabels: US_YIELD_LABELS,
    sectorSymbols: US_SECTORS,
    sectorLabels: US_SECTOR_LABELS,
    sentimentScore: 65,
    geoRiskScore: 72,
    geoRiskItems: [
      { label: "MIDEAST", value: "HIGH" },
      { label: "IRAN", value: "CRITICAL" },
      { label: "OIL", value: "ELEVATED" },
    ],
    macroIndicators: [
      { label: "CBUAE Rate", value: "5.40%", change: 0, note: "Pegged" },
      { label: "CPI (YoY)", value: "3.3%", change: 0.2, note: "Q4" },
      { label: "GDP Growth", value: "3.4%", change: 0.3, note: "2023" },
      { label: "PMI", value: "56.0", change: 0.5, note: "Feb" },
      { label: "Oil Price", value: "$82.50", change: 1.2, note: "Brent" },
      { label: "Tourism", value: "+8.2%", change: 0, note: "YoY" },
    ],
  },
  {
    id: "mum",
    name: "Mumbai",
    short: "MUM",
    lat: 19.076,
    lng: 72.8777,
    timezone: "Asia/Kolkata",
    primaryIndex: "^BSESN",
    primaryLabel: "Sensex",
    secondaryIndex: "^NSEI",
    secondaryLabel: "Nifty 50",
    currencyPair: "INR=X",
    currencyLabel: "USD/INR",
    trendingSymbols: "RELIANCE.NS,TCS.NS,INFY.NS,HDFCBANK.NS,ITC.NS",
    yieldSymbols: US_YIELDS,
    yieldLabels: { "^IRX": "IN 3M", "^FVX": "IN 5Y", "^TNX": "IN 10Y", "^TYX": "IN 30Y" },
    sectorSymbols: US_SECTORS,
    sectorLabels: US_SECTOR_LABELS,
    sentimentScore: 73,
    geoRiskScore: 48,
    geoRiskItems: [
      { label: "IN-PK", value: "ELEVATED" },
      { label: "IN-CN", value: "0.60" },
      { label: "KASHMIR", value: "MODERATE" },
    ],
    macroIndicators: [
      { label: "RBI Rate", value: "6.50%", change: 0, note: "Held" },
      { label: "CPI (YoY)", value: "5.1%", change: 0.2, note: "Jan" },
      { label: "GDP (QoQ)", value: "8.4%", change: 0.9, note: "Q3" },
      { label: "PMI Mfg", value: "56.5", change: 0.8, note: "Feb" },
      { label: "Fiscal Deficit", value: "5.8%", change: -0.1, note: "FY24" },
      { label: "Rupee", value: "83.05", change: -0.02, note: "Spot" },
    ],
  },
  {
    id: "sao",
    name: "São Paulo",
    short: "SAO",
    lat: -23.5505,
    lng: -46.6333,
    timezone: "America/Sao_Paulo",
    primaryIndex: "^BVSP",
    primaryLabel: "Bovespa",
    currencyPair: "BRL=X",
    currencyLabel: "USD/BRL",
    trendingSymbols: "PETR4.SA,VALE3.SA,ITUB4.SA,BBDC4.SA,ABEV3.SA",
    yieldSymbols: US_YIELDS,
    yieldLabels: { "^IRX": "BR 3M", "^FVX": "BR 5Y", "^TNX": "BR 10Y", "^TYX": "BR 30Y" },
    sectorSymbols: US_SECTORS,
    sectorLabels: US_SECTOR_LABELS,
    sentimentScore: 48,
    geoRiskScore: 32,
    geoRiskItems: [
      { label: "LATAM", value: "MODERATE" },
      { label: "BR-ARG", value: "STABLE" },
      { label: "AMAZON", value: "0.40" },
    ],
    macroIndicators: [
      { label: "Selic Rate", value: "11.25%", change: -0.5, note: "Cut" },
      { label: "IPCA (YoY)", value: "4.5%", change: -0.1, note: "Jan" },
      { label: "Unemployment", value: "7.4%", change: -0.2, note: "Jan" },
      { label: "GDP (QoQ)", value: "2.9%", change: 0.3, note: "Q3" },
      { label: "Trade Balance", value: "$7.5B", change: 0, note: "Jan" },
      { label: "PMI", value: "52.1", change: 0.4, note: "Feb" },
    ],
  },
];

export const DEFAULT_CITY = CITIES[0]; // New York

export function getCityById(id: string): CityConfig {
  return CITIES.find((c) => c.id === id) ?? DEFAULT_CITY;
}
