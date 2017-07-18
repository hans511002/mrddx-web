/***********************************************************************************************************************
 * Copyrights @ 2012，Tianyuan DIC Information Co., Ltd. All rights reserved.
 *
 * Filename： termControl.js Description：条件控件封装
 *
 * Dependent：
 *
 * Author: hans
 **********************************************************************************************************************/

var meta = meta || new Object();
meta.term = new Object();
meta.maxInt = Math.pow(2, 31);
if (!meta.uid)
    meta.uid = function() {
        if (dhx)
            return dhx.uid();
        return Math.random() * meta.maxInt + 1;
    };
/**
 * 静态工具函数，条件包生成器，条件包一般通过此生成，加入了资源回收
 *
 * @class {TermReqFactory}
 */
var TermReqFactory = { reqs : {},

    /**
     * 创建一个请求包
     *
     * @memberOf {TermReqFactory}
     * @param id
     *            传入ID，如果已存在则直接返回
     */
    createTermReq : function(id) {
        if (id == null || id == undefined) {
            alert("请传入正确请求包ID");
            return null;
        }
        if (this.reqs[id])
            return this.reqs[id];
        this.reqs[id] = new meta.term(id);
        this.reqs[id].DHTML_TYPE = "termReqs";
        return this.reqs[id];
    },

    /**
     * 根据ID获取请求包
     *
     * @memberOf {TermReqFactory}
     * @param id
     */
    getTermReq : function(id) {
        if (id == null || id == undefined) {
            alert("请传入正确请求包ID");
            return null;
        }
        if (this.reqs[id])
            return this.reqs[id];
        else
            alert("getTermReq \n未找到对应的请求包对象，请检查ID或是否已创建过!");
        return null;
    }
};
Destroy.addDestroyVar(TermReqFactory);

/**
 * 条件对象包(一组条件对象)
 *
 * @class {meta.term}
 */
meta.term = function(id) {
    this.id = id;
    this.terms = {};
};
/**
 * 条件控件对象
 *
 * @param {Object}
    *            parentDiv 父对象，可以是容器或者input框
 * @param {Object}
    *            termName 条件名称，也是参数的KEY
 * @memberOf {TypeName}
 */
meta.term.metaDataSourceId = 0;// 元数据源ID

/**
 * 一个条件对象构造方法
 *
 * @class {meta.term.termControl}
 * @param parentDiv
 *            父容器
 * @param termName
 *            条件名（不区分大小写）
 * @param valueChangeCall
 *            值改变的回调事件
 */
meta.term.termControl = function(parentDiv, termName, valueChangeCall) {
    this.termId = "";// 条件ID
    this.termName = "";// 条件值名称,值宏变量名称
    this.textName = "";// 文本宏变量名称
    this.termType = 0; // 0:文本框 1:下拉框 2:下拉树 3:日期控件 时间选择器 ,4 表格搜索（下拉框扩展，用于数据过多的情况）
    this.parentTerm = ""; // 父级条件ID，下拉框级联，联动依赖
    this.valueType = 1; // 条件值数值类型 0:数字 1字符串 2:日期对象
    this.termWidth = 140;// 条件框长度
    this.termHeight = 22;// 条件框高度
    this.dataSrcType = 0;// 数据来源类型 1:SQL查询语句 0:固定值列表 2 后台程序接口

    /**
     * this.dataRule 注释：SQL 或者 值列表 或者 后台接口实现类全名
     * sql可带宏变量，一是条件和字段宏变量宏变量{termName}或{textVal}的形式，二是函数宏变量{fun:函数名}，函数必须返回复合sql语法的值
     *
     * termType=0时：此字段无效； termType=1时：sql规则：select value,text,... from tb 至少两个字段位置顺序固定，where条件可带宏变量 值规则：二维数组(与sql列数要求一样)
     * termType=2时：sql规则：select val,txt,parV,... from tb 至少三个字段位置固定,配合下拉树setTreeChildFiledFlag方法第四个字段可以是是否有子标识位 select
     * a.val,a.txt,a.parV, (case when exists (select 1 from tb x where x.parV=a.val) then 1 else 0 end) hasChild,...
     * from tb a 异步sql规则：select val,txt,parV,... from tab;select val,txt,parV,... from tab where parV={val} 两个sql;分割
     * 值规则：二维数组（与sql列数要求一样），无异步概念
     * termType=3时：sql规则：select value from tb 只认第一个字段 值有3种格式：20110101有效值 -20110201无效值
     * 20100202-20110202有效区间，20100202-0右开区间，0-20100202左开区间 值规则：一维数组（与sql列数要求一样）
     */
    this.dataRule = "";
    this.classRuleParams = null;// 后台接口获取数据时，接口参数

    this.dataSrcId = meta.term.metaDataSourceId;// 数据来源数据库 数据源ID
    this.appendData = null;// 附加选项值 在下拉框和下拉树时有效

    this.defaultValue = [];// 页面初始化时的条件默认值，不设置时：下拉框默认为第一个选项，时间框默认为当前时间
    // //////////////////////////////////////以下为维度获取数据,SQL则服务器端生成///////////////////////////////////////////////////////////
    this.initType = 0;// 1 维度表设置 2码表设置

    this.codeType = "";// 码表编码键
    this.dimTableId = 0;
    this.dimTypeId = 0;
    this.dimValueType = 0;// 维度数据类型 0:维度编码，1:维度ID
    this.dimDataLevels = [];// 维度表ID，层级列表，必须从小到大的数字
    this.dimInitValues = []; // 初始值列表
    this.excludeValues = [];// 需要排除的值

    this.mulSelect = false;// 是否支持多选 下拉框和树情况下 使用复选框支持
    this.dynload = false;//

    termName = termName.toUpperCase();
    this.bindObjs = [];
    this.bindObjs[0] = parentDiv;
    if (typeof parentDiv == "string")
        this.bindObjs[0] = $(parentDiv);
    if (this.bindObjs[0] && !this.bindObjs[0].id)
        this.bindObjs[0].id = meta.uid();
    this.parentIds = [];
    this.parentIds[0] = this.bindObjs[0].id;
    this._bindObjs = {};
    this._bindObjs[this.bindObjs[0].id] = 0;
    this.termName = termName; // 条件名
    this.termId = termName;

    this.valueChangeCall = {};
    if (this.bindObjs[0] && this.bindObjs[0].id)
        this.valueChangeCall[this.bindObjs[0].id] = valueChangeCall; // 值改变回调

    this.bindDataCall = function() {
    }; // 绑定数据后回调
    this.bindDataBeforeCall = function(row, type, termCtl, obj) {
        return row;
    };// 绑定前回调，3个参数分别是：一项记录值数组，类型combo/tree，条件对象
    this.serverAppendDataCall = null;// 处理服务端追加数据回调
    this.classRuleParams = null;// 类规则时，参数
    this.constantSql = null;// 常量SQL对象参数
    this.dimAuthFlag = false;// 是否启用维度权限过滤（默认否）
    this.authDimTableId = 0;// sql规则时需要维度权限过滤时传入此参数
    this.authCodeIndex = 0;// 权限编码所在列，为-1时取最后一列

    this.myTabDiv = null;//数据表格DIV
    this.dataTableKwd = "";//表格搜索关键字
    this.myDataTable = null;//termType=4时，表格搜索
    this.tableLoaded = 0;//第一次加载，加载完则变为1
};

/**
 * 私有内置方法 获取一个条件的配置，此配置一般会被传回服务器
 *
 * @memberOf {meta.term.termControl}
 */
meta.term.termControl.prototype.getConfig = function() {
    var cfm = {};
    cfm.termId = this.termId;
    cfm.termName = this.termName;
    cfm.textName = this.textName;
    cfm.termType = this.termType;
    cfm.parentTerm = this.parentTerm;

    cfm.valueType = this.valueType;
    cfm.termWidth = this.termWidth;
    cfm.dataSrcType = this.dataSrcType;
    cfm.dataRule = (this.dataSrcType != 0) ? this.dataRule : "";
    cfm.dataSrcId = ((this.initType == 1) ? meta.term.metaDataSourceId : this.dataSrcId);
    if(this.mulSelect){
        cfm.defaultValue=[];
        for(var i=0;i<this.defaultValue.length;i++){
            var id= (typeof this.defaultValue[i]=="object" &&this.defaultValue[i].sort)?this.defaultValue[i][0]:this.defaultValue[i];
            cfm.defaultValue[i]=id;
        }
        cfm.defaultValue = cfm.defaultValue.join(",");
    }else{
        cfm.defaultValue = this.defaultValue.join(",");
    }
    cfm.defValPathInited = this.defValPathInited;
    cfm.classRuleParams = this.classRuleParams;

    cfm.codeType = this.codeType;
    cfm.codeInited = this.codeInited;
    cfm.initType = this.initType;
    cfm.dimTableId = this.dimTableId;
    cfm.dimTypeId = this.dimTypeId;
    cfm.dimValueType = this.dimValueType;
    cfm.dimDataLevels = this.dimDataLevels.join(",");
    cfm.excludeValues = this.excludeValues.join(",");
    cfm.dimInitValues = this.dimInitValues.join(",");
    cfm.mulSelect = this.mulSelect;
    cfm.dynload = this.dynload;
    cfm.treeChildFlag = this.treeChildFlag;
    cfm.constantSql = this.constantSql;
    cfm.dimAuthFlag = this.dimAuthFlag;
    cfm.authDimTableId = this.authDimTableId;
    cfm.authCodeIndex = this.authCodeIndex;
    cfm.dataTableKwd = this.dataTableKwd;
    cfm.tableLoaded = this.tableLoaded;
    if(this.appCond){
        cfm[this.appCond.key] = document.getElementById("tm_"+this.appCond.key+"_"+this.bindObjs[0].id).value;
    }
    return cfm;
};

/**
 * 设置单条记录绑定之前回调，可对单条数据进行处理加工，默认是原样返回
 *
 * @memberOf {meta.term.termControl}
 */
meta.term.termControl.prototype.setBindBeforeCall = function(fun) {
    this.bindDataBeforeCall = fun;
};
/**
 * 设置绑后回调 所有数据绑定完成后的回调，默认是什么都不做
 *
 * @memberOf {meta.term.termControl}
 */
meta.term.termControl.prototype.setBindDataCall = function(fun) {
    this.bindDataCall = fun;
};
/**
 * 处理服务端附加数据回调接口 此回调方法有两个参数，1是追加数据 2是条件对象
 *
 * @memberOf {meta.term.termControl}
 */
meta.term.termControl.prototype.setServerAppendDataCall = function(fun) {
    this.serverAppendDataCall = fun;
};
/**
 * 设置从后台接口类中获取数据
 *
 * @memberOf {meta.term.termControl}
 * @param className
 *            类全名,此类必须是条件请求提供的固定接口或抽象类的实现
 * @param termType
 *            控件类型1下拉框 2下拉树,4（下拉框扩展，搜索表格）
 * @param defaultValue
 *            默认值
 * @param classParams
 *            参数，可以是固定值对象，也可以是函数
 */
meta.term.termControl.prototype.setClassRule = function(className, termType, defaultValue, classParams, dataSrcId,colNameMap) {
    this.dataRule = className;
    this.dataSrcType = 2;
    this.termType = termType == 1 ? 1 : (termType==2?2:4);
    this.dataSrcId = dataSrcId || meta.term.metaDataSourceId;
    if (defaultValue != null && defaultValue != undefined) {
        if (typeof defaultValue == "string" || typeof defaultValue == "number") {
            if (typeof defaultValue == "number")
                this.defaultValue[0] = defaultValue + "";
            else
                this.defaultValue = defaultValue.split(",");
        } else if (typeof defaultValue == "object" && defaultValue.sort)
            this.defaultValue = defaultValue;
        else
            alert("请设置正确的默认值");
    }
    this.classRuleParams = classParams;
    this.colNameMap = colNameMap || {};
};
/**
 * 设置SQL常量
 *
 * @param className
 *            类名称
 * @param filedName
 *            字段名称
 * @param dataSrcId
 *            Sql执行数据源
 * @param defaultValue
 *            默认值
 */
meta.term.termControl.prototype.setClassConstantSql = function(className, filedName, dataSrcId, defaultValue) {
    this.termType = 1;
    this.dataRule = "com.ery.meta.common.term.TermDataConstantSqlServiceImpl";
    this.dataSrcType = 2;
    this.dataSrcId = dataSrcId || meta.term.metaDataSourceId;
    if (defaultValue != null && defaultValue != undefined) {
        if (typeof defaultValue == "string" || typeof defaultValue == "number") {
            if (typeof defaultValue == "number")
                this.defaultValue[0] = defaultValue + "";
            else
                this.defaultValue = defaultValue.split(",");
        } else if (typeof defaultValue == "object" && defaultValue.sort)
            this.defaultValue = defaultValue;
        else
            alert("请设置正确的默认值");
    }
    this.constantSql = [ className, filedName ];
};
/**
 * 设置从码表获取数据填充下拉框
 *
 * @memberOf {meta.term.termControl}
 * @param codeType
 * @param defaultValue
 * @param excludeValues
 */
meta.term.termControl.prototype.setCodeRule = function(codeType, defaultValue, excludeValues) {
    this.dataRule = "";
    this.dataSrcType = 0; // 先设置成固定值模式，尝试从客户端缓存中获取码表值，如果没找到，那么则重新请求后台获取
    this.dataSrcId = meta.term.metaDataSourceId;
    this.initType = 2;
    this.termType = 1;// 下拉框
    this.codeType = codeType;
    if (defaultValue != null && defaultValue != undefined) {
        if (typeof defaultValue == "string" || typeof defaultValue == "number") {
            if (typeof defaultValue == "number")
                this.defaultValue[0] = defaultValue + "";
            else
                this.defaultValue = defaultValue.split(",");
        } else if (typeof defaultValue == "object" && defaultValue.sort)
            this.defaultValue = defaultValue;
        else
            alert("请设置正确的默认值");
    }
    if (excludeValues)// 需要排除的值
    {
        if (typeof excludeValues == "string" || typeof excludeValues == "number")
            if (typeof excludeValues == "number")
                this.excludeValues[0] = excludeValues + "";
            else
                this.excludeValues = excludeValues.split(",");
        else if (typeof excludeValues == "object" && excludeValues.sort)
            this.excludeValues = excludeValues;
        else
            alert("请设置正确的码表条件排除数据列表");
    }
};
/**
 * 设置从维度获取数据填充下拉框或者下拉树，自动识别使用下拉框还是下拉树 同步还是异步加载
 *
 * @memberOf {meta.term.termControl}
 * @param {Object}
    *            dimTableId 维度表ID
 * @param {Object}
    *            dimTypeId 维度类型ID
 * @param defaultValue
 *            默认值
 * @param {Object}
    *            dimDataLevels 需要的维度数据层级
 * @param {Object}
    *            dimValueType 维度数据类型 0:维度编码，1:维度ID
 * @param {Object}
    *            dimInitValues 初始值
 * @param {Object}
    *            excludeValues 需要排除的维度编码
 */
