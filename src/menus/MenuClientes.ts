import { ClienteController } from "../controllers/ClienteController.js";
import { EntradaTerminal } from "../utils/EntradaTerminal.js";

export class MenuClientes {
    constructor(
        private readonly clienteController: ClienteController,
        private readonly entradaTerminal: EntradaTerminal
    ) {}

    async executar(): Promise<void> {
        let continuar = true;

        while (continuar) {
            console.log("\n======== GERENCIAR CLIENTES ========");
            console.log("1. Cadastrar cliente");
            console.log("2. Listar clientes");
            console.log("3. Consultar cliente");
            console.log("4. Atualizar cliente");
            console.log("5. Excluir cliente");
            console.log("0. Voltar ao menu principal");

            const opcao = await this.entradaTerminal.perguntarOpcao(
                "Escolha uma opção: ",
                ["1", "2", "3", "4", "5", "0"]
            );

            switch (opcao) {
                case "1":
                    await this.cadastrar();
                    break;
                case "2":
                    await this.listar();
                    break;
                case "3":
                    await this.consultar();
                    break;
                case "4":
                    await this.atualizar();
                    break;
                case "5":
                    await this.remover();
                    break;
                case "0":
                    continuar = false;
                    break;
            }
        }
    }

    private async cadastrar(): Promise<void> {
        console.log("\n======== CADASTRAR CLIENTE ========");

        const nome = await this.entradaTerminal.perguntarTexto(
            "Digite o nome do cliente: "
        );

        const email = await this.entradaTerminal.perguntarTexto(
            "Digite o email do cliente: "
        );

        const resultado = await this.clienteController.cadastrar(nome, email);

        console.log(resultado.mensagem);

        if (resultado.sucesso && resultado.dados) {
            console.log(`ID: ${resultado.dados.id}`);
            console.log(`Nome: ${resultado.dados.nome}`);
            console.log(`Email: ${resultado.dados.email}`);
        }
    }

    private async listar(): Promise<void> {
        console.log("\n======== LISTAR CLIENTES ========");

        const resultado = await this.clienteController.listarTodos();

        console.log(resultado.mensagem);

        if (resultado.sucesso && resultado.dados) {
            if (resultado.dados.length === 0) {
                console.log("Nenhum cliente cadastrado.");
                return;
            }

            for (const cliente of resultado.dados) {
                console.log("-------------------------------");
                console.log(`ID: ${cliente.id}`);
                console.log(`Nome: ${cliente.nome}`);
                console.log(`Email: ${cliente.email}`);
            }
        }
    }

    private async consultar(): Promise<void> {
        console.log("\n======== CONSULTAR CLIENTE ========");

        const id = await this.entradaTerminal.perguntarNumeroInteiro(
            "Digite o ID do cliente: "
        );

        const resultado = await this.clienteController.buscarPorId(id);

        console.log(resultado.mensagem);

        if (resultado.sucesso && resultado.dados) {
            console.log(`ID: ${resultado.dados.id}`);
            console.log(`Nome: ${resultado.dados.nome}`);
            console.log(`Email: ${resultado.dados.email}`);
        }
    }

    private async atualizar(): Promise<void> {
        console.log("\n======== ATUALIZAR CLIENTE ========");

        const id = await this.entradaTerminal.perguntarNumeroInteiro(
            "Digite o ID do cliente: "
        );

        const nome = await this.entradaTerminal.perguntarTexto(
            "Digite o novo nome do cliente: "
        );

        const email = await this.entradaTerminal.perguntarTexto(
            "Digite o novo email do cliente: "
        );

        const resultado = await this.clienteController.atualizar(id, nome, email);

        console.log(resultado.mensagem);

        if (resultado.sucesso && resultado.dados) {
            console.log(`ID: ${resultado.dados.id}`);
            console.log(`Nome atualizado: ${resultado.dados.nome}`);
            console.log(`Email atualizado: ${resultado.dados.email}`);
        }
    }

    private async remover(): Promise<void> {
        console.log("\n======== EXCLUIR CLIENTE ========");

        const id = await this.entradaTerminal.perguntarNumeroInteiro(
            "Digite o ID do cliente: "
        );

        const confirmacao = await this.entradaTerminal.perguntarOpcao(
            "Confirmar exclusão? (s/n): ",
            ["s", "n"]
        );

        if (confirmacao === "n") {
            console.log("Exclusão cancelada.");
            return;
        }

        const resultado = await this.clienteController.remover(id);

        console.log(resultado.mensagem);
    }
}
