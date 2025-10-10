'use server';

import { NextRequest, NextResponse } from 'next/server';
import { v4 as generateRandomId } from 'uuid';
import { ref, uploadBytes, getDownloadURL, } from 'firebase/storage';
import sharp from 'sharp';

import { storage } from '@/library/firebase/serverApp';
import { validateJwt } from '@/library/validateJwt';

export async function POST(req: NextRequest) {
  try {
    let userId = null;
    
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const jwtRes = await validateJwt(authHeader.replace("Bearer ", ""));
      if (!jwtRes || !jwtRes.user_id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = jwtRes.user_id;
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const formData = await req.formData();
    const imageFile = formData.get('image') as File;
    const albumId = formData.get('albumId') as string;
    if (!imageFile || !albumId) {
      return NextResponse.json({ error: 'Missing file or albumId' }, { status: 400 });
    }
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    const webpFile = await sharp(imageBuffer).jpeg({
      quality: 50,
    }).toBuffer({ resolveWithObject: true });

    const imageId = generateRandomId();
    const imageRef = ref(storage, `albums/${albumId}/${imageId}.jpg`);
    await uploadBytes(imageRef, webpFile.data, {
      contentType: 'image/jpeg',
    });
    const imageUrl = await getDownloadURL(imageRef);

    return NextResponse.json({ id: imageId, imageUrl, uploaderId: userId }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Upload failed', details: String(error) }, { status: 500 });
  }
}