meta.term.termControl.prototype.setDimRule = function(dimTableId, dimTypeId, defaultValue, dimDataLevels, dimValueType,
                                                      dimInitValues, excludeValues) {
    this.dataRule = "";// 只要调用此方法，数据sql,就清空，在第一次进入后台初始时，由服务端拼好sql回填给他
    this.dataSrcType = 1;
    this.dataSrcId = meta.term.metaDataSourceId;
    this.initType = 1;
    this.dimAuthFlag = true;
    this.authDimTableId = dimTableId;
    if (!dimTableId) {
        alert("请设置正确的维度表ID");
        return;
    }
    if (!dimTypeId) {
        alert("请设置正确的维度归并类型ID");
        return;
    }
    this.dimTableId = dimTableId;
    this.dimTypeId = dimTypeId;
    if (defaultValue != null && defaultValue != undefined) {
        if (typeof defaultValue == "string" || typeof defaultValue == "number") {
            if (typeof defaultValue == "number")
                this.defaultValue[0] = defaultValue + "";
            else
                this.defaultValue = defaultValue.split(",");
        } else if (typeof defaultValue == "object" && defaultValue.sort)
            this.defaultValue = defaultValue;
        else
            alert("请设置正确的默认值");
    }
    if (dimDataLevels)// 维度表ID，层级列表
    {
        if (typeof dimDataLevels == "string" || typeof dimDataLevels == "number") {
            if (typeof dimDataLevels == "number")
                this.dimDataLevels[0] = dimDataLevels + "";
            else
                this.dimDataLevels = dimDataLevels.split(",");
        } else if (typeof dimDataLevels == "object" && dimDataLevels.sort)
            this.dimDataLevels = dimDataLevels;
        else
            alert("请设置正确的维度条件数据层级列表");

        for ( var i = 0; i < dimDataLevels.length; i++) {
            if (parseInt(dimDataLevels[i]))
                dimDataLevels[i] = parseInt(dimDataLevels[i]) + "";
            else {
                dimDataLevels = [];
                alert("请设置正确的层级，必须是数字");
            }
        }
        this.dimDataLevels.sort(function(a, b) {
            return a - b;
        });
    }
    if (excludeValues)// 需要排除的值
    {
        if (typeof excludeValues == "string" || typeof excludeValues == "number")
            if (typeof excludeValues == "number")
                this.excludeValues[0] = excludeValues + "";
            else
                this.excludeValues = excludeValues.split(",");
        else if (typeof excludeValues == "object" && excludeValues.sort)
            this.excludeValues = excludeValues;
        else
            alert("请设置正确的维度条件排除数据列表");
    }
    if (dimInitValues)// 初始值
    {
        if (typeof dimInitValues == "string" || typeof dimInitValues == "number")
            if (typeof dimInitValues == "number")
                this.dimInitValues[0] = dimInitValues + "";
            else
                this.dimInitValues = dimInitValues.split(",");
        else if (typeof dimInitValues == "object" && dimInitValues.sort)
            this.dimInitValues = dimInitValues;
        else
            alert("请设置正确的维度初始值数据列表");
    }

    if (dimValueType == 1) {
        this.dimValueType = 1;// 维度数据类型 0:维度编码，1:维度ID
        this.authCodeIndex = -1;// 为-1时取最后列
    } else {
        this.dimValueType = 0;// 维度数据类型 0:维度编码，1:维度ID
        this.authCodeIndex = 0;
    }

    if (this.dimDataLevels.length > 1 || this.dimDataLevels.length == 0 || parseInt(this.dimDataLevels[0]) > 1)// 多层数据
    // 必定为树
    // 只有一层，且大于1
    {
        this.termType = 2;
        if (dimTableId == 2 && this.dimDataLevels.length == 1 && parseInt(this.dimDataLevels[0]) <= 2)
            this.termType = 1;
    } else {
        this.termType = 1;
    }
    if (dimTableId == 1 && this.dimDataLevels[0] && parseInt(this.dimDataLevels[0]) == 3) // 时间维度且为日
        this.termType = 3;
};
/**
 * 设置下拉框数据规则
 *
 * @memberOf {meta.term.termControl}
 * @param {Object}
    *            dataSrcType 数据来源类型 1:SQL查询语句 0:固定值列表
 * @param {Object}
    *            dataRule SQL或者值列表 select value,text from tb 或者 数组 字段顺序：value,text 可在后续列附加数据 ，可在后续列附加数据，如果是数组，表示SQL为后台常量
 *            例:["com.ery.meta.module.tbl.TblConstant","DATA_SOURCE_SQL"] ,表示SQL来自于类 com.ery.meta.module.tbl.TblConstant 的
 *            DATA_SOURCE_SQL静态字段
 * @param {Object}
    *            defaultValue
 * @param {Object}
    *            dataSrcId
 * @memberOf {TypeName}
 */
meta.term.termControl.prototype.setListRule = function(dataSrcType, dataRule, defaultValue, dataSrcId) {
    this.termType = 1;
    if (dataSrcType)
        this.dataSrcType = dataSrcType;// 数据来源类型 1:SQL查询语句 0:固定值列表
    if (dataRule)
        this.dataRule = dataRule;// SQL或者值列表
    if (dataSrcId)
        this.dataSrcId = dataSrcId;// 数据来源数据库 数据源ID
    if (defaultValue != null && defaultValue != undefined) {
        if (typeof defaultValue == "string" || typeof defaultValue == "number") {
            if (typeof defaultValue == "number")
                this.defaultValue[0] = defaultValue + "";
            else
                this.defaultValue = defaultValue.split(",");
        } else if (typeof defaultValue == "object" && defaultValue.sort)
            this.defaultValue = defaultValue;
        else
            alert("请设置正确的默认值");
    }
};
/**
 * 设置日期条件
 *
 * @memberOf {meta.term.termControl}
 * @param dataSrcType
 *            数据来源类型 0固定值，1SQL
 * @param dataRule
 * @param defaultValue
 * @param dataSrcId
 */
meta.term.termControl.prototype.setDateRule = function(dataSrcType, dataRule, defaultValue, dataSrcId) {
    this.termType = 3;
    if (dataSrcType)
        this.dataSrcType = dataSrcType;// 数据来源类型 1:SQL查询语句 0:固定值列表
    if (dataRule)
        this.dataRule = dataRule;
    if (dataSrcId)
        this.dataSrcId = dataSrcId;// 数据来源数据库 数据源ID
    if (defaultValue != null && defaultValue != undefined) {
        if (typeof defaultValue == "string" || typeof defaultValue == "number") {
            if (typeof defaultValue == "number")
                this.defaultValue[0] = defaultValue + "";
            else
                this.defaultValue = defaultValue.split(",");
        } else if (typeof defaultValue == "object" && defaultValue.sort)
            this.defaultValue = defaultValue;
        else
            alert("请设置正确的默认值");
    }
};
/**
 * 设置下拉树数据规则
 *
 * @memberOf {meta.term.termControl}
 * @param dataSrcType
 *            数据来源类型 0固定值，1为SQL
 * @param dataRule
 *            sql规则：select val,txt,parV,... from tb 至少三个字段位置固定,配合下拉树setTreeChildFiledFlag方法第四个字段可以是是否有子标识位 select
 *            a.val,a.txt,a.parV, (case when exists (select 1 from tb x where x.parV=a.val) then 1 else 0 end)
 *            hasChild,... from tb a 异步sql规则：select val,txt,parV,... from tab;select val,txt,parV,... from tab where
 *            parV={val} 两个sql;分割 值规则：二维数组（与sql列数要求一样），无异步概念
 * @param dataSrcId
 *            数据源ID
 * @param defaultValue
 *            默认值
 */
meta.term.termControl.prototype.setTreeRule = function(dataSrcType, dataRule, defaultValue, dataSrcId) {
    if (!dataRule) {
        alert("请设置正确的下拉树数据规则");
        return;
    }
    this.termType = 2;
    // 数据来源类型 1:SQL查询语句 0:固定值列表
    if (dataSrcType) {
        this.dataSrcType = dataSrcType;
        if (typeof dataRule == "object" && dataRule.sort) {
            if (data.length > 1)
                this.dynload = true;
            this.dataRule = dataRule.join(";");
        } else if (typeof dataRule == "string") {
            if (dataRule.split(";").length > 1)
                this.dynload = true;
            this.dataRule = dataRule;
        } else {
            alert("请设置正确的下拉树数据规则");
            return;
        }
    } else {
        if (typeof dataRule == "object" && dataRule.sort && dataRule[0] && dataRule[0].sort) {
            this.dataRule = dataRule;
        } else {
            alert("请设置正确的下拉树数据(必须是二维数组)");
            return;
        }
    }
    if (dataSrcId)
        this.dataSrcId = dataSrcId;// 数据来源数据库 数据源ID
    if (defaultValue != null && defaultValue != undefined) {
        if (typeof defaultValue == "string" || typeof defaultValue == "number") {
            if (typeof defaultValue == "number")
                this.defaultValue[0] = defaultValue + "";
            else
                this.defaultValue = defaultValue.split(",");
        } else if (typeof defaultValue == "object" && defaultValue.sort)
            this.defaultValue = defaultValue;
        else
            alert("请设置正确的默认值");
    }
};

/**
 * 设置 是否启用维度编码权限过滤
 *
 * @param mode
 * @param dimTableId
 *            一般SQL规则时需要用到权限过滤，则传入此参数
 * @param authCodeIndex
 *            权限编码所在列索引
 */
meta.term.termControl.prototype.setDimAuthFlag = function(mode, dimTableId, authCodeIndex) {
    this.dimAuthFlag = !!mode;
    if (dimTableId)
        this.authDimTableId = dimTableId;
    if (authCodeIndex != null && authCodeIndex != undefined)
        this.authCodeIndex = authCodeIndex;
};

/**
 * 设置checkbox传递模式分四种：
 *
 * @memberOf {meta.term.termControl} 1，向下传递（子永远跟着父变） 2，向上传递（勾选子时，依赖的父也勾选，取消子勾选父不变） 3，双向传递（子永远跟着父变；勾选子时，依赖的父也勾选，取消子勾选父不变）
 *           4，父永远控制子的选中，但是子未勾全时，父为半勾选状态
 * @param {Object}
    *            flag
 * @memberOf {TypeName}
 */
meta.term.termControl.prototype.setTreeCheckboxFlag = function(flag) {
    if (!this.mulSelect)
        return;
    if (!this.selTree)
        return;
    this.selTree.setCheckboxFlag(flag);
};
/**
 * 设置异步加载树数据时的是否存在子节点标识位 true: id,text,pid,flag false: id,text,pid
 *
 * @param {Object}
    *            flag
 * @memberOf {meta.term.termControl}
 * @memberOf {TypeName}
 */
meta.term.termControl.prototype.setTreeChildFiledFlag = function(flag) {
    this.treeChildFlag = !!flag;
    if (!this.selTree)
        return;
    this.selTree.enableChildField(this.treeChildFlag);
};

/**
 * 设置追加数据，比如往下拉框加入一个 全部，请选择选项
 *
 * @param data
 *            数据格式与对应控件要求的格式一样
 * @memberOf {meta.term.termControl}
 */
meta.term.termControl.prototype.setAppendData = function(data) {
    if (data)
        this.appendData = data;
};
/**
 * 设置父条件，级联刷新实现
 *
 * @memberOf {meta.term.termControl}
 * @param parentTermName
 *            父条件或父条件名
 */
meta.term.termControl.prototype.setParentTerm = function(parentTermId) {
    var ptermName = "";
    if (typeof (parentTermId) == "string")
        ptermName = parentTermId.toUpperCase();
    else if (typeof (parentTermId) == "object")
        ptermName = parentTermId.termId;
    if (this.metaTerm.terms[ptermName])
        this.parentTerm = ptermName;
    else
        return false;
    return true;
};
/**
 * 设置单个条件的值改变回调
 *
 * @memberOf {meta.term.termControl}
 * @param valueChangeCall
 */
meta.term.termControl.prototype.setValueChange = function(valueChangeCall,index) {
    if (typeof index == "string") {
        index = this._bindObjs[index];
    }
    if (!index || index < 0 && index >= this.bindObjs.length)
        index = 0;
    this.valueChangeCall[this.bindObjs[index].id] = valueChangeCall;
};

/**
 * 私有方法 替换函数或变量 宏变量
 *
 * @memberOf {meta.term.termControl}
 * @param value
 */
meta.term.termControl.prototype.replaceMacroVar = function(value) {
    var regExp = new RegExp("\\{(fun:[^}]*?)\\}", "ig");
    var __tm = this;
    var txt = value.replace(regExp, function(x) {
        var _x = x.substring(1, x.length - 1).replace(new RegExp("fun:", "ig"), "");
        try {
            if (window[_x]) {
                if (typeof (window[_x]) == "function")
                    return window[_x](__tm);
                else
                    return window[_x] + "";
            }
            return "";
        } catch (e) {
            alert("传入的外部宏变量或函数 " + _x + " 运行出错!");
            return "";
        }
    });
    __tm = null;
    return txt;
};

/**
 * 单个使用时的初始化
 *
 * @memberOf {meta.term.termControl}
 * @param {Object}
    *            callBackFun
 * @memberOf {TypeName}
 */
