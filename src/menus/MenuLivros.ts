import { LivroController } from "../controllers/LivroController.js";
import { EntradaTerminal } from "../utils/EntradaTerminal.js";

export class MenuLivros {
    constructor(
        private readonly livroController: LivroController,
        private readonly entradaTerminal: EntradaTerminal
    ) {}

    async executar(): Promise<void> {
        let continuar = true;

        while (continuar) {
            console.log("\n======== GERENCIAR LIVROS ========");
            console.log("1. Cadastrar livro");
            console.log("2. Listar livros");
            console.log("3. Consultar livro");
            console.log("4. Atualizar livro");
            console.log("5. Excluir livro");
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
        console.log("\n======== CADASTRAR LIVRO ========");

        const titulo = await this.entradaTerminal.perguntarTexto(
            "Digite o título do livro: "
        );

        const autorId = await this.entradaTerminal.perguntarNumeroInteiro(
            "Digite o ID do autor: "
        );

        const quantidadeTotal = await this.entradaTerminal.perguntarNumeroInteiro(
            "Digite a quantidade total de exemplares: ",
            0
        );

        const resultado = await this.livroController.cadastrar(titulo, autorId, quantidadeTotal);

        console.log(resultado.mensagem);

        if (resultado.sucesso && resultado.dados) {
            console.log(`ID: ${resultado.dados.id}`);
            console.log(`Título: ${resultado.dados.titulo}`);
            console.log(`Autor ID: ${resultado.dados.autorId}`);
            console.log(`Quantidade Total: ${resultado.dados.quantidadeTotal}`);
            console.log(`Quantidade Disponível: ${resultado.dados.quantidadeDisponivel}`);
        }
    }

    private async listar(): Promise<void> {
        console.log("\n======== LISTA DE LIVROS ========");

        const resultado = await this.livroController.listarTodos();

        console.log(resultado.mensagem);

        if (resultado.sucesso && resultado.dados) {
            if (resultado.dados.length === 0) {
                console.log("Nenhum livro cadastrado.");
                return;
            }

            for (const livro of resultado.dados) {
                console.log("-------------------------------");
                console.log(`ID: ${livro.id}`);
                console.log(`Título: ${livro.titulo}`);
                console.log(`Autor ID: ${livro.autorId}`);
                console.log(`Quantidade Total: ${livro.quantidadeTotal}`);
                console.log(`Quantidade Disponível: ${livro.quantidadeDisponivel}`);
            }
        }
    }

    private async consultar(): Promise<void> {
        console.log("\n======== CONSULTAR LIVRO ========");

        const id = await this.entradaTerminal.perguntarNumeroInteiro(
            "Digite o ID do livro: "
        );

        const resultado = await this.livroController.buscarPorId(id);

        console.log(resultado.mensagem);

        if (resultado.sucesso && resultado.dados) {
            console.log("-------------------------------");
            console.log(`ID: ${resultado.dados.id}`);
            console.log(`Título: ${resultado.dados.titulo}`);
            console.log(`Autor ID: ${resultado.dados.autorId}`);
            console.log(`Quantidade Total: ${resultado.dados.quantidadeTotal}`);
            console.log(`Quantidade Disponível: ${resultado.dados.quantidadeDisponivel}`);
        }
    }

    private async atualizar(): Promise<void> {
        console.log("\n======== ATUALIZAR LIVRO ========");

        const id = await this.entradaTerminal.perguntarNumeroInteiro(
            "Digite o ID do livro: "
        );

        const titulo = await this.entradaTerminal.perguntarTexto(
            "Digite o novo título do livro: "
        );

        const autorId = await this.entradaTerminal.perguntarNumeroInteiro(
            "Digite o novo ID do autor: "
        );

        const quantidadeTotal = await this.entradaTerminal.perguntarNumeroInteiro(
            "Digite a nova quantidade total de exemplares: ",
            0
        );

        const resultado = await this.livroController.atualizar(id, titulo, autorId, quantidadeTotal);

        console.log(resultado.mensagem);

        if (resultado.sucesso && resultado.dados) {
            console.log("-------------------------------");
            console.log(`ID: ${resultado.dados.id}`);
            console.log(`Título: ${resultado.dados.titulo}`);
            console.log(`Autor ID: ${resultado.dados.autorId}`);
            console.log(`Quantidade Total: ${resultado.dados.quantidadeTotal}`);
            console.log(`Quantidade Disponível: ${resultado.dados.quantidadeDisponivel}`);
        }
    }

    private async remover(): Promise<void> {
        console.log("\n======== EXCLUIR LIVRO ========");

        const id = await this.entradaTerminal.perguntarNumeroInteiro(
            "Digite o ID do livro: "
        );

        const confirmacao = await this.entradaTerminal.perguntarOpcao(
            "Confirmar exclusão? (s/n): ",
            ["s", "n"]
        );

        if (confirmacao === "n") {
            console.log("Exclusão cancelada.");
            return;
        }

        const resultado = await this.livroController.remover(id);

        console.log(resultado.mensagem);
    }
}
