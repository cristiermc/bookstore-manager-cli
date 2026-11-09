
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { Cliente } from "../../src/models/Cliente.js";
import { Emprestimo } from "../../src/models/Emprestimo.js";
import { Livro } from "../../src/models/Livro.js";

import { ClienteRepository } from "../../src/repositories/ClienteRepository.js";
import { EmprestimoRepository } from "../../src/repositories/EmprestimoRepository.js";
import { LivroRepository } from "../../src/repositories/LivroRepository.js";

import { EmprestimoService } from "../../src/services/EmprestimoService.js";

function criarAmbiente(
    livros: Livro[] = [
        new Livro(1, "Dom Casmurro", 1, 3, 3)
    ],
    clientes: Cliente[] = [
        new Cliente(1, "Ana Silva", "ana@email.com")
    ],
    emprestimos: Emprestimo[] = []
) {
    const livroRepository = new LivroRepository(livros);
    const clienteRepository = new ClienteRepository(clientes);
    const emprestimoRepository = new EmprestimoRepository(emprestimos);

    const emprestimoService = new EmprestimoService(
        emprestimoRepository,
        livroRepository,
        clienteRepository
    );

    return {
        livroRepository,
        clienteRepository,
        emprestimoRepository,
        emprestimoService
    };
}

class EmprestimoRepositoryComFalhaAoAdicionar extends EmprestimoRepository {
    async adicionar(_emprestimo: Emprestimo): Promise<Emprestimo> {
        throw new Error("Falha simulada ao registrar empréstimo.");
    }
}

class EmprestimoRepositoryComFalhaAoAtualizar extends EmprestimoRepository {
    async atualizar(
        _emprestimo: Emprestimo
    ): Promise<Emprestimo | undefined> {
        return undefined;
    }
}