meta.term.termControl.prototype.init = function(callBackFun) {
    this.defValPathInited=false;
    this.render();
    this.clearValue();
    if(this.termType == 4){
        if(this.defaultValue.length>0)  {
            this.tableLoaded = 0;
            var thisO = document.getElementById(this.srcElementId);
            var codeMap = {};
            for(var i=0;i<this.defaultValue.length;i++){
                codeMap[this.defaultValue[i]] = 0;
            }
            thisO.codeMap = codeMap;
            thisO.setAttribute("code",this.defaultValue.join(","));
            thisO.value = "";
//            document.getElementById("termkwd_"+this.bindObjs[0].id).value = thisO.getAttribute("code");
            if(this.defaultValue.length>this.myDataTable.Page.pageSize){
                this.myDataTable.setPageSizeOptions(this.defaultValue.length,1);
            }
            this.initMyDataTable(1);
        }
        this.bindDataCall(this);
        this.inited = true;
        return;
    }
    var thisCfm = this.getConfig();
    if (this.dataSrcType == 0) {
        this.bindData(thisCfm.dataRule);
        this.inited = true;
        return;
    }
    if (this.initType == 2) {
        if (window["getCodeArrayByRemoveValue"]) {
            var codes = window["getCodeArrayByRemoveValue"](this.codeType, this.excludeValues);
            if (codes && codes.length > 0) {
                this.bindData(codes);
                this.inited = true;
                return;
            } else {
                this.dataSrcType = 2;
            }
        } else {
            this.dataSrcType = 2;
        }
    }
    if (this.dataSrcType == 1) {
        thisCfm.dataRule = this.replaceMacroVar(thisCfm.dataRule.split(";")[0]) + ";" + thisCfm.dataRule.split(";")[1];
    }
    if (thisCfm.dataSrcType == 2) {
        if (thisCfm.classRuleParams && typeof (thisCfm.classRuleParams) == "function") {
            thisCfm.classRuleParams = thisCfm.classRuleParams();
        }
    }
    thisCfm.value = this.getValue();
    // if(this.constantSql){
    // thisCfm.constantSql=this.constantSql;
    // }
    if(this.termType==0 || this.dataSrcType==0){//文本框或者固定列表值
        this.bindData();
        this.inited = true;
        if (callBackFun) {
            var termVals = this.getValue();
            callBackFun(termVals, this);
        }
    }else{//SQL方式
        var term = this;
        TermControlAction.getTermData(thisCfm, function(res) {
            if (res == null || res == "null" || res[0] == "false") {
                alert("读取条件控件数据失败,msg：" + (res && res.sort ? res[1] : res));
                return false;
            }
            term._dealServerAttribute(res);
            // 绑定对象值
            term.bindData(res[1]);
            term.inited = true;
            if (callBackFun) {
                var termVals = term.getValue();
                callBackFun(termVals, term);
            }
            term = null;
        });
    }

};
/**
 * 设置input框的回车事件,只有termType=0有效
 *
 * @memberOf {meta.term.termControl}
 */
meta.term.termControl.prototype.setInputEnterCall = function(fun) {
    this.inpuEnterCall = fun;
};
meta.term.termControl.prototype.enableReadonly = function(mode) {
    this._readOnly = !!mode;
};
/**
 * 绑定多对象显示
 *
 * @memberOf {meta.term.termControl}
 */
meta.term.termControl.prototype.bindObj = function(parentDiv, valueChangeCall) {
    var index = this.bindObjs.length;
    if (!this.bindObjs[index - 1])
        index--;
    this.bindObjs[index] = parentDiv;
    if (typeof parentDiv == "string")
        this.bindObjs[index] = $(parentDiv);
    if (!this.bindObjs[index])
        return false;
    if (!this.bindObjs[index].id)
        this.bindObjs[index].id = meta.uid();
    this._bindObjs[this.bindObjs[index].id] = index;
    this.parentIds[index] = this.bindObjs[index].id;
    this.valueChangeCall[this.bindObjs[index].id] = valueChangeCall; // 值改变回调
    if (this.readered)
        this.renderObj(index);
};
/**
 * 移除绑定对象,通过索引或者绑定时指定的ID
 */
meta.term.termControl.prototype.removeObj = function(index) {
    if (!this.bindObjs || !this.bindObjs.length)
        return true;
    if (typeof index == "string") {
        index = this._bindObjs[index];
    }
    if (!index || index < 0 && index >= this.bindObjs.length)
        index = this.bindObjs.length - 1;
    var inputObj = this.bindObjs[index];
    var parId = this.parentIds[index];
    this.bindObjs.remove(index);
    this.parentIds.remove(index);
    delete this._bindObjs[parId];
    for ( var i = 0; i < this.parentIds.length; i++) { // 重新生成绑定对象索引
        this._bindObjs[this.parentIds[i]] = i;
        this._bindObjs[this.bindObjs[i].id] = i;
    }
    delete this.valueChangeCall[inputObj.id];
    inputObj.termControl = null;
    delete inputObj.termControl;
    switch (this.termType) { // 0:文本框 1:下拉框 2:下拉树 3:日期控件 时间选择器
        case 0:
            inputObj.onkeydown = null;
            inputObj.onchange = null;
            inputObj.onkeyup = null;
            inputObj.onclick = null;
            break;
        case 1:
            var comboId = inputObj.id;
            this.combo[comboId].clearAll(true);
            Destroy.destructorDHMLX(this.combo[comboId]);
            this.combo[comboId] = null;
            delete this.combo[comboId];
            break;
        case 2:
            this.selTree.removeBindObj(parId);
            inputObj.onclick = null;
            break;
        case 3:
            this.myCalendar.detachObj(inputObj);
            inputObj.onclick = null;
            break;
    }
};
/**
 * 绘制条件，生成对象：组合框、下拉树、日期控件等 flag:强制重绘生成
 *
 * @param index:索引或者绑定时指定的ID
 *
 * @memberOf {meta.term.termControl}
 */
meta.term.termControl.prototype.renderObj = function(index) {
    if (!this.readered)
        return false;
    if (!this.bindObjs || !this.bindObjs[index]) {
        alert("条件绑定对象为空，不能进行绑定绘制。");
        return false;
    }

    if (this.termType != 1 && this.termType != 2 && this.bindObjs[index].tagName != "INPUT") { // 下拉框使用combo实现
        var el = document.createElement("INPUT");
        el.termControl = this;
        el.type = "text";
        el.style.width = this.termWidth + "px";
        el.style.height = this.termHeight + "px";
        el.id = this.bindObjs[index].id + "_" + meta.uid();
        var valueChangeCall = this.valueChangeCall[this.bindObjs[index].id]; // 值改变回调
        this.valueChangeCall[this.bindObjs[index].id] = null;
        delete this.valueChangeCall[this.bindObjs[index].id];
        this.bindObjs[index].appendChild(el);
        this.bindObjs[index] = el;
        this.valueChangeCall[this.bindObjs[index].id] = valueChangeCall;
        this._bindObjs[this.bindObjs[index].id] = index;
    }

    switch (this.termType) { // 0:文本框 1:下拉框 2:下拉树 3:日期控件 时间选择器
        case 0: // 文本框不需要做处理
            if (this.valueType == 0) {
                this.bindObjs[index].onkeydown = onlynumber;
            } else {
                this.bindObjs[index].onkeydown = function(e) {
                    e = e || window.event;
                    if (e.keyCode == 13) {
                        if (this.onchange)
                            this.onchange();
                    }
                };
            }
            this.bindObjs[index].termControl = this;
            this.bindObjs[index].onchange = function(e) {
                e = e || window.event;
                var el = e.srcElement;
                this.termControl.srcElementId = el.id;
                this.valueChange();
            };
            if (this.inpuEnterCall && typeof (this.inpuEnterCall) == "function") {
                this.bindObjs[index].onkeyup = function(e) {
                    e = e || window.event;
                    if (e.keyCode == 13 && this.termControl) {
                        this.termControl.inpuEnterCall(e);
                    }
                };
            }
            break;
        case 1:
            var comboId = this.bindObjs[index].id;
            this.combo[comboId] = DHTMLXFactory.createCombo(comboId, comboId, comboId + "_val", this.termWidth,
                this.mulSelect ? 'checkbox' : null);
            // new
            // dhtmlXCombo(this.inputObj.id,this.inputObj.id+"_val",this.termWidth,this.mulSelect?'checkbox':null);
            if (this._readOnly) {
                this.combo[comboId].readonly(true, true);
                this.combo[comboId].enableFilteringMode(false);
            } else {
                this.combo[comboId].enableFilteringMode(true);
            }
            this.setHeight(this.termHeight,comboId);
            this.combo[comboId].enableOptionAutoPositioning(true);
            // this.combo[comboId].setAutoOpenListWidth(true);
            this.combo[comboId].termControl = this;
            // this.combo[comboId].comboId=comboId;
            this.combo[comboId].inputBoxId = comboId;
            if (this.mulSelect) {
                this.combo[comboId].attachEvent("onCheck", function(value, state) {
                    if (this.getSelectedIndex() == -1 && state) {
                        this.selIndex = true;
                        this.selectOption(this.getIndexByValue(value), false, false);
                    }
                    this.termControl.comboCheck(this);
                    return true;
                });
            }
            this.combo[comboId].attachEvent("onSelectionChange", function() {
                if (this.termControl.mulSelect) {
                    var checked = this.getOption(this.getSelectedValue()).data()[2];
                    if (!this.selIndex) {// this.getSelectedIndex()!=this.selectedIndex
                        // &&
                        this.setChecked(this.getSelectedIndex(), !checked);
                        if (checked) {
                            var checked_array = this.getChecked();
                            if (checked_array.length) {
                                this.selIndex = true;
                                this.selectOption(this.getIndexByValue(checked_array[0]), false, false);
                            }
                        }
                        this.termControl.comboCheck(this);
                    }
                    this.selIndex = false;
                } else {
                    var v = this.getSelectedValue();
                    if (v != $(this.inputBoxId).getAttribute("code")) {
                        this.termControl.srcElementId = this.inputBoxId;
                        this.termControl.valueChange(this.inputBoxId);
                    }
                    $(this.inputBoxId).setAttribute("code", v);
                }
                return true;
            });
            break;
        case 2: // 下拉树
            this.selTree.bind(this.bindObjs[index].id);
            this.selTree.setBindObjWidth(this.bindObjs[index].id, this.termWidth);
            this.selTree.setBindObjHeight(this.bindObjs[index].id, this.termHeight);
            if (this.bindObjs[index].tagName != "INPUT") {
                var valueChangeCall = this.valueChangeCall[this.bindObjs[index].id];
                this.valueChangeCall[this.bindObjs[index].id] = null;
                delete this.valueChangeCall[this.bindObjs[index].id];
                var el = $(this.bindObjs[index].id + "_input");
                this.bindObjs[index] = el;
                this.valueChangeCall[this.bindObjs[index].id] = valueChangeCall;
                this._bindObjs[this.bindObjs[index].id] = index;
            }
            if (this._readOnly)
                this.bindObjs[index].setAttribute("readonly", true);
            this.bindObjs[index].selTree = this.selTree;
            this.bindObjs[index].onclick = function(e) {
                e = e || window.event;
                var el = e.srcElement;
                el.selTree.termControl.srcElementId = el.id;
                meta.term.termControl.showTreeBindCheck(el);
            };
            break;
        case 3:// 日期
            this.bindObjs[index].readOnly = true;
            this.bindObjs[index].calendar = this.myCalendar;
            this.myCalendar.attachObj(this.bindObjs[index]);
            this.bindObjs[index].onclick = function(e) {
                e = e || window.event;
                var el = e.srcElement;
                el.calendar.termControl.srcElementId = el.id;
            };
            this.myCalendar.attachEvent("onClick", function(date) {
                var change_ = $(this.termControl.srcElementId).getAttribute("code") == date;
                $(this.termControl.srcElementId).setAttribute("code", date);
                if (!change_)
                    this.termControl.valueChange();
                return true;
            });
            break;
        case 4:
            this.bindObjs[index].readOnly = true;
            this.bindObjs[index].termControl = this;
            attachObjEvent(this.bindObjs[index],"onclick",function(e){
                e = e || window.event;
                if(e.srcElement && e.srcElement.termControl){
                    var tm_ = e.srcElement.termControl;
                    autoPosition(tm_.myTabDiv,e.srcElement,true,false);
                    document.getElementById("termkwd_"+tm_.bindObjs[0].id).focus();
                    var chage = 0;
                    if(tm_.srcElementId != e.srcElement.id){
                        tm_.srcElementId = e.srcElement.id;
                        chage = 1;
                    }
                    if(tm_.renderedGrid){
                        if(chage){
                            var thisO = document.getElementById(tm_.srcElementId);
                            var cMap = thisO.codeMap || {};
                            var ridstr = tm_.myDataTable.grid.getAllRowIds();
                            if(ridstr=='')return;
                            var rids = ridstr.split(",");
                            for(var i=0;i<rids.length;i++){
                                tm_.myDataTable.grid.cells(rids[i],0).setValue(cMap[rids[i]]?1:0);
                            }
                        }
                    }else{
                        tm_.initMyDataTable();
                    }
                }
            });

    }
};
/**
 * 设置表格条件，附加过滤搜索条件(限一个)
 * @memberOf {meta.term.termControl}
 */
meta.term.termControl.prototype.setDataTableAppCond = function(appCond){
    this.appCond = appCond;
};
/**
 * 绘制条件，生成对象：组合框、下拉树、日期控件等 flag:强制重绘生成
 *
 * @memberOf {meta.term.termControl}
 */
