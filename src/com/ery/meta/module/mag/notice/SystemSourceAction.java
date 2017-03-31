package com.ery.meta.module.mag.notice;

import java.io.DataInputStream;
import java.io.IOException;
import java.lang.management.ManagementFactory;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.util.HashMap;
import java.util.Map;

import com.sun.management.OperatingSystemMXBean;

/**
 * 

 * 
 */

public class SystemSourceAction {
	private static final DecimalFormat decimalFormat = new DecimalFormat("#.###");  
	private static final int Heap_Configuration = 1;
	private static final int PS_Young_Generation = 2;
	private static final int PS_Old_Generation = 3;
	private static final int PS_Perm_Generation = 4;

	private static final int PS_Young_Generation_Eden_Space = 1;
	private static final int PS_Young_Generation_From_Space = 2;
	private static final int PS_Young_Generation_To_Space = 3;

	public static final String Heap_Configuration_MinHeapFreeRatio = "heap_configuration_minheapfreeratio";
	public static final String Heap_Configuration_MaxHeapFreeRatio = "heap_configuration_maxheapfreeratio";
	public static final String Heap_Configuration_MaxHeapSize = "heap_configuration_maxheapsize";
	public static final String Heap_Configuration_NewSize = "heap_configuration_newsize";
	public static final String Heap_Configuration_MaxNewSize = "heap_configuration_maxnewsize";
	public static final String Heap_Configuration_OldSize = "heap_configuration_oldsize";
	public static final String Heap_Configuration_NewRatio = "heap_configuration_newratio";
	public static final String Heap_Configuration_SurvivorRatio = "heap_configuration_survivorratio";
	public static final String Heap_Configuration_PermSize = "heap_configuration_permsize";
	public static final String Heap_Configuration_MaxPermSize = "heap_configuration_maxpermsize";

	// 新生代
	public static final String PS_Young_Generation_Eden_Space_capacity = "ps_young_generation_eden_space_capacity";
	public static final String PS_Young_Generation_Eden_Space_used = "ps_young_generation_eden_space_used";
	public static final String PS_Young_Generation_Eden_Space_free = "ps_young_generation_eden_space_free";

	public static final String PS_Young_Generation_From_Space_capacity = "ps_young_generation_from_space_capacity";
	public static final String PS_Young_Generation_From_Space_used = "ps_young_generation_from_space_used";
	public static final String PS_Young_Generation_From_Space_free = "ps_young_generation_from_space_free";

	public static final String PS_Young_Generation_To_Space_capacity = "ps_young_generation_to_space_capacity";
	public static final String PS_Young_Generation_To_Space_used = "ps_young_generation_to_space_used";
	public static final String PS_Young_Generation_To_Space_free = "ps_young_generation_to_space_free";

	// 老年代
	public static final String PS_Old_Generation_capacity = "ps_old_generation_capacity";
	public static final String PS_Old_Generation_used = "ps_old_generation_used";
	public static final String PS_Old_Generation_free = "ps_old_generation_free";

	// 持久代
	public static final String PS_Perm_Generation_capacity = "ps_perm_generation_capacity";
	public static final String PS_Perm_Generation_used = "ps_perm_generation_used";
	public static final String PS_Perm_Generation_free = "ps_perm_generation_free";

	public static final String SYSTEMINFO_TOTAL_MEMORY = "systeminfo_total_memory";
	public static final String SYSTEMINFO_FREE_MEMORY = "systeminfo_free_memory";
	public static final String SYSTEMINFO_MAX_MEMORY = "systeminfo_max_memory";
	public static final String SYSTEMINFO_TOTAL_PHYSICAL_MEMORY = "systeminfo_total_physical_memory";
	public static final String SYSTEMINFO_FREE_PHYSICAL_MEMORY = "systeminfo_free_physical_memory";
	public static final String SYSTEMINFO_USED_PHYSICAL_MEMORY = "systeminfo_used_physical_memory";

