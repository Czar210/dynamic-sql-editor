# Teste de Segurança (Red Team): SQL Import Injections
import os
import sys

# Adiciona o diretorio atual (backend) no sys.path para conseguirmos importar main e database
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import _parse_sql_statements

def run_hack_tests():
    print("Iniciando bateria de testes Red Team (Cybersecurity)...")
    prefix = "t2_"
    
    malicious_payloads = [
        # Tentativa 1: Piggybacking DROP TABLE
        ("CREATE TABLE users (id int); DROP TABLE _tables;", "Piggyback DROP"),
        # Tentativa 2: Nome de tabela com injeção (evasion)
        ('CREATE TABLE "users; DROP TABLE users;" (id int);', "Table Name Injection"),
        # Tentativa 3: Comment Bypass
        ("CREATE TABLE legit /* DROP TABLE master; */ (id int);", "Comment Bypass"),
        # Tentativa 4: UPDATE em tabelas de sistema via INSERT
        ("INSERT INTO _tables (id, name) VALUES (1, 'hack');", "System Table Targeting via INSERT"),
    ]

    for payload, desc in malicious_payloads:
        print(f"\n[Testando: {desc}]")
        print(f"Payload: {payload}")
        try:
            results = _parse_sql_statements(payload, prefix)
            for res in results:
                print(f" -> Result Status: {res.get('status')} | Extracted Table: {res.get('table_name')} | Pre-Stmt: {res.get('statement')}")
                # Simulando como o main.py aplica regex de prefixo
                if res.get("status") == "ok":
                    import re
                    prefixed = re.sub(rf"\b{re.escape(res.get('table_name', ''))}\b", res.get('physical_name', ''), res.get('statement', ''), count=1, flags=re.IGNORECASE)
                    print(f" -> Vulnerável? (Query final que seria rodada): {prefixed}")
        except Exception as e:
            print(f" -> Error (Bloqueado por Parser Exception): {e}")

if __name__ == "__main__":
    run_hack_tests()
