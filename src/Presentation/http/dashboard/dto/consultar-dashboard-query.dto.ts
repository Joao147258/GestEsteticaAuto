import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

// ConsultarDashboardQueryDto — valida os filtros de consulta aos endpoints analíticos do Dashboard.
// Exige negocioId obrigatório para isolamento multi-tenant seguro na agregação dos dados.
export class ConsultarDashboardQueryDto {
  @IsString({ message: 'negocioId deve ser uma string válida' })
  @IsNotEmpty({ message: 'negocioId é obrigatório para consultar indicadores do dashboard' })
  negocioId: string;

  @IsOptional()
  @IsDateString({}, { message: 'dataInicio deve ser uma data ISO válida' })
  dataInicio?: string;

  @IsOptional()
  @IsDateString({}, { message: 'dataFim deve ser uma data ISO válida' })
  dataFim?: string;
}
