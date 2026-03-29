# 🛡️ Relatório de Cibersegurança (Red Team)

Este documento registra as vulnerabilidades encontradas ativamente durante as fases de testes de segurança, antes da execução plena de features, conforme definido no fluxo de arquitetura do Diretor. Serve de backlog e guia de implementação para os programadores (Claude e equipe).

---

## 📅 [29/03/2026] Milestone 2 - Fase 1: Importação SQL Avançada

### 🎯 Alvo: Endpoint de Importação Roteada (`POST /api/import/sql`)
Durante a fase de Red Teaming no parsing de arquivos `.sql`, testamos a mecânica atual que utilizava `sqlparse` e `re.sub()` (Expressões Regulares) para injetar o tenant (prefixo `t1_`) no nome da tabela.

### 🐛 Vulnerabilidade Crítica Encontrada: SQL Piggybacking & AST Injection
O uso de expressões regulares para sanitizar e prefixar nomes de tabelas é falho sob ataques ativos:
1. **Piggybacking de Drop:** O parser regex captura apenas a primeira ocorrência do NOME da tabela e reconstrói a query. Se o atacante enviar `CREATE TABLE users (id int); DROP TABLE master_users;`, a regex processa a primeira parte (substituindo `users` por `t2_users`), mas o SQLite acaba executando toda a string inteira, concretizando o `DROP` ou outras injeções de DDL na mesma chamada do `engine.execute`.
2. **Comment Bypass:** Manipulações como `CREATE TABLE vulneravel /* DROP TABLE admins; */ (id int)` também contornam as validações ingênuas de regex, causando estragos de privilégios e violação do Tenant Isolation.

### 🛠️ Plano Estrutural para o Programador (Claude)
Para garantir execução atômica e 100% isolada na Engine Virtual do CMS, a arquitetura de string match deve ser substituída por Parsing e Mutação de **AST (Abstract Syntax Tree)** usando a biblioteca `sqlglot`:
1. Instalar `sqlglot`.
2. Utilizar `sqlglot.parse(sql, read="sqlite")` para desmembrar a query em nós atômicos.
3. Isolar o nó de Tabela (`stmt.find(exp.Table)`), trocar programaticamente o `Identifier` (nome da tabela) pelo `physical_name` prefixado.
4. Renderizar a string limpa novamente com `stmt.sql()`, o que automaticamente varre qualquer "sujeira", múltiplos statements encadeados e piggybacking, pois a AST cospe a visualização pura daquele único Node válido.
5. **Atenção (Crash Notado na PoC):** A prova de conceito do Antigravity modificou o `main.py` mas causou aproximadamente 20 quebras no `pytest` (`test_import.py`, etc). **Sua missão como programador (Claude)** será finalizar a adaptação do AST no `main.py` consertando a quebra dos testes e lidando com os corner-cases do `sqlite` na exportação do `sqlglot`.

*(Antigravity - Planejador)*
