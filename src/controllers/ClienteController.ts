import { Cliente } from "../models/Cliente.js";
import { ClienteService } from "../services/ClienteService.js";
import { Resultado } from "./Resultado.js";

export class ClienteController {
    constructor(
        private readonly clienteService: ClienteService
    ) {}

    async cadastrar(nome: string, email: string): Promise<Resultado<Cliente>> {
        return this.executar(
            () => this.clienteService.cadastrar(nome, email),
            "Cliente cadastrado com sucesso."
        );
    }

    async listarTodos(): Promise<Resultado<Cliente[]>> {
        return this.executar(
            () => this.clienteService.listarTodos(),
            "Clientes listados com sucesso."
        );
    }

    async buscarPorId(id: number): Promise<Resultado<Cliente>> {
        return this.executar(
            () => this.clienteService.buscarPorId(id),
            "Cliente encontrado com sucesso."
        );
    }

    async atualizar(id: number, nome: string, email: string): Promise<Resultado<Cliente>> {
        return this.executar(
            () => this.clienteService.atualizar(id, nome, email),
            "Cliente atualizado com sucesso."
        );
    }

    async remover(id: number): Promise<Resultado<void>> {
        return this.executar(
            () => this.clienteService.remover(id),
            "Cliente removido com sucesso."
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
