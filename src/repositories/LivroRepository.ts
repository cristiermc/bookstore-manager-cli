import { Livro } from "../models/Livro.js";

export class LivroRepository {
    private livros: Livro[];

    constructor(livrosIniciais: Livro[] = []) {
        this.livros = livrosIniciais.map(
            (livro) => new Livro(
                livro.id,
                livro.titulo,
                livro.autorId,
                livro.quantidadeTotal,
                livro.quantidadeDisponivel
            ),
        );
    }

    async adicionar(livro: Livro): Promise<Livro> {
        const novoLivro = new Livro(
            livro.id,
            livro.titulo,
            livro.autorId,
            livro.quantidadeTotal,
            livro.quantidadeDisponivel,
        );
        this.livros.push(novoLivro);
        return new Livro(
            novoLivro.id,
            novoLivro.titulo,
            novoLivro.autorId,
            novoLivro.quantidadeTotal,
            novoLivro.quantidadeDisponivel,
        );
    }

    async buscarPorId(id: number): Promise<Livro | undefined> {
        const livro = this.livros.find((item) => item.id === id);

        if (!livro) {
            return undefined;
        }

        return new Livro(
            livro.id,
            livro.titulo,
            livro.autorId,
            livro.quantidadeTotal,
            livro.quantidadeDisponivel
        );
    }

    async listarTodos(): Promise<Livro[]> {
        return this.livros.map(
            (livro) => new Livro(
                livro.id,
                livro.titulo,
                livro.autorId,
                livro.quantidadeTotal,
                livro.quantidadeDisponivel
            )
        );
    }

    async listarPorAutorId(autorId: number): Promise<Livro[]> {
        return this.livros
            .filter((livro) => livro.autorId === autorId)
            .map(
                (livro) => new Livro(
                    livro.id,
                    livro.titulo,
                    livro.autorId,
                    livro.quantidadeTotal,
                    livro.quantidadeDisponivel
                )
            );
    }

    async atualizar(livroAtualizado: Livro): Promise<Livro | undefined> {
        const indice = this.livros.findIndex((livro) => livro.id === livroAtualizado.id);

        if (indice === -1) {
            return undefined;
        }

        this.livros[indice] = new Livro(
            livroAtualizado.id,
            livroAtualizado.titulo,
            livroAtualizado.autorId,
            livroAtualizado.quantidadeTotal,
            livroAtualizado.quantidadeDisponivel
        );

        const livro = this.livros[indice];
        return new Livro(
            livro.id,
            livro.titulo,
            livro.autorId,
            livro.quantidadeTotal,
            livro.quantidadeDisponivel
        );
    }

    async remover(id: number): Promise<boolean> {
        const indice = this.livros.findIndex((livro) => livro.id === id);

        if (indice === -1) {
            return false;
        }

        this.livros.splice(indice, 1);
        return true;
    }
}
