import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { Autor } from "../../src/models/Autor.js";
import { Livro } from "../../src/models/Livro.js";
import { Emprestimo } from "../../src/models/Emprestimo.js";

import { AutorRepository } from "../../src/repositories/AutorRepository.js";
import { LivroRepository } from "../../src/repositories/LivroRepository.js";
import { EmprestimoRepository } from "../../src/repositories/EmprestimoRepository.js";

import { LivroService } from "../../src/services/LivroService.js";

function criarAmbiente() {
    const autorRepository = new AutorRepository([
        new Autor(1, "Machado de Assis")
    ]);

    const livroRepository = new LivroRepository();
    const emprestimoRepository = new EmprestimoRepository();

    const livroService = new LivroService(
        livroRepository,
        autorRepository,
        emprestimoRepository
    );

    return {
        autorRepository,
        livroRepository,
        emprestimoRepository,
        livroService
    };
}

describe("LivroService", () => {
    it("deve cadastrar um livro e gerar seu ID", async () => {
        const { livroService } = criarAmbiente();

        const livro = await livroService.cadastrar("Dom Casmurro", 1, 5);

        assert.equal(livro.id, 1);
        assert.equal(livro.titulo, "Dom Casmurro");
        assert.equal(livro.autorId, 1);
        assert.equal(livro.quantidadeTotal, 5);
        assert.equal(livro.quantidadeDisponivel, 5);
    });

    it("deve remover espaços extras do título ao cadastrar", async () => {
        const { livroService } = criarAmbiente();

        const livro = await livroService.cadastrar("  Dom Casmurro  ", 1, 5);

        assert.equal(livro.titulo, "Dom Casmurro");
    });

    it("não deve cadastrar livro com título vazio", async () => {
        const { livroService } = criarAmbiente();

        await assert.rejects(
            () => livroService.cadastrar("   ", 1, 5),
            /título do livro é obrigatório/
        );
    });

    it("não deve cadastrar livro com ID de autor inválido", async () => {
        const { livroService } = criarAmbiente();

        await assert.rejects(
            () => livroService.cadastrar("Dom Casmurro", 0, 5),
            /ID deve ser um número inteiro positivo/
        );
    });

    it("não deve cadastrar livro com autor inexistente", async () => {
        const { livroService } = criarAmbiente();

        await assert.rejects(
            () => livroService.cadastrar("Dom Casmurro", 99, 5),
            /Autor com ID 99 não encontrado/
        );
    });

    it("não deve cadastrar livro com quantidade negativa", async () => {
        const { livroService } = criarAmbiente();

        await assert.rejects(
            () => livroService.cadastrar("Dom Casmurro", 1, -1),
            /quantidade deve ser um número inteiro não negativo/
        );
    });

    it("não deve cadastrar livro com quantidade decimal", async () => {
        const { livroService } = criarAmbiente();

        await assert.rejects(
            () => livroService.cadastrar("Dom Casmurro", 1, 2.5),
            /quantidade deve ser um número inteiro não negativo/
        );
    });

    it("deve listar todos os livros cadastrados", async () => {
        const { livroService } = criarAmbiente();

        await livroService.cadastrar("Dom Casmurro", 1, 5);
        await livroService.cadastrar("Memórias Póstumas", 1, 3);

        const livros = await livroService.listarTodos();

        assert.equal(livros.length, 2);
        assert.equal(livros[0].titulo, "Dom Casmurro");
        assert.equal(livros[1].titulo, "Memórias Póstumas");
    });

    it("deve buscar um livro pelo ID", async () => {
        const { livroService } = criarAmbiente();

        const cadastrado = await livroService.cadastrar("Dom Casmurro", 1, 5);
        const livro = await livroService.buscarPorId(cadastrado.id);

        assert.equal(livro.id, cadastrado.id);
        assert.equal(livro.titulo, "Dom Casmurro");
    });

    it("deve rejeitar busca com ID inválido", async () => {
        const { livroService } = criarAmbiente();

        await assert.rejects(
            () => livroService.buscarPorId(0),
            /ID deve ser um número inteiro positivo/
        );
    });

    it("deve rejeitar busca de livro inexistente", async () => {
        const { livroService } = criarAmbiente();

        await assert.rejects(
            () => livroService.buscarPorId(99),
            /Livro com ID 99 não encontrado/
        );
    });

    it("deve atualizar os dados de um livro", async () => {
        const { livroService } = criarAmbiente();

        const cadastrado = await livroService.cadastrar("Título antigo", 1, 5);

        const atualizado = await livroService.atualizar(
            cadastrado.id,
            "Título atualizado",
            1,
            8
        );

        assert.equal(atualizado.id, cadastrado.id);
        assert.equal(atualizado.titulo, "Título atualizado");
        assert.equal(atualizado.quantidadeTotal, 8);
        assert.equal(atualizado.quantidadeDisponivel, 8);
    });

    it("deve preservar a quantidade de exemplares emprestados ao atualizar", async () => {
        const livroInicial = new Livro(1, "Dom Casmurro", 1, 5, 3);

        const livroRepository = new LivroRepository([livroInicial]);
        const autorRepository = new AutorRepository([
            new Autor(1, "Machado de Assis")
        ]);
        const emprestimoRepository = new EmprestimoRepository();

        const livroService = new LivroService(
            livroRepository,
            autorRepository,
            emprestimoRepository
        );

        const atualizado = await livroService.atualizar(
            1,
            "Dom Casmurro - Nova edição",
            1,
            6
        );

        assert.equal(atualizado.quantidadeTotal, 6);
        assert.equal(atualizado.quantidadeDisponivel, 4);
    });

    it("não deve reduzir a quantidade total abaixo dos exemplares emprestados", async () => {
        const livroInicial = new Livro(1, "Dom Casmurro", 1, 5, 3);

        const livroRepository = new LivroRepository([livroInicial]);
        const autorRepository = new AutorRepository([
            new Autor(1, "Machado de Assis")
        ]);
        const emprestimoRepository = new EmprestimoRepository();

        const livroService = new LivroService(
            livroRepository,
            autorRepository,
            emprestimoRepository
        );

        await assert.rejects(
            () => livroService.atualizar(1, "Dom Casmurro", 1, 1),
            /quantidade total não pode ser menor que a quantidade emprestada/
        );
    });

    it("deve remover um livro sem empréstimos associados", async () => {
        const { livroService } = criarAmbiente();

        const livro = await livroService.cadastrar("Livro para remover", 1, 2);

        await livroService.remover(livro.id);

        const livros = await livroService.listarTodos();

        assert.equal(livros.length, 0);
    });

    it("não deve remover um livro com empréstimos associados", async () => {
        const livroInicial = new Livro(1, "Dom Casmurro", 1, 5, 4);

        const livroRepository = new LivroRepository([livroInicial]);
        const autorRepository = new AutorRepository([
            new Autor(1, "Machado de Assis")
        ]);
        const emprestimoRepository = new EmprestimoRepository([
            new Emprestimo(1, 1, 1, new Date("2026-10-01"))
        ]);

        const livroService = new LivroService(
            livroRepository,
            autorRepository,
            emprestimoRepository
        );

        await assert.rejects(
            () => livroService.remover(1),
            /existem empréstimos associados/
        );
    });
});
