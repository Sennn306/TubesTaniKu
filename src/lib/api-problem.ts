import { NextResponse } from "next/server";
import { z } from "zod";
import { skemaIdPositif } from "@/lib/skema-api";

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  errors?: Record<string, string[] | undefined>;
}

const PROBLEM_CONTENT_TYPE = "application/problem+json; charset=utf-8";

/**
 * Membangun respons HTTP berformat RFC 9457 Problem Details.
 */
export function problemResponse(
  problem: ProblemDetails,
  extraHeaders?: Record<string, string>
): NextResponse<ProblemDetails> {
  return NextResponse.json(problem, {
    status: problem.status,
    headers: {
      "Content-Type": PROBLEM_CONTENT_TYPE,
      ...extraHeaders,
    },
  });
}

/**
 * Mengembalikan respons 400 Bad Request untuk body JSON yang rusak/tidak valid.
 */
export function badJsonProblem(instance?: string): NextResponse<ProblemDetails> {
  return problemResponse({
    type: "https://taniku.local/problems/invalid-json",
    title: "Bad Request",
    status: 400,
    detail: "Body permintaan bukan JSON yang valid atau tidak dapat dibaca.",
    instance,
  });
}

/**
 * Mengembalikan respons 422 Unprocessable Content untuk kegagalan validasi Zod.
 */
export function validationProblem(
  error: z.ZodError,
  instance?: string,
  detail = "Data masukan tidak memenuhi aturan validasi."
): NextResponse<ProblemDetails> {
  const flattened = z.flattenError(error);
  const errors: Record<string, string[] | undefined> = {
    ...flattened.fieldErrors,
  };
  if (flattened.formErrors.length > 0) {
    errors._form = flattened.formErrors;
  }

  return problemResponse({
    type: "https://taniku.local/problems/validation-error",
    title: "Unprocessable Content",
    status: 422,
    detail,
    instance,
    errors,
  });
}

/**
 * Mengembalikan respons 400 Bad Request untuk parameter query atau path yang tidak valid.
 */
export function badRequestProblem(
  detail: string,
  instance?: string,
  errors?: Record<string, string[] | undefined>
): NextResponse<ProblemDetails> {
  return problemResponse({
    type: "https://taniku.local/problems/bad-request",
    title: "Bad Request",
    status: 400,
    detail,
    instance,
    ...(errors ? { errors } : {}),
  });
}

/**
 * Mengembalikan respons 404 Not Found.
 */
export function notFoundProblem(
  detail: string,
  instance?: string
): NextResponse<ProblemDetails> {
  return problemResponse({
    type: "https://taniku.local/problems/not-found",
    title: "Not Found",
    status: 404,
    detail,
    instance,
  });
}

/**
 * Mengembalikan respons 409 Conflict.
 */
export function conflictProblem(
  detail: string,
  instance?: string
): NextResponse<ProblemDetails> {
  return problemResponse({
    type: "https://taniku.local/problems/conflict",
    title: "Conflict",
    status: 409,
    detail,
    instance,
  });
}

/**
 * Mengembalikan respons 405 Method Not Allowed beserta header `Allow`.
 */
export function methodNotAllowedProblem(
  allowedMethods: string[],
  instance?: string
): NextResponse<ProblemDetails> {
  return problemResponse(
    {
      type: "https://taniku.local/problems/method-not-allowed",
      title: "Method Not Allowed",
      status: 405,
      detail: `Metode HTTP tidak didukung pada endpoint ini. Gunakan: ${allowedMethods.join(", ")}.`,
      instance,
    },
    { Allow: allowedMethods.join(", ") }
  );
}

/**
 * Mengembalikan respons 500 Internal Server Error tanpa membocorkan detail internal.
 */
export function internalErrorProblem(
  instance?: string
): NextResponse<ProblemDetails> {
  return problemResponse({
    type: "https://taniku.local/problems/internal-error",
    title: "Internal Server Error",
    status: 500,
    detail: "Terjadi kesalahan internal pada server.",
    instance,
  });
}

/**
 * Membaca dan memvalidasi parameter ID bilangan bulat positif dari segmen path.
 */
export function bacaIdParam(
  rawId: string,
  instance?: string
):
  | { ok: true; id: number }
  | { ok: false; response: NextResponse<ProblemDetails> } {
  const hasil = skemaIdPositif.safeParse(rawId);
  if (!hasil.success) {
    return {
      ok: false,
      response: badRequestProblem(
        "Parameter ID harus berupa bilangan bulat positif.",
        instance,
        { id: hasil.error.issues.map((i) => i.message) }
      ),
    };
  }
  return { ok: true, id: hasil.data };
}

/**
 * Membaca body JSON secara aman; mengembalikan 400 Problem Details jika JSON rusak.
 */
export async function bacaJsonAman(
  request: Request,
  instance?: string
): Promise<
  | { ok: true; data: unknown }
  | { ok: false; response: NextResponse<ProblemDetails> }
> {
  try {
    const data: unknown = await request.json();
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      response: badJsonProblem(instance),
    };
  }
}
