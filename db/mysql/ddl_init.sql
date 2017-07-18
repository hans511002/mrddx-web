/*==============================================================*/
/* DBMS name:      MySQL 5.0                                    */
/* Created on:     2017/7/15 16:10:34                           */
/*==============================================================*/


drop table if exists HB_COLUMN_CLUSTER_INFO;

drop table if exists HB_COLUMN_INFO;

drop table if exists HB_DATA_SOURCE;

drop table if exists HB_DISPLAY_COL_RULE;

drop table if exists HB_DISPLAY_GRAPH_COL_RULE;

drop table if exists HB_DISPLAY_GRAPH_LINK_RULE;

drop table if exists HB_DISPLAY_GRAPH_RULE;

drop table if exists HB_DISPLAY_MENU;

drop table if exists HB_DISPLAY_RULE;

drop table if exists HB_DISPLAY_TABLE_COL_RULE;

drop table if exists HB_DISPLAY_TABLE_RULE;

drop table if exists HB_DISPLAY_TERM_RULE;

drop table if exists HB_INDEX_COLUMN_INFO;

drop table if exists HB_INDEX_TABLE_INFO;

drop table if exists HB_MAG_LOG_ANALYSIS;

drop table if exists HB_QRY_COLUMN_RULE;

drop table if exists HB_QRY_RULE;

drop table if exists HB_QRY_RULE_CONDITION;

drop table if exists HB_QRY_RULE_USER_REL;

drop table if exists HB_SERVER_USER;

drop table if exists HB_STATISTICS_LOG;

drop table if exists HB_TABLE_INFO;

drop table if exists HB_USER_QRY_LOG;

drop table if exists META_DATA_SOURCE;

drop table if exists META_DIM_USER_DEPT;

drop table if exists META_DIM_USER_STATION;

drop table if exists META_DIM_ZONE;

drop table if exists META_MAG_DELETE_LOG;

drop table if exists META_MAG_DRAFT;

drop table if exists META_MAG_FAVORITE_DIR;

drop table if exists META_MAG_LOGIN_LOG;

drop table if exists META_MAG_MAINTAIN_COLUMN;

drop table if exists META_MAG_MAINTAIN_QUERY;

drop table if exists META_MAG_MENU;

drop table if exists META_MAG_MENU_USER_FAVORITE;

drop table if exists META_MAG_MENU_VISIT_LOG;

drop table if exists META_MAG_MONITOR;

drop table if exists META_MAG_NOTICE;

drop table if exists META_MAG_PROBLEM_DEAL;

drop table if exists META_MAG_ROLE;

drop table if exists META_MAG_ROLE_DIM;

drop table if exists META_MAG_ROLE_DIM_DETAIL;

drop table if exists META_MAG_ROLE_GDL;

drop table if exists META_MAG_ROLE_MENU;

drop table if exists META_MAG_ROLE_ORG;

drop table if exists META_MAG_TABLE_MAINTAIN;

drop table if exists META_MAG_TIMER;

drop table if exists META_MAG_USER;

drop table if exists META_MAG_USER_CHANGE_LOG;

drop table if exists META_MAG_USER_DIM_DETAIL;

drop table if exists META_MAG_USER_GDL;

drop table if exists META_MAG_USER_MENU;

drop table if exists META_MAG_USER_ROLE;

drop table if exists META_MAG_USER_SEARCH_LOG;

drop table if exists META_MAG_USER_TAB_REL;

drop table if exists META_MENU_GROUP;

drop table if exists META_MR_TYPE;

drop table if exists META_MR_USERTYPE;

drop table if exists META_MR_USER_ADDACTION;

drop table if exists META_MR_USER_AUTHOR;

drop table if exists META_SYS;

drop table if exists META_SYS_CODE;

drop table if exists META_SYS_CODE_TYPE;

drop table if exists META_SYS_CODE_TYPE_DIR;

drop table if exists META_SYS_EMAIL_CFG;

drop table if exists META_SYS_EMAIL_SEND_LOG;

drop table if exists META_SYS_I18N_ITEM;

drop table if exists META_SYS_I18N_RESOURCE;

drop table if exists MR_DATA_SOURCE;

drop table if exists MR_DATA_SOURCE_PARAM;

drop table if exists MR_DATA_SOURCE_PARAM_DEFAULT;

drop table if exists MR_FILE_LIST;

drop table if exists MR_FTP_COL_DETAIL_FILELOG;

drop table if exists MR_FTP_COL_FILE_ERROR_LOG;

drop table if exists MR_FTP_COL_FILE_LOG;

drop table if exists MR_FTP_COL_JOB;

drop table if exists MR_FTP_COL_JOBPARAM;

drop table if exists MR_FTP_COL_REMOTE_FILE_LOG_MSG;

drop table if exists MR_FTP_COL_STATISTICS_DATE;

drop table if exists MR_JOB;

drop table if exists MR_JOB_MAP_DATALOG;

drop table if exists MR_JOB_MAP_RUN_LOG;

drop table if exists MR_JOB_MAP_RUN_LOG_MSG;

drop table if exists MR_JOB_PARAM;

drop table if exists MR_JOB_REDUCE_RUN_LOG;

drop table if exists MR_JOB_REDUCE_RUN_LOG_MSG;

drop table if exists MR_JOB_RUN_LOG;

drop table if exists MR_JOB_RUN_LOG_MSG;

drop table if exists MR_SOURCE_PARAM;

drop table if exists MR_SOURCE_TYPE;

drop table if exists MR_STATISTICS_DATE;

drop table if exists MR_SYSTEM_PARAM;

/*==============================================================*/
/* Table: HB_COLUMN_CLUSTER_INFO                                */
/*==============================================================*/
create table HB_COLUMN_CLUSTER_INFO
(
   CLUSTER_ID           bigint not null comment '列族id号',
   HB_CLUSTER_NAME      varchar(12) comment '列族名称',
   HB_TABLE_ID          bigint comment 'HB表ID号',
   DEFINE_CLUSTER_NAME  varchar(32) comment '自定义的列族中文名称',
   DEFINE_CLUSTER_MSG   varchar(256) comment '自定义的列族说明',
   ORDER_ID             bigint comment '前台展示的排序ID',
   primary key (CLUSTER_ID)
);

alter table HB_COLUMN_CLUSTER_INFO comment 'HBase表的列族信息';

/*==============================================================*/
/* Table: HB_COLUMN_INFO                                        */
/*==============================================================*/
create table HB_COLUMN_INFO
(
   COLUMN_ID            bigint not null comment '列ID号',
   HB_COLUMN_NAME       varchar(12) comment 'HB列名称',
   HB_TABLE_ID          bigint not null comment 'HBase表ID号',
   CLUSTER_ID           bigint comment '列族id号',
   DEFINE_EN_COLUMN_NAME text comment '自定义列英文名',
   DEFINE_CH_COLUMN_NAME text comment '自定义列中文名',
   ORDER_ID             int comment '前台展示的排序ID',
   COL_SPLIT            varchar(12) comment '字段拆分字符',
   primary key (COLUMN_ID)
);

alter table HB_COLUMN_INFO comment 'HBase表列关系表';

/*==============================================================*/
/* Table: HB_DATA_SOURCE                                        */
/*==============================================================*/
create table HB_DATA_SOURCE
(
   DATA_SOURCE_ID       bigint not null auto_increment,
   DATA_SOURCE_NAME     varchar(64),
   DATA_SOURCE_ADDRESS  varchar(256) comment 'Hmaster主机和端口列表
            HOST1:PORT,HOST2:PORT,',
   ROOT_ZNODE_NAME      varchar(32),
   PARENT_ZNODE_NAME    varchar(32) default 'root-region-server' comment 'Hbase的ZK根节点名称',
   ZOOKEEPER_SERVERS    varchar(512) comment 'HOST1:PORT1,HOST2:PORT2,
            hbase.zookeeper.quorum
            hbase.zookeeper.property.clientPort',
   ZOOKEEPER_PORT       int comment 'ZOOKEEPER 端口，Hbase只支持单一ZK端口',
   PARALLEL_NUM         int comment '并发连接数',
   HBASE_SITE_XML       longblob comment 'HBASE_SITE.XML 内容',
   STATE                int,
   primary key (DATA_SOURCE_ID)
);

alter table HB_DATA_SOURCE comment 'Hbase数据源';

/*==============================================================*/
/* Table: HB_DISPLAY_COL_RULE                                   */
/*==============================================================*/
create table HB_DISPLAY_COL_RULE
(
   REPORT_COL_ID        bigint not null auto_increment,
   REPORT_ID            bigint comment '报表ID',
   COL_RULE_ID          bigint comment '查询列规则ID',
   REPORT_TERM_ID       bigint comment '数据显示转换规则(维表编码转换)',
   COLUMN_NAME          varchar(32) comment '列中文名称',
   COL_DATA_RULE        varchar(64) comment '数据截取规则，为空则显示原来数据
            数据拆分正则表达式$$数据索引',
   INDI_EXEGESIS        varchar(512) comment '指标解释',
   primary key (REPORT_COL_ID)
);

alter table HB_DISPLAY_COL_RULE comment 'Hbase数据显示字段定义表';

/*==============================================================*/
/* Table: HB_DISPLAY_GRAPH_COL_RULE                             */
/*==============================================================*/
create table HB_DISPLAY_GRAPH_COL_RULE
(
   REPORT_GRAPH_COL_ID  bigint not null auto_increment comment '显示列规则ID',
   REPORT_GRAPH_ID      bigint comment '图形显示规则ID',
   REPORT_COL_ID        bigint comment '列数据来源规则ID',
   DISPLAY_FORMAT       varchar(20) comment '值显示格式',
   DISPLAY_ORDER        int comment '显示顺序ID',
   COL_COLOR            varchar(12) comment '字段颜色,为空则随机颜色, X轴字段无意义',
   COL_ALERT_RULE       varchar(512) comment '字段预警规则,
            单图列时有意义
            预警条件,满足条件的单元格使用对应颜色
            term:#FF0000;',
   IS_X_LABLE           int comment '是否X轴标签列',
   IS_Y_LEGEND          int comment '是否Y轴图例列',
   primary key (REPORT_GRAPH_COL_ID)
);

alter table HB_DISPLAY_GRAPH_COL_RULE comment 'Hbase数据图形显示字段定义表';

/*==============================================================*/
/* Table: HB_DISPLAY_GRAPH_LINK_RULE                            */
/*==============================================================*/
create table HB_DISPLAY_GRAPH_LINK_RULE
(
   REPORT_GRAPH_COL_ID  bigint not null,
   REPORT_GRAPH_ID      bigint,
   LEGEND_TYPE          int comment '图例类型,
            0：列做图例
            1：行标题做图例',
   primary key (REPORT_GRAPH_COL_ID)
);

alter table HB_DISPLAY_GRAPH_LINK_RULE comment 'Hbase数据图形显示联动字段定义表，跟表格联动';

/*==============================================================*/
/* Table: HB_DISPLAY_GRAPH_RULE                                 */
/*==============================================================*/
create table HB_DISPLAY_GRAPH_RULE
(
   REPORT_GRAPH_ID      bigint not null auto_increment comment '图形显示规则ID',
   REPORT_ID            bigint comment '报表ID',
   TABLE_WIDTH          int comment '图形类型',
   TABLE_HEIGHT         int comment '图形参数',
   GRAPH_COLORS         varchar(512) comment '图形颜色 
            ADC7EF,E0E7F0,ADC7EF,FFFFFF,FFFFFF',
   GRAPH_LEVEL          varchar(256) comment '图层顺序',
   YAXIS_SIDE           int comment 'Y轴位置，非二维图无意义
            0：左边
            1：右边',
   IS_LINKED_TABLE      int comment '是否与表格联动',
   primary key (REPORT_GRAPH_ID)
);

alter table HB_DISPLAY_GRAPH_RULE comment 'Hbase数据图形显示定义表，可以定义多图层显示';

