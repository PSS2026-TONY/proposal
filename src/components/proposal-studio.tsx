import { useEffect, useState } from "react";
import { ImagePlus, Printer, Save, Trash2 } from "lucide-react";
import { ProposalDocument } from "@/components/proposal-document";
import {
  BATTERIES,
  INVERTERS,
  PANELS,
  blankDraft,
  designSrc,
  equipmentGroups,
  fileToDesignUrl,
  isEnphaseInverter,
  panelWatts,
  syncEquipment,
  type Product,
  type ProposalDraft,
} from "@/lib/proposal-model";
import { deleteProposal, listProposals, saveProposal, type SavedProposal } from "@/lib/proposal-store";

const RATES = [8.99, 9.99, 10.99];

export function ProposalStudio() {
  const [draft, setDraft] = useState<ProposalDraft>(() => syncEquipment(blankDraft()));
  const [saved, setSaved] = useState<SavedProposal[]>([]);
  const [status, setStatus] = useState("");
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    listProposals()
      .then(setSaved)
      .catch(() => setStatus("Saved proposals could not be loaded in this browser."));
  }, []);

  function patch(partial: Partial<ProposalDraft>) {
    setDraft((current) => ({ ...current, ...partial }));
  }

  function patchEquipment(partial: Partial<ProposalDraft>) {
    setDraft((current) => syncEquipment({ ...current, ...partial }));
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setStatus("Reading Aurora export…");
    try {
      const imageDataUrl = await fileToDesignUrl(file);
      patch({ imageDataUrl });
      setStatus("This proposal now has its own Aurora image.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not use that image.");
    }
  }

  async function onSave() {
    const id = draft.id === "draft" ? crypto.randomUUID() : draft.id;
    const next = { ...draft, id };
    const row = await saveProposal(next);
    setDraft(next);
    setSaved((list) => [row, ...list.filter((item) => item.id !== row.id)]);
    setStatus(`Saved ${next.clientName || "proposal"} with its Aurora image.`);
  }

  async function onDelete(id: string) {
    await deleteProposal(id);
    setSaved((list) => list.filter((item) => item.id !== id));
    if (draft.id === id) setDraft(blankDraft());
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="no-print border-b border-line bg-panel text-panel-fg">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <img src="/logo-mark.png" alt="" className="h-12 w-auto" />
            <div>
              <p className="font-display text-lg font-semibold tracking-wide">
                PUBLIC SERVICE <span className="text-accent">SOLAR</span>
              </p>
              <p className="text-sm text-panel-muted">Proposal studio · one Aurora design per job</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="/public-service-solar-proposal.zip"
              download="public-service-solar-proposal.zip"
              className="rounded-lg border border-white/15 px-3 py-2 text-sm"
            >
              Download
            </a>
            <button
              type="button"
              onClick={() => {
                setDraft(syncEquipment(blankDraft()));
                setStatus("New proposal. Drop a fresh Aurora export.");
              }}
              className="rounded-lg border border-white/15 px-3 py-2 text-sm"
            >
              New
            </button>
            <button
              type="button"
              onClick={() => void onSave()}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-ink"
            >
              <Save className="size-4" />
              Save
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="min-w-0 lg:col-start-2 lg:row-start-1">
          <ProposalDocument draft={draft} />
        </div>
        <aside className="no-print min-w-0 space-y-5 lg:col-start-1 lg:row-start-1">
          <section className="rounded-card border border-line bg-card p-4">
            <h2 className="font-display text-lg font-semibold">Aurora design</h2>
            <p className="mt-1 text-sm text-muted">
              Export the layout from Aurora CAD and drop it here. Saving stores that image with this proposal only.
            </p>
            <label
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                void onFile(event.dataTransfer.files[0]);
              }}
              className={`mt-3 flex cursor-pointer flex-col items-center gap-2 rounded-card border border-dashed p-3 text-center ${
                dragging ? "border-accent bg-paper" : "border-line"
              }`}
            >
              <img
                src={designSrc(draft)}
                alt=""
                className="h-36 w-full rounded-lg object-cover"
              />
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent">
                <ImagePlus className="size-4" />
                {draft.imageDataUrl ? "Replace Aurora image" : "Add Aurora image"}
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(event) => void onFile(event.target.files?.[0])}
              />
            </label>
            {draft.imageDataUrl && (
              <button
                type="button"
                className="mt-2 text-sm text-muted underline"
                onClick={() => patch({ imageDataUrl: null })}
              >
                Use the sample roof until a new export is added
              </button>
            )}
          </section>

          <section className="space-y-3 rounded-card border border-line bg-card p-4">
            <h2 className="font-display text-lg font-semibold">Customer & site</h2>
            <Field label="Client name" value={draft.clientName} onChange={(clientName) => patch({ clientName })} />
            <Field label="Phone" value={draft.clientPhone} onChange={(clientPhone) => patch({ clientPhone })} />
            <Field label="Email" value={draft.clientEmail} onChange={(clientEmail) => patch({ clientEmail })} />
            <Field label="Address" value={draft.address} onChange={(address) => patch({ address })} />
            <Field label="Date" value={draft.date} onChange={(date) => patch({ date })} />
            <Field label="Prepared by" value={draft.preparedBy} onChange={(preparedBy) => patch({ preparedBy })} />
          </section>

          <section className="space-y-3 rounded-card border border-line bg-card p-4">
            <h2 className="font-display text-lg font-semibold">System</h2>
            <Num label="Module count" value={draft.moduleCount} onChange={(moduleCount) => patchEquipment({ moduleCount })} />
            <Choice
              label="Panel"
              value={draft.moduleModel}
              groups={equipmentGroups(PANELS)}
              onChange={(moduleModel) => patchEquipment({ moduleModel })}
            />
            <label className="block text-sm font-medium">
              System size (kW)
              <input
                readOnly
                value={draft.systemKw.toFixed(3)}
                className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 font-normal text-ink"
              />
              <span className="mt-1 block text-xs font-normal text-muted">
                {panelWatts(draft.moduleModel) == null
                  ? "Select a panel to calculate size"
                  : `${draft.moduleCount} × ${panelWatts(draft.moduleModel)} W`}
              </span>
            </label>
            <Num label="Year-one production (kWh)" value={draft.yearOneKwh} onChange={(yearOneKwh) => patch({ yearOneKwh })} />
            <Choice
              label="Inverter"
              value={draft.inverterModel}
              groups={equipmentGroups(INVERTERS)}
              onChange={(inverterModel) => patchEquipment({ inverterModel })}
            />
            <Num
              label="Inverter count"
              value={draft.inverterCount}
              onChange={(inverterCount) => patchEquipment({ inverterCount })}
              disabled={isEnphaseInverter(draft.inverterModel)}
              hint={isEnphaseInverter(draft.inverterModel) ? "Matches the panel count" : undefined}
            />
            <Choice
              label="Battery"
              value={draft.batteryModel ?? ""}
              groups={equipmentGroups(BATTERIES)}
              allowEmpty
              emptyLabel="None"
              onChange={(batteryModel) =>
                patch({
                  batteryModel,
                  batteryCount: batteryModel ? Math.max(1, draft.batteryCount || 1) : 0,
                })
              }
            />
            {(draft.batteryModel ?? "") !== "" && (
              <Num
                label="Battery count"
                value={draft.batteryCount || 1}
                onChange={(batteryCount) => patch({ batteryCount })}
              />
            )}
          </section>

          <section className="space-y-3 rounded-card border border-line bg-card p-4">
            <h2 className="font-display text-lg font-semibold">Numbers</h2>
            <label className="block text-sm font-medium">
              Product
              <select
                value={draft.product}
                onChange={(event) => {
                  const product = event.target.value as Product;
                  patch({
                    product,
                    termYears: product === "ownership" ? 20 : 25,
                    apr: product === "cash" ? 0 : draft.apr || 8.99,
                  });
                }}
                className="mt-1 w-full rounded-lg border border-line bg-card px-3 py-2"
              >
                <option value="propel">PROPEL prepaid ESA</option>
                <option value="ownership">Credit Human Credit Union</option>
                <option value="cash">Cash</option>
              </select>
            </label>
            <Num label="Price ($)" value={draft.price} onChange={(price) => patch({ price })} />
            <Num label="Current monthly bill ($)" value={draft.monthlyBill} onChange={(monthlyBill) => patch({ monthlyBill })} step="0.01" />
            <Num label="Remaining bill with solar ($)" value={draft.remainingBill} onChange={(remainingBill) => patch({ remainingBill })} step="0.01" />
            <Num label="Monthly REC ($)" value={draft.monthlyRec} onChange={(monthlyRec) => patch({ monthlyRec })} step="0.01" />
            {draft.product !== "cash" && (
              <>
                <div className="flex flex-wrap gap-2">
                  {RATES.map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => patch({ apr: rate, paymentOverride: "" })}
                      className={`rounded-full px-3 py-1 text-sm ${
                        draft.apr === rate ? "bg-accent text-accent-ink" : "bg-paper text-ink"
                      }`}
                    >
                      {rate.toFixed(2)}%
                    </button>
                  ))}
                </div>
                <Num label="APR (%)" value={draft.apr} onChange={(apr) => patch({ apr, paymentOverride: "" })} step="0.01" />
                <Num label="Term (years)" value={draft.termYears} onChange={(termYears) => patch({ termYears })} step="0.5" />
                <Field
                  label="Manual monthly payment (optional)"
                  value={draft.paymentOverride}
                  onChange={(paymentOverride) => patch({ paymentOverride })}
                />
              </>
            )}
          </section>

          <section className="rounded-card border border-line bg-card p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Saved proposals</h2>
              <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1 text-sm font-semibold text-accent">
                <Printer className="size-4" />
                Print
              </button>
            </div>
            {status && <p className="mt-2 text-sm text-muted">{status}</p>}
            <ul className="mt-3 space-y-2">
              {saved.length === 0 && <li className="text-sm text-muted">Nothing saved yet. Each save keeps its own image.</li>}
              {saved.map((item) => (
                <li key={item.id} className="flex items-center gap-2 rounded-lg border border-line p-2">
                  <button type="button" onClick={() => setDraft(syncEquipment(item))} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                    <img src={designSrc(item)} alt="" className="size-12 rounded-md object-cover" />
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{item.clientName || "Untitled"}</span>
                      <span className="block truncate text-xs text-muted">{item.address}</span>
                    </span>
                  </button>
                  <button type="button" aria-label={`Delete ${item.clientName}`} onClick={() => void onDelete(item.id)} className="p-2 text-muted">
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Choice({
  label,
  value,
  groups,
  onChange,
  allowEmpty = false,
  emptyLabel = "None",
}: {
  label: string;
  value: string;
  groups: { manufacturer: string; models: string[] }[];
  onChange: (value: string) => void;
  allowEmpty?: boolean;
  emptyLabel?: string;
}) {
  const known = groups.some((group) => group.models.includes(value));
  return (
    <label className="block text-sm font-medium">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 font-normal"
      >
        {allowEmpty && <option value="">{emptyLabel}</option>}
        {!known && value && <option value={value}>{value}</option>}
        {groups.map((group) => (
          <optgroup key={group.manufacturer} label={group.manufacturer}>
            {group.models.map((model) => (
              <option key={model} value={model}>
                {model.replace(`${group.manufacturer} `, "")}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 font-normal"
      />
    </label>
  );
}

function Num({
  label,
  value,
  onChange,
  step = "1",
  disabled = false,
  hint,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: string;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        type="number"
        step={step}
        disabled={disabled}
        value={Number.isFinite(value) ? Number(value.toFixed(4)) : 0}
        onChange={(event) => onChange(event.target.value === "" ? 0 : Number(event.target.value))}
        className="mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 font-normal disabled:bg-paper disabled:text-ink"
      />
      {hint && <span className="mt-1 block text-xs font-normal text-muted">{hint}</span>}
    </label>
  );
}
