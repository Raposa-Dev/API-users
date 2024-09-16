import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export default class VerificadorDeBancoDeDados {
    constructor() {
        const { Pool } = pg;
        this.pool = new Pool({
            
            user: process.env.DB_USER, 
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT || 5432,

        });
    }

    async mostrarDados(tabela) {
        const query = `SELECT * FROM ${tabela};`; // Consulta para selecionar todos os registros da tabela

        try {
            const client = await this.pool.connect();
            const { rows } = await client.query(query); // Executa a consulta e armazena os resultados
            client.release();

            // Verifica se há dados para mostrar
            if (rows.length > 0) {
                console.log(`Dados na tabela "${tabela}":`);
                console.table(rows); // Mostra os dados no console em formato de tabela
            } else {
                console.log(`A tabela "${tabela}" está vazia.`);
            }
        } catch (err) {
            console.error('Erro ao mostrar os dados:', err);
        }
    } 

    async inserirDados(tabela, dados) {
        try {
            const client = await this.pool.connect(); // Conecta ao banco de dados
    
            // Gera as chaves (colunas) e valores a partir dos dados fornecidos
            const keys = Object.keys(dados);
            const values = Object.values(dados);
    
            // Cria a query de inserção
            const query = `
                INSERT INTO ${tabela} (${keys.join(', ')}) 
                VALUES (${values.map((_, index) => `$${index + 1}`).join(', ')}) 
                RETURNING *;
            `;
    
            // Executa a query de inserção
            const { rows } = await client.query(query, values);
            client.release(); // Libera o client após a execução
    
            console.log('Dados inseridos com sucesso:', rows[0]); // Mostra o primeiro registro inserido
            return rows[0]; // Retorna o registro inserido
    
        } catch (err) {
            console.error('Erro ao inserir dados:', err);
        }
    }
    
    async atualizarDados(tabela, dados) {
        const { id, username, password, isAdmin } = dados; 
        const query = `
          UPDATE ${tabela}
          SET username = $1, password = $2, isAdmin = $3
          WHERE id = $4
          RETURNING *;  -- Retorna os dados atualizados
        `;
    
        const values = [username, password, isAdmin, id];
    
        try {
            const client = await this.pool.connect();
            const { rows } = await client.query(query, values);
            client.release();
    
            // Se houver resultados, retornamos o primeiro registro atualizado
            if (rows.length > 0) {
                return rows[0];
            } else {
                return null;
            }
        } catch (err) {
            console.error('Erro ao atualizar os dados:', err);
            throw new Error('Erro na atualização dos dados.');
        }
    }
    
    async apagarDados(tabela, campo, valor) {

        // Comando para deletar os dados com base no campo e valor fornecidos
        const query = `DELETE FROM ${tabela} WHERE ${campo} = $1 RETURNING *;`;

        try {
            const client = await this.pool.connect();
            const { rows } = await client.query(query, [valor]); // Executa a consulta passando o valor como parâmetro
            client.release();

            // Verifica se algum registro foi apagado
            if (rows.length > 0) {
                console.log(`Registros apagados da tabela "${tabela}":`);
                console.table(rows); // Mostra os registros apagados no console em formato de tabela
            } else {
                console.log(`Nenhum registro encontrado para apagar na tabela "${tabela}" com ${campo} = ${valor}.`);
            }
        } catch (err) {
            console.error('Erro ao apagar os dados:', err);
        }
    }

    fecharConexao() {
        this.pool.end();
    }
}

