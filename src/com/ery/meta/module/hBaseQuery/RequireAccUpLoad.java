package com.ery.meta.module.hBaseQuery;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;
import java.util.UUID;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.fileupload.FileItem;

import com.ery.meta.web.fileUpload.IFileUpload;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.web.init.SystemVariableInit;


public class RequireAccUpLoad implements IFileUpload {
	public static String FILE_PATH = "/requireAcc";

	/**
	 * 上传附件到服务器根目录下的 requireAcc文件夹下
	 * 当上传成功的时候，输出附件真实名字和附件显示名字。附件真实名字定义为UUID并且后缀为.重命名，附件显示模式定义为附件传进来的名称
	 * 
	 * @param request
	 * @param fileItems
	 * @return
	 */
	public String upload(HttpServletRequest request, List<FileItem> fileItems) {
		String msg = null;
		FileItem fileItem = fileItems.get(0);
		String uploadFileName = fileItem.getName().contains("\\") ? fileItem.getName().substring(
				fileItem.getName().lastIndexOf("\\") + 1) : fileItem.getName();
		String path = null;

		if (uploadFileName == null || uploadFileName.equals("")) {
			msg = "请先选择文件！";
		} else if (uploadFileName.indexOf(".xml") == -1) {
			msg = "请选择XML文件！";
		} else {
			try {
				InputStream inputStream = fileItem.getInputStream();
				File fileDir = new File(SystemVariableInit.WEB_ROOT_PATH, "../../requireAcc");
				if (!fileDir.exists()) {
					fileDir.mkdirs();
				}

				// String newFileName =
				// uploadFileName.substring(0,uploadFileName.lastIndexOf("."))
				// +UUID.randomUUID()+"."+prefix+ ".rename";
				String newFileName = UUID.randomUUID() + "";

				File file = new File(SystemVariableInit.WEB_ROOT_PATH, "../../requireAcc" + "/" + newFileName);

				if (!file.exists()) {
					file.createNewFile();
				}
				path = inputstreamToFile(inputStream, file);
				msg = "附件上传成功！";
				request.setAttribute("accRealName", newFileName);
				request.setAttribute("accShowName", uploadFileName);
			} catch (Exception ex) {
				msg = ex.getMessage();
			}
		}
		request.setAttribute("errorMsg", msg);
		return "/meta/module/hbaseQuery/dataSource/upload.jsp?isReLoad=true";
	}

	// 将上传的流写入文件
	private String inputstreamToFile(InputStream inputStream, File file) {
		try {
			OutputStream os = new FileOutputStream(file);
			int bytesRead = 0;
			byte[] buffer = new byte[8192];
			while ((bytesRead = inputStream.read(buffer, 0, 8192)) != -1) {
				os.write(buffer, 0, bytesRead);
			}
			os.close();
			inputStream.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return file.getAbsolutePath();

	}

	public File readLogFileInfo(String fileName) {
		BufferedReader reader = null;
		File file = new File(SystemVariableInit.WEB_ROOT_PATH, "../../requireAcc" + "/" + fileName);
		if (!file.exists()) {
			LogUtils.debug(file.getName() + "未找到");
		} else {
			try {
				reader = new BufferedReader(new FileReader(file));
			} catch (FileNotFoundException e) {
				e.printStackTrace();
			}
		}
		return file;
	}
}