/*==============================================================*/
/* Table: HB_DISPLAY_MENU                                       */
/*==============================================================*/
create table HB_DISPLAY_MENU
(
   DISPLAY_MENU_ID      bigint not null,
   DISPLAY_MENU_NAME    varchar(32) comment '菜单显示名称',
   PARENT_MENU_ID       bigint comment '父ID',
   ORDER_ID             int default 0 comment '排序ID',
   STATE                int comment '有效状态',
   primary key (DISPLAY_MENU_ID)
);

alter table HB_DISPLAY_MENU comment 'Hbase数据显示规则表';

/*==============================================================*/
/* Table: HB_DISPLAY_RULE                                       */
/*==============================================================*/
create table HB_DISPLAY_RULE
(
   REPORT_ID            bigint not null auto_increment comment '报表ID',
   DISPLAY_MENU_ID      bigint comment '显示规则ID',
   SUB_DISPLAY_MENU_ID  int comment '子菜单ID，钻取ID',
   QRY_RULE_ID          bigint comment '数据查询规则ID',
   ORDER_ID             int comment '排序ID',
   REPORT_TITLE         varchar(256) comment '报表标题',
   COL_SPAN             int comment '表布局设置，显示几个图或者表，同一菜单下的报表配置相匹配',
   TERM_SHOW_FLAG       int comment '是否显示查询条件',
   TERM_SHOW_SIZE       int comment '下拉框行显示大小',
   DOWNLOAD_FLAG        int comment '是否支持下载',
   GRAPH_SHOW_FLAG      int comment '图形显示标识 0:不显示图形
            1：JAVA图片 
            2：FLEX图形 
            
            在图形参数配置中需要合并二者差异',
   TABLE_SHOW_FLAG      int comment '表格数据显示标识 
            0:不显示表格
            1：HTML表格 
            2：FLEX grid ',
   TABLE_GRAPH_ORDER    int comment '表格图形排序方式,表格和图形同时显示时有用
            0：上表格下图形
            1：下表格上图形
            2：左表格右图形
            3：右表格左图形',
   STATE                int comment '状态',
   primary key (REPORT_ID)
);

alter table HB_DISPLAY_RULE comment 'Hbase数据查询显示规则详细配置表';

/*==============================================================*/
/* Table: HB_DISPLAY_TABLE_COL_RULE                             */
/*==============================================================*/
create table HB_DISPLAY_TABLE_COL_RULE
(
   REPORT_TABLE_COL_ID  bigint not null auto_increment comment '表格显示列规则ID',
   REPORT_TABLE_ID      bigint comment '表格显示规则ID',
   REPORT_COL_ID        bigint comment '列数据来源规则ID',
   SORT_FALG            int comment '是否支持排序',
   DISPLAY_FORMAT       varchar(20) comment '显示格式',
   DISPLAY_ORDER        int comment '显示顺序ID',
   COL_WIDTH            int comment '列宽度',
   COL_COLOR            varchar(20) comment '前景色,背景色
            #FF0000,#EEFEFE',
   COL_ALERT_RULE       varchar(512) comment '预警条件,满足条件的单元格使用对应颜色
            term:#FF0000;',
   IS_ROW_TITLE         int default 0 comment ' 是否行标题列 ',
   IS_LINKED_TO_GRAPH   int comment '是否与图形联动，生成单击事件',
   primary key (REPORT_TABLE_COL_ID)
);

alter table HB_DISPLAY_TABLE_COL_RULE comment 'Hbase数据表格显示字段定义表';

/*==============================================================*/
/* Table: HB_DISPLAY_TABLE_RULE                                 */
/*==============================================================*/
create table HB_DISPLAY_TABLE_RULE
(
   REPORT_TABLE_ID      bigint not null auto_increment comment '表格显示规则ID',
   REPORT_ID            bigint comment '报表ID',
   TABLE_WIDTH          int comment '数据表宽度',
   TABLE_HEIGHT         int comment '表格高度',
   TABLE_COLORS         varchar(512) comment '表格样式颜色
            表格背景色,标题行背景色,列头背景色,单行背景色,双行背景色
            
            ADC7EF,E0E7F0,ADC7EF,FFFFFF,FFFFFF',
   TABLE_COL_UNITE_RULE varchar(256),
   TABLE_ROW_UNITE_RULE varchar(512),
   primary key (REPORT_TABLE_ID)
);

alter table HB_DISPLAY_TABLE_RULE comment 'Hbase数据表格显示定义表';

/*==============================================================*/
/* Table: HB_DISPLAY_TERM_RULE                                  */
/*==============================================================*/
create table HB_DISPLAY_TERM_RULE
(
   REPORT_TERM_ID       bigint not null auto_increment comment '查询条件ID',
   REPORT_ID            bigint comment '报表ID',
   QRY_RULE_ID          bigint comment '条件数据查询规则ID',
   VALUE_COL_RULE_ID    bigint comment '条件值来源列规则ID',
   NAME_COL_RULE_ID     bigint comment '名称值来源列规则ID',
   DATA_FILTER          varchar(32) comment '数据过滤规则，正则表达式',
   TERM_PARAM_NAME      varchar(32) comment '条件名称参数标识',
   TERM_PARAM_VALUE     varchar(32) comment '条件值参数标识',
   STATE                int comment '0:无效，1: 条件，2:编码转换',
   primary key (REPORT_TERM_ID)
);

alter table HB_DISPLAY_TERM_RULE comment 'Hbase数据显示查询条件定义表';

/*==============================================================*/
/* Table: HB_INDEX_COLUMN_INFO                                  */
/*==============================================================*/
create table HB_INDEX_COLUMN_INFO
(
   HB_INDEX_COLUMN_ID   bigint not null,
   INDEX_TABLE_ID       bigint comment '索引表ID ',
   COLUMN_ID            bigint,
   HB_TABLE_ID          bigint comment 'HB表ID号',
   CLUSTER_ID           bigint comment '列族id号',
   primary key (HB_INDEX_COLUMN_ID)
);

alter table HB_INDEX_COLUMN_INFO comment 'HBase索引列信息';

/*==============================================================*/
/* Table: HB_INDEX_TABLE_INFO                                   */
/*==============================================================*/
create table HB_INDEX_TABLE_INFO
(
   INDEX_TABLE_ID       bigint not null comment '索引表ID ',
   INDEX_TABLE_NAME     varchar(32) comment '索引表名称',
   INDEX_TABLE_MSG      varchar(256) comment '索引表描述信息',
   primary key (INDEX_TABLE_ID)
);

alter table HB_INDEX_TABLE_INFO comment 'HBase索引信息表';

/*==============================================================*/
/* Table: HB_MAG_LOG_ANALYSIS                                   */
/*==============================================================*/
create table HB_MAG_LOG_ANALYSIS
(
   LA_ID                bigint not null comment 'ID',
   NAME                 varchar(32) comment '配置名称',
   SHOWFLAG             int comment '是否展示',
   MINSCALE             int comment '预警最小值（比例）',
   MAXSCALE             int comment '预警最大值（比例）',
   MEMO                 varchar(256) comment '备注',
   MONTHNUM             int comment '月排名数量',
   DAYNUM               int comment '日排名数量',
   primary key (LA_ID)
);

/*==============================================================*/
/* Table: HB_QRY_COLUMN_RULE                                    */
/*==============================================================*/
create table HB_QRY_COLUMN_RULE
(
   COL_RULE_ID          bigint not null auto_increment comment '列规则ID',
   QRY_RULE_ID          bigint comment '查询规则ID',
   COLUMN_ID            bigint comment '列ID，与表HB_COLUMN_INFO.HB_COLUMN_INFO对应
            ',
   SORT_FLAG            int default 0 comment '是否支持排序',
   SORT_TYPE            int default 0 comment '0:整数
            1:小数
            2:字符串
            4:时间',
   ORDER_ID             int comment '返回字段顺序ID',
   SELECT_COLUMN_EN     text comment '返回的英文列，逗号分隔',
   SELECT_COLUMN_CH     text comment '返回的中文列，逗号分隔',
   STATISTICS_METHOD    varchar(2000) comment '统计方法（1:SUM,2:AVG,3:MAX,4:MIN），格式，列名:统计方法为一个组，多个逗号隔开',
   SORT_COLUMN          varchar(64) comment '排序列',
   STATISTICS_FLAG      varchar(2000) comment '统计阶段（0：处理前统计，1：处理后统计）',
   primary key (COL_RULE_ID)
);

alter table HB_QRY_COLUMN_RULE comment '数据查询列规则表';

/*==============================================================*/
/* Table: HB_QRY_RULE                                           */
/*==============================================================*/
create table HB_QRY_RULE
(
   QRY_RULE_ID          bigint not null auto_increment comment '查询规则ID',
   DATA_SOURCE_ID       bigint,
   HB_TABLE_ID          bigint comment 'HB表ID号',
   SCANNER_CACHING_SIZE int default 10 comment '客户端游标缓存大小 scannerCachingSize',
   SCANNER_READ_CACHE_SIZE int default 500 comment '客户端读取缓存大小 hbase.client.scanner.caching',
   PARALLEL_NUM         int default 100 comment '并发访问数',
   QRY_TYPE             int default 0 comment '查询类型
            0:指定ROWKEY查询 ,可以以WEBSERVICE共享出去
            1:ROWKEY区间查询 ,可以以WEBSERVICE共享出去
            ',
   PAGINATION_SIZE      int default 0 comment '分页大小
            0：不分页
            其它：分页记录大小  
            受缓存 CLIENT_ROWS_BUFFER_SIZE 限制，记录超过缓存大小20%时不支持排序',
   SUPPORT_SORT         int default 0 comment '分页情况下的是否支持排序',
   DEF_SORT_COLUMN      varchar(64) comment '为空时不排序，以ROWKEY返回顺序输出 FAMILY:QUALIFIER
            ',
   CLIENT_ROWS_BUFFER_SIZE int default 0 comment '分页排序情况下缓存，客户端缓存记录大小,默认0 不缓存数据',
   LOG_FLAG             int comment '是否记录访问日志',
   STATE                int comment '0:有效，1:无效',
   QRY_RULE_NAME        varchar(256) comment '查询规则名称',
   QRY_RULE_MSG         varchar(256) comment '查询规则描述',
   CERT_AUTH_FLAG       int comment '是否需要认证访问',
   SORT_TYPE            int comment ' 0:整数 1:小数 2:字符串 3:时间',
   LOG_FLAG_DETAIL      int comment '是否展示详细日志信息0:否 1:是，默认1',
   DEPART_TYPE          int comment '业务类型',
   HBASE_TABLE_PARTITION varchar(256) comment '分区表规则（例如：test_{param1}）',
   primary key (QRY_RULE_ID)
);

alter table HB_QRY_RULE comment 'Hbase数据查询规则表';

/*==============================================================*/
/* Table: HB_QRY_RULE_CONDITION                                 */
/*==============================================================*/
create table HB_QRY_RULE_CONDITION
(
   FILTER_ID            bigint not null comment '过滤规则ID',
   QRY_RULE_ID          bigint comment '查询规则ID',
   MATCH_CONDITION      varchar(512) comment '匹配语句（只存放正则表达式类型的匹配语句）支持宏变量',
   CONDITION_TYPE       int comment '0表示条件类型，1表示正则表达式类型',
   EXPRE_CONDITION      varchar(512) comment '匹配条件表达式语句（存放条件语句、正则表达式与语句），支持宏变量
            正则时可用~分隔，第二部分做表达式计算
            ',
   ORDER_ID             int comment '排序ID',
   PATTERN_TYPE         int comment '0:匹配条件保留, 1:不匹配条件保留',
   primary key (FILTER_ID)
);

alter table HB_QRY_RULE_CONDITION comment '数据查询列规则条件表 ';

/*==============================================================*/
/* Table: HB_QRY_RULE_USER_REL                                  */
/*==============================================================*/
create table HB_QRY_RULE_USER_REL
(
   USER_ID              bigint,
   QRY_RULE_ID          bigint comment '查询规则ID'
);

alter table HB_QRY_RULE_USER_REL comment '用户和查询规则关系表 ';

