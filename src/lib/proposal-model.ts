export type Product = "propel" | "ownership" | "cash";
export type PriceMode = "total" | "perWatt";

export const ADDERS = [
  { id: "mspUpgrade", label: "MSP upgrade" },
  { id: "mspReplacement", label: "MSP replacement" },
  { id: "overheadWire", label: "Overhead wire" },
  { id: "trench", label: "Trench" },
  { id: "evOutlet", label: "240V EV outlet" },
  { id: "groundMount", label: "Ground mount structure" },
] as const;

export type AdderId = (typeof ADDERS)[number]["id"];
export type AdderPrices = Record<AdderId, number>;

export function emptyAdders(): AdderPrices {
  return {
    mspUpgrade: 0,
    mspReplacement: 0,
    overheadWire: 0,
    trench: 0,
    evOutlet: 0,
    groundMount: 0,
  };
}

export type UtilityChoice = {
  id: string;
  name: string;
  ratePerKwh: number | null;
};

export type ProposalDraft = {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  address: string;
  zip: string;
  state: string;
  utilityId: string;
  utilityName: string;
  utilityRate: number | null;
  utilityOptions: UtilityChoice[];
  annualUsageKwh: number;
  preparedBy: string;
  preparedPhone: string;
  preparedEmail: string;
  date: string;
  product: Product;
  moduleCount: number;
  moduleModel: string;
  inverterCount: number;
  inverterModel: string;
  batteryCount: number;
  batteryModel: string;
  batteryPrice: number;
  generatorSmartModule: boolean;
  generatorSmartModulePrice: number;
  systemKw: number;
  yearOneKwh: number;
  monthlyBill: number;
  remainingBill: number;
  monthlyRec: number;
  priceMode: PriceMode;
  pvPrice: number;
  pricePerWatt: number;
  adders: AdderPrices;
  price: number;
  apr: number;
  termYears: number;
  paymentOverride: string;
  imageDataUrl: string | null;
};

export const SAMPLE_DESIGN = "/sample-design.png";

export type Equipment = { manufacturer: string; model: string };
export type Panel = Equipment & { watts: number };

export const PANELS: Panel[] = [
  { manufacturer: "Hyundai Heavy Industries", model: "HiN-T440NF(BK)", watts: 440 },
  { manufacturer: "JA Solar", model: "JAM54D41-440/MB", watts: 440 },
  { manufacturer: "Maxeon Solar Technologies", model: "SPR-MAX3-415-BLK", watts: 415 },
  { manufacturer: "Qcells North America", model: "Q.PEAK DUO XL-G11.3/BFG 580", watts: 580 },
  { manufacturer: "Qcells North America", model: "Q.PEAK DUO XL-G11S 590", watts: 590 },
  { manufacturer: "Qcells North America", model: "Q.TRON BLK M-G2.C+ 435", watts: 435 },
  { manufacturer: "Qcells North America", model: "Q.TRON BLK M-G2+ 430", watts: 430 },
  { manufacturer: "Qcells North America", model: "Q.TRON BLK M-G2+ 440", watts: 440 },
  { manufacturer: "Qcells North America", model: "Q.TRON L-G2.3/BFG 590", watts: 590 },
  { manufacturer: "REC Solar", model: "REC400NP3 Black", watts: 400 },
  { manufacturer: "REC Solar", model: "REC460AA PURE-RX", watts: 460 },
  { manufacturer: "REC Solar", model: "REC460AA PURE-RX-DC", watts: 460 },
  { manufacturer: "REC Solar", model: "REC470AA PURE-RX", watts: 470 },
  { manufacturer: "SEG Solar", model: "SEG-440-BTD-BG", watts: 440 },
];

