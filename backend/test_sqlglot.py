import sqlglot
from sqlglot import exp

def test():
    sql = "CREATE TABLE users (id int); DROP TABLE admin;"
    try:
        stmts = sqlglot.parse(sql, read="sqlite")
        for stmt in stmts:
            if stmt is None: continue
            if isinstance(stmt, exp.Create):
                if stmt.args.get("kind") != "TABLE":
                    print("Create other than table")
                    continue
                table = stmt.find(exp.Table)
                if not table:
                    print("No table block")
                    continue
                print("Create table:", table.name)
                table.set("this", exp.Identifier(this="t2_users", quoted=False))
                print("Safe SQL:", stmt.sql(dialect="sqlite"))
            else:
                print("Rejected:", type(stmt))
    except Exception as e:
        print("Parse Error:", e)

test()
