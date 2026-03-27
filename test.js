const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://rupeshdatabase:rupeshkumar9091@cluster0.2zu9ek1.mongodb.net/?appName=Cluster0";

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
    console.log("✅ Dimaag kharab karna band karo, MongoDB Connect ho gaya!");
  } catch(err) {
    console.log("❌ Error aa gaya bhai:", err.message);
  } finally {
    await client.close();
  }
}
run();