import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local')
}

const uri = process.env.MONGODB_URI
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri)
    globalWithMongo._mongoClientPromise = client.connect()
      .then(client => {
        console.log('MongoDB conectado com sucesso')
        return client
      })
      .catch(err => {
        console.error('Erro ao conectar MongoDB:', err)
        throw err
      })
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  client = new MongoClient(uri)
  clientPromise = client.connect()
    .then(client => {
      console.log('MongoDB conectado com sucesso')
      return client
    })
    .catch(err => {
      console.error('Erro ao conectar MongoDB:', err)
      throw err
    })
}

export default clientPromise