/*==============================================================*/
/* Table: HB_SERVER_USER                                        */
/*==============================================================*/
create table HB_SERVER_USER
(
   USER_ID              bigint not null auto_increment,
   USER_NAME            varchar(32) comment '用户名',
   USER_PASS            varchar(32) comment '用户密码',
   USER_STATE           int comment '0：正常
            1：无效
            2：锁定',
   primary key (USER_ID)
);

alter table HB_SERVER_USER comment 'Hbase查询服务用户';

/*==============================================================*/
/* Table: HB_STATISTICS_LOG                                     */
/*==============================================================*/
create table HB_STATISTICS_LOG
(
   QRY_RULE_ID          bigint comment '与表HB_QRY_RULE的QRY_RULE_ID一致',
   USER_ID              bigint comment '与表HB_SERVER_USER的USER_ID一致',
   QRY_YEAR             varchar(8) comment '查询的年份',
   QRY_YEAR_MONTH       varchar(8) comment '查询的年月份',
   QRY_YEAR_MONTH_DAY   varchar(8) comment '查询的年月日',
   QRY_AVG_TOTAL_TIME   bigint comment '成功响应的总耗时平均值',
   QRY_AVG_QRY_TIME     bigint comment '成功查询的总耗时平均值',
   QRY_AVG_FILTER_TIME  bigint comment '成功过滤的总耗时平均值',
   QRY_AVG_PAGE_TIME    bigint comment '成功分页的总耗时平均值',
   QRY_AVG_RESPONSE_COUNT bigint comment '成功响应的记录数平均值',
   QRY_AVG_RESPONSE_TOTAL_COUNT bigint comment '成功响应的总记录数平均值',
   QRY_AVG_RESPONSE_MSG_SIZE bigint comment '成功响应的记录报文大小平均值',
   QRY_RUN_TIME         varchar(8) comment '范围：[1-24] ,如1-2点处理的任务，计入2点
             ',
   QRY_FAIL_COUNT       bigint comment '查询失败次数',
   QRY_SUCCESS_COUNT    bigint comment '查询成功次数',
   QRY_COUNT            bigint comment '查询总次数',
   QRY_FIRST_COUNT      bigint comment '非缓存查询的总次数',
   QRY_CACHE_COUNT      bigint comment '缓存查询的总次数  例如：分页查询获取',
   QRY_QUICK_COUNT      bigint comment '响应时间小于5秒内的总次数',
   QRY_PER_MAX_TIME     bigint comment '响应的最长耗时时间',
   QRY_CONCURRENCE_MAX  bigint comment '最大并发数',
   QRY_CONCURRENCE_AVG  bigint comment '平均并发数'
);

alter table HB_STATISTICS_LOG comment '用户查询日志表';

/*==============================================================*/
/* Table: HB_TABLE_INFO                                         */
/*==============================================================*/
create table HB_TABLE_INFO
(
   HB_TABLE_ID          bigint not null comment 'HB表ID号',
   DATA_SOURCE_ID       bigint,
   HB_TABLE_NAME        varchar(256) comment 'HB表名称',
   HB_TABLE_MSG         varchar(256) comment 'HB表描述',
   HB_STATUS            int default 0 comment '0:有效，1:无效，2:表不可用',
   COL_ZIP_TYPE         int default 0 comment '压缩类型 0,不压缩，1：lzo，2：gz，3：snappy',
   COL_MAX_VERSION      int default 3 comment '列最大版本 -1表示无限制',
   COL_MIN_VERSION      int comment '列最小版本',
   BLOCK_SIZE           int default 65536 comment '块大小 默认64 k',
   HFILE_MAXVAL         int default 268435456 comment 'hfile最大值 默认256 M',
   MEMSTORE_FLUSH       int default 67108864 comment '默认64M',
   BLOOM_TYPE           varchar(12) comment 'ROW，ROWCOL，NONE',
   NEWDATA_FLUSFLAG     int default 0 comment '新数据缓存   0不缓存，1缓存',
   TABLE_TTL            int default -1 comment '过期时间（秒） -1表示不过期',
   primary key (HB_TABLE_ID)
);

alter table HB_TABLE_INFO comment 'HBase表信息';

/*==============================================================*/
/* Table: HB_USER_QRY_LOG                                       */
/*==============================================================*/
create table HB_USER_QRY_LOG
(
   LOG_ID               bigint not null auto_increment,
   USER_ID              bigint,
   QRY_RULE_ID          bigint comment '查询规则ID',
   QRY_FLAG             int comment '是否成功返回',
   LOG_MSG              text comment '错误日志信息',
   QRY_START_DATE       datetime comment '查询开始时间',
   TOTAL_TIME           bigint comment '响应耗时',
   QRY_TOTAL_TIME       bigint comment '查询用时',
   QRY_FILTER_TIME      bigint comment '过滤时间',
   QRY_PAGE_TIME        bigint comment '分页耗时',
   FIRST_QRY            int comment '1:第一次查询,2:获取缓存数据',
   QRY_NUM              bigint comment '返回记录数',
   QRY_SUM_NUM          bigint comment '查询总记录数',
   QRY_SIZE             bigint comment '返回数据报文大小(字节)',
   primary key (LOG_ID)
);

alter table HB_USER_QRY_LOG comment '用户查询日志表';

/*==============================================================*/
/* Table: META_DATA_SOURCE                                      */
/*==============================================================*/
create table META_DATA_SOURCE
(
   DATA_SOURCE_ID       int not null comment '[注释]：数据源ID',
   DATA_SOURCE_NAME     varchar(64) comment '[注释]：数据源名称',
   DATA_SOURCE_ORANAME  varchar(32) comment '[注释]：数据源oracle名称或者FTP主机的IP地址',
   DATA_SOURCE_USER     varchar(20) comment '[注释]：oracle用户名称或者FTP用户名',
   DATA_SOURCE_PASS     varchar(20) comment '[注释]：登录密码',
   DATA_SOURCE_TYPE     varchar(256) comment '[注释]：数据源类型  TABLE、TXT、DMP、ZIP、FTP、LOCAL  支持FTP|ZIP|TXT   LOCAL|ZIP|TXT组合',
   DATA_SOURCE_RULE     varchar(256) comment '[注释]：数据源规则 如：文件时的分隔规则等 TXT:字段分隔符+*+*+行分隔符; DMP:,如果是表，则为JDBC连接串',
   DATA_SOURCE_STATE    int comment '[注释]：状态',
   DATA_SOURCE_INTRO    varchar(512) comment '[注释]：数据源用途说明',
   SYS_ID               int comment '[注释]：系统ID',
   DATA_SOURCE_MIN_COUNT int not null,
   DIM_USER             varchar(32) comment '[注释]：维度表用户',
   DIM_USER_PASS        varchar(32),
   DBLINK               varchar(32) comment '[注释]：元数据管理库到目标数据源的DBLINK（只适用于ORACLE）',
   DB_TYPE              int default 1 comment '[注释]：元数据管理库到目标数据源的DBLINK（只适用于ORACLE）'
);

alter table META_DATA_SOURCE comment 'META_DATA_SOURCE数据源';

/*==============================================================*/
/* Table: META_DIM_USER_DEPT                                    */
/*==============================================================*/
create table META_DIM_USER_DEPT
(
   DEPT_ID              bigint not null comment '[注释]：表类ID',
   DEPT_PAR_ID          bigint not null comment '[注释]：维度分组类型',
   DEPT_CODE            varchar(128) not null comment '[注释]：维度分组类型',
   DEPT_PAR_CODE        varchar(128) not null comment '[注释]：排序ID',
   DEPT_NAME            varchar(512) not null comment '[注释]：维度分组类型',
   DEPT_DESC            varchar(512) comment '[注释]：描述',
   DIM_TABLE_ID         bigint not null comment '[注释]：表类ID',
   DIM_TYPE_ID          bigint not null comment '[注释]：维度分组类型',
   STATE                bigint not null comment '[注释]：有效状态 0 无效 1有效',
   DIM_LEVEL            bigint not null comment '[注释]：层级1',
   MOD_FLAG             bigint not null comment '[注释]：修改标识 0正常 1新增 2修改',
   ORDER_ID             bigint not null comment '[注释]：排序ID'
);

alter table META_DIM_USER_DEPT comment 'META_DIM_USER_DEPT地域编码表';

/*==============================================================*/
/* Table: META_DIM_USER_STATION                                 */
/*==============================================================*/
create table META_DIM_USER_STATION
(
   STATION_ID           bigint not null,
   STATION_PAR_ID       bigint not null comment '[注释]：维度分组类型',
   STATION_CODE         varchar(128) not null comment '[注释]：维度分组类型',
   STATION_PAR_CODE     varchar(128) not null comment '[注释]：排序ID',
   STATION_NAME         varchar(512) not null comment '[注释]：维度分组类型',
   STATION_DESC         varchar(512) comment '[注释]：描述',
   DIM_TABLE_ID         bigint not null comment '[注释]：表类ID',
   DIM_TYPE_ID          bigint not null comment '[注释]：维度分组类型',
   STATE                bigint not null comment '[注释]：有效状态 0 无效 1有效',
   DIM_LEVEL            bigint not null comment '[注释]：层级1',
   MOD_FLAG             bigint not null comment '[注释]：修改标识 0正常 1新增 2修改',
   ORDER_ID             bigint not null comment '[注释]：排序ID'
);

alter table META_DIM_USER_STATION comment 'META_DIM_USER_STATION地域编码表';

/*==============================================================*/
/* Table: META_DIM_ZONE                                         */
/*==============================================================*/
create table META_DIM_ZONE
(
   ZONE_ID              bigint not null comment 'META_DIM_ZONE地域编码表',
   ZONE_PAR_ID          bigint not null,
   ZONE_CODE            varchar(12) not null,
   ZONE_NAME            varchar(64) not null,
   ZONE_DESC            varchar(512),
   DIM_TYPE_ID          bigint not null,
   STATE                int,
   DIM_LEVEL            bigint,
   MOD_FLAG             bigint,
   ORDER_ID             bigint,
   ODER_H               int,
   TEST_ADD_COL3        datetime,
   TEST_ADD_COL4        varchar(12),
   TEST_ADD_COL1        varchar(12),
   TEST_ADD_COL2        varchar(12),
   TEST_ADD_COL5        varchar(12),
   DIM_TABLE_ID         bigint,
   ZONE_PAR_CODE        varchar(12) comment '[注释]：排序ID'
);

/*==============================================================*/
/* Table: META_MAG_DELETE_LOG                                   */
/*==============================================================*/
create table META_MAG_DELETE_LOG
(
   LOG_ID               bigint not null comment '[标签]：日志ID',
   USER_ID              int not null comment '[标签]：用户名ID',
   DELETE_DATE          datetime not null comment '[标签]：删除时间',
   META_DATA_TYPE       varchar(8) not null comment '[标签]：元数据类型',
   META_DATA_ID         int not null comment '[标签]：元数据ID',
   REL_DATA             varchar(64) comment '[标签]：删除的关联元素',
   DELETE_SQL           longblob not null comment '[标签]：删除SQL',
   OBJ_INFO             longblob comment '[标签]：元数据信息[注释]：元数据信息'
);

alter table META_MAG_DELETE_LOG comment '元数据删除日志表';

/*==============================================================*/
/* Table: META_MAG_DRAFT                                        */
/*==============================================================*/
create table META_MAG_DRAFT
(
   DRAFT_ID             int not null,
   DRAFT_CONTENT        longblob,
   DRAFT_TITLE          varchar(128),
   DRAFT_DESC           varchar(512),
   BELONGS_MODEL        varchar(128),
   CREATE_TIME          datetime,
   LAST_MODIFY_TIME     datetime,
   USER_ID              int,
   primary key (DRAFT_ID),
   key AK_Key_1 (DRAFT_ID)
);

