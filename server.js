// server.js
"use strict";



const express = require("express");
const pool = require("./db"); // importando o arquivo db.js
const app = express();  
app.use(express.json()); // para receber JSON no body
const cors = require("cors");
app.use(cors())

/******************************************************************************
 *                               EVENT TYPES
 ******************************************************************************/

// [GET] Listar todos os tipos de evento
app.get("/eventtypes", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM event_types");
    return res.json(rows); // envia array de tipos
  } catch (error) {
    console.error("Erro GET /eventtypes:", error);
    return res.status(500).json({ error: "Erro ao buscar tipos de evento" });
  }
});

// [GET] Obter um tipo de evento específico
app.get("/eventtypes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM event_types WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Tipo de evento não encontrado" });
    }
    return res.json(rows[0]);
  } catch (error) {
    console.error("Erro GET /eventtypes/:id:", error);
    return res.status(500).json({ error: "Erro ao buscar o tipo de evento" });
  }
});

// [POST] Criar um novo tipo de evento
app.post("/eventtypes", async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ error: "description é obrigatório" });
    }
    const [result] = await pool.query(
      "INSERT INTO event_types (description) VALUES (?)",
      [description]
    );
    // Retornamos o ID gerado e a própria description
    return res.status(201).json({ id: result.insertId, description });
  } catch (error) {
    console.error("Erro POST /eventtypes:", error);
    return res.status(500).json({ error: "Erro ao criar tipo de evento" });
  }
});

// [PUT] Atualizar um tipo de evento
app.put("/eventtypes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ error: "description é obrigatório" });
    }
    const [result] = await pool.query(
      "UPDATE event_types SET description=? WHERE id=?",
      [description, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Tipo de evento não encontrado" });
    }
    return res.json({ message: "Tipo de evento atualizado com sucesso" });
  } catch (error) {
    console.error("Erro PUT /eventtypes/:id:", error);
    return res.status(500).json({ error: "Erro ao atualizar tipo de evento" });
  }
});

// [DELETE] Apagar um tipo de evento
app.delete("/eventtypes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // se a foreign key estiver ON DELETE RESTRICT, dará erro se tiver events atrelados
    const [result] = await pool.query("DELETE FROM event_types WHERE id=?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Tipo de evento não encontrado ou em uso" });
    }
    return res.json({ message: "Tipo de evento apagado com sucesso" });
  } catch (error) {
    console.error("Erro DELETE /eventtypes/:id:", error);
    return res.status(500).json({ error: "Erro ao apagar tipo de evento" });
  }
});

/******************************************************************************
 *                               EVENTS
 ******************************************************************************/

// [GET] Listar todos os eventos
app.get("/events", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.id,
             t.description AS typeName,
             e.description,
             e.date
      FROM events e
      JOIN event_types t ON e.typeId = t.id
    `);
    return res.json(rows); // rows agora terá {id, typeName, description, date}
  } catch (error) {
    console.error("Erro GET /events:", error);
    return res.status(500).json({ error: "Erro ao buscar eventos" });
  }
});


// [GET] Obter um evento específico
app.get("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM events WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Evento não encontrado" });
    }
    return res.json(rows[0]);
  } catch (error) {
    console.error("Erro GET /events/:id:", error);
    return res.status(500).json({ error: "Erro ao buscar o evento" });
  }
});

// Recebe typeName do body em vez de typeId
const { typeName, description, date } = req.body;
if (!typeName || !description || !date) {
  return res.status(400).json({ error: "Campos obrigatórios ausentes" });
}

// Busca o ID do tipo de evento a partir do nome
const [rows] = await pool.query("SELECT id FROM event_types WHERE description = ?", [typeName]);
if (rows.length === 0) {
  return res.status(400).json({ error: `Tipo "${typeName}" não existe na tabela event_types` });
}
const typeId = rows[0].id;

// Agora insere no 'events'
const [result] = await pool.query(
  "INSERT INTO events (typeId, description, date) VALUES (?,?,?)",
  [typeId, description, date]
);
return res.status(201).json({
  id: result.insertId,
  typeName,
  description,
  date
});


// [PUT] Atualizar um evento
app.put("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { typeId, description, date } = req.body;
    if (!typeId || !description || !date) {
      return res.status(400).json({ error: "typeId, description, date são obrigatórios" });
    }
    // Verificar se typeId existe
    const [checkType] = await pool.query("SELECT id FROM event_types WHERE id=?", [typeId]);
    if (checkType.length === 0) {
      return res.status(400).json({ error: "typeId não existe" });
    }

    const [result] = await pool.query(
      "UPDATE events SET typeId=?, description=?, date=? WHERE id=?",
      [typeId, description, date, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Evento não encontrado" });
    }
    return res.json({ message: "Evento atualizado com sucesso" });
  } catch (error) {
    console.error("Erro PUT /events/:id:", error);
    return res.status(500).json({ error: "Erro ao atualizar evento" });
  }
});

// [DELETE] Apagar um evento
app.delete("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Se tiver ON DELETE RESTRICT e existirem membros inscritos neste evento, falhará
    const [result] = await pool.query("DELETE FROM events WHERE id=?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Evento não encontrado ou em uso" });
    }
    return res.json({ message: "Evento apagado com sucesso" });
  } catch (error) {
    console.error("Erro DELETE /events/:id:", error);
    return res.status(500).json({ error: "Erro ao apagar evento" });
  }
});

/******************************************************************************
 *                               MEMBERS
 ******************************************************************************/

// [GET] Listar todos os membros (com preferências e eventos)
app.get("/members", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT m.id as memberId,
             m.name as memberName,
             mp.eventTypeId as prefTypeId,
             me.eventId as eventId
      FROM members m
      LEFT JOIN member_preferred_event_types mp ON mp.memberId = m.id
      LEFT JOIN member_events me ON me.memberId = m.id
    `);

    // Agrupar
    const membersMap = {};
    rows.forEach(row => {
      if (!membersMap[row.memberId]) {
        membersMap[row.memberId] = {
          id: row.memberId,
          name: row.memberName,
          preferredEventTypeIds: [],
          eventIds: []
        };
      }
      if (row.prefTypeId && !membersMap[row.memberId].preferredEventTypeIds.includes(row.prefTypeId)) {
        membersMap[row.memberId].preferredEventTypeIds.push(row.prefTypeId);
      }
      if (row.eventId && !membersMap[row.memberId].eventIds.includes(row.eventId)) {
        membersMap[row.memberId].eventIds.push(row.eventId);
      }
    });
    const result = Object.values(membersMap);
    return res.json(result);
  } catch (error) {
    console.error("Erro GET /members:", error);
    return res.status(500).json({ error: "Erro ao buscar membros" });
  }
});

