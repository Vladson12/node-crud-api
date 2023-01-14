export class UserDTO {
  username: string;
  age: number;
  hobbies: string[];

  constructor(username: string, age: number, hobbies: string[]) {
    this.username = username;
    this.age = age;
    this.hobbies = hobbies;
  }
}