/*==============================================================*/
/* Table: META_MAG_FAVORITE_DIR                                 */
/*==============================================================*/
create table META_MAG_FAVORITE_DIR
(
   FAVORITE_ID          bigint not null comment '[注释]：收藏分类ID',
   USER_ID              bigint comment '[注释]：用户ID',
   FAVORITE_NAME        varchar(128) comment '[注释]：分类名',
   PARENT_ID            bigint comment '[注释]：父ID',
   FAVORITE_ORDER       int comment '[注释]：序号',
   FAVORITE_TYPE        int comment '[注释]：代码:1报表、2...'
);

alter table META_MAG_FAVORITE_DIR comment 'META_MAG_FAVORITE_DIR分类:元数据-报表设置.';

/*==============================================================*/
/* Table: META_MAG_LOGIN_LOG                                    */
/*==============================================================*/
create table META_MAG_LOGIN_LOG
(
   LOG_ID               bigint not null,
   USER_ID              bigint comment '[注释]：用户ID',
   LOGIN_IP             varchar(20) comment '[注释]：登录IP地址',
   LOGIN_MAC            varchar(32) comment '[注释]：登录计算机MAC地址',
   LOGIN_DATE           datetime comment '[注释]：登录时间',
   LOGOFF_DATE          datetime comment '[注释]：登出时间',
   GROUP_ID             int
);

alter table META_MAG_LOGIN_LOG comment 'META_MAG_LOGIN_LOG登录日志';

/*==============================================================*/
/* Table: META_MAG_MAINTAIN_COLUMN                              */
/*==============================================================*/
create table META_MAG_MAINTAIN_COLUMN
(
   MAINTAIN_COLUMN_ID   bigint not null,
   MAINTAIN_COLUMN_NAME varchar(32) comment '[注释]：维护表列名称',
   MAINTAIN_COLUMN_NAMECN varchar(128) comment '[注释]：维护列中文名称',
   DATA_FROM            varchar(2000) comment '[注释]：数据来源
            可以为一个SQL，或者为
            a:name1,b:name2格式的下拉框数据。',
   DATASOURCE_ID        bigint,
   VALIDATE_RULE        varchar(256),
   COLUMN_DESC          varchar(256) comment '[注释]：如果存在字段描述，在编辑/新增有提示'
);

alter table META_MAG_MAINTAIN_COLUMN comment 'META_MAG_MAINTAIN_COLUMN';

/*==============================================================*/
/* Table: META_MAG_MAINTAIN_QUERY                               */
/*==============================================================*/
create table META_MAG_MAINTAIN_QUERY
(
   MAINTAIN_QUERY_ID    bigint not null,
   MAINTAIN_ID          bigint not null,
   QUERY_COLUMNS        varchar(512) comment '[注释]：查询列，可以为多个，当为多个的时候以","分隔，并且查询所有列都为LIKE的关系。',
   IS_LIKE_QUERY        varchar(32) comment '[注释]：0--表示为普通查询
            1--表示为模糊查询，模糊查询可以对应多列',
   QUERY_COLUMN_TITLE   varchar(32),
   QUERY_CONTROL        int comment '[注释]：0:表示INPUT框,
            1:表示SELECT框',
   ORDER_ID             bigint
);

alter table META_MAG_MAINTAIN_QUERY comment 'META_MAG_MAINTAIN_QUERY表维护查询条件配置';

/*==============================================================*/
/* Table: META_MAG_MENU                                         */
/*==============================================================*/
create table META_MAG_MENU
(
   MENU_ID              bigint not null,
   PARENT_ID            bigint,
   MENU_NAME            varchar(64),
   MENU_TIP             varchar(128),
   PAGE_BUTTON          varchar(512),
   GROUP_ID             int,
   ORDER_ID             int,
   IS_SHOW              int,
   CREATE_DATE          datetime,
   TARGET               varchar(32),
   USER_ATTR            int,
   NAV_STATE            int,
   USER_ATTR_LIST       varchar(128),
   MENU_STATE           int,
   MENU_NOTE            varchar(2000),
   ICON_URL             varchar(512),
   MENU_URL             varchar(512)
);

/*==============================================================*/
/* Table: META_MAG_MENU_USER_FAVORITE                           */
/*==============================================================*/
create table META_MAG_MENU_USER_FAVORITE
(
   MENU_FAVORITE_ID     bigint not null comment '[注释]：菜单收藏ID',
   MENU_ID              bigint not null comment '[注释]：菜单ID',
   FAVORITE_ID          bigint not null comment '[注释]：收藏分类ID',
   USER_ID              bigint not null comment '[注释]：用户ID',
   FAVORITE_MENU_TIME   datetime not null comment '[注释]：收藏时间',
   FAVORITE_MENU_ORDER  int not null comment '[注释]：序号'
);

alter table META_MAG_MENU_USER_FAVORITE comment 'META_MAG_MENU_USER_FAVORITE分类:元数据-菜单收藏';

/*==============================================================*/
/* Table: META_MAG_MENU_VISIT_LOG                               */
/*==============================================================*/
create table META_MAG_MENU_VISIT_LOG
(
   VISIT_ID             bigint not null,
   MENU_ID              bigint not null,
   USER_ID              bigint not null comment '[注释]：用户ID',
   LOG_ID               bigint not null,
   VISIT_TIME           datetime comment '[注释]：访问时间',
   YEAR_NO              int comment '[注释]：年份，用于分区'
);

alter table META_MAG_MENU_VISIT_LOG comment 'META_MAG_MENU_VISIT_LOG菜单访问日志';

/*==============================================================*/
/* Table: META_MAG_MONITOR                                      */
/*==============================================================*/
create table META_MAG_MONITOR
(
   REPEATINTERVAL       int comment '内存刷新时间间隔(毫秒)',
   WEBINTERVAL          int comment '前台刷新时间间隔(毫秒)',
   ISAUTOREFRESH        int comment '是否自动刷新（1，是，0否）',
   ISMANUREFRESH        int comment '是否手动刷新（1，是，0否）',
   HADOOPJOBURL         varchar(128) comment 'Hadoop Job Tracker地址',
   HADOOPVERSION        varchar(12) comment 'Hadoop版本号'
);

/*==============================================================*/
/* Table: META_MAG_NOTICE                                       */
/*==============================================================*/
create table META_MAG_NOTICE
(
   NOTICE_ID            bigint not null comment 'id',
   NOTICE_TITLE         varchar(64) comment '公告标题',
   NOTICE_TYPE          int comment '1. 一般公告，2：领导批示',
   NOTICE_LEVEL         int comment '1. 一般   2.较急  3.加急  4. 紧急',
   NOTICE_STATE         int comment '1、有效，无效',
   UPDATE_DATE          datetime comment '公告修改时间',
   INIT_DATE            datetime comment '公告注册时间',
   NOTICE_USER          varchar(32) comment '公告发布人',
   EFFECT_DATE          datetime comment '公告生效时间，如果为null，自发布之日起就生效。',
   FAILURE_DATE         datetime comment '公告失效时间，如果为null，需要手动修改公告为失效',
   NOTICE_CONTENT       longblob comment '公告内容',
   primary key (NOTICE_ID),
   key META_MAG_NOTICE (NOTICE_ID)
);

/*==============================================================*/
/* Table: META_MAG_PROBLEM_DEAL                                 */
/*==============================================================*/
create table META_MAG_PROBLEM_DEAL
(
   DEAL_ID              bigint not null comment '处理ID',
   ASK_USER             varchar(32) not null comment '提出人',
   ASK_AREA             int comment '码表 1 四川、2 安徽、3 青海、4 陕西',
   ASK_DATE             datetime comment '提出日期',
   PROBLEM_TITLE        varchar(128) comment '问题主题',
   PROBLEM_NOTE         longblob not null comment '问题描述',
   DEAL_USER_ID         bigint comment '处理人',
   DEAL_TIME            varchar(32) comment '处理耗时',
   FINISH_DATE          datetime comment '处理结束日期',
   PROBLEM_TYPE         int comment '问题类型（码表
                 1  咨询
                 2 程序缺陷引起
                 3 布署错误引起
                 4 数据原因引起
                 5 操作失误引起
                 6 建议或需求）',
   DEAL_NOTE            longblob comment '解决过程方案',
   FINISH_FLAG          int comment '是否已解决（0 未解决 1 已解决）',
   RETURN_NOTE          text comment '反馈时间和内容',
   NEXT_NOTE            text comment '通知下一步的时间人员和内容',
   primary key (DEAL_ID),
   key PK_META_MAG_PROBLEM_DEAL (DEAL_ID)
);

alter table META_MAG_PROBLEM_DEAL comment '实施问题处理';

/*==============================================================*/
/* Table: META_MAG_ROLE                                         */
/*==============================================================*/
create table META_MAG_ROLE
(
   ROLE_ID              bigint not null comment '[注释]：角色ID',
   ROLE_NAME            varchar(64) comment '[注释]：角色名称',
   ROLE_DESC            varchar(256) comment '[注释]：角色描述',
   ROLE_STATE           int comment '[注释]：代码:0无效、1有效.
            角色状态',
   CREATE_DATE          datetime
);

alter table META_MAG_ROLE comment 'META_MAG_ROLE管理角色表';

/*==============================================================*/
/* Table: META_MAG_ROLE_DIM                                     */
/*==============================================================*/
create table META_MAG_ROLE_DIM
(
   ROLE_DIM_REL_ID      bigint not null comment '[注释]：角色维度关联ID',
   ROLE_ID              bigint not null comment '[注释]：角色ID',
   DIM_TABLE_ID         bigint not null comment '[注释]：表类ID',
   DIM_TYPE_ID          int not null comment '[注释]：维度归并类型ID',
   USE_USER_ATTR        int not null comment '[注释]：是否绑定用户属性
            0：否，1向下级联，2不级联，3向上级联。
            注意：只有地域、部门、岗位三个维度有此选项
            
            注意：只有地域、部门、岗位三个维度有此选项',
   DYN_COL_ID           bigint comment '动态维度字段'
);

alter table META_MAG_ROLE_DIM comment 'META_MAG_ROLE_DIM角色维度关系表';

/*==============================================================*/
/* Table: META_MAG_ROLE_DIM_DETAIL                              */
/*==============================================================*/
create table META_MAG_ROLE_DIM_DETAIL
(
   ROLE_DIM_REL_ID      bigint not null comment '[注释]：角色维度关联ID',
   DIM_CODE             varchar(20) not null comment '[注释]：维度编码值',
   FLAG                 int not null comment '[注释]：代码:0包含、1排除.
            赋权类型 0：包含，默认
            1：排除',
   TRANSFER_TYPE        int not null comment '[注释]：传递类型：0，向上传递；1，向下传递；2，不传递',
   DIM_LEVEL            int not null comment '[注释]：支持的最细粒度层级'
);

alter table META_MAG_ROLE_DIM_DETAIL comment 'META_MAG_ROLE_DIM_DETAIL角色维度关系具体值';

/*==============================================================*/
/* Table: META_MAG_ROLE_GDL                                     */
/*==============================================================*/
create table META_MAG_ROLE_GDL
(
   ROLE_ID              bigint not null comment '[注释]：角色ID',
   GDL_ID               bigint not null comment '[注释]：指标ID',
   FLAG                 int not null comment '[注释]：权限标识（1包含，0排除）默认1.'
);

alter table META_MAG_ROLE_GDL comment 'META_MAG_ROLE_GDL角色指标关系';

/*==============================================================*/
/* Table: META_MAG_ROLE_MENU                                    */
/*==============================================================*/
create table META_MAG_ROLE_MENU
(
   ROLE_ID              bigint not null comment '[注释]：角色ID',
   MENU_ID              bigint not null comment '[注释]：菜单ID',
   EXCLUDE_BUTTON       varchar(128) comment '[注释]：没有权限的按钮',
   MAP_TYPE             int comment '[注释]：代码:1具有(加法),0不具有(减法)'
);

alter table META_MAG_ROLE_MENU comment 'META_MAG_ROLE_MENU角色菜单权限表';

