'use client'

import { useEffect, useState } from 'react'

export default function TestPage() {
    const [apiStatus, setApiStatus] = useState<string>('Testando...')
    const [error, setError] = useState<string | null>(null)
    const [clans, setClans] = useState<any>(null)
    const BOT_API_URL = process.env.NEXT_PUBLIC_BOT_API_URL

    useEffect(() => {
        async function testConnection() {
            try {
                console.log('Tentando conectar em:', `${BOT_API_URL}/api/test`);
                
                const response = await fetch(`${BOT_API_URL}/api/test`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                console.log('Status da resposta:', response.status);
                
                if (!response.ok) {
                    const text = await response.text();
                    console.log('Resposta de erro:', text);
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Resposta da API:', data);
                setApiStatus(`Bot: ${data.botUsername} (${data.botStatus})`);
                setError(null);

            } catch (err: any) {
                console.error('Erro completo:', err);
                setError(err?.message || 'Erro desconhecido');
                setApiStatus('Falha na conexão');
            }
        }

        testConnection();
    }, [BOT_API_URL]);

    return (
        <div className="p-8">
            <h1 className="text-2xl mb-4">Página de Teste</h1>
            
            <div className="bg-gray-800 p-4 rounded-lg mb-4">
                <h2>Configuração:</h2>
                <pre className="text-yellow-400">BOT_API_URL: {BOT_API_URL || 'não definida'}</pre>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg mb-4">
                <h2>Status da API:</h2>
                <pre className={error ? 'text-red-400' : 'text-green-400'}>
                    {apiStatus}
                </pre>
                {error && (
                    <pre className="text-red-400 mt-2">
                        Erro: {error}
                    </pre>
                )}
            </div>

            {clans && (
                <div className="bg-gray-800 p-4 rounded-lg">
                    <h2>Clans carregados:</h2>
                    <pre className="text-sm text-gray-400 mt-2">
                        {JSON.stringify(clans, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    )
}
