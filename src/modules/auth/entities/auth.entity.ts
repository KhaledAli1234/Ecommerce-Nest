import { LoginCredentialsResponse } from 'src/commen';

export class LoginResponse {
  message: string;
  data: { credentials: LoginCredentialsResponse };
}
