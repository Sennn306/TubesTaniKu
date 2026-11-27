import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "../../../../../../generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { keKomoditasPrisma, skemaBatchPanenPatch } from "@/lib/skema-api";
import { serialisasiBatch } from "@/lib/api-serializer";
import {
  bacaIdParam,
  bacaJsonAman,
  conflictProblem,
  internalErrorProblem,
  notFoundProblem,
  validationProblem,
} from "@/lib/api-problem";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/v1/batch-panen/[id]
 * Mengambil detail satu BatchPanen berdasarkan ID bilangan bulat positif.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const instance = request.nextUrl.pathname;
  const { id: rawId } = await context.params;

  const idResult = bacaIdParam(rawId, instance);
  if (!idResult.ok) return idResult.response;

  try {
    const batch = await prisma.batchPanen.findUnique({
      where: { id: idResult.id },
    });

    if (!batch) {
      return notFoundProblem(
        `Batch panen dengan ID ${idResult.id} tidak ditemukan.`,
        instance
      );
    }

    return NextResponse.json({ data: serialisasiBatch(batch) }, { status: 200 });
  } catch (error) {
    console.error("GET /api/v1/batch-panen/[id] error:", error);
    return internalErrorProblem(instance);
  }
}

/**
 * PATCH /api/v1/batch-panen/[id]
 * Memperbarui sebagian field BatchPanen (minimal satu field wajib diisi).
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const instance = request.nextUrl.pathname;
  const { id: rawId } = await context.params;

  const idResult = bacaIdParam(rawId, instance);
  if (!idResult.ok) return idResult.response;

  const jsonResult = await bacaJsonAman(request, instance);
  if (!jsonResult.ok) return jsonResult.response;

  const parsedBody = skemaBatchPanenPatch.safeParse(jsonResult.data);
  if (!parsedBody.success) {
    return validationProblem(parsedBody.error, instance);
  }

  const { commodityName, ...rest } = parsedBody.data;
  const updateData: Prisma.BatchPanenUpdateInput = {
    ...rest,
    ...(commodityName !== undefined
      ? { commodityName: keKomoditasPrisma(commodityName) }
      : {}),
  };

  try {
    const updated = await prisma.batchPanen.update({
      where: { id: idResult.id },
      data: updateData,
    });

    return NextResponse.json(
      { data: serialisasiBatch(updated) },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return notFoundProblem(
          `Batch panen dengan ID ${idResult.id} tidak ditemukan.`,
          instance
        );
      }
      if (error.code === "P2002") {
        return conflictProblem(
          "Batch panen dengan kombinasi petani dan komoditas tersebut sudah terdaftar.",
          instance
        );
      }
    }
    console.error("PATCH /api/v1/batch-panen/[id] error:", error);
    return internalErrorProblem(instance);
  }
}

/**
 * DELETE /api/v1/batch-panen/[id]
 * Menghapus BatchPanen jika tidak memiliki relasi QualityCheck (onDelete: Restrict -> 409).
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const instance = request.nextUrl.pathname;
  const { id: rawId } = await context.params;

  const idResult = bacaIdParam(rawId, instance);
  if (!idResult.ok) return idResult.response;

  try {
    await prisma.batchPanen.delete({
      where: { id: idResult.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return notFoundProblem(
          `Batch panen dengan ID ${idResult.id} tidak ditemukan.`,
          instance
        );
      }
      if (error.code === "P2003") {
        return conflictProblem(
          "Batch panen tidak dapat dihapus karena masih memiliki catatan QualityCheck terkait.",
          instance
        );
      }
    }
    console.error("DELETE /api/v1/batch-panen/[id] error:", error);
    return internalErrorProblem(instance);
  }
}
