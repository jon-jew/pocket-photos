import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { mkdir } from 'fs/promises';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function POST(req: NextRequest) {
  try {
    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    const formData = await req.formData();
    console.log(formData)
    const file = formData.get('image') as File;
    console.log(file)
    const data = Object.fromEntries(formData);
    console.log(data)
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(UPLOAD_DIR, file.name);

    await writeFile(filePath, buffer);

    return NextResponse.json({ message: 'File uploaded', path: `/uploads/${file.name}` });
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed', details: String(error) }, { status: 500 });
  }
}