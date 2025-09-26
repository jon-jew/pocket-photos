import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { mkdir } from 'fs/promises';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
  try {
    // Ensure upload directory exists
    const formData = await req.formData();
    const file = formData.get('image') as File;
    console.log(file);

    





    return NextResponse.json({ message: 'File uploaded', path: `/uploads/${file.name}` });
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed', details: String(error) }, { status: 500 });
  }
}