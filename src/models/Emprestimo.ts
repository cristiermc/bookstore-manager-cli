export class Emprestimo {
    constructor(
        public id: number,
        public livroId: number,
        public clienteId: number,
        public dataEmprestimo: Date,
        public dataDevolucao: Date | null = null,
    ) {}
}