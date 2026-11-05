import { Autor } from "../models/Autor.js";
import { AutorService } from "../services/AutorService.js";
import { Resultado } from "./Resultado.js";

export class AutorController {
    constructor(
        private readonly autorService: AutorService
    ) {}

    async cadastrar(nome: string): Promise<Resultado<Autor>> {
        return this.executar(
            () => this.autorService.cadastrar(nome),
            "Autor cadastrado com sucesso."
        );
    }

    async listarTodos(): Promise<Resultado<Autor[]>> {
        return this.executar(
            () => this.autorService.listarTodos(),
            "Autores listados com sucesso."
        );
    }

    async buscarPorId(id: number): Promise<Resultado<Autor>> {
        return this.executar(
            () => this.autorService.buscarPorId(id),
            "Autor encontrado com sucesso."
        );
    }

    async atualizar(id: number, nome: string): Promise<Resultado<Autor>> {
        return this.executar(
            () => this.autorService.atualizar(id, nome),
            "Autor atualizado com sucesso."
        );
    }

    async remover(id: number): Promise<Resultado<void>> {
        return this.executar(
            () => this.autorService.remover(id),
            "Autor removido com sucesso."
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
