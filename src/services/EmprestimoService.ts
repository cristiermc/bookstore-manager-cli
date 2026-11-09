import { Emprestimo } from '../models/Emprestimo.js';
import { Livro } from '../models/Livro.js';
import { EmprestimoRepository } from '../repositories/EmprestimoRepository.js';
import { LivroRepository } from '../repositories/LivroRepository.js';
import { ClienteRepository } from '../repositories/ClienteRepository.js';

export interface EmprestimoDetalhado extends Emprestimo {
    livro: {titulo: string;};
    cliente: {nome: string; email: string;};
}

export class EmprestimoService {
    constructor(
        private readonly emprestimoRepository: EmprestimoRepository,
        private readonly livroRepository: LivroRepository,
        private readonly clienteRepository: ClienteRepository
    ) {}

    async cadastrar(livroId: number, clienteId: number): Promise<Emprestimo> {
        this.validarId(livroId);
        this.validarId(clienteId);

        const cliente = await this.clienteRepository.buscarPorId(clienteId);

        if (!cliente) {
            throw new Error(`Cliente com ID ${clienteId} não encontrado.`);
        }

        const livro = await this.livroRepository.buscarPorId(livroId);

        if (!livro) {
            throw new Error(`Livro com ID ${livroId} não encontrado.`);
        }

        if (livro.quantidadeDisponivel <= 0) {
            throw new Error(`O livro "${livro.titulo}" não possui exemplares disponíveis para empréstimo.`);
        }

        const emprestimos = await this.emprestimoRepository.listarTodos();

        const proximoId = emprestimos.reduce(
            (maiorId, emprestimo) => Math.max(maiorId, emprestimo.id), 0,) + 1;

        const novoEmprestimo = new Emprestimo(
            proximoId,
            livroId,
            clienteId,
            new Date(),
        );

        const livroAtualizado = new Livro(
            livro.id,
            livro.titulo,
            livro.autorId,
            livro.quantidadeTotal,
            livro.quantidadeDisponivel - 1
        );

        const resultadoAtualizacao = await this.livroRepository.atualizar(livroAtualizado);

        if (!resultadoAtualizacao) {
            throw new Error(`Não foi possível atualizar a quantidade disponível do livro com ID "${livroId}".`);
        }

        try {
            return await this.emprestimoRepository.adicionar(novoEmprestimo);
        } catch (error) {
            // Se o registro falhar, tenta restaurar o estoque anterior
            await this.livroRepository.atualizar(livro);
            throw error;
        }
    }

    async devolver(id: number): Promise<Emprestimo> {
        this.validarId(id);

        const emprestimo = await this.emprestimoRepository.buscarPorId(id);

        if (!emprestimo) {
            throw new Error(`Empréstimo com ID ${id} não encontrado.`);
        }
        if (emprestimo.dataDevolucao !== null) {
            throw new Error(`O empréstimo com ID ${id} já foi devolvido.`);
        }

        const livro = await this.livroRepository.buscarPorId(emprestimo.livroId);

        if (!livro) {
            throw new Error(`Livro com ID ${emprestimo.livroId} não encontrado.`);
        }

        if (livro.quantidadeDisponivel >= livro.quantidadeTotal) {
            throw new Error(`O estoque do livro "${livro.titulo}" já está completo.`);
        }
        const livroAtualizado = new Livro(
            livro.id,
            livro.titulo,
            livro.autorId,
            livro.quantidadeTotal,
            livro.quantidadeDisponivel + 1
        );

        const resultadoLivro = await this.livroRepository.atualizar(livroAtualizado);

        if (!resultadoLivro) {
            throw new Error(`Não foi possível atualizar a quantidade disponível do livro com ID "${livro.id}".`);
        }

        const emprestimoAtualizado = new Emprestimo(
            emprestimo.id,
            emprestimo.livroId,
            emprestimo.clienteId,
            emprestimo.dataEmprestimo,
            new Date()
        );

        try {
            const resultadoEmprestimo = await this.emprestimoRepository.atualizar(emprestimoAtualizado);

            if (!resultadoEmprestimo) {
                throw new Error(`Não foi possível registrar a devolução do empréstimo com ID "${emprestimo.id}".`);
            }
            return resultadoEmprestimo;
        } catch (error) {
            // Se a devolução falhar, tenta restaurar o estoque anterior
            await this.livroRepository.atualizar(livro);
            throw error;
        }
    }

    async buscarPorId(id: number): Promise<EmprestimoDetalhado | undefined> {
        this.validarId(id);

        const emprestimo = await this.emprestimoRepository.buscarPorId(id);

        if (!emprestimo) {
            return undefined;
        }

        return this.detalhar(emprestimo);
    }

    async listarTodos(): Promise<EmprestimoDetalhado[]> {
        const emprestimos = await this.emprestimoRepository.listarTodos();

        return Promise.all(
            emprestimos.map((emprestimo) => this.detalhar(emprestimo))
        );
    }

    async listarAtivos(): Promise<EmprestimoDetalhado[]> {
        const emprestimosAtivos = await this.emprestimoRepository.listarAtivos();

        return Promise.all(
            emprestimosAtivos.map((emprestimo) => this.detalhar(emprestimo))
        );
    }

    async listarDevolvidos(): Promise<EmprestimoDetalhado[]> {
        const emprestimos = await this.emprestimoRepository.listarTodos();

        const devolvidos = emprestimos.filter(
            (emprestimo) => emprestimo.dataDevolucao !== null
        );

        return Promise.all(
            devolvidos.map((emprestimo) => this.detalhar(emprestimo))
        );
    }

    private async detalhar(emprestimo: Emprestimo): Promise<EmprestimoDetalhado> {
        const [livro, cliente] = await Promise.all([
            this.livroRepository.buscarPorId(emprestimo.livroId),
            this.clienteRepository.buscarPorId(emprestimo.clienteId),
        ]);

        if (!livro) {
            throw new Error(`Livro com ID ${emprestimo.livroId} não encontrado.`);
        }
        if (!cliente) {
            throw new Error(`Cliente com ID ${emprestimo.clienteId} não encontrado.`);
        }

        return {
            ...emprestimo,
            livro: { titulo: livro.titulo },
            cliente: { nome: cliente.nome, email: cliente.email }
        };
    }

    private validarId(id: number): void {
        if (!Number.isInteger(id) || id <= 0) {
            throw new Error("O ID deve ser um número inteiro positivo.");
        }
    }
}
