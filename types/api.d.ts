
// Adicione este arquivo para declarações de tipo globais
declare module 'uuid';

interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

interface FetchOptions extends RequestInit {
  headers?: HeadersInit;
}