export const INVERTERS: Equipment[] = [
  { manufacturer: "Enphase Energy", model: "IQ8H-3P-72-E-US" },
  { manufacturer: "Enphase Energy", model: "IQ8HC-72-M-DOM-US @240 VAC" },
  { manufacturer: "Enphase Energy", model: "IQ8MC-72-M-US [240V]" },
  { manufacturer: "Enphase Energy", model: "IQ8P-3P-72-E-US" },
  { manufacturer: "Enphase Energy", model: "IQ8X-80-M-DOM-US @ 240 V" },
  { manufacturer: "Enphase Energy", model: "IQ9N-3P-208-A-US" },
  { manufacturer: "Enphase Energy", model: "IQ9N-3P-277-A-US" },
  { manufacturer: "Tesla", model: "Powerwall 3 (internal inverter)" },
];

export const BATTERIES: Equipment[] = [
  { manufacturer: "Enphase Energy", model: "IQBATTERY-10C-1P-NA" },
  { manufacturer: "FranklinWH Energy Storage, Inc.", model: "APR-10K15V2-US (aPower 2)" },
  { manufacturer: "Tesla", model: "Powerwall 3 DC Battery" },
];

export function equipmentLabel(item: Equipment): string {
  return `${item.manufacturer} ${item.model}`;
}

export function panelWatts(moduleModel: string): number | null {
  return PANELS.find((panel) => equipmentLabel(panel) === moduleModel)?.watts ?? null;
}

export function isEnphaseInverter(inverterModel: string): boolean {
  return inverterModel.startsWith("Enphase");
}

