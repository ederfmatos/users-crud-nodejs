const express = require("express");
const cors = require("cors");
const btoa = require("btoa");
const { v4 } = require("uuid");
const fs = require("fs");

const app = express();

app.use(express.json());
app.use(cors());

const FILE_NAME = "users.json";

async function getUsers() {
  return new Promise((resolve) => {
    fs.readFile(FILE_NAME, function (err, data) {
      const users = JSON.parse(data);
      resolve(users);
    });
  });
}

async function saveUsers(users) {
  return new Promise((resolve, reject) => {
    fs.writeFile(FILE_NAME, JSON.stringify(users), (error) => {
      if (error) {
        return reject();
      }

      return resolve();
    });
  });
}

app.get("/users", async (request, response) => {
  const users = await getUsers();
  users.forEach((user) => delete user.password);
  response.json(users);
});

app.post("/users", async (request, response) => {
  const user = {
    id: v4(),
    ...request.body,
  };

  const users = await getUsers();

  const userWithSameEmail = users.find(
    (item) => item.email && item.email === user.email
  );
  if (userWithSameEmail) {
    return response
      .status(409)
      .json({ error: "Já existe um usuário cadastrado com esse email" });
  }

  users.push(user);

  await saveUsers(users);
  delete user.password;
  response.status(201).json(user);
});

app.get("/users/:id", async (request, response) => {
  const { id } = request.params;

  const users = await getUsers();
  const user = users.find((item) => item.id === id);

  if (!user) {
    return response.status(404).json({ error: "Usuário não encontrado" });
  }
  delete user.password;
  return response.json(user);
});

app.put("/users/:id", async (request, response) => {
  const { id } = request.params;

  const users = await getUsers();

  const user = users.find((item) => item.id === id);

  if (!user) {
    return response.status(404).json({ error: "Usuário não encontrado" });
  }

  const newUser = {
    ...user,
    ...request.body,
  };

  users.splice(users.indexOf(user), 1, newUser);

  await saveUsers(users);

  delete newUser.password;
  return response.status(200).json(newUser);
});

app.delete("/users/:id", async (request, response) => {
  const { id } = request.params;

  const users = await getUsers();

  const user = users.find((item) => item.id === id);

  if (!user) {
    return response.status(404).json({ error: "Usuário não encontrado" });
  }

  users.splice(users.indexOf(user), 1);

  await saveUsers(users);
  return response.status(204).send();
});

app.post("/auth", async (request, response) => {
  const { email, password } = request.body;

  const users = await getUsers();
  const user = users.find((item) => item.email === email);

  if (!user || user.password !== password) {
    return response.status(401).json({ error: "E-mail ou senha incorretos" });
  }

  const token = btoa(JSON.stringify(user));
  response.setHeader("Authorization", token);
  response.setHeader("Access-Control-Expose-Headers", "Authorization");
  return response.status(204).send();
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
