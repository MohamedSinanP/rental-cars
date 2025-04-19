import { Role } from "../types/types";
import { userData } from "../types/user";




export default interface IUserService {
  fetchUser(userId: string): Promise<userData>;
}