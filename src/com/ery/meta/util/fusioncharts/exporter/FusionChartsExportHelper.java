// Decompiled by Jad v1.5.7g. Copyright 2000 Pavel Kouznetsov.
// Jad home page: http://www.geocities.com/SiliconValley/Bridge/8617/jad.html
// Decompiler options: packimports(3) fieldsfirst ansi 
// Source File Name:   FusionChartsExportHelper.java

package com.ery.meta.util.fusioncharts.exporter;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Properties;
import java.util.StringTokenizer;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;

import com.ery.meta.util.fusioncharts.exporter.beans.ChartMetadata;
import com.ery.meta.util.fusioncharts.exporter.beans.ExportBean;

public class FusionChartsExportHelper {

	private static HashMap mimeTypes;
	private static HashMap extensions;
	private static HashMap handlerAssociationsMap;
	private static Logger logger;
	public static String EXPORTHANDLER = "FCExporter_";
	public static String RESOURCEPATH = "Resources/";
	public static String SAVEPATH = "./";
	public static String HTTP_URI = "http://yourdomain.com/";
	public static String TMPSAVEPATH = "";
	public static boolean OVERWRITEFILE = false;
	public static boolean INTELLIGENTFILENAMING = true;
	public static String FILESUFFIXFORMAT = "TIMESTAMP";
	static Class class$0; /* synthetic field */

	public FusionChartsExportHelper() {
	}

	public static ExportBean parseExportRequestStream(HttpServletRequest exportRequestStream) {
		ExportBean exportBean = new ExportBean();
		String stream = exportRequestStream.getParameter("stream");
		String parameters = exportRequestStream.getParameter("parameters");
		ChartMetadata metadata = new ChartMetadata();
		String strWidth = exportRequestStream.getParameter("meta_width");
		metadata.setWidth(Integer.parseInt(strWidth));
		String strHeight = exportRequestStream.getParameter("meta_height");
		metadata.setHeight(Integer.parseInt(strHeight));
		String bgColor = exportRequestStream.getParameter("meta_bgColor");
		String DOMId = exportRequestStream.getParameter("meta_DOMId");
		metadata.setDOMId(DOMId);
		metadata.setBgColor(bgColor);
		exportBean.setMetadata(metadata);
		exportBean.setStream(stream);
		HashMap exportParamsFromRequest = bang(parameters);
		exportBean.addExportParametersFromMap(exportParamsFromRequest);
		return exportBean;
	}

	public static String getExporterFilePath(String strFormat) {
		String exporterSuffix = (String) handlerAssociationsMap.get(strFormat) == null ? strFormat
				: (String) handlerAssociationsMap.get(strFormat);
		String path = RESOURCEPATH + EXPORTHANDLER + exporterSuffix.toUpperCase() + ".jsp";
		return path;
	}

	public static HashMap bang(String strParams) {
		HashMap params = new HashMap();
		for (StringTokenizer stPipe = new StringTokenizer(strParams, "|"); stPipe.hasMoreTokens();) {
			String keyValue = stPipe.nextToken();
			String keyValueArr[] = keyValue.split("=");
			if (keyValueArr.length > 1)
				params.put(keyValueArr[0].toLowerCase(), keyValueArr[1]);
		}

		return params;
	}

	public static HashMap getMimeTypes() {
		return mimeTypes;
	}

	public static String getMimeTypeFor(String format) {
		return (String) mimeTypes.get(format);
	}

	public static String getExtensionFor(String format) {
		return (String) extensions.get(format);
	}

