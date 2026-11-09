# BookStore Manager CLI — Modelagem do Banco de Dados

## 1. Objetivo

Documentar a estrutura relacional do BookStore Manager CLI antes da criação do Diagrama Entidade-Relacionamento (DER) e do script SQL.

O banco de dados escolhido é o **PostgreSQL**. A modelagem contempla quatro entidades: Autores, Livros, Clientes e Empréstimos.

## 2. Entidades e atributos

### 2.1 Autores

| Atributo | Tipo conceitual | Obrigatório | Descrição |
|---|---|---|---|
| `id` | Identificador inteiro | Sim | Identificador único do autor e chave primária (PK). |
| `nome` | Texto | Sim | Nome do autor. |

**Regras:** cada autor possui um identificador único e um nome obrigatório. Um autor pode estar relacionado a vários livros.

### 2.2 Livros

| Atributo | Tipo conceitual | Obrigatório | Descrição |
|---|---|---|---|
| `id` | Identificador inteiro | Sim | Identificador único do livro e chave primária (PK). |
| `titulo` | Texto | Sim | Título do livro. |
| `autor_id` | Identificador inteiro | Sim | Chave estrangeira (FK) que referencia `Autores.id`. |
| `quantidade_total` | Inteiro | Sim | Quantidade total de exemplares cadastrados para o livro. |
| `quantidade_disponivel` | Inteiro | Sim | Quantidade de exemplares que podem ser emprestados. |

**Regras de estoque:**

- `quantidade_total` deve ser maior que zero.
- `quantidade_disponivel` não pode ser negativa.
- `quantidade_disponivel` não pode ultrapassar `quantidade_total`.
- A quantidade disponível deve ser atualizada quando um empréstimo for registrado ou devolvido.

### 2.3 Clientes

| Atributo | Tipo conceitual | Obrigatório | Descrição |
|---|---|---|---|
| `id` | Identificador inteiro | Sim | Identificador único do cliente e chave primária (PK). |
| `nome` | Texto | Sim | Nome do cliente. |
| `email` | Texto | Sim | E-mail de contato do cliente, que deve ser único. |

**Regras:** nome e e-mail são obrigatórios. O e-mail não pode se repetir entre clientes, conforme restrição de unicidade do banco de dados.

### 2.4 Empréstimos

| Atributo | Tipo conceitual | Obrigatório | Descrição |
|---|---|---|---|
| `id` | Identificador inteiro | Sim | Identificador único do empréstimo e chave primária (PK). |
| `livro_id` | Identificador inteiro | Sim | Chave estrangeira (FK) que referencia `Livros.id`. |
| `cliente_id` | Identificador inteiro | Sim | Chave estrangeira (FK) que referencia `Clientes.id`. |
| `data_emprestimo` | Data | Sim | Data em que o empréstimo foi registrado. |
| `data_devolucao` | Data | Não | Data em que o livro foi devolvido; permanece nula enquanto o empréstimo estiver ativo. |

**Regras:**

- Todo empréstimo deve estar associado a um livro e a um cliente existentes.
- Um empréstimo está ativo quando `data_devolucao` é nula.
- A devolução deve ter uma data igual ou posterior à data do empréstimo.
- O histórico dos empréstimos deve ser preservado após a devolução.

## 3. Chaves e relacionamentos

| Relacionamento | Cardinalidade | Implementação |
|---|---|---|
| Autores — Livros | 1:N | `Livros.autor_id` referencia `Autores.id`. |
| Livros — Empréstimos | 1:N | `Emprestimos.livro_id` referencia `Livros.id`. |
| Clientes — Empréstimos | 1:N | `Emprestimos.cliente_id` referencia `Clientes.id`. |

### Interpretação

- Um autor pode ter nenhum, um ou vários livros cadastrados.
- Cada livro está associado a um autor.
- Um livro pode aparecer em vários registros de empréstimo ao longo do tempo.
- Um cliente pode realizar vários empréstimos ao longo do tempo.
- Cada empréstimo referencia exatamente um livro e um cliente.

## 4. Regras de integridade e negócio

### 4.1 Integridade referencial

As chaves estrangeiras devem impedir empréstimos associados a livros ou clientes inexistentes e livros associados a autores inexistentes.

### 4.2 Unicidade do e-mail

O atributo `Clientes.email` deve possuir restrição de unicidade no banco de dados. A aplicação também deve validar os dados, mas a garantia definitiva deve estar no PostgreSQL.

A comparação de e-mails deve ser insensível a maiúsculas e minúsculas, evitando o cadastro duplicado do mesmo endereço com diferenças apenas de capitalização. A implementação dessa regra será definida no script SQL.

### 4.3 Controle de estoque

Ao registrar um empréstimo, a quantidade disponível deve diminuir em uma unidade. A operação deve ser impedida quando não houver exemplares disponíveis.

Ao registrar a devolução de um empréstimo ativo, a quantidade disponível deve aumentar em uma unidade. Uma devolução já registrada não pode aumentar o estoque novamente.

A atualização do empréstimo e do estoque deve ocorrer de forma consistente, preferencialmente dentro de uma transação.

A verificação de disponibilidade e a atualização do estoque devem ser realizadas de forma atômica para evitar empréstimos concorrentes que reduzam a quantidade disponível abaixo de zero.

### 4.4 Exclusão de registros relacionados

A exclusão de autores que possuam livros relacionados deve ser bloqueada. Também deve ser bloqueada a exclusão de livros ou clientes que possuam registros de empréstimos relacionados.

A política preserva a integridade referencial e o histórico de empréstimos. A implementação no PostgreSQL deverá usar uma regra de exclusão restritiva, como `ON DELETE RESTRICT`.

### 4.5 Consistência das datas

`data_emprestimo` é obrigatória. `data_devolucao` é opcional e, quando preenchida, não pode ser anterior à data do empréstimo.

## 5. Decisões técnicas

- **SGBD:** PostgreSQL.
- **Estoque:** controlado por quantidades total e disponível.
- **Empréstimo ativo:** registro cuja `data_devolucao` está nula.
- **Devolução:** registrada pela data, sem apagar o empréstimo.
- **E-mail:** obrigatório e único por cliente.
- **Exclusões relacionadas:** bloqueadas para preservar referências e histórico.
- **Integridade:** regras críticas devem ser garantidas pelo banco e complementadas por validações na aplicação.

## 6. Escopo e próximos passos

Este documento registra a modelagem lógica inicial e as regras de negócio.

**Não fazem parte deste card:**

- Criação do DER;
- Implementação do script SQL DDL;
- Implementação dos repositórios ou serviços TypeScript.

Esses itens serão tratados nos cards seguintes.

## 7. Critérios de validação do Card 02

- [x] As quatro entidades estão documentadas.
- [x] Os atributos e suas finalidades estão definidos.
- [x] As chaves primárias e estrangeiras estão identificadas.
- [x] Os relacionamentos e as cardinalidades estão definidos.
- [x] As regras de estoque e unicidade do e-mail estão documentadas.
- [x] Os empréstimos ativos e a devolução estão definidos.
- [x] A política de exclusão preserva a integridade referencial.
- [x] A documentação está pronta para orientar a criação do DER.
