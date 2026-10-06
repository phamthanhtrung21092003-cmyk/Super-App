import { IsBoolean, IsOptional } from 'class-validator';

export class ToggleOpenDto {
  @IsOptional()
  @IsBoolean()
  isOpen?: boolean;

  @IsOptional()
  @IsBoolean()
  autoAcceptOrder?: boolean;
}
