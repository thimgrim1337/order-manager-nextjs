import { use } from "react";
import z from "zod";
import { RawSearchParams } from "@/types/types";

export default function useValidatedSearchParams<T extends z.ZodType>(
	searchParamsPromise: Promise<RawSearchParams>,
	schema: T,
) {
	const raw = use(searchParamsPromise);

	return schema.safeParse(raw);
}