describe("EmprestimoService", () => {
    it("deve cadastrar um empréstimo e gerar seu ID", async () => {
        const { emprestimoService } = criarAmbiente();

        const emprestimo = await emprestimoService.cadastrar(1, 1);

        assert.equal(emprestimo.id, 1);
        assert.equal(emprestimo.livroId, 1);
        assert.equal(emprestimo.clienteId, 1);
        assert.ok(emprestimo.dataEmprestimo instanceof Date);
        assert.equal(emprestimo.dataDevolucao, null);
    });

    it("deve diminuir a quantidade disponível após o empréstimo", async () => {
        const { emprestimoService, livroRepository } = criarAmbiente();

        await emprestimoService.cadastrar(1, 1);

        const livro = await livroRepository.buscarPorId(1);

        assert.equal(livro?.quantidadeTotal, 3);
        assert.equal(livro?.quantidadeDisponivel, 2);
    });

    it("não deve cadastrar empréstimo com ID de livro inválido", async () => {
        const { emprestimoService } = criarAmbiente();

        await assert.rejects(
            () => emprestimoService.cadastrar(0, 1),
            /ID deve ser um número inteiro positivo/
        );
    });

    it("não deve cadastrar empréstimo com ID de cliente inválido", async () => {
        const { emprestimoService } = criarAmbiente();

        await assert.rejects(
            () => emprestimoService.cadastrar(1, -1),
            /ID deve ser um número inteiro positivo/
        );
    });

    it("não deve emprestar um livro inexistente", async () => {
        const { emprestimoService } = criarAmbiente();

        await assert.rejects(
            () => emprestimoService.cadastrar(99, 1),
            /Livro com ID 99 não encontrado/
        );
    });

    it("não deve emprestar para um cliente inexistente", async () => {
        const { emprestimoService } = criarAmbiente(
            undefined,
            []
        );

        await assert.rejects(
            () => emprestimoService.cadastrar(1, 99),
            /Cliente com ID 99 não encontrado/
        );
    });

    it("não deve emprestar um livro sem exemplares disponíveis", async () => {
        const livroIndisponivel = new Livro(1, "Dom Casmurro", 1, 3, 0);

        const {
            emprestimoService,
            livroRepository,
            emprestimoRepository
        } = criarAmbiente([livroIndisponivel]);

        await assert.rejects(
            () => emprestimoService.cadastrar(1, 1),
            /não possui exemplares disponíveis/
        );

        const livro = await livroRepository.buscarPorId(1);
        const emprestimos = await emprestimoRepository.listarTodos();

        assert.equal(livro?.quantidadeDisponivel, 0);
        assert.equal(emprestimos.length, 0);
    });

    it("deve devolver um empréstimo e atualizar o estoque", async () => {
        const {
            emprestimoService,
            livroRepository
        } = criarAmbiente();

        const emprestimo = await emprestimoService.cadastrar(1, 1);

        const devolvido = await emprestimoService.devolver(emprestimo.id);

        const livro = await livroRepository.buscarPorId(1);

        assert.equal(devolvido.id, emprestimo.id);
        assert.ok(devolvido.dataDevolucao instanceof Date);
        assert.equal(livro?.quantidadeDisponivel, 3);
    });

    it("não deve devolver um empréstimo inexistente", async () => {
        const { emprestimoService } = criarAmbiente();

        await assert.rejects(
            () => emprestimoService.devolver(99),
            /Empréstimo com ID 99 não encontrado/
        );
    });

    it("não deve permitir devolver o mesmo empréstimo duas vezes", async () => {
        const {
            emprestimoService,
            livroRepository
        } = criarAmbiente();

        const emprestimo = await emprestimoService.cadastrar(1, 1);

        await emprestimoService.devolver(emprestimo.id);

        await assert.rejects(
            () => emprestimoService.devolver(emprestimo.id),
            /já foi devolvido/
        );

        const livro = await livroRepository.buscarPorId(1);

        assert.equal(livro?.quantidadeDisponivel, 3);
    });

    it("deve preservar o histórico após a devolução", async () => {
        const {
            emprestimoService,
            emprestimoRepository
        } = criarAmbiente();

        const emprestimo = await emprestimoService.cadastrar(1, 1);

        await emprestimoService.devolver(emprestimo.id);

        const historico = await emprestimoRepository.buscarPorId(emprestimo.id);

        assert.ok(historico);
        assert.equal(historico.id, emprestimo.id);
        assert.ok(historico.dataDevolucao instanceof Date);
    });

    it("deve buscar um empréstimo pelo ID com os dados relacionados", async () => {
        const { emprestimoService } = criarAmbiente();

        const cadastrado = await emprestimoService.cadastrar(1, 1);

        const emprestimo = await emprestimoService.buscarPorId(cadastrado.id);

        assert.ok(emprestimo);
        assert.equal(emprestimo.livro.titulo, "Dom Casmurro");
        assert.equal(emprestimo.cliente.nome, "Ana Silva");
        assert.equal(emprestimo.cliente.email, "ana@email.com");
    });

    it("deve retornar undefined ao buscar um empréstimo inexistente", async () => {
        const { emprestimoService } = criarAmbiente();

        const emprestimo = await emprestimoService.buscarPorId(99);

        assert.equal(emprestimo, undefined);
    });

    it("deve listar empréstimos ativos e devolvidos separadamente", async () => {
        const dataEmprestimo = new Date("2026-10-01T10:00:00");
        const dataDevolucao = new Date("2026-10-05T10:00:00");

        const emprestimos = [
            new Emprestimo(1, 1, 1, dataEmprestimo),
            new Emprestimo(2, 1, 1, dataEmprestimo, dataDevolucao)
        ];

        const livro = new Livro(1, "Dom Casmurro", 1, 3, 2);

        const { emprestimoService } = criarAmbiente(
            [livro],
            undefined,
            emprestimos
        );

        const todos = await emprestimoService.listarTodos();
        const ativos = await emprestimoService.listarAtivos();
        const devolvidos = await emprestimoService.listarDevolvidos();

        assert.equal(todos.length, 2);

        assert.equal(ativos.length, 1);
        assert.equal(ativos[0].id, 1);
        assert.equal(ativos[0].dataDevolucao, null);

        assert.equal(devolvidos.length, 1);
        assert.equal(devolvidos[0].id, 2);
        assert.ok(devolvidos[0].dataDevolucao instanceof Date);
    });

    it("deve restaurar o estoque se falhar ao registrar o empréstimo", async () => {
    const livroRepository = new LivroRepository([
        new Livro(1, "Dom Casmurro", 1, 3, 3)
    ]);

    const clienteRepository = new ClienteRepository([
        new Cliente(1, "Ana Silva", "ana@email.com")
    ]);

    const emprestimoRepository =
        new EmprestimoRepositoryComFalhaAoAdicionar();

    const emprestimoService = new EmprestimoService(
        emprestimoRepository,
        livroRepository,
        clienteRepository
    );

    await assert.rejects(
        () => emprestimoService.cadastrar(1, 1),
        /Falha simulada ao registrar empréstimo/
    );

    const livro = await livroRepository.buscarPorId(1);
    const emprestimos = await emprestimoRepository.listarTodos();

    assert.equal(livro?.quantidadeDisponivel, 3);
    assert.equal(emprestimos.length, 0);
});

it("deve restaurar o estoque se falhar ao registrar a devolução", async () => {
    const emprestimoInicial = new Emprestimo(
        1,
        1,
        1,
        new Date("2026-11-01T10:00:00")
    );

    const livroRepository = new LivroRepository([
        new Livro(1, "Dom Casmurro", 1, 3, 2)
    ]);

    const clienteRepository = new ClienteRepository([
        new Cliente(1, "Ana Silva", "ana@email.com")
    ]);

    const emprestimoRepository =
        new EmprestimoRepositoryComFalhaAoAtualizar([
            emprestimoInicial
        ]);

    const emprestimoService = new EmprestimoService(
        emprestimoRepository,
        livroRepository,
        clienteRepository
    );

    await assert.rejects(
        () => emprestimoService.devolver(1),
        /Não foi possível registrar a devolução/
    );

    const livro = await livroRepository.buscarPorId(1);
    const emprestimo = await emprestimoRepository.buscarPorId(1);

    assert.equal(livro?.quantidadeDisponivel, 2);
    assert.equal(emprestimo?.dataDevolucao, null);
});
});
