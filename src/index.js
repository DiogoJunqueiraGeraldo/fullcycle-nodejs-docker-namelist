const express = require("express");
const mysql = require("mysql2/promise");

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, SERVER_PORT } = process.env;
const PORT = SERVER_PORT || 3000;

const createConfig = () => ({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
});

let shared_conn;
const createConnection = async () => {
  if (!shared_conn) {
    shared_conn = await mysql.createConnection(createConfig());
    shared_conn.query(`CREATE TABLE IF NOT EXISTS people(
			id int not null auto_increment,
			name varchar(255),
			primary key(id)
		)`);
  }

  return shared_conn;
};

const insertPeople = async (name) => {
  const query = `INSERT INTO people(name) values('${name}')`;
  const conn = await createConnection();
  await conn.query(query);
  await conn.commit();
};

const retrievePeople = async () => {
  const query = `SELECT * FROM people`;
  const conn = await createConnection();
  const people = conn.query(query);
  return people;
};

const getHealthStatusMsg = (port) => `Server up and running on port ${port}`;
const getNotFoundPage = (path) => `<h1>404 - ${path} Page Not Found</h1>`;
const get5xxError = (errMsg) =>
  `<html><h1>500 Internal Server Error</h1><p>${errMsg}</p></html>`;

const getListFromPeople = (people) => {
  let li = "<ul>";

  if (people && people.length) {
    li = people.map(({ name }) => `<li>${name}</li>`).join("");
  }

  li += "</ul>";

  return li;
};

const getFullPage = (list) => `<html><h1>Full Cycle Rocks!</h1>${list}</html>`;

const app = express();

app.use(express.json());

app.post("/register", async (req, res) => {
  try {
    await insertPeople(req.body.name);

    const [people] = await retrievePeople();

    let list = getListFromPeople(people);
    let html = getFullPage(list);

    res.status(200).send(html);
  } catch (err) {
    res.status(500).send(get5xxError(err.message));
  }
});

app.get("/", async (_, res) => {
  try {
    const [people] = await retrievePeople();

    let list = getListFromPeople(people);
    let html = getFullPage(list);

    res.status(200).send(html);
  } catch (err) {
    res.status(500).send(get5xxError(err.message));
  }
});

const healthStatusMsg = getHealthStatusMsg(PORT);

app.get("/health-check", (_, res) => res.status(200).send(healthStatusMsg));
app.all("*", (req, res) => res.status(404).send(getNotFoundPage(req.path)));
app.listen(PORT, () => console.log(healthStatusMsg));
