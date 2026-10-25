import { Autor } from "../models/Autor.js";

export class AutorRepository {
    private autores: Autor[];

    constructor(autoresIniciais: Autor[] = []) {
        this.autores = autoresIniciais.map(
            (autor) => new Autor(autor.id, autor.nome)
        );
    }

    async adicionar(autor: Autor): Promise<Autor> {
        const novoAutor = new Autor(autor.id, autor.nome);
        this.autores.push(novoAutor);
        return new Autor(novoAutor.id, novoAutor.nome);
    }

    async buscarPorId(id: number): Promise<Autor | undefined> {
        const autor = this.autores.find((item) => item.id === id);

        if (!autor) {
            return undefined;
        }
        return new Autor(autor.id, autor.nome);
    }

    async listarTodos(): Promise<Autor[]> {
        return this.autores.map(
            (autor) => new Autor(autor.id, autor.nome),
        );
    }

    async atualizar(autorAtualizado: Autor): Promise<Autor | undefined> {
        const indice = this.autores.findIndex(
            (autor) => autor.id === autorAtualizado.id,
        );

        if (indice === -1) {
            return undefined;
        }

        this.autores[indice] = new Autor(
            autorAtualizado.id,
            autorAtualizado.nome,
        );

        const autor = this.autores[indice];
        return new Autor(autor.id, autor.nome);
    }

    async remover(id: number): Promise<boolean> {
        const indice = this.autores.findIndex(
            (autor) => autor.id === id,
        );

        if (indice === -1) {
            return false;
        }

        this.autores.splice(indice, 1);
        return true;
    }
}
