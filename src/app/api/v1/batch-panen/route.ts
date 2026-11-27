import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma, type BatchPanen } from "../../../../../generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  dariKomoditasPrisma,
  keKomoditasPrisma,
  skemaBatchPanenPost,
  skemaQueryBatchPanen,
} from "@/lib/skema-api";
import {
  bacaJsonAman,
  badRequestProblem,
  conflictProblem,
  internalErrorProblem,
  validationProblem,
} from "@/lib/api-problem";

function serialisasiBatch(batch: BatchPanen) {
  return {
    id: batch.id,
    farmerName: batch.farmerName,
    commodityName: dariKomoditasPrisma(batch.commodityName),
    weightKg: batch.weightKg,
    grade: batch.grade,
    isOrganic: batch.isOrganic,
    createdAt: batch.createdAt.toISOString(),
  };
}

/**
 * GET /api/v1/batch-panen
 * Mengambil daftar koleksi BatchPanen dengan paginasi dan filter komoditas.
 */
export async function GET(request: NextRequest) {
  const instance = request.nextUrl.pathname;
  const sp = request.nextUrl.searchParams;

  const parsedQuery = skemaQueryBatchPanen.safeParse({
    halaman: sp.get("halaman") ?? undefined,
    batas: sp.get("batas") ?? undefined,
    komoditas: sp.get("komoditas") ?? undefined,
  });

  if (!parsedQuery.success) {
    const flattened = z.flattenError(parsedQuery.error);
    return badRequestProblem(
      "Parameter kueri tidak valid.",
      instance,
      flattened.fieldErrors
    );
  }

  const { halaman, batas, komoditas } = parsedQuery.data;
  const where: Prisma.BatchPanenWhereInput = komoditas
    ? { commodityName: keKomoditasPrisma(komoditas) }
    : {};

  try {
    const [items, total] = await prisma.$transaction([
      prisma.batchPanen.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (halaman - 1) * batas,
        take: batas,
      }),
      prisma.batchPanen.count({ where }),
    ]);

    return NextResponse.json(
      {
        data: items.map(serialisasiBatch),
        meta: {
          halaman,
          batas,
          total,
          totalHalaman: total === 0 ? 0 : Math.ceil(total / batas),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/v1/batch-panen error:", error);
    return internalErrorProblem(instance);
  }
}

/**
 * POST /api/v1/batch-panen
 * Membuat entitas BatchPanen baru dengan validasi Zod dan deteksi konflik unik.
 */
export async function POST(request: NextRequest) {
  const instance = request.nextUrl.pathname;

  const jsonResult = await bacaJsonAman(request, instance);
  if (!jsonResult.ok) {
    return jsonResult.response;
  }

  const parsedBody = skemaBatchPanenPost.safeParse(jsonResult.data);
  if (!parsedBody.success) {
    return validationProblem(parsedBody.error, instance);
  }

  const { farmerName, commodityName, weightKg, grade, isOrganic } =
    parsedBody.data;

  try {
    const created = await prisma.batchPanen.create({
      data: {
        farmerName,
        commodityName: keKomoditasPrisma(commodityName),
        weightKg,
        grade,
        isOrganic,
      },
    });

    const lokasi = `${instance}/${created.id}`;
    return NextResponse.json(
      { data: serialisasiBatch(created) },
      {
        status: 201,
        headers: {
          Location: lokasi,
        },
      }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return conflictProblem(
        "Batch panen dengan kombinasi petani dan komoditas tersebut sudah terdaftar.",
        instance
      );
    }
    console.error("POST /api/v1/batch-panen error:", error);
    return internalErrorProblem(instance);
  }
}
