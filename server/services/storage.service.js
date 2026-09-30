import {
    uploadToR2,
    getFromR2,
    deleteFromR2,
} from './r2.service.js'

import {
    uploadToLocal,
    getFromLocal,
    deleteFromLocal,
} from './local.storage.js'

const storageDriver = process.env.STORAGE_DRIVER

export const uploadFile = async (options) => {
    if (storageDriver === 'local') {
        return uploadToLocal(options)
    }

    return uploadToR2(options)
}

export const getFile = async (key) => {
    if (storageDriver === 'local') {
        return getFromLocal(key)
    }

    return getFromR2(key)
}

export const deleteFile = async (key) => {
    if (storageDriver === 'local') {
        return deleteFromLocal(key)
    }

    return deleteFromR2(key)
}