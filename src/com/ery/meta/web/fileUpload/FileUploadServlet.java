package com.ery.meta.web.fileUpload;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.DiskFileUpload;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.utils.StringUtils;


public class FileUploadServlet extends HttpServlet {
	/**
	 * 实现Servlet的doPost方法，此方法根据req的中参数"fileUploadCalss"然后实例化IFileUpload具体的类，
	 * 如果不存在此参数或者 实力化失败，文件上传出现异常。
	 * 
	 * @param req
	 * @param resp
	 * @throws ServletException
	 * @throws IOException
	 */
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		// 获取要实例化的类
		String fileUploadCalss = req.getParameter("fileUploadCalss");
		String errorMessage = "";
		if (StringUtils.isEmpty(fileUploadCalss)) {
			errorMessage = "未指明文件上传实现类，即未找到fileUploadCalss参数,上传失败！";
		}
		// 实例化文件上传类
		IFileUpload fileUploadObj = null;
		try {
			Class fileUpload = Class.forName(fileUploadCalss);
			fileUploadObj = (IFileUpload) fileUpload.newInstance();
		} catch (ClassNotFoundException e) {
			errorMessage = "实例化文件上传类失败！";
			LogUtils.error(null, e);
		} catch (InstantiationException e) {
			errorMessage = "实例化文件上传类失败！";
			LogUtils.error(null, e);
		} catch (IllegalAccessException e) {
			errorMessage = "实例化文件上传类失败！";
			LogUtils.error(null, e);
		}
		// 进行异常判断
		if (StringUtils.isEmpty(errorMessage)) {
			DiskFileUpload fu = new DiskFileUpload();
			try {
				List<FileItem> fileItems = fu.parseRequest(req);
				String url = "";
				List<FileItem> allFiles = new ArrayList<FileItem>();
				for (FileItem fileItem : fileItems) {
					if (fileItem.isFormField()) {// 普通参数
						req.setAttribute(fileItem.getFieldName(), fileItem.getString("UTF-8"));
					} else {
						allFiles.add(fileItem);
					}
				}
				url = fileUploadObj.upload(req, allFiles);
				if (!StringUtils.isEmpty(url)) {
					req.getRequestDispatcher(url).forward(req, resp);
				}
				return;
			} catch (FileUploadException e) {
				errorMessage = "解析文件类失败！";
				LogUtils.error(null, e);
			}
		}
		if (!StringUtils.isEmpty(errorMessage)) {
			req.setAttribute("errorMessage", errorMessage);
			req.getRequestDispatcher("/meta/error/fileUploadError.jsp").forward(req, resp);
		}
	}
}
