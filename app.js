const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));

// mongoose.connect("mongodb://localhost:27017/todoDB", { useNewUrlParser: true, useUnifiedTopology: true  });
mongoose.connect("mongodb+srv://rohith_546:183561234@cluster0.qdrkw.mongodb.net/todoDB", { useNewUrlParser: true, useUnifiedTopology: true  });

const itemSchema = {
  name: String
};  

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to Todo List!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
const item3 = new Item({
  name: "<-- Hit this to delete ana item."
});

const d_items = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({}, function(err, founditems){
    if(founditems.length === 0){
      Item.insertMany(d_items, function(err){
        if(err)
        {
          console.log(err);
        }
        else{
          console.log("Added default items");
        }
      });
    }
    res.render("list", {
      listTitle: "Today",
      newlistitems: founditems
    });
  });
});

app.get("/:my_list", function(req, res){
  const myy_listname = req.params.my_list.toLowerCase();
  const my_listname = myy_listname.charAt(0).toUpperCase() + myy_listname.slice(1);

List.findOne({name: my_listname}, function(err,result){
  if(!err){
    if(!result){
      const list = new List({
        name: my_listname,
        items: d_items
      });
      list.save();
      res.redirect("/"+my_listname);   
    }
    else{
      res.render("list", {
        listTitle: result.name,
        newlistitems: result.items
    });
    }
  }
});
});



app.post("/", function (req, res) {
  const itemname = req.body.newitem;
  const listname = req.body.list;
  const n_item = new Item({
    name: itemname
  });
  if(listname === "Today"){
    n_item.save();
    res.redirect("/");
  } else{
    List.findOne({name: listname}, function(err, result){
      result.items.push(n_item);
      result.save();
      res.redirect("/"+listname);
    });
  }
});


app.post("/delete", function(req, res){
  const d_item = (req.body.checkbox).trim();
  const list_name = (req.body.listname).trim();
  if(list_name==="Today"){
    Item.findByIdAndRemove(d_item, function(err){
      if(!err)
      {
        console.log("deleted");
      }
      else{
        console.log(err);   
      }
  });
  res.redirect("/");
  } else{
    List.findOneAndUpdate(
      {name:list_name},
      {$pull: {items: {_id:d_item}}}, function(err, result){
        if(!err)
        {
          res.redirect("/"+list_name);
        }
        else{
        console.log(err);   
      }
      });
  }
});

app.listen(process.env.PORT || 3000 , function () {
  console.log("port 3000 activated...");
});
