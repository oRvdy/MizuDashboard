import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Clan } from '@/types';

export function useClan() {
    const { data: session, status } = useSession();
    const [clan, setClan] = useState<Clan | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchClan = useCallback(async () => {
        if (!session?.user?.id) {
            console.warn('Sem ID do usuário na sessão:', session);
            setLoading(false);
            return;
        }

        try {
            console.log('Buscando clan para usuário:', {
                id: session.user.id,
                name: session.user.name
            });
            setLoading(true);
            
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BOT_API_URL}/api/clans/user?userId=${session.user.id}`,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            const data = await response.json();
            console.log('Resposta da API:', data);

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao buscar clan');
            }

            setClan(data);
        } catch (err: any) {
            console.error('Erro ao buscar clan:', {
                error: err,
                session: session
            });
            setError(err.message || 'Erro ao buscar informações do clan');
            setClan(null);
        } finally {
            setLoading(false);
        }
    }, [session]);

    useEffect(() => {
        console.log('Session status:', status);
        console.log('User ID:', session?.user?.id);
        fetchClan();
    }, [fetchClan]);

    return {
        clan,
        loading,
        error,
        isOwner: clan?.isOwner || false,
        refresh: fetchClan
    };
}
