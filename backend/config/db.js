const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://bassalim03:hacka042025@hacka-04-2025.6n2xfnt.mongodb.net/?retryWrites=true&w=majority&appName=hacka-04-2025";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Connected to MongoDB!");
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
