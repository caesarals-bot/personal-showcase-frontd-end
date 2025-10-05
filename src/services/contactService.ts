import type { ContactData } from '@/types/contact.types'
import { contactData } from '@/data/contact.data'

export class ContactService {
    static async getContactData(): Promise<ContactData> {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 200))
        return contactData
    }

    // TODO: Métodos Firebase para panel admin
    // static async getContactDataFromFirebase(): Promise<ContactData> {
    //   const docRef = doc(db, 'personal', 'contact')
    //   const docSnap = await getDoc(docRef)
    //   if (docSnap.exists()) {
    //     return docSnap.data() as ContactData
    //   }
    //   throw new Error('No se encontraron datos de contacto')
    // }

    // static async updateContactData(data: ContactData): Promise<void> {
    //   const docRef = doc(db, 'personal', 'contact')
    //   await setDoc(docRef, data)
    // }
}