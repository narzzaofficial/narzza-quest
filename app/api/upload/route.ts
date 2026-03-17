import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Inisialisasi koneksi ke DO Spaces
const s3Client = new S3Client({
    endpoint: process.env.DO_SPACES_ENDPOINT!,
    region: "us-east-1", // DO Spaces secara default memakai region S3 klasik ini di SDK
    credentials: {
        accessKeyId: process.env.DO_SPACES_KEY!,
        secretAccessKey: process.env.DO_SPACES_SECRET!
    }
});

export async function POST(req: NextRequest) {
    try {
        // 1. Tangkap file gambar dari form frontend
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const questId = formData.get('questId') as string;

        if (!file) {
            return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
        }

        // 2. Ubah file menjadi format Buffer yang bisa dibaca server
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 3. Buat nama file yang unik dan aman dari spasi
        const safeFileName = file.name.replace(/\s+/g, '_');
        const fileName = `quest-proofs/${questId}/${Date.now()}_${safeFileName}`;

        
        // 4. Kirim ke DigitalOcean Spaces
        await s3Client.send(new PutObjectCommand({
            Bucket: process.env.DO_SPACES_BUCKET!,
            Key: fileName,
            Body: buffer,
            ACL: 'public-read', // Agar foto bisa dilihat oleh GM di dashboard
            ContentType: file.type,
        }));

       
        const endpointDomain = process.env.DO_SPACES_ENDPOINT?.replace('https://', '');
        const fileUrl = `https://${process.env.DO_SPACES_BUCKET}.${endpointDomain}/${fileName}`;

        return NextResponse.json({ url: fileUrl }, { status: 200 });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Gagal mengunggah file ke server" }, { status: 500 });
    }
}