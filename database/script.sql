-- BookStore Manager CLI
-- Estrutura do banco de dados PostgreSQL (DDL).
-- Antes de executar, crie e selecione um banco de dados vazio no pgAdmin.

CREATE TABLE autores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL
);

CREATE TABLE livros (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    autor_id INTEGER NOT NULL
        REFERENCES autores(id) ON DELETE RESTRICT,
    quantidade_total INTEGER NOT NULL,
    quantidade_disponivel INTEGER NOT NULL,

    CHECK (quantidade_total > 0),
    CHECK (
        quantidade_disponivel >= 0
        AND quantidade_disponivel <= quantidade_total
    )
);

CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(254) NOT NULL
);

CREATE UNIQUE INDEX uq_clientes_email
    ON clientes (LOWER(email));

CREATE TABLE emprestimos (
    id SERIAL PRIMARY KEY,
    livro_id INTEGER NOT NULL
        REFERENCES livros(id) ON DELETE RESTRICT,
    cliente_id INTEGER NOT NULL
        REFERENCES clientes(id) ON DELETE RESTRICT,
    data_emprestimo DATE NOT NULL,
    data_devolucao DATE,

    CHECK (
        data_devolucao IS NULL
        OR data_devolucao >= data_emprestimo
    )
);
