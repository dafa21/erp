export interface LoginRequestDto {
  username: string;
  password?: string;
}

export interface UserDto {
  id: number | string;
  username: string;
  role: string;
  clinic_id?: string | number;
  clinic_name?: string;
  accessible_menus?: string;
  [key: string]: any;
}

export interface LoginResponseDto {
  success: boolean;
  user?: UserDto;
  message?: string;
  token?: string;
}