export function isFranklinBattery(batteryModel: string): boolean {
  return batteryModel.startsWith("Franklin");
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function pvSystemDollars(draft: ProposalDraft): number {
  if ((draft.priceMode ?? "total") === "perWatt") {
    return roundMoney((draft.systemKw || 0) * 1000 * (draft.pricePerWatt || 0));
  }
  return roundMoney(draft.pvPrice ?? draft.price ?? 0);
}

export function contractPrice(draft: ProposalDraft): number {
  const battery = draft.batteryModel ? draft.batteryPrice || 0 : 0;
  const generator =
    isFranklinBattery(draft.batteryModel ?? "") && draft.generatorSmartModule
      ? draft.generatorSmartModulePrice || 0
      : 0;
  const adders = ADDERS.reduce((sum, adder) => sum + (draft.adders?.[adder.id] || 0), 0);
  return roundMoney(pvSystemDollars(draft) + battery + generator + adders);
}

export function withContractPrice(draft: ProposalDraft): ProposalDraft {
  const price = contractPrice(draft);
  return price === draft.price ? draft : { ...draft, price };
}

export type PriceLine = { label: string; amount: number };

export function priceLines(draft: ProposalDraft): PriceLine[] {
  const lines: PriceLine[] = [
    {
      label:
        (draft.priceMode ?? "total") === "perWatt"
          ? `PV system · $${(draft.pricePerWatt || 0).toFixed(2)}/W`
          : "PV system",
      amount: pvSystemDollars(draft),
    },
  ];
  if (draft.batteryModel && (draft.batteryPrice || 0) > 0) {
    lines.push({ label: "Batteries", amount: draft.batteryPrice });
  }
  if (
    isFranklinBattery(draft.batteryModel ?? "") &&
    draft.generatorSmartModule &&
    (draft.generatorSmartModulePrice || 0) > 0
  ) {
    lines.push({ label: "Generator Smart Module", amount: draft.generatorSmartModulePrice });
  }
  for (const adder of ADDERS) {
    const amount = draft.adders?.[adder.id] || 0;
    if (amount > 0) lines.push({ label: adder.label, amount });
  }
  return lines;
}

/** Size comes from panel watts × count. Enphase microinverters match the panel count. */
export function syncEquipment(draft: ProposalDraft): ProposalDraft {
  const watts = panelWatts(draft.moduleModel);
  const systemKw =
    watts == null ? draft.systemKw : Number(((watts * draft.moduleCount) / 1000).toFixed(3));
  const inverterCount = isEnphaseInverter(draft.inverterModel) ? draft.moduleCount : draft.inverterCount;
  const next =
    systemKw === draft.systemKw && inverterCount === draft.inverterCount
      ? draft
      : { ...draft, systemKw, inverterCount };
  return withContractPrice(next);
}

export function equipmentGroups(items: Equipment[]): { manufacturer: string; models: string[] }[] {
  const groups: { manufacturer: string; models: string[] }[] = [];
  for (const item of items) {
    const label = equipmentLabel(item);
    const existing = groups.find((group) => group.manufacturer === item.manufacturer);
    if (existing) existing.models.push(label);
    else groups.push({ manufacturer: item.manufacturer, models: [label] });
  }
  return groups;
}

export const PREPARERS = [
  { name: "Andrew Contrino", email: "Andrew@PublicServiceSolar.com" },
  { name: "Bruce Beegal", email: "Bruce@PublicServiceSolar.com" },
  { name: "Charles Lostracco", email: "Charles@PublicServiceSolar.com" },
  { name: "Mark Carrera", email: "Mark@PublicServiceSolar.com" },
  { name: "Michael Emmons", email: "Emmons@PublicServiceSolar.com" },
  { name: "Nick Lostracco", email: "Nick@PublicServiceSolar.com" },
  { name: "Tony Lostracco", email: "Tony@PublicServiceSolar.com" },
] as const;

export function preparerEmail(name: string, fallback = ""): string {
  return PREPARERS.find((person) => person.name === name)?.email ?? fallback;
}

export function dateInputValue(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const named = /^([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})$/.exec(value.trim());
  if (!named) return "";
  const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const month = months.indexOf(named[1].slice(0, 3).toLowerCase());
  if (month < 0) return "";
  return `${named[3]}-${String(month + 1).padStart(2, "0")}-${named[2].padStart(2, "0")}`;
}

export function formatProposalDate(value: string): string {
  const iso = dateInputValue(value);
  if (!iso) return value || "—";
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const SEASON = [65, 85, 118, 138, 143, 108, 100, 118, 117, 100, 84, 58];

export function blankDraft(): ProposalDraft {
  return {
    id: "draft",
    clientName: "James Davis",
    clientPhone: "(717) 802-1607",
    clientEmail: "davis7x@hotmail.com",
    address: "3929 Brookridge Dr, Mechanicsburg, PA 17050",
    zip: "17050",
    state: "PA",
    utilityId: "",
    utilityName: "",
    utilityRate: null,
    utilityOptions: [],
    annualUsageKwh: 12000,
    preparedBy: "Tony Lostracco",
    preparedPhone: "(888) 270-2884",
    preparedEmail: "Tony@PublicServiceSolar.com",
    date: "2026-10-28",
    product: "propel",
    moduleCount: 25,
    moduleModel: "REC Solar REC460AA PURE-RX-DC",
    inverterCount: 25,
    inverterModel: "Enphase Energy IQ8X-80-M-DOM-US @ 240 V",
    batteryCount: 0,
    batteryModel: "",
    batteryPrice: 0,
    generatorSmartModule: false,
    generatorSmartModulePrice: 0,
    systemKw: 11.5,
    yearOneKwh: 13409,
    monthlyBill: 224.25,
    remainingBill: 15,
    monthlyRec: 27.94,
    priceMode: "total",
    pvPrice: 22885,
    pricePerWatt: 2.99,
    adders: emptyAdders(),
    price: 22885,
    apr: 8.99,
    termYears: 25,
    paymentOverride: "",
    imageDataUrl: null,
  };
}

/** Residential SREC dollars per 1,000 kWh. PVWatts does not publish these prices. */
export const SREC_PER_1000_KWH: Record<string, number> = {
  NJ: 77,
  PA: 25,
  FL: 0,
};

export function monthlySrec(state: string, yearOneKwh: number): number {
  const rate = SREC_PER_1000_KWH[state.trim().toUpperCase()];
  if (rate == null || rate <= 0 || !Number.isFinite(yearOneKwh) || yearOneKwh <= 0) return 0;
  return Math.round(((yearOneKwh / 1000) * rate) / 12 * 100) / 100;
}

export function srecCaption(state: string): string {
  const code = state.trim().toUpperCase();
  if (code === "NJ") return "New Jersey residential SREC · $77 per 1,000 kWh";
  if (code === "PA") return "Pennsylvania residential SREC · $25 per 1,000 kWh";
  if (code === "FL") return "No residential SREC in Florida";
  if (!code) return "Choose a state to calculate the SREC";
  return `No residential SREC rate for ${code}`;
}

export function utilityRateLabel(rate: number | null | undefined): string {
  if (rate == null || !Number.isFinite(rate)) return "";
  return `${(rate * 100).toFixed(2)}¢/kWh`;
}

/** Residential dollars per month from yearly kWh times the utility's $/kWh rate. */
export function monthlyBillFromUsage(
  annualUsageKwh: number,
  ratePerKwh: number | null | undefined,
): number | null {
  if (ratePerKwh == null || !Number.isFinite(ratePerKwh) || ratePerKwh < 0) return null;
  if (!Number.isFinite(annualUsageKwh) || annualUsageKwh < 0) return null;
  return Math.round(((annualUsageKwh * ratePerKwh) / 12) * 100) / 100;
}

export function money(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function monthlyPayment(principal: number, aprPercent: number, years: number): number {
  const n = Math.round(years * 12);
  if (principal <= 0 || n <= 0) return 0;
  const r = aprPercent / 100 / 12;
  if (r === 0) return principal / n;
  const pow = (1 + r) ** n;
  return (principal * r * pow) / (pow - 1);
}

export type ProposalMath = {
  payment: number;
  totalUtility: number;
  totalSolar: number;
  monthlySavings: number;
  lifetimeSavings: number;
  utility25: number;
  solarShare: number;
  yearOneUtility: number;
  yearOneRec: number;
  yearOneReturn: number;
  paybackYears: number | null;
  monthlyKwh: { month: string; kwh: number }[];
};

export function compute(d: ProposalDraft): ProposalMath {
  const override = Number(d.paymentOverride);
  const payment =
    d.product === "cash"
      ? 0
      : d.paymentOverride.trim() !== "" && Number.isFinite(override)
        ? override
        : monthlyPayment(d.price, d.apr, d.termYears);
  const totalUtility = d.monthlyBill;
  const totalSolar = d.remainingBill + payment - d.monthlyRec;
  const monthlySavings = totalUtility - totalSolar;
  const yearOneUtility = (d.monthlyBill - d.remainingBill) * 12;
  const yearOneRec = d.monthlyRec * 12;
  const yearOneReturn = yearOneUtility + yearOneRec;
  const paybackYears =
    d.product === "cash" && yearOneReturn > 0 ? d.price / yearOneReturn : null;
  const solarShare =
    d.monthlyBill > 0
      ? Math.max(0, Math.min(100, ((d.monthlyBill - d.remainingBill) / d.monthlyBill) * 100))
      : 0;
  const weight = SEASON.reduce((a, b) => a + b, 0);
  const monthlyKwh = MONTHS.map((month, i) => ({
    month,
    kwh: Math.round((d.yearOneKwh * SEASON[i]!) / weight),
  }));
  return {
    payment,
    totalUtility,
    totalSolar,
    monthlySavings,
    lifetimeSavings: monthlySavings * 12 * 25,
    utility25: d.monthlyBill * 12 * 25,
    solarShare,
    yearOneUtility,
    yearOneRec,
    yearOneReturn,
    paybackYears,
    monthlyKwh,
  };
}

export function productTitle(product: Product): string {
  if (product === "propel") return "PROPEL — Prepaid Energy Service Agreement to Ownership";
  if (product === "ownership") return "Credit Human Credit Union";
  return "Cash purchase";
}

export function designSrc(d: ProposalDraft): string {
  return d.imageDataUrl || SAMPLE_DESIGN;
}

export function fileToDesignUrl(file: File, maxWidth = 1600): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("Could not read the image"));
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not prepare the image"));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.86));
      };
      img.onerror = () => reject(new Error("That file is not a readable image"));
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
