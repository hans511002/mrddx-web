<%@ page import="com.ery.base.support.log4j.LogUtils"%>
<%@ page import="com.ery.meta.common.ServerDetector"%>
<%@ page import="java.io.*"%>
<%@ page import="com.ery.meta.module.logAnalysis.LogAnalysisAction"%>
<%@ page import="com.ery.base.support.utils.Convert"%>
<%@ page import="com.ery.base.support.sys.SystemVariable"%>
<%@ page import="com.ery.base.support.web.init.SystemVariableInit"%>
<%@ page import="java.util.*"%>
<%@ page import="java.text.*"%>
<%@ page import="com.ery.base.support.utils.Convert"%>
<%@ page import="javax.servlet.http.HttpSession"%>
<%@ page import="com.ery.meta.web.session.SessionManager"%>
<%@ page import="com.ery.meta.module.mag.login.LoginConstant"%>

<%
    OutputStream ops = null;
    InputStream is = null;
    try {
        String dateTime = Convert.toString(request.getParameter("dateTime"));
        String rs = Convert.toString(request.getParameter("rs"));
        String image = Convert.toString(request.getParameter("image"));
        String lstTypeId = Convert.toString(request.getParameter("lstTypeId"));
        String rule = Convert.toString(request.getParameter("rule"));
        int srule = Convert.toInt(request.getParameter("srule"));
        int type = Convert.toInt(request.getParameter("type"));//1 天，2 月
       
        Map<String, Object> formatUser = (Map<String, Object>)session.getAttribute(LoginConstant.SESSION_KEY_USER);
        Map<String,Object> dataMap = new HashMap<String,Object>();
        dataMap.put("dateTime",dateTime);
        dataMap.put("type",type);
        dataMap.put("rs",rs);
        dataMap.put("image",image);
        dataMap.put("rule",rule);
        dataMap.put("srule",srule);
        dataMap.put("lstTypeId",lstTypeId);
        LogAnalysisAction logAnalysisAction = new LogAnalysisAction();
        dataMap.put("USER_ID", formatUser.get("userId"));
        String path = logAnalysisAction.getPath(dataMap);
        File docFile = new File(SystemVariableInit.WEB_ROOT_PATH,path);
        ops = new BufferedOutputStream(response.getOutputStream());
        String filenameTemp = "";
        if(type==2){
        	filenameTemp = "月报表"+dateTime+".doc";
        }else{
        	filenameTemp = "日报表"+dateTime+".doc";
        }
        String filename = logAnalysisAction.encodingFileName(filenameTemp);
        
        response.setHeader("Content-disposition", "attachment; filename="+filename);
       
        response.setContentType("application/vnd.ms-word;charset=UTF-8");
        int size = 8192;
        byte[] buffer = new byte[size];
        int len;
         is = new FileInputStream(docFile);
        while ((len = is.read(buffer)) != -1) {
            ops.write(buffer, 0, len);
        }
        if (!ServerDetector.isWebLogic()) {
            out.clear();
            out = pageContext.pushBody();
        }
        if (!ServerDetector.isWebLogic()) {
            out.clear();
            out = pageContext.pushBody();
        }
        ops.flush();
        ops.close();
        is.close();
        System.gc();
        logAnalysisAction.delete(path);
        logAnalysisAction.deleteFileDirFiles("../../requireAcc");
    } catch (Exception e) {
        LogUtils.error(null, e);
        ops.close();
        is.close();
    }
%>
