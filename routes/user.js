const express = require("express")
const router = express.Router()
const mongoose = require('mongoose')
const requireLogin = require('../middleware/requireLogin')
const Post = mongoose.model("Post")
const User = mongoose.model("User")

router.get('/user/:id', requireLogin, async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.params.id }).select('-password');
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const posts = await Post.find({ postedBy: req.params.id })
        .populate('postedBy', '_id name');
  
      res.json({ user, posts });
    } catch (err) {
      res.status(422).json({ error: err.message });
    }
  });

router.put('/follow', requireLogin, async (req, res) => {
  try {
    // Update the user being followed
    const updatedFollowedUser = await User.findByIdAndUpdate(
      req.body.followId,
      { $push: { followers: req.user._id } },
      { new: true }
    );

    // Update the follower
    const updatedFollower = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { following: req.body.followId } },
      { new: true }
    ).select("-password");

    res.json(updatedFollower);
  } catch (err) {
    return res.status(422).json({ error: err.message });
  }
});

// router.put('/follow', requireLogin, (req, res)=>{
//   User.findByIdAndUpdate(req.body.followId,{
//     $push:{followers : req.user._id}
//   },{new:true},(err, result)=>{
//     if(err){
//       return res.status(422).json({error:err})
//     }
//     User.findByIdAndUpdate(req.user._id,{
//       $push:{following:req.body.followId}
//     },{new:true}).then(result=>{
//       res.json(result)
//     }).catch(err=>{
//       return res.status(422).json({error:err})
//     })
// })
// })

router.put('/unfollow', requireLogin, async (req, res) => {
  try {
    // Update the user being unfollowed
    const updatedUnfollowedUser = await User.findByIdAndUpdate(
      req.body.unfollowId,
      { $pull: { followers: req.user._id } },
      { new: true }
    );

    // Update the follower
    const updatedFollower = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { following: req.body.unfollowId } },
      { new: true }
    ).select("-password");

    res.json(updatedFollower);
  } catch (err) {
    return res.status(422).json({ error: err.message });
  }
});

// router.put('/updatepic', requireLogin, (req, res)=>{
//   User.findByIdAndUpdate(req.user._id, {$set:{pic:req.body.pic}},{new:true},
//     (err,result)=>{
//       if(err){
//         return res.status(422).json({error:"pic canot post"})
//       }
//       res.json(result)
//   })
// })

router.put('/updatepic', requireLogin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { $set: { pic: req.body.pic } }, { new: true });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error(err); // Log the error for debugging purposes
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router