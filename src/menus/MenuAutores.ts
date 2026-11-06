
import { AutorController } from "../controllers/AutorController.js";
import { EntradaTerminal } from "../utils/EntradaTerminal.js";

export class MenuAutores {
    constructor(
        private readonly autorController: AutorController,
        private readonly entradaTerminal: EntradaTerminal
    ) {}

    async executar(): Promise<void> {
        let continuar = true;

        while (continuar) {
            console.log("\n======== GERENCIAR AUTORES ========");
            console.log("1. Cadastrar autor");
            console.log("2. Listar autores");
            console.log("3. Consultar autor");
            console.log("4. Atualizar autor");
            console.log("5. Excluir autor");
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
        console.log("\n======== CADASTRAR AUTOR ========");

        const nome = await this.entradaTerminal.perguntarTexto(
            "Digite o nome do autor: "
        );

        const resultado = await this.autorController.cadastrar(nome);

        console.log(resultado.mensagem);

        if (resultado.sucesso && resultado.dados) {
            console.log(
                `ID: ${resultado.dados.id} | Nome: ${resultado.dados.nome}`
            );
        }
    }

    private async listar(): Promise<void> {
        console.log("\n======== LISTA DE AUTORES ========");

        const resultado = await this.autorController.listarTodos();

        console.log(resultado.mensagem);

        if (resultado.sucesso && resultado.dados) {
            if (resultado.dados.length === 0) {
                console.log("Nenhum autor cadastrado.");
                return;
            }

            for (const autor of resultado.dados) {
                console.log(`ID: ${autor.id} | Nome: ${autor.nome}`);
            }
        }
    }

    private async consultar(): Promise<void> {
        console.log("\n======== CONSULTAR AUTOR ========");

        const id = await this.entradaTerminal.perguntarNumeroInteiro(
            "Digite o ID do autor: "
        );

        const resultado = await this.autorController.buscarPorId(id);

        console.log(resultado.mensagem);

        if (resultado.sucesso && resultado.dados) {
            console.log(
                `ID: ${resultado.dados.id} | Nome: ${resultado.dados.nome}`
            );
        }
    }

    private async atualizar(): Promise<void> {
        console.log("\n======== ATUALIZAR AUTOR ========");

        const id = await this.entradaTerminal.perguntarNumeroInteiro(
            "Digite o ID do autor: "
        );

        const nome = await this.entradaTerminal.perguntarTexto(
            "Digite o novo nome do autor: "
        );

        const resultado = await this.autorController.atualizar(id, nome);

        console.log(resultado.mensagem);

        if (resultado.sucesso && resultado.dados) {
            console.log(
                `ID: ${resultado.dados.id} | Nome atualizado: ${resultado.dados.nome}`
            );
        }
    }

    private async remover(): Promise<void> {
        console.log("\n======== EXCLUIR AUTOR ========");

        const id = await this.entradaTerminal.perguntarNumeroInteiro(
            "Digite o ID do autor: "
        );

        const confirmacao = await this.entradaTerminal.perguntarOpcao(
            "Confirmar exclusão? (s/n): ",
            ["s", "n"]
        );

        if (confirmacao === "n") {
            console.log("Exclusão cancelada.");
            return;
        }

        const resultado = await this.autorController.remover(id);

        console.log(resultado.mensagem);
    }
}
