import { createServerFn } from "@tanstack/react-start";

export type UtilityLookup = {
  utilityName: string;
  ratePerKwh: number;
};

type NrelBody = {
  errors?: string[];
  outputs?: {
    residential?: number | string;
    utility_name?: string;
  };
};

export const lookupUtility = createServerFn({ method: "POST" })
  .validator((input: { address: string }) => {
    const address = input.address.trim();
    if (address.length < 5 || address.length > 180) {
      throw new Error("Enter a zip code or street address.");
    }
    return { address };
  })
  .handler(async ({ data }): Promise<UtilityLookup> => {
    const key = process.env.NREL_API_KEY?.trim();
    if (!key) {
      throw new Error("NREL_API_KEY is not set on this site.");
    }

    const url = new URL("https://developer.nrel.gov/api/utility_rates/v3.json");
    url.searchParams.set("api_key", key);
    url.searchParams.set("address", data.address);

    let body: NrelBody;
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(12_000) });
      body = (await response.json()) as NrelBody;
      if (!response.ok && !(body.errors && body.errors.length > 0)) {
        throw new Error("NREL could not look up that location.");
      }
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("NREL")) throw error;
      throw new Error("NREL did not respond. Try the zip again.");
    }

    if (body.errors && body.errors.length > 0) {
      throw new Error(body.errors[0] || "NREL could not find a utility for that location.");
    }

    const utilityName = body.outputs?.utility_name?.trim() ?? "";
    const ratePerKwh = Number(body.outputs?.residential);
    if (!utilityName || !Number.isFinite(ratePerKwh)) {
      throw new Error("NREL did not return a residential utility for that location.");
    }

    return { utilityName, ratePerKwh };
  });
