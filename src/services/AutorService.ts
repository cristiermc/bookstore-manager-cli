import { Autor } from "../models/Autor.js";
import { AutorRepository } from "../repositories/AutorRepository.js";
import { LivroRepository } from "../repositories/LivroRepository.js";

export class AutorService {
    constructor(
        private readonly autorRepository: AutorRepository,
        private readonly livroRepository: LivroRepository
    ) {}

    async cadastrar(nome: string): Promise<Autor> {
        const nomeValidado = this.validarNome(nome);
        const autores = await this.autorRepository.listarTodos();

        const proximoId = autores.reduce(
            (maiorId, autor) => Math.max(maiorId, autor.id), 0,) + 1;

        const novoAutor = new Autor(proximoId, nomeValidado);
        return this.autorRepository.adicionar(novoAutor);
    }

    async listarTodos(): Promise<Autor[]> {
        return this.autorRepository.listarTodos();
    }

    async buscarPorId(id: number): Promise<Autor> {
        this.validarId(id);

        const autor = await this.autorRepository.buscarPorId(id);
        if (!autor) {
            throw new Error(`Autor com ID ${id} não encontrado.`);
        }
        return autor;

    }
    async atualizar(id: number, nome: string): Promise<Autor> {
        this.validarId(id);
        const nomeValidado = this.validarNome(nome);

        await this.buscarPorId(id);

        const autorAtualizado = new Autor(id, nomeValidado);
        const resultado = await this.autorRepository.atualizar(autorAtualizado);
        if (!resultado) {
            throw new Error(`Não foi possível atualizar o autor com ID ${id}.`);
        }
        return resultado;
    }

    async remover(id: number): Promise<void> {
        this.validarId(id);

        await this.buscarPorId(id);

        const livrosAssociados = await this.livroRepository.listarPorAutorId(id);
        if (livrosAssociados.length > 0) {
            throw new Error(`Não é possível remover o autor com ID ${id} pois ele possui livros associados.`);
        }

        const removido = await this.autorRepository.remover(id);
        if (!removido) {
            throw new Error(`Não foi possível remover o autor com ID ${id}.`);
        }
    }

    private validarNome(nome: string): string {
        if (typeof nome !== 'string' || nome.trim().length === 0) {
            throw new Error('O nome do autor é obrigatório.');
        }
        return nome.trim();
    }

    private validarId(id: number): void {
        if (!Number.isInteger(id) || id <= 0) {
            throw new Error('O ID do autor deve ser um número positivo.');
        }
    }
}
