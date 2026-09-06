import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Min,
} from "class-validator";

export class CriarVeiculoDto {
    @IsString()
    @IsNotEmpty()
    negocioId!: string;

    @IsString()
    @IsNotEmpty()
    clienteId!: string;

    @IsOptional()
    @IsString()
    placa?: string;

    @IsOptional()
    @IsString()
    chassi?: string;

    @IsOptional()
    @IsString()
    renavam?: string;

    @IsString()
    @IsNotEmpty()
    marca!: string;

    @IsString()
    @IsNotEmpty()
    modelo!: string;

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