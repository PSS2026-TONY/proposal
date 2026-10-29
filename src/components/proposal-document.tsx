import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  compute,
  designSrc,
  money,
  monthlyPayment,
  productTitle,
  type ProposalDraft,
} from "@/lib/proposal-model";

export function ProposalDocument({ draft }: { draft: ProposalDraft }) {
  const math = compute(draft);
  const src = designSrc(draft);
  const rates = draft.product === "propel" ? [8.99, 9.99, 10.99] : [draft.apr];
  const mix = [
    { name: "Solar", value: Math.round(math.solarShare) },
    { name: "Utility", value: Math.round(100 - math.solarShare) },
  ];

  return (
    <article className="mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-6">
      <section className="proposal-sheet overflow-hidden rounded-card bg-panel text-panel-fg shadow-lg">
        <div className="flex items-center justify-between bg-card px-6 py-4">
          <img src="/logo-lockup.png" alt="Public Service Solar" className="h-16 w-auto" />
          <p className="text-xs tracking-widest text-muted uppercase">{draft.date}</p>
        </div>
        <div className="px-6 pt-10 pb-8">
          <p className="text-xs font-semibold tracking-widest text-accent uppercase">Solar energy redefined</p>
          <h1 className="font-display mt-3 max-w-xl text-4xl leading-tight font-semibold">
            Clean energy, lower bills, one clear proposal.
          </h1>
          <p className="mt-4 inline-flex rounded-full border border-accent px-4 py-2 font-display text-lg">
            Public Service Solar
          </p>
        </div>
        <div className="grid gap-4 border-t border-white/10 px-6 py-5 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs tracking-widest text-panel-muted uppercase">Prepared for</p>
            <p className="mt-1 font-semibold">{draft.clientName || "Client"}</p>
            <p className="text-panel-muted">{draft.clientPhone}</p>
            <p className="text-panel-muted">{draft.clientEmail}</p>
          </div>
          <div>
            <p className="text-xs tracking-widest text-panel-muted uppercase">Prepared by</p>
            <p className="mt-1 font-semibold">{draft.preparedBy}</p>
            <p className="text-panel-muted">{draft.preparedPhone}</p>
            <p className="text-panel-muted">{draft.preparedEmail}</p>
          </div>
          <div>
            <p className="text-xs tracking-widest text-panel-muted uppercase">Project site</p>
            <p className="mt-1">{draft.address || "—"}</p>
          </div>
        </div>
      </section>

      <section className="proposal-sheet rounded-card border border-line bg-card p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-widest text-accent uppercase">Your solar power system</p>
        <h2 className="font-display mt-1 text-3xl font-semibold">Your custom solar system</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-card border border-line p-4">
            <h3 className="font-display text-lg font-semibold">System components</h3>
            <dl className="mt-3 space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-line pb-2">
                <dt className="text-accent">Solar modules</dt>
                <dd className="text-right break-words">
                  ({draft.moduleCount}) {draft.moduleModel}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-line pb-2">
                <dt className="text-accent">Inverters</dt>
                <dd className="text-right break-words">
                  ({draft.inverterCount}) {draft.inverterModel}
                </dd>
              </div>
              {(draft.batteryModel ?? "") !== "" && (
                <div className="flex justify-between gap-4 border-b border-line pb-2">
                  <dt className="text-accent">Batteries</dt>
                  <dd className="text-right break-words">
                    ({draft.batteryCount || 1}) {draft.batteryModel}
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt>System size</dt>
                <dd>{draft.systemKw.toFixed(3)} DC kW</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Year one production</dt>
                <dd>{draft.yearOneKwh.toLocaleString()} kWh</dd>
              </div>
            </dl>
          </div>
          <figure className="overflow-hidden rounded-card border border-accent bg-paper">
            <img
              src={src}
              alt={`Aurora design for ${draft.clientName || "this proposal"}`}
              className="aspect-square w-full object-cover"
            />
            <figcaption className="px-3 py-2 text-xs text-muted">
              Aurora Design for this proposal only. Swap the export and the next job keeps its own image.
            </figcaption>
          </figure>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="h-64 rounded-card border border-line p-3">
            <p className="text-sm font-semibold">Post-solar energy mix</p>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie data={mix} dataKey="value" nameKey="name" innerRadius={46} outerRadius={72} stroke="none">
                  <Cell fill="var(--color-accent)" />
                  <Cell fill="var(--color-line)" />
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-center text-xs text-muted">
              Solar {Math.round(math.solarShare)}% · Utility {Math.round(100 - math.solarShare)}%
            </p>
          </div>
          <div className="h-64 rounded-card border border-line p-3">
            <p className="text-sm font-semibold">Solar electricity generated</p>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={math.monthlyKwh} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} interval={0} />
                <YAxis tick={{ fontSize: 10 }} width={36} />
                <Tooltip formatter={(value) => [`${value} kWh`, "Estimated"]} />
                <Bar dataKey="kwh" fill="var(--color-accent)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="proposal-sheet rounded-card border border-line bg-card p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-widest text-accent uppercase">The numbers</p>
        <h2 className="font-display mt-1 text-3xl font-semibold">{productTitle(draft.product)}</h2>
        <p className="mt-3 font-display text-3xl font-semibold text-accent">{money(draft.price)}</p>
        <p className="text-xs font-semibold tracking-wide text-accent uppercase">
          {draft.product === "propel" ? "Prepaid baseline ESA amount" : "Solution price"}
        </p>
        <p className="mt-2 text-sm text-muted">
          {draft.product === "cash"
            ? "Paid in full. Incentives stay with the homeowner."
            : draft.product === "ownership"
              ? `Credit Human · ${formatYears(draft.termYears)} years at ${draft.apr.toFixed(2)}% APR · $0 for 6 months, then ${money(math.payment)}/mo`
              : `${draft.termYears} year · ${draft.apr.toFixed(2)}%${draft.paymentOverride.trim() ? " · payment entered manually" : ""}`}
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Stat label="Year 1 monthly savings" value={money(math.monthlySavings)} />
          <Stat label="Estimated monthly payment" value={money(math.payment)} />
          <Stat label="25-year savings" value={money(math.lifetimeSavings, 0)} />
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-md text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="py-2 font-semibold text-accent">Monthly cost</th>
                <th className="py-2 font-semibold">Utility only</th>
                <th className="py-2 font-semibold">With solar</th>
              </tr>
            </thead>
            <tbody>
              <Row label="Average remaining electric bill" a={money(draft.monthlyBill)} b={money(draft.remainingBill)} />
              <Row
                label={draft.product === "ownership" ? "Monthly solar payments after month 6" : "Monthly solar payments"}
                a={money(0)}
                b={money(math.payment)}
              />
              <Row label="Minus monthly average REC" a={money(0)} b={`-${money(draft.monthlyRec)}`} />
              <Row label="Total average monthly payments" a={money(math.totalUtility)} b={money(math.totalSolar)} strong />
            </tbody>
          </table>
        </div>

        <p className="mt-5 text-lg">
          Over the next 25 years, you would pay{" "}
          <span className="font-semibold text-accent">{money(math.utility25, 0)}</span> to the utility.
          Not including the utility price going up one penny to inflation.
        </p>

        {draft.product === "propel" && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-md text-sm">
              <thead>
                <tr className="bg-accent text-left text-accent-ink">
                  <th className="px-3 py-2 font-medium">Prepaid rate</th>
                  {rates.map((rate) => (
                    <th key={rate} className="px-3 py-2 font-medium">
                      {rate.toFixed(2)}%
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-line">
                  <td className="px-3 py-2">Monthly payment</td>
                  {rates.map((rate) => (
                    <td key={rate} className="px-3 py-2">
                      {money(monthlyPayment(draft.price, rate, draft.termYears))}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {draft.product === "ownership" && (
          <CreditHumanChart price={draft.price} apr={draft.apr} years={draft.termYears} payment={math.payment} />
        )}

        {draft.product === "cash" && math.paybackYears != null && (
          <p className="mt-4 text-sm">
            First-year utility savings {money(math.yearOneUtility, 0)} · REC {money(math.yearOneRec)} ·
            simple payback {math.paybackYears.toFixed(1)} years.
          </p>
        )}

        <p className="mt-6 text-xs leading-relaxed text-muted">
          Estimates use the numbers entered for this proposal and a typical seasonal production shape scaled
          to year-one kWh. REC prices move daily and are not guaranteed. A financed payment assumes approval
          for that product. Public Service Solar is not a lender and does not guarantee incentives or utility
          rates.
        </p>
      </section>

      <section className="proposal-sheet rounded-card border border-line bg-card p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-widest text-accent uppercase">Agreement snapshot</p>
        <h2 className="font-display mt-1 text-2xl font-semibold">Ready to drop into the contract</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <Field k="Customer" v={draft.clientName} />
          <Field k="Site" v={draft.address} />
          <Field k="System" v={`${draft.systemKw.toFixed(3)} kW DC · ${draft.yearOneKwh.toLocaleString()} kWh year one`} />
          <Field
            k="Equipment"
            v={[
              `${draft.moduleCount}× ${draft.moduleModel}`,
              `${draft.inverterCount}× ${draft.inverterModel}`,
              (draft.batteryModel ?? "") !== "" ? `${draft.batteryCount || 1}× ${draft.batteryModel}` : "",
            ]
              .filter(Boolean)
              .join(" · ")}
          />
          <Field k="Price" v={money(draft.price)} />
          <Field
            k="Payment"
            v={
              draft.product === "cash"
                ? "Cash at signing"
                : draft.product === "ownership"
                  ? `$0 for 6 months, then ${money(math.payment)} / mo · ${draft.apr.toFixed(2)}% · ${formatYears(draft.termYears)} yr · Credit Human`
                  : `${money(math.payment)} / mo · ${draft.apr.toFixed(2)}% · ${draft.termYears} yr`
            }
          />
          <Field k="Product" v={productTitle(draft.product)} />
          <Field k="Prepared" v={`${draft.preparedBy} · ${draft.date}`} />
        </dl>
        <p className="mt-4 text-sm text-muted">
          This page carries the same figures as the proposal. Attach your contract template next and these
          fields can fill it.
        </p>
      </section>

      <ClosingPage />
    </article>
  );
}

function ClosingPage() {
  return (
    <section className="proposal-close relative overflow-hidden rounded-card bg-panel px-6 py-10 text-panel-fg shadow-sm sm:px-10 sm:py-12">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="font-display max-w-xl text-4xl font-semibold leading-tight text-white">
            Ready to Take Control of Your Energy Costs?
          </h2>
          <p className="mt-4 max-w-xs text-panel-muted">
            Get started with your financing prequalification today and start saving.
          </p>
        </div>
        <img src="/logo-mark.png" alt="Public Service Solar" className="h-16 w-auto shrink-0" />
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <ApplyLink href={CREDIT_HUMAN_URL}>Apply now — Credit Human</ApplyLink>
        <ApplyLink href={PROPEL_URL}>Apply now — Propel</ApplyLink>
        <ApplyLink href={PROJECTS_URL}>View Recent Projects</ApplyLink>
      </div>

      <h3 className="font-display mt-10 text-3xl font-semibold text-white">About Us</h3>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-panel-muted">
        Since 2018, Public Service Solar has been a trusted leader in premium solar, battery storage, EV
        charging, and roofing installations. As a Solar Power World Top Solar Contractor, Enphase Platinum
        Installer, REC Certified Solar Professional, Tesla Powerwall Certified Installer, FranklinWH Certified
        Installer, and GAF Master Elite Roofer, we are committed to delivering excellence from start to finish.
        Our dedicated in-house team manages every aspect of your project—from design through installation—with
        a focus on quality, aesthetics, and craftsmanship. Backed by industry-leading manufacturer warranties
        and our Platinum Promise Lifetime Workmanship Warranty, you can invest with confidence and enjoy
        decades of clean energy.
      </p>

      <div className="mt-8 border-t border-white/15 pt-4 text-xs leading-relaxed text-panel-muted sm:ml-auto sm:max-w-xs sm:border-t-0 sm:pt-0 sm:text-right">
        <p>Burlington, NJ</p>
        <p>Levittown, PA</p>
        <p>Naples, FL</p>
        <a className="mt-2 inline-block text-accent underline" href="https://PublicServiceSolar.com" target="_blank" rel="noopener noreferrer">
          PublicServiceSolar.com
        </a>
        <p className="mt-2">NJ: #13VH10538000 · PA: #148404 · FL: #EC13013997</p>
        <p className="mt-2">© 2026 by Public Service Solar, LLC</p>
      </div>
    </section>
  );
}

function ApplyLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-center text-base font-semibold text-white"
    >
      {children}
    </a>
  );
}

const CREDIT_HUMAN_URL =
  "https://app.loanspq.com/apply.aspx?lenderref=CHFCU042221&ClinicID=24f81646-a88e-424e-beb2-002c378eb7f5&WorkerID=6fd70a90-a8ae-4ee0-ba54-72480cd30779&referralsource=consumer&isloc=y&noencrypt";
const PROPEL_URL = "https://go.concertfin.com/r/910eb0844f0c";
const PROJECTS_URL =
  "https://portfolio.realworklabs.com/X7WrJKAEqn?box=47.24984680413558%2C-63.417740673920704%2C31.91541684514787%2C-85.63209689335686";

function formatYears(years: number): string {
  const rounded = Math.round(years * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function CreditHumanChart({
  price,
  apr,
  years,
  payment,
}: {
  price: number;
  apr: number;
  years: number;
  payment: number;
}) {
  const payMonths = Math.max(1, Math.round(years * 12));
  const endMonth = payMonths + 6;
  const endYears = endMonth / 12;
  const yMax = niceAxisMax(payment);
  const ticks = [1, 0.75, 0.5, 0.25, 0].map((share) => Math.round(yMax * share));
  const barHeight = yMax > 0 ? Math.min(100, (payment / yMax) * 100) : 0;
  const priceLabel = Number.isInteger(price) ? money(price, 0) : money(price);

  return (
    <div className="credit-human-chart mt-6">
      <h3 className="text-center text-lg font-semibold text-ink">
        Amount Financed {priceLabel} | Term {formatYears(years)} years at {apr.toFixed(2)}% APR
      </h3>
      <div className="mt-5 grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_13.5rem]">
        <div className="min-w-0">
          <div className="flex h-56">
            <div className="flex h-full flex-col justify-between pr-2 text-right text-xs text-muted">
              {ticks.map((tick) => (
                <span key={tick}>{money(tick, 0)}</span>
              ))}
            </div>
            <div className="relative min-w-0 flex-1 border-b border-l border-ink/30">
              <div className="absolute inset-0 flex items-end">
                <div className="h-1.5 w-[7%] bg-[#c8cdc4]" />
                <div className="flex-1 bg-[#6f9a3c]" style={{ height: `${barHeight}%` }} />
              </div>
            </div>
          </div>
          <div className="mt-2 flex justify-between pl-12 text-sm font-semibold text-ink">
            <span>Month 7</span>
            <span>{Number.isInteger(endYears) ? `Year ${endYears}` : `Year ${endYears.toFixed(1)}`}</span>
          </div>
        </div>
        <div className="space-y-5 text-sm">
          <div>
            <p className="font-semibold">First 6 months:</p>
            <p className="mt-2 flex items-center gap-2">
              <span className="inline-block size-4 bg-[#c8cdc4]" />
              <span>$0/month</span>
            </p>
          </div>
          <div>
            <p className="font-semibold">Months 7–{endMonth}:</p>
            <p className="mt-2 flex items-start gap-2">
              <span className="mt-1 inline-block size-4 shrink-0 bg-[#6f9a3c]" />
              <span>
                <span className="text-2xl font-semibold">{money(payment, 0)}</span>
                /month
              </span>
            </p>
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted">
        Credit Human Credit Union. The first 6 months are deferred at $0. The payment shown is the estimate
        for this amount, {apr.toFixed(2)}% APR, and {formatYears(years)}-year term, and it starts in month 7.
        Subject to credit approval. Public Service Solar is not the lender.
      </p>
    </div>
  );
}

function niceAxisMax(value: number): number {
  const padded = Math.max(value, 1) * 1.25;
  const step = padded > 400 ? 100 : padded > 160 ? 40 : padded > 80 ? 20 : 10;
  return Math.ceil(padded / step) * step;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card bg-panel px-4 py-3 text-panel-fg">
      <p className="font-display text-2xl font-semibold text-accent">{value}</p>
      <p className="text-xs text-panel-muted">{label}</p>
    </div>
  );
}

function Row({ label, a, b, strong }: { label: string; a: string; b: string; strong?: boolean }) {
  return (
    <tr className="border-b border-line">
      <td className={`py-2 ${strong ? "font-semibold" : ""}`}>{label}</td>
      <td className="py-2">{a}</td>
      <td className="py-2">{b}</td>
    </tr>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg border border-line px-3 py-2">
      <dt className="text-xs tracking-wide text-muted uppercase">{k}</dt>
      <dd className="font-medium">{v || "—"}</dd>
    </div>
  );
}