/*==============================================================*/
/* Table: META_MAG_ROLE_ORG                                     */
/*==============================================================*/
create table META_MAG_ROLE_ORG
(
   ROLE_ID              bigint not null comment '部门岗位批量授权表',
   STATION_ID           int not null comment '部门岗位批量授权表',
   DEPT_ID              int not null comment '部门岗位批量授权表'
);

alter table META_MAG_ROLE_ORG comment '部门岗位批量授权表';

/*==============================================================*/
/* Table: META_MAG_TABLE_MAINTAIN                               */
/*==============================================================*/
create table META_MAG_TABLE_MAINTAIN
(
   MAINTAIN_ID          bigint not null,
   MAINTAIN_TABLE_NAME  varchar(32) not null,
   MAINTAIN_SEQ         varchar(32) comment '[注释]：维护表序列名称，可为空，不存在则表示此表维护不需要序列',
   TABLE_PRIMARY_ID_COLUMN varchar(32),
   DATASOURCE_ID        bigint not null comment '[注释]：表所在数据源，必须',
   QUERY_COLUMNS        varchar(2000) not null comment '[注释]：查询列集合，如果此列为空，默认为除ID键值之外的所有字段。',
   EDIT_COLUMNS         varchar(2000) not null comment '[注释]：编辑列，如果为空，默认与查询列相同。',
   TABLE_TITLE          varchar(128),
   QUERY_PERCENTAGE     varchar(256) comment '[注释]：查询百分比，应该包含操作列'
);

alter table META_MAG_TABLE_MAINTAIN comment 'META_MAG_TABLE_MAINTAIN';

/*==============================================================*/
/* Table: META_MAG_TIMER                                        */
/*==============================================================*/
create table META_MAG_TIMER
(
   TIMER_ID             bigint not null comment '[注释]：定时任务ID',
   TIMER_TYPE           int comment '[注释]：定时任务类型
            1、简单循环定时任务，此类型描述什么时候开始以一定的间隔时间进行定时任务执行。
            2、每天定时执行，此类型描述定时任务在每天的什么时候开始执行。
            3、每周定时执行，此类型描述定时任务在每周的星期几什么时间点执行。
            4、每月定时任务，此类型描述定时任务在每月的那天什么时间点定时执行。
            5、每年定时任务，此类型描述定时任务在每年的那月那天那个时间点定点执行。
            6、固定时间定时任务，表示在那几个时间点定点执行一次。
            7、自定义类型定时器，此类型用于自定义CRON表达式。',
   TIMER_RULE           varchar(128) comment '[注释]：定时任务规则，对于不同的任务类型，其规则定义如下：
            1、简单循环定时任务，其规则如下存储：
            “执行次数,间隔时间,开始时间,结束时间“。开始时间与结束时间格式,间隔时间为毫秒为:YYYYMMDDHHMISS,如果不存在结束时间可以不写，如：
            3,300,20120909111211,2012090913121
            表示从20120909111211间隔300毫秒执行三次
            或者
            3,300,20120909111211
            2、每天定时执行任务，其规则如下存储:
            “每天任务执行时间”,时间格为:“HHMISS“;
            3、每周定时执行任务，其规则如下存储:
            “星期数,执行时间”,时间格为:“HHMISS“,如
            3,152121表示每周三，15点21分21秒执行此定时任务
            4、每月定时任务，其规则如下存储:
            “每月执行天,执行时间“，时间格为:“HHMISS“,如“3,152121“表示每月3号15点21分21秒执行此定时任务
            5、每年定时任务，其规则如下存储:“每年执行月,每年执行天,执行时间“，时间格式为:“HHMISS“,,如“3,3,152121“表示每年3月月3号15点21分21秒执行此定时任务
            6、固定时间定时任务，其存储规则如下:“
            具体执行时间1,具体执行时间2,...“,表示固定点某些时间执行，时间可以多个，时间格式为“YYYYMMDDHHMISS“,如:‘2012121212,2012111111‘
            7、自定义类型定时器，参考quartz CRON表达式',
   TIMER_STATE          int comment '[注释]：表示此定时任务是否有效，1：有效，0：无效',
   TIMER_CLASS          varchar(256) comment '[注释]：表示实现了接口IMetaTimer的实现类名，每个定时任务必有一个实现类',
   TIMER_DESC           varchar(512),
   TIMER_START_TIME     varchar(20) comment '[注释]：开始时间：yyyyMMddHHmmss',
   TIMER_END_TIME       varchar(20) comment '[注释]：结束时间：yyyyMMddHHmmss'
);

alter table META_MAG_TIMER comment 'META_MAG_TIMER系统定时任务表';

/*==============================================================*/
/* Table: META_MAG_USER                                         */
/*==============================================================*/
create table META_MAG_USER
(
   USER_ID              bigint not null comment '用户ID',
   USER_EMAIL           varchar(64) comment '用户电邮,用电邮地址登录，并接收电邮提醒',
   USER_PASS            varchar(32) comment '用户密码',
   USER_NAMECN          varchar(20) comment '用户中文名称',
   USER_MOBILE          varchar(12) comment '用户手机号，用于短信提醒',
   STATE                int comment '代码:0禁用、1有效、2待审核、3锁定.
            用户状态
            0：禁用(不可登录)
            1：有效使用的
            2：待审核的
            3：锁定的',
   ADMIN_FLAG           int comment '是否是超级管理员:0不是、1是.',
   HEAD_SHIP            varchar(32) comment '职务',
   CREATE_DATE          datetime,
   USER_NAMEEN          varchar(64),
   OA_USER_NAME         varchar(64),
   ZONE_ID              bigint comment '地域编码ID   META_DIM_ZONE.zone_id',
   USER_SN              int,
   VIP_FLAG             int comment '代码:0否、1是.',
   GROUP_ID             bigint comment '默认系统',
   ALLOW_IP             varchar(256) comment '允许IP段，如192.168.1.1-192.168.1.200',
   EFFECT_TIME          datetime comment '生效时间，如2012-12-01',
   LOSEEFFECT_TIME      datetime comment '失效时间，如2012-12-21',
   STATION_ID           int,
   DEPT_ID              int,
   DEFAULT_URL          varchar(512),
   CNL_USER_NAME        varchar(256) comment '渠道用户名',
   primary key (USER_ID)
);

alter table META_MAG_USER comment '管理用户表';

/*==============================================================*/
/* Table: META_MAG_USER_CHANGE_LOG                              */
/*==============================================================*/
create table META_MAG_USER_CHANGE_LOG
(
   LOG_ID               bigint not null,
   USER_ID              bigint comment '[注释]：用户ID',
   CHANGE_TYPE          int comment '[注释]：代码:1密码变动、2状态变动
            变动类型',
   CHANGE_TIME          datetime comment '[注释]：变动时间，如2012-12-21 23:30:45',
   EDITOR_TYPE          int comment '[注释]：代码:1系统、2人
            维护人类型',
   EDITOR_ID            bigint comment '[注释]：维护人的ID，如张三去修改李四的状态，则本字段为张三'
);

alter table META_MAG_USER_CHANGE_LOG comment 'META_MAG_USER_CHANGE_LOG用户修改日志';

/*==============================================================*/
/* Table: META_MAG_USER_DIM_DETAIL                              */
/*==============================================================*/
create table META_MAG_USER_DIM_DETAIL
(
   DIM_CODE             varchar(20) not null comment '[注释]：维度编码值',
   TRANSFER_TYPE        int not null comment '[注释]：传递类型：0，向上传递；1，向下传递；2，不传递',
   FLAG                 int not null comment '[注释]：代码:1包含、0排除.
            赋权类型 1：包含，默认
            0：排除',
   USER_ID              bigint not null comment '[注释]：用户ID',
   DIM_TABLE_ID         bigint not null comment '[注释]：表类ID',
   DIM_TYPE_ID          int not null comment '[注释]：维度归并类型ID',
   DIM_LEVEL            int not null comment '[注释]：支持的最细粒度层级',
   USER_DIM_REL_ID      bigint not null
);

alter table META_MAG_USER_DIM_DETAIL comment 'META_MAG_USER_DIM_DETAIL角色维度关系具体值';

/*==============================================================*/
/* Table: META_MAG_USER_GDL                                     */
/*==============================================================*/
create table META_MAG_USER_GDL
(
   USER_ID              bigint not null comment '[注释]：用户ID',
   GDL_ID               bigint not null comment '[注释]：指标ID',
   FLAG                 int not null comment '[标签]：权限标识[注释]：权限标识（1包含，0排除）默认1.'
);

alter table META_MAG_USER_GDL comment 'META_MAG_USER_GDL角色指标关系';

/*==============================================================*/
/* Table: META_MAG_USER_MENU                                    */
/*==============================================================*/
create table META_MAG_USER_MENU
(
   USER_ID              bigint not null comment '[注释]：用户ID',
   MENU_ID              bigint not null comment '[注释]：菜单ID',
   EXCLUDE_BUTTON       varchar(128) comment '[注释]：没有权限的按钮',
   FLAG                 int comment '[注释]：代码:0添加、1减少.
            赋权类型 0：添加，默认
            1：减少'
);

alter table META_MAG_USER_MENU comment 'META_MAG_USER_MENU用户菜单权限表';

/*==============================================================*/
/* Table: META_MAG_USER_ROLE                                    */
/*==============================================================*/
create table META_MAG_USER_ROLE
(
   USER_ID              bigint not null comment '[注释]：用户ID',
   ROLE_ID              bigint not null comment '[注释]：角色ID',
   GRANT_FLAG           int comment '[注释]：代码:0否、1是.
            是否能将此角色授与他人',
   MAG_FLAG             int comment '[注释]：代码:0不具有、1具有.
            是否对此角色有管理权限，在有角色权限菜单管理权限时是否有权管理此角色'
);

alter table META_MAG_USER_ROLE comment 'META_MAG_USER_ROLE用户角色列表';

/*==============================================================*/
/* Table: META_MAG_USER_SEARCH_LOG                              */
/*==============================================================*/
create table META_MAG_USER_SEARCH_LOG
(
   LOG_ID               bigint not null comment '[注释]：搜索日志ID',
   USER_ZONE_ID         bigint comment '[注释]：搜索人地域',
   USER_DEPT_ID         bigint comment '[注释]：搜索人部门',
   USER_STATION_ID      bigint comment '[注释]：搜索人岗位',
   USER_ID              bigint comment '[注释]：用户ID',
   KEYWORD              varchar(128) comment '[注释]：关键字',
   KEYWORD_TYPE         int comment '[注释]：代码:1报表搜索、2数据搜索
            搜索分类'
);

alter table META_MAG_USER_SEARCH_LOG comment 'META_MAG_USER_SEARCH_LOG分类:元数据-报表设置.';

/*==============================================================*/
/* Table: META_MAG_USER_TAB_REL                                 */
/*==============================================================*/
create table META_MAG_USER_TAB_REL
(
   REL_ID               bigint not null,
   TABLE_ID             bigint not null comment '[注释]：表类ID',
   REL_TYPE             int comment '[注释]：代码:0申请、1建立、2修改、3维护.
            关系类型
            1：建立
            2：修改
            3：维护',
   USER_ID              bigint not null comment '[注释]：用户ID',
   TABLE_STATE          int comment '[注释]：表状态 0:无效，1：有效，2：修改状态',
   TABLE_VERSION        int not null comment '[注释]：版本号,同一表类ID状态为有效的版本号只能有一个',
   TABLE_NAME           varchar(64) comment '[注释]：表名称',
   STATE_DATE           datetime comment '[注释]：状态时间',
   STATE_MARK           varchar(512) comment '[注释]：状态说明，如果是审核，则是审核意见，返回意见等',
   LAST_REL_ID          bigint
);

alter table META_MAG_USER_TAB_REL comment 'META_MAG_USER_TAB_REL描述用户与表关系';

/*==============================================================*/
/* Table: META_MENU_GROUP                                       */
/*==============================================================*/
create table META_MENU_GROUP
(
   GROUP_ID             int not null,
   GROUP_NAME           varchar(64),
   GROUP_SN             int,
   GROUP_STATE          varchar(12) comment '[注释]：代码:0无效、1有效',
   GROUP_LOGO           varchar(32),
   DEFAULT_SKIN         int,
   FRAME_URL            varchar(128) comment '[注释]：框架地址,为空则使用默认的框架页面'
);

