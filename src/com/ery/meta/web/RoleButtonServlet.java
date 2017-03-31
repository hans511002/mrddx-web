package com.ery.meta.web;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.ery.meta.module.mag.login.LoginConstant;
import com.ery.meta.module.mag.menu.MenuDAO;

import com.ery.base.support.log4j.LogUtils;


public class RoleButtonServlet extends HttpServlet {

	/**
	 * 实现GET方法，该Servlet只支持GET模式。
	 * 
	 * @param req
	 * @param resp
	 * @throws ServletException
	 * @throws IOException
	 */
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		// 获取menuId，此参数为必须，如果存在menuId才能根据menuId去寻找相应的权限。
		String menuId = req.getParameter("menuId");
		if (menuId == null || menuId.equals("") || menuId.equalsIgnoreCase("null")) {
			return;
		}
		int menu = 0;
		try {
			menu = Integer.parseInt(menuId);
		} catch (NumberFormatException e) {
		}
		// 获取Session，根据session获取当前用户信息
		HttpSession session = req.getSession();
		@SuppressWarnings("unchecked")
		Map<String, Object> user = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
		if (user == null) {
			return;
		}
		int userId = Integer.parseInt(user.get("userId").toString());
		MenuDAO menuDAO = new MenuDAO();
		Set<String> allexclude = null;
		try {
			List<String> excludes = menuDAO.excludeButton(menu, userId);
			allexclude = new HashSet<String>();
			if (excludes != null) {
				for (String tempExel : excludes) {
					if (tempExel == null || tempExel.equals("")) {
						continue;
					}
					if (tempExel.contains(",")) {
						allexclude.addAll(Arrays.asList(tempExel.split(",")));
					} else {
						allexclude.add(tempExel);
					}
				}
			}
		} catch (Exception e) {
			LogUtils.error(null, e);
		} finally {
			menuDAO.close();
		}
		req.setAttribute("excludes", allexclude);
		req.getRequestDispatcher("/meta/public/roleButton.jsp").forward(req, resp);
	}
}
