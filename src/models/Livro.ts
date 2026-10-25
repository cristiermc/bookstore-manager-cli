export class Livro {
    constructor(
        public id: number,
        public titulo: string,
        public autorId: number,
        public quantidadeTotal: number,
        public quantidadeDisponivel: number,
    ) {}
}