alter table META_MENU_GROUP comment 'META_MENU_GROUP菜单分组管理表';

/*==============================================================*/
/* Table: META_MR_TYPE                                          */
/*==============================================================*/
create table META_MR_TYPE
(
   TYPE_ID              int not null comment '业务类型ID',
   TYPE_NAME            varchar(64) comment '业务类型名称',
   primary key (TYPE_ID)
);

/*==============================================================*/
/* Table: META_MR_USERTYPE                                      */
/*==============================================================*/
create table META_MR_USERTYPE
(
   TYPE_ID              int comment '业务类型ID',
   USER_ID              bigint comment '用户ID'
);

alter table META_MR_USERTYPE comment '用户与业务类型关系
一个用户可以有多个业务类型';

/*==============================================================*/
/* Table: META_MR_USER_ADDACTION                                */
/*==============================================================*/
create table META_MR_USER_ADDACTION
(
   USER_ID              bigint not null comment '用户ID',
   ACTION_TYPE          int not null comment '操作类型
            1001:采集新增下载,
            2001:采集新增上传,
            3001:数据处理新增
            4001:数据服务规则新增
            5001:采集下载查看所有(全局)
            6001:采集上传查看所有(全局)
            7001:数据处理查看所有(全局)
            8001:数据服务规则查看所有(全局)
            ',
   CREATE_USER_ID       bigint comment '授权用户ID  用户ID，通常是管理员',
   CREATE_USER_DATE     varchar(20) comment '授权时间',
   primary key (USER_ID, ACTION_TYPE)
);

alter table META_MR_USER_ADDACTION comment '用户新增权限';

/*==============================================================*/
/* Table: META_MR_USER_AUTHOR                                   */
/*==============================================================*/
create table META_MR_USER_AUTHOR
(
   USER_ID              bigint not null comment '用户ID',
   TASK_ID              bigint not null comment '具体的任务ID，根据TASK_TYPE确定
            1:数据采集
            2:数据处理
            3:数据服务',
   TASK_TYPE            int not null comment '1:数据采集
            2:数据处理
            3:数据服务',
   VIEW_ACTION          int comment '0:有效,1:无效',
   MODIFY_ACTION        int comment '0:有效,1:无效',
   DELETE_ACTION        int comment '0:有效,1:无效',
   CREATE_USER_ID       bigint comment '用户ID',
   STATUS               int comment '0:有效，1:无效, 默认为0
            当某个用户转为给某个用户时，则授权的用户status为无效，记录不删除，然后新增记录',
   CREATE_DATE          varchar(20),
   primary key (USER_ID, TASK_ID, TASK_TYPE)
);

alter table META_MR_USER_AUTHOR comment '用户操作级权限表';

/*==============================================================*/
/* Table: META_SYS                                              */
/*==============================================================*/
create table META_SYS
(
   SYS_ID               int not null comment '[注释]：系统ID',
   SYS_NAME             varchar(32) comment '[注释]：系统名称',
   SYS_DESC             varchar(64) comment '[注释]：描述'
);

alter table META_SYS comment 'META_SYS对各源系统进行编码';

/*==============================================================*/
/* Table: META_SYS_CODE                                         */
/*==============================================================*/
create table META_SYS_CODE
(
   CODE_ID              int not null comment '[注释]：编码ID',
   CODE_TYPE_ID         int not null comment '[注释]：编码类型ID',
   CODE_NAME            varchar(32) not null comment '[注释]：编码名称',
   CODE_VALUE           varchar(32) not null comment '[注释]：编码值',
   ORDER_ID             int not null comment '[注释]：排序ID'
);

alter table META_SYS_CODE comment 'META_SYS_CODE元数据表的编码';

/*==============================================================*/
/* Table: META_SYS_CODE_TYPE                                    */
/*==============================================================*/
create table META_SYS_CODE_TYPE
(
   CODE_TYPE_ID         int not null comment '[注释]：编码类型ID',
   DIR_ID               int not null comment '[注释]：目录ID',
   TYPE_CODE            varchar(128) not null comment '[注释]：类型编码值',
   CODE_TYPE_NAME       varchar(32) not null comment '[注释]：编码类型名称',
   IS_EDITABLE          int not null comment '[注释]：是否可编辑(0：不可编辑，1：可编辑)',
   DESCRIPTION          varchar(512) comment '[注释]：描述'
);

alter table META_SYS_CODE_TYPE comment 'META_SYS_CODE_TYPE分类:元数据-组织权限.';

/*==============================================================*/
/* Table: META_SYS_CODE_TYPE_DIR                                */
/*==============================================================*/
create table META_SYS_CODE_TYPE_DIR
(
   DIR_ID               int not null comment '[注释]：目录ID',
   PARENT_DIR_ID        int not null comment '[注释]：父级目录ID',
   DIR_NAME             varchar(64) not null comment '[注释]：目录名'
);

alter table META_SYS_CODE_TYPE_DIR comment 'META_SYS_CODE_TYPE_DIR分类:元数据-组织权限.';

/*==============================================================*/
/* Table: META_SYS_EMAIL_CFG                                    */
/*==============================================================*/
create table META_SYS_EMAIL_CFG
(
   CFG_ID               int not null comment '[标签]：配置ID[注释]：配置ID',
   CONTENT_SQL          longblob not null comment '[标签]：内容获取SQL[注释]：内容获取SQL',
   TOPIC                varchar(512) not null comment '[标签]：邮件主题[注释]：邮件标题,邮件标题中可能会存在宏变量',
   CONTENT              longblob not null comment '[标签]：内容[注释]：内容,内容中可能会存在宏变量',
   TARGET_USER_TYPE     int not null comment '[标签]：目标用户类型[注释]：1、用户，2、角色',
   TARGET_USER          varchar(512) not null comment '[标签]：目标用户群[注释]：此处可使用两种类型参数：固定值和宏变量，其中宏变量必须是来自内容获取SQL中获取出的字段',
   CYCLE_TYPE           int not null comment '[标签]：检查周期类型[注释]：检查周期类型
            1、分，2、小时，3、周，4、日，5、月',
   CYCLE_RULE           varchar(512) not null comment '[标签]：检查周期表达式[注释]：检查周期值',
   FAILED_TRY_TIMES     int not null comment '[标签]：失败重复尝试次数[注释]：失败重复尝试次数',
   STATE                int not null comment '[标签]：状态[注释]：状态
            0：无效，1：有效'
);

alter table META_SYS_EMAIL_CFG comment '系统邮件配置表';

/*==============================================================*/
/* Table: META_SYS_EMAIL_SEND_LOG                               */
/*==============================================================*/
create table META_SYS_EMAIL_SEND_LOG
(
   LOG_ID               bigint not null comment '[标签]：日志ID[注释]：日志ID',
   CFG_ID               int not null comment '[标签]：配置ID[注释]：配置ID',
   EMAIL                varchar(64) not null comment '[标签]：邮箱地址[注释]：邮箱地址',
   TOPIC                varchar(512) not null comment '[标签]：主题',
   CONTENT              longblob not null comment '[标签]：内容[注释]：内容,此处内容不存在宏变量',
   IS_SUCCESS           int not null comment '[标签]：是否发送成功[注释]：是否发送成功
            0：否，1：是',
   ERROR_MSG            longblob comment '[标签]：错误消息[注释]：错误消息',
   SEND_TIME            datetime not null comment '[标签]：发送时间[注释]：发送时间',
   FIRST_SEND_TIME      datetime not null comment '[标签]：首次发送时间[注释]：首次发送时间（用于推算重试记录）',
   SEND_SN              int comment '[标签]：发送序号[注释]：发送序号（每次触发时，发送记录的序号）'
);

alter table META_SYS_EMAIL_SEND_LOG comment '邮件发送日志表邮件发送日志表';

/*==============================================================*/
/* Table: META_SYS_I18N_ITEM                                    */
/*==============================================================*/
create table META_SYS_I18N_ITEM
(
   I18N_ITEM_ID         int not null comment '[注释]：国际化项ID',
   I18N_ITEM_CODE       varchar(20) not null comment '[注释]：国际化项编码',
   MAX_LENGTH           int comment '[注释]：最大长度',
   VAL_TEXT             varchar(512) comment '[注释]：消息文本',
   MENU_ID              bigint not null comment '[注释]：菜单ID'
);

alter table META_SYS_I18N_ITEM comment 'META_SYS_I18N_ITEM分类:元数据-组织权限.';

/*==============================================================*/
/* Table: META_SYS_I18N_RESOURCE                                */
/*==============================================================*/
create table META_SYS_I18N_RESOURCE
(
   RESOURCE_ID          int not null comment '[注释]：资源ID',
   MENU_ID              bigint not null comment '[注释]：菜单ID',
   RESOUCE_CODE         varchar(32),
   RESOURCE_NAME        varchar(32) not null comment '[注释]：资源用途名称',
   RESOURCE_PATH        varchar(256) not null comment '[注释]：资源路径'
);

alter table META_SYS_I18N_RESOURCE comment 'META_SYS_I18N_RESOURCE分类:元数据-组织权限.';

/*==============================================================*/
/* Table: MR_DATA_SOURCE                                        */
/*==============================================================*/
create table MR_DATA_SOURCE
(
   DATA_SOURCE_ID       bigint not null auto_increment comment '数据源ID',
   SOURCE_TYPE_ID       bigint comment '源类型ID',
   DATA_SOURCE_NAME     varchar(256) comment '数据源名称',
   SOURCE_CATE          int comment '0:数据处理类型 1:数据采集类型,2:运行系统数据源, 默认为0, ',
   primary key (DATA_SOURCE_ID)
);

alter table MR_DATA_SOURCE comment 'MR数据源表';

/*==============================================================*/
/* Table: MR_DATA_SOURCE_PARAM                                  */
/*==============================================================*/
create table MR_DATA_SOURCE_PARAM
(
   DATA_SOURCE_ID       bigint not null,
   PARAM_NAME           varchar(128) not null comment '参数名称',
   PARAM_VALUE          varchar(512),
   PARAM_DESC           varchar(2000),
   primary key (DATA_SOURCE_ID, PARAM_NAME)
);

alter table MR_DATA_SOURCE_PARAM comment '数据源参数表';

/*==============================================================*/
/* Table: MR_DATA_SOURCE_PARAM_DEFAULT                          */
/*==============================================================*/
create table MR_DATA_SOURCE_PARAM_DEFAULT
(
   SOURCE_DB_TYPE       bigint not null default 0 comment '数据源类型ID，与MR_SOURCE_TYPE.SOURCE_DB_TYPE对应，源类型对应的所属默认资源(例如：jdbc数据库、hbase数据库)类型
             ',
   SOURCE_PARAM_NAME    varchar(128) not null comment '数据源默认参数名称',
   ORDER_ID             bigint,
   SOURCE_DESC          varchar(512) comment '参数描述',
   primary key (SOURCE_DB_TYPE, SOURCE_PARAM_NAME)
);

alter table MR_DATA_SOURCE_PARAM_DEFAULT comment '数据源的默认参数';

/*==============================================================*/
/* Table: MR_FILE_LIST                                          */
/*==============================================================*/
create table MR_FILE_LIST
(
   FILE_ID              varchar(128) not null comment '通过：数据源id+FILE_PATH，生成文件ID',
   DATA_SOURCE_ID       bigint comment '数据源ID',
   FILE_PATH            varchar(512) comment '文件绝对路径',
   FILE_SIZE            bigint comment '文件大小，单位B',
   RECORD_TIME          varchar(20) comment '年月日时分秒',
   RECORD_MONTH         varchar(8) comment '记录月份',
   primary key (FILE_ID)
);

alter table MR_FILE_LIST comment '文件列表';

