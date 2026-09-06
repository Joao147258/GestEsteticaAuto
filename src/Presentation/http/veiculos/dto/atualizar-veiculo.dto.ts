import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Min,
} from "class-validator";

export class AtualizarVeiculoDto {
    @IsString()
    @IsNotEmpty()
    negocioId!: string;

    @IsOptional()
    @IsString()
    placa?: string;

    @IsOptional()
    @IsString()
    marca?: string;

    @IsOptional()
    @IsString()
    modelo?: string;

    @IsOptional()
    @IsInt()
    @Min(1900)
    anoFabricacao?: number;

    @IsOptional()
    @IsInt()
    @Min(1900)
    anoModelo?: number;

    @IsOptional()
    @IsString()
    cor?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    quilometragem?: number;

    @IsOptional()
    @IsString()
    observacoes?: string;
}