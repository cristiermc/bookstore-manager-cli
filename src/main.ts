
import { criarSeedInicial } from "./data/seed.js";

import { AutorRepository } from "./repositories/AutorRepository.js";
import { LivroRepository } from "./repositories/LivroRepository.js";
import { ClienteRepository } from "./repositories/ClienteRepository.js";
import { EmprestimoRepository } from "./repositories/EmprestimoRepository.js";

import { AutorService } from "./services/AutorService.js";
import { LivroService } from "./services/LivroService.js";
import { ClienteService } from "./services/ClienteService.js";
import { EmprestimoService } from "./services/EmprestimoService.js";

import { AutorController } from "./controllers/AutorController.js";
import { LivroController } from "./controllers/LivroController.js";
import { ClienteController } from "./controllers/ClienteController.js";
import { EmprestimoController } from "./controllers/EmprestimoController.js";

export function inicializarAplicacao() {
    // 1. Carrega os dados iniciais
    const dadosIniciais = criarSeedInicial();

    // 2. Instancia os Repositories
    const autorRepository = new AutorRepository(dadosIniciais.autores);
    const livroRepository = new LivroRepository(dadosIniciais.livros);
    const clienteRepository = new ClienteRepository(dadosIniciais.clientes);
    const emprestimoRepository = new EmprestimoRepository(dadosIniciais.emprestimos);

    // 3. Injeta os Repositories nos Services
    const autorService = new AutorService(
        autorRepository,
        livroRepository
    );

    const livroService = new LivroService(
        livroRepository,
        autorRepository,
        emprestimoRepository
    );

    const clienteService = new ClienteService(
        clienteRepository,
        emprestimoRepository
    );

    const emprestimoService = new EmprestimoService(
        emprestimoRepository,
        livroRepository,
        clienteRepository
    );

    // 4. Injeta os Services nos Controllers
    const autorController = new AutorController(autorService);
    const livroController = new LivroController(livroService);
    const clienteController = new ClienteController(clienteService);
    const emprestimoController = new EmprestimoController(emprestimoService);

    // 5. Disponibiliza os Controllers para a aplicação
    return {
        autorController,
        livroController,
        clienteController,
        emprestimoController
    };
}

// Inicializa a aplicação
export const controladores = inicializarAplicacao();

console.log("BookStore Manager CLI iniciado");
