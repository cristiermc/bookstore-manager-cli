
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

import { EntradaTerminal } from "./utils/EntradaTerminal.js";

import { MenuAutores } from "./menus/MenuAutores.js";
import { MenuLivros } from "./menus/MenuLivros.js";
import { MenuClientes } from "./menus/MenuClientes.js";
import { MenuEmprestimos } from "./menus/MenuEmprestimos.js";
import { MenuPrincipal } from "./menus/MenuPrincipal.js";

// Inicializa os dados, repositórios, Services e Controllers.
function inicializarAplicacao() {
    const dadosIniciais = criarSeedInicial();

    const autorRepository = new AutorRepository(dadosIniciais.autores);
    const livroRepository = new LivroRepository(dadosIniciais.livros);
    const clienteRepository = new ClienteRepository(dadosIniciais.clientes);
    const emprestimoRepository = new EmprestimoRepository(dadosIniciais.emprestimos);

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

    const autorController = new AutorController(autorService);
    const livroController = new LivroController(livroService);
    const clienteController = new ClienteController(clienteService);
    const emprestimoController = new EmprestimoController(emprestimoService);

    return {
        autorController,
        livroController,
        clienteController,
        emprestimoController
    };
}

// Inicializa e executa a interface da aplicação.
async function iniciarAplicacao(): Promise<void> {
    const controladores = inicializarAplicacao();

    // Uma única instância de entrada é compartilhada por todos os menus.
    const entradaTerminal = new EntradaTerminal();

    const menuAutores = new MenuAutores(
        controladores.autorController,
        entradaTerminal
    );

    const menuLivros = new MenuLivros(
        controladores.livroController,
        entradaTerminal
    );

    const menuClientes = new MenuClientes(
        controladores.clienteController,
        entradaTerminal
    );

    const menuEmprestimos = new MenuEmprestimos(
        controladores.emprestimoController,
        entradaTerminal
    );

    const menuPrincipal = new MenuPrincipal(
        entradaTerminal,
        menuAutores,
        menuClientes,
        menuLivros,
        menuEmprestimos
    );

    console.log("\nBookStore Manager CLI iniciado!");

    try {
        await menuPrincipal.executar();
    } catch (erro) {
        console.error("\nErro inesperado ao executar a aplicação:", erro);
        entradaTerminal.fechar();
        process.exitCode = 1;
    }
}

iniciarAplicacao();
