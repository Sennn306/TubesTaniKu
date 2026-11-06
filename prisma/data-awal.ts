import { Komoditas, GradeMutu } from "../generated/prisma/client";

export const dataBatchAwal = [
  {
    farmerName: "Budi Santoso",
    commodityName: Komoditas.Cabai_Merah,
    weightKg: 250.5,
    grade: GradeMutu.GRADE_A,
    isOrganic: true,
  },
  {
    farmerName: "Siti Rahma",
    commodityName: Komoditas.Beras_Organik,
    weightKg: 1200.0,
    grade: GradeMutu.GRADE_A,
    isOrganic: true,
  },
  {
    farmerName: "Joko Widodo",
    commodityName: Komoditas.Tomat,
    weightKg: 450.0,
    grade: GradeMutu.GRADE_B,
    isOrganic: false,
  },
];