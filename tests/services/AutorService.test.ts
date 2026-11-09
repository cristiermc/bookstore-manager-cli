import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { Autor } from "../../src/models/Autor.js";
import { Livro } from "../../src/models/Livro.js";
import { AutorRepository } from "../../src/repositories/AutorRepository.js";
import { LivroRepository } from "../../src/repositories/LivroRepository.js";
import { AutorService } from "../../src/services/AutorService.js";

function criarAmbiente() {
    const autorRepository = new AutorRepository();
    const livroRepository = new LivroRepository();

    const autorService = new AutorService(
        autorRepository,
        livroRepository
    );

    return {
        autorRepository,
        livroRepository,
        autorService
    };
}

describe("AutorService", () => {
    it("deve cadastrar um autor e gerar seu ID", async () => {
        const { autorService } = criarAmbiente();

        const autor = await autorService.cadastrar("Machado de Assis");

        assert.equal(autor.id, 1);
        assert.equal(autor.nome, "Machado de Assis");
    });

    it("deve remover espaços extras do nome ao cadastrar", async () => {
        const { autorService } = criarAmbiente();

        const autor = await autorService.cadastrar("  Clarice Lispector  ");

        assert.equal(autor.nome, "Clarice Lispector");
    });

    it("não deve cadastrar autor com nome vazio", async () => {
        const { autorService } = criarAmbiente();

        await assert.rejects(
            () => autorService.cadastrar("   "),
            /nome do autor é obrigatório/
        );
    });

    it("deve listar todos os autores cadastrados", async () => {
        const { autorService } = criarAmbiente();

        await autorService.cadastrar("Machado de Assis");
        await autorService.cadastrar("Clarice Lispector");

        const autores = await autorService.listarTodos();

        assert.equal(autores.length, 2);
        assert.equal(autores[0].nome, "Machado de Assis");
        assert.equal(autores[1].nome, "Clarice Lispector");
    });

    it("deve buscar um autor pelo ID", async () => {
        const { autorService } = criarAmbiente();

        const cadastrado = await autorService.cadastrar("Machado de Assis");
        const autor = await autorService.buscarPorId(cadastrado.id);

        assert.equal(autor.id, cadastrado.id);
        assert.equal(autor.nome, "Machado de Assis");
    });

    it("deve rejeitar busca com ID inválido", async () => {
        const { autorService } = criarAmbiente();

        await assert.rejects(
            () => autorService.buscarPorId(0),
            /ID do autor deve ser um número positivo/
        );
    });

    it("deve rejeitar busca de autor inexistente", async () => {
        const { autorService } = criarAmbiente();

        await assert.rejects(
            () => autorService.buscarPorId(99),
            /Autor com ID 99 não encontrado/
        );
    });

    it("deve atualizar os dados de um autor", async () => {
        const { autorService } = criarAmbiente();

        const cadastrado = await autorService.cadastrar("Nome antigo");
        const atualizado = await autorService.atualizar(
            cadastrado.id,
            "Nome atualizado"
        );

        assert.equal(atualizado.id, cadastrado.id);
        assert.equal(atualizado.nome, "Nome atualizado");
    });

    it("deve remover um autor sem livros associados", async () => {
        const { autorService } = criarAmbiente();

        const autor = await autorService.cadastrar("Autor para remover");

        await autorService.remover(autor.id);

        const autores = await autorService.listarTodos();

        assert.equal(autores.length, 0);
    });

    it("não deve remover um autor que possui livros associados", async () => {
        const { autorRepository, livroRepository, autorService } = criarAmbiente();

        await autorRepository.adicionar(new Autor(1, "Machado de Assis"));

        await livroRepository.adicionar(
            new Livro(1, "Dom Casmurro", 1, 5, 5)
        );

        await assert.rejects(
            () => autorService.remover(1),
            /possui livros associados/
        );
    });
});
