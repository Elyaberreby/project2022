const express= require("express");
const { auth } = require("../middlewares/auth");
const { validateToy, ToyModel } = require("../models/toyModel");
const router = express.Router();

//General request for toys in the system - GET
router.get("/", async(req,res) => {
  try{
    let perPage = req.query.perPage || 12;
    let page = req.query.page || 1;
    let data = await ToyModel.find({})
    .limit(perPage)
    .skip((page-1)*perPage)
    res.json(data);

  }
  catch(err){
    console.log(err);
    res.status(500).json({msg_err:"There problem in server try again later"})
  }
})

//Request to search for a product by its name and info
router.get("/search", async(req,res) => {
  try{
    let searchQ = req.query.s;
    let searchReg = new RegExp(searchQ,"i")
    let data = await ToyModel.find({$or:[{name:searchReg},{info:searchReg}]})
    .limit(20)
    res.json(data);
  }
  catch(err){
    console.log(err);
    res.status(500).json({msg_err:"There problem in server try again later"})
  }
})

//Request to search for a code by its category
router.get("/cat/:catname",async(req,res)=>{
  try{
      let page = req.query.page || 1;
      let search= req.params.catname;
      let searchReg=new RegExp(search,"i");
      let data = await ToyModel.find({category:searchReg})
      .limit(10)
      .skip((page-1)*10)
      res.json(data);
  
    }
  catch(err){
      console.log(err);
      res.status(500).json({msg_err:"there is a problem in the server,try again later"})
  }
})

// post with token
router.post("/", auth, async(req,res) => {
  let validBody = validateToy(req.body);
  if(validBody.error){
    return res.status(400).json(validBody.error.details);
  }
  try{
    let toy = new ToyModel(req.body);
    toy.user_id = req.tokenData._id;
    await toy.save(toy);
    res.status(201).json(toy)

  }
  catch(err){
    console.log(err);
  }
})

//put
router.put("/:idToy", auth, async(req,res) => {
  let validBody = validateToy(req.body);
  if(validBody.error){
    return res.status(400).json(validBody.error.details);
  }
  try{
    let idToy = req.params.idToy;
    let data = await ToyModel.updateOne({_id:idToy, user_id:req.tokenData._id}, req.body);
    
    res.json(data)
  }
  catch(err){
    console.log(err);
  }
})


//delete
router.delete("/:idDel",auth,async(req,res) => {
  try{
    let idDel = req.params.idDel;
    let data = await ToyModel.deleteOne({_id:idDel, user_id:req.tokenData._id});
    res.json(data);
  }
  catch(err){
    console.log(err);
  }
})



//byPrice
router.get('/prices', async(req,res) => {
  try{
    let max = req.query.max || 9999;
    let min = req.query.min || 0;
    let data = await ToyModel.find({price:{$gt:min,$lt:max}})
    res.json(data);
  }
  catch(err){
    console.log(err);
    res.status(500).json({msg_err:"There problem in server try again later"})
  }
})


module.exports = router;