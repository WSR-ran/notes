const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const Notedata = require('./notedata');  //数据库

app.use('/public/',express.static('./public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//获取全部
app.get('/notes', function (req, res) {
    Notedata.find((err, notes) => {
        if (err) {
            return res.status(500).send('Server error');
        }
        res.send(notes)
    })
});

//新增
app.post('/addnote', function (req, res) {
    
    new Notedata(req.body).save(function (err) {
        if (err) {
            return res.status(500).send('Server error');
        } 
        res.send({
            status: 200
        })
    })
});

//修改
app.post('/changenote', function (req, res) {
    Notedata.findOneAndUpdate({id:req.body.id}, req.body, {new:true}, function (err, note) {
        if (err) {
            return res.status(500).send('Server error');
        }
        res.send(note)
        console.log(err);
        console.log(note);
        
    })
})

//根据id删除一个
app.post('/deletenote', function (req, res) {
    Notedata.findOneAndRemove({id:req.body.id}, (err) => {
        if (err) {
            return res.status(500).send('Server error');
        }
        res.send({
            status: 200
        })
    })
})

//清空
app.post('/deleteallnotes', function (req, res) {
    Notedata.remove({id:{$in:JSON.parse(req.body.id)}}, (err) => {
        if (err) {
            return res.status(500).send('Server error');
        }
        res.send({
            status: 200
        })
    })
})

app.listen(5000, function(){
    console.log('running....');
})