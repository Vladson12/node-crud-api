export interface CrudRepository<T> {
  getById: (id: string) => T | null;
  getAll: () => T[];
}
