// Modelos de dados da API

export interface Usuario {
  id?: number;
  username: string;
  senha?: string;
  tipo?: number;
}

export interface LoginRequest {
  user: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export interface Pessoa {
  codigo: number;
  nome: string;
  documento: string;
  status?: number;
  contatos?: PessoaContato[];
  enderecos?: PessoaEndereco[];
}

export interface PessoaContato {
  codigo: number;
  codigopesssoa: number;
  email?: string;
  site?: string;
  ddd?: string;
  celular?: string;  
}

export interface PessoaEndereco {
  codigo: number;
  codigopessoa: number;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

export interface Cobranca {
  codigo: number;
  codigopessoa: number;
  pessoa?: Pessoa;
  descricao: string;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  status?: number;
}

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

