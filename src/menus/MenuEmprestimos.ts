
import { EmprestimoController } from "../controllers/EmprestimoController.js";
import { EntradaTerminal } from "../utils/EntradaTerminal.js";
import type { EmprestimoDetalhado } from "../services/EmprestimoService.js";

export class MenuEmprestimos {
    constructor(
        private readonly emprestimoController: EmprestimoController,
        private readonly entradaTerminal: EntradaTerminal
    ) {}

    async executar(): Promise<void> {
        let continuar = true;

        while (continuar) {
            console.log("\n======== GERENCIAR EMPRÉSTIMOS ========");
            console.log("1. Registrar empréstimo");
            console.log("2. Registrar devolução");
            console.log("3. Listar todos os empréstimos");
            console.log("4. Listar empréstimos ativos");
            console.log("5. Listar empréstimos devolvidos");
            console.log("6. Consultar empréstimo por ID");
            console.log("0. Voltar ao menu principal");

            const opcao = await this.entradaTerminal.perguntarOpcao(
                "Escolha uma opção: ",
                ["1", "2", "3", "4", "5", "6", "0"]
            );

            switch (opcao) {
                case "1":
                    await this.cadastrar();
                    break;
                case "2":
                    await this.devolver();
                    break;
                case "3":
                    await this.listarTodos();
                    break;
                case "4":
                    await this.listarAtivos();
                    break;
                case "5":
                    await this.listarDevolvidos();
                    break;
                case "6":
                    await this.consultar();
                    break;
                case "0":
                    continuar = false;
                    break;
            }
        }
    }

    private async cadastrar(): Promise<void> {
        console.log("\n======== REGISTRAR EMPRÉSTIMO ========");

        const livroId = await this.entradaTerminal.perguntarNumeroInteiro(
            "ID do livro: "
        );

        const clienteId = await this.entradaTerminal.perguntarNumeroInteiro(
            "ID do cliente: "
        );

        const resultado = await this.emprestimoController.cadastrar(
            livroId,
            clienteId
        );

        console.log(resultado.mensagem);

        if (resultado.sucesso && resultado.dados) {
            console.log(`ID do empréstimo: ${resultado.dados.id}`);
            console.log(`ID do livro: ${resultado.dados.livroId}`);
            console.log(`ID do cliente: ${resultado.dados.clienteId}`);
            console.log(
                `Data do empréstimo: ${this.formatarData(resultado.dados.dataEmprestimo)}`
            );
        }
    }

    private async devolver(): Promise<void> {
        console.log("\n======== REGISTRAR DEVOLUÇÃO ========");

        const id = await this.entradaTerminal.perguntarNumeroInteiro(
            "ID do empréstimo: "
        );

        const confirmacao = await this.entradaTerminal.perguntarOpcao(
            "Confirmar devolução? (s/n): ",
            ["s", "n"]
        );

        if (confirmacao === "n") {
            console.log("Devolução cancelada.");
            return;
        }

        const resultado = await this.emprestimoController.devolver(id);

        console.log(resultado.mensagem);

        if (resultado.sucesso && resultado.dados) {
            console.log(`Empréstimo: ${resultado.dados.id}`);
            console.log(
                `Data da devolução: ${this.formatarData(resultado.dados.dataDevolucao)}`
            );
        }
    }

    private async listarTodos(): Promise<void> {
        console.log("\n======== TODOS OS EMPRÉSTIMOS ========");

        const resultado = await this.emprestimoController.listarTodos();

        console.log(resultado.mensagem);

        if (resultado.sucesso && resultado.dados) {
            this.exibirEmprestimos(resultado.dados);
        }
    }

    private async listarAtivos(): Promise<void> {
        console.log("\n======== EMPRÉSTIMOS ATIVOS ========");

        const resultado = await this.emprestimoController.listarAtivos();

        console.log(resultado.mensagem);

        if (resultado.sucesso && resultado.dados) {
            this.exibirEmprestimos(resultado.dados);
        }
    }

    private async listarDevolvidos(): Promise<void> {
        console.log("\n======== EMPRÉSTIMOS DEVOLVIDOS ========");

        const resultado = await this.emprestimoController.listarDevolvidos();

        console.log(resultado.mensagem);

        if (resultado.sucesso && resultado.dados) {
            this.exibirEmprestimos(resultado.dados);
        }
    }

    private async consultar(): Promise<void> {
        console.log("\n======== CONSULTAR EMPRÉSTIMO ========");

        const id = await this.entradaTerminal.perguntarNumeroInteiro(
            "ID do empréstimo: "
        );

        const resultado = await this.emprestimoController.buscarPorId(id);

        console.log(resultado.mensagem);

        if (resultado.sucesso && resultado.dados) {
            this.exibirEmprestimo(resultado.dados);
        }
    }

    private exibirEmprestimos(emprestimos: EmprestimoDetalhado[]): void {
        if (emprestimos.length === 0) {
            console.log("Nenhum empréstimo encontrado.");
            return;
        }

        for (const emprestimo of emprestimos) {
            console.log("--------------------------------");
            this.exibirEmprestimo(emprestimo);
        }
    }

    private exibirEmprestimo(emprestimo: EmprestimoDetalhado): void {
        console.log(`ID: ${emprestimo.id}`);
        console.log(`Livro: ${emprestimo.livro.titulo}`);
        console.log(`Cliente: ${emprestimo.cliente.nome}`);
        console.log(`E-mail: ${emprestimo.cliente.email}`);
        console.log(
            `Data do empréstimo: ${this.formatarData(emprestimo.dataEmprestimo)}`
        );
        console.log(
            `Data da devolução: ${this.formatarData(emprestimo.dataDevolucao)}`
        );

        console.log(
            `Status: ${emprestimo.dataDevolucao === null ? "Ativo" : "Devolvido"}`
        );
    }

    private formatarData(data: Date | null): string {
        if (data === null) {
            return "Não devolvido";
        }

        return data.toLocaleString("pt-BR");
    }
}