meta.term.termControl.prototype.render = function(flag) {
    if (this.readered && !flag)
        return;
    this.readered = false;
    if (!this.bindObjs || !this.bindObjs[0]) {
        alert("条件绑定对象为空，不能进行绑定绘制。");
        return false;
    }
    if (this.myCalendar) {
        // this.myCalendar.i=[];
        Destroy.destructorDHMLX(this.myCalendar);
    }
    if (this.combo) {
        for ( var combo in this.combo) {
            this.combo[combo].clearAll(true);
            Destroy.destructorDHMLX(this.combo[combo]);
            this.combo[combo] = null;
            delete this.combo[combo];
        }
    }
    this.combo = {};
    if (this.selTree) {
        this.selTree.destructor();// destructorDHMLX(this.selTree);
        this.selTree = null;
    }
    for ( var i = 0; i < this.bindObjs.length; i++) {
        if (this.termType != 1 && this.termType != 2 && this.bindObjs[i].tagName != "INPUT") { // 下拉框使用combo实现
            var el = document.createElement("INPUT");
            el.termControl = this;
            el.type = "text";
            el.style.width = this.termWidth + "px";
            el.id = this.bindObjs[i].id + "_" + meta.uid();

            var valueChangeCall = this.valueChangeCall[this.bindObjs[i].id]; // 值改变回调
            this.valueChangeCall[this.bindObjs[i].id] = null;
            delete this.valueChangeCall[this.bindObjs[i].id];
            this.bindObjs[i].appendChild(el);
            this.bindObjs[i] = el;
            this.valueChangeCall[this.bindObjs[i].id] = valueChangeCall;
            this._bindObjs[this.bindObjs[i].id] = i;
        }
    }

    switch (this.termType) { // 0:文本框 1:下拉框 2:下拉树 3:日期控件 时间选择器 4:搜索表格
        case 0: // 文本框不需要做处理
            for ( var i = 0; i < this.bindObjs.length; i++) {
                if (this.valueType == 0) {
                    this.bindObjs[i].onkeydown = onlynumber;
                } else {
                    this.bindObjs[i].onkeydown = function(e) {
                        e = e || window.event;
                        if (e.keyCode == 13) {

                            if (this.onchange)
                                this.onchange();
                        }
                    };
                }

                this.bindObjs[i].termControl = this;
                // this.bindObjs[i].onclick=function(e){e = e||window.event;var
                // el=e.srcElement;this.termControl.srcElementId=el.id;};
                this.bindObjs[i].onchange = function(e) {
                    e = e || window.event;
                    var el = e.srcElement;
                    this.termControl.srcElementId = el.id;
                    this.termControl.valueChange();
                };
                if (this.inpuEnterCall && typeof (this.inpuEnterCall) == "function") {
                    this.bindObjs[i].onkeyup = function(e) {
                        e = e || window.event;
                        if (e.keyCode == 13 && this.termControl) {
                            this.termControl.inpuEnterCall(e);
                        }
                    };
                }
            }
            break;
        case 1:
            for ( var i = 0; i < this.bindObjs.length; i++) {
                var comboId = this.bindObjs[i].id;
                this.combo[comboId] = DHTMLXFactory.createCombo(comboId, this.bindObjs[i].id, this.bindObjs[i].id + "_val",
                    this.termWidth, this.mulSelect ? 'checkbox' : null);
                // new
                // dhtmlXCombo(this.inputObj.id,this.inputObj.id+"_val",this.termWidth,this.mulSelect?'checkbox':null);
                if (this._readOnly) {
                    this.combo[comboId].readonly(true, true);
                    this.combo[comboId].enableFilteringMode(false);
                } else {
                    this.combo[comboId].enableFilteringMode(true);
                }
                this.setHeight(this.termHeight,comboId);
                this.combo[comboId].enableOptionAutoPositioning(true);
                // this.combo[comboId].setAutoOpenListWidth(true);
                this.combo[comboId].termControl = this;
                // this.combo[comboId].comboId=comboId;
                this.combo[comboId].inputBoxId = this.bindObjs[i].id;
                if (this.mulSelect) {
                    this.combo[comboId].attachEvent("onCheck", function(value, state) {
                        if (this.getSelectedIndex() == -1 && state) {
                            this.selIndex = true;
                            this.selectOption(this.getIndexByValue(value), false, false);
                        }
                        this.termControl.comboCheck(this);
                        return true;
                    });
                }
                this.combo[comboId].attachEvent("onSelectionChange", function() {
                    if (this.termControl.mulSelect) {
                        var checked = this.getOption(this.getSelectedValue()).data()[2];
                        if (!this.selIndex) {// this.getSelectedIndex()!=this.selectedIndex
                            // &&
                            this.setChecked(this.getSelectedIndex(), !checked);
                            if (checked) {
                                var checked_array = this.getChecked();
                                if (checked_array.length) {
                                    this.selIndex = true;
                                    this.selectOption(this.getIndexByValue(checked_array[0]), false, false);
                                }
                            }
                            this.termControl.comboCheck(this);
                        }
                        this.selIndex = false;
                    } else {
                        var v = this.getSelectedValue();
                        if (v != $(this.inputBoxId).getAttribute("code")) {
                            this.termControl.srcElementId = this.inputBoxId;
                            this.termControl.valueChange(this.inputBoxId);
                        }
                        $(this.inputBoxId).setAttribute("code", v);
                    }
                    return true;
                });
            }
            break;
        case 2: // 下拉树
            this.selTree = new meta.ui.selectTree(this.bindObjs[0].id);
            if (this.dimAuthFlag) {
                this.selTree.setItemFilterFun(meta.term.termControl.treeItemRightCheck);
            }
            this.selTree.termControl = this;
            this.selTree.enableAutoSize(true);
            this.selTree.enableMuiltselect(this.mulSelect);
            if(!this.mulSelect){
                this.selTree.setAutoSelectByValue(true);
            }
            for ( var i = 0; i < this.bindObjs.length; i++) {
                if (i)
                    this.selTree.bind(this.bindObjs[i].id);
                this.selTree.setBindObjWidth(this.bindObjs[i].id, this.termWidth);
                this.selTree.setBindObjHeight(this.bindObjs[i].id, this.termHeight);
                if (this.bindObjs[i].tagName != "INPUT") {
                    var valueChangeCall = this.valueChangeCall[this.bindObjs[i].id];
                    this.valueChangeCall[this.bindObjs[i].id] = null;
                    delete this.valueChangeCall[this.bindObjs[i].id];
                    var el = $(this.bindObjs[i].id + "_input");
                    this.bindObjs[i] = el;
                    this.valueChangeCall[this.bindObjs[i].id] = valueChangeCall;
                    this._bindObjs[this.bindObjs[i].id] = i;
                }
                if (this._readOnly) {
                    this.bindObjs[i].setAttribute("readonly", true);
                    this.bindObjs[i].readOnly = true;
                } else {
                    this.selTree.enableSearch(true, true);
                }
                this.bindObjs[i].selTree = this.selTree;
                this.bindObjs[i].onclick = function(e) {
                    e = e || window.event;
                    var el = e.srcElement;
                    el.selTree.termControl.srcElementId = el.id;
                    meta.term.termControl.showTreeBindCheck(el);
                };
            }
            break;
        case 3:// 日期
            for ( var i = 0; i < this.bindObjs.length; i++)
                this.bindObjs[i].readOnly = true;
            this.myCalendar = DHTMLXFactory.createCalendar(this.bindObjs[0].id, this.bindObjs[0].id);
            this.myCalendar.setDateFormat("%Y-%m-%d");
            this.myCalendar.base.style.zIndex = (this.bindObjs[0].style.zIndex||1) +1;
            this.myCalendar.termControl = this;
            for ( var i = 0; i < this.bindObjs.length; i++) {
                this.bindObjs[i].calendar = this.myCalendar;
                if (i)
                    this.myCalendar.attachObj(this.bindObjs[i]);
                attachObjEvent(this.bindObjs[i],"onclick",function(e){
                    e = e || window.event;
                    var el = e.srcElement;
                    el.calendar.termControl.srcElementId = el.id;
                    autoPosition(el.calendar.base,el);
                });
            }
            this.myCalendar.attachEvent("onClick", function(date) {
                var change_ = $(this.termControl.srcElementId).getAttribute("code") == date;
                $(this.termControl.srcElementId).setAttribute("code", date);
                if (!change_)
                    this.termControl.valueChange();
                return true;
            });
            break;
        case 4:
            for ( var i = 0; i < this.bindObjs.length; i++){
                this.bindObjs[i].readOnly = true;
                this.bindObjs[i].termControl = this;
                if(i==0){
                    this.srcElementId = this.bindObjs[i].id;
                }
                attachObjEvent(this.bindObjs[i],"onclick",function(e){
                    e = e || window.event;
                    if(e.srcElement && e.srcElement.termControl){
                        var tm_ = e.srcElement.termControl;
                        autoPosition(tm_.myTabDiv,e.srcElement,true,false);
                        document.getElementById("termkwd_"+tm_.bindObjs[0].id).focus();
                        var chage = 0;
                        if(tm_.srcElementId != e.srcElement.id){
                            tm_.srcElementId = e.srcElement.id;
                            chage = 1;
                        }
                        if(tm_.renderedGrid){
                            if(chage){
                                var thisO = document.getElementById(tm_.srcElementId);
                                var cMap = thisO.codeMap || {};
                                var ridstr = tm_.myDataTable.grid.getAllRowIds();
                                if(ridstr=='')return;
                                var rids = ridstr.split(",");
                                for(var i=0;i<rids.length;i++){
                                    tm_.myDataTable.grid.cells(rids[i],0).setValue(cMap[rids[i]]?1:0);
                                }
                            }
                        }else{
                            tm_.initMyDataTable();
                        }
                    }
                });
            }
            this.myTabDiv = dhx.html.create("div", {
                style : "position:absolute;padding:0;margin:0;"
                    + "overflow:auto;border:1px #8f99a2 solid;background-color:white;z-index:1000"
            });
            this.myTabDiv.style.width = "435px";
            this.myTabDiv.style.height = "284px";
            document.body.appendChild(this.myTabDiv);
            var appCondStr = "";
            if(this.appCond){
                if(this.appCond.type=="SELECT"){
                    appCondStr += this.appCond.title+":<select id='tm_"+this.appCond.key+"_"+this.bindObjs[0].id+"' style='width:100px;'>";
                    appCondStr += "<option value='' selected></option>";
                    for(var i=0;i<this.appCond.data.length;i++){
                        appCondStr += "<option value='"+this.appCond.data[i][0]+"'>"+this.appCond.data[i][1]+"</option>";
                    }
                    appCondStr += "</select>";
                }else if(this.appCond.type=="INPUT"){
                    appCondStr += this.appCond.title+":<input type='text' id='tm_"+this.appCond.key+"_"+this.bindObjs[0].id+"' style='width:100px;'>&nbsp;";
                }
            }
            this.myTabDiv.innerHTML = "<div style='position:relative;margin:0;padding:0'>" +
                "<div style='height:28px;position:absolute;top:0:left:0;right:0;width:100%;'>" +
                appCondStr +
                "关键字:<input type='text' style='width:"+(appCondStr?105:265)+"px;font-size:12px;color:#a9a9a9;' id='termkwd_"+this.bindObjs[0].id+"'>" +
                "<input type='button' style='margin:2px;' id='termbtn_"+this.bindObjs[0].id+"' value='搜索' class='btn_2'>" +
                "<input type='button' style='margin:2px;' id='termcla_"+this.bindObjs[0].id+"' value='清除' class='btn_2'></div>" +
                "<div style='position:absolute;top:28px;left:0;right:0;bottom:0;width:100%;height:254px;' id='termgrid_"+this.bindObjs[0].id+"'></div>" +
                "</div>" ;
            this.myDataTable = new meta.ui.DataTable("termgrid_"+this.bindObjs[0].id);
            this.myDataTable.termControl = this;
            this.myDataTable.setColumns({
                CHOOSE:this.mulSelect?"{#checkBox}":"选择",
//                CHOOSE:"选择",
                VAL:this.colNameMap["VAL"]||"ID/编码",
                VAL_NAME:this.colNameMap["VAL_NAME"]||"名称描述"
            },",VAL,VAL_NAME");
            this.myDataTable.setPaging(true,10);//分页
            this.myDataTable.setRowIdForField("VAL");

            this.myTabDiv.style.display = "none";

            var termkwd_ = document.getElementById("termkwd_"+this.bindObjs[0].id);
            var termbtn_ = document.getElementById("termbtn_"+this.bindObjs[0].id);
            var termcla_ = document.getElementById("termcla_"+this.bindObjs[0].id);
            termkwd_.termControl = this;
            termbtn_.termControl = this;
            termcla_.termControl = this;
            attachObjEvent(termkwd_,"onkeyup",function(e){
                e = e || window.event;
                if(e.keyCode!=13)return;
                if(e.srcElement && e.srcElement.termControl){
                    e.srcElement.termControl.myDataTable.Page.currPageNum = 1;
                    e.srcElement.termControl.dataTableKwd = e.srcElement.value.trim();
                    e.srcElement.termControl.myDataTable.refreshData();
                }
            });
            attachObjEvent(termbtn_,"onclick",function(e){
                e = e || window.event;
                if(e.srcElement && e.srcElement.termControl){
                    e.srcElement.termControl.myDataTable.Page.currPageNum = 1;
                    e.srcElement.termControl.dataTableKwd = document.getElementById("termkwd_"+e.srcElement.termControl.bindObjs[0].id).value.trim();
                    e.srcElement.termControl.myDataTable.refreshData();
                }
            });
            attachObjEvent(termcla_,"onclick",function(e){
                e = e || window.event;
                if(e.srcElement && e.srcElement.termControl){
                    document.getElementById("termkwd_"+e.srcElement.termControl.bindObjs[0].id).value = "";
                    e.srcElement.termControl.dataTableKwd = document.getElementById("termkwd_"+e.srcElement.termControl.bindObjs[0].id).value.trim();
                    var tm = e.srcElement.termControl;
                    var thisO = document.getElementById(tm.srcElementId);
                    thisO.codeMap = {};
                    thisO.setAttribute("code","");
                    thisO.value = "";
                    var ridstr = tm.myDataTable.grid.getAllRowIds();
                    if(ridstr=='')return;
                    var rids = ridstr.split(",");
                    for(var i=0;i<rids.length;i++){
                        tm.myDataTable.grid.cells(rids[i],0).setValue(0);
                    }
                    tm.valueChange();
                }
            });

            break;
    }
    this.readered = true;
};

