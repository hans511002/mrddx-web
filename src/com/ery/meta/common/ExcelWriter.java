package com.ery.meta.common;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.OutputStream;

import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import com.ery.base.support.log4j.LogUtils;


public class ExcelWriter {

	private OutputStream outputStream = null;

	/**
	 * 写入的文件地址
	 * 
	 * @param filePath
	 */
	public ExcelWriter(String filePath) {
		try {
			OutputStream outputStream = new FileOutputStream(filePath);
			this.outputStream = outputStream;
		} catch (FileNotFoundException e) {
			LogUtils.error(null, e);
		}
	}

	public ExcelWriter(OutputStream outputStream) {
		this.outputStream = outputStream;
	}

	/**
	 * 写入Excel数据
	 * 
	 * @param header 头信息
	 * @param data
	 */
	public void writeData(String title, String[] header, Object[][] data) {
		try {
			XSSFWorkbook wb = new XSSFWorkbook();// 创建excel
			XSSFSheet sheet = wb.createSheet();// 创建一个工作空间
			XSSFRow row = null;// 创建一行
			XSSFCell cell = null;// 每个单元格
			int headerRowsIndex = 0; // 行下标
			int col_count = header.length; // 总列数

			/************* 设置标题开始 *************/
			if (title != null && !title.equals("")) {
				/****** 标题样式 ********/
				XSSFCellStyle titleStyle = wb.createCellStyle();
				titleStyle.setVerticalAlignment(XSSFCellStyle.VERTICAL_CENTER); // 上下居中
				titleStyle.setAlignment(XSSFCellStyle.ALIGN_CENTER); // 左右居中

				XSSFFont font = wb.createFont(); // 字体样式
				font.setFontName("黑体"); // 设置字体
				font.setFontHeightInPoints((short) 12);// 设置字体大小
				font.setBoldweight(XSSFFont.BOLDWEIGHT_BOLD);// 粗体显示
				titleStyle.setFont(font);
				/****** 标题样式 ********/

				row = sheet.createRow(headerRowsIndex);
				sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, col_count - 1)); // 标题合并单元格
				cell = row.createCell(0);
				cell.setCellValue(title);
				cell.setCellStyle(titleStyle);
				headerRowsIndex++;
			}
			/************* 设置标题结束 *************/

			/************* 设置头部开始 *************/
			/****** 头部样式 ********/
			XSSFCellStyle headerStyle = wb.createCellStyle();
			headerStyle.setFillForegroundColor(IndexedColors.AQUA.getIndex());// 设置背景色
			headerStyle.setFillPattern(XSSFCellStyle.SOLID_FOREGROUND); // 填充背景色
			headerStyle.setBorderBottom(XSSFCellStyle.BORDER_THIN); // 设置边框样式
			headerStyle.setBorderLeft(XSSFCellStyle.BORDER_THIN); // 左边框
			headerStyle.setBorderRight(XSSFCellStyle.BORDER_THIN); // 右边框
			headerStyle.setBorderTop(XSSFCellStyle.BORDER_THIN); // 顶边框
			headerStyle.setVerticalAlignment(XSSFCellStyle.VERTICAL_CENTER); // 上下居中
			headerStyle.setAlignment(XSSFCellStyle.ALIGN_CENTER); // 左右居中

			XSSFFont headerFont = wb.createFont(); // 字体样式
			headerFont.setFontName("黑体"); // 设置字体
			headerFont.setFontHeightInPoints((short) 12);// 设置字体大小
			headerStyle.setFont(headerFont);
			/****** 头部样式 ********/
			row = sheet.createRow(headerRowsIndex);
			for (int i = 0; i < header.length; i++) {
				cell = row.createCell(i);
				cell.setCellValue(header[i]);
				cell.setCellStyle(headerStyle);
			}
			headerRowsIndex++;
			/************* 设置头部结束 *************/

			/************* 设置内容开始 *************/
			/****** 内容样式 ********/
			XSSFCellStyle bodyStyle = wb.createCellStyle();
			bodyStyle.setVerticalAlignment(XSSFCellStyle.VERTICAL_CENTER); // 上下居中
			bodyStyle.setAlignment(XSSFCellStyle.ALIGN_CENTER); // 左右居中
			/****** 内容样式 ********/
			for (int i = 0; i < data.length; i++) {
				row = sheet.createRow(headerRowsIndex);
				for (int j = 0; j < data[i].length; j++) {
					cell = row.createCell(j);
					if (data[i][j] != null) {
						cell.setCellValue(data[i][j].toString());
					} else {
						cell.setCellValue("");
					}
					cell.setCellStyle(bodyStyle);
				}
				headerRowsIndex++;
			}
			/************* 设置内容结束 *************/

			wb.write(outputStream);
			outputStream.flush();
			outputStream.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
