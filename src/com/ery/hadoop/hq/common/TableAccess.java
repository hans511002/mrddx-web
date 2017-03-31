package com.ery.hadoop.hq.common;

import java.util.Vector;

import com.ery.base.support.jdbc.DataTable;

/**

 */
public class TableAccess {
	public static DataTable RowToCol(DataTable dt, int X, int Y, int DataNum) {
		DataTable temp = new DataTable();
		Vector<String> colsName = new Vector<String>();
		Vector<String> rowsName = new Vector<String>();
		colsName.add(dt.colsName[X]);
		for (int i = 0; i < dt.rowsCount; i++) {
			if (colsName.indexOf(dt.rows[i][Y].toString()) < 0) {
				colsName.add(dt.rows[i][Y].toString());
			}
			if (rowsName.indexOf(dt.rows[i][X].toString()) < 0) {
				rowsName.add(dt.rows[i][X].toString());
			}
		}
		temp.colsName = new String[colsName.size()];
		temp.colsName = colsName.toArray(temp.colsName);

		temp.rows = new Object[rowsName.size()][colsName.size()];
		temp.rowsCount = rowsName.size();
		temp.colsCount = temp.colsName.length;
		temp.colTypes = new int[temp.colsCount];
		temp.colTypesName = new String[temp.colsCount];
		temp.colTypes[0] = dt.colTypes[X];
		temp.colTypesName[0] = dt.colTypesName[X];
		for (int i = 1; i < temp.colsCount; i++) {
			temp.colTypes[i] = dt.colTypes[DataNum];
			temp.colTypesName[i] = dt.colTypesName[DataNum];
		}
		temp.colTypesName = new String[temp.colsCount];

		for (int i = 0; i < rowsName.size(); i++) {
			temp.rows[i][0] = rowsName.get(i);
		}

		for (int i = 0; i < dt.rowsCount; i++) {
			for (int r = 0; r < temp.rowsCount; r++) {
				for (int c = 0; c < temp.colsCount; c++) {
					if (temp.getObj(r, 0).toString().equals(dt.getObj(i, X).toString())
							&& temp.colsName[c].equals(dt.getObj(i, Y).toString())) {
						temp.rows[r][c] = dt.getObj(i, DataNum);
						break;
					}
				}
			}
		}
		return temp;
	}
}
