var BusCommonJs = {};
/**
 * 验证值是否是dataType类型
 * @param v 值
 * @param dtype 类型
 * @return 验证通过返回true，不通过返回不通过的字符串
 */
BusCommonJs.validateValByDataType = function(v,dtype){
    var value = v;
    var dataType = dtype.toUpperCase();
    //数据类型为number，验证合法性。
    if (dataType.indexOf("NUMBER") > -1 || dataType.indexOf("NUMERIC") > -1 || dataType.indexOf("DECIMAL") > -1) {
        if (dataType.toString().indexOf("(") != -1) {
            var _dataType = dataType.toString().split("(")[1].toString().split(")")[0];
        } else {
            var _dataType = dataType;
        }
        // 获得数据类型信息
        if (isNaN(value) || value.toString().indexOf("+")>-1) {
            return "数据类型不匹配！"
        } else if (_dataType.toString().indexOf(",") != -1) {// 1-数据类型有小数验证
            value = value.replace("-","");
            if (value.indexOf(".") != -1) {// 1.1-默认值有小数
                var _inputValue = value.toString().split(".");
                if (_inputValue[0].toString().length > parseInt(_dataType.split(",")[0]) || _inputValue[1].toString().length > parseInt(_dataType.split(",")[1])) {
                    return "数据精度错误!";
                }
            } else if (!value.indexOf(".") != -1) {// 1.2-默认值没有小数
                if (value.toString().length > parseInt(_dataType.split(",")[0])) {
                    return "数据精度错误!";
                }
            }
        } else if (!_dataType.toString().indexOf(".") != -1) {// 2-数据类型没有小数验证
            value = value.replace("-","");
            if (_dataType == "NUMBER" || _dataType=="NUMERIC" || _dataType=="DECIMAL") {// 数据默认长度22不匹配
                if (value.toString().length > 22) {
                    return "数据默认长度大于22!";
                }
            }
            if (value.toString().indexOf(".") != -1) {// 2.1-默认值有小数
                return "数据精度错误!";
            } else if (!value.toString().indexOf(".") != -1) {// 2.2-默认值没有小数
                if (value.toString().length > parseInt(_dataType)) {
                    return "数据精度错误!";
                }
            }
        }
    } else if (dataType.indexOf("CHAR") > -1) {
        var _dataType = dataType.toString().split("(")[1].toString().split(")")[0];
        if (value.toString().length > parseInt(_dataType)) {
            return "数据长度错误!"
        }
    } else if (dataType.indexOf("INT") > -1 || dataType=="LONG" || dataType=="DOUBLE"){
        if (isNaN(value) || value.toString().indexOf("+")>-1) {
            return "数据类型不匹配!"
        }else if((dataType.indexOf("INT")>-1 || dataType=="LONG") && value.toString().indexOf(".")>-1){
            return "数据类型不匹配!";
        }
    }
    return true;
};

/**
 * 验证某值是否与正则表达式
 * @param value
 * @param regStr
 */
BusCommonJs.validateValByDataTypeReg = function(value,regStr){
    var reg = new RegExp("^(" + regStr + ")$", "i");
    var res = reg.exec(value);
    if (!res) {
        return "不支持此数据类型或者未填长度大小!";
    }
    reg = /(\w+)(\((\d+)((,)(\-?\d+))?\))*/;
    var match = reg.exec(value);
    switch (match[1].toLowerCase()) {
        case "varchar":
        case "varchar2":
        case "nvarchar":
        case "nvarchar2":
        {
            if (match[3] > 4000 || match[3] < 1) {
                return "限制长度为1至4000";
            }
            break;
        }
        case "raw":
        case "character":
        case "char":
        {
            if (match[3] > 2000 || match[3] < 1) {
                return "CHAR限制长度为1至2000";
            }
            break;
        }
        case "numeric":
        case "decimal":
        case "number":
        {
            if (match[3] && (match[3] > 38 || match[3] < 1)) {
                return "精度取值范围为1至38";
            }
            if (match[6] && (match[6] > 127 || match[6] < -84)) {
                return "刻度取值范围为-84至127";
            }
            break;
        }
        default:
            break;
    }
    return true;
};

/**
 * 根据字段类型组装一个验证类型的正则表达式串
 * @param arr
 */
BusCommonJs.buildRegStrByDataTypeArr = function(arr){
    var str = "()";
    for (var i = 0; i < arr.length; i++) {
        var tp = ((typeof arr[i] == "object") ? (arr[i].text || arr[i].label || arr[i].name) : (arr[i]+"")).toUpperCase();
        if(tp.indexOf("(")==-1){
            str += "|"+tp;
        }else{
            var hasjd = tp.indexOf(",")!=-1;
            tp = tp.substring(0,tp.indexOf("("));
            if(hasjd){
                str += "|"+tp+"\\(\\d+,\\-?\\d+\\)";
            }else{
                str += "|"+tp+"\\(\\d+\\)";
            }
        }
    }
    return str;
};
/**
 * 将一个字段类型转换成oralce字段类型
 * @param dataType
 */
BusCommonJs.getOraDataType = function(dataType){
    var v = dataType;
    if(v.indexOf("TIME")!=-1 || v.indexOf("DATE")!=-1){
        v = "DATE";
    }else if(v.indexOf("INT")!=-1 || v.indexOf("NUMERIC")!=-1 || v.indexOf("DECIMAL")!=-1){
        if(v.indexOf("INT")!=-1)
            v = "NUMBER(18)";
        v = v.replace("NUMERIC","NUMBER").replace("DECIMAL","NUMBER");
    }else if(v.indexOf("VARCHAR")!=-1 && v.indexOf("VARCHAR2")==-1){
        v = v.replace("VARCHAR","VARCHAR2");
    }else if(v.indexOf("CHARACTER")!=-1){
        v = v.replace("CHARACTER","CHAR");
    }else if(v=="DOUBLE"){
        v = "NUMBER(8)";
    }
    return v;
};
/**
 * 将一个字段类型转换成Db2字段类型
 * @param dataType
 */
BusCommonJs.getDb2DataType = function(dataType){
    var v = dataType;
    if(v=="LONG"){
        v = "VARCHAR(4000)";
    }else if(v.indexOf("VARCHAR2")!=-1){
        v = v.replace("NVARCHAR2","VARCHAR");
        v = v.replace("VARCHAR2","VARCHAR");
    }else if(v=="CHAR"){
        v = "CHARACTER";
    }else if(v=="DATETIME"){
        v = "TIMESTAMP";
    }
    v = v.replace("NUMBER","DECIMAL");
    v = v.replace("NUMERIC","DECIMAL");
    return v;
};