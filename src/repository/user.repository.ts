import { User } from '../model/user';
import { CrudRepository } from './repository.interface';

const userStore: User[] = [];

function initStore(): void {
  userStore.push(new User('Bobby', 30, ['football', 'movies']));
  userStore.push(new User('Jessica', 23, ['dancing', 'horse races']));
  userStore.push(new User('Marc', 30, ['IT', 'high-tech']));
}

initStore();

export class UserRepository implements CrudRepository<User> {
  getById(id: string): User | null {
    const user = userStore.find((user) => user.id === id);
    if (!user) return null;
    return user;
  }

  getAll(): User[] {
    return userStore;
  }
}
