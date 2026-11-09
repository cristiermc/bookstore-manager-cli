export interface Resultado<T = void> {
    sucesso: boolean;
    mensagem: string;
    dados?: T;
}