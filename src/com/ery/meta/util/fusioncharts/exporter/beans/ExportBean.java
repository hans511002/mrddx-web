// Decompiled by Jad v1.5.7g. Copyright 2000 Pavel Kouznetsov.
// Jad home page: http://www.geocities.com/SiliconValley/Bridge/8617/jad.html
// Decompiler options: packimports(3) fieldsfirst ansi 
// Source File Name:   ExportBean.java

package com.ery.meta.util.fusioncharts.exporter.beans;

import java.util.*;

// Referenced classes of package com.fusioncharts.exporter.beans:
//            ChartMetadata

public class ExportBean
{

    private ChartMetadata metadata;
    private String stream;
    @SuppressWarnings("rawtypes")
	private HashMap exportParameters;

    @SuppressWarnings({ "rawtypes", "unchecked" })
	public ExportBean()
    {
        exportParameters = null;
        exportParameters = new HashMap();
        exportParameters.put("exportfilename", "FusionCharts");
        exportParameters.put("exportaction", "download");
        exportParameters.put("exportargetwindow", "_self");
        exportParameters.put("exportformat", "PDF");
    }

    public ChartMetadata getMetadata()
    {
        return metadata;
    }

    public void setMetadata(ChartMetadata metadata)
    {
        this.metadata = metadata;
    }

    public String getStream()
    {
        return stream;
    }

    public void setStream(String stream)
    {
        this.stream = stream;
    }
    @SuppressWarnings({ "rawtypes", "unchecked" })
    public HashMap getExportParameters()
    {
        return new HashMap(exportParameters);
    }

    public Object getExportParameterValue(String key)
    {
        return exportParameters.get(key);
    }
    @SuppressWarnings({ "rawtypes" })
    public void setExportParameters(HashMap exportParameters)
    {
        this.exportParameters = exportParameters;
    }
    @SuppressWarnings({ "unchecked" })
    public void addExportParameter(String parameterName, Object value)
    {
        exportParameters.put(parameterName.toLowerCase(), value);
    }

    @SuppressWarnings({ "rawtypes", "unchecked" })
    public void addExportParametersFromMap(HashMap moreParameters)
    {
        exportParameters.putAll(moreParameters);
    }

    @SuppressWarnings({ "rawtypes" })
    public String getParametersAndMetadataAsQueryString()
    {
        String queryParams = "";
        queryParams = queryParams + "?width=" + metadata.getWidth();
        queryParams = queryParams + "&height=" + metadata.getHeight();
        queryParams = queryParams + "&bgcolor=" + metadata.getBgColor();
        for(Iterator iter = exportParameters.keySet().iterator(); iter.hasNext();)
        {
            String key = (String)iter.next();
            String value = (String)exportParameters.get(key);
            queryParams = queryParams + "&" + key + "=" + value;
        }

        return queryParams;
    }

    public String getMetadataAsQueryString(String filePath, boolean isError, boolean isHTML)
    {
        String queryParams = "";
        if(isError)
        {
            queryParams = queryParams + (isHTML ? "<BR>" : "&") + "width=0";
            queryParams = queryParams + (isHTML ? "<BR>" : "&") + "height=0";
        } else
        {
            queryParams = queryParams + (isHTML ? "<BR>" : "&") + "width=" + metadata.getWidth();
            queryParams = queryParams + (isHTML ? "<BR>" : "&") + "height=" + metadata.getHeight();
        }
        queryParams = queryParams + (isHTML ? "<BR>" : "&") + "DOMId=" + metadata.getDOMId();
        if(filePath != null)
            queryParams = queryParams + (isHTML ? "<BR>" : "&") + "fileName=" + filePath;
        return queryParams;
    }
}
