package com.ery.hadoop.hq.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Enumeration;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ery.hadoop.hq.datasource.DataSourceInit;
import com.ery.hadoop.hq.qureyrule.QueryRuleDAO;
import com.ery.hadoop.hq.utils.StringUtil;

/**
 * 查询规则加载等操作

 *
 */
public class HBaseRuleServlet extends HttpServlet {
	private static final long serialVersionUID = -3530909106070035236L;
	private static final String RULE_ID = "QRY_RULE_ID";
	
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		req.setCharacterEncoding("UTF-8");
		resp.setContentType("text/html;charset=UTF-8");
		resp.setHeader("Content-type","text/html;charset=UTF-8");
		String rid = null;
		Enumeration<String> enumertion = req.getParameterNames();
		while(enumertion.hasMoreElements()){
			String key = enumertion.nextElement();
			if (RULE_ID.equalsIgnoreCase(key)){
				rid = req.getParameter(key);
				break;
			}
		}
		
		long ruleId = StringUtil.stringToLong(rid, -1);
		
		// 全部重新加载规则
		if (ruleId == 0){
			DataSourceInit.reLoadDataSource();
			this.responseResult(resp, "reload all queryRuleId success.");
			return;
		}

		// 验证id
		if (ruleId < 0){
			this.responseResult(resp, "queryRuleId不正确, 不是数字或者小于零");
			return;
		}
		
		QueryRuleDAO qryRuleDao = new QueryRuleDAO();
		int state = qryRuleDao.queryQueryRuleStatus(ruleId);
		qryRuleDao.close();
		switch (state) {
		case -1:
			this.responseResult(resp, "queryRuleId不存在");
			return;
		case 0:
			break;
		default:
			this.responseResult(resp, "queryRuleId状态无效");
			return;
		} 
		
		// 重新加载规则ID
		DataSourceInit.reLoadQueryRule(ruleId, null);
		this.responseResult(resp, "reload queryRuleId \'" + ruleId +"\' success.");
	}

	private void responseResult(HttpServletResponse resp, String data) throws IOException {
		PrintWriter printWriter = resp.getWriter();
		printWriter.append(data);
		printWriter.flush();
		printWriter.close();
	}
	
	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		this.doGet(req, resp);
	}
}
