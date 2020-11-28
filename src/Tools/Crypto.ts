import crypto = require('crypto')

export const GetMd5 = (str: string, OutType: 'hex' | 'ascii') => {
    return crypto
        .createHash('md5')
        .update(Buffer.from(str, 'ascii'))
        .digest(OutType as crypto.HexBase64Latin1Encoding)
}

export const GetMd5Bf = (Data) => {
    return crypto.createHash('md5').update(Buffer.from(Data, 'ascii')).digest('hex')
}

export const GetAes = (str: string, key: string) => {
    return crypto.createCipheriv('aes-128-ecb', key, '').update(str, 'ascii', 'hex')
}

export const DecryptBlowfish = (BlowfishKey: string, EncryptedBuffer: Buffer) => {
    const cipher = crypto.createDecipheriv('bf-cbc', BlowfishKey, Buffer.from([0, 1, 2, 3, 4, 5, 6, 7]))
    cipher.setAutoPadding(false)
    return cipher.update(EncryptedBuffer, 'binary', 'binary') + cipher.final()
}
