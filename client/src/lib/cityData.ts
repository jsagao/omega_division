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
}

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
  },
];

export const DEFAULT_CITY = CITIES[0]; // New York

export function getCityById(id: string): CityConfig {
  return CITIES.find((c) => c.id === id) ?? DEFAULT_CITY;
}
