export interface BatchItem {
  id: string;
  farmerName: string;
  hubName: string;
  commodityName: string;
  weightKg: number;
  grade: 'GRADE_A' | 'GRADE_B';
  harvestDate: string;
  pricePerKg: number;
  imageUrl: string;
}

export const MOCK_BATCHES: BatchItem[] = [
  {
    id: 'BATCH-20261013-001',
    farmerName: 'Pak Joko',
    hubName: 'Micro-Hub Sukamaju',
    commodityName: 'Cabai Merah Keriting',
    weightKg: 25,
    grade: 'GRADE_A',
    harvestDate: '13 Okt 2026',
    pricePerKg: 35000,
    imageUrl: 'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'BATCH-20261013-002',
    farmerName: 'Bu Sri',
    hubName: 'Micro-Hub Sukamaju',
    commodityName: 'Cabai Merah Keriting',
    weightKg: 15,
    grade: 'GRADE_A',
    harvestDate: '13 Okt 2026',
    pricePerKg: 35000,
    imageUrl: 'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'BATCH-20261013-003',
    farmerName: 'Pak Budi',
    hubName: 'Micro-Hub Desa Harapan',
    commodityName: 'Tomat Merah Super',
    weightKg: 40,
    grade: 'GRADE_B',
    harvestDate: '12 Okt 2026',
    pricePerKg: 18000,
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=400',
  },
];