const Class = require('../../models/class/classModal')

const createClass = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const newclass = new Class({name});
    await newclass.save();

    return res.status(201).json(newclass);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllCalsses = async(req, res)=>{
  try {
    const classes = await Class.find();
    if(!classes){
      return res.status(404).json({message:"No Class Found"})
    }
    return res.status(200).json({
      classes: classes
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

const getClassById = async(class_id)=>{
  try {
    const classobj = await Class.findById(class_id).select("name");
    if (!classobj) {
      return null;
    }
    return classobj;
  } catch (error) {
    console.log(error);
    return null;
  }
}

module.exports ={
    createClass,
    getAllCalsses,
    getClassById
}
