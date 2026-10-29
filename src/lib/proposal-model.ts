export type Product = "propel" | "ownership" | "cash";

export type ProposalDraft = {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  address: string;
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
  systemKw: number;
  yearOneKwh: number;
  monthlyBill: number;
  remainingBill: number;
  monthlyRec: number;
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

/** Size comes from panel watts × count. Enphase microinverters match the panel count. */
export function syncEquipment(draft: ProposalDraft): ProposalDraft {
  const watts = panelWatts(draft.moduleModel);
  const systemKw =
    watts == null ? draft.systemKw : Number(((watts * draft.moduleCount) / 1000).toFixed(3));
  const inverterCount = isEnphaseInverter(draft.inverterModel) ? draft.moduleCount : draft.inverterCount;
  if (systemKw === draft.systemKw && inverterCount === draft.inverterCount) return draft;
  return { ...draft, systemKw, inverterCount };
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
    preparedBy: "Tony Lostracco",
    preparedPhone: "(888) 270-2884",
    preparedEmail: "tony@publicservicesolar.com",
    date: "Oct 28, 2026",
    product: "propel",
    moduleCount: 25,
    moduleModel: "REC Solar REC460AA PURE-RX-DC",
    inverterCount: 25,
    inverterModel: "Enphase Energy IQ8X-80-M-DOM-US @ 240 V",
    batteryCount: 0,
    batteryModel: "",
    systemKw: 11.5,
    yearOneKwh: 13409,
    monthlyBill: 224.25,
    remainingBill: 15,
    monthlyRec: 27.94,
    price: 22885,
    apr: 8.99,
    termYears: 25,
    paymentOverride: "",
    imageDataUrl: null,
  };
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