	public static String getUniqueFileName(String filePath, String extension) {
		String rand = String.valueOf(Math.random());
		String uid = "";
		try {
			MessageDigest md5 = MessageDigest.getInstance("MD5");
			md5.update(rand.getBytes());
			byte md5hash[] = md5.digest();
			uid = convertToHex(md5hash);
		} catch (NoSuchAlgorithmException e) {
			logger.info("NoSuchAlgorithmException - Could not generate Unique filename." + e.getMessage());
		}
		String uniqueFileName = filePath + "." + extension;
		do {
			uniqueFileName = filePath;
			if (!FILESUFFIXFORMAT.equalsIgnoreCase("TIMESTAMP")) {
				uniqueFileName = uniqueFileName + uid + "_" + Math.random();
			} else {
				SimpleDateFormat sdf = new SimpleDateFormat("dMyHms");
				String date = sdf.format(Calendar.getInstance().getTime());
				uniqueFileName = uniqueFileName + uid + "_" + date + "_" + Calendar.getInstance().getTimeInMillis();
			}
			uniqueFileName = uniqueFileName + "." + extension;
		} while ((new File(uniqueFileName)).exists());
		return uniqueFileName;
	}

	private static String convertToHex(byte data[]) {
		StringBuffer buf = new StringBuffer();
		for (int i = 0; i < data.length; i++) {
			int halfbyte = data[i] >>> 4 & 0xf;
			int two_halfs = 0;
			do {
				if (halfbyte >= 0 && halfbyte <= 9)
					buf.append((char) (48 + halfbyte));
				else
					buf.append((char) (97 + (halfbyte - 10)));
				halfbyte = data[i] & 0xf;
			} while (two_halfs++ < 1);
		}

		return buf.toString();
	}

	static {
		mimeTypes = new HashMap();
		extensions = new HashMap();
		handlerAssociationsMap = new HashMap();
		logger = null;
		handlerAssociationsMap.put("PDF", "PDF");
		handlerAssociationsMap.put("JPEG", "IMG");
		handlerAssociationsMap.put("JPG", "IMG");
		handlerAssociationsMap.put("PNG", "IMG");
		handlerAssociationsMap.put("GIF", "IMG");
		mimeTypes.put("jpg", "image/jpeg");
		mimeTypes.put("jpeg", "image/jpeg");
		mimeTypes.put("png", "image/png");
		mimeTypes.put("gif", "image/gif");
		mimeTypes.put("pdf", "application/pdf");
		extensions.put("jpeg", "jpg");
		extensions.put("jpg", "jpg");
		extensions.put("png", "png");
		extensions.put("gif", "gif");
		extensions.put("pdf", "pdf");
		logger = Logger.getLogger(com.ery.meta.util.fusioncharts.exporter.FusionChartsExportHelper.class.getName());
		Properties props = new Properties();
		try {
			props.load(com.ery.meta.util.fusioncharts.exporter.FusionChartsExportHelper.class
					.getResourceAsStream("/local.properties"));
			EXPORTHANDLER = props.getProperty("EXPORTHANDLER", "FCExporter_");
			RESOURCEPATH = props.getProperty("RESOURCEPATH", "Resources" + File.separator);
			SAVEPATH = props.getProperty("SAVEPATH", "./");
			HTTP_URI = "http://yourdomain.com/";
			TMPSAVEPATH = props.getProperty("TMPSAVEPATH", "");
			String OVERWRITEFILESTR = props.getProperty("OVERWRITEFILE", "false");
			OVERWRITEFILE = (new Boolean(OVERWRITEFILESTR)).booleanValue();
			String INTELLIGENTFILENAMINGSTR = props.getProperty("INTELLIGENTFILENAMING", "true");
			INTELLIGENTFILENAMING = (new Boolean(INTELLIGENTFILENAMINGSTR)).booleanValue();
			FILESUFFIXFORMAT = props.getProperty("FILESUFFIXFORMAT", "TIMESTAMP");
		} catch (NullPointerException e) {
			logger.info("NullPointer: Properties file not FOUND");
		} catch (FileNotFoundException e) {
			logger.info("Properties file not FOUND");
		} catch (IOException e) {
			logger.info("IOException: Properties file not FOUND");
		}
	}
}
