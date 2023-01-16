import { User } from '../model/user';
import { CrudRepository } from './repository.interface';
import { userTable } from '../db/db';
import { UserDTO } from '../dto/user.dto';
export class UserRepository implements CrudRepository<User> {
  userTable: User[];

  constructor(userTable: User[]) {
    this.userTable = userTable;
  }

  readConnections = 0;
  writeConnections = 0;

  getById(id: string): User | null {
    this.readConnections++;
    while (this.writeConnections !== 0) {}
    const user = userTable.find((user) => user.id === id);
    if (!user) return null;
    this.readConnections--;
    return user;
  }

  getAll(): User[] {
    while (this.writeConnections !== 0) {}
    this.readConnections++;
    return userTable;
    this.readConnections++;
  }

  create(userDto: UserDTO): User {
    while (this.writeConnections !== 0) {}
    this.writeConnections++;
    const user = new User(userDto.username, userDto.age, userDto.hobbies);
    userTable.push(user);
    this.writeConnections--;
    return user;
  }

  update(id: string, userDTO: UserDTO): User | null {
    while (this.writeConnections !== 0) {}
    this.writeConnections++;
    const user = userTable.find((user) => user.id === id);
    if (user) {
      user.username = userDTO.username;
      user.age = userDTO.age;
      user.hobbies = userDTO.hobbies;
      this.writeConnections--;
      return user;
    }
    this.writeConnections--;
    return null;
  }

  delete(id: string): boolean {
    while (this.writeConnections !== 0) {}
    this.writeConnections++;
    const userIndex = userTable.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      this.writeConnections--;
      return false;
    }
    userTable.splice(userIndex, 1);
    this.writeConnections--;
    return true;
  }
}