//初始
meta.term.termControl.prototype.initMyDataTable = function(flag){
    if(this.renderedGrid){
        if(flag)
            this.myDataTable.refreshData();
        return;
    }
    this.myDataTable.render();//绘制函数
    this.myDataTable.setGridColumnCfg(0,{type:this.mulSelect?"ch":"ra",align:"center"});
    this.myDataTable.setGridColumnCfg(2,{align:"center",tip:true});
    this.myDataTable.grid.setInitWidthsP("10,35,55");
    this.myDataTable.grid.attachEvent("onCheck",function(id,cid,state){
        meta.term.termControl.dataTableSelected(this,state,id);
    });
    this.myDataTable.grid.attachEvent("onRowSelect",function(id,cid){
    	this.cells(id,0).setValue(1);
        meta.term.termControl.dataTableSelected(this,true,id);
    });
    this.myDataTable.grid.setHeaderCheckBoxCall(meta.term.termControl.dataTableSelectAll);
    this.myDataTable.setFormatCellCall(function(rid,cid,data,colId,dataTable){
        if(colId=="CHOOSE"){
            var thisO = document.getElementById(dataTable.termControl.srcElementId);
            var cMap = thisO.codeMap || {};
            return (cMap[rid]!=null && cMap[rid]!=undefined)?1:0;
        }
        return data[cid];
    });
    this.myDataTable.refreshData(function(dt,params){
        dhx.showProgress("请求中!");
        var dt_ = dt;
        TermControlAction.queryTermData(dt_.termControl.getConfig(),{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
            dhx.closeProgress();
            var total = 0;
            if(data && data[0])
                total = data[0]["TOTAL_COUNT_"];
            dt_.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法
            if(dt_.termControl.tableLoaded==0){
                dt_.termControl.tableLoaded = 1;
                var thisO = document.getElementById(dt_.termControl.srcElementId);
                var cMap = thisO.codeMap;
                cMap = cMap || {};
                var chks = dt_.grid.getCheckedRows(0);
                var v = thisO.value;
                if(chks){
                    var chkss = chks.split(",");
                    var fg_ = 0;
                    for(var i=0;i<chkss.length;i++){
                        if(cMap[chkss[i]]!=null && cMap[chkss[i]]!=undefined){
                            if(i==0 && thisO.value){
                                v += ",";
                            }
                            cMap[chkss[i]] = dt_.getUserData(chkss[i],"VAL_NAME");
                            v += cMap[chkss[i]]+",";
                            fg_ =1;
                        }
                    }
                    if(fg_){
                        thisO.value = v.substring(0,v.length-1);
                    }
                }
            }
            dt_.grid.setSizes();
            dt_ = null;
        });
    });
    this.renderedGrid = true;
};

/**
 * 数据表格全选
 * @param grid
 * @param state
 */
meta.term.termControl.dataTableSelectAll=function(grid,state){
    var tb = grid.MetaDataTable;
    var tm = tb.termControl;
    var ridstr = grid.getAllRowIds();
    if(ridstr=='')return;
    var rids = ridstr.split(",");
    var thisO = document.getElementById(tm.srcElementId);
    var cMap = thisO.codeMap;
    cMap = cMap || {};
    for(var i=0;i<rids.length;i++){
        var v = tb.getUserData(rids[i],"VAL");
        var vn = tb.getUserData(rids[i],"VAL_NAME");
        if(state){
            cMap[v] = vn;
        }else{
            cMap[v] = null;
            delete cMap[v];
        }
    }
    var codes = "";
    var codenames = "";
    for(var vk in cMap){
        codes += vk+",";
        codenames += (cMap[vk]?cMap[vk]:vk)+",";
    }
    thisO.codeMap = cMap ;
    if(codes){
        thisO.setAttribute("code",codes.substring(0,codes.length-1));
        thisO.value = codenames.substring(0,codenames.length-1);
    }else{
        thisO.setAttribute("code","");
        thisO.value = "";
    }
    tm.valueChange();
};
/**
 * 单选
 * @param grid
 * @param state
 * @param id
 */
meta.term.termControl.dataTableSelected=function(grid,state,id){
    var tb = grid.MetaDataTable;
    var tm = tb.termControl;
    var thisO = document.getElementById(tm.srcElementId);
    if(tm.mulSelect){
        var v = tb.getUserData(id,"VAL");
        var vn = tb.getUserData(id,"VAL_NAME");
        var cMap = thisO.codeMap;
        cMap = cMap || {};
        if(state){
            cMap[v] = vn;
        }else{
            cMap[v] = null;
            delete cMap[v];
        }
        var codes = "";
        var codenames = "";
        for(var vk in cMap){
            codes += vk+",";
            codenames += (cMap[vk]?cMap[vk]:vk)+",";
        }
        thisO.codeMap = cMap ;
        if(codes){
            thisO.setAttribute("code",codes.substring(0,codes.length-1));
            thisO.value = codenames.substring(0,codenames.length-1);
        }else{
            thisO.setAttribute("code","");
            thisO.value = "";
        }
    }else{
        var v = tb.getUserData(id,"VAL");
        var vn = tb.getUserData(id,"VAL_NAME");
        var cMap = {};
        cMap[v] = 1;
        thisO.setAttribute("code",v);
        thisO.value = vn;
        thisO.codeMap = cMap;
    }
    tm.valueChange();
};

/**
 * 判断权限，无权限返回false
 */
meta.term.termControl.treeItemRightCheck=function(row,tree){
    var term=tree.termControl;
    return meta.term.termControl.dimRightCheck(row,term,4);
};
/**
 * 维度权限判断 ，无权限返回false 下拉框在添加数据时判断，下拉树分单选和多选，多选绑定数据时用
 * treeItemRightCheck判断，单选时在选择时判断
 */
meta.term.termControl.dimRightCheck=function(row,term,index){
    if(term.dimAuthFlag==false)return true;
    if(term.termType==1 && row[row.length-1])return true;
    if(term.termType==2 ){//判断 层级
        if(!row[row.length-1])return false;//直接无权限
        if(term.dimDataLevels.length && term.dimDataLevels.join().indexOf(row[index])==-1)//假定层级不下过9层级
            return false;//非支持的层级选定
        return true;
    }
    return false;
}
/**
 * 私有方法 设置combo选择事件
 *
 * @memberOf {meta.term.termControl}
 * @param combo
 * @param unCall
 */
meta.term.termControl.prototype.comboCheck = function(combo, unCall) {
    if (this.mulSelect) {
        var txt = "";
        var checked_array = combo.getChecked();// alert(checked_array);
        for ( var i = 0; i < checked_array.length; i++) {
            if (i)
                txt += ",";
            txt += combo.getOption(checked_array[i]).text.replace(new RegExp("&gt;","ig"),">").replace(new RegExp("&lt;","ig"),"<");
        }
        combo.setComboText(txt);
        if (!unCall) {
            this.srcElementId = combo.inputBoxId;
            combo.termControl.valueChange();
        }
    }
};
/**
 * 清空值
 *
 * @memberOf {meta.term.termControl}
 */
meta.term.termControl.prototype.clearValue = function(saveData) {
    if(!this.readered)return;
    for ( var i = 0; i < this.bindObjs.length; i++) {
        this.inited = 0;
        this.bindObjs[i].value = "";
        this.bindObjs[i].checkIds = null;
        this.bindObjs[i].setAttribute("code", null);
        this.bindObjs[i].removeAttribute("code");
        this.bindObjs[i].codeMap = null;
    }
    switch (this.termType) {
        case 1:
            for ( var i = 0; i < this.bindObjs.length; i++){
                if(!saveData){
                    this.combo[this.bindObjs[i].id].clearAll(true);
                }
                this.combo[this.bindObjs[i].id].setComboText("");
            }
            break;
        case 2:
            if(!saveData){
                this.selTree.tree.deleteChildItems(this.selTree.tree.rootId);
            }
            break;
        case 3:
            if(!saveData){
                this.myCalendar.clearSensitiveRange();
                this.myCalendar.clearInsensitiveDays();
            }
            break;
        case 4:
            this.dataTableKwd = "";
            if(!saveData){
                if(this.renderedGrid){
                    var ridstr = this.myDataTable.grid.getAllRowIds();
                    if(ridstr=='')return;
                    var rids = ridstr.split(",");
                    for(var i=0;i<rids.length;i++){
                        this.myDataTable.grid.cells(rids[i],0).setValue(0);
                    }
                }
            }
    }
};
/**
 * 绑定数据
 *
 * @param {Object}
    *            data 从后台返回的数据都会通过此接口绑定到具体的条件上 data一般是二维数组
 * @param isfresh
 *            是否由级联刷新引起的绑定
 * @memberOf {meta.term.termControl}
 */
meta.term.termControl.prototype.bindData = function(resdata, isfresh) {
    if (!this.readered)
        this.render();
    var data = (this.dataSrcType == 0 && this.initType == 0) ? this.dataRule : resdata;
    if (this.termType == 0)
        this.bindObjs[0].value = this.defaultValue[0]||"";
    this.setTreeChildFiledFlag(this.treeChildFlag);
    if (isfresh && this.termType > 1) {// 下拉框实现无文本框
        for ( var i = 0; i < this.bindObjs.length; i++) {
            this.bindObjs[i].value = "";
            this.bindObjs[i].setAttribute("code", null);
        }
    }
    if (data == null || data == undefined)
        return;
    switch (this.termType) {
        case 0: // 文本框
            for ( var i = 0; i < this.bindObjs.length; i++)
                this.bindObjs[i].value = this.defaultValue[0]||"";
            break;
        case 1:// combo
            if (isfresh) {
                for ( var i = 0; i < this.bindObjs.length; i++)
                    this.combo[this.bindObjs[i].id].clearAll(true);
            }
            var valMap = {};
            if (this.mulSelect) {
                for ( var i = 0; i < this.defaultValue.length; i++) {
                    var id=(typeof this.defaultValue[i]=="object" &&this.defaultValue[i].sort ?this.defaultValue[i][0]:this.defaultValue[i]);
                    valMap[id] = this.defaultValue[i];
                }
            }
            var data_ = data.clone();
            if (this.appendData && this.appendData.sort && this.appendData.length) {
                for ( var i = this.appendData.length - 1; i >= 0; i--) {
                    data_.unshift(this.appendData[i]);
                }
            }
            for ( var n = 0; n < this.bindObjs.length; n++) {
                var comboId = this.bindObjs[n].id;
                var combo=this.combo[comboId];
                for ( var i = 0; i < data_.length; i++) {
                    var bd = data_[i];
                    if (bd == null || bd == undefined)
                        continue;
                    if(!meta.term.termControl.dimRightCheck(bd,this,2))//无权限
                        continue;
                    bd = this.bindDataBeforeCall(bd, 'combo', this,combo);
                    if (bd == null && bd == undefined)
                        continue;

                    var rs=combo.addOption(bd[0] + "", bd[1] + "");
                    var op = combo.getOptionByIndex(i);
                    if(op)
                        op.optionData = bd.clone();
                    if (this.mulSelect) {// 支持多选，checkbox
                        if (valMap[bd[0] + ""])
                            combo.setChecked(combo.getIndexByValue(bd[0]), true);
                    } else {
                        if (bd[0] + "" == this.defaultValue[0] + "")
                            combo.selectOption(i, false, true);
                    }
                }
                if (this.mulSelect)
                    this.comboCheck(combo, true);
                else {
                    this.bindObjs[n].value = combo.getSelectedText();
                    this.bindObjs[n].setAttribute("code", combo.getSelectedValue());
                }
            }
            break;
        case 2:// tree
            if (isfresh) {
                this.selTree.tree.deleteChildItems(this.selTree.tree.rootId);
            } else {
                if (this.dynload) {
                    this.selTree.refreshFlag={};
                    this.selTree.tree.attachEvent("onSelect", meta.term.termControl.termTreeListFlashSel);
                    this.selTree.tree.attachEvent("onClick", meta.term.termControl.termTreeListFlashClk);
                    this.selTree.tree.attachEvent("onOpenStart", meta.term.termControl.termTreeListFlash);
                    if (this.mulSelect) {
                        this.selTree.tree.attachEvent("onCheck", meta.term.termControl.termTreeCheck);
                    } else {
                        this.selTree.tree.attachEvent("onDblClick", meta.term.termControl.termTreeListFlashDbl);
                    }
                    this.selTree.setDynload(this.dynload, function(id, tree) {
                        return true;
                    });
                    this.selTree.enableItemDynLoad(this.selTree.tree.rootId, false);
                    // this.selTree.setDynload(this.dynload,this.termTreeDynload);
                } else {
                    this.selTree.tree.attachEvent("onSelect", meta.term.termControl.termTreeListOpenItem);
                    this.selTree.tree.attachEvent("onClick", meta.term.termControl.termTreeListOpenItem);
                    if (this.mulSelect) {
                        this.selTree.tree.attachEvent("onCheck", meta.term.termControl.termTreeCheck);
                    } else {
                        this.selTree.tree.attachEvent("onDblClick", meta.term.termControl.termTreeListSelect);
                    }
                }
            }
            var data_ = data.clone();
            if (this.appendData && this.appendData.sort) {
                for ( var i = this.appendData.length - 1; i >= 0; i--) {
                    data_.unshift(this.appendData[i]);
                }
            }
            this.bindTreeData(data_);
            this.selectDefaultTreeListVal();
            break;
        case 3:// date
            if (isfresh) {
                this.myCalendar.clearSensitiveRange();
                this.myCalendar.clearInsensitiveDays();
            }
            var def = formatNumDate(this.defaultValue[0]);
            if (!def) {
                def = new Date();
                def.setDate(def.getDate() - 1);
            }
            this.myCalendar.setDate(def);
            for ( var i = 0; i < this.bindObjs.length; i++)
                this.bindObjs[i].value = this.myCalendar.getDate(true);
            var minR = "";
            if (this.parentTerm && this.metaTerm && this.metaTerm.terms[this.parentTerm]
                && this.metaTerm.terms[this.parentTerm].termType == 3) {
                minR = this.metaTerm.terms[this.parentTerm].getValue().replaceAll("-", "");
            }
            var maxR = "";
            for ( var i = 0; i < data.length; i++) {
                if(!meta.term.termControl.dimRightCheck(data[i],this,2))//无权限
                    continue;
                var _date = this.bindDataBeforeCall(data[i]);
                if (_date.sort) // 二维数组
                    _date = _date[0];
                _date = _date.split("-");// 尝试按 '-' 字符拆分前面表示最小值，后面表示最大值,0表示无穷
                var mind = _date[0] != null && _date[0] != undefined ? _date[0] : "";
                var maxd = _date[1] != null && _date[1] != undefined ? _date[1] : "";
                if (this.parentTerm && this.metaTerm && this.metaTerm.terms[this.termId]
                    && this.metaTerm.terms[this.parentTerm] && this.metaTerm.terms[this.parentTerm].termType == 3) {
                    var parVal = this.metaTerm.terms[this.parentTerm].getValue();
                    mind = mind.toUpperCase().replace(
                        "{" + this.metaTerm.terms[this.parentTerm].termName.toUpperCase() + "}", parVal);
                    maxd = maxd.toUpperCase().replace(
                        "{" + this.metaTerm.terms[this.parentTerm].termName.toUpperCase() + "}", parVal);
                }
                if (mind != "" && mind != "0" && maxd == "") { // mind有效值
                    mind = formatNumDate(mind);
                } else if (mind == "" && maxd != "" && maxd != "0") { // maxd无效值
                    maxd = formatNumDate(maxd);
                    if (maxd)
                        this.myCalendar._rangeSet[new Date(maxd.getFullYear(), maxd.getMonth(), maxd.getDate(), 0, 0, 0, 0)
                            .getTime()] = true;
                } else if (mind == "0" && maxd != "" && maxd != "0") {// 左开区间
                    if (maxR)
                        maxR = Math.min(maxR, maxd);
                    else
                        maxR = maxd;
                } else if (mind != "0" && mind != "" && maxd == "0") { // 右开区间
                    if (minR)
                        minR = Math.max(minR, mind);
                    else
                        minR = mind;
                } else if (mind != "" && mind != "0" && maxd != "" && maxd != "0") {
                    if (maxR)
                        maxR = Math.min(maxR, maxd);
                    else
                        maxR = maxd;
                    if (minR)
                        minR = Math.max(minR, mind);
                    else
                        minR = mind;
                }
            }
            minR = formatNumDate(minR);
            maxR = formatNumDate(maxR);
            if ((minR && maxR) && minR > maxR) {
                alert("时间有效性配置错误,开始值必需小于结束值");
                return false;
            }
            this.myCalendar.setSensitiveRange(minR, maxR);
    }
    this.bindDataCall(this);
    if (isfresh) {
        this.valueChange();
    }
    this.inited = true;
};
/**
 * 私有方法 设置树默认值
 *
 * @memberOf {meta.term.termControl}
 */
