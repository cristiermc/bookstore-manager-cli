import { Livro } from "../models/Livro.js";
import { LivroService } from "../services/LivroService.js";
import { Resultado } from "./Resultado.js";

export class LivroController {
    constructor(
        private readonly livroService: LivroService
    ) {}

    async cadastrar(titulo: string, autorId: number, quantidadeTotal: number): Promise<Resultado<Livro>> {
        return this.executar(
            () => this.livroService.cadastrar(titulo, autorId, quantidadeTotal),
            "Livro cadastrado com sucesso."
        );
    }

    async listarTodos(): Promise<Resultado<Livro[]>> {
        return this.executar(
            () => this.livroService.listarTodos(),
            "Livros listados com sucesso."
        );
    }

    async buscarPorId(id: number): Promise<Resultado<Livro>> {
        return this.executar(
            () => this.livroService.buscarPorId(id),
            "Livro encontrado com sucesso."
        );
    }

    async atualizar(id: number, titulo: string, autorId: number, quantidadeTotal: number): Promise<Resultado<Livro>> {
        return this.executar(
            () => this.livroService.atualizar(id, titulo, autorId, quantidadeTotal),
            "Livro atualizado com sucesso."
        );
    }

    async remover(id: number): Promise<Resultado<void>> {
        return this.executar(
            () => this.livroService.remover(id),
            "Livro removido com sucesso."
        );
    }

    private async executar<T>(operacao: () => Promise<T>, mensagemSucesso: string): Promise<Resultado<T>> {
        try {
            const dados = await operacao();

            return { sucesso: true, mensagem: mensagemSucesso, dados };
        } catch (error: unknown) {
            return { sucesso: false, mensagem: error instanceof Error ? error.message : "Ocorreu um erro inesperado." };
        }
    }
}
