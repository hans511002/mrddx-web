<%@ page language="java" contentType="text/javascript; charset=UTF-8"%>
<%@ page import="com.ery.meta.sys.code.CodeManager"%>
<%@ page import="com.ery.base.support.utils.StringUtils"%>
<%@ page import="com.ery.meta.sys.code.CodePO"%>
<%@ page import="com.ery.base.support.utils.ArrayUtils"%>
        <%
            String types = request.getParameter("types");
            if(StringUtils.isNotEmpty(types)){
                types = types.toUpperCase();
                String[] typeArray = StringUtils.split(types,",");
                out.println("var _code={");
                int typeArrayLength = typeArray.length;
                for(int j=0;j<typeArrayLength;j++){
                    String type = typeArray[j];
                    CodePO[] codes = CodeManager.getCodes(type);
                    if(ArrayUtils.isNotEmpty(codes)){
                        out.println("'"+type+"':[");
                        int length = codes.length;
                        for(int i=0;i<length;i++){
                            CodePO code = codes[i];
                            out.print("{'name':'"+code.getCodeName()+"',");
                            out.print("'text':'"+code.getCodeName()+"',");
                            out.print("'order':'"+code.getOrderID()+"',");
                            out.print("'codeId':'"+code.getCodeID()+"',");
                            out.print("'value':'"+code.getCodeValue()+"'}");
                            if(i!=length-1){
                                out.println(",");
                            }
                        }
                        out.println("]");
                        if(j!=typeArrayLength-1){
                            out.print(",");
                        }
                    }
                }
                out.println("};");

            }

        %>

        var _CodeDataMap = {};
        //通过编码值获取编码名（中文）
        var getCodeNameByValue = function(type,value){
            var v = _CodeDataMap[type];
            if(!v){
                var codeArr = _code[type];
                if(!codeArr)return null;
                var mp = {};
                for(var i=0;i<codeArr.length;i++){
                    mp[codeArr[i]["value"]] = codeArr[i]["name"];
                }
                _CodeDataMap[type] = mp;
                v = mp;
            }
            return v[value];
        };


    /* *
     * 获取某一类型编码值，并删除某些Value的值
     * @param type  编码类型值
     * @param values 编码值的集合，可以是数组或者是单个的值。
     */
        var getCodeByRemoveValue=function(type,values){
            if(type){
                var codes=_code[type];
                if(codes&&dhx.isArray(codes)){
                    codes=codes.concat();
                }
                if(values!=undefined||values!=null){
                    !dhx.isArray(values)&&(values=[values]);
                    if(codes&&codes.length){
                        for(var i=0;i<codes.length ;i++){
                            for(var j=0;j<values.length;j++){
                                if(codes[i].value==values[j]){
                                    codes.splice(i--,1);
                                    values.splice(j--,1);
                                    break;
                                }
                            }
                        }
                    }

                }
                return codes;
            }
        };

        /**
         * 根据一个类型获取一组编码，以二维数组的形式返回，并排除一些值
         * @param type
         * @param values
         */
        var getCodeArrayByRemoveValue = function(type,values){
            if(type){
                var codes = _code[type] || [];
                var ret = [];
                var _ex = {};
                if(values){
                    if(typeof(values)=="string")
                        values = values.split(",");
                    for(var i=0,len=values.length;i<len;i++){
                        _ex[values[i]] = 1;
                    }
                }
                for(var i=0,len=codes.length;i<len;i++){
                    if(_ex[codes[i].value])continue;
                    ret[ret.length] = [codes[i].value,codes[i].text];
                }
                return ret;
            }
        };

        /**
         * 获取某一类型编码值，并新增某些Value的值
         * @param type
         * @param values  [{name:value}]
         */
        var getCodeByAddValue=function(type,values){
            if(type){
                var codes=_code[type];
                if(codes&&dhx.isArray(codes)){
                    codes=codes.concat();
                }
                if(values!=undefined||values!=null){
                    !dhx.isArray(values)&&(values=[values]);
                    for(var i=0; i<values.length;i++){
                        codes.push(values[i]);
                    }
                }
                return codes;
            }
        };

        /**
         * 获取对应编码类型的JSON值
         * @param type
         */
        var getCodeByType = function(type){
            if(type&&_code&&_code[type]){
                return _code[type].concat();
            }else{
                return [];
            }
        };

        /**
         * 系统表下拉数据转换器
         */
        var sysCodeSelectConverter = null;
        if(window["dhtmlxComboDataConverter"]){
            sysCodeSelectConverter = new dhtmlxComboDataConverter({
                valueColumn:'value',
                textColumn:"name"
            });
        }

        /**
         * 封装返回DHTMLX ComBo对象格式数据
         */
        var getCodeComboByType = function(type){
            return sysCodeSelectConverter.convert(getCodeByType(type));
        };

    /* *
     * 获取某一类型编码值，并增加某些Value的值，返回DHTMLX Combo格式的数据
     * @param type  编码类型值
     * @param values 编码值的集合，可以是数组或者是单个的值。
     */
        var getComboByAddValue=function(type,values){
            return sysCodeSelectConverter.convert(getCodeByAddValue(type,values));
        };
    /* *
     * 获取某一类型编码值，并删除某些Value的值，返回DHTMLX Combo格式的数据
     * @param type  编码类型值
     * @param values 编码值的集合，可以是数组或者是单个的值。
     */
        var getComboByRemoveValue=function(type,values){
            return sysCodeSelectConverter.convert(getCodeByRemoveValue(type,values));
        };

    /* *
     * 根据TYPE，VALUE 取对应名称
     * @param type  编码类型值
     * @param values 编码值的集合，可以是数组或者是单个的值。
     */
        var getNameByTypeValue=function(type,value){
            var typeA = getCodeByType(type);
            for(var i=0; i<typeA.length; i++){
                if(typeA[i].value==value){
                    return typeA[i].name;
                }
            }
        };

    /* *
     * 根据TYPE，NAME 取对应名称
     * @param type  编码类型值
     * @param name 编码值的名称
     */
        var getValueByTypeName=function(type,name){
            var typeA = getCodeByType(type);
            for(var i=0; i<typeA.length; i++){
                if(typeA[i].name==name){
                    return typeA[i].value;
                }
            }
        };

    /* *
     * 根据传入的names，返回DHTMLX Combo格式的数据
     * @param type  编码类型值
     * @param names 编码值的集合，可以是数组或者是单个的值。
     */
        var getComboByTypeNames=function(type,names){
            if(type){
                var codes=_code[type];
                if(codes&&dhx.isArray(codes)){
                    codes=codes.concat();
                }
                if(names!=undefined||names!=null){
                    !dhx.isArray(names)&&(names=[names]);
                    if(codes&&codes.length){
                        for(var i=0;i<codes.length ;i++){
                            var check = true;
                            for(var j=0;j<names.length;j++){
                                if(codes[i].name==names[j]){
                                    check = false;
                                    break;
                                }
                            }
                            if(check){
                                codes.splice(i--,1);
                            }
                        }
                    }
                }
                return sysCodeSelectConverter.convert(codes);
            }
        };