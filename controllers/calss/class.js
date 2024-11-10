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

module.exports ={
    createClass
}
