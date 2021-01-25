const express = require('express')
const User = require('../models/users')
const jwt = require('jsonwebtoken')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendGoodByeEmail } = require('../emails/account')
const router = new express.Router()



router.post('/users', async (req,res)=>{
    const user =new User(req.body)
    try {
        await user.save()
        sendWelcomeEmail(user.email,user.name)
        const token = await user.generateToken()
        res.send({user , token})
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/users/login', async (req,res)=>{
    try {
        const user = await User.findByCredentials(req.body.email , req.body.password)
        const token = await user.generateToken()
        res.send({user , token })

    } catch (e) {
        res.status(400).send()
    }
})

router.post('/users/logout',auth,async (req,res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()
        res.send({Messege:'successfuly logged out'})
    } 
    catch (e) {
     res.status(500).send()   
    }
})

router.post('/users/logoutALL',auth,async(req,res)=>{
    try {
        req.user.tokens = []
        await req.user.save()
        res.send({messege:'Successfuly all logged out!'})
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/users/me', auth ,async (req,res)=>{
    res.send(req.user)
})

router.get('/users/:id',async (req,res)=>{
    const _id = req.params.id
    try {
        const user = await User.findById(_id)
        if (!user) {
            res.status(404).send(user)
        }
        res.send(user)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.patch('/users/me',auth,async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['age','name','email','password']
    const isValiedOperations = updates.every((update)=> allowedUpdates.includes(update))
    console.log(updates)
    if (!isValiedOperations) {
        res.status(404).send({
            error : "Update isn't available for this proberty" 
        })
    }
    try {
        const userToUpdate = req.user
        updates.forEach((update)=> userToUpdate[update] = req.body[update] )
        await userToUpdate.save()
        // const userUpdate = await User.findByIdAndUpdate(_id,req.body,{ new: true ,runValidators: true}) 
        // we can't use findByIdAndUpdate because certain mongoose quires like this one bypath more advanced features like middleware(schema.pre or post) 
        res.send(userToUpdate)

    } catch (e) {
        res.status(500).send(e)
    }
})

router.delete('/users/me',auth,async(req,res)=>{
    try {
        req.user.remove()
        sendGoodByeEmail(req.user.email,req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

const upload = multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cd){
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cd(new Error('Please Upload an image !'))
        }
        cd(undefined,true)
    }
})

router.post('/users/me/avatar',auth,upload.single('avatar'),async(req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({height:250,width:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send(req.user)
},(error, req, res, next)=>{
    res.status(400).send({ error : error.messege })
})

router.delete('/users/me/avatar',auth,async(req,res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send(req.user)
})

router.get('/users/:id/avatar',async(req,res)=>{
    try {
        const user = await User.findById(req.params.id)
    if (!user || !user.avatar) {
        throw new Error()
    }
    res.set('Content-type','image/png')
    res.send(user.avatar)

    } catch (error) {
        res.status(404).send()
    }
    
})

module.exports = router