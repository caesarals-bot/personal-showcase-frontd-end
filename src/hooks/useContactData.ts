import { useState, useEffect } from 'react'
import type { ContactData } from '@/types/contact.types'
import { ContactService } from '@/services/contactService'

export function useContactData() {
    const [data, setData] = useState<ContactData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const result = await ContactService.getContactData()
                setData(result)
            } catch (err) {
                setError(err as Error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    return { data, loading, error }
}