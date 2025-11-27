export interface PessoaCobrancaHistorico {
  codigo: number;
  codigoCobranca: number;
  dataVencimento: string;
  dataPagamento: string;
  valorPagamento: number;
}

export interface PessoaCobranca {
  codigo: number;
  codigoPessoa: number;
  tipoCobranca: string;
  valor: number;
  juros: number;
  multa: number;
  valorTotal: number;
  dataInicio: string;
  diaVencimento: number;
  dataPagamento?: string;
  status: number;
  excluido: boolean;
  historicos?: PessoaCobrancaHistorico[];
  pessoaCobrancaHistorico?: PessoaCobrancaHistorico;
}
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
  destacado?: boolean;
  usuarioId?: number;
  contatos?: PessoaContato[];
  enderecos?: PessoaEndereco[];
}

export interface PessoaContato {
  codigo?: number;
  codigoPessoa?: number;
  email?: string;
  site?: string;
  ddd?: string;
  celular?: string;
  excluido?: boolean;
  tipo?: string;
}

export interface PessoaEndereco {
  codigo?: number;
  codigoPessoa?: number;
  tipo?: string;
  logradouro?: string;
  numrero?: string; // Note: API usa "numrero" (com erro ortográfico)
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  excluido?: boolean;
}

export interface Cobranca {
  codigo: number;
  codigoPessoa: number;
  tipoCobranca: string;
  valor: number;
  juros: number;
  multa?: number;
  valorTotal?: number;
  dataInicio?: string;
  diaVencimento?: number;
  dataVencimento: string;
  dataPagamento: string | null;
  status: number;
  excluido: boolean;
  historicos?: PessoaCobrancaHistorico[];
  pessoaCobrancaHistorico?: PessoaCobrancaHistorico;
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

export interface PessoaFile {
  Arquivo?: string;
  Pasta?: number;
  DataCriacao?: Date;
  CodigoPessoa?: number;
}

export interface ArquivoImagem {
  codigo: string;
  image: string;
  pasta: string;
}

