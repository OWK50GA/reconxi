import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    @MaxLength(255)
    email: string;

    @ApiProperty({ minLength: 8, maxLength: 128 })
    @IsString()
    @MinLength(8)
    @MaxLength(128)
    password: string;

    @ApiProperty({ example: 'Mike' })
    @IsString()
    @MinLength(1)
    @MaxLength(255)
    firstName: string;

    @ApiProperty({ example: 'Ross' })
    @IsString()
    @MinLength(1)
    @MaxLength(255)
    lastName: string;
}