// [POST] Criar novo membro
app.post("/members", async (req, res) => {
  try {
    const { name, preferredEventTypeIds } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Falta o nome do membro" });
    }
    // 1) Inserir em members
    const [result] = await pool.query("INSERT INTO members (name) VALUES (?)", [name]);
    const memberId = result.insertId;

    // 2) Inserir preferências na pivot
    if (Array.isArray(preferredEventTypeIds)) {
      for (let tid of preferredEventTypeIds) {
        await pool.query(
          "INSERT INTO member_preferred_event_types (memberId, eventTypeId) VALUES (?,?)",
          [memberId, tid]
        );
      }
    }

    return res.status(201).json({ message: "Membro criado com sucesso" });
  } catch (error) {
    console.error("Erro POST /members:", error);
    return res.status(500).json({ error: "Erro ao criar membro" });
  }
});

app.put("/members/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, preferredEventTypeIds } = req.body;
    // 1) Atualiza nome
    const [result] = await pool.query("UPDATE members SET name=? WHERE id=?", [name, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Membro não encontrado" });
    }

    // 2) Recria a pivot (apaga as antigas)
    await pool.query("DELETE FROM member_preferred_event_types WHERE memberId=?", [id]);

    // 3) Insere as novas
    if (Array.isArray(preferredEventTypeIds)) {
      for (let tid of preferredEventTypeIds) {
        await pool.query(
          "INSERT INTO member_preferred_event_types (memberId, eventTypeId) VALUES (?,?)",
          [id, tid]
        );
      }
    }

    return res.json({ message: "Membro atualizado com sucesso" });
  } catch (error) {
    console.error("Erro PUT /members/:id:", error);
    return res.status(500).json({ error: "Erro ao atualizar membro" });
  }
});


// [DELETE] Apagar membro
app.delete("/members/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Apaga primeiramente as pivot (opcional, se tiver ON DELETE CASCADE)
    await pool.query("DELETE FROM member_preferred_event_types WHERE memberId=?", [id]);
    await pool.query("DELETE FROM member_events WHERE memberId=?", [id]);

    const [result] = await pool.query("DELETE FROM members WHERE id=?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Membro não encontrado" });
    }
    return res.json({ message: "Membro apagado com sucesso" });
  } catch (error) {
    console.error("Erro DELETE /members/:id:", error);
    return res.status(500).json({ error: "Erro ao apagar membro" });
  }
});

// [POST] Inscrever em evento
app.post("/members/:id/events", async (req, res) => {
  try {
    const memberId = req.params.id;
    const { eventId } = req.body;
    if (!eventId) {
      return res.status(400).json({ error: "Falta eventId" });
    }
    // Insere na pivot
    await pool.query(
      "INSERT INTO member_events (memberId, eventId) VALUES (?,?)",
      [memberId, eventId]
    );
    return res.json({ message: "Inscrito com sucesso" });
  } catch (error) {
    console.error("Erro POST /members/:id/events:", error);
    return res.status(500).json({ error: "Erro ao inscrever membro" });
  }
});

// [DELETE] Desinscrever de evento
app.delete("/members/:id/events/:eventId", async (req, res) => {
  try {
    const memberId = req.params.id;
    const eventId = req.params.eventId;
    await pool.query(
      "DELETE FROM member_events WHERE memberId=? AND eventId=?",
      [memberId, eventId]
    );
    return res.json({ message: "Desinscrito com sucesso" });
  } catch (error) {
    console.error("Erro DELETE /members/:id/events/:eventId:", error);
    return res.status(500).json({ error: "Erro ao desinscrever membro" });
  }
});


/******************************************************************************
 *                               SERVE FRONT-END
 ******************************************************************************/

// (Opcional) se você quiser servir os arquivos estáticos (index.html, etc.),
// coloque-os na pasta "public" e descomente a linha abaixo:
app.use(express.static("www"));

/******************************************************************************
 *                               START SERVER
 ******************************************************************************/
const PORT = 3000; // ou outra porta que preferir
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
