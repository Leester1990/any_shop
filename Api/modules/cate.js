// 分类
var express = require('express');
var router = express.Router();
let db = require("../db/db");
let mysql = require("mysql");
let sqlOp = require("../sql-op/index");

// 连接数据库
var conn = mysql.createConnection(db.mysql);
conn.connect((err) => {
    if (err) {
        console.log('数据库链接失败')
    }
    console.log('数据库链接成功...')
});

router.get("/get-cate", (req, res) => {
    let sql = "SELECT * FROM `any_cate` WHERE parent_id=0";
    conn.query(sql, function (err, result) {
        if (err) {
            console.log(res);
            return res.json({
                message: "获取分类失败",
                code: 202
            });
        }
        if (result) {
            let data = result;
            return res.json({
                message: "获取分类成功",
                code: 200,
                data: result
            });
        } else {
            return res.json({
                message: "获取分类失败",
                code: 201
            });
        }
    });
});

// 新增分类
router.post('/add-cate', (req, res) => {
    let sql = "select * from `any_cate` order by id DESC limit 1";
    conn.query(sql, function (err, result) {
        let data = result[0];
        let sortKey = "AA";
        if (data != undefined) {
            console.log(data, data.sort_key);
            sortKey = data.sort_key;
        }
        sortKey = createSortKeyCode(sortKey);

        let keyArr = [],
            valArr = [];
        for (let key in req.body) {
            keyArr.push(key);
            valArr.push(`'${req.body[key]}'`)
        }
        keyArr.push("sort_key");
        valArr.push(`'${sortKey}'`);
        let newSql = sqlOp.sql.insert("any_cate", keyArr, valArr);
        console.log(newSql);
        conn.query(newSql, function (err, result) {
            if (err) {
                return res.json({
                    message: "新增分类失败",
                    code: 202
                });
            }
            if (result) {
                let data = result;
                return res.json({
                    message: "新增分类成功",
                    code: 200,
                    data: result
                });
            } else {
                return res.json({
                    message: "新增分类失败",
                    code: 201
                });
            }
        });
    });
})


function createSortKeyCode(txt) {
    let codeArr = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    let splitTxt = txt.split("");
    let oIndex = codeArr.indexOf(splitTxt[0]);
    let tIndex = codeArr.indexOf(splitTxt[1]);
    if (splitTxt[1] === "Z") {
        oIndex = oIndex + 1;
        tIndex = -1;
    }
    return `${codeArr[oIndex]}${codeArr[tIndex + 1]}`;
}

module.exports = router;