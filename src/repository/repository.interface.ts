import { UserDTO } from '../dto/user.dto';
import { User } from '../model/user';

export interface CrudRepository<T> {
  getById: (id: string) => T | null;
  getAll: () => T[];
  create: (user: UserDTO) => User;
  update: (id: string, userDTO: UserDTO) => T | null;
  delete: (id: string) => boolean;
}
