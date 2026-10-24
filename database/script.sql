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


-- =========================================
-- DML: dados de exemplo
-- =========================================

-- 1. Inserir autores
INSERT INTO autores (nome) VALUES
    ('Robert C. Martin'),
    ('Andrew Hunt'),
    ('Martin Fowler'),
    ('Michael Feathers');

-- 2. Inserir livros
INSERT INTO livros (
    titulo,
    autor_id,
    quantidade_total,
    quantidade_disponivel
) VALUES
    ('Clean Code', 1, 5, 3),
    ('The Pragmatic Programmer', 2, 4, 3),
    ('Refactoring', 3, 3, 3),
    ('Working Effectively with Legacy Code', 4, 2, 2);

-- 3. Inserir clientes fictícios
INSERT INTO clientes (nome, email) VALUES
    ('John Doe', 'john.doe@example.com'),
    ('Jane Doe', 'jane.doe@example.com'),
    ('Alex Silva', 'alex.silva@example.com'),
    ('Maria Souza', 'maria.souza@example.com');

-- 4. Inserir empréstimos
-- data_devolucao NULL significa empréstimo ativo.
INSERT INTO emprestimos (
    livro_id,
    cliente_id,
    data_emprestimo,
    data_devolucao
) VALUES
    (1, 1, '2026-10-01', NULL),
    (1, 2, '2026-10-05', NULL),
    (1, 3, '2026-09-01', '2026-09-15'),
    (2, 1, '2026-10-10', NULL),
    (2, 3, '2026-08-01', '2026-08-14'),
    (3, 2, '2026-07-01', '2026-07-12');

-- 5. Exemplo de UPDATE
-- Atualizar o nome de um cliente já cadastrado.
UPDATE clientes
SET nome = 'John A. Doe'
WHERE email = 'john.doe@example.com';

-- 6. Exemplo de DELETE
-- Excluir um cliente que não possui empréstimos.
DELETE FROM clientes
WHERE email = 'maria.souza@example.com';
