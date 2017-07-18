<%--
  Created by IntelliJ IDEA.
  User: 小生太痴癫
  Date: 12-11-8
  Time: 下午3:39
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<style type="text/css">

    .search_bg {
        position: relative;
        width: 250px;
        height: 29px;
        line-height: 29px;
        background: url(<%=rootPath%>/meta/module/gdlRpt/build/img/search_bg.png) repeat-x;
        border-bottom: 1px solid #e7e7e7;
    }

    .search_icon {
        position: absolute;
        top: 7px;
        right: 40px;
        width: 16px;
        height: 16px;
        background: url(<%=rootPath%>/meta/module/gdlRpt/build/img/search_icon.png) no-repeat;
    }

    .search_input {
        width: 210px;
        height: 22px;
        line-height: 22px;
        padding-left: 5px;
        background: url(<%=rootPath%>/meta/module/gdlRpt/build/img/search_input.png) no-repeat;
        border-style: none;
        margin: 4px 5px;
    }
    .dimOrGdlDiv{float: left; padding-right: 10px;}
</style>
<script type="text/javascript" src="<%=rootPath%>/dwr/interface/ReportIndexAction.js"></script>
<script type="text/javascript" src="<%=rootPath%>/js/control/gdlSelect.js"></script>
<head>
    <title></title>
    <table id="_gdlSelectTb" style="height: 100%;width: 100%;display: none;" border="0" cellpadding="0" cellspacing="0">
        <tr valign="top">
            <td id="_gdlTreeTd" style="width: 60%">
                <div id="_gdlTreeLayout" style="height: 100%;width: 100%">
                    <div class="search_bg" style="height: 30px">
                        <a href="###" class="search_icon" id="searchBtn"></a>
                        <input type="text" value="" class="search_input" id="searchInput"/>
                    </div>
                    <div id="gdlTree" style="height: 340px">

                    </div>
                </div>
            </td>
            <td id="_gdlGridTd" style="width: 40%">
                <div style="height: 100%;width: 100%">
                    <div class="search_bg" style="height: 30px">
                        <span style="font-weight: bolder;">已选择指标</span>
                    </div>
                    <div id="hasSelect" style="height: 340px;overflow-y: auto;width: 90%"  >

                    </div>
                </div>
            </td>
        </tr>
        <tr style="height: 30px;" valign="middle">
            <td style="text-align: center" colspan="2">
                <input type="button" id="_gdlSave" class="btn_2" value="确定"/>
                <input type="button" id="_gdlCancel" class="btn_2" value="取消"/>
            </td>
        </tr>
    </table>
</head>
<body>

</body>
<script type="text/javascript">
//    var gdl = new Gdl({
//        isMultiple:true,
//        confirmCall:function(gdls){
//
//        }
//    })
//    gdl.show(6021);
</script>
</html>
