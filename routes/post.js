const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const requireLogin = require('../middleware/requireLogin')
const Post  = mongoose.model("Post")

router.get('/allpost', requireLogin, (req, res)=>{
    Post.find()
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", "_id name")
    .then(posts=>{
        res.json({posts})
    })
    .catch(err=>{
        console.log(err)
    })
})

router.get('/getsubpost', requireLogin, (req, res)=>{
    Post.find({postedBy:{$in:req.user.following}})
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", "_id name")
    .then(posts=>{
        res.json({posts})
    })
    .catch(err=>{
        console.log(err)
    })
})

router.get('/mypost',requireLogin, (req, res)=>{
    Post.find({postedBy:req.user._id})
    .populate("postedBy", "_id name")
    .then(mypost=>{
        res.json({mypost})
    })
    .catch(err=>{
        console.log(err)
    })
})

router.post('/createpost', requireLogin, (req, res)=>{
    const {title, body, pic} = req.body
    if(!title || !body ||!pic){
        return res.status(422).json({error:"Plase add all the fields"})
    }
    req.user.password = undefined
    console.log(req.user)
    const post = new Post({
        title:title,
        body:body,
        photo:pic,
        postedBy:req.user
    })
    post.save().then(result=>{
        res.json({post:result})
    })
    .catch(err=>{
        console.log(err)
    })
})

router.put('/like', requireLogin, async (req, res)=>{
    try{
        await Post.findByIdAndUpdate(req.body.postId,{
            $push:{likes:req.user._id}
        },{
            new:true
        })
        .then((result)=>{
            res.json(result)
        })
    }catch(error){
        res.send("server error", error.message)
    }
    // .execSync((err, result)=>{
    //     if(err){
    //         return res.status(422).json({erroe:err})
    //     }
    //     else{
    //         res.json(result)
    //     }
    // })
    // try{
    //     let use = req.body.postId
    //     await Post.findByIdAndUpdate(use,{ $push:{ likes:req.user._id } }).then((result)=>{
    //         res.json(result)
    //     })
    // }catch (error){
    // res.send("Server Error", error.message)
    // }
})

router.put('/unlike', requireLogin, async (req, res)=>{
    try{
        await Post.findByIdAndUpdate(req.body.postId,{
            $pull:{likes:req.user._id}
        },{
            new:true
        })
        .then((result)=>{
            res.json(result)
        })
    }catch(error){
        res.send("server error", error.message)
    }
})

router.put('/comment', requireLogin, async (req, res)=>{
    try{
        const comment = {
            text:req.body.text,
            postedBy:req.user._id
        }
        let use = req.body.postId
        await Post.findByIdAndUpdate(use,{ $push:{ comments:comment } }, { new:true })
        .populate("comments.postedBy","_id name")
        .populate("postedBy", "_id name")
        .then((result)=>{
            res.json(result)
        })
    }catch (error){
    res.send("Server Error", error.message)
    }
})

router.delete('/deletepost/:postId', requireLogin, async (req, res)=>{

    try{
        const post = await Post.findOne({_id:req.params.postId})
        .populate("postedBy","_id")

        if (!post) {
            return res.status(422).json({ error: 'Post not found' });
          }

        if (post.postedBy._id.toString() === req.user._id.toString()) {
            // await post.remove();
            await Post.deleteOne({ _id: req.params.postId })
            .then(result=>{res.json(result)})
            // res.json({ message: 'Post deleted successfully' });
        }else{
            res.status(403).json({ error: 'Unauthorized' });
        }
        // let postString = post.postedBy._id.toString()
        // let userString = req.user._id.toString()
        // .exec((err, post)=>{
        //     if(err || !post){
        //         return res.status(422).json({error:err})
        //     }
        //     if(post.postedBy._id.toString() === req.user._id.toString()){
        //         post.remove()
        //         .then(result=>{
        //             res.json(result)
        //         }).catch(err=>{
        //             console.log(err)
        //         })
        //     }
        // })
    }catch (error){
        console.log(error)
        res.status(500).json({ error: 'Server Error' });
        }

})

router.delete('/deletecomment/:postId', requireLogin, async (req, res)=>{

    try{
        const comment = await Post.findOne({_id:req.params.postId})
        .populate("postedBy","_id")

        if (!comment) {
            return res.status(422).json({ error: 'Post not found' });
          }

        if (comment.postedBy._id.toString() === req.user._id.toString()) {
            // await post.remove();
            await Post.deleteOne({ _id: req.params.postId })
            .then(result=>{res.json(result)})
            // res.json({ message: 'Post deleted successfully' });
        }else{
            res.status(403).json({ error: 'Unauthorized' });
        }
    }catch (error){
        console.log(error)
        res.status(500).json({ error: 'Server Error' });
        }

})

module.exports = router