import mongoose from 'mongoose'
import  connectDB from './db.js'

try {
  await connectDB()
  const db = mongoose.connection.db


  const command = 'collMod'

  await db.command({
    [command]: 'users',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['_id', 'name', 'email', 'password', 'rootDirId'],
        properties: {
          _id: {
            bsonType: 'objectId'
          },
          name: {
            bsonType: 'string',
            minLength: 3,
            description:
              'Name must be at least 3 characters long'
          },
          email: {
            bsonType: 'string',
            description: 'please enter a valid email address',
            pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$'
          },
          password: {
            bsonType: 'string',
            minLength: 4
          },
          rootDirId: {
            bsonType: 'objectId'
          }
        },
        additionalProperties: false
      }
    },
    validationAction: 'error',
    validationLevel: 'strict'
  })

  await db.command({
    [command]: 'directories',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['_id', 'name', 'userId', 'parentDirId'],
        properties: {
          _id: {
            bsonType: 'objectId'
          },
          name: {
            bsonType: 'string'
          },
          userId: {
            bsonType: 'objectId'
          },
          parentDirId: {
            bsonType: ['objectId', 'null']
          }
        }
      }
    },
    validationAction: 'error',
    validationLevel: 'strict'
  })

  await db.command({
    [command]: 'files',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['_id', 'name', 'extension', 'userId', 'parentDirId'],
        properties: {
          _id: {
            bsonType: 'objectId'
          },
          name: {
            bsonType: 'string'
          },
          extension: {
            bsonType: 'string'
          },
          userId: {
            bsonType: 'objectId'
          },
          parentDirId: {
            bsonType: ['objectId', 'null']
          }
        },
        // additionalProperties: false
      }
    },
    validationAction: 'error',
    validationLevel: 'strict'
  })
} catch (err) {
  console.log('Error setting up the database', err)
  
} finally {
  await mongoose.connection.close()
}
