import { Cliente } from "../models/Cliente.js";
import { ClienteRepository } from "../repositories/ClienteRepository.js";
import { EmprestimoRepository } from "../repositories/EmprestimoRepository.js";

export class ClienteService {
    constructor(
        private readonly clienteRepository: ClienteRepository,
        private readonly emprestimoRepository: EmprestimoRepository
    ) {}

    async cadastrar(nome: string, email: string): Promise<Cliente> {
        const nomeValidado = this.validarNome(nome);
        const emailValidado = this.validarEmail(email);
        const clientes = await this.clienteRepository.listarTodos();

        const emailDuplicado = clientes.some(
            (cliente) => cliente.email.trim().toLowerCase() === emailValidado
        );

        if (emailDuplicado) {
            throw new Error(`O email ${emailValidado} já está cadastrado.`);
        }

        const proximoId = clientes.reduce(
            (maiorId, cliente) => Math.max(maiorId, cliente.id), 0,) + 1;

        const novoCliente = new Cliente(
            proximoId,
            nomeValidado,
            emailValidado
        );

        return this.clienteRepository.adicionar(novoCliente);
    }

    async listarTodos(): Promise<Cliente[]> {
        return this.clienteRepository.listarTodos();
    }

    async buscarPorId(id: number): Promise<Cliente> {
        this.validarId(id);

        const cliente = await this.clienteRepository.buscarPorId(id);

        if (!cliente) {
            throw new Error(`Cliente com ID ${id} não encontrado.`);
        }

        return cliente;
    }

    async atualizar(id: number, nome: string,email: string
    ): Promise<Cliente> {
        this.validarId(id);

        const nomeValidado = this.validarNome(nome);
        const emailValidado = this.validarEmail(email);

        await this.buscarPorId(id);

        const clientes = await this.clienteRepository.listarTodos();

        const emailDuplicado = clientes.some(
            (cliente) =>
                cliente.id !== id && cliente.email.trim().toLowerCase() === emailValidado
        );

        if (emailDuplicado) {
            throw new Error(`O email ${emailValidado} já está cadastrado.`);
        }

        const clienteAtualizado = new Cliente(id, nomeValidado, emailValidado);

        const resultado = await this.clienteRepository.atualizar(clienteAtualizado);

        if (!resultado) {
            throw new Error(`Não foi possível atualizar o cliente com ID ${id}.`);
        }

        return resultado;
    }

    async remover(id: number): Promise<void> {
        this.validarId(id);

        await this.buscarPorId(id);

        const emprestimosAssociados = await this.emprestimoRepository.listarPorClienteId(id);

        if (emprestimosAssociados.length > 0) {
            throw new Error(`Não é possível remover o cliente com ID ${id} porque existem empréstimos associados.`);
        }

        const removido = await this.clienteRepository.remover(id);

        if (!removido) {
            throw new Error(`Não foi possível remover o cliente com ID ${id}.`);
        }
    }

    private validarNome(nome: string): string {
        if (typeof nome !== 'string' || nome.trim().length === 0) {
            throw new Error('O nome do cliente é obrigatório.');
        }

        return nome.trim();
    }

    private validarEmail(email: string): string {
        if (typeof email !== 'string' || email.trim().length === 0) {
            throw new Error('O email do cliente é obrigatório.');
        }

        const emailNormalizado = email.trim().toLowerCase();

        const formatoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formatoValido.test(emailNormalizado)) {
            throw new Error('O email informado possui formato inválido.');
        }

        return emailNormalizado;
    }

    private validarId(id: number): void {
        if (!Number.isInteger(id) || id <= 0) {
            throw new Error('O ID do cliente deve ser um número positivo.');
        }
    }
}
