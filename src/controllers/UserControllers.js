import AppsError from "../utils/AppsError.js";
import VerificadorDeBancoDeDados from "../database/postgreSQL/index.js";

const verificador = new VerificadorDeBancoDeDados()

class UserControllers {
    create( request, response ) {
        const { id, username, password, isAdmin } = request.body;

        const dados = {
            id,
            username,
            password,
            isAdmin,
        };

        if(!id || !username || !password){
            throw new AppsError("Os dados são obrigatório!")
        }

        verificador.inserirDados('users', dados);
        verificador.mostrarDados('users');
        response.json( { id, username, password } );
        
    }

    async read(request, response) {
        const { id } = request.params; // Verifica se um ID foi passado

        try {
            if (id) {
                // Se um ID foi passado, retorna apenas o usuário específico
                const query = `SELECT * FROM users WHERE id = $1;`;
                const client = await verificador.pool.connect();
                const { rows } = await client.query(query, [id]);
                client.release();

                if (rows.length > 0) {
                    return response.json(rows[0]); // Retorna o usuário encontrado
                } else {
                    throw new AppsError(`Nenhum usuário encontrado com o ID ${id}`, 404);
                }
            } else {
                // Se nenhum ID foi passado, retorna todos os usuários
                const query = `SELECT * FROM users;`;
                const client = await verificador.pool.connect();
                const { rows } = await client.query(query);
                client.release();

                if (rows.length > 0) {
                    return response.json(rows); // Retorna todos os usuários
                } else {
                    return response.json({ message: "Nenhum usuário encontrado" });
                }
            }
        } catch (err) {
            return response.status(500).json({ error: 'Erro ao buscar dados', details: err.message });
        }
    }

    async update(request, response) {
        const { username, password, isAdmin } = request.body;
        const { id } = request.params;

        // Verifica se o ID e os dados necessários foram fornecidos
        if (!id || !username || !password) {
            throw new AppsError("ID, username e password são obrigatórios!", 400);
        }

        const dados = {
            id,
            username,
            password,
            isAdmin
        };

        try {
            // Atualiza os dados no banco de dados
            const result = await verificador.atualizarDados('users', dados);

            // Se a atualização for bem-sucedida, retorna os dados atualizados
            if (result) {
                return response.status(200).json({ success: true, updatedData: result });
            } else {
                // Se nenhum dado foi encontrado para o ID fornecido
                throw new AppsError(`Nenhum registro encontrado com ID ${id}`, 404);
            }
        } catch (err) {
            // Retorna um erro em caso de exceção
            return response.status(500).json({ error: 'Erro ao atualizar os dados', details: err.message });
        }
    }

    async delete(request, response) {
        const { id } = request.params;

        // Verifica se o ID foi fornecido
        if (!id) {
            throw new AppsError("ID é obrigatório para deletar!", 400);
        }

        try {
            // Deleta o usuário do banco de dados
            const result = await verificador.apagarDados('users', 'id', id);

            if (result) {
                return response.status(200).json({ success: true, message: `Usuário com ID ${id} deletado com sucesso!` });
            } else {
                throw new AppsError(`Nenhum registro encontrado com ID ${id}`, 404);
            }
        } catch (err) {
            return response.status(500).json({ error: 'Erro ao deletar o usuário', details: err.message });
        }
    }

};

export default UserControllers;