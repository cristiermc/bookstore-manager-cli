import { Livro } from "../models/Livro.js";
import { LivroRepository } from "../repositories/LivroRepository.js";
import { AutorRepository } from "../repositories/AutorRepository.js";
import { EmprestimoRepository } from "../repositories/EmprestimoRepository.js";

export class LivroService {
    constructor(
        private readonly livroRepository: LivroRepository,
        private readonly autorRepository: AutorRepository,
        private readonly emprestimoRepository: EmprestimoRepository,
    ) {}

    async cadastrar(
        titulo: string,
        autorId: number,
        quantidadeTotal: number
    ): Promise<Livro> {
        const tituloValidado = this.validarTitulo(titulo);
        this.validarId(autorId);
        this.validarQuantidade(quantidadeTotal);

        const autor = await this.autorRepository.buscarPorId(autorId);
        if (!autor) {
            throw new Error(`Autor com ID ${autorId} não encontrado.`);
        }

        const livros = await this.livroRepository.listarTodos();

        const proximoId = livros.reduce(
            (maiorId, livro) => Math.max(maiorId, livro.id),
            0
        ) + 1;

        const novoLivro = new Livro(
            proximoId,
            tituloValidado,
            autorId,
            quantidadeTotal,
            quantidadeTotal
        );

        return this.livroRepository.adicionar(novoLivro);
    }

    async listarTodos(): Promise<Livro[]> {
        return this.livroRepository.listarTodos();
    }

    private validarTitulo(titulo: string): string {
        if (typeof titulo !== "string" || titulo.trim().length === 0) {
            throw new Error("O título do livro é obrigatório e não pode ser vazio.");
        }

        return titulo.trim();
    }

    private validarId(id: number): void {
        if (!Number.isInteger(id) || id <= 0) {
            throw new Error("O ID deve ser um número inteiro positivo.");
        }
    }

    private validarQuantidade(quantidade: number): void {
        if (!Number.isInteger(quantidade) || quantidade < 0) {
            throw new Error("A quantidade deve ser um número inteiro não negativo.");
        }
    }

    async buscarPorId(id: number): Promise<Livro> {
        this.validarId(id);

        const livro = await this.livroRepository.buscarPorId(id);
        if (!livro) {
            throw new Error(`Livro com ID ${id} não encontrado.`);
        }

        return livro;
    }

    async atualizar(
        id: number,
        titulo: string,
        autorId: number,
        quantidadeTotal: number
    ): Promise<Livro> {
        this.validarId(id);
        const tituloValidado = this.validarTitulo(titulo);
        this.validarId(autorId);
        this.validarQuantidade(quantidadeTotal);

        const livroExistente = await this.buscarPorId(id);

        const autor = await this.autorRepository.buscarPorId(autorId);
        if (!autor) {
            throw new Error(`Autor com ID ${autorId} não encontrado.`);
        }

        const quantidadeEmprestada = livroExistente.quantidadeTotal -
            livroExistente.quantidadeDisponivel;

        if (quantidadeTotal < quantidadeEmprestada) {
            throw new Error(
                `A quantidade total não pode ser menor que a quantidade emprestada (${quantidadeEmprestada}).`
            );
        }

        const livroAtualizado = new Livro(
            id,
            tituloValidado,
            autorId,
            quantidadeTotal,
            quantidadeTotal - quantidadeEmprestada
        );

        const resultado = await this.livroRepository.atualizar(livroAtualizado);
        if (!resultado) {
            throw new Error(`Falha ao atualizar o livro com ID ${id}.`);
        }

        return resultado;
    }

    async remover(id: number): Promise<void> {
        this.validarId(id);

        await this.buscarPorId(id);

        const emprestimosAssociados = 
            await this.emprestimoRepository.listarPorLivroId(id);

        if (emprestimosAssociados.length > 0) {
            throw new Error(
                `Não é possível remover o livro com ID ${id} porque existem empréstimos associados.`
            );
        }

        const removido = await this.livroRepository.remover(id);
        if (!removido) {
            throw new Error(`Falha ao remover o livro com ID ${id}.`);
        }
    }
}
