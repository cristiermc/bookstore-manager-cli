import { EntradaTerminal } from "../utils/EntradaTerminal.js";
import { MenuAutores } from "./MenuAutores.js";
import { MenuClientes } from "./MenuClientes.js";
import { MenuLivros } from "./MenuLivros.js";
import { MenuEmprestimos } from "./MenuEmprestimos.js";

export class MenuPrincipal {
    constructor(
        private readonly entradaTerminal: EntradaTerminal,
        private readonly menuAutores: MenuAutores,
        private readonly menuClientes: MenuClientes,
        private readonly menuLivros: MenuLivros,
        private readonly menuEmprestimos: MenuEmprestimos
    ) {}

    async executar(): Promise<void> {
        let continuar = true;

        while (continuar) {
            console.log("\n==================================");
            console.log("       BOOKSTORE MANAGER CLI");
            console.log("==================================");
            console.log("1. Gerenciar autores");
            console.log("2. Gerenciar livros");
            console.log("3. Gerenciar clientes");
            console.log("4. Gerenciar empréstimos");
            console.log("0. Sair");
            console.log("==================================");

            const opcao = await this.entradaTerminal.perguntarOpcao(
                "Escolha uma opção: ",
                ["1", "2", "3", "4", "0"]
            );

            switch (opcao) {
                case "1":
                    await this.menuAutores.executar();
                    break;
                case "2":
                    await this.menuLivros.executar();
                    break;
                case "3":
                    await this.menuClientes.executar();
                    break;
                case "4":
                    await this.menuEmprestimos.executar();
                    break;
                case "0":
                    continuar = false;
                    break;
            }
        }

        console.log("\nEncerrando o Bookstore Manager CLI. Até logo!");
        this.entradaTerminal.fechar();

    }
}
