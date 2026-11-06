import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

export class EntradaTerminal {
    private readonly readline = createInterface({
        input: stdin,
        output: stdout
    });

    async perguntarTexto(pergunta: string): Promise<string> {
        while (true) {
            const resposta = (await this.readline.question(pergunta)).trim();

            if (resposta.length > 0) {
                return resposta;
            }

            console.log("A entrada não pode ficar vazia.");
        }
    }

    async perguntarNumeroInteiro(pergunta: string, minimo: number = 1): Promise<number> {
        while (true) {
            const resposta = (await this.readline.question(pergunta)).trim();
            const numero = Number(resposta);

            if (resposta.length > 0 && Number.isInteger(numero) && numero >= minimo) {
                return numero;
            }

            console.log(`Digite um número inteiro válido (maior ou igual a ${minimo}).`);
        }
    }

    async perguntarOpcao(pergunta: string, opcoes: readonly string[]): Promise<string> {
        while (true) {
            const resposta = (await this.readline.question(pergunta)).trim();

            if (opcoes.includes(resposta)) {
                return resposta;
            }

            console.log(`Digite uma opção válida: ${opcoes.join(", ")}.`);
        }
    }

    fechar(): void {
        this.readline.close();
    }
}
