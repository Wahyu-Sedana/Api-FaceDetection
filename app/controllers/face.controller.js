require('dotenv').config()
const AWS = require('aws-sdk')
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
})

const rekognition = new AWS.Rekognition()
const s3 = new AWS.S3()

const bucket = process.env.AWS_BUCKET_NAME
const collectionId = process.env.AWS_COLLECTION_ID

const randomKey = Math.floor(Math.random() * 1000000)

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
                    if(Object.keys(data.FaceMatches).length > 0){
                        console.log("Face Matches");
                        res.status(200).json({
                            message: "Face Matches",
                            data: data.FaceMatches[0].Face.ExternalImageId
                        })
                    }else { 
                        console.log("Face Unmatches");
                        res.status(200).json({
                            message: "Face Unmatches",
                        })

                        let uploadParams = {
                            Bucket : bucket,
                            Key: `${randomKey}-${req.file.originalname}`,
                            Body: image,
                            ContentType: 'image/jpeg'
                        }
                        s3.upload(uploadParams, (err, data) => {
                            if(err) throw err
                            console.log(data);
                            let indexParams = {
                                CollectionId: collectionId,
                                Image: {
                                    Bytes: image
                                },
                                ExternalImageId: req.file.originalname
                            }
                            rekognition.indexFaces(indexParams, (err, data) => {
                                if(err) throw err
                                console.log(data);
                            })
                        })
                        
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