meta.term.termControl.prototype.selectDefaultTreeListVal = function() {
    if (this.dynload && this.defaultValue.length > 0 && this.defaultValuePath) { // 异步加载默认值节点
        for ( var i = 0; i < this.defaultValuePath.length; i++) {
            this.selTree.refreshFlag[this.selTree._priFix + this.defaultValuePath[i]]=true;
//            this.selTree.tree.setUserData(this.selTree._priFix + this.defaultValuePath[i], "refresh", "true");
        }
    }
    var term = this;
    var selTree = term.selTree;
    if (this.mulSelect) {
        for ( var i = 0; i < this.defaultValue.length; i++) {
            var id=this.selTree._priFix + (typeof this.defaultValue[i]=="object" && this.defaultValue[i].sort?this.defaultValue[i][0]:this.defaultValue[i]);
            this.selTree.tree.setCheck(id, true);
            this.selTree.tree.selectItem(id, false, false);// focusItem(itemId)
        }
        this.selTree.tree.selectItem(this.selTree._priFix + (typeof this.defaultValue[i]=="object" &&this.defaultValue[i].sort?this.defaultValue[i][0]:this.defaultValue[i]), false, false);// focusItem(itemId)
        var checkIdStr = selTree.tree.getAllChecked();
        if (!checkIdStr)
            return;
        var textValue = "";
        var checkIdStrs = {};
        checkIdStr = checkIdStr.split(",");
        for ( var i = 0; i < checkIdStr.length; i++) {
            checkIdStrs[checkIdStr[i]] = selTree.tree.getItemText(checkIdStr[i]).replace(new RegExp("&gt;","ig"),">").replace(new RegExp("&lt;","ig"),"<");
            if (textValue)
                textValue += "," + checkIdStrs[checkIdStr[i]];
            else
                textValue = checkIdStrs[checkIdStr[i]];
        }
        for ( var n = 0; n < this.bindObjs.length; n++) {
            var inputObj = this.bindObjs[n];
            if (term.mulSelect) {
                if (!inputObj.checkIds)
                    inputObj.checkIds = {};
                selTree.tree.setCheck(id, !inputObj.checkIds[id]);
                if (!checkIdStr) {
                    inputObj.value = "";
                    inputObj.setAttribute("code", "");
                    continue;
                }
                for ( var i = 0; i < checkIdStr.length; i++)
                    inputObj.checkIds[checkIdStr[i]] = checkIdStrs[checkIdStr[i]];// selTree.tree.getItemText(checkIdStr[i]);

                //将其转换为字符
                checkIdStr = checkIdStr.join(",");
                var change_ = inputObj.getAttribute("code") == checkIdStr;
                inputObj.setAttribute("code", checkIdStr);
                inputObj.value = textValue;
            } else {
                var id = this.selTree._priFix + this.defaultValue[0];
                var val = selTree.tree.getSelectedItemText();
                inputObj.value = val;// selTree.getItemValue(id);
                var change_ = inputObj.getAttribute("code") == id;
                inputObj.setAttribute("code", id);
                selTree.box.style.display = "none";
            }
        }
        Destroy.clearVarVal(checkIdStrs);
    } else {
        this.selTree.tree.selectItem(this.selTree._priFix + this.defaultValue[0], false, false);// focusItem(itemId)
        for ( var n = 0; n < this.bindObjs.length; n++) {
            var inputObj = this.bindObjs[n];
            inputObj.value = selTree.tree.getSelectedItemText();
            inputObj.setAttribute("code", selTree.tree.getSelectedItemId());
            inputObj.setAttribute("selValue",selTree.tree.getSelectedItemId());
        }
    }

};
/**
 * 私有方法 条件值改变时执行
 *
 * @memberOf {meta.term.termControl}
 */
meta.term.termControl.prototype.valueChange = function() {
    // Debug(this.getValue()+"");
    if (!this.inited) {
        this.srcElementId = null;
        return;
    }
    if (this.srcElementId) {
        if (this.valueChangeCall[this.srcElementId]) {
            var flag = this.valueChangeCall[this.srcElementId](this.getValue(this.srcElementId), this);
            if (!flag)
                return;
        }
    }
    if (!this.mulSelect)
        this.termFlashCheck();// 忽略多选，判断是否有依赖此条件的条件存在，存在则刷新
};
/**
 * 私有方法，级联刷新
 *
 * @memberOf {meta.term.termControl}
 */
meta.term.termControl.prototype.termFlashCheck = function() {
    if (!this.metaTerm)
        return;
    if (!this.metaTerm.terms[this.termId])
        return;// 未进行打包管理的条件
    var cfms = [];
    var flashTerms = {};
    var thisVal = this.metaTerm.terms[this.termId].getValue();
    thisVal = thisVal || "";
    var thisText = "";
    if (thisVal && thisVal.sort) {
        thisText = thisVal[1];
        thisVal = thisVal[0];
    }
    for ( var term in this.metaTerm.terms) {
        if (this.metaTerm.terms[term].parentTerm && this.metaTerm.terms[term].parentTerm == this.termId
            && term != this.termId) {
            if (this.metaTerm.terms[term].initType == 2) {
                if (window["getCodeArrayByRemoveValue"]) {
                    var codes = window["getCodeArrayByRemoveValue"](this.metaTerm.terms[term].codeType,
                        this.metaTerm.terms[term].excludeValues);
                    if (codes && codes.length > 0) {
                        this.metaTerm.terms[term].bindData(codes, true);
                        this.metaTerm.terms[term].codeInited = true;
                    } else {
                        this.metaTerm.terms[term].dataSrcType = 2;
                    }
                } else {
                    this.metaTerm.terms[term].dataSrcType = 2;
                }
            }
            // 读取数据，刷新
            var cfg = this.metaTerm.terms[term].getConfig();
            if (!cfg.dataSrcType)
                continue;// 条件数据来源非SQL，无法级联刷新
            if (this.metaTerm.terms[term].dynload) {
                cfg.dataRule = cfg.dataRule.split(";")[0];
            }
            var hbl = "{" + this.termName.toUpperCase() + "}";
            if (cfg.dataSrcType != 2) {
                cfg.dataRule = cfg.dataRule.toUpperCase().replace(new RegExp(hbl, "ig"), thisVal);
                cfg.dataRule = cfg.dataRule.toUpperCase().replace(
                    new RegExp("{" + this.textName.toUpperCase() + "}", "ig"), thisText);
            }
            if (cfg.dataSrcType == 1) {
                cfg.dataRule = this.metaTerm.terms[term].replaceMacroVar(cfg.dataRule);
            }
            if (cfg.dataSrcType == 2) {
                if (cfg.classRuleParams && typeof (cfg.classRuleParams) == "function") {
                    cfg.classRuleParams = cfg.classRuleParams();
                }
            }
            if (this.metaTerm.terms[term]) {
                cfg.constantSql = this.metaTerm.terms[term].constantSql;
            }
            cfms[cfms.length] = cfg;
            flashTerms[term] = this.metaTerm.terms[term]; // 将满足刷新的条件存起来
            this.metaTerm.terms[term].render();
        }
    }
    if (cfms.length == 0)
        return;
    // 请求服务器数据
    TermControlAction.getTermsData(cfms, function(res) {
        if (res == null || res == "null" || res[0] == "false") {
            alert("级联读取条件控件数据失败,msg：" + (res && res.sort ? res[1] : res));
            return false;
        }
        // 绑定对象值
        for ( var termName in flashTerms) {
            flashTerms[termName]._dealServerAttribute(res[termName]);
            if (!flashTerms[termName].codeInited && res[termName])
                flashTerms[termName].bindData(res[termName][1], true);
        }
        flashTerms = null;
    });
};

/**
 * 获取输入对象 根据条件类型返回不同对象 0:文本框 1:combo 2:tree 3:calendar
 *
 * @param index:索引或者绑定时指定的ID
 * @memberOf {meta.term.termControl}
 */
meta.term.termControl.prototype.getInputObj = function(index) {
    if (typeof index == "string") {
        index = this._bindObjs[index];
    }
    if (!index || index < 0 && index >= this.bindObjs.length)
        index = 0;
    switch (this.termType) {
        case 0:
            return this.bindObjs[index];
        case 1:// combo
            return this.combo[this.bindObjs[index].id];
        case 2:// tree
            return this.selTree;
        case 3://
            return this.myCalendar;
    }
};
/**
 * 设置返回值类型 0:数字 1字符串 2:日期对象
 *
 * @memberOf {meta.term.termControl}
 */

meta.term.termControl.prototype.setValueType = function(valueType) {
    this.valueType = valueType ? valueType : 1;
};
/**
 * 设置条件值
 *
 * @param index:索引或者绑定时指定的ID,不指定则重置所有的绑定对象
 * @memberOf {meta.term.termControl}
 * @param value
 */
meta.term.termControl.prototype.setValue = function(value_, index) {
    var Specified = !(index == undefined);
    if (typeof index == "string") {
        index = this._bindObjs[index];
        if (!index)
            index = 0;
    }
    if (Specified) {
        Specified = (index >= 0 && index < this.bindObjs.length)
    }
    switch (this.termType) {
        case 0:
            if (Specified)
                this.bindObjs[index].value = value_;
            else
                for ( var i = 0; i < this.bindObjs.length; i++)
                    this.bindObjs[i].value = value_;
            break;
        case 1:
            if (value_!=null && value_!=undefined && value_.sort && this.mulSelect) {
                if (Specified) {
                    var combo = this.combo[this.bindObjs[index].id];
                    var checked_array = combo.getChecked();
                    for ( var i = 0; i < checked_array.length; i++) {
                        combo.setCheckedByValue(checked_array[i], false);
                    }
                    for ( var x = 0; x < value_.length; x++) {
                        var v = value_[x];
                        if (!v.sort)
                            v = [ v ];
                        combo.setCheckedByValue(v[0]);
                    }
                    checked_array = combo.getChecked();
                    var txt = "";
                    var checked_array = combo.getChecked();
                    for ( var i = 0; i < checked_array.length; i++) {
                        if (i)
                            txt += ",";
                        txt += combo.getOption(checked_array[i]).text;
                    }
                    combo.setComboText(txt);
                } else {
                    for ( var n = 0; n < this.bindObjs.length; n++) {
                        var combo = this.combo[this.bindObjs[n].id];
                        var checked_array = combo.getChecked();
                        for ( var i = 0; i < checked_array.length; i++) {
                            combo.setCheckedByValue(checked_array[i], false);
                        }
                        for ( var x = 0; x < value_.length; x++) {
                            var v = value_[x];
                            if (!v.sort)
                                v = [ v ];
                            combo.setCheckedByValue(v[0]);
                        }
                        checked_array = combo.getChecked();
                        var txt = "";
                        var checked_array = combo.getChecked();
                        for ( var i = 0; i < checked_array.length; i++) {
                            if (i)
                                txt += ",";
                            txt += combo.getOption(checked_array[i]).text;
                        }
                        combo.setComboText(txt);
                    }
                }
            } else if (value_!=null && value_!=undefined && value_.sort && !this.mulSelect) {
                if (Specified) {
                    var comboId = this.bindObjs[index].id;
                    for ( var i = 0; i < this.combo[comboId].optionsArr.length; i++) {
                        if (this.combo[comboId].optionsArr[i].value == value_[0]) {
                            this.bindObjs[index].value = value_[1];
                            this.combo[comboId].selectOption(i);
                            break;
                        }
                    }
                    this.bindObjs[index].setAttribute("code", this.combo[comboId].getSelectedValue());
                } else {
                    for ( var n = 0; n < this.bindObjs.length; n++) {
                        var comboId = this.bindObjs[n].id;
                        for ( var i = 0; i < this.combo[comboId].optionsArr.length; i++) {
                            if (this.combo[comboId].optionsArr[i].value == value_[0]) {
                                this.bindObjs[n].value = value_[1];
                                this.combo[comboId].selectOption(i);
                                break;
                            }
                        }
                        this.bindObjs[n].setAttribute("code", this.combo[comboId].getSelectedValue());
                    }
                }
            }
            break;
        case 2:
            var checkIdStr = this.selTree.tree.getAllChecked();
            checkIdStr = checkIdStr.split(",");
            for ( var i = 0; i < checkIdStr.length; i++) {
                this.selTree.tree.setCheck(checkIdStr[i], false);
            }
            if (value_!=null && value_!=undefined && value_.sort && this.mulSelect) {

                for ( var x = 0; x < value_.length; x++) {
                    var v = value_[x];
                    if (!v.sort)
                        v = [ v ];
                    this.selTree.tree.setCheck(this.selTree._priFix + v[0], true);
                    this.selTree.tree.selectItem(this.selTree._priFix + v[0]);
                }
                var _checkIdStr = this.selTree.tree.getAllChecked();
                checkIdStr = _checkIdStr.split(",");
                if (Specified) {
                    var inputObj = this.bindObjs[index];
                    inputObj.value = "";
                    inputObj.checkIds = {};
                    for ( var i = 0; i < checkIdStr.length; i++) {
                        inputObj.checkIds[checkIdStr[i]] = this.selTree.tree.getItemText(checkIdStr[i]).replace(new RegExp("&gt;","ig"),">").replace(new RegExp("&lt;","ig"),"<");
                        if (inputObj.value)
                            inputObj.value += "," + inputObj.checkIds[checkIdStr[i]];
                        else
                            inputObj.value = inputObj.checkIds[checkIdStr[i]];
                    }
                    this.bindObjs[index].setAttribute("code", _checkIdStr);
                } else {
                    for ( var n = 0; n < this.bindObjs.length; n++) {
                        var inputObj = this.bindObjs[n];
                        inputObj.value = "";
                        inputObj.checkIds = {};
                        for ( var i = 0; i < checkIdStr.length; i++) {
                            inputObj.checkIds[checkIdStr[i]] = this.selTree.tree.getItemText(checkIdStr[i]).replace(new RegExp("&gt;","ig"),">").replace(new RegExp("&lt;","ig"),"<");
                            if (inputObj.value)
                                inputObj.value += "," + inputObj.checkIds[checkIdStr[i]];
                            else
                                inputObj.value = inputObj.checkIds[checkIdStr[i]];
                        }
                        this.bindObjs[n].setAttribute("code", _checkIdStr);
                    }
                }
            } else if (value_!=null && value_!=undefined && value_.sort && !this.mulSelect) {
                this.selTree.tree.selectItem(this.selTree._priFix + value_[0]);
                if (Specified) {
                    this.bindObjs[index].setAttribute("code", this.selTree._priFix + value_[0]);
                    this.bindObjs[index].value = this.selTree.tree.getSelectedItemText();
                } else {
                    for ( var i = 0; i < this.bindObjs.length; i++) {
                        this.bindObjs[i].setAttribute("code", this.selTree._priFix + value_[0]);
                        this.bindObjs[i].value = this.selTree.tree.getSelectedItemText();
                    }
                }
            }
            break;
        case 3:
            this.myCalendar.setDate(formatNumDate(value_));
            if (Specified) {
                this.bindObjs[index].value = this.myCalendar.getDate(true);
                this.bindObjs[index].setAttribute("code", this.myCalendar.getDate());
            } else {
                for ( var i = 0; i < this.bindObjs.length; i++) {
                    this.bindObjs[i].value = this.myCalendar.getDate(true);
                    this.bindObjs[i].setAttribute("code", this.myCalendar.getDate());
                }
            }
            break;
    }
};
/**
 * 根据termType和是否多选模式，返回不同的数据结构 0文本框：返回字符串 1下拉框：多选二维数组，单选一维数组，没选null 2下拉树：多选二维数组，单选一维数组，没选null 3日历框：返回字符串
 *
 * @param index:索引或者绑定时指定的ID
 * @memberOf {meta.term.termControl}
 */
meta.term.termControl.prototype.getValue = function(index) {
    if (!this.inited) {// 如果自身未被初始或条件包也未被初始，则返回默认值
        if (this.termType == 0 || this.termType == 3)
            return this.defaultValue.join(",");
        return this.defaultValue;
    }
    if (typeof index == "string") {
        index = this._bindObjs[index];
    }
    if (!index || index < 0 && index >= this.bindObjs.length)
        index = 0;
    switch (this.termType) {
        case 0:
            return this.bindObjs[index].value;
        case 1:// combo
            if (this.mulSelect) {
                var res = [];
                var checked_array = this.combo[this.bindObjs[index].id].getChecked();
                for ( var i = 0; i < checked_array.length; i++) {
                    var op = this.combo[this.bindObjs[index].id].getOption(checked_array[i]);
                    res[i] = op.optionData;
                }
                return res.length > 0 ? res : null;
            } else {
                var idx = this.combo[this.bindObjs[index].id].getSelectedIndex();
                if (index >= 0) {
                    var op = this.combo[this.bindObjs[index].id].getOptionByIndex(idx);
                    if(op)
                        return op.optionData;
                }
                return null;
            }
        case 2:// tree
            if (this.mulSelect) {
                var ids = this.bindObjs[index].getAttribute("code");
                if (ids && ids != "") {
                    ids = ids.split(",");
                    var list = [];
                    var flag = this.selTree._dynLoadFlag && this.selTree._childCnt;
                    for ( var ii = 0; ii < ids.length; ii++) {
                        var data = new Array();
                        data[0] = ids[ii].replace(this.selTree._priFix, "");
                        data[1] = this.selTree.tree.getItemText(ids[ii]).replace(new RegExp("&gt;","ig"),">").replace(new RegExp("&lt;","ig"),"<");
                        for ( var i = 2;; i++) {
                            if (flag && i == 3)
                                continue;
                            var d = this.selTree.tree.getUserData(ids[ii], "USER_DATA_" + i);
                            if (d == null)
                                break;
                            data[data.length] = d;
                        }
                        list[list.length] = data;
                    }
                    return list;
                }
                return null;
            } else {
                var id = this.bindObjs[index].getAttribute("code");
                if (id != null && id != undefined && id != "")
                    return this.selTree.getItemValue(id);
                return null;
            }
        case 3:
            return this.bindObjs[index].value;
        case 4:
            if (this.mulSelect) {
                var codeMap = this.bindObjs[index].codeMap || {};
                var arr = [];
                for(var vk in codeMap){
                    arr[arr.length] = [vk,codeMap[vk]];
                }
                if(arr.length>0)return arr;
                return null;
            }else{
                return this.bindObjs[index].getAttribute("code");
            }
    }
    return this.defaultValue;
};
/**
 * 设置输入框宽度
 *
 * @memberOf {meta.term.termControl}
 * @param width
 */
meta.term.termControl.prototype.setWidth = function(width, id) {
    this.termWidth = parseInt(width);
    if (!this.termWidth)
        this.termWidth = 100;
    if (!this.srcElementId)
        this.srcElementId = this.bindObjs[0].id;
    if (!id)
        id = this.srcElementId;
    $(id).style.width = width + "px";
    if (this.termType == 1 && this.combo && this.combo[id])
        this.combo[id].setSize(this.termWidth);
};
/**
 * 设置输入框高度
 *
 * @memberOf {meta.term.termControl}
 * @param h
 */
meta.term.termControl.prototype.setHeight = function(h, id) {
    this.termHeight = parseInt(h);
    if (!this.termHeight)
        this.termHeight = 22;
    if (!this.srcElementId)
        this.srcElementId = this.bindObjs[0].id;
    if (!id)
        id = this.srcElementId;
    $(id).style.height = h + "px";
    if (this.termType == 1 && this.combo && this.combo[id]){
        this.combo[id].DOMelem.style.height=this.termHeight+"px";
        this.combo[id].DOMelem_input.style.height = this.termHeight+'px';
        this.combo[id].DOMelem_button.style.top = (this.termHeight-20)/2+'px';
    }
};
/**
 * 设置下拉树浮动层宽度
 *
 * @memberOf {meta.term.termControl}
 * @param width
 * @param height
 */
meta.term.termControl.prototype.setListWidth = function(width, height, id) {
    this.listWidth = parseInt(width) ? parseInt(width) : 100;
    this.listHeight = parseInt(height) ? parseInt(height) : 100;
    if (!this.srcElementId)
        this.srcElementId = this.bindObjs[0].id;
    if (!id)
        id = this.srcElementId;
    switch (this.termType) {
        case 1:
            if (this.combo[id]) {
                this.combo[id].setOptionWidth(this.listWidth);
                this.combo[id].setOptionHeight(this.listHeight);
            }
            break;
        case 2:
            this.listWidth = parseInt(width) ? parseInt(width) : 100;
            this.listHeight = parseInt(height) ? parseInt(height) : 150;
            if (this.selTree)
                this.selTree.setListSize(this.listWidth, this.listHeight);
            break;
    }
};

/**
 * 创建一个条件对象（重要）
 *
 * @memberOf {meta.term}
 * @param parentDiv
 * @param termName
 * @param valueChangeCall
 */
meta.term.prototype.createTermControl = function(parentDiv, termName, valueChangeCall) {
    termName = termName.toUpperCase();
    if (this.terms[termName])
        return this.terms[termName];
    this.terms[termName] = new meta.term.termControl(parentDiv, termName, valueChangeCall);
    this.terms[termName].metaTerm = this;
    return this.terms[termName];
};
/**
 * 获取单个控件
 *
 * @memberOf {meta.term}
 * @param termName
 */
meta.term.prototype.getTermControl = function(termName) {
    termName = termName.toUpperCase();
    if (this.terms[termName])
        return this.terms[termName];
    return null;
};
/**
 * 获取输入对象 根据条件类型返回不同对象 0:文本框 1:combo 2:tree 3:calendar
 *
 * @param {Object}
    *            termName
 * @memberOf {meta.term}
 * @return {TypeName}
 */
meta.term.prototype.getTermInputObj = function(termName) {
    termName = termName.toUpperCase();
    if (this.terms[termName])
        return this.terms[termName].getInputObj();
    return null;
};
/**
 * 设置单个条件值
 *
 * @memberOf {meta.term}
 * @param termName
 * @param value
 */
meta.term.prototype.setTermValue = function(termName, value) {
    termName = termName.toUpperCase();
    if (!this.terms[termName])
        return null;
    return this.terms[termName].setValue(value);
};
/**
 * 获取单个条件值
 *
 * @memberOf {meta.term}
 * @param termName
 */
meta.term.prototype.getTermValue = function(termName) {
    termName = termName.toUpperCase();
    if (!this.terms[termName])
        return null;
    return this.terms[termName].getValue();

};
/**
 * 清空控件
 * @param saveData 是否保留数据
 */
meta.term.prototype.clearValue = function(saveData) {
    for ( var tm in this.terms) {
        this.terms[tm].clearValue(saveData);
    }
};

/**
 * 获取所有条件值
 *
 * @memberOf {meta.term}
 */
meta.term.prototype.getAllValue = function() {
    var res = {};
    for ( var termName in this.terms) {
        var val = this.terms[termName].getValue();
        res[termName] = val;
    }
    return res;
};
/**
 * 获取单个条件值 简单格式，单选字符串，多选"，"分割的字符串
 *
 * @memberOf {meta.term.termControl}
 */
meta.term.termControl.prototype.getKeyValue = function(index) {
    var val = this.getValue(index);
    if (this.termType == 1 || this.termType == 2 || this.termType==4) {
        val = val || [];
        if (this.mulSelect) {
            for ( var i = 0; i < val.length; i++) {
                val[i] = val[i][0];
            }
            val = val.join(",");
        } else {
            if(val.sort)
                val = (val[0] != null && val[0] != undefined) ? val[0] : "";
        }
    }
    return val;
};
/**
 * 获取所有条件控件的值（简单格式）
 *
 * @memberOf {meta.term}
 */
meta.term.prototype.getKeyValue = function() {
    var res = {};
    for ( var termName in this.terms) {
        res[termName] = this.terms[termName].getKeyValue();
    }
    return res;
};
/**
 * 绘制条件框
 *
 * @memberOf {meta.term}
 * @param termName
 */
meta.term.prototype.render = function(termName) {
    if (termName && this.terms[termName])
        return this.terms[termName].render();
    for ( var termName in this.terms) {
        this.terms[termName].render();
    }
};
/**
 * 统一初始化各条件控件对象，打包数据请求， 回调函数传入参数：各条件控件值map<termName,vlaue>,附加值map<termName,[附加值数组，下拉框和下拉树可能存在]>
 *
 * @param {Object}
    *            callBackFun(termVals,termAppendVals)
 * @return {TypeName} 是否初始化成功
 * @memberOf {meta.term}
 */
meta.term.prototype.init = function(callBackFun) {
    try {
        var cfms = [];
        for ( var termName in this.terms) {
            this.terms[termName].defValPathInited=false;
            this.terms[termName].render();
            this.terms[termName].clearValue();
            if (this.terms[termName].initType == 0) {
                this.terms[termName].bindObjs[0].value = (this.terms[termName].defaultValue[0]||"");
            }
            // if(this.terms[termName].dataSrcType==0){
            // this.terms[termName].init();
            // continue;
            // }
            if (this.terms[termName].initType == 2) {
                if (window["getCodeArrayByRemoveValue"]) {
                    var codes = window["getCodeArrayByRemoveValue"](this.terms[termName].codeType,
                        this.terms[termName].excludeValues);
                    if (codes && codes.length > 0) {
                        this.terms[termName].bindData(codes);
                        this.terms[termName].codeInited = true;
                        this.terms[termName].inited = true;
                    } else {
                        this.terms[termName].dataSrcType = 2;
                    }
                } else {
                    this.terms[termName].dataSrcType = 2;
                }
            }
            if(this.terms[termName].termType==4){
                if(this.terms[termName].defaultValue.length>0)  {
                    this.terms[termName].tableLoaded = 0;
                    var thisO = document.getElementById(this.terms[termName].srcElementId);
                    var codeMap = {};
                    for(var i=0;i<this.terms[termName].defaultValue.length;i++){
                        codeMap[this.terms[termName].defaultValue[i]] = 0;
                    }
                    thisO.codeMap = codeMap;
                    thisO.setAttribute("code",this.terms[termName].defaultValue.join(","));
                    thisO.value = "";
//                    document.getElementById("termkwd_"+this.terms[termName].bindObjs[0].id).value = thisO.getAttribute("code");
                    if(this.terms[termName].defaultValue.length>this.terms[termName].myDataTable.Page.pageSize){
                        this.terms[termName].myDataTable.setPageSizeOptions(this.terms[termName].defaultValue.length,1);
                    }
                    this.terms[termName].initMyDataTable(1);
                }
                this.terms[termName].bindDataCall(this.terms[termName]);
                this.terms[termName].inited = true;
                continue;
            }

            var index = cfms.length;
            var cfg = this.terms[termName].getConfig();
            if (cfg.dataSrcType == 1) {
                cfg.dataRule = this.terms[termName].replaceMacroVar(cfg.dataRule);
            }
            if (cfg.dataSrcType == 2) {
                if (cfg.classRuleParams && typeof (cfg.classRuleParams) == "function") {
                    cfg.classRuleParams = cfg.classRuleParams();
                }
            }

            cfg.value = this.terms[termName].getValue();
            if (cfg.value && cfg.value.sort)
                cfg.value = cfg.value.join(",");
            if (this.terms[termName].constantSql) {
                cfg.constantSql = this.terms[termName].constantSql;
            }
            cfms[index] = cfg;
        }
        if (cfms.length == 0){
            if (callBackFun) {
                var termVals = this.getAllValue();
                callBackFun(termVals, this);
            }
            return true;
        }
        // 请求服务器数据
        var thatTerm = this;
        TermControlAction.getTermsData(cfms, function(res) {
            if (res == null || res == "null" || res[0] == "false") {
                alert("读取条件控件数据失败,msg：" + (res && res.sort ? res[1] : res));
                return false;
            }
            // 绑定对象值
            for ( var termName in thatTerm.terms) {
                if(thatTerm.terms[termName].termType==4)continue;
                thatTerm.terms[termName]._dealServerAttribute(res[termName]);
                if (!thatTerm.terms[termName].codeInited && res[termName])
                    thatTerm.terms[termName].bindData(res[termName][1]);
                else if (thatTerm.terms[termName].dataSrcType == 0 && thatTerm.terms[termName].dataRule)
                    thatTerm.terms[termName].bindData(thatTerm.terms[termName].dataRule);
                thatTerm.terms[termName].inited = true;
            }
            thatTerm.inited = true;
            if (callBackFun) {
                var termVals = thatTerm.getAllValue();
                callBackFun(termVals, thatTerm);
            }
            thatTerm = null;
        });
        return true;
    } catch (ex) {
        if (typeof ex == "string") {
            alert(ex);
        } else {
            var msg = "";
            for ( var key in ex)
                if (ex[key])
                    msg += key + ":" + ex[key] + "\n";
            alert(msg);
        }
        return false;
    }
};
/**
 * 单个条件销毁方法
 *
 * @memberOf {meta.term.termControl}
 */
meta.term.termControl.prototype.destructor = function() {
    if (this.myCalendar) {
        Destroy.destructorDHMLX(this.myCalendar);
        this.myCalendar = null;
        delete this.myCalendar;
    }
    if (this.combo) {
        for ( var comboId in this.combo) {
            this.combo[comboId].clearAll(true);
            Destroy.destructorDHMLX(this.combo[comboId]);
            this.combo[comboId] = null;
            delete this.combo[comboId];
        }
        this.combo = null;
        delete this.combo;
    }
    if (this.selTree) {
        this.selTree.destructor();
        this.selTree = null;
        delete this.selTree;
    }
    if (this.myDataTable){
        this.myDataTable.destructor();
        this.myDataTable = null;
        delete this.myDataTable;

        document.body.removeChild(this.myTabDiv);
        this.myTabDiv = null;
        delete this.myTabDiv;

        this.dataTableKwd = null;
        delete this.dataTableKwd;
    }
    this.srcElementId = null;
    this.metaTerm = null;
    delete this.metaTerm;
    this.bindObjs = [];
    this._bindObjs = {};
    this.readered = false;
};
/**
 * 销毁一个请求包内所有条件
 *
 * @memberOf {meta.term}
 */
meta.term.prototype.destructor = function(term) {
    if (term) {
        if (this.terms[term]) {
            this.terms[term].destructor();
            this.terms[term] = null;
            delete this.terms[term];
        }
    } else {
        for ( var termName in this.terms) {
            if (this.terms[termName]) {
                this.terms[termName].destructor();
                this.terms[termName] = null;
                delete this.terms[termName];
            }
        }
    }
};
/**
 * 私有方法 绑定树数据
 *
 * @memberOf {meta.term.termControl}
 * @param data
 * @param rootId
 */
meta.term.termControl.prototype.bindTreeData = function(data, rootId) {
    if (data.length == 0)
        return;
    if (this.dynload == 0)
        this.selTree.clearData();
    var selId = this.selTree.tree.getSelectedItemId();
    if (selId)
        selId = selId.split("_")[2];
    var lastNodeId = "";
    this.selTree.appendData(data, this.bindDataBeforeCall, this);
    if (!this.dynload)
        this.selTree.tree.closeAllItems(rootId ? rootId : this.selTree.tree.rootId);
    this.selTree.inited = true;
};
/**
 * 私有方法，打开树节点
 *
 * @memberOf {meta.term.termControl}
 * @param itemId
 */
meta.term.termControl.termTreeListOpenItem = function(itemId) {
    var selTree = this.selTree;
    var term = selTree.termControl;
    selTree.tree.openItem(itemId);
    return true;
};
/**
 * 私有方法 条件 下拉树 单击异步刷新
 *
 * @memberOf {meta.term.termControl}
 */
meta.term.termControl.termTreeListFlashClk = function(id, id2) {
    // Debug("onClick");
    var selTree = this.selTree;
    var term = selTree.termControl;
    return meta.term.termControl.termTreeListFlash(id, "onClick", term);
};
/**
 * 私有方法 条件 下拉树 选择异步刷新
 *
 * @memberOf {meta.term.termControl}
 * @param id
 */
meta.term.termControl.termTreeListFlashSel = function(id) {
    // Debug("onSelect");
    var selTree = this.selTree;
    var term = selTree.termControl;
    return meta.term.termControl.termTreeListFlash(id, "onSelect", term);
};
/**
 * 私有方法 条件 下拉树 双击异步刷新
 *
 * @memberOf {meta.term.termControl}
 * @param id
 */
meta.term.termControl.termTreeListFlashDbl = function(id) {
//     Debug("onDblClick");
    var selTree = this.selTree;
    var term = selTree.termControl;
    return meta.term.termControl.termTreeListFlash(id, "onDblClick", term);
};
/**
 * 条件 下拉树 异步刷新
 *
 * @param id
 * @param type
 * @param term
 * @memberOf {meta.term.termControl}
 */
meta.term.termControl.termTreeListFlash = function(id, type, term) {
    if (!term)
        term = this.selTree.termControl;
    if (!term.dynload)
        return true;
    var selTree = term.selTree;
    var itm = selTree.tree._globalIdStorageFind(id);
    if (!itm)
        return;
//    if (itm.childsCount) {
//        selTree.tree.setUserData(id, "refresh", "true");
//    }
    if (type == "onDblClick") {
        meta.term.termControl.termTreeListSelect(id, term);
        term.selTree.tree.closeItem(id);
    }
    if(selTree.refreshFlag[id]){
        return true;
    }
//    if (selTree.tree.getUserData(id, "refresh")) {
//        return true;
//    }
    // if(term.selTree.tree.hasChildren(id))return true;
    if (id == term.selTree.tree.rootId)
        return;
    // Debug("type:"+type+" onOpenStart id="+id);
    selTree.refreshFlag[id]=true;
//    selTree.tree.setUserData(id, "refresh", "true");
    var thisCfm = term.getConfig();
    if (thisCfm.dataSrcType == 1) {
        thisCfm.dataRule = thisCfm.dataRule.split(";")[1];
        if (!thisCfm.dataRule)
            return;
        thisCfm.dataRule = thisCfm.dataRule.replace(new RegExp("{" + thisCfm.termName + "}", "ig"), (id + "").replace(
            selTree._priFix, ""));
        thisCfm.dataRule = term.replaceMacroVar(thisCfm.dataRule);
    } else if (thisCfm.dataSrcType == 2) {
        if (thisCfm.classRuleParams && typeof (thisCfm.classRuleParams) == "function") {
            thisCfm.classRuleParams = thisCfm.classRuleParams();
        }
        thisCfm.parentID = (id + "").replace(selTree._priFix, ""); // 父ID
    }
    // thisCfm.value=term.getValue();
    TermControlAction.getTermData(thisCfm, function(res) { // 异步刷新数据
        term.selTree.tree.openItem(id);
        term.selTree.tree.closeItem(id);
        if (res == null || res == "null" || res[0] == "false") {
            alert("读取条件控件数据失败,msg：" + (res && res.sort ? res[1] : res));
            return false;
        }
        // term._dealServerAttribute(res);
        term.bindTreeData(res[1], id);
        term.selTree.tree.openItem(id);
        term.bindDataCall(term);
    });
};
/**
 * 私有方法，处理后台附加数据和回填属性 res一般直接来自服务端返回数据是一个至少包含2个，之多包含4个元素的数组，其中： res[0] 是执行成功标识，一般能调用此方法,其值都为'true' res[1] 具体数据，其值是二维数组
 * res[2] 服务器端需要回填给客户端条件的改变属性值，为map对象 res[3] 动态树条件特有，存放默认值的Path，动态加载时会按照其Path依次初始数据
 *
 * @memberOf {meta.term.termControl}
 */
meta.term.termControl.prototype._dealServerAttribute = function(res) {
    if (res && res.sort && res.length >= 3) {
        var attrs_ = res[2];// 暂定为map，其键合前台传入后台的config对象的键一样对应
        dhx.extend(this, attrs_, true);// 覆盖对象属性（实现回填)
        if (res.length == 4) {
            var appendData = res[3];
            if (appendData && this.serverAppendDataCall && typeof (this.serverAppendDataCall) == "function") {
                this.serverAppendDataCall(appendData, this);
            }
        }
    }
};
/**
 * 选择下拉树值
 *
 * @memberOf {meta.term.termControl}
 * @param id
 * @param term
 * @param unCall
 */
meta.term.termControl.termTreeListSelect = function(id, term, unCall) {
    if (!term)
        term = this.selTree.termControl;
    if (!(term instanceof meta.term.termControl))
        term = term.selTree.termControl;
    var selTree = term.selTree;
    if (!term.srcElementId)
        term.srcElementId = term.bindObjs[0].id;
    var inputObj = $(term.srcElementId);
    if (term.mulSelect) {
        if (!inputObj.checkIds)
            inputObj.checkIds = {};
        selTree.tree.setCheck(id, !inputObj.checkIds[id]);
        meta.term.termControl.termTreeCheck(id, !inputObj.checkIds[id], term, unCall);
    } else {
        var db=selTree.getItemValue(id);
        if(!meta.term.termControl.dimRightCheck(db,term,3)){//无权限或不允许选择
            var val = $(term.srcElementId).getAttribute("code");
            selTree.tree.selectItem(val);
//	        selTree.tree.focusItem(val);
            return true;
        }
        var val = selTree.tree.getSelectedItemText();
        inputObj.value = val;// selTree.getItemValue(id);
        var change_ = inputObj.getAttribute("code") == id;
        inputObj.setAttribute("code", id);
        selTree.box.style.display = "none";
        if (!change_ && !unCall)
            term.valueChange();
    }
    return false;
};
/**
 * 下拉树选择刷新
 *
 * @memberOf {meta.term.termControl}
 * @param id
 * @param state
 * @param term
 * @param unCall
 */
meta.term.termControl.termTreeCheck = function(id, state, term, unCall) {
    if (!term)
        term = this.selTree.termControl;
    //check时自动动态加载下级
//    if (term.dynload)
//        meta.term.termControl.termTreeListFlash(id, "", term);
    if (!term.srcElementId)
        term.srcElementId = term.bindObjs[0].id;
    var inputObj = $(term.srcElementId);
    if (!inputObj.checkIds)
        inputObj.checkIds = {};
    Destroy.clearVarVal(inputObj.checkIds);
    var selTree = term.selTree;
    var checkIdStr = selTree.tree.getAllChecked();
    var change_ = inputObj.getAttribute("code") == checkIdStr;
    inputObj.setAttribute("code", checkIdStr);
    inputObj.value = "";
    if (!checkIdStr) {
        if (!change_ && !unCall)
            term.valueChange();
        return;
    }
    checkIdStr = checkIdStr.split(",");
    for ( var i = 0; i < checkIdStr.length; i++) {
        inputObj.checkIds[checkIdStr[i]] = selTree.tree.getItemText(checkIdStr[i]).replace(new RegExp("&gt;","ig"),">").replace(new RegExp("&lt;","ig"),"<");
        if (inputObj.value)
            inputObj.value += "," + inputObj.checkIds[checkIdStr[i]];
        else
            inputObj.value = inputObj.checkIds[checkIdStr[i]];
    }
    if (!change_ && !unCall)
        term.valueChange();
};
/**
 * 当树与el绑定显示时，选中el上绑定的值
 *
 * @param el
 */
meta.term.termControl.showTreeBindCheck = function(el) {

    var selTree = el.selTree;// selectTree;
    if (!selTree || !selTree.termControl)
        return;
    if (!selTree.termControl.mulSelect) {
        var val = el.getAttribute("code");
        selTree.tree.selectItem(val);
        selTree.tree.focusItem(val);
        return;
    }
    var checkIdStr = selTree.tree.getAllChecked();
    checkIdStr = checkIdStr.split(",");
    for ( var i = 0; i < checkIdStr.length; i++) {
        selTree.tree.setCheck(checkIdStr[i], false);
    }
    checkIdStr = el.getAttribute("code");
    if (!checkIdStr)
        return;
    checkIdStr = checkIdStr.split(",");
    for ( var i = 0; i < checkIdStr.length; i++) {
        selTree.tree.setCheck(checkIdStr[i], true);
        selTree.tree.selectItem(checkIdStr[i], false, false);
    }
    selTree.tree.focusItem(el.selectTree.tree.getSelectedItemId());
};