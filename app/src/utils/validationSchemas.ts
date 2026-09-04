// Regex partilhados e schemas zod reutilizados em todos os formulários da aplicação.
import { z } from "zod";

export const REGEX = {
  nome: /^[A-Za-zÀ-ÖØ-öø-ÿ' ]{2,100}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  // mínimo 8 caracteres, pelo menos 1 minúscula, 1 maiúscula e 1 dígito
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&#.,_-]{8,}$/,
  // formato Moçambique: +258 8XX XXX XXX
  telefone: /^\+258\s?[89]\d{2}\s?\d{3}\s?\d{3}$/,
  // formato de matrícula: AB-12-CD
  matricula: /^[A-Za-z]{2}-\d{2}-[A-Za-z]{2}$/,
  codigoLegal: /^[A-Za-zÀ-ÿ0-9ºª.,()\-\s]{3,150}$/,
  numeroAgente: /^[A-Za-z0-9-]{2,20}$/,
  posto: /^[A-Za-zÀ-ÿ0-9\s.-]{2,100}$/,
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
  .regex(REGEX.telefone, "Digite um número válido no formato +258 8XX XXX XXX");

export const matriculaSchema = z
  .string()
  .min(1, "A matrícula é obrigatória")
  .regex(REGEX.matricula, "Digite uma matrícula válida no formato AB-12-CD");

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
