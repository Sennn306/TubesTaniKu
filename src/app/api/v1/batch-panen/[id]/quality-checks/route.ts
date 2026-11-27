import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serialisasiQualityCheck } from "@/lib/api-serializer";
import {
  bacaIdParam,
  internalErrorProblem,
  notFoundProblem,
} from "@/lib/api-problem";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/v1/batch-panen/[id]/quality-checks
 * Mengambil seluruh riwayat QualityCheck untuk satu BatchPanen.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const instance = request.nextUrl.pathname;
  const { id: rawId } = await context.params;

  const idResult = bacaIdParam(rawId, instance);
  if (!idResult.ok) return idResult.response;

  try {
    const batch = await prisma.batchPanen.findUnique({
      where: { id: idResult.id },
      include: {
        qualityChecks: {
          orderBy: { checkedAt: "desc" },
        },
      },
    });

    if (!batch) {
      return notFoundProblem(
        `Batch panen dengan ID ${idResult.id} tidak ditemukan.`,
        instance
      );
    }

    return NextResponse.json(
      {
        data: batch.qualityChecks.map(serialisasiQualityCheck),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "GET /api/v1/batch-panen/[id]/quality-checks error:",
      error
    );
    return internalErrorProblem(instance);
  }
}
