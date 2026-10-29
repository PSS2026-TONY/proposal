import { createServerFn } from "@tanstack/react-start";
import type { UtilityChoice } from "@/lib/proposal-model";

export type UtilityLookup = {
  utilities: UtilityChoice[];
};

type NrelUtility = {
  company_id?: string | number;
  utility_name?: string;
  residential?: number | string;
};

type NrelBody = {
  errors?: string[];
  outputs?: {
    company_id?: string | number;
    residential?: number | string;
    utility_name?: string;
    utility_info?: NrelUtility[];
  };
};

function rateOf(value: unknown): number | null {
  const rate = Number(value);
  return Number.isFinite(rate) ? rate : null;
}

function utilitiesFrom(outputs: NrelBody["outputs"]): UtilityChoice[] {
  const primaryId = String(outputs?.company_id ?? "");
  const primaryName = outputs?.utility_name?.trim() ?? "";
  const primaryRate = rateOf(outputs?.residential);
  const listed = Array.isArray(outputs?.utility_info) ? outputs.utility_info : [];
  const rows =
    listed.length > 0
      ? listed
      : primaryName
        ? [{ company_id: primaryId, utility_name: primaryName, residential: outputs?.residential }]
        : [];
  const seen = new Set<string>();
  const utilities: UtilityChoice[] = [];
  for (const row of rows) {
    const name = row.utility_name?.trim() ?? "";
    if (!name) continue;
    const id = String(row.company_id ?? name);
    if (seen.has(id)) continue;
    seen.add(id);
    const ownRate = rateOf(row.residential);
    const isPrimary = (primaryId !== "" && id === primaryId) || name === primaryName;
    utilities.push({
      id,
      name,
      ratePerKwh: ownRate ?? (isPrimary ? primaryRate : null),
    });
  }
  return utilities;
}

function failure(error: unknown, fallback: string): Error {
  if (error instanceof Error && error.message.startsWith("NREL")) return error;
  const message = error instanceof Error ? error.message : "";
  const safe = message.replace(/api_key=[^&\s]+/gi, "api_key=redacted").slice(0, 160);
  return new Error(safe ? `${fallback} (${safe})` : fallback);
}

async function coordinatesForZip(zip: string): Promise<{ lat: number; lon: number }> {
  let response: Response;
  try {
    response = await fetch(`https://api.zippopotam.us/us/${zip.slice(0, 5)}`, {
      headers: { accept: "application/json", "user-agent": "PublicServiceSolar/1.0" },
      signal: AbortSignal.timeout(12_000),
    });
  } catch (error) {
    throw failure(error, "Could not find that zip.");
  }
  if (response.status === 404) throw new Error("That zip code was not found.");
  if (!response.ok) throw new Error("Could not find that zip.");
  const body = (await response.json()) as {
    places?: { latitude?: string; longitude?: string }[];
  };
  const place = body.places?.[0];
  const lat = Number(place?.latitude);
  const lon = Number(place?.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new Error("That zip code was not found.");
  }
  return { lat, lon };
}

export const lookupUtility = createServerFn({ method: "POST" })
  .validator((input: { zip: string }) => {
    const zip = input.zip.trim();
    if (!/^\d{5}(-\d{4})?$/.test(zip)) {
      throw new Error("Enter a 5-digit zip code.");
    }
    return { zip };
  })
  .handler(async ({ data }): Promise<UtilityLookup> => {
    const key = process.env.NREL_API_KEY?.trim();
    if (!key) {
      throw new Error("NREL_API_KEY is not set on this site.");
    }

    const { lat, lon } = await coordinatesForZip(data.zip);
    const url = new URL("https://developer.nlr.gov/api/utility_rates/v3.json");
    url.searchParams.set("api_key", key);
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lon));

    let body: NrelBody;
    try {
      const response = await fetch(url, {
        headers: { accept: "application/json", "user-agent": "PublicServiceSolar/1.0" },
        signal: AbortSignal.timeout(12_000),
      });
      body = (await response.json()) as NrelBody;
      if (!response.ok && !(body.errors && body.errors.length > 0)) {
        throw new Error("NREL could not look up that zip.");
      }
    } catch (error) {
      throw failure(error, "NREL did not respond. Try the zip again.");
    }

    if (body.errors && body.errors.length > 0) {
      throw new Error(body.errors[0] || "NREL could not find a utility for that zip.");
    }

    const utilities = utilitiesFrom(body.outputs);
    if (utilities.length === 0) {
      throw new Error("NREL did not return a utility for that zip.");
    }
    return { utilities };
  });
