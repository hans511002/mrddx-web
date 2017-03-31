package com.ery.meta.common;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.utils.Convert;


public class ExcelReader {

	private Workbook wb = null;

	/**
	 * 根据文件路径构造一个Reader
	 * 
	 * @param filePath
	 */
	public ExcelReader(String filePath) {
		try {
			InputStream inp = new FileInputStream(filePath);
			wb = WorkbookFactory.create(inp);
		} catch (FileNotFoundException e) {
			LogUtils.error(null, e);
		} catch (InvalidFormatException e) {
			LogUtils.error(null, e);
		} catch (IOException e) {
			LogUtils.error(null, e);
		}
	}

	/**
	 * 根据一个输入流构造一个reader
	 * 
	 * @param inputStream
	 */
	public ExcelReader(InputStream inputStream) {
		try {
			wb = WorkbookFactory.create(inputStream);
		} catch (IOException e) {
			LogUtils.error(null, e);
		} catch (InvalidFormatException e) {
			LogUtils.error(null, e);
		}
	}

	/**
	 * 取Excel所有数据，包含header
	 * 
	 * @return List<String[]>
	 */
	public Object[][] getAllData(int sheetIndex) {
		int columnNum = 0;
		List<Object[]> dataList = new ArrayList<Object[]>();
		Sheet sheet = wb.getSheetAt(sheetIndex);
		if (sheet.getRow(0) != null) {
			columnNum = sheet.getRow(0).getLastCellNum() - sheet.getRow(0).getFirstCellNum();
		}
		if (columnNum > 0) {
			for (Row row : sheet) {
				Object[] singleRow = new Object[columnNum];
				int n = 0;
				for (int i = 0; i < columnNum; i++) {
					Cell cell = row.getCell(i, Row.CREATE_NULL_AS_BLANK);
					switch (cell.getCellType()) {
					case Cell.CELL_TYPE_BLANK:
						singleRow[n] = "";
						break;
					case Cell.CELL_TYPE_BOOLEAN:
						singleRow[n] = Boolean.toString(cell.getBooleanCellValue());
						break;
					// 数值
					case Cell.CELL_TYPE_NUMERIC:
						if (org.apache.poi.ss.usermodel.DateUtil.isCellDateFormatted(cell)) {
							singleRow[n] = cell.getDateCellValue();
						} else {
							cell.setCellType(Cell.CELL_TYPE_STRING);
							String temp = cell.getStringCellValue();
							// 判断是否包含小数点，如果不含小数点，则以字符串读取，如果含小数点，则转换为Double类型的字符串
							if (temp.indexOf(".") > -1) {
								singleRow[n] = new Double(temp);
							} else {
								singleRow[n] = Convert.toLong(temp);
							}
						}
						break;
					case Cell.CELL_TYPE_STRING:
						singleRow[n] = cell.getStringCellValue().trim();
						break;
					case Cell.CELL_TYPE_ERROR:
						singleRow[n] = "";
						break;
					case Cell.CELL_TYPE_FORMULA:
						cell.setCellType(Cell.CELL_TYPE_STRING);
						singleRow[n] = cell.getStringCellValue();
						if (singleRow[n] != null) {
							singleRow[n] = singleRow[n].toString().replaceAll("#N/A", "").trim();
						}
						break;
					default:
						singleRow[n] = "";
						break;
					}
					n++;
				}
				if ("".equals(singleRow[0])) {
					continue;
				}// 如果第一行为空，跳过
				dataList.add(singleRow);
			}
		}
		return dataList.toArray(new Object[dataList.size()][]);
	}

	public static void main(String[] args) {
		ExcelReader excelReader = new ExcelReader("D:\\工作\\文档\\03开发文档\\编码映射上传模板测试.xls");
		System.out.println("开始");
		Object[][] data = excelReader.getAllData(0);
		System.out.println("完成");
	}

}
