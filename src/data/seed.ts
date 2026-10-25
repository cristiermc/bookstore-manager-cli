import { Autor } from "../models/Autor.js";
import { Livro } from "../models/Livro.js";
import { Cliente } from "../models/Cliente.js";
import { Emprestimo } from "../models/Emprestimo.js";

export function criarSeedInicial() {
    const autores = [
        new Autor(1, "Robert C. Martin"),
        new Autor(2, "Andrew Hunt"),
        new Autor(3, "Martin Fowler"),
        new Autor(4, "Michael Feathers"),
    ];

    const livros = [
        new Livro(1, "Clean Code", 1, 5, 3),
        new Livro(2, "The Pragmatic Programmer", 2, 4, 3),
        new Livro(3, "Refactoring", 3, 3, 3),
        new Livro(4, "Working Effectively with Legacy Code", 4, 2, 2),
    ];

    const clientes = [
        new Cliente(1, "John A. Doe", "john.doe@example.com"),
        new Cliente(2, "Jane Doe", "jane.doe@example.com"),
        new Cliente(3, "Alex Silva", "alex.silva@example.com"),
    ];

    const emprestimos = [
        new Emprestimo(1, 1, 1, new Date(2026, 9, 1)),
        new Emprestimo(2, 1, 2, new Date(2026, 9, 5)),
        new Emprestimo(3, 1, 3, new Date(2026, 8, 1), new Date(2026, 8, 15)),
        new Emprestimo(4, 2, 1, new Date(2026, 9, 10)),
        new Emprestimo(5, 2, 3, new Date(2026, 7, 1), new Date(2026, 7, 14)),
        new Emprestimo(6, 3, 2, new Date(2026, 6, 1), new Date(2026, 6, 12)),
    ];

    return {
        autores,
        livros,
        clientes,
        emprestimos,
    };
}