/*==============================================================*/
/* Table: MR_FTP_COL_DETAIL_FILELOG                             */
/*==============================================================*/
create table MR_FTP_COL_DETAIL_FILELOG
(
   ID                   bigint not null,
   COL_ID               bigint comment '采集ID',
   COL_LOG_ID           bigint comment '针对一次采集任务的日志ID',
   FILE_ID              varchar(256) comment '文件ID 与MR_FILE_LIST表.FILE_ID对应',
   START_TIME           datetime comment '采集开始时间',
   END_TIME             datetime comment '采集结束时间',
   INPUT_FILE_NAME      varchar(256) comment '源文件名',
   OUTPUT_FILE_NAME     varchar(256) comment '目标文件名',
   INPUT_PATH           varchar(256) comment '源文件目录',
   OUTPUT_PATH          varchar(256) comment '目标文件目录',
   FILE_SIZE            bigint comment '文件大小',
   STATUS               int comment '写入HDFS是否成功状态 0:初始化, 1:成功, 2:失败',
   IS_OUTPUT_RENAME     int comment '是否重命名 0:不需要重命名输出文件， 1：需要重命名输出文件',
   OUTPUT_RENAME_STATUS int comment '重命名是否成功 0:成功重命名输出文件, 1:失败重命名输出文件',
   OUTPUT_RENAME        varchar(256) comment '重命名的名称',
   IS_MOVE_OUTPUT       int comment '是否移动目标文件 0:不需要移动,1:需要移动',
   MOVE_OUTPUT_PATH     varchar(256) comment '移动目标文件目录',
   MOVE_OUTPUT_STATUS   int comment '移动目标文件状态 0:成功移动输出文件，1：失败移动输出文件',
   IS_DOINPUTFILETYPE   int comment '传输成功后源文件的处理类型 0:不处理，1:删除源文件，2:移动源文件到目标目录,3:移动源文件并重命名,4:重命名',
   DELETE_INPUT_STATUS  int comment '删除源文件状态 0:成功删除输入文件，1：失败删除输入文件',
   MOVE_INPUT_PATH      varchar(256) comment '移动源文件目录',
   MOVE_INPUT_STATUS    int comment '移动源文件状态 0:成功移动输入文件，1:失败移动输入文件',
   INPUT_RENAME_STATUS  int comment '源文件重命名状态',
   INPUT_RENAME         varchar(256) comment '源重命名名称',
   primary key (ID)
);

alter table MR_FTP_COL_DETAIL_FILELOG comment '文件采集的详细日志表';

/*==============================================================*/
/* Table: MR_FTP_COL_FILE_ERROR_LOG                             */
/*==============================================================*/
create table MR_FTP_COL_FILE_ERROR_LOG
(
   ID                   bigint not null,
   COL_LOG_ID           bigint,
   FILE_ID              varchar(256) comment '与MR_FILE_LIST表.FILE_ID对应',
   CREATE_TIME          datetime comment '产生的时间',
   PROTOCOL             varchar(12) comment '协议',
   IP                   varchar(20) comment '地址',
   PORT                 int comment '端口',
   USERNAME             varchar(32) comment '用户名',
   ROOTPATH             varchar(256) comment '目录',
   TYPE                 int comment '方向类型 0:下载, 1:上传',
   MSG                  varchar(2000) comment '错误消息',
   primary key (ID)
);

alter table MR_FTP_COL_FILE_ERROR_LOG comment '记录初始化资源错误，地址无法访问的错误';

/*==============================================================*/
/* Table: MR_FTP_COL_FILE_LOG                                   */
/*==============================================================*/
create table MR_FTP_COL_FILE_LOG
(
   COL_LOG_ID           bigint not null,
   COL_ID               bigint not null comment '采集任务_id',
   JOB_ID               bigint comment '处理文件的JOBID',
   START_TIME           datetime comment '开始时间',
   END_TIME             datetime comment '结束时间',
   FILE_NUM             int comment '文件数量',
   FILE_TOTALSIZE       bigint comment '文件总大小 单位:kb',
   STATUS               int comment '状态 0:运行中,1:成功(全部成功), 2:失败，3:重新执行',
   QUEUE                varchar(32) comment '所属队列',
   EXEC_CMD             varchar(512) comment '执行命令',
   primary key (COL_LOG_ID)
);

alter table MR_FTP_COL_FILE_LOG comment '采集文件日志表';

/*==============================================================*/
/* Table: MR_FTP_COL_JOB                                        */
/*==============================================================*/
create table MR_FTP_COL_JOB
(
   COL_ID               bigint not null comment '采集策略ID',
   COL_NAME             varchar(32) comment '采集名称',
   COL_ORIGIN           int comment '采集来源 0:下载, 1:上传',
   COL_TYPE             int comment '业务类型ID（META_MR_TYPE）',
   COL_DATATYPE         int comment '数据类型名称 0:文本文件,1:其他文件',
   COL_RUN_DATASOURCE   bigint comment '采集的运行数据源',
   COL_TASK_NUMBER      int comment '任务数',
   COL_TASK_PRIORITY    int comment '优先级 1、最低级、2、低级、3、普通、4、高级、5、最高级',
   COL_SYS_INPUTPATH    varchar(256) comment '任务系统目录',
   COL_STATUS           int comment '状态 0:启用, 1:禁用',
   COL_DESCRIBE         varchar(256) comment '描述',
   PLUGIN_CODE          longblob comment '插件代码',
   primary key (COL_ID)
);

/*==============================================================*/
/* Table: MR_FTP_COL_JOBPARAM                                   */
/*==============================================================*/
create table MR_FTP_COL_JOBPARAM
(
   ID                   bigint not null,
   COL_ID               bigint comment '采集策略ID',
   INPUT_DATASOURCE_ID  bigint comment '输入数据源ID  关联数据处理中的数据源',
   INPUT_FILELST_TYPE   int comment '输入文件列表来源类型
            ftp:0, db:1',
   INPUT_FILELST_DATASOURCE_ID bigint comment '输入文件列表来源数据源ID',
   INPUT_QUERY_SQL      varchar(2000) comment '输入文件列表查询SQL语句   当INPUT_FILELST_TYPE=1时，才有效
            SELECT FILE_PATH FROM XXX; 其中，FILE_PATH：下载的具体文件）
            
            SELECT PROTOL, USERNAME, PWD, ADDRESS FROM XXX; 其中，PROTOL：FTP协议类型, USERNAME：用户名, PWD：密码, ADDRESS：地址（若为文件，则直接传输文件，若为目录，则获取目录下的文件）；这几个的字段名称不能改变',
   INPUT_PATH           varchar(256) comment '输入文件目录 当INPUT_FILELST_TYPE=0时，才有效',
   INPUT_FILE_RULE      varchar(256) comment '输入文件规则  为空，表示文件不过滤',
   INPUT_DOTYPE         int comment '输入文件的处理类型 0:不处理，1:删除源文件，2:移动源文件到目标目录',
   INPUT_MOVE_PATH      varchar(256) comment '输入文件移动目录 INPUT_DOTYPE值为2时，该值有效',
   INPUT_RENAME_RULE    varchar(256) comment '输入文件重命名规则',
   NOTE                 varchar(256) comment '备注',
   OUTPUT_DATASOURCE_ID bigint comment '输出数据源ID',
   OUTPUT_PATH          varchar(256) comment '输出文件目录',
   OUTPUT_RENAME_RULE   varchar(256) comment '输出文件重命名规则',
   OUTPUT_MOVE_PATH     varchar(256) comment '输出文件移动目录',
   INPUT_RENAME         varchar(256) comment '输入文件名',
   OUTPUT_RENAME        varchar(256) comment '输出文件名',
   IS_COMPRESS          int comment '压缩方式,0:不压缩,1:GZ压缩',
   primary key (ID)
);

alter table MR_FTP_COL_JOBPARAM comment '采集任务参数';

/*==============================================================*/
/* Table: MR_FTP_COL_REMOTE_FILE_LOG_MSG                        */
/*==============================================================*/
create table MR_FTP_COL_REMOTE_FILE_LOG_MSG
(
   COL_ID               bigint not null,
   COL_LOG_ID           bigint not null,
   COL_DETAIL_LOG_ID    bigint not null comment ' 采集详细文件的日志ID ',
   INPUT_FILE_LASTMODIFY_DATE varchar(32) not null,
   STATUS               int not null comment ' 0:初始化, 1:成功,2:失败3:重传 ',
   INPUT_FILE_MSG       varchar(256) not null,
   OUTPUT_FILE_MSG      varchar(256) not null,
   RUN_DATE             varchar(20),
   FILTER_COUNT         bigint comment ' 过滤记录数，行数 ',
primary key (COL_ID, COL_LOG_ID, COL_DETAIL_LOG_ID)
);

alter table MR_FTP_COL_REMOTE_FILE_LOG_MSG comment 'FTP文件日志表，存放上传或下载的文件列表，用于是否重传等操作';


/*==============================================================*/
/* Table: MR_FTP_COL_STATISTICS_DATE                            */
/*==============================================================*/
create table MR_FTP_COL_STATISTICS_DATE
(
   COL_ID               bigint comment '与表COL_JOB的COL_ID一致',
   TYPE_ID              bigint not null comment '与表META_MR_TYPE的TYPE_ID一致',
   COL_TYPE             int comment '与COL_JOB表的COL_ORIGIN字段一致',
   RUN_YEAR             varchar(8) comment '运行的年份',
   RUN_YEAR_MONTH       varchar(8) comment '运行的年月份',
   RUN_YEAR_MONTH_DAY   varchar(8) comment '运行的年月日',
   RUN_TIME             int comment '范围：[1-24] ,如1-2点处理的任务，计入2点',
   COL_COUNT            bigint comment '采集的次数之和',
   COL_FILE_COUNT       bigint comment '采集的文件个数之和',
   COL_FILESIZE         bigint comment '采集的文件大小之和',
   COL_FAIL_COUNT       bigint comment '失败次数',
   COL_SUCCESS_COUNT    bigint comment '成功次数',
   COL_AVG_RUN_TIME     bigint comment '成功采集耗时平均数'
);

/*==============================================================*/
/* Table: MR_JOB                                                */
/*==============================================================*/
create table MR_JOB
(
   JOB_ID               bigint not null auto_increment comment 'JOB ID号',
   JOB_NAME             varchar(256) comment 'JOB运行的名称,与mapred.job.name对应',
   JOB_STATUS           int default 0 comment 'JOB状态,取值范围[0-2]:0-表示未运行,1-表示运行完成,2-表示运行失败
             ',
   JOB_DESCRIBE         varchar(512) comment 'JOB的描述信息',
   INPUT_DATA_SOURCE_ID bigint comment '数据源ID(输入)',
   OUTPUT_DATA_SOURCE_ID bigint comment '数据源ID(输出)',
   JOB_RUN_DATASOURCE   bigint comment 'JOB运行的数据源',
   JOB_PRIORITY         int comment 'JOB优先级,取值范围[1-5]:1-VERY_LOW,2-LOW,3-NORMAL,4-HIGH,5-VERY_HIGH; 与mapred.job.priority对应',
   INPUT_DIR            varchar(512) comment 'JOB输入,目录与mapred.input.dir对应',
   MAP_TASKS            int comment 'JOB的Map任务数,与mapred.map.tasks对应',
   REDUCE_TASKS         int comment 'JOB的Reduce任务数,与mapred.reduce.tasks对应',
   JOB_TYPE             bigint comment '业务类型ID（META_MR_TYPE）',
   INPUT_PLUGIN_CODE    longblob comment '输入端的插件代码',
   OUTPUT_PLUGIN_CODE   longblob comment '输出端的插件代码',
   primary key (JOB_ID)
);

alter table MR_JOB comment 'MR任务表';

