package com.ery.meta.web;

import java.io.IOException;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import sun.misc.BASE64Decoder;
import com.ery.meta.module.mag.login.LoginConstant;
import com.ery.meta.web.session.SessionManager;

import com.ery.base.support.utils.StringUtils;

/**

 * 

 * @description 作用:判断用户是否登录以及是否具有指定权限的URL <br>
 * @date 2011-09-30
 */
public class AuthFilter implements Filter {

	/**
	 * 验证失败重定向URL
	 */
	private String redirectURL;

	/**
	 * 无需登录可以公共访问的正则表达式集
	 */
	private String[] publicReg;

	/**
	 * 登录后都可以访问的正则表达式集。
	 */
	private String[] loginPublicReg;

	// private boolean debug=false;

	/**
	 * 初始化
	 * 
	 * @param filterConfig
	 * @throws ServletException
	 */
	public void init(FilterConfig filterConfig) throws ServletException {
		this.redirectURL = filterConfig.getInitParameter("redirectURL");
		this.publicReg = filterConfig.getInitParameter("publicReg").replaceAll("\\n", "").replaceAll("\\s", "")
				.split(",");
		// this.debug=filterConfig.getInitParameter("debug")!=null
		// &&filterConfig.getInitParameter("debug").equals("true");
		this.loginPublicReg = filterConfig.getInitParameter("loginPublicReg").split(",");
	}

	public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain)
			throws IOException, ServletException {
		HttpServletRequest request = (HttpServletRequest) servletRequest;
		HttpServletResponse response = (HttpServletResponse) servletResponse;
		HttpSession session = request.getSession(true);
		String context = request.getContextPath();
		if (context.endsWith("/")) {
			context = context.substring(0, context.length() - 1);
		}
		// 公开资源无需拦截。
		String uri = request.getRequestURI();
		if (this.publicReg != null) { // 判断无须过滤的资源
			for (int i = 0; i < this.publicReg.length; i++) {
				Pattern pattern = Pattern.compile(publicReg[i].replaceAll("\\$\\{rootPath\\}", context));
				Matcher matcher = pattern.matcher(uri);
				if (matcher.matches()) {
					filterChain.doFilter(servletRequest, servletResponse);
					return;
				}
			}
		}
		if (!SessionManager.isLogIn(session.getId())) {// 未登录
			String url = uri;
			if (StringUtils.isNotEmpty(request.getQueryString())) {
				url += "?" + request.getQueryString();
			}
			session.setAttribute(LoginConstant.LAST_VISIT_URL_KEY, url);
			response.sendRedirect(context + this.redirectURL);
		} else {
			/**
			 * 登录后都可以访问的URL判断
			 */
			if (this.loginPublicReg != null) { // 判断无须过滤的资源
				for (int i = 0; i < this.loginPublicReg.length; i++) {
					Pattern pattern = Pattern.compile(loginPublicReg[i]);
					Matcher matcher = pattern.matcher(uri);
					if (matcher.matches()) {
						filterChain.doFilter(servletRequest, servletResponse);
						return;
					}
				}
			}
			/**
			 * 不在登录后的公共资源里，如果也不在数据库注册的MENU数据中，则直接通过，不受权限约束。
			 */
			ServletContext application = ((HttpServletRequest) servletRequest).getSession().getServletContext();
			@SuppressWarnings("unchecked")
			Map<String, Map<String, Object>> urlMenuData = (Map<String, Map<String, Object>>) application
					.getAttribute(MenuDataInit.APPLICATION_KEY_URL_MENUDATA);
			boolean isRegUrl = false;// 此URL是否注册
			if (urlMenuData.containsKey(uri)) {
				isRegUrl = true;
			}
			// 去除uri的根目录比较
			uri = uri.replaceFirst("/", "");
			if (!isRegUrl
					&& uri.contains("/")
					&& (urlMenuData.containsKey(uri.substring(uri.indexOf("/"), uri.length())) || urlMenuData
							.containsKey(uri.substring(uri.indexOf("/") + 1, uri.length())))) {
				isRegUrl = true;
			}
			if (isRegUrl) {// 如果已在数据库中注册，判断是否有权访问，或者是非法访问
				@SuppressWarnings("unchecked")
				Map<String, Object> user = (Map<String, Object>) session.getAttribute(LoginConstant.SESSION_KEY_USER);
				// 判断用户是否由页面非法访问。
				String strKey = base64decode(request.getParameter("_strKey_"));
				String decode = user.get("userId").toString() + user.get("userPass").toString();
				if (strKey == null || !strKey.equals(decode)) {
					// 无权限标识
					response.sendError(401);// 设置403错误。
					return;
				}
				filterChain.doFilter(servletRequest, servletResponse);
			} else {
				filterChain.doFilter(servletRequest, servletResponse);
			}
		}
	}

	/**
	 * Base64 反编码
	 * 
	 * @param s
	 * @return
	 */
	public static String base64decode(String s) {
		if (s == null)
			return null;
		BASE64Decoder decoder = new BASE64Decoder();
		try {
			byte[] b = decoder.decodeBuffer(s);
			return new String(b);
		} catch (Exception e) {
			return null;
		}
	}

	public void destroy() {

	}
}
