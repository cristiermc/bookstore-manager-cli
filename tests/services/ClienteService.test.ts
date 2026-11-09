import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { Cliente } from "../../src/models/Cliente.js";
import { Emprestimo } from "../../src/models/Emprestimo.js";

import { ClienteRepository } from "../../src/repositories/ClienteRepository.js";
import { EmprestimoRepository } from "../../src/repositories/EmprestimoRepository.js";

import { ClienteService } from "../../src/services/ClienteService.js";

function criarAmbiente() {
    const clienteRepository = new ClienteRepository();
    const emprestimoRepository = new EmprestimoRepository();

    const service = new ClienteService(
        clienteRepository,
        emprestimoRepository
    );

    return { clienteRepository, emprestimoRepository, service };
}

describe("ClienteService", () => {
    it("deve cadastrar um cliente e gerar seu ID", async () => {
        const { service } = criarAmbiente();

        const cliente = await service.cadastrar(
            "Ana Silva",
            "ANA@EMAIL.COM"
        );

        assert.equal(cliente.id, 1);
        assert.equal(cliente.nome, "Ana Silva");
        assert.equal(cliente.email, "ana@email.com");
    });

    it("deve remover espaços extras do nome e do email", async () => {
        const { service } = criarAmbiente();

        const cliente = await service.cadastrar(
            "  Ana Silva  ",
            "  ana@email.com  "
        );

        assert.equal(cliente.nome, "Ana Silva");
        assert.equal(cliente.email, "ana@email.com");
    });

    it("não deve cadastrar cliente com nome vazio", async () => {
        const { service } = criarAmbiente();

        await assert.rejects(
            service.cadastrar("   ", "ana@email.com"),
            /nome do cliente é obrigatório/
        );
    });

    it("não deve cadastrar cliente com email vazio", async () => {
        const { service } = criarAmbiente();

        await assert.rejects(
            service.cadastrar("Ana Silva", "   "),
            /email do cliente é obrigatório/
        );
    });

    it("não deve cadastrar cliente com email inválido", async () => {
        const { service } = criarAmbiente();

        await assert.rejects(
            service.cadastrar("Ana Silva", "email-invalido"),
            /formato inválido/
        );
    });

    it("não deve permitir email duplicado ignorando maiúsculas e minúsculas", async () => {
        const { service } = criarAmbiente();

        await service.cadastrar("Ana Silva", "ana@email.com");

        await assert.rejects(
            service.cadastrar("Maria Souza", "ANA@EMAIL.COM"),
            /já está cadastrado/
        );
    });

    it("deve listar todos os clientes cadastrados", async () => {
        const { service } = criarAmbiente();

        await service.cadastrar("Ana Silva", "ana@email.com");
        await service.cadastrar("Maria Souza", "maria@email.com");

        const clientes = await service.listarTodos();

        assert.equal(clientes.length, 2);
    });

    it("deve buscar um cliente pelo ID", async () => {
        const { service } = criarAmbiente();

        const cadastrado = await service.cadastrar(
            "Ana Silva",
            "ana@email.com"
        );

        const cliente = await service.buscarPorId(cadastrado.id);

        assert.equal(cliente.nome, "Ana Silva");
    });

    it("deve rejeitar busca com ID inválido", async () => {
        const { service } = criarAmbiente();

        await assert.rejects(
            service.buscarPorId(0),
            /ID do cliente deve ser um número positivo/
        );
    });

    it("deve rejeitar busca de cliente inexistente", async () => {
        const { service } = criarAmbiente();

        await assert.rejects(
            service.buscarPorId(99),
            /Cliente com ID 99 não encontrado/
        );
    });

    it("deve atualizar os dados de um cliente", async () => {
        const { service } = criarAmbiente();

        const cadastrado = await service.cadastrar(
            "Ana Silva",
            "ana@email.com"
        );

        const atualizado = await service.atualizar(
            cadastrado.id,
            "Ana Souza",
            "ana.souza@email.com"
        );

        assert.equal(atualizado.nome, "Ana Souza");
        assert.equal(atualizado.email, "ana.souza@email.com");
    });

    it("não deve permitir atualizar um cliente com email de outro cliente", async () => {
        const { service } = criarAmbiente();

        const primeiro = await service.cadastrar(
            "Ana Silva",
            "ana@email.com"
        );

        await service.cadastrar("Maria Souza", "maria@email.com");

        await assert.rejects(
            service.atualizar(
                primeiro.id,
                "Ana Silva",
                "MARIA@EMAIL.COM"
            ),
            /já está cadastrado/
        );
    });

    it("deve permitir manter o próprio email durante a atualização", async () => {
        const { service } = criarAmbiente();

        const cadastrado = await service.cadastrar(
            "Ana Silva",
            "ana@email.com"
        );

        const atualizado = await service.atualizar(
            cadastrado.id,
            "Ana Souza",
            "ANA@EMAIL.COM"
        );

        assert.equal(atualizado.nome, "Ana Souza");
        assert.equal(atualizado.email, "ana@email.com");
    });

    it("deve remover um cliente sem empréstimos associados", async () => {
        const { service } = criarAmbiente();

        const cliente = await service.cadastrar(
            "Ana Silva",
            "ana@email.com"
        );

        await service.remover(cliente.id);

        const clientes = await service.listarTodos();

        assert.equal(clientes.length, 0);
    });

    it("não deve remover um cliente com empréstimos associados", async () => {
        const cliente = new Cliente(1, "Ana Silva", "ana@email.com");

        const clienteRepository = new ClienteRepository([cliente]);

        const emprestimoRepository = new EmprestimoRepository([
            new Emprestimo(
                1,
                1,
                1,
                new Date("2026-10-01")
            )
        ]);

        const service = new ClienteService(
            clienteRepository,
            emprestimoRepository
        );

        await assert.rejects(
            service.remover(1),
            /não é possível remover o cliente com ID 1 porque existem empréstimos associados/i
        );
    });
});
