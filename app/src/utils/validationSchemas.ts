// Regex partilhados e schemas zod reutilizados em todos os formulários da aplicação.
import { z } from "zod";

export const REGEX = {
  nome: /^[A-Za-zÀ-ÖØ-öø-ÿ' ]{2,100}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  // mínimo 8 caracteres, pelo menos 1 minúscula, 1 maiúscula e 1 dígito
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&#.,_-]{8,}$/,
  // formato Moçambique: +258 8XX XXX XXX
  telefone: /^\+258\s?[89]\d{2}\s?\d{3}\s?\d{3}$/,
  // Matrícula de Moçambique, formato actual: "ABC 123 MC" (três letras,
  // três algarismos, duas letras da província). Espaços e hífenes são
  // opcionais; o backend grava na forma única.
  // A sigla tem de ser uma das das províncias (Cabo Delgado: CA ou CD,
  // as fontes divergem). A mesma lista está no backend (helper/matricula.py).
  matricula: /^[A-Za-z]{3}[ -]?\d{3}[ -]?(MC|MP|GZ|IB|SF|MN|TT|ZB|NP|NS|CA|CD)$/i,
  codigoLegal: /^[A-Za-zÀ-ÿ0-9ºª.,()\-\s]{3,150}$/,
  numeroAgente: /^[A-Za-z0-9-]{2,20}$/,
  posto: /^[A-Za-zÀ-ÿºª0-9\s.-]{2,100}$/,
  localizacao: /^.{3,200}$/,
  descricao: /^.{5,1000}$/,
};

export const nomeSchema = z
  .string()
  .min(1, "O nome é obrigatório")
  .regex(REGEX.nome, "O nome deve conter apenas letras e espaços (2-100 caracteres)");

export const emailSchema = z
  .string()
  .min(1, "O email é obrigatório")
  .regex(REGEX.email, "Digite um email válido");

export const passwordSchema = z
  .string()
  .min(1, "A senha é obrigatória")
  .regex(
    REGEX.password,
    "A senha deve ter no mínimo 8 caracteres, com maiúscula, minúscula e número"
  );

export const telefoneSchema = z
  .string()
  .min(1, "O número é obrigatório")
  .regex(REGEX.telefone, "Indique um número válido (9 dígitos, começado por 8)");

// Siglas das províncias nas matrículas (província do primeiro registo).
export const PROVINCIAS_MATRICULA: Record<string, string> = {
  MC: "Maputo Cidade",
  MP: "Maputo Província",
  GZ: "Gaza",
  IB: "Inhambane",
  SF: "Sofala",
  MN: "Manica",
  TT: "Tete",
  ZB: "Zambézia",
  NP: "Nampula",
  NS: "Niassa",
  CA: "Cabo Delgado",
};

export const MATRICULA_EXEMPLO = "Ex: ABC 123 MC";
export const MATRICULA_INVALIDA = "Indique uma matrícula válida, no formato ABC 123 MC (três letras, três algarismos e a sigla da província)";

export const matriculaSchema = z
  .string()
  .min(1, "A matrícula é obrigatória")
  .regex(REGEX.matricula, MATRICULA_INVALIDA);

export const codigoLegalSchema = z
  .string()
  .min(1, "O código legal é obrigatório")
  .regex(REGEX.codigoLegal, "Código legal inválido");

export const numeroAgenteSchema = z
  .string()
  .min(1, "O número de agente é obrigatório")
  .regex(REGEX.numeroAgente, "Número de agente inválido (apenas letras, números e hífen)");

export const postoSchema = z
  .string()
  .min(1, "O posto é obrigatório")
  .regex(REGEX.posto, "Posto inválido");

export const localizacaoSchema = z
  .string()
  .min(1, "A localização é obrigatória")
  .regex(REGEX.localizacao, "A localização deve ter entre 3 e 200 caracteres");

export const descricaoSchema = z
  .string()
  .min(1, "A descrição é obrigatória")
  .regex(REGEX.descricao, "A descrição deve ter entre 5 e 1000 caracteres");
