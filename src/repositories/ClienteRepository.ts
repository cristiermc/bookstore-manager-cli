import { Cliente } from "../models/Cliente.js";

export class ClienteRepository {
    private clientes: Cliente[];

    constructor(clientesIniciais: Cliente[] = []) {
        this.clientes = clientesIniciais.map(
            (cliente) => new Cliente(
                cliente.id,
                cliente.nome,
                cliente.email
            )
        );
    }

    async adicionar(cliente: Cliente): Promise<Cliente> {
        const novoCliente = new Cliente(
            cliente.id,
            cliente.nome,
            cliente.email
        );
        this.clientes.push(novoCliente);
        return new Cliente(
            novoCliente.id,
            novoCliente.nome,
            novoCliente.email
        );
    }

    async buscarPorId(id: number): Promise<Cliente | undefined> {
        const cliente = this.clientes.find(
            (item) => item.id === id
        );

        if (!cliente) {
            return undefined;
        }

        return new Cliente(
            cliente.id,
            cliente.nome,
            cliente.email
        );
    }

    async listarTodos(): Promise<Cliente[]> {
        return this.clientes.map(
            (cliente) => new Cliente(
                cliente.id,
                cliente.nome,
                cliente.email
            )
        );
    }

    async atualizar(clienteAtualizado: Cliente): Promise<Cliente | undefined> {
        const indice = this.clientes.findIndex(
            (cliente) => cliente.id === clienteAtualizado.id
        );

        if (indice === -1) {
            return undefined;
        }

        this.clientes[indice] = new Cliente(
            clienteAtualizado.id,
            clienteAtualizado.nome,
            clienteAtualizado.email
        );

        const cliente = this.clientes[indice];
        return new Cliente(
            cliente.id,
            cliente.nome,
            cliente.email
        );
    }

    async remover(id: number): Promise<boolean> {
        const indice = this.clientes.findIndex(
            (cliente) => cliente.id === id
        );

        if (indice === -1) {
            return false;
        }

        this.clientes.splice(indice, 1);
        return true;
    }
}