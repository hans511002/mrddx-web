/******************************************************
 *Copyrights @ 2011，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        commonFormater.js
 *Description：
 *        此JS用于公共的JS常量定义。
 *Dependent：
 *        Dwr 的JS文件，如util.js和engine.js 以及dhmtlx.js
 *Author:
 *        张伟
 *Finished：
 *       2011-10-16
 *Modified By：
 *
 * Modified Date:
 *
 * Modified Reasons:

 ********************************************************/
/**
 * 常量定义均以global开头，以.号间隔，第二个变量表示是常量的那一块
 * 如global.css.gridTopDiv
 */


/**
 *JS 全局CSS 常量字符串设置
 */
global.css={};

/**
 * grid样式设置。
 */
//grid 最外层DIV样式。
global.css.gridTopDiv="gridbox gridbox_"+getSkin();
//表头DIV CSS样式
global.css.gridHeadDiv="xhdr";
//表头Table 节点 CSS样式
global.css.gridHeadTable="hdr";
//表内容DIV CSS
global.css.gridContentDiv="objbox";
//表内容Table 节点 CSS样式
global.css.gridContentTable="obj";

/**
 * form样式设置。
 */
//form 基本样式
global.css.formContentDiv="dhxlist_obj_"+getSkin();
//form 元素外层DIV样式
global.css.itemDivBase="dhxlist_base";
