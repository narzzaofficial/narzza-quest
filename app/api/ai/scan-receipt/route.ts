import { getAIProvider } from '@/lib/ai';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        const { imageBase64 }: { imageBase64: string } = await req.json();

        if (!imageBase64) {
            return Response.json({ error: 'Gambar tidak ditemukan.' }, { status: 400 });
        }

        const ai = getAIProvider();

        const system = `Kamu adalah AI Akuntan Forensik tingkat lanjut.
Tugasmu adalah membaca gambar struk belanja atau screenshot bukti transfer bank, lalu mengekstrak informasinya menjadi format JSON.
Format JSON wajib:
{
  "type": "expense" | "income" | "transfer",
  "amount": number,
  "merchant": "string",
  "title": "string",
  "category": "string",
  "context": "string",
  "transferFee": number,
  "assetName": "string",
  "toAssetName": "string"
}

Aturan:
- amount: Angka bulat positif (Nominal pokok transfer/belanja, BUKAN total termasuk admin fee jika dipisah). Hilangkan Rp, koma, titik.
- type: 'transfer' jika ini murni transfer antar rekening bank (misal dari BCA ke Mandiri). 'expense' jika user membayar/jajan (misal struk Alfamart, GoFood, QRIS). 'income' jika ada dana masuk. Default: expense.
- title: Deskripsi maksimal 4 kata (contoh: "Makan Siang", "Bayar Listrik", "Transfer Ke Budi").
- category: Pilih kategori logis. Jika transfer antar bank, isi "Transfer / Convert".
- context: Teks detail, seperti "Berita Transfer" atau detail barang.
- transferFee: Angka bulat positif. BACA struk dengan teliti! Jika ada "Biaya Admin", "Admin Fee", "Biaya Layanan", masukkan angkanya (misal 2500 atau 6500). Jika tidak ada, isi 0.
- merchant: Nama toko penerima, atau nama orang yang menerima/mengirim dana.
- assetName: Cari logo/teks bank SANG PENGIRIM DANA (Misal: "BCA", "Mandiri", "Gopay", "OVO"). Jika tidak ketahuan, biarkan string kosong.
- toAssetName: Cari logo/teks bank SANG PENERIMA DANA (Misal: "SeaBank", "Jago"). Jika bukan transfer, biarkan string kosong.
- Output HANYA JSON.`;

        const messages: any[] = [
            {
                role: 'user',
                content: [
                    { type: 'text', text: 'Tolong ekstrak data transaksi dari gambar struk ini ke dalam JSON json.' },
                    { type: 'image_url', image_url: { url: imageBase64 } }
                ]
            }
        ];

        const result = await ai.generateJSON<{ type: string; amount: number; merchant: string; title: string; category: string; context: string; transferFee: number; assetName: string; toAssetName: string }>({
            system,
            messages,
            maxTokens: 500,
            temperature: 0.1
        });

        return Response.json({ data: result });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal memproses gambar.';
        console.error('Scan Receipt Error:', err);
        return Response.json({ error: message }, { status: 500 });
    }
}
