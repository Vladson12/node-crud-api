import { User } from '../model/user';
import { CrudRepository } from './repository.interface';
import { userTable } from '../db/db';
import { UserDTO } from '../dto/user.dto';

export class UserRepository implements CrudRepository<User> {
  getById(id: string): User | null {
    const user = userTable.find((user) => user.id === id);
    if (!user) return null;
    return user;
  }

  getAll(): User[] {
    return userTable;
  }

  create(userDto: UserDTO): User {
    const user = new User(userDto.username, userDto.age, userDto.hobbies);
    userTable.push(user);
    return user;
  }

  update(id: string, userDTO: UserDTO): User | null {
    const user = userTable.find((user) => user.id === id);
    if (user) {
      user.username = userDTO.username;
      user.age = userDTO.age;
      user.hobbies = userDTO.hobbies;
      return user;
    }
    return null;
  }

  delete(id: string): boolean {
    const userIndex = userTable.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      return false;
    }
    userTable.splice(userIndex, 1);
    return true;
  }
}
