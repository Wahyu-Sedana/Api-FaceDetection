require('dotenv').config()
const crypto = require('crypto')
const AWS = require('aws-sdk')
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
})

const rekognition = new AWS.Rekognition()
const s3 = new AWS.S3()

const bucket = 'wajahfikasi-speed'
const collectionId = 'wajahfikasi-speed'

const detectFace = (req, res) => {
    let image = req.file.buffer

    let params = {
        Image: {
            Bytes: image
        },
        Attributes: ["ALL"]
    }

    rekognition.detectFaces(params, (err, data) => {
        if (err) {
            res.status(500).json({
                message: "Error while detecting faces",
                error: err
            });
        } else {
            let searchImage = {
                CollectionId: collectionId,
                FaceMatchThreshold: 95,
                Image: {
                    Bytes: image
                }
            }
            rekognition.searchFacesByImage(searchImage, (err, data) =>{
                if (err) {
                    res.status(500).json({
                        message: "Error while searching faces",
                        error: err
                    });
                } else {
                    if(data.FaceMatches){
                        if(Object.keys(data.FaceMatches).length > 0){
                            console.log("gambar sudah ada");
                            res.status(200).json({
                                message: "gambar sudah ada"
                            })
                        }else { 
                            console.log("gambar tidak ada");
                            res.status(200).json({
                                message: "gambar tidak ada"
                            })

                            const encryptionKey = 'example';
                            const encriptName = crypto.createHash('sha256', encryptionKey).update(image).digest('hex')
                            let uploadParams = {
                                Bucket : bucket,
                                Key: encriptName,
                                Body: image,
                                ContentType: 'image/jpeg'
                            }
                            s3.upload(uploadParams, (err, data) => {
                                if(err) throw err
                                console.log(data);
                                
                                let indexParams = {
                                    CollectionId: collectionId,
                                    Image: {
                                        S3Object: {
                                            Bucket: bucket  ,
                                            Name: encriptName
                                        }
                                    }
                                }
                                rekognition.indexFaces(indexParams, (err, data) => {
                                    if(err) throw err
                                    console.log(data);
                                })
                            })
                        }
                    }else {
                        console.log("gambar tidak ada");
                    }
                }
            })
        }
    })
}

const deleteFace = (req, res) => {
    rekognition.listFaces({ CollectionId: collectionId }, (err, data) => {
        if (err) {
            res.status(500).json({
                message: "Error while listing faces",
                error: err
            });
        } else {
            let faceIds = data.Faces.map(face => face.FaceId);
            rekognition.deleteFaces({ CollectionId: collectionId, FaceIds: faceIds }, (err, data) => {
                if (err) {
                    res.status(500).json({
                        message: "Error while deleting faces",
                        error: err
                    });
                }
            });
        }
    });
    s3.listObjects({ Bucket: bucket }, (err, data) => {
        if (err) {
            res.status(500).json({
                message: "Error while listing objects",
                error: err
            });
        } else {
            for (let object of data.Contents) {
                s3.deleteObject({ Bucket: bucket, Key: object.Key }, (err, data) => {
                    if (err) {
                        res.status(500).json({
                            message: "Error while deleting object",
                            error: err
                        });
                    }
                });
            }
        }
    });

    res.status(200).json({
        message: "Successfully deleted all face"
    })
}

module.exports = { detectFace, deleteFace }