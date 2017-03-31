package com.ery.meta.module.hBaseQuery;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import org.apache.hadoop.hbase.HColumnDescriptor;
import org.apache.hadoop.hbase.HTableDescriptor;
import org.apache.hadoop.hbase.client.HBaseAdmin;

import com.ery.meta.common.Page;
import com.ery.meta.common.term.TermDataService;

import com.ery.hadoop.hq.table.action.HBaseDataSourceManager;
import com.ery.base.support.jdbc.DataAccess;
import com.ery.base.support.utils.Convert;

public class SelectHbaseTblImpl extends TermDataService {

	public List<Map<String, Object>> queryDataTable(DataAccess access, Map<String, Object> data, Page page)
			throws Exception {
		Map<String, Object> extPar = (Map<String, Object>) data.get("EXT_PARAMS");
		String kwd = Convert.toString(data.get("_KEY_WORD"), "");
		String dsId = Convert.toString(extPar.get("dataSourceId"));
		final String defV = Convert.toString(extPar.get("defV"), "");
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		HBaseAdmin admin = new HBaseAdmin(HBaseDataSourceManager.getInstance().getConfiguration(dsId));
		HTableDescriptor[] hds = null;
		if (!"".equals(kwd)) {
			hds = admin.listTables(Pattern.compile(".*?" + kwd + ".*?", Pattern.CASE_INSENSITIVE));
		} else {
			hds = admin.listTables();
		}

		List<String> existsTbls = access.queryForPrimitiveList(
				"SELECT HB_TABLE_NAME FROM HB_TABLE_INFO WHERE HB_STATUS=0 AND DATA_SOURCE_ID=" + dsId, String.class);

		for (HTableDescriptor hd : hds) {
			String hdName = hd.getNameAsString();
			if (!existsTbls.contains(hdName)) {
				Map<String, Object> ret = new HashMap<String, Object>();
				ret.put("VAL", hdName);
				Collection<HColumnDescriptor> cols = hd.getFamilies();
				String str = cols.size() + "个:";
				List<String> cs = new ArrayList<String>();
				for (HColumnDescriptor c : cols) {
					str += c.getNameAsString() + ",";
					cs.add(c.getNameAsString());
				}
				ret.put("VAL_NAME", str.substring(0, str.length() - 1));

				Collections.sort(cs, new Comparator<String>() {
					@Override
					public int compare(String o1, String o2) {
						return o1.compareTo(o2);
					}
				});
				ret.put("COLS", cs);
				list.add(ret);
			}
		}

		Collections.sort(list, new Comparator<Map<String, Object>>() {
			@Override
			public int compare(Map<String, Object> o1, Map<String, Object> o2) {
				String s1 = Convert.toString(o1.get("VAL"));
				String s2 = Convert.toString(o2.get("VAL"));
				if (s2.equalsIgnoreCase(defV)) {
					return 1;
				}
				return s1.compareTo(s2);
			}
		});

		return list;
	}

}