	public static final Map<String, String> MAP_NAME_RELATION = new HashMap<String, String>();

	static {
		// 配置
		MAP_NAME_RELATION.put(Heap_Configuration_MinHeapFreeRatio, "GC后java堆中空闲量占的最小比例");
		MAP_NAME_RELATION.put(Heap_Configuration_MaxHeapFreeRatio, "GC后java堆中空闲量占的最大比例");
		MAP_NAME_RELATION.put(Heap_Configuration_MaxHeapSize, "MaxHeapSize");
		MAP_NAME_RELATION.put(Heap_Configuration_NewSize, "新生成对象能占用内存");
		MAP_NAME_RELATION.put(Heap_Configuration_MaxNewSize, "新生成对象能占用内存的最大值");
		MAP_NAME_RELATION.put(Heap_Configuration_OldSize, "老年代对象占用的内存");
		MAP_NAME_RELATION.put(Heap_Configuration_NewRatio, "新生代内存容量与老生代内存容量的比例");
		MAP_NAME_RELATION.put(Heap_Configuration_SurvivorRatio, "SurvivorRatio");
		MAP_NAME_RELATION.put(Heap_Configuration_PermSize, "永久代对象能占用内存");
		MAP_NAME_RELATION.put(Heap_Configuration_MaxPermSize, "永久代对象能占用内存的最大值");

		// 新生代
		MAP_NAME_RELATION.put(PS_Young_Generation_Eden_Space_capacity, "Eden区总容量");
		MAP_NAME_RELATION.put(PS_Young_Generation_Eden_Space_used, "Eden区已使用");
		MAP_NAME_RELATION.put(PS_Young_Generation_Eden_Space_free, "Eden区剩余容量");

		MAP_NAME_RELATION.put(PS_Young_Generation_From_Space_capacity, "第一个Survivor区的内存总容量");
		MAP_NAME_RELATION.put(PS_Young_Generation_From_Space_used, "第一个Survivor区的内存已使用");
		MAP_NAME_RELATION.put(PS_Young_Generation_From_Space_free, "第一个Survivor区的内存剩余容量");

		MAP_NAME_RELATION.put(PS_Young_Generation_To_Space_capacity, "第二个Survivor区的内存总容量");
		MAP_NAME_RELATION.put(PS_Young_Generation_To_Space_used, "第二个Survivor区的内存已使用");
		MAP_NAME_RELATION.put(PS_Young_Generation_To_Space_free, "第二个Survivor区的内存剩余容量");

		// 老年代
		MAP_NAME_RELATION.put(PS_Old_Generation_capacity, "当前的Old区内存总容量");
		MAP_NAME_RELATION.put(PS_Old_Generation_used, "当前的Old区内存已使用");
		MAP_NAME_RELATION.put(PS_Old_Generation_free, "当前的Old区内存剩余容量");

		// 持久代
		MAP_NAME_RELATION.put(PS_Perm_Generation_capacity, "永生代的内存总容量");
		MAP_NAME_RELATION.put(PS_Perm_Generation_used, "永生代的内存已使用");
		MAP_NAME_RELATION.put(PS_Perm_Generation_free, "永生代的内容剩余容量");

		MAP_NAME_RELATION.put(SYSTEMINFO_TOTAL_MEMORY, "可使用内存");
		MAP_NAME_RELATION.put(SYSTEMINFO_FREE_MEMORY, "剩余内存");
		MAP_NAME_RELATION.put(SYSTEMINFO_MAX_MEMORY, "最大可使用内存");
		MAP_NAME_RELATION.put(SYSTEMINFO_TOTAL_PHYSICAL_MEMORY, "总的物理内存");
		MAP_NAME_RELATION.put(SYSTEMINFO_FREE_PHYSICAL_MEMORY, "剩余的物理内存");
		MAP_NAME_RELATION.put(SYSTEMINFO_USED_PHYSICAL_MEMORY, "已使用的物理内存");
	}

	/**
	 * 获取jvm的
	 * 
	 * @param queryData
	 *            查询条件
	 * @param page
	 *            分页条件
	 * @return 查询结果
	 */
	public Map<String, Map<String, String>> queryPermGen() {
		Map<String, Map<String, String>> map = new HashMap<String, Map<String, String>>();
		// get name representing the running Java virtual machine.
		String name = ManagementFactory.getRuntimeMXBean().getName();
		// get pid
		String pid = name.split("@")[0];
		DataInputStream ls_in = null;
		System.out.println("pid="+pid);

//		 Map<String, String> cateConfig = new HashMap<String, String>();
//		 cateConfig.put(Heap_Configuration_MinHeapFreeRatio, "11111111");
//		 cateConfig.put(Heap_Configuration_MaxHeapFreeRatio, "22222222");
//		 map.put("serverconfig", cateConfig);
		
		Map<String, String> cateConfig = new HashMap<String, String>();
		Map<String, String> cateYoung = new HashMap<String, String>();
		Map<String, String> cateOld = new HashMap<String, String>();
		Map<String, String> catePerm = new HashMap<String, String>();
		Map<String, String> cateSystem = new HashMap<String, String>();

		map.put("serverconfig", cateConfig);
		map.put("young", cateYoung);
		map.put("old", cateOld);
		map.put("perm", catePerm);
		map.put("system", cateSystem);

		String osName = System.getProperties().getProperty("os.name");
		if (osName != null && osName.startsWith("Windows")){
			try {
				Process process = Runtime.getRuntime().exec("jmap -heap " + pid);
				String ls_str = null;
				ls_in = new DataInputStream(process.getInputStream());
				int type = 0;
				int childType = 0;
				while ((ls_str = ls_in.readLine()) != null) {
					ls_str = ls_str.trim();
					if ("Heap Configuration:".equals(ls_str)) {
						type = Heap_Configuration;
					} else if ("PS Young Generation".equals(ls_str)) {
						type = PS_Young_Generation;
					} else if ("PS Old Generation".equals(ls_str)) {
						type = PS_Old_Generation;
					} else if ("PS Perm Generation".equals(ls_str)) {
						type = PS_Perm_Generation;
					}
					
					if (type == PS_Young_Generation) {
						if (ls_str.equals("Eden Space")) {
							childType = PS_Young_Generation_Eden_Space;
						} else if (ls_str.equals("From Space")) {
							childType = PS_Young_Generation_From_Space;
						} else if (ls_str.equals("to Space")) {
							childType = PS_Young_Generation_To_Space;
						}
					}
					
					switch (type) {
					case Heap_Configuration:
						heapConfiguration(ls_str, cateConfig);
						break;
					case PS_Young_Generation:
						psYoungGeneration(ls_str, childType, cateYoung);
						break;
					case PS_Old_Generation:
						psOldGeneration(ls_str, cateOld);
						break;
					case PS_Perm_Generation:
						psPermGeneration(ls_str, catePerm);
						break;
					default:
						break;
					}
					
				}
			} catch (IOException e) {
				System.exit(0);
			} finally {
				try {
					ls_in.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
			this.getSystemInfo(cateSystem);
		}
		
		Map<String, Map<String, String>> newMap = new HashMap<String, Map<String, String>>();
		for (String key : map.keySet()) {
			Map<String, String> cateMap = map.get(key);
			Map<String, String> tmpMap = new HashMap<String, String>();
			for (String keys : cateMap.keySet()) {
				String chnName = MAP_NAME_RELATION.get(keys);
				tmpMap.put(chnName == null ? keys : MAP_NAME_RELATION.get(keys), cateMap.get(keys));
			}
			
			newMap.put(key, tmpMap);
		}

		return newMap;
	}

	/**
	 * 格式： MinHeapFreeRatio = 40 MaxHeapFreeRatio = 70 MaxHeapSize = 4154458112
	 * (3962.0MB) NewSize = 1310720 (1.25MB) MaxNewSize = 17592186044415 MB
	 * OldSize = 5439488 (5.1875MB) NewRatio = 2 SurvivorRatio = 8 PermSize =
	 * 21757952 (20.75MB) MaxPermSize = 85983232 (82.0MB)
	 * 
	 * @param ls_str
	 * @param map
	 */
	public void heapConfiguration(String ls_str, Map<String, String> map) {
		String[] keyvalue = ls_str.split("=");
		if (keyvalue.length != 2) {
			return;
		}

		if (ls_str.startsWith("MinHeapFreeRatio")) {
			map.put(Heap_Configuration_MaxHeapFreeRatio, keyvalue[1].trim());
		} else if (ls_str.startsWith("MaxHeapFreeRatio")) {
			map.put(Heap_Configuration_MinHeapFreeRatio, keyvalue[1].trim());
		} else if (ls_str.startsWith("MaxHeapSize")) {
			map.put(Heap_Configuration_MaxHeapSize, keyvalue[1].trim());
		} else if (ls_str.startsWith("NewSize")) {
			map.put(Heap_Configuration_NewSize, keyvalue[1].trim());
		} else if (ls_str.startsWith("MaxNewSize")) {
			map.put(Heap_Configuration_MaxNewSize, keyvalue[1].trim());
		} else if (ls_str.startsWith("OldSize")) {
			map.put(Heap_Configuration_OldSize, keyvalue[1].trim());
		} else if (ls_str.startsWith("NewRatio")) {
			map.put(Heap_Configuration_NewRatio, keyvalue[1].trim());
		} else if (ls_str.startsWith("SurvivorRatio")) {
			map.put(Heap_Configuration_SurvivorRatio, keyvalue[1].trim());
		} else if (ls_str.startsWith("PermSize")) {
			map.put(Heap_Configuration_PermSize, keyvalue[1].trim());
		} else if (ls_str.startsWith("MaxPermSize")) {
			map.put(Heap_Configuration_MaxPermSize, keyvalue[1].trim());
		}
	}

	/**
	 * 新生代 格式 PS Young Generation Eden Space: capacity = 64880640 (61.875MB)
	 * used = 45608984 (43.496116638183594MB) free = 19271656
	 * (18.378883361816406MB) 70.29675416272096% used From Space: capacity =
	 * 10813440 (10.3125MB) used = 8192688 (7.8131561279296875MB) free = 2620752
	 * (2.4993438720703125MB) 75.76393821022727% used To Space: capacity =
	 * 10813440 (10.3125MB) used = 0 (0.0MB) free = 10813440 (10.3125MB) 0.0%
	 * used
	 * 
	 * @param ls_str
	 * @param childType
	 * @param map
	 */
	private void psYoungGeneration(String ls_str, int childType, Map<String, String> map) {
		String[] keyvalue = ls_str.split("=");
		if (keyvalue.length != 2) {
			return;
		}

		switch (childType) {
		case PS_Young_Generation_Eden_Space:
			if (ls_str.startsWith("capacity")) {
				map.put(PS_Young_Generation_Eden_Space_capacity, keyvalue[1].trim());
			} else if (ls_str.startsWith("used")) {
				map.put(PS_Young_Generation_Eden_Space_used, keyvalue[1].trim());
			} else if (ls_str.startsWith("free")) {
				map.put(PS_Young_Generation_Eden_Space_free, keyvalue[1].trim());
			}
			break;
		case PS_Young_Generation_From_Space:
			if (ls_str.startsWith("capacity")) {
				map.put(PS_Young_Generation_From_Space_capacity, keyvalue[1].trim());
			} else if (ls_str.startsWith("used")) {
				map.put(PS_Young_Generation_From_Space_used, keyvalue[1].trim());
			} else if (ls_str.startsWith("free")) {
				map.put(PS_Young_Generation_From_Space_free, keyvalue[1].trim());
			}
			break;
		case PS_Young_Generation_To_Space:
			if (ls_str.startsWith("capacity")) {
				map.put(PS_Young_Generation_To_Space_capacity, keyvalue[1].trim());
			} else if (ls_str.startsWith("used")) {
				map.put(PS_Young_Generation_To_Space_used, keyvalue[1].trim());
			} else if (ls_str.startsWith("free")) {
				map.put(PS_Young_Generation_To_Space_free, keyvalue[1].trim());
			}
			break;
		default:
			break;
		}
	}

	/**
	 * PS Old Generation capacity = 173080576 (165.0625MB) used = 5391144
	 * (5.141395568847656MB) free = 167689432 (159.92110443115234MB)
	 * 3.1148174593548843% used
	 * 
	 * @param ls_str
	 * @param map
	 */
	private void psOldGeneration(String ls_str, Map<String, String> map) {
		String[] keyvalue = ls_str.split("=");
		if (keyvalue.length != 2) {
			return;
		}

		if (ls_str.startsWith("capacity")) {
			map.put(PS_Old_Generation_capacity, keyvalue[1].trim());
		} else if (ls_str.startsWith("used")) {
			map.put(PS_Old_Generation_used, keyvalue[1].trim());
		} else if (ls_str.startsWith("free")) {
			map.put(PS_Old_Generation_free, keyvalue[1].trim());
		}
	}

	/**
	 * 持久代
	 * 
	 * 格式 PS Perm Generation capacity = 47185920 (45.0MB) used = 44074664
	 * (42.032875061035156MB) free = 3111256 (2.9671249389648438MB)
	 * 93.40638902452257% used
	 * 
	 * @param ls_str
	 * @param map
	 */
	private void psPermGeneration(String ls_str, Map<String, String> map) {
		String[] keyvalue = ls_str.split("=");
		if (keyvalue.length != 2) {
			return;
		}

		if (ls_str.startsWith("capacity")) {
			map.put(PS_Perm_Generation_capacity, keyvalue[1].trim());
		} else if (ls_str.startsWith("used")) {
			map.put(PS_Perm_Generation_used, keyvalue[1].trim());
		} else if (ls_str.startsWith("free")) {
			map.put(PS_Perm_Generation_free, keyvalue[1].trim());
		}
	}

	private void getSystemInfo(Map<String, String> map) {
		// 可使用内存
		long totalMemory = Runtime.getRuntime().totalMemory();
		
		// 剩余内存
		long freeMemory = Runtime.getRuntime().freeMemory();
		// 最大可使用内存
		long maxMemory = Runtime.getRuntime().maxMemory();
		OperatingSystemMXBean osmxb = (OperatingSystemMXBean) ManagementFactory.getOperatingSystemMXBean();

		// 总的物理内存
		long totalMemorySize = osmxb.getTotalPhysicalMemorySize();
		// 剩余的物理内存
		long freePhysicalMemorySize = osmxb.getFreePhysicalMemorySize();
		// 已使用的物理内存
		long usedMemory = (osmxb.getTotalPhysicalMemorySize() - osmxb.getFreePhysicalMemorySize());

		map.put(SYSTEMINFO_TOTAL_MEMORY, this.getFormatValue(totalMemory));
		map.put(SYSTEMINFO_FREE_MEMORY, this.getFormatValue(freeMemory));
		map.put(SYSTEMINFO_MAX_MEMORY, this.getFormatValue(maxMemory));
		map.put(SYSTEMINFO_TOTAL_PHYSICAL_MEMORY, this.getFormatValue(totalMemorySize));
		map.put(SYSTEMINFO_FREE_PHYSICAL_MEMORY, this.getFormatValue(freePhysicalMemorySize));
		map.put(SYSTEMINFO_USED_PHYSICAL_MEMORY, this.getFormatValue(usedMemory));
	}
	
	private String getFormatValue(long value){
		 BigDecimal bd1 = new BigDecimal(value); 
		 BigDecimal bd2 = new BigDecimal(1024*1024);
		 return decimalFormat.format(bd1.divide(bd2)).toString()+" MB";
	}
}
