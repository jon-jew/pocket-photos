'use server';
import { collection, addDoc, serverTimestamp } from "firebase/firestore"; 

import { db } from "./serverApp";
import { redirect } from "next/navigation";

export async function submitWaitlist(prevAlbumId: string | null, formData: FormData) {
    const email = formData.get('email');
    const phoneNumber = formData.get('phoneNumber');

    const docRef = await addDoc(collection(db, 'waitlist'),  {
        email,
        phoneNumber,
        fromAlbumId: prevAlbumId,
        createdOn: serverTimestamp(),
    });
    if (prevAlbumId) {
        redirect(`/lobby/${prevAlbumId}?waitlist=true`);
    } else {
        redirect('/?waitlist=true');
    }
}
