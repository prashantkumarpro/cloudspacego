import fs from 'fs'
import path from 'path'
import { pipeline } from 'stream/promises'

const storageRoot = path.resolve('./storage')

export const uploadToLocal = async ({
    key,
    body,
}) => {
    const filePath = path.resolve(storageRoot, key)

    await fs.promises.mkdir(path.dirname(filePath), {
        recursive: true,
    })

    const writeStream = fs.createWriteStream(filePath)

    await pipeline(body, writeStream)
}

export const getFromLocal = async (key) => {
    const filePath = path.resolve(storageRoot, key)

    const stat = await fs.promises.stat(filePath)

    return {
        Body: fs.createReadStream(filePath),
        ContentLength: stat.size,
    }
}

export const deleteFromLocal = async (key) => {
    const filePath = path.resolve(storageRoot, key)

    await fs.promises.rm(filePath)
}