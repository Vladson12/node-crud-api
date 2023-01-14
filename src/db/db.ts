import { User } from '../model/user';

export const userTable: User[] = [];

function initStore(): void {
  userTable.push(new User('Bobby', 30, ['football', 'movies']));
  userTable.push(new User('Jessica', 23, ['dancing', 'horse races']));
  userTable.push(new User('Marc', 30, ['IT', 'high-tech']));
}

initStore();
