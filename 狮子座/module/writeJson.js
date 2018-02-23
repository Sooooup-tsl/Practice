/**
 * Created by hqw41789 on 2017/6/23.
 * 把捞出来的模板信息存到json里
 */

const fs = require('fs');


let writeFile = async (data) => {
    let _data = JSON.parse(data.result);
    let _arr = [];
    for (let i = 0; i < _data.length; i++) {
        let _obj = {};
        _obj.createUserId = _data[i].createUserId;
        _obj.name = _data[i].name;
        _obj.projId = _data[i].projId;
        _obj.id = _data[i].id;
        _arr.push(_obj);
    }
    await fs.writeFileSync('./config/data.json', JSON.stringify(_arr));
}
module.exports = {
    writeFile: writeFile
};