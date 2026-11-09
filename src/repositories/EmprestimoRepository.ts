import { Emprestimo } from "../models/Emprestimo.js";

export class EmprestimoRepository {
    private emprestimos: Emprestimo[];

    constructor(emprestimosIniciais: Emprestimo[] = []) {
        this.emprestimos = emprestimosIniciais.map(
            (emprestimo) => this.copiar(emprestimo)
        );
    }


    private copiar(emprestimo: Emprestimo): Emprestimo {
        return new Emprestimo(
            emprestimo.id,
            emprestimo.livroId,
            emprestimo.clienteId,
            new Date(emprestimo.dataEmprestimo.getTime()),
            emprestimo.dataDevolucao === null
                ? null
                : new Date(emprestimo.dataDevolucao.getTime()),
        );
    }

    async adicionar(emprestimo: Emprestimo): Promise<Emprestimo> {
        const novoEmprestimo = this.copiar(emprestimo);
        this.emprestimos.push(novoEmprestimo);
        return this.copiar(novoEmprestimo);
    }

    async buscarPorId(id: number): Promise<Emprestimo | undefined> {
        const emprestimo = this.emprestimos.find(
            (item) => item.id === id
        );

        if (!emprestimo) {
            return undefined;
        }

        return this.copiar(emprestimo);
    }

    async listarTodos(): Promise<Emprestimo[]> {
        return this.emprestimos.map(
            (emprestimo) => this.copiar(emprestimo)
        );
    }

    async listarPorLivroId(livroId: number): Promise<Emprestimo[]> {
        return this.emprestimos
            .filter((emprestimo) => emprestimo.livroId === livroId)
            .map((emprestimo) => this.copiar(emprestimo));
    }

    async listarPorClienteId(clienteId: number): Promise<Emprestimo[]> {
        return this.emprestimos
            .filter((emprestimo) => emprestimo.clienteId === clienteId)
            .map((emprestimo) => this.copiar(emprestimo));
    }

    async listarAtivos(): Promise<Emprestimo[]> {
        return this.emprestimos
            .filter((emprestimo) => emprestimo.dataDevolucao === null)
            .map((emprestimo) => this.copiar(emprestimo));
    }

    async atualizar(emprestimoAtualizado: Emprestimo): Promise<Emprestimo | undefined> {
        const indice = this.emprestimos.findIndex(
            (emprestimo) => emprestimo.id === emprestimoAtualizado.id
        );

        if (indice === -1) {
            return undefined;
        }

        this.emprestimos[indice] = this.copiar(emprestimoAtualizado);
        return this.copiar(this.emprestimos[indice]);
    }

    async remover(id: number): Promise<boolean> {
        const indice = this.emprestimos.findIndex(
            (emprestimo) => emprestimo.id === id
        );

        if (indice === -1) {
            return false;
        }

        this.emprestimos.splice(indice, 1);
        return true;
    }
}
