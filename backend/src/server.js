import Fastify from "fastify";
import cors from "@fastify/cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "node:crypto";

dotenv.config();

const app = Fastify({ logger: true });

const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || "CHANGE_ME_IN_PRODUCTION";
const origins = (process.env.FRONTEND_ORIGIN || "http://localhost:5173")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

await app.register(cors, {
  origin: origins.length === 1 ? origins[0] : origins
});

/*
  IMPORTANT:
  Your existing SIH backend developer already has the Neo4j/Postgres implementation.
  This file is a reference/demo backend matching the documented API contract.
  For the internal round, keep using the teammate's Render backend if it is working.
  Do NOT deploy a second backend unless your team actually needs it.
*/

const officers = [
  {
    username: process.env.DEMO_OFFICER_USERNAME || "demo_officer",
    passwordHash: await bcrypt.hash(
      process.env.DEMO_OFFICER_PASSWORD || "demo12345",
      10
    )
  }
];

const tips = [];

const connections = new Map([
  [
    "MH05AB1234",
    [
      {
        ownerName: "Ravi",
        vehicle: "MH05AB1234",
        suspect: "Vikram",
        verified: false
      }
    ]
  ]
]);

function auth(request, reply, done) {
  const header = request.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    reply.code(401).send({ error: "Unauthorized" });
    return;
  }
  try {
    request.user = jwt.verify(header.slice(7), JWT_SECRET);
    done();
  } catch {
    reply.code(401).send({ error: "Invalid or expired token" });
  }
}

app.get("/", async () => ({
  service: "VectorVision API",
  status: "online",
  version: "1.0"
}));

app.post("/login", async (request, reply) => {
  const { username, password } = request.body || {};
  const officer = officers.find(o => o.username === username);

  if (!officer || !(await bcrypt.compare(password || "", officer.passwordHash))) {
    return reply.code(401).send({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
  return { token };
});

app.post("/tips", async (request, reply) => {
  const { citizenName, tipText, registration } = request.body || {};
  if (!tipText?.trim()) {
    return reply.code(400).send({ error: "tipText is required" });
  }

  const id = crypto.randomUUID();
  const tip = {
    tipId: id,
    tipText: tipText.trim(),
    status: "pending",
    submittedAt: new Date().toISOString(),
    citizenName: citizenName?.trim() || null,
    vehicleRegistration: registration?.trim().toUpperCase() || null,
    hasImage: false
  };
  tips.unshift(tip);

  return [tip];
});

app.get("/tips", { preHandler: auth }, async (request) => {
  const status = request.query?.status;
  return status ? tips.filter(t => t.status === status) : tips;
});

app.get("/tips/:id", { preHandler: auth }, async (request, reply) => {
  const tip = tips.find(t => t.tipId === request.params.id);
  if (!tip) return reply.code(404).send({ error: "Tip not found" });
  return tip;
});

app.get("/vehicles/:registration/connections", async (request) => {
  const registration = request.params.registration.toUpperCase();
  const data = connections.get(registration) || [];
  return data.map(({ ownerName, vehicle, suspect }) => ({ ownerName, vehicle, suspect }));
});

app.patch("/connections/verify", { preHandler: auth }, async (request, reply) => {
  const { ownerName, vehicleRegistration } = request.body || {};
  const key = String(vehicleRegistration || "").toUpperCase();
  const rows = connections.get(key) || [];
  const row = rows.find(x => x.ownerName === ownerName);

  if (!row) {
    return reply.code(404).send({ error: "No matching OWNS relationship found" });
  }

  row.verified = true;
  return [{
    ownerName: row.ownerName,
    vehicleRegistration: key,
    verified: true
  }];
});

app.listen({ port: PORT, host: "0.0.0.0" })
  .then(() => app.log.info(`VectorVision API listening on ${PORT}`))
  .catch(err => {
    app.log.error(err);
    process.exit(1);
  });