/*==============================================================*/
/* Table: MR_JOB_MAP_DATALOG                                    */
/*==============================================================*/
create table MR_JOB_MAP_DATALOG
(
   ID                   bigint not null,
   JOBID                varchar(20) comment '具体的任务ID',
   JOB_LOG_ID           bigint comment '关联MR_JOB_RUN_LOG.LOG_ID',
   DATA_TYPE            int comment '处理数据的类型
            0:文件',
   DATA_SOURCE_ID       bigint comment '文件所属的数据源ID,即文件来源的数据源ID',
   FILE_ID              varchar(64) comment '文件id 与MR_FILE_LIST表.FILE_ID对应',
   FILE_PATH            varchar(256) comment '文件路径地址',
   FILE_SIZE            bigint comment '文件大小',
   START_TIME           varchar(20) comment '开始时间',
   END_TIME             varchar(20) comment '结束时间',
   TOTAL_COUNT          bigint comment '总记录条数',
   SUCCESS_COUNT        bigint comment '成功记录数',
   FAIL_COUNT           int comment '错误记录数',
   ERROR_PATH           varchar(256) comment '保存错误记录的文件地址',
   STATUS               int comment '状态 0:未处理, 1:处理中, 2:成功，3:失败, 4:已删除(只记录通过配置删除)',
   primary key (ID)
);

alter table MR_JOB_MAP_DATALOG comment '先按数据源分区，再按文件ID分区';

/*==============================================================*/
/* Table: MR_JOB_MAP_RUN_LOG                                    */
/*==============================================================*/
create table MR_JOB_MAP_RUN_LOG
(
   MAP_TASK_ID          varchar(64) not null,
   LOG_ID               bigint comment '日志ID',
   MAP_INPUT_COUNT      bigint comment 'MAP总输入记录数',
   MAP_OUTPUT_COUNT     bigint comment 'MAP总输入记录数',
   START_DATE           datetime comment '开始时间',
   END_DATE             datetime comment '结束时间',
   RUN_FLAG             int comment '运行结果标识',
   FILTER_COUNT         bigint comment '过滤记录数',
   LOG_MSG              text comment '错误时的报错信息',
   primary key (MAP_TASK_ID)
);

alter table MR_JOB_MAP_RUN_LOG comment 'MR任务MAP运行日志表';

/*==============================================================*/
/* Table: MR_JOB_MAP_RUN_LOG_MSG                                */
/*==============================================================*/
create table MR_JOB_MAP_RUN_LOG_MSG
(
   LOG_ID               bigint not null comment '日志ID',
   MAP_TASK_ID          varchar(64) not null comment '与MR_JOB_MAP_RUN_LOG的MAP_TASK_ID关联',
   LOG_TYPE             bigint comment '日志类型,取值范围[1-4]:1-debug,2-info,3-warn,4-error',
   LOG_DATE             datetime comment '生成日志时间',
   LOG_MSG              text comment '日志详情   错误时的报错信息',
   primary key (LOG_ID)
);

alter table MR_JOB_MAP_RUN_LOG_MSG comment 'MR任务MAP运行日志详细表';

/*==============================================================*/
/* Table: MR_JOB_PARAM                                          */
/*==============================================================*/
create table MR_JOB_PARAM
(
   JOB_ID               bigint not null comment 'JOB 的ID号',
   PARAM_NAME           varchar(128) not null comment 'JOB参数名称',
   PARAM_VALUE          text comment 'JOB参数值',
   PARAM_DESC           varchar(2000) comment '参数描述',
   PARAM_VAL_HTML       longblob comment '部分特殊规则的参数值，是通过快捷方式录入，此字段存的原始HTML代码',
   primary key (JOB_ID, PARAM_NAME)
);

alter table MR_JOB_PARAM comment 'MR运行JOB参数表';

/*==============================================================*/
/* Table: MR_JOB_REDUCE_RUN_LOG                                 */
/*==============================================================*/
create table MR_JOB_REDUCE_RUN_LOG
(
   REDUCE_TASK_ID       varchar(64) not null comment 'Reduce任务ID',
   LOG_ID               bigint comment '日志id与MR_JOB_RUN_LOG中LOG_ID关联',
   REDUCE_INPUT_COUNT   bigint comment 'REDUCE输入记录数',
   REDUCE_OUTPUT_COUNT  bigint comment 'REDUCE输出记录数',
   START_DATE           datetime comment '开始时间',
   END_DATE             datetime comment '结束时间',
   RUN_FLAG             int comment '结果标识符,取值范围[1-2]:1-成功,2-失败',
   LOG_MSG              text comment '日志信息 错误时的报错信息',
   FILTER_COUNT         bigint comment 'Reduce过滤掉的记录数',
   primary key (REDUCE_TASK_ID)
);

alter table MR_JOB_REDUCE_RUN_LOG comment 'MR任务REDUCE运行日志表';

/*==============================================================*/
/* Table: MR_JOB_REDUCE_RUN_LOG_MSG                             */
/*==============================================================*/
create table MR_JOB_REDUCE_RUN_LOG_MSG
(
   LOG_ID               bigint not null comment '日志ID',
   REDUCE_TASK_ID       varchar(64) not null comment 'Reduce任务ID,与MR_JOB_REDUCE_RUN_LOG的REDUCE_TASK_ID关联',
   LOG_TYPE             bigint comment '日志类型,取值范围[1-4]:1-debug,2-info,3-warn,4-error',
   LOG_DATE             datetime comment '产生日志时间',
   LOG_MSG              text comment '日志信息 错误时的报错信息',
   primary key (LOG_ID)
);

alter table MR_JOB_REDUCE_RUN_LOG_MSG comment 'MR任务REDUCE运行日志详细表';

/*==============================================================*/
/* Table: MR_JOB_RUN_LOG                                        */
/*==============================================================*/
create table MR_JOB_RUN_LOG
(
   LOG_ID               bigint not null comment '日志ID',
   JOB_ID               bigint,
   MONTH_NO             int comment '月份',
   DATA_NO              varchar(20) comment '数据时间,时间参数',
   START_DATE           datetime comment '开始时间',
   END_DATE             datetime comment '结束时间',
   RUN_FLAG             int comment '运行状态,取值范围[1-2]:1-成功,2-失败',
   ROW_RECORD           bigint comment '总记录数',
   ALL_FILE_SIZE        bigint comment '总文件大小',
   EXEC_CMD             varchar(256) comment '带参数运行命令',
   MAP_INPUT_COUNT      bigint comment 'MAP总输入记录数',
   REDUCE_INPUT_COUNT   bigint comment 'REDUCE总输出记录数',
   MAP_OUTPUT_COUNT     bigint comment 'MAP总输出记录数',
   REDUCE_OUTPUT_COUNT  bigint comment 'REDUCE总输入记录数',
   LOG_MSG              text comment '错误时的报错信息',
   INPUT_FILTER_COUNT   bigint comment 'map过滤掉的记录数',
   OUTPUT_FILTER_COUNT  bigint comment 'reduce过滤掉的记录数',
   QUEUE                varchar(32) comment '所属队列',
   primary key (LOG_ID)
);

alter table MR_JOB_RUN_LOG comment 'MR任务运行日志表';

/*==============================================================*/
/* Table: MR_JOB_RUN_LOG_MSG                                    */
/*==============================================================*/
create table MR_JOB_RUN_LOG_MSG
(
   LOG_TIME             datetime comment '日志时间',
   LOG_ID               bigint comment '与MR_JOB_RUN_LOG中LOG_ID关联',
   LOG_TYPE             int comment '1:debug,2:info,3:warn:4:error,5:exeception',
   LOG_INFO             text comment '日志详情'
);

alter table MR_JOB_RUN_LOG_MSG comment 'MR任务运行日志详情';

/*==============================================================*/
/* Table: MR_SOURCE_PARAM                                       */
/*==============================================================*/
create table MR_SOURCE_PARAM
(
   SOURCE_TYPE_ID       bigint not null comment '源类型ID号,与MR_SOURCE_TYPE的SOURCE_TYPE_ID关联',
   INPUT_OR_OUTPUT      int comment '输入输出标识符,取值范围[1-2]:1-输入,2-输出',
   PARAM_NAME           varchar(128) not null comment '源参数名称',
   IS_MUST              int comment '是否必填,取值范围[0-1]:0-非必填,1-必填',
   DEFAULT_VALUE        varchar(512) comment '参数默认值',
   ORDER_ID             int comment '序号',
   PARAM_DESC           varchar(2000) comment '参数描述',
   primary key (SOURCE_TYPE_ID, PARAM_NAME)
);

alter table MR_SOURCE_PARAM comment 'MR数据源参数表';

/*==============================================================*/
/* Table: MR_SOURCE_TYPE                                        */
/*==============================================================*/
create table MR_SOURCE_TYPE
(
   SOURCE_TYPE_ID       bigint not null auto_increment comment '源类型ID号',
   SOURCE_NAME          varchar(256) comment '源类型名称',
   SOURCE_TYPE          varchar(32) comment '支持的类型如下：
            FILETEXT:文件(txt格式)            
            FILESEQUENCE:文件(sequence格式)   
            FILERCFILE:文件(RC格式)           
            HIVETEXT:Hive(txt格式)            
            HIVESEQUENCE:Hive(sequence格式)   
            HIVERCFILE:Hive(RC格式)           
            HBASE:HBase    
            RDBNORM: 常规关系型数据库
            MYSQLROW:数据库(MYSQL-行)         
            MYSQLDATA:数据库(MYSQL-数据类型)  
            ORACLEROW:数据库(ORACLE-行)       
            ORACLEDATA:数据库(ORACLE-数据类型)
            ORACLEPART:数据库(ORACLE-分区)
            FTPDATA:
            VERTICA: hp vertica 数据库
            POSTGRESQL
            NHBASE 
            NHFILE Hbase HFile
            PARTITION_SPLIT
            
            ',
   SOURCE_CATE          int comment '所属分类,0:数据处理,1：采集数据, 2:运行系统数据源',
   SOURCE_DB_TYPE       int comment '源类型对应的所属默认资源(例如：jdbc数据库、hbase数据库)类型
            ',
   primary key (SOURCE_TYPE_ID)
);

alter table MR_SOURCE_TYPE comment 'MR数据源类型';

/*==============================================================*/
/* Table: MR_STATISTICS_DATE                                    */
/*==============================================================*/
create table MR_STATISTICS_DATE
(
   JOB_ID               bigint comment '任务ID 与表MR_JOB的COL_ID一致',
   TYPE_ID              bigint comment '业务类型  与表META_MR_TYPE的TYPE_ID一致',
   RUN_YEAR             varchar(8) comment '运行的年份',
   RUN_YEAR_MONTH       varchar(8) comment '运行的年月份',
   RUN_YEAR_MONTH_DAY   varchar(8) comment '运行的年月日',
   JOB_FILESIZE         bigint comment '处理的文件大小之和',
   MAP_INPUT_COUNT      bigint comment 'MAP处理的输入条数之和',
   MAP_OUTPUT_COUNT     bigint comment 'MAP处理的输出条数之和',
   REDUCE_INPUT_COUNT   bigint comment 'REDUCE处理的输入条数之和',
   REDUCE_OUTPUT_COUNT  bigint comment 'REDUCE处理的输出条数之和',
   MAP_FILTER_COUNT     bigint comment 'Map过滤记录数',
   REDUCE_FILTER_COUNT  bigint comment 'Reduce过滤记录数',
   RUN_TIME             bigint comment '范围：[1-24] ,如1-2点处理的任务，计入2点',
   JOB_FAIL_COUNT       bigint comment '失败次数',
   JOB_SUCCESS_COUNT    bigint comment '成功次数',
   JOB_AVG_RUN_TIME     bigint comment '成功任务耗时平均数',
   JOB_COUNT            bigint comment '执行次数'
);

/*==============================================================*/
/* Table: MR_SYSTEM_PARAM                                       */
/*==============================================================*/
create table MR_SYSTEM_PARAM
(
   PARAM_NAME           varchar(128) not null comment '系统参数名称',
   DEFAULT_VALUE        varchar(256) comment '系统参数默认值',
   PARAM_DESC           varchar(2000) comment '系统参数描述',
   IS_MUST              int not null comment '是否必填,取值范围[0-1]:0-非必填,1-必填',
   primary key (PARAM_NAME, IS_MUST)
);

alter table MR_SYSTEM_PARAM comment 'MR源类型参数表';

