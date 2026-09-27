import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
} from '@aws-sdk/client-s3'

const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
})

export const uploadToR2 = async ({
    key,
    body,
    contentType,
    contentLength,
}) => {
    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: contentType,
        ContentLength: contentLength,
    })

    return await r2Client.send(command)
}

export const getFromR2 = async (key) => {
    const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
    })

    return await r2Client.send(command)
}

export const deleteFromR2 = async (key) => {
    const command = new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
    })

    return await r2Client.send(command)
}