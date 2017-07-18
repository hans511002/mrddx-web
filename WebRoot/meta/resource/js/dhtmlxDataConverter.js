/******************************************************
 *Copyrights @ 2011，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *         dhtmlxDataConverte.js
 *Description：
 *          Dhtmlx数据转换js，转换给符合JSON格式的数据结构。
 *Dependent：
 *          Dwr 的JS文件，如util.js和engine.js 以及dhmtlx.js
 *Author:
 *        张伟
 *Finished：
 *       2011-9-28
 *Modified By：
 *
 * Modified Date:
 *
 * Modified Reasons:

 ********************************************************/
/**
 * 各种数据转换器基类，提供转换器的基本属性和基本方法。
 * 可覆盖的属性如下：
 * isFormatColumn:是否进行列名格式化,默认为true
 * 不可覆盖和方法属性如下：
 * isConverter：标记是否是一个转换器，用于识别转换器对象，默认不可更改
 *  _getRowData：获取数据中的一行，final型，不可强制重写。
 *  该类实现了继承的基本方法，即所有的converter转换器都继承与用户所传的confug对象
 *  用于替换自身的默认实现。
 *
 *  此类类似于JAVA中的抽象类，单独使用无意义。
 * @param config
 */
var baseConverter = function (config) {
    //是否进行列名格式化
    this.isFormatColumn = true;
    if (config) {
        dhx.extend(this, config, true);
    }
    this.isConverter = true;
    //设置列名格式化的属性
    this.setIsFormatColumn = function (isFormatColumn) {
        this.isFormatColumn = isFormatColumn;
    }
    /**
     * 格式化一行数据
     * @param data
     */
    this._getRowData = function (data, rowIndex) {
        if (this.isFormatColumn) {
            var rowData = {};
            //获取行数据
            for (var key in data[rowIndex]) {
                rowData[Tools.tranColumnToJavaName(key)] = data[rowIndex][key];
            }
            return rowData;
        }
        return data[rowIndex];
    }

}
/**
 * 转换之前的回调函数，可以对数据进行整理，显示返回data
 * @param data
 */
baseConverter.prototype.onBeforeConverted = function (data) {
    return data;
}
/**
 * 列名转换器，将指定列名转换为驼峰格式的命名风格，即第一个字母小写，下划线分隔的第一个字母大写。
 *
 */
var columnNameConverter = function () {
    dhx.extend(this, new baseConverter(), true);
    /**
     * 转换核心函数。
     * @param data 数据列表，数据格式为一个数组，数组里面包含行对象，用JSON数据格式表示为
     * [{id:1,name:"张三"},{id:2，name:"解决"}]
     */
    this.convert = function (data) {
        data = this.onBeforeConverted(data) || data;
        var tempData = dhx.isArray(data) ? data : [data];
        if (tempData) {
            var converts = [];
            for (var i = 0; i < tempData.length; i++) {
                var convert = {};
                var row = tempData[i];
                for (var key in row) {
                    var value = row[key];
                    delete row[key];
                    key = Tools.tranColumnToJavaName(key);
                    convert[key] = value;
                }
                converts.push(convert);
            }
        }
        return dhx.isArray(data) ? converts : converts[0];
    }
}

/**
 * 远程校验转换器，将boolean类型转换为符合远程验证规定格式数据结构
 * 此转换器在服务器返回true和false的情况下使用。
 * @param invalidMessage 远程验证失败的提示信息。
 */
var remoteConverter = function (invalidMessage) {
    dhx.extend(this, new baseConverter(), true);
    this.convert = function (data) {
        data = this.onBeforeConverted(data) || data;
        if (data == true || data == "true") {
            return true;
        } else {
            return !invalidMessage ? false : invalidMessage;
        }
    }
}

/**
 * dhtmlx Combo数据转换器
 * @param data 数据列表，数据格式为一个数组，数组里面包含行对象，用JSON数据格式表示为
 * [{id:1,name:"张三"},{id:2，name:"解决"}]
 * 此转换器继承于baseConverter，拥有baseConverter的可被继承属性
 *
 * 另此转换器可被继承、重写的属性和方法有：
 * valueColumn：下拉列表Value字段来源字段名。
 * textColumn：下拉列表text字段来源字段名
 * add：是否追加属性，true为追加到现有数据中，false为不追加到现有数据中
 * @param config  converter配置对象，如:
 * config={
 *    valueColumn："id",textColumn:"name", //配置combo数据显示的valueColumn和textColumn字段。
 * }
 */
var dhtmlxComboDataConverter = function (config) {
    //super关键字
    this._super = dhx.extend({}, this, true);
    dhx.extend(this, new baseConverter(config), true);
    //构造super关键字
    /**
     * 转换核心函数,不能被替换
     * @param data 数据列表，数据格式为一个数组，数组里面包含行对象，用JSON数据格式表示为
     * [{id:1,name:"张三"},{id:2，name:"解决"}]
     */
    this.convert = function (data) {
        data = this.onBeforeConverted(data) || data;
        data = dhx.isArray(data) ? data : [data];
        if (data) {
            var complete = {};
            var options = [];
            for (var i = 0; i < data.length; i++) {
                var option = {};
                var rowData = this._getRowData(data, i);
                option.value = rowData[this.valueColumn];
                option.text = this.textFormat(rowData, option.value, rowData[this.textColumn]);
                option.selected = this.isSelected(rowData, i);
                //添加Images属性
                var img = this.optionImage(rowData, i);
                if (img) {
                    option.img_src = img;
                }
                option.checked = this.isChecked(rowData, i);
                if (this.userData(rowData)) {
                    option.userdata = this.userData(rowData);
                }
                options.push(option);
            }
            complete.add = this.isAdd;
            complete.options = options;
            return complete;
        }
        return data;
    }
    /**
     * 设置ValueColumn，java命名风格
     * @param valueColumn
     */
    this.setValueColumn = function (valueColumn) {
        this.valueColumn = valueColumn;
    }
    /**
     * 设置text 来源字段名
     * @param textColumn
     */
    this.setTextColumn = function (textColumn) {
        this.textColumn = textColumn;
    }
    /**
     * 设置属性是否追加。true为追加到现有数据中，false为不追加到现有数据中
     * @param add
     */
    this.setAdd = function (add) {
        this.isAdd = add;
    }
}
/**
 * 钩子函数，判断某行是否选中，默认实现为第一个数据选中。
 * @param rowData 行数据
 * @param rowIndex  行索引
 * @return
 */
dhtmlxComboDataConverter.prototype.isSelected = function (rowData, rowIndex) {
    return rowIndex == 0;
}
/**
 * 钩子函数，提供某行下拉框选中的图片
 * @param rowData  行数据
 * @param rowIndex  行索引
 * @return
 */
dhtmlxComboDataConverter.prototype.optionImage = function (rowData, rowIndex) {
    return null;
}
/**
 * 钩子函数，提供是否显示checkedBox
 * @param rowData 行数据
 * @param rowIndex 行索引
 * @return
 */
dhtmlxComboDataConverter.prototype.isChecked = function (rowData, rowIndex) {
    return 0;
}
/**
 * text格式化
 * @param rowData
 * @param text
 */
dhtmlxComboDataConverter.prototype.textFormat = function (rowData, value, text) {
    return text;
}
/**
 * 设置userData方法。
 * @param rowData
 */
dhtmlxComboDataConverter.prototype.userData = function (rowData) {
    return rowData;
}

/**
 * dataGrid数据查询格式化类，该类提供了一些基本的实现，留下了很多钩子函数
 * 如需在实现过程中需要这些属性，请实现这些函数。datagrid的数据结构、属性较多，具体请参考
 * dhtmlx dataGrid文档<br>
 * @param config  config 对象，此对象中可以设置除convert方法之外的所有提供属性和函数。
 * 用于覆盖默认函数。
 */
var dhtmxGridDataConverter = function (config) {
    this.posStart = -1;
    this.total_count = -1;
    //super关键字
    this._super = dhx.extend({}, this, true);
    dhx.extend(this, new baseConverter(config), true);
    //构造super关键字
    /**
     * 数据转换
     * @param data
     */
    this.convert = function (data) {
        data = this.onBeforeConverted(data) || data;
        if (data) {
            data = dhx.isArray(data) ? data : [data];
            var retuData = {};
            var isSetPageParam = false;//是否设置了分页参数。
            //检查是否设置了分页
            if (this.total_count >= 0 && this.posStart >= 0) {
                retuData.total_count = this.total_count;
                retuData.pos = this.posStart;
                isSetPageParam = true;
            }
            /*列名处理*/
            var colsName = []; // 保存结果集列名
            var rows = [];//行集
            var count = 0;
            //获取查询出的所有列名。
            for (var key in data[0]) {
                colsName[count++] = this.isFormatColumn ? Tools.tranColumnToJavaName(key) : key;
            }
            var startIndex = data[0] && data[0].TOTAL_COUNT_ ? data[0].TOTAL_COUNT_ : -1;
            if (startIndex > 0 && !isSetPageParam) {//查询结果集中有最大数目。
                this.total_count = startIndex;
            }
            var filtercolsName = !(this.filterColumns) ? colsName : this.filterColumns;
            for (var i = 0; i < data.length; i++) {
                var rowData = this._getRowData(data, i);
                if (rowData && rowData.rn && rowData.totalCount) { //从SQL中读取posStart
                    startIndex = (startIndex < rowData.rn) ? startIndex : rowData.rn;
                } else if (rowData && rowData.RN_ && rowData.TOTAL_COUNT_) { //列名未格式化
                    startIndex = (startIndex < rowData.RN_) ? startIndex : rowData.RN_;
                }
                var dataList = [];
                var rowMap = {};
                startIndex = startIndex < 0 ? 1 : startIndex;
                //一行数据进行格式化
                for (var j = 0; j < filtercolsName.length; j++) {
                    var rowValue = rowData[filtercolsName[j]];
                    var cellConfig = this.addCellDataConfig(i + startIndex - 1, j, filtercolsName[j], rowValue, rowData);
                    if (!Tools.isEmptyObject(cellConfig)) {
                        cellConfig.value = this.cellDataFormat(i + startIndex - 1, j, filtercolsName[j], rowValue, rowData);
                        dataList.push(cellConfig);
                    } else {
                        dataList.push(this.cellDataFormat(i + startIndex - 1, j, filtercolsName[j], rowValue, rowData));
                    }
                }
                rowMap.data = dataList;
                rowMap.id = this.getRowID(i + startIndex - 1, rowData);//设置行ID
                //添加行设置
                var temp = this.addRowConfig(i + startIndex - 1, rowData);
                if (!Tools.isEmptyObject(temp)) {
                    dhx.extend(rowMap, temp, true);
                }
                //添加用户数据设置
                var userData = this.userData(i + startIndex - 1, rowData);
                if (!Tools.isEmptyObject(userData)) {
                    rowMap.userdata = userData;
                }
                rows.push(rowMap);
            }
            if (!isSetPageParam && this.total_count >= 0) {//如果为设置起始索引
                retuData.total_count = this.total_count;
                retuData.pos = startIndex - 1;
                this.pos = -1;
                this.total_count = -1;
            }
            retuData.rows = this.rowsDeal(rows);
            //最后添加data设置，这里还可以手动设置分页参数等。
            return this.dataConfig(retuData);
        }
        this.unload = function () {
            this._getRowData = null;
            this._super.addCellDataConfig = null;
            this._super.addRowConfig = null;
            this._super.cellDataFormat = null;
            this._super.dataConfig = null;
            this._super.getRowID = null;
            this._super.posStart = null;
            this._super.rowsDeal = null;
            this._super.total_count = null;
            this._super.userData = null;
            this._super = null;
            this.cellDataFormat = null;
            this.convert = null;
            this.filterColumns = null
            this.idColumnName = null;
            this.isConverter = null
            this.isFormatColumn = null
            this.onBeforeConverted = null
            this.pos = null
            this.posStart = null
            this.setFilterColumns = null;
            this.setIdColumnName = null;
            this.setIsFormatColumn = null;
            this.setPosStart = null;
            this.setTotalCount = null;
            this.total_count = null;
            this.userData = null;
        }
    }
    /**
     * 设置总行数
     * @param total_count
     */
    this.setTotalCount = function (total_count) {
        this.total_count = total_count;
    }

    /**
     * 设置索引起始值。
     * @param posStart
     */
    this.setPosStart = function (posStart) {
        this.posStart = posStart;
    }
    /**
     * 设置列columns集合。
     * @param filterColumns
     */
    this.setFilterColumns = function (filterColumns) {
        this.filterColumns = filterColumns;
    }

    /**
     * 设置主键名称
     * @param idColumnName
     */
    this.setIdColumnName = function (idColumnName) {
        this.idColumnName = idColumnName;
    }
}
/**
 * 在format完成后，进行data最后操作，添加一些属性，比如可以手动添加分页参数
 * @param data  行数据
 * @return
 */
dhtmxGridDataConverter.prototype.dataConfig = function (data) {
    return data;
}

/**
 * 为某一行数据设置用户自定义属性，钩子函数
 * @param rowIndex
 * @param rowData
 * @return
 */
dhtmxGridDataConverter.prototype.userData = function (rowIndex, rowData) {
    return rowData;
}

/**
 * 钩子函数，当所有的行数据格式化完成，进行的回调操作。
 * @param rows list<String,Object> 数据类型
 * @return
 */
dhtmxGridDataConverter.prototype.rowsDeal = function (rows) {
    return rows;
}

/**
 *
 * 钩子函数，对某一个单元格添加属性设置，比如设置此单元格的type，设置此单元格的只读属性等。
 * @param rowIndex
 * @param columnIndex
 * @param columnName
 * @param cellValue
 * @param rowData
 * @return
 */
dhtmxGridDataConverter.prototype.addCellDataConfig = function (rowIndex, columnIndex, columnName, cellValue, rowData) {
    return Tools.EmptyObject;
}

/**
 * 钩子函数，对某一单元格的数据进行格式化。
 * @param rowIndex
 * @param columnIndex   特别说明，如果实现了filterColumns（）方法，这里的columnIndex是filterColumns后的index
 * @param cellValue
 * @param rowData
 * @return
 */
dhtmxGridDataConverter.prototype.cellDataFormat = function (rowIndex, columnIndex, columnName, cellValue, rowData) {
    return cellValue;
}

/**
 * 获取行ID，钩子函数，默认实现无分页直接返回rowIndex，由0开始 ，有分页加上分页参数
 * @param rowIndex
 * @param rowData 行数据
 * @return
 */
dhtmxGridDataConverter.prototype.getRowID = function (rowIndex, rowData) {
    return  !this.idColumnName ? (!(this.total_count >= 0 && this.posStart >= 0) ? dhx.uid()
        : this.posStart + rowIndex) : rowData[this.idColumnName];
}

/**
 *为某一行添加属性，如可添加selected=true
 * @param rowIndex
 * @param rowData
 * @return
 */
dhtmxGridDataConverter.prototype.addRowConfig = function (rowIndex, rowData) {
    return Tools.EmptyObject;
}


/**
 * tree数据格式化类，该类提供了一些基本的实现，留下了很多钩子函数 如需在实现过程中需要这些属性，
 * 请实现这些函数。tree的数据结构、属性较多，具体请参考 dhtmlx tree文档
 * @param config  对象，此对象中可以设置除convert方法之外的所有提供属性和函数。
 * 用于覆盖默认函数。
 */
var dhtmxTreeDataConverter = function (config) {
    this.isTreeGrid = false;
    this.parentNode = undefined;
    //super关键字
    this._super = dhx.extend({}, this, true);
    dhx.extend(this, new baseConverter(config), true);
    /**
     * 主键与行索引的关系映射
     */
    this.idIndexMapping = {};
    /**
     * 转换核心函数,不能被替换
     * @param data 数据列表，数据格式为一个数组，数组里面包含行对象，用JSON数据格式表示为
     * [{id:1,name:"张三"},{id:2，name:"解决"}]
     */
    this.convert = function (data) {
        if (data&&data.length>0) {
            data = this.onBeforeConverted(data) || data;
            data = dhx.isArray(data) ? data : [data];
            var rows = [];
            for (var i = 0; i < data.length; i++) {
                var rowData = this._getRowData(data, i);
                var rowMap = {};
                rowMap.id = this.getNodeID(i, rowData);
                rowMap.text = this.getNodeText(i, rowData);
                var imgs = this.getImages(i, rowData);
                rowMap.im0 = imgs[0];
                rowMap.im1 = imgs[1];
                rowMap.im2 = imgs[2];
                //添加行设置
                var temp = this.addItemConfig(i, rowData);
                if (!Tools.isEmptyObject(temp)) {
                    dhx.extend(rowMap, temp, true);
                }
                //添加用户数据设置
                var userdata = this.userData(i, rowData);
                if (!Tools.isEmptyObject(userdata)) {
                    var userdataList = [];
                    for (var entry in userdata) {
                        var tempData = {};
                        tempData.name = entry;
                        tempData.content = userdata[entry];
                        userdataList.push(tempData);
                    }
                    rowMap.userdata = userdataList;
                }

                //记录行索引
                this.idIndexMapping[rowData[this.idColumn]] = i;
                rowMap._pid_temp_ = rowData[this.pidColumn];
                rowMap.child = this.haveChild(i, rowData);
                rows.push(rowMap);
            }
            return this.treeStructDeal(rows);
        }
    }


    /**
     * 树形结构关系整理
     * @return
     */
    this.treeStructDeal = function (rows) {
        var isFindRelation = [];//是否找到关系
        var key = this.isTreeGrid ? "rows" : "item";
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var pid = row._pid_temp_;//找到父节点。
            if (pid != null && pid != undefined) {//寻找父子关系
                var pidIndex = this.idIndexMapping[pid];
                if (pidIndex != null && pidIndex != undefined) {
                    var pidRow = rows[pidIndex];
                    if (pidRow[key]) {
                        if (this.compare) {
                            var isAppend = false;
                            for (var j = 0; j < pidRow[key].length; j++) {
                                if (this.compare(row, pidRow[key][j])) {
                                    pidRow[key].splice(j, 0, row);
                                    isAppend = true;
                                    break;
                                }
                            }
                            if (!isAppend) {
                                pidRow[key].push(row);
                            }
                        } else {
                            pidRow[key].push(row);
                        }
                    } else {
                        var tempRows = [];
                        tempRows.push(row);
                        pidRow[key] = tempRows;
                    }
                    if (this.isTreeGrid) {
                        //设置图标
                        pidRow.data[this.treeIndex].image = pidRow.open ? "folderOpen.gif" : "folderClosed.gif";
                    }
                    //记录此节点已找到其父节点
                    isFindRelation[i] = true;
                }
            }
        }
        //找出未找到父节点的节点，定义其为跟节点
        var roots = [];
        for (var i = 0; i < rows.length; i++) {
            rows[i] && (rows[i].open = this.isOpen(rows[i]) != undefined ? this.isOpen(rows[i]) : false);
            if (!isFindRelation[i]) {
                if (this.parentNode && rows[i]._pid_temp_ != this.parentNode) { //如果有设置根节点
                    continue;
                }
                if (this.compare) { //有比较函数执行比较
                    var isAppend = false;
                    for (var j = 0; j < roots.length; j++) {
                        if (this.compare(rows[i], roots[j])) {
                            roots.splice(j, 0, rows[i]);
                            isAppend = true;
                            break;
                        }
                    }
                    if (!isAppend) {
                        roots.push(rows[i]);
                    }
                } else {
                    roots.push(rows[i]);
                }
            }
        }
        roots = this.afterCoverted(roots) || roots;
        Tools.clearObject(this.idIndexMapping);
        if (!this.isDycload) { //如果不是动态加载
            if (!this.isTreeGrid) {
                var redata = {};
                redata["id"] = 0;
                redata["item"] = roots;
                return redata;
            }
        } else {//是动态加载，设置父ID，
            if (!this.isTreeGrid) {
                var redata = {};
                redata["id"] = roots[0]._pid_temp_;
                redata["item"] = roots;
                return redata;
            }
        }
        return roots;
    };

    /**
     * 获取树本系统相对于 dhtmlx源生图标库的 相对路径
     * 需要根据节点不同对图标定义不同时，请把图标放在本系统 images文件夹下，从此文件夹取相对值
     * 如：最终 路径为 getIconRelativePath() + "filesave.png";
     */
    this.getIconRelativePath = function () {
        return "../../../images/";
    };


    /**
     * 是否动态加载
     * @param dycload
     */
    this.setDycload = function (dycload) {
        this.isDycload = dycload;
    }
    /**
     * 设置taxt column名称
     * @param textColumn
     */
    this.setTextColumn = function (textColumn) {
        this.textColumn = textColumn;
    }

    /**
     * 设置父关联 column名称
     * @param pidColumn
     */
    this.setPidColumn = function (pidColumn) {
        this.pidColumn = pidColumn;
    }
    /**
     *  设置id column名称
     * @param idColumn
     */
    this.setIdColumn = function (idColumn) {
        this.idColumnName = idColumn;
        this.idColumn = idColumn;
    }
    this.setRoot = function (value) {
        this.parentNode = value;
    }
}

/**
 * 获取NodeId
 * @param rowIndex
 * @param rowData
 * @return
 */
dhtmxTreeDataConverter.prototype.getNodeID = function (rowIndex, rowData) {
    return rowData[this.idColumn];
}

/**
 * 获取NodeId
 * @param rowIndex
 * @param rowData
 * @return
 */
dhtmxTreeDataConverter.prototype.getNodeText = function (rowIndex, rowData) {
    return rowData[this.textColumn];
};

/**
 * 节点图标，返回数组3个值，分别是为叶子时，打开时，关闭时 的图标
 * 此图标返回后被应用在 dhtmlx默认路径上，但是开发中自定义后的图标一般都放在系统images目录下
 * 因此返回的路径需要加入相对于dhtmlx默认路径的路径，本转换器提供了一个直接取得该相对路径的方法
 * getIconRelativePath()，因此实际应用此方法时，返回的路径值可以是这样：
 *   this.getIconRelativePath()+"图标名"
 * @param rowIndex
 * @param rowData
 */
dhtmxTreeDataConverter.prototype.getImages = function (rowIndex, rowData) {
    return new Array("leaf.gif", "folderOpen.gif", "folderClosed.gif");
};

/**
 * 添加一个节点的其他设置
 * @param rowIndex
 * @param rowData
 * @return
 */
dhtmxTreeDataConverter.prototype.addItemConfig = function (rowIndex, rowData) {
    return Tools.EmptyObject;
}

/**
 * 为某一个节点设置用户自定义属性，钩子函数
 * @param rowIndex
 * @param rowData
 * @return
 */
dhtmxTreeDataConverter.prototype.userData = function (rowIndex, rowData) {
    return rowData;
}
/**
 * 某个节点是否展开，如果未覆盖将采用默认展开机制
 * @param rowIndex
 * @param rowData
 */
dhtmxTreeDataConverter.prototype.isOpen = function (rowData) {
    return undefined;
}
///**
// * 比较两个转换后的数据的大小，返回true表示convertedData1>convertedData2，将排序排在前面
// * @param convertedData1
// * @param convertedData1
// */
//dhtmxTreeDataConverter.prototype.comapare=function(convertedData1,convertedData2){
//    return true;
//}

/**
 * 判断此节点是否有子节点，钩子函数 ，默认实现为判断行数据中名称为“children”的值，为1则有子节点 否则则无子节点
 * @param rowIndex
 * @param rowData
 * @return
 */
dhtmxTreeDataConverter.prototype.haveChild = function (rowIndex, rowData) {
    var rs;
    if (rowData["children"] != null || rowData["children"] != undefined) {
        rs = rowData["children"] && parseInt(rowData["children"]) >= 1
    } else if (rowData["CHILDREN"] != null || rowData["CHILDREN"] != undefined) {
        rs = rowData["CHILDREN"] && parseInt(rowData["CHILDREN"]) >= 1
    }
    return rs;
}
/**
 * 数据解析完成之后的回调操作。
 * @param data
 */
dhtmxTreeDataConverter.prototype.afterCoverted = function (data) {
    return data;
}

/**
 * treeGrid数据查询格式化类，该类提供了一些基本的实现，留下了很多构造函数 如需在实现过程中需要这些属性，
 * 请实现这些函数。treegrid的数据结构、属性较多，具体请参考 dhtmlx treeGrid文档
 * @param config
 */
var dhtmlxTreeGridDataConverter = function (config) {
    this.treeIndex = 0;//默认为0；
    dhx.extend(this, new dhtmxTreeDataConverter(), true); //继承dhtmxtreeDataConverter
    delete this.convert;//删除tree的covert方法
    delete this._super;
    dhx.extend(this, new dhtmxGridDataConverter(), true);//继承dhtmxGridDataConverter
    delete this._super;
    //super关键字
    this._super = dhx.extend({}, this, true);
    dhx.extend(this, new baseConverter(config), true);//继承基类。
    this.idColumnName = this.idColumn;
    delete this.textColumn;
    this.isTreeGrid = true;
    var _oldCellDataFormat = this.cellDataFormat;
    //覆盖用户的cellDataFormate。加入treeGrid自身逻辑。
    this.cellDataFormat = function (rowIndex, columnIndex, columnName, cellValue, rowData) {
        var retVal = _oldCellDataFormat.call(this, rowIndex, columnIndex, columnName, cellValue, rowData);
        if (columnIndex == this.treeIndex) {
            if (retVal && !retVal.image) {//加入图标处理逻辑
                if (typeof retVal == "object") {
                    retVal.image = this.haveChild(rowIndex, rowData) ? "folderClosed.gif" : "leaf.gif";
                } else {
                    retVal = {image:this.haveChild(rowIndex, rowData) ? "folderClosed.gif" : "leaf.gif", value:retVal};
                }
            }
        }
        return retVal;
    }
    /**
     * 重写addRowConfig函数，加入treeGrid自身逻辑
     * @param rowIndex
     * @param rowData
     * @return
     */
    this.addRowConfig = function (rowIndex, rowData) {
        var rowConfig = {};
        //判断此行是否有子节点。
        if (this.haveChild(rowIndex, rowData)) {
            rowConfig["xmlkids"] = 1;
        }
        //记录行索引
        this.idIndexMapping[rowData[this.idColumn]] = rowIndex;
        //记录pid
        rowConfig._pid_temp_ = rowData[this.pidColumn];
        dhx.extend(rowConfig, this.addTreeRowConfig(rowIndex, rowData));
        return rowConfig;
    }
    /**
     * 覆盖父类方法rowsDeal
     * @param rows
     */
    this.rowsDeal = function (rows) {
        return this.treeRowsDeal(this.treeStructDeal(rows));
    }

    /**
     * 根节点添加其父节点信息。
     * @param data
     * @return
     */
    this.dataConfig = function (data) {
        if (this.isDycload) {
            var rows = data.rows;
            if (rows && rows.length > 0) {
                //正常情况，所有根节点的父节点都相同，即处于同一节点，这里不考虑特殊情况
                data["parent"] = rows[0]._pid_temp_;
            }
        }
        return this.treeDataConfig(data);
    }
    this.setTreeIndex = function (treeIndex) {
        this.treeIndex = treeIndex;
    }
}

/**
 * 钩子函数，加入treeGrid行设置。
 * @param rowIndex
 * @param rowData
 * @return
 */
dhtmlxTreeGridDataConverter.prototype.addTreeRowConfig = function (rowIndex, rowData) {
    return Tools.EmptyObject;
}

/**
 * 钩子函数，当所有的行数据格式化完成，进行的回调操作。
 * @param rows
 * @return
 */
dhtmlxTreeGridDataConverter.prototype.treeRowsDeal = function (rows) {
    return rows;
}

/**
 * 钩子函数。在treedata format完成之后进行的回调，对数据格式进行最终调整
 * @param data
 * @return
 */
dhtmlxTreeGridDataConverter.prototype.treeDataConfig = function (data) {
    return data;
}

/**
 * 普通表数据转换器，转换为一个二维数组
 * @param config
 */
var tableDataConverter = function (config) {
    dhx.extend(this, new baseConverter(config), true);
    /**
     * 转换核心函数。
     * @param data 数据列表，数据格式为一个数组，数组里面包含行对象，用JSON数据格式表示为
     * [{id:1,name:"张三"},{id:2，name:"解决"}]
     */
    this.convert = function (data) {
        var tempData = dhx.isArray(data) ? data : [data];
        if (tempData) {
            /*列名处理*/
            var colsName = []; // 保存结果集列名
            var count = 0;
            //获取查询出的所有列名。
            for (var key in data[0]) {
                colsName[count++] = this.isFormatColumn ? Tools.tranColumnToJavaName(key) : key;
            }
            var filtercolsName = !(this.filterColumns) ? colsName : this.filterColumns;
            var contentData = [];
            for (var i = 0; i < data.length; i++) {
                var rowData = this._getRowData(data, i);
                var dataList = [];
                //一行数据进行格式化
                for (var j = 0; j < filtercolsName.length; j++) {
                    var rowValue = rowData[filtercolsName[j]];
                    dataList.push(rowValue);
                }
                contentData.push(dataList);
            }
            return contentData;
        }
    }
}