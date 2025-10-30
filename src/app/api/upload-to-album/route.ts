'use server';

import { NextRequest, NextResponse } from 'next/server';
import { v4 as generateRandomId } from 'uuid';
import { getDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, } from 'firebase/storage';
import sharp from 'sharp';

import { getAuthenticatedAppForUser } from '@/library/firebase/serverApp';
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
    }

    const formData = await req.formData();
    const imageFile = formData.get('image') as File;
    const albumId = formData.get('albumId') as string;

    if (imageFile.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size too large' }, { status: 400 });
    }
    if (!imageFile || !albumId) {
      return NextResponse.json({ error: 'Missing file or albumId' }, { status: 400 });
    }

    const { db, storage } = await getAuthenticatedAppForUser();

    const albumRef = doc(db, 'albums', albumId);
    const docsnap = await getDoc(albumRef);
    if (!docsnap.exists()) {
      return NextResponse.json({ error: 'Album does not exist' }, { status: 404 });
    }
    const { viewersCanEdit, ownerId } = docsnap.data();
    
    if (!viewersCanEdit && userId !== ownerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    const webpFile = await sharp(imageBuffer).jpeg({
      quality: 80,
    }).toBuffer({ resolveWithObject: true });

    const imageId = generateRandomId();
    const imageRef = ref(storage, `albums/${albumId}/${imageId}.jpg`);
    await uploadBytes(imageRef, webpFile.data, {
      contentType: 'image/jpeg',
    });
    const imageUrl = await getDownloadURL(imageRef);

    return NextResponse.json({
      id: imageId, imageUrl,
      uploaderId: userId,
      uploadedOn: Date.now(),
      reactionString: '',
      reactions: [],
    }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Upload failed', details: String(error) }, { status: 500 });
  }
}
