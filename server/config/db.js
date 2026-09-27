import mongoose from 'mongoose'
import 'dotenv/config'
const connectDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'cloudspacego'
    })
    console.log(
      `DB Connected : ${connect.connection.host}, ${connect.connection.name}`
    )
  } catch (error) {
    console.error('MongoDB connection failed:', error.message)
    process.exit(1) // exit the program
  }
}

process.on('SIGINT', async () => {
  await mongoose.disconnect()
  console.log('Database Disconnected!')
  process.exit(0)
})

export default connectDB
