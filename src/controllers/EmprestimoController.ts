
import { Emprestimo } from "../models/Emprestimo.js";
import { EmprestimoDetalhado, EmprestimoService } from "../services/EmprestimoService.js";
import { Resultado } from "./Resultado.js";

export class EmprestimoController {
    constructor(
        private readonly emprestimoService: EmprestimoService
    ) {}

    async cadastrar(
        livroId: number,
        clienteId: number
    ): Promise<Resultado<Emprestimo>> {
        return this.executar(
            () => this.emprestimoService.cadastrar(livroId, clienteId),
            "Empréstimo cadastrado com sucesso."
        );
    }

    async devolver(id: number): Promise<Resultado<Emprestimo>> {
        return this.executar(
            () => this.emprestimoService.devolver(id),
            "Livro devolvido com sucesso."
        );
    }

    async buscarPorId(id: number): Promise<Resultado<EmprestimoDetalhado>> {
        try {
            const emprestimo = await this.emprestimoService.buscarPorId(id);

            if (!emprestimo) {
                return {
                    sucesso: false,
                    mensagem: "Empréstimo não encontrado."
                };
            }

            return {
                sucesso: true,
                mensagem: "Empréstimo encontrado com sucesso.",
                dados: emprestimo
            };
        } catch (error: unknown) {
            return {
                sucesso: false,
                mensagem: error instanceof Error
                    ? error.message
                    : "Ocorreu um erro inesperado."
            };
        }
    }

    async listarTodos(): Promise<Resultado<EmprestimoDetalhado[]>> {
        return this.executar(
            () => this.emprestimoService.listarTodos(),
            "Empréstimos listados com sucesso."
        );
    }

    async listarAtivos(): Promise<Resultado<EmprestimoDetalhado[]>> {
        return this.executar(
            () => this.emprestimoService.listarAtivos(),
            "Empréstimos ativos listados com sucesso."
        );
    }

    async listarDevolvidos(): Promise<Resultado<EmprestimoDetalhado[]>> {
        return this.executar(
            () => this.emprestimoService.listarDevolvidos(),
            "Empréstimos devolvidos listados com sucesso."
        );
    }

    private async executar<T>(
        operacao: () => Promise<T>,
        mensagemSucesso: string
    ): Promise<Resultado<T>> {
        try {
            const dados = await operacao();

            return {
                sucesso: true,
                mensagem: mensagemSucesso,
                dados
            };
        } catch (error: unknown) {
            return {
                sucesso: false,
                mensagem: error instanceof Error
                    ? error.message
                    : "Ocorreu um erro inesperado."
            };
        }
    }
}
