import { IsString, MaxLength, MinLength } from 'class-validator';
import { IBrand } from 'src/commen';

export class CreateBrandDto implements Partial<IBrand> {
  @MaxLength(25)
  @MinLength(2)
  @IsString()
  name: string;

  @MaxLength(25)
  @MinLength(2)
  @IsString()
  slogan: string;
}
