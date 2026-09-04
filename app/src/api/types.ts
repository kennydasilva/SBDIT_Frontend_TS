// Formato de resposta paginada do backend (DRF PageNumberPagination